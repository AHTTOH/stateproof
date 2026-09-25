// Test data builders. All people and values are fictional.
import {
  Op,
  pureCircuits,
  type Condition,
  type Credential,
  type Policy,
} from '../src/managed/stateproof/contract/index.js';
import { generateIssuerKeyPair, signCredential, type IssuerKeyPair } from '../src/signing.js';
import type { HolderProofInputs } from '../src/witnesses.js';

export const CLAIM_SLOTS = 8;
export const MAX_CONDITIONS = 4;
export const SET_SIZE = 4;

export const DAY = 86_400n;
export const NOW = 1_790_000_000n; // 2026-09-21T13:33:20Z

export const bytes32 = (label: string): Uint8Array => {
  const out = new Uint8Array(32);
  out.set(new TextEncoder().encode(label).slice(0, 32));
  return out;
};

export const randomBytes32 = (): Uint8Array => {
  const out = new Uint8Array(32);
  crypto.getRandomValues(out);
  return out;
};

export const EMPLOYMENT_SCHEMA = bytes32('schema:employment:v1');
export const ACME_ISSUER = bytes32('issuer:acme-hr');

// Slot layout of the employment test credential.
export const SLOT = { status: 0n, jobCategory: 1n, startDay: 2n, months: 3n } as const;
export const STATUS_ACTIVE = 1n;

export const claims = (values: readonly bigint[]): bigint[] => {
  if (values.length > CLAIM_SLOTS) throw new Error('too many claims');
  return [...values, ...Array<bigint>(CLAIM_SLOTS - values.length).fill(0n)];
};

export const ignore = (): Condition => ({
  claimIndex: 0n,
  op: Op.ignore,
  value: 0n,
  value2: 0n,
  set: Array<bigint>(SET_SIZE).fill(0n),
});

export const cond = (claimIndex: bigint, op: Op, value: bigint, value2 = 0n, set: bigint[] = []): Condition => ({
  claimIndex,
  op,
  value,
  value2,
  set: set.length === 0 ? Array<bigint>(SET_SIZE).fill(0n) : [...set, ...Array<bigint>(SET_SIZE - set.length).fill(set[0])],
});

export const policy = (conditions: Condition[], revealSlot: bigint | null = null): Policy => ({
  schemaId: EMPLOYMENT_SCHEMA,
  issuerId: ACME_ISSUER,
  conditions: [...conditions, ...Array.from({ length: MAX_CONDITIONS - conditions.length }, ignore)],
  revealSlot: revealSlot === null ? { is_some: false, value: 0n } : { is_some: true, value: revealSlot },
});

export interface HolderFixture {
  readonly issuer: IssuerKeyPair;
  readonly holderSecret: Uint8Array;
  readonly credential: Credential;
  readonly inputs: HolderProofInputs;
}

export const employmentCredential = (overrides: Partial<Credential> = {}, issuer = generateIssuerKeyPair()): HolderFixture => {
  const holderSecret = randomBytes32();
  const credential: Credential = {
    schemaId: EMPLOYMENT_SCHEMA,
    issuerId: ACME_ISSUER,
    holderCommit: pureCircuits.holderCommitment(holderSecret),
    claims: claims([STATUS_ACTIVE, 7n, 20_000n, 26n]),
    issuedAt: NOW - 30n * DAY,
    expiresAt: NOW + 365n * DAY,
    salt: randomBytes32(),
    ...overrides,
  };
  const signature = signCredential(credential, issuer);
  return { issuer, holderSecret, credential, inputs: { credential, signature, holderSecret } };
};
