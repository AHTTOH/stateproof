// Credential document: the JSON a holder stores and imports. W3C VC shaped, with
// the fields the circuit needs carried explicitly so nothing is re-derived loosely.
import type { Credential, Signature } from '@stateproof/contract';
import { CREDENTIAL_FORMAT, SIGNATURE_TYPE } from '../constants.js';
import { getSchema, schemaByIdBytes, schemaIdBytes } from '../schemas/index.js';
import { bigintToHex, bytes32ToLabel, fromHex32, hexToBigint, labelToBytes32, toHex } from './bytes.js';
import { decodeSubject, encodeSubject, type CredentialSubject } from './claims.js';

export interface CredentialDocument {
  readonly format: typeof CREDENTIAL_FORMAT;
  readonly type: readonly string[];
  readonly schema: string;
  readonly issuer: { readonly id: string; readonly name: string };
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly credentialSubject: CredentialSubject;
  readonly binding: { readonly holderCommit: string; readonly salt: string };
  readonly proof: {
    readonly type: typeof SIGNATURE_TYPE;
    readonly r: { readonly x: string; readonly y: string };
    readonly s: string;
  };
}

const toUnixSeconds = (iso: string): bigint => {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new Error(`Invalid timestamp ${iso}`);
  return BigInt(Math.floor(ms / 1000));
};

export const toContractCredential = (doc: CredentialDocument): Credential => {
  if (doc.format !== CREDENTIAL_FORMAT) throw new Error(`Unsupported credential format ${doc.format}`);
  const schema = getSchema(doc.schema);
  return {
    schemaId: schemaIdBytes(schema),
    issuerId: labelToBytes32(doc.issuer.id),
    holderCommit: hexToBigint(doc.binding.holderCommit),
    claims: encodeSubject(schema, doc.credentialSubject),
    issuedAt: toUnixSeconds(doc.issuedAt),
    expiresAt: toUnixSeconds(doc.expiresAt),
    salt: fromHex32(doc.binding.salt),
  };
};

export const toContractSignature = (doc: CredentialDocument): Signature => {
  if (doc.proof.type !== SIGNATURE_TYPE) throw new Error(`Unsupported proof type ${doc.proof.type}`);
  return {
    r: { x: hexToBigint(doc.proof.r.x), y: hexToBigint(doc.proof.r.y) },
    s: hexToBigint(doc.proof.s),
  };
};

export interface UnsignedCredentialInput {
  readonly schema: string;
  readonly issuer: { readonly id: string; readonly name: string };
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly credentialSubject: CredentialSubject;
  readonly holderCommit: bigint;
  readonly salt: Uint8Array;
}

export const unsignedContractCredential = (input: UnsignedCredentialInput): Credential => {
  const schema = getSchema(input.schema);
  return {
    schemaId: schemaIdBytes(schema),
    issuerId: labelToBytes32(input.issuer.id),
    holderCommit: input.holderCommit,
    claims: encodeSubject(schema, input.credentialSubject),
    issuedAt: toUnixSeconds(input.issuedAt),
    expiresAt: toUnixSeconds(input.expiresAt),
    salt: input.salt,
  };
};

export const buildCredentialDocument = (input: UnsignedCredentialInput, signature: Signature): CredentialDocument => {
  const schema = getSchema(input.schema);
  return {
    format: CREDENTIAL_FORMAT,
    type: ['VerifiableCredential', schema.title.replace(/\s+/g, '')],
    schema: schema.id,
    issuer: input.issuer,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    credentialSubject: input.credentialSubject,
    binding: { holderCommit: bigintToHex(input.holderCommit), salt: toHex(input.salt) },
    proof: {
      type: SIGNATURE_TYPE,
      r: { x: bigintToHex(signature.r.x), y: bigintToHex(signature.r.y) },
      s: bigintToHex(signature.s),
    },
  };
};

export interface CredentialSummary {
  readonly schema: string;
  readonly issuer: string;
  readonly claims: Record<string, string>;
}

export const describeCredential = (credential: Credential): CredentialSummary => {
  const schema = schemaByIdBytes(credential.schemaId);
  return { schema: schema.id, issuer: bytes32ToLabel(credential.issuerId), claims: decodeSubject(schema, credential.claims) };
};
