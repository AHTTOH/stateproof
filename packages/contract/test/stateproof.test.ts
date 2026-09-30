// Contract behaviour, one describe block per acceptance criterion group.
// AC numbers match docs/ACCEPTANCE.md, the threat model and the deck.
import { describe, expect, it } from 'vitest';
import { Op, pureCircuits } from '../src/managed/stateproof/contract/index.js';
import { generateIssuerKeyPair, signCredential, verifyCredentialSignature } from '../src/signing.js';
import { NO_NONCE } from '../src/witnesses.js';
import {
  ACME_ISSUER,
  CAREER_SCHEMA,
  DAY,
  NOW,
  OTHER_ISSUER,
  SALARY_MIN_WIDTH,
  SLOT,
  STATUS_ACTIVE,
  careerRule,
  claims,
  cond,
  holderCredential,
  openRequest,
  policy,
  randomBytes32,
  salaryPolicy,
  subjectDigest,
  withLiveIssuerWitness,
  world,
} from './fixtures.js';

const refuse = (fn: () => unknown, message: RegExp) => expect(fn).toThrow(message);

describe('baseline: a valid credential answers an open request', () => {
  it('records one answer under the holder pseudonym and returns it', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    const pseudonym = w.sim.asHolder(fx.inputs).submitProof(id);
    const state = w.sim.getLedger();
    expect(pseudonym).toEqual(pureCircuits.pseudonymFor(id, fx.holderSecret));
    expect(state.answers.lookup(id).member(pseudonym)).toBe(true);
    expect(state.answers.lookup(id).lookup(pseudonym).revealed.is_some).toBe(false);
    expect(state.answerCounts.lookup(id).read()).toBe(1n);
  });

  it('reveals exactly one non-sensitive slot when the policy asks for it', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w, policy([cond(SLOT.status, Op.eq, STATUS_ACTIVE)], SLOT.jobCategory));
    const pseudonym = w.sim.asHolder(fx.inputs).submitProof(id);
    expect(w.sim.getLedger().answers.lookup(id).lookup(pseudonym).revealed).toEqual({ is_some: true, value: 7n });
  });
});

describe('AC-1..2 pseudonyms: one answer per person per request, unlinkable across requests', () => {
  it('AC-1 refuses a second answer from the same holder to the same request', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    w.sim.asHolder(fx.inputs).submitProof(id);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /already answered this request/);
  });

  it('AC-1 lets many different holders answer one open posting', () => {
    const w = world();
    const id = openRequest(w);
    for (let i = 0; i < 5; i++) w.sim.asHolder(holderCredential(w, {}, { subject: `person-${i}` }).inputs).submitProof(id);
    expect(w.sim.getLedger().answerCounts.lookup(id).read()).toBe(5n);
  });

  it('AC-2 gives the same holder a different pseudonym for every request', () => {
    const w = world();
    const fx = holderCredential(w);
    const a = openRequest(w);
    const b = openRequest(w);
    const pa = w.sim.asHolder(fx.inputs).submitProof(a);
    const pb = w.sim.asHolder(fx.inputs).submitProof(b);
    expect(pa).not.toEqual(pb);
  });
});

describe('AC-3 subject seal: a request for one named person refuses everyone else', () => {
  const sealed = (w: ReturnType<typeof world>, subject: string, nonce: Uint8Array) => {
    const id = randomBytes32();
    const commit = pureCircuits.subjectCommitment(pureCircuits.subjectIdOf(subjectDigest(subject)), nonce);
    w.sim.asVerifier().createRequest(id, salaryPolicy(), NOW, NOW + DAY, { is_some: true, value: commit });
    return id;
  };

  it('accepts the named person holding the link nonce', () => {
    const w = world();
    const nonce = randomBytes32();
    const id = sealed(w, 'kim-minji|19940302', nonce);
    const fx = holderCredential(w, {}, { subject: 'kim-minji|19940302', nonce });
    expect(() => w.sim.asHolder(fx.inputs).submitProof(id)).not.toThrow();
  });

  it('refuses a qualified friend who received the link (stand-in answer)', () => {
    const w = world();
    const nonce = randomBytes32();
    const id = sealed(w, 'kim-minji|19940302', nonce);
    const friend = holderCredential(w, {}, { subject: 'lee-sora|19930815', nonce });
    refuse(() => w.sim.asHolder(friend.inputs).submitProof(id), /different person/);
  });

  it('refuses the named person without the link nonce', () => {
    const w = world();
    const id = sealed(w, 'kim-minji|19940302', randomBytes32());
    const fx = holderCredential(w, {}, { subject: 'kim-minji|19940302', nonce: NO_NONCE });
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /different person/);
  });

  it('keeps the sealed commitment untestable without the nonce', () => {
    const subject = pureCircuits.subjectIdOf(subjectDigest('kim-minji|19940302'));
    expect(pureCircuits.subjectCommitment(subject, randomBytes32())).not.toEqual(pureCircuits.subjectCommitment(subject, NO_NONCE));
  });
});

