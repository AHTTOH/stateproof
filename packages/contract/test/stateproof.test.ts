import { describe, expect, it } from 'vitest';
import { Op, pureCircuits } from '../src/managed/stateproof/contract/index.js';
import { generateIssuerKeyPair, signCredential, verifyCredentialSignature } from '../src/signing.js';
import { StateProofSimulator } from './simulator.js';
import {
  ACME_ISSUER,
  DAY,
  NOW,
  SLOT,
  STATUS_ACTIVE,
  claims,
  cond,
  employmentCredential,
  policy,
  randomBytes32,
  type HolderFixture,
} from './fixtures.js';

const ADMIN_SECRET = randomBytes32();

// "Active AND at least 12 months" plus an ignored slot left for the reader.
const employmentPolicy = policy([
  cond(SLOT.status, Op.eq, STATUS_ACTIVE),
  cond(SLOT.months, Op.gte, 12n),
]);

const setup = (fixture: HolderFixture, requestPolicy = employmentPolicy) => {
  const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
  sim.asAdmin(ADMIN_SECRET).registerIssuer(ACME_ISSUER, fixture.issuer.publicKey);
  const requestId = randomBytes32();
  sim.asVerifier().createRequest(requestId, requestPolicy, NOW, NOW + DAY);
  return { sim, requestId };
};

describe('issuer signatures (TS side)', () => {
  it('verifies a signature produced by signCredential', () => {
    const fx = employmentCredential();
    expect(verifyCredentialSignature(fx.credential, fx.inputs.signature, fx.issuer.publicKey)).toBe(true);
  });

  it('rejects a signature under a different key', () => {
    const fx = employmentCredential();
    expect(verifyCredentialSignature(fx.credential, fx.inputs.signature, generateIssuerKeyPair().publicKey)).toBe(false);
  });
});

describe('submitProof', () => {
  it('records VERIFIED for a valid credential that satisfies the policy', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx);
    const state = sim.asHolder(fx.inputs).submitProof(requestId);
    expect(state.results.member(requestId)).toBe(true);
    expect(state.results.lookup(requestId).revealed.is_some).toBe(false);
  });

  it('reveals exactly one slot when the policy asks for it', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx, policy([cond(SLOT.status, Op.eq, STATUS_ACTIVE)], SLOT.jobCategory));
    const revealed = sim.asHolder(fx.inputs).submitProof(requestId).results.lookup(requestId).revealed;
    expect(revealed).toEqual({ is_some: true, value: 7n });
  });

  it('rejects a credential signed by an unregistered key', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx);
    const forged = { ...fx.inputs, signature: signCredential(fx.credential, generateIssuerKeyPair()) };
    expect(() => sim.asHolder(forged).submitProof(requestId)).toThrow(/Invalid issuer signature/);
  });

  it('rejects claims altered after signing', () => {
    const fx = employmentCredential({ claims: claims([STATUS_ACTIVE, 7n, 20_000n, 6n]) });
    const { sim, requestId } = setup(fx);
    const tampered = { ...fx.inputs, credential: { ...fx.credential, claims: claims([STATUS_ACTIVE, 7n, 20_000n, 60n]) } };
    expect(() => sim.asHolder(tampered).submitProof(requestId)).toThrow(/Invalid issuer signature/);
  });

  it('rejects an expired credential', () => {
    const fx = employmentCredential({ expiresAt: NOW - DAY });
    const { sim, requestId } = setup(fx);
    expect(() => sim.asHolder(fx.inputs).submitProof(requestId)).toThrow(/Credential expired/);
  });

  it('rejects a credential issued after the reference time', () => {
    const fx = employmentCredential({ issuedAt: NOW + DAY });
    const { sim, requestId } = setup(fx);
    expect(() => sim.asHolder(fx.inputs).submitProof(requestId)).toThrow(/not valid yet/);
  });

  it('rejects a holder who does not know the bound secret', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx);
    const stolen = { ...fx.inputs, holderSecret: randomBytes32() };
    expect(() => sim.asHolder(stolen).submitProof(requestId)).toThrow(/bound to another holder/);
  });

  it('rejects a credential that does not meet the conditions', () => {
    const fx = employmentCredential({ claims: claims([STATUS_ACTIVE, 7n, 20_000n, 6n]) });
    const { sim, requestId } = setup(fx);
    expect(() => sim.asHolder(fx.inputs).submitProof(requestId)).toThrow(/Policy conditions are not satisfied/);
  });

  it('rejects a second answer to the same request', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx);
    sim.asHolder(fx.inputs).submitProof(requestId);
    expect(() => sim.asHolder(fx.inputs).submitProof(requestId)).toThrow(/already answered/);
  });

  it('rejects answers after the request expires on chain', () => {
    const fx = employmentCredential();
    const { sim, requestId } = setup(fx);
    sim.setBlockTime(NOW + 2n * DAY);
    expect(() => sim.asHolder(fx.inputs).submitProof(requestId)).toThrow(/Request expired/);
  });

  it('rejects an unknown request id', () => {
    const fx = employmentCredential();
    const { sim } = setup(fx);
    expect(() => sim.asHolder(fx.inputs).submitProof(randomBytes32())).toThrow(/Unknown request/);
  });
});

