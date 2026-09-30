// Issuer side of issuance: holder's IssuanceRequest (commitment only) + the facts the issuer
// checked about the person -> signed CredentialDocument v2.
//
// The issuer path never creates or accepts a holder secret. parseIssuanceRequest refuses any
// field other than { schema, holderCommit }, so a request that accidentally carries the secret
// is rejected instead of silently ignored.
import type { IssuerKeyPair } from '@stateproof/contract';
import {
  getSchema,
  holderCommitFromRequest,
  issueCredential,
  publicKeyFromJson,
  subjectIdFor,
  verifyCredentialDocument,
  type CredentialDocument,
  type CredentialSubject,
  type IssuanceRequest,
} from '@stateproof/core';
import type { IssuerEntry } from '../registry.js';

const REQUEST_KEYS = ['schema', 'holderCommit'] as const;
const HOLDER_COMMIT = /^0x[0-9a-fA-F]{1,64}$/;

export const parseIssuanceRequest = (raw: unknown): IssuanceRequest => {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Issuance request must be a JSON object');
  const extra = Object.keys(raw).filter((k) => !(REQUEST_KEYS as readonly string[]).includes(k));
  if (extra.length > 0) {
    throw new Error(`Issuance request has unexpected field(s) ${extra.join(', ')}. It must carry only schema and holderCommit; never send the holder secret to an issuer.`);
  }
  const { schema, holderCommit } = raw as Record<string, unknown>;
  if (typeof schema !== 'string') throw new Error('Issuance request: schema must be a string');
  getSchema(schema);
  if (typeof holderCommit !== 'string' || !HOLDER_COMMIT.test(holderCommit)) {
    throw new Error('Issuance request: holderCommit must be a 0x-prefixed hex field element');
  }
  return { schema, holderCommit };
};

// What the issuer knows about the person from the documents it checked.
export interface SubjectInput {
  // Legal name and birth date, used only to compute subjectId (never stored in the credential).
  readonly name: string;
  readonly birthDate: string;
  readonly claims: CredentialSubject;
}

export const parseSubjectInput = (raw: unknown): SubjectInput => {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Subject input must be a JSON object');
  const { name, birthDate, claims } = raw as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim() === '') throw new Error('Subject input: name is required');
  if (typeof birthDate !== 'string') throw new Error('Subject input: birthDate (YYYY-MM-DD) is required');
  if (claims === null || typeof claims !== 'object' || Array.isArray(claims)) throw new Error('Subject input: claims object is required');
  return { name, birthDate, claims: claims as CredentialSubject };
};

export interface IssueOptions {
  readonly issuer: IssuerEntry;
  readonly keyPair: IssuerKeyPair;
  readonly request: IssuanceRequest;
  readonly subject: SubjectInput;
  readonly issuedAt: string;
  readonly expiresAt: string;
  // Defaults to the registry entry's current epoch.
  readonly epoch?: number;
}

export const issueFromRequest = async (options: IssueOptions): Promise<CredentialDocument> => {
  const { issuer, keyPair, request, subject } = options;
  if (request.schema !== issuer.schema) {
    throw new Error(`${issuer.id} is registered for ${issuer.schema}, but the request asks for ${request.schema}`);
  }
  if (issuer.publicKey === null) throw new Error(`${issuer.id} has no public key in config/issuers.json; run keygen`);
  const expected = publicKeyFromJson(issuer.publicKey);
  if (keyPair.publicKey.x !== expected.x || keyPair.publicKey.y !== expected.y) {
    throw new Error(`${issuer.id}: the signing secret does not match the public key in config/issuers.json`);
  }
  if (Date.parse(options.issuedAt) >= Date.parse(options.expiresAt)) throw new Error('issuedAt must be before expiresAt');
  const doc = issueCredential(
    {
      schema: request.schema,
      issuer: { id: issuer.id, name: issuer.name, epoch: options.epoch ?? issuer.epoch },
      issuedAt: options.issuedAt,
      expiresAt: options.expiresAt,
      credentialSubject: subject.claims,
      holderCommit: holderCommitFromRequest(request),
      subjectId: await subjectIdFor(subject.name, subject.birthDate),
    },
    keyPair,
  );
  if (!verifyCredentialDocument(doc, keyPair.publicKey)) throw new Error(`${issuer.id}: produced a signature that does not verify`);
  return doc;
};