describe('AC-5 anonymous issuer set', () => {
  it('accepts credentials from any registered issuer of the schema', () => {
    const w = world();
    const other = generateIssuerKeyPair();
    w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, CAREER_SCHEMA, other.publicKey, 9n);
    const id = openRequest(w);
    const fromOther = holderCredential({ ...w, issuer: other, issuerId: OTHER_ISSUER }, {}, { subject: 'a' });
    const fromAcme = holderCredential(w, {}, { subject: 'b' });
    w.sim.asHolder(withLiveIssuerWitness({ ...w, issuerId: OTHER_ISSUER }, fromOther)).submitProof(id);
    w.sim.asHolder(withLiveIssuerWitness(w, fromAcme)).submitProof(id);
    expect(w.sim.getLedger().answerCounts.lookup(id).read()).toBe(2n);
  });

  it('refuses a credential signed by a key outside the issuer set', () => {
    const w = world();
    const fx = holderCredential(w, {}, { signer: generateIssuerKeyPair() });
    const id = openRequest(w);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /Invalid issuer signature/);
  });

  it('refuses a path that does not lead to the claimed issuer leaf', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    const forgedPath = { ...fx.inputs.issuerPath, leaf: randomBytes32() };
    refuse(() => w.sim.asHolder({ ...fx.inputs, issuerPath: forgedPath }).submitProof(id), /Issuer path does not belong/);
  });

  it('refuses an issuer registered for another schema', () => {
    const w = world();
    const other = generateIssuerKeyPair();
    const otherSchema = randomBytes32();
    w.sim.asAdmin(w.adminSecret).registerSchema(otherSchema, careerRule());
    w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, otherSchema, other.publicKey, 9n);
    const fx = holderCredential({ ...w, issuer: other, issuerId: OTHER_ISSUER });
    const id = openRequest(w);
    // The credential claims the career schema, but the issuer's leaf commits to otherSchema.
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /Issuer path does not belong|not in the current issuer set/);
  });

  it('refuses credentials of a deactivated issuer', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    w.sim.asAdmin(w.adminSecret).deactivateIssuer(ACME_ISSUER);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /not in the current issuer set/);
  });
});

describe('AC-6..7 revocation by issuer epoch', () => {
  it('AC-6 refuses credentials from an older epoch once the issuer rotates', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    w.sim.asIssuer(w.issuer.secretScalar).rotateIssuerEpoch(ACME_ISSUER);
    expect(w.sim.getLedger().issuers.lookup(ACME_ISSUER).epoch).toBe(1n);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /not in the current issuer set/);
    // The holder app would not even find a path for the stale epoch.
    refuse(() => withLiveIssuerWitness(w, fx), /issuer epoch 0.*now at 1/);
  });

  it('AC-6 accepts a credential re-issued in the new epoch', () => {
    const w = world();
    w.sim.asIssuer(w.issuer.secretScalar).rotateIssuerEpoch(ACME_ISSUER);
    const fresh = holderCredential(w, { epoch: 1n });
    const id = openRequest(w);
    expect(() => w.sim.asHolder(withLiveIssuerWitness(w, fresh)).submitProof(id)).not.toThrow();
  });

  it('AC-7 lets only the issuer rotate its epoch', () => {
    const w = world();
    refuse(() => w.sim.asIssuer(generateIssuerKeyPair().secretScalar).rotateIssuerEpoch(ACME_ISSUER), /Only the issuer/);
  });

  it('AC-7 refuses rotation of a deactivated issuer', () => {
    const w = world();
    w.sim.asAdmin(w.adminSecret).deactivateIssuer(ACME_ISSUER);
    refuse(() => w.sim.asIssuer(w.issuer.secretScalar).rotateIssuerEpoch(ACME_ISSUER), /deactivated/);
  });
});