describe('registerIssuer and createRequest', () => {
  it('lets only the admin register issuers', () => {
    const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
    expect(() => sim.asAdmin(randomBytes32()).registerIssuer(ACME_ISSUER, generateIssuerKeyPair().publicKey)).toThrow(
      /Only the admin/,
    );
  });

  it('refuses a request whose issuer is not registered', () => {
    const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
    expect(() => sim.asVerifier().createRequest(randomBytes32(), employmentPolicy, NOW, NOW + DAY)).toThrow(
      /issuer is not registered/,
    );
  });

  it('refuses a request that already expired', () => {
    const fx = employmentCredential();
    const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
    sim.asAdmin(ADMIN_SECRET).registerIssuer(ACME_ISSUER, fx.issuer.publicKey);
    expect(() => sim.asVerifier().createRequest(randomBytes32(), employmentPolicy, NOW, NOW - 1n)).toThrow(
      /expiry must be in the future/,
    );
  });

  it('refuses a condition pointing outside the claim slots', () => {
    const fx = employmentCredential();
    const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
    sim.asAdmin(ADMIN_SECRET).registerIssuer(ACME_ISSUER, fx.issuer.publicKey);
    const bad = policy([cond(8n, Op.gte, 1n)]);
    expect(() => sim.asVerifier().createRequest(randomBytes32(), bad, NOW, NOW + DAY)).toThrow(/claim index out of range/);
  });

  it('refuses reversed between bounds', () => {
    const fx = employmentCredential();
    const sim = new StateProofSimulator(ADMIN_SECRET, NOW);
    sim.asAdmin(ADMIN_SECRET).registerIssuer(ACME_ISSUER, fx.issuer.publicKey);
    const bad = policy([cond(SLOT.months, Op.between, 20n, 10n)]);
    expect(() => sim.asVerifier().createRequest(randomBytes32(), bad, NOW, NOW + DAY)).toThrow(/Between bounds/);
  });
});

describe('predicate engine operators', () => {
  const c = claims([5n, 10n, 15n]);
  const holds = (condition: ReturnType<typeof cond>) => pureCircuits.conditionHolds(c, condition);

  it.each([
    ['gte true', cond(1n, Op.gte, 10n), true],
    ['gte false', cond(1n, Op.gte, 11n), false],
    ['lte true', cond(1n, Op.lte, 10n), true],
    ['lte false', cond(1n, Op.lte, 9n), false],
    ['eq true', cond(2n, Op.eq, 15n), true],
    ['eq false', cond(2n, Op.eq, 16n), false],
    ['neq true', cond(0n, Op.neq, 4n), true],
    ['neq false', cond(0n, Op.neq, 5n), false],
    ['between inclusive low', cond(1n, Op.between, 10n, 20n), true],
    ['between inclusive high', cond(1n, Op.between, 1n, 10n), true],
    ['between outside', cond(1n, Op.between, 11n, 20n), false],
    ['inSet member', cond(0n, Op.inSet, 0n, 0n, [1n, 5n]), true],
    ['inSet non-member', cond(0n, Op.inSet, 0n, 0n, [1n, 2n]), false],
  ] as const)('%s', (_name, condition, expected) => {
    expect(holds(condition)).toBe(expected);
  });

  it('treats ignore as always true', () => {
    expect(holds({ ...cond(0n, Op.ignore, 999n) })).toBe(true);
  });

  it('ANDs all conditions', () => {
    expect(pureCircuits.policyHolds(c, policy([cond(0n, Op.eq, 5n), cond(1n, Op.gte, 11n)]))).toBe(false);
    expect(pureCircuits.policyHolds(c, policy([cond(0n, Op.eq, 5n), cond(1n, Op.gte, 10n)]))).toBe(true);
  });
});
