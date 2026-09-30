// Issuer path: commitment-only input, subject binding, signature, demo persona generation.
import { describe, expect, it } from 'vitest';
import { generateIssuerKeyPair, type IssuerKeyPair } from '@stateproof/contract';
import {
  SCHEMAS,
  createHolderSecret,
  createIssuanceRequest,
  holderCommitOf,
  hexToBigint,
  publicKeyToJson,
  subjectIdFor,
  toContractCredential,
  toHex,
  verifyCredentialDocument,
} from '@stateproof/core';
import { validateRegistry, type IssuerEntry, type IssuerRegistry } from '../src/registry.js';
import { issueFromRequest, parseIssuanceRequest, parseSubjectInput } from '../src/issue/issue.js';
import { buildPersonas, loadPersonaSpec } from '../src/issue/personas.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const entry = (over: Partial<IssuerEntry>, keyPair: IssuerKeyPair): IssuerEntry => ({
  id: 'issuer:test-hr',
  name: 'Test HR',
  i18n: { ko: { name: '테스트 인사팀' } },
  schema: 'career',
  slot: 0,
  epoch: 0,
  secretEnv: 'TEST_SECRET',
  publicKey: publicKeyToJson(keyPair.publicKey),
  ...over,
});

const CAREER = { employmentStatus: 'Active', jobCategory: 'Engineering', careerMonths: 48, annualSalary: 6200, employmentType: 'Permanent' };

describe('issuance request parsing', () => {
  it('accepts exactly { schema, holderCommit }', () => {
    const req = createIssuanceRequest('career', createHolderSecret());
    expect(parseIssuanceRequest(JSON.parse(JSON.stringify(req)))).toEqual(req);
  });

  it('refuses a request that carries a holder secret or any other extra field', () => {
    const secret = createHolderSecret();
    const req = { ...createIssuanceRequest('career', secret), holderSecret: toHex(secret) };
    expect(() => parseIssuanceRequest(req)).toThrow(/unexpected field\(s\) holderSecret.*never send the holder secret/);
  });

  it('refuses unknown schemas and malformed commitments', () => {
    expect(() => parseIssuanceRequest({ schema: 'passport', holderCommit: '0x1' })).toThrow(/Unknown credential schema/);
    expect(() => parseIssuanceRequest({ schema: 'career', holderCommit: 'abc' })).toThrow(/holderCommit/);
  });

  it('requires name, birth date and claims in the subject input', () => {
    expect(() => parseSubjectInput({ birthDate: '1990-01-01', claims: {} })).toThrow(/name/);
    expect(() => parseSubjectInput({ name: 'a', claims: {} })).toThrow(/birthDate/);
    expect(() => parseSubjectInput({ name: 'a', birthDate: '1990-01-01' })).toThrow(/claims/);
  });
});

describe('issueFromRequest', () => {
  it('binds the credential to the holder commitment and the subject, and signs it', async () => {
    const keyPair = generateIssuerKeyPair();
    const secret = createHolderSecret();
    const doc = await issueFromRequest({
      issuer: entry({}, keyPair),
      keyPair,
      request: createIssuanceRequest('career', secret),
      subject: { name: '박 민지', birthDate: '1993-05-14', claims: CAREER },
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
    });
    expect(verifyCredentialDocument(doc, keyPair.publicKey)).toBe(true);
    expect(hexToBigint(doc.binding.holderCommit)).toBe(holderCommitOf(secret));
    expect(hexToBigint(doc.binding.subjectId)).toBe(await subjectIdFor('박민지', '1993-05-14'));
    expect(toContractCredential(doc).epoch).toBe(0n);
    // Nothing the issuer outputs contains the holder secret.
    expect(JSON.stringify(doc)).not.toContain(toHex(secret));
  });

  it('issues in the requested epoch', async () => {
    const keyPair = generateIssuerKeyPair();
    const doc = await issueFromRequest({
      issuer: entry({ epoch: 3 }, keyPair),
      keyPair,
      request: createIssuanceRequest('career', createHolderSecret()),
      subject: { name: 'a', birthDate: '1990-01-01', claims: CAREER },
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
    });
    expect(doc.issuer.epoch).toBe(3);
  });

  it('refuses a request for another schema, a key that does not match the registry, and bad validity', async () => {
    const keyPair = generateIssuerKeyPair();
    const base = {
      issuer: entry({}, keyPair),
      keyPair,
      request: createIssuanceRequest('career', createHolderSecret()),
      subject: { name: 'a', birthDate: '1990-01-01', claims: CAREER },
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
    };
    await expect(issueFromRequest({ ...base, request: createIssuanceRequest('youth-work', createHolderSecret()) })).rejects.toThrow(/registered for career/);
    await expect(issueFromRequest({ ...base, keyPair: generateIssuerKeyPair() })).rejects.toThrow(/does not match the public key/);
    await expect(issueFromRequest({ ...base, expiresAt: base.issuedAt })).rejects.toThrow(/before expiresAt/);
    await expect(issueFromRequest({ ...base, subject: { ...base.subject, claims: { ...CAREER, annualSalary: 'lots' } } })).rejects.toThrow(/not an integer/);
  });
});