describe('AC-8..9 minimal disclosure: the chain refuses over-asking verifiers', () => {
  const tryCreate = (conditions: ReturnType<typeof cond>[], reveal: bigint | null = null) => {
    const w = world();
    return () => w.sim.asVerifier().createRequest(randomBytes32(), policy(conditions, reveal), NOW, NOW + DAY);
  };

  it.each([
    ['exact salary (eq)', [cond(SLOT.salary, Op.eq, 5_210n)]],
    ['salary not equal (neq)', [cond(SLOT.salary, Op.neq, 5_210n)]],
    ['salary set membership (inSet)', [cond(SLOT.salary, Op.inSet, 0n, 0n, [5_200n, 5_210n])]],
    ['gte and lte on the same value', [cond(SLOT.salary, Op.gte, 5_210n), cond(SLOT.salary, Op.lte, 5_210n)]],
    ['between narrower than the minimum band', [cond(SLOT.salary, Op.between, 5_000n, 5_000n + SALARY_MIN_WIDTH - 1n)]],
    ['two ranges whose overlap is too narrow', [cond(SLOT.salary, Op.gte, 5_000n), cond(SLOT.salary, Op.between, 4_000n, 5_100n)]],
    ['contradictory range (empty)', [cond(SLOT.salary, Op.gte, 6_000n), cond(SLOT.salary, Op.lte, 5_000n)]],
  ] as const)('AC-8 refuses %s', (_name, conditions) => {
    refuse(tryCreate([...conditions]), /narrows a protected value/);
  });

  it('AC-8 refuses revealing a sensitive slot', () => {
    refuse(tryCreate([cond(SLOT.status, Op.eq, STATUS_ACTIVE)], SLOT.salary), /narrows a protected value/);
  });

  it.each([
    ['salary at least X', [cond(SLOT.salary, Op.gte, 5_000n)]],
    ['salary at most X', [cond(SLOT.salary, Op.lte, 9_000n)]],
    ['salary band exactly the minimum width', [cond(SLOT.salary, Op.between, 5_000n, 5_000n + SALARY_MIN_WIDTH)]],
    ['exact values on non-sensitive slots', [cond(SLOT.status, Op.eq, STATUS_ACTIVE), cond(SLOT.jobCategory, Op.inSet, 0n, 0n, [7n, 8n])]],
  ] as const)('AC-9 accepts %s', (_name, conditions) => {
    expect(tryCreate([...conditions])).not.toThrow();
  });

  it('AC-9 minimal-disclosure rule matches a brute-force definition', () => {
    // For a sensitive slot, the rule must accept exactly the policies whose set of
    // possible values is an interval at least minWidth wide and that reveal nothing.
    const rule = careerRule();
    const values = [0n, 4_000n, 4_500n, 5_000n, 5_499n, 5_500n, 6_000n];
    const ops = [Op.gte, Op.lte, Op.between, Op.eq] as const;
    let checked = 0;
    for (const op1 of ops)
      for (const op2 of ops)
        for (const a of values)
          for (const b of values) {
            const c1 = op1 === Op.between ? cond(SLOT.salary, op1, a, a + 600n) : cond(SLOT.salary, op1, a);
            const c2 = op2 === Op.between ? cond(SLOT.salary, op2, b, b + 600n) : cond(SLOT.salary, op2, b);
            let lo = 0n;
            let hi = 18446744073709551615n;
            let exact = false;
            for (const c of [c1, c2]) {
              if (c.op === Op.gte) lo = lo > c.value ? lo : c.value;
              else if (c.op === Op.lte) hi = hi < c.value ? hi : c.value;
              else if (c.op === Op.between) {
                lo = lo > c.value ? lo : c.value;
                hi = hi < c.value2 ? hi : c.value2;
              } else exact = true;
            }
            const expected = !exact && hi >= lo && hi - lo >= SALARY_MIN_WIDTH;
            expect(pureCircuits.respectsSensitiveSlots(policy([c1, c2]), rule)).toBe(expected);
            checked++;
          }
    expect(checked).toBe(ops.length ** 2 * values.length ** 2);
  });
});

