// Test data builders. All people and values are fictional.
import {
  Op,
  pureCircuits,
  type Condition,
  type Credential,
  type Policy,
  type SchemaRule,
} from '../src/managed/stateproof/contract/index.js';
import { issuerWitnessFor } from '../src/api.js';
import { generateIssuerKeyPair, signCredential, type IssuerKeyPair } from '../src/signing.js';
import { NO_NONCE, type HolderProofInputs } from '../src/witnesses.js';
import { StateProofSimulator } from './simulator.js';

export const CLAIM_SLOTS = 8;
export const MAX_CONDITIONS = 4;
export const SET_SIZE = 4;
export const ISSUER_TREE_DEPTH = 6;

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

export const CAREER_SCHEMA = bytes32('schema:career:v2');
export const ACME_ISSUER = bytes32('issuer:acme-hr');
export const OTHER_ISSUER = bytes32('issuer:other-hr');

// Slot layout of the career test credential. Salary is in 10,000 KRW (만원).
export const SLOT = { status: 0n, jobCategory: 1n, months: 2n, salary: 3n } as const;
export const STATUS_ACTIVE = 1n;
export const SALARY_MIN_WIDTH = 500n;

const plain = { sensitive: false, minWidth: 0n };
export const careerRule = (): SchemaRule => ({
  slots: [plain, plain, plain, { sensitive: true, minWidth: SALARY_MIN_WIDTH }, plain, plain, plain, plain],
});

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
  schemaId: CAREER_SCHEMA,
  conditions: [...conditions, ...Array.from({ length: MAX_CONDITIONS - conditions.length }, ignore)],
  revealSlot: revealSlot === null ? { is_some: false, value: 0n } : { is_some: true, value: revealSlot },
});

export const subjectDigest = (label: string): Uint8Array => bytes32(`subject:${label}`);

export interface World {
  readonly sim: StateProofSimulator;
  readonly adminSecret: Uint8Array;
  readonly issuer: IssuerKeyPair;
  readonly issuerId: Uint8Array;
}

export const world = (options: { issuerSlot?: bigint } = {}): World => {
  const adminSecret = randomBytes32();
  const sim = new StateProofSimulator(adminSecret, NOW);
  const issuer = generateIssuerKeyPair();
  sim.asAdmin(adminSecret).registerSchema(CAREER_SCHEMA, careerRule());
  sim.asAdmin(adminSecret).registerIssuer(ACME_ISSUER, CAREER_SCHEMA, issuer.publicKey, options.issuerSlot ?? 3n);
  return { sim, adminSecret, issuer, issuerId: ACME_ISSUER };
};

export interface HolderFixture {
  readonly holderSecret: Uint8Array;
  readonly credential: Credential;
  readonly inputs: HolderProofInputs;
}

// Default holder: active engineer, 26 months, salary 5,400만원.
export const DEFAULT_CLAIMS = claims([STATUS_ACTIVE, 7n, 26n, 5_400n]);

export const holderCredential = (
  w: World,
  overrides: Partial<Credential> = {},
  options: { signer?: IssuerKeyPair; subject?: string; nonce?: Uint8Array } = {},
): HolderFixture => {
  const holderSecret = randomBytes32();
  const credential: Credential = {
    schemaId: CAREER_SCHEMA,
    issuerId: w.issuerId,
    epoch: 0n,
    holderCommit: pureCircuits.holderCommitment(holderSecret),
    subjectId: pureCircuits.subjectIdOf(subjectDigest(options.subject ?? 'kim-minji|19940302')),
    claims: DEFAULT_CLAIMS,
    issuedAt: NOW - 30n * DAY,
    expiresAt: NOW + 365n * DAY,
    salt: randomBytes32(),
    ...overrides,
  };
  const signature = signCredential(credential, options.signer ?? w.issuer);
  const record = w.sim.getLedger().issuers.lookup(w.issuerId);
  const issuerPublicKey = record.publicKey;
  const leaf = pureCircuits.issuerLeaf(w.issuerId, record.schemaId, record.publicKey, record.epoch);
  const issuerPath = w.sim.getLedger().issuerTree.pathForLeaf(record.slot, leaf);
  return {
    holderSecret,
    credential,
    inputs: { credential, signature, holderSecret, issuerPublicKey, issuerPath, requestNonce: options.nonce ?? NO_NONCE },
  };
};

// Re-derives issuer key and path from the ledger the way the holder app does.
export const withLiveIssuerWitness = (w: World, fx: HolderFixture): HolderProofInputs => ({
  ...fx.inputs,
  ...issuerWitnessFor(w.sim.getLedger(), fx.credential),
});

export const openRequest = (w: World, requestPolicy: Policy = salaryPolicy()): Uint8Array => {
  const requestId = randomBytes32();
  w.sim.asVerifier().createRequest(requestId, requestPolicy, NOW, NOW + DAY);
  return requestId;
};

// "Active, at least 24 months, salary at least 5,000만원".
export const salaryPolicy = (): Policy =>
  policy([cond(SLOT.status, Op.eq, STATUS_ACTIVE), cond(SLOT.months, Op.gte, 24n), cond(SLOT.salary, Op.gte, 5_000n)]);