describe('issuer registry', () => {
  const REPO_ISSUERS = fileURLToPath(new URL('../../../config/issuers.json', import.meta.url));

  it('config/issuers.json is a valid v2 registry covering both schemas', () => {
    const registry = validateRegistry(JSON.parse(readFileSync(REPO_ISSUERS, 'utf8')) as IssuerRegistry);
    expect(new Set(registry.issuers.map((i) => i.schema))).toEqual(new Set(SCHEMAS.map((s) => s.id)));
  });

  it('refuses duplicate slots and ids', () => {
    const k = generateIssuerKeyPair();
    const reg = (issuers: IssuerEntry[]): IssuerRegistry => ({ $comment: '', version: 2, issuers });
    expect(() => validateRegistry(reg([entry({}, k), entry({ id: 'issuer:b', secretEnv: 'B' }, k)]))).toThrow(/slot 0 used twice/);
    expect(() => validateRegistry(reg([entry({}, k), entry({ slot: 1, secretEnv: 'B' }, k)]))).toThrow(/used twice/);
    expect(() => validateRegistry(reg([entry({ slot: 64 }, k)]))).toThrow(/outside/);
  });
});

describe('demo personas', () => {
  it('builds signed, demo-only bundles for every persona with ephemeral keys', async () => {
    const spec = await loadPersonaSpec();
    const keys = new Map<string, IssuerKeyPair>();
    const ids = [...new Set(spec.personas.flatMap((p) => p.credentials.map((c) => c.issuer)))];
    const issuers = ids.map((id, slot) => {
      const k = generateIssuerKeyPair();
      keys.set(id, k);
      const schema = spec.personas.flatMap((p) => p.credentials).find((c) => c.issuer === id)!.schema;
      return entry({ id, slot, schema, secretEnv: `S${slot}` }, k);
    });
    const file = await buildPersonas({ $comment: '', version: 2, issuers }, spec, (e) => keys.get(e.id)!);
    expect(file.demoOnly).toBe(true);
    expect(file.personas.map((p) => p.id)).toEqual(spec.personas.map((p) => p.id));
    for (const persona of file.personas) {
      const commit = holderCommitOf(Uint8Array.from(Buffer.from(persona.holderSecret, 'hex')));
      for (const { issuanceRequest, credential } of persona.credentials) {
        expect(Object.keys(issuanceRequest).sort()).toEqual(['holderCommit', 'schema']);
        expect(hexToBigint(credential.binding.holderCommit)).toBe(commit);
        expect(hexToBigint(credential.binding.subjectId)).toBe(await subjectIdFor(persona.name, persona.birthDate));
        expect(verifyCredentialDocument(credential, keys.get(credential.issuer.id)!.publicKey)).toBe(true);
      }
    }
    expect(new Set(file.personas.flatMap((p) => p.credentials.map((c) => c.credential.schema)))).toEqual(new Set(['career', 'youth-work']));
  });
});