describe('AC-11 repeated queries cannot narrow a protected value below one grid cell', () => {
  const create = (w: ReturnType<typeof world>, conditions: ReturnType<typeof cond>[], grid?: { lo: bigint; hi: bigint }[]) => () =>
    w.sim.asVerifier().createRequest(randomBytes32(), policy(conditions), NOW, NOW + DAY, undefined, grid);

  it('refuses thresholds that are not multiples of the salary grid step', () => {
    const w = world();
    refuse(create(w, [cond(SLOT.salary, Op.gte, 5_100n)]), /sit on its grid/);
    refuse(create(w, [cond(SLOT.salary, Op.between, 5_000n, 5_600n)]), /sit on its grid/);
  });

  it('refuses a verifier that lies about the grid position', () => {
    const w = world();
    const lying = [{ lo: 11n, hi: 0n }, ...Array.from({ length: 3 }, () => ({ lo: 0n, hi: 0n }))];
    refuse(create(w, [cond(SLOT.salary, Op.gte, 5_000n)], lying), /sit on its grid/);
  });

  it('accepts on-grid thresholds and bands', () => {
    const w = world();
    expect(create(w, [cond(SLOT.salary, Op.gte, 5_500n)])).not.toThrow();
    expect(create(w, [cond(SLOT.salary, Op.between, 4_500n, 6_000n)])).not.toThrow();
  });

  it('leaves at least one full grid cell after any set of accepted one-sided questions', () => {
    // An adversary asks "salary >= t" for every allowed t and the applicant answers truthfully.
    // The tightest interval consistent with all answers is still [k*step, (k+1)*step).
    const salary = 5_437n;
    const step = SALARY_MIN_WIDTH;
    let lo = 0n;
    let hi = 20_000n;
    for (let t = 0n; t <= 20_000n; t += step) {
      if (salary >= t) lo = t;
      else hi = hi < t ? hi : t;
    }
    expect(hi - lo).toBe(step);
  });

  it('refuses a schema registered with a zero grid step', () => {
    const w = world();
    const bad = careerRule();
    const slots = bad.slots.map((s, i) => (i === 5 ? { ...s, step: 0n } : s));
    refuse(() => w.sim.asAdmin(w.adminSecret).registerSchema(randomBytes32(), { slots }), /Grid step must be positive/);
  });
});

describe('AC-10 reference time follows the chain clock', () => {
  it('refuses a reference time in the future', () => {
    const w = world();
    refuse(() => w.sim.asVerifier().createRequest(randomBytes32(), salaryPolicy(), NOW + 60n, NOW + DAY), /in the future/);
  });

  it('refuses a reference time more than an hour old', () => {
    const w = world();
    refuse(() => w.sim.asVerifier().createRequest(randomBytes32(), salaryPolicy(), NOW - 3_601n, NOW + DAY), /too old/);
  });

  it('accepts a reference time within the tolerance', () => {
    const w = world();
    expect(() => w.sim.asVerifier().createRequest(randomBytes32(), salaryPolicy(), NOW - 600n, NOW + DAY)).not.toThrow();
  });
});

describe('credential checks inside submitProof', () => {
  it('refuses claims altered after signing (forged salary)', () => {
    const w = world();
    const fx = holderCredential(w, { claims: claims([STATUS_ACTIVE, 7n, 26n, 4_200n]) });
    const id = openRequest(w);
    const forged = { ...fx.inputs, credential: { ...fx.credential, claims: claims([STATUS_ACTIVE, 7n, 26n, 6_200n]) } };
    refuse(() => w.sim.asHolder(forged).submitProof(id), /Invalid issuer signature/);
  });

  it('refuses a credential that does not meet the conditions', () => {
    const w = world();
    const fx = holderCredential(w, { claims: claims([STATUS_ACTIVE, 7n, 26n, 4_200n]) });
    const id = openRequest(w);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /Policy conditions are not satisfied/);
  });

  it('refuses an expired credential', () => {
    const w = world();
    const fx = holderCredential(w, { expiresAt: NOW - DAY });
    const id = openRequest(w);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /Credential expired/);
  });

  it('refuses a credential issued after the reference time', () => {
    const w = world();
    const fx = holderCredential(w, { issuedAt: NOW + DAY });
    const id = openRequest(w);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /not valid yet/);
  });

  it('refuses a holder who does not know the bound secret (stolen credential)', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    refuse(() => w.sim.asHolder({ ...fx.inputs, holderSecret: randomBytes32() }).submitProof(id), /bound to another holder/);
  });

  it('refuses a credential of another schema', () => {
    const w = world();
    const fx = holderCredential(w, { schemaId: randomBytes32() });
    const id = openRequest(w);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /schema does not match/);
  });

  it('refuses answers after the request expires on chain', () => {
    const w = world();
    const fx = holderCredential(w);
    const id = openRequest(w);
    w.sim.setBlockTime(NOW + 2n * DAY);
    refuse(() => w.sim.asHolder(fx.inputs).submitProof(id), /Request expired/);
  });

  it('refuses an unknown request id', () => {
    const w = world();
    refuse(() => w.sim.asHolder(holderCredential(w).inputs).submitProof(randomBytes32()), /Unknown request/);
  });
});

describe('administration', () => {
  it('lets only the admin register schemas and issuers', () => {
    const w = world();
    refuse(() => w.sim.asAdmin(randomBytes32()).registerSchema(randomBytes32(), careerRule()), /Only the admin/);
    refuse(
      () => w.sim.asAdmin(randomBytes32()).registerIssuer(OTHER_ISSUER, CAREER_SCHEMA, generateIssuerKeyPair().publicKey, 5n),
      /Only the admin/,
    );
    refuse(() => w.sim.asAdmin(randomBytes32()).deactivateIssuer(ACME_ISSUER), /Only the admin/);
  });

  it('refuses a second issuer in an occupied slot, a duplicate issuer and slots out of range', () => {
    const w = world({ issuerSlot: 3n });
    const key = generateIssuerKeyPair().publicKey;
    refuse(() => w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, CAREER_SCHEMA, key, 3n), /slot already used/);
    refuse(() => w.sim.asAdmin(w.adminSecret).registerIssuer(ACME_ISSUER, CAREER_SCHEMA, key, 4n), /already registered/);
    refuse(() => w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, CAREER_SCHEMA, key, 64n), /out of range/);
  });

  it('refuses issuers for unregistered schemas and duplicate schemas', () => {
    const w = world();
    refuse(
      () => w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, randomBytes32(), generateIssuerKeyPair().publicKey, 5n),
      /Schema is not registered/,
    );
    refuse(() => w.sim.asAdmin(w.adminSecret).registerSchema(CAREER_SCHEMA, careerRule()), /already registered/);
  });

  it('refuses the identity point as an issuer key', () => {
    const w = world();
    refuse(
      () => w.sim.asAdmin(w.adminSecret).registerIssuer(OTHER_ISSUER, CAREER_SCHEMA, { x: 0n, y: 1n }, 5n),
      /identity|prime-order/,
    );
  });

  it('refuses requests for unregistered schemas, reused ids, bad slots and reversed bounds', () => {
    const w = world();
    const unknownSchema = { ...salaryPolicy(), schemaId: randomBytes32() };
    refuse(() => w.sim.asVerifier().createRequest(randomBytes32(), unknownSchema, NOW, NOW + DAY), /Schema is not registered/);
    const id = openRequest(w);
    refuse(() => w.sim.asVerifier().createRequest(id, salaryPolicy(), NOW, NOW + DAY), /already used/);
    refuse(() => w.sim.asVerifier().createRequest(randomBytes32(), policy([cond(8n, Op.gte, 1n)]), NOW, NOW + DAY), /out of range/);
    refuse(
      () => w.sim.asVerifier().createRequest(randomBytes32(), policy([cond(SLOT.months, Op.between, 20n, 10n)]), NOW, NOW + DAY),
      /Between bounds/,
    );
    refuse(() => w.sim.asVerifier().createRequest(randomBytes32(), salaryPolicy(), NOW, NOW - 1n), /expiry must be in the future/);
  });
});

describe('issuer signatures (TS side)', () => {
  it('verifies a signature produced by signCredential and rejects other keys', () => {
    const w = world();
    const fx = holderCredential(w);
    expect(verifyCredentialSignature(fx.credential, fx.inputs.signature, w.issuer.publicKey)).toBe(true);
    expect(verifyCredentialSignature(fx.credential, fx.inputs.signature, generateIssuerKeyPair().publicKey)).toBe(false);
    expect(verifyCredentialSignature(fx.credential, signCredential(fx.credential, w.issuer), w.issuer.publicKey)).toBe(true);
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

  it('treats ignore as always true and ANDs all conditions', () => {
    expect(holds(cond(0n, Op.ignore, 999n))).toBe(true);
    expect(pureCircuits.policyHolds(c, policy([cond(0n, Op.eq, 5n), cond(1n, Op.gte, 11n)]))).toBe(false);
    expect(pureCircuits.policyHolds(c, policy([cond(0n, Op.eq, 5n), cond(1n, Op.gte, 10n)]))).toBe(true);
  });
});
