// Differential tests: the TypeScript mirror (policy/evaluate.ts) and the compiled circuits
// must agree on every input. Seeds are fixed so a failure reproduces exactly.
import { describe, expect, it } from 'vitest';
import { Op, pureCircuits, type Condition, type Policy } from '@stateproof/contract';
import {
  CLAIM_SLOTS,
  MAX_CONDITIONS,
  SET_SIZE,
  SCHEMAS,
  conditionHoldsTs,
  policyHoldsTs,
  respectsSensitiveSlotsTs,
  schemaIdBytes,
  schemaRule,
} from '../src/index.js';

// mulberry32: tiny deterministic PRNG.
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Values cluster around a few pivots so boundaries (v == bound, v == bound ± 1, width == minWidth)
// come up often instead of almost never.
const PIVOTS = [0n, 1n, 18n, 365n, 499n, 500n, 501n, 5_000n, 5_499n, 5_500n, 18_446_744_073_709_551_615n];

const makeGen = (seed: number) => {
  const r = rng(seed);
  const int = (n: number) => Math.floor(r() * n);
  const value = (): bigint => {
    const pivot = PIVOTS[int(PIVOTS.length)];
    const delta = BigInt(int(3) - 1) * BigInt(int(2) === 0 ? 1 : 500);
    const v = pivot + delta;
    return v < 0n ? 0n : v > PIVOTS[PIVOTS.length - 1] ? PIVOTS[PIVOTS.length - 1] : v;
  };
  const ops = [Op.ignore, Op.gte, Op.lte, Op.eq, Op.neq, Op.between, Op.inSet];
  const condition = (slots = CLAIM_SLOTS): Condition => {
    const op = ops[int(ops.length)];
    const a = value();
    const b = value();
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    return {
      claimIndex: BigInt(int(slots)),
      op,
      value: op === Op.between ? lo : a,
      value2: op === Op.between ? hi : b,
      set: Array.from({ length: SET_SIZE }, value),
    };
  };
  const claims = (): bigint[] => Array.from({ length: CLAIM_SLOTS }, value);
  const policy = (schemaId: Uint8Array, slots = CLAIM_SLOTS): Policy => ({
    schemaId,
    conditions: Array.from({ length: MAX_CONDITIONS }, () => condition(slots)),
    revealSlot: int(3) === 0 ? { is_some: true, value: BigInt(int(slots)) } : { is_some: false, value: 0n },
  });
  return { condition, claims, policy, int };
};

describe('differential: TS mirror vs compiled circuits', () => {
  it('conditionHolds agrees on 12,000 conditions', () => {
    const g = makeGen(1);
    let agreed = 0;
    for (let i = 0; i < 12_000; i++) {
      const claims = g.claims();
      const c = g.condition();
      expect(conditionHoldsTs(claims, c)).toBe(pureCircuits.conditionHolds(claims, c));
      agreed++;
    }
    expect(agreed).toBe(12_000);
  });

  it('policyHolds agrees on 12,000 policies, with both outcomes well represented', () => {
    const g = makeGen(2);
    let passes = 0;
    for (let i = 0; i < 12_000; i++) {
      const claims = g.claims();
      // Sparse policies (mostly ignore) so that many of them pass.
      const policy = g.policy(schemaIdBytes(SCHEMAS[0]));
      const sparse = { ...policy, conditions: policy.conditions.map((c) => (g.int(3) === 0 ? c : { ...c, op: Op.ignore })) };
      const expected = pureCircuits.policyHolds(claims, sparse);
      expect(policyHoldsTs(claims, sparse)).toBe(expected);
      if (expected) passes++;
    }
    expect(passes).toBeGreaterThan(1_000);
    expect(passes).toBeLessThan(11_000);
  });

  it('the minimal-disclosure rule agrees on 12,000 policies for every shipped schema', () => {
    const g = makeGen(3);
    let accepted = 0;
    for (let i = 0; i < 12_000; i++) {
      const schema = SCHEMAS[i % SCHEMAS.length];
      const rule = schemaRule(schema);
      const sensitiveSlot = schema.claims.find((c) => c.sensitive)!.slot;
      // Aim most conditions at the sensitive slot so the rule is exercised, not skipped.
      const policy = g.policy(schemaIdBytes(schema));
      const aimed = { ...policy, conditions: policy.conditions.map((c) => (g.int(4) === 0 ? c : { ...c, claimIndex: BigInt(sensitiveSlot) })) };
      const expected = pureCircuits.respectsSensitiveSlots(aimed, rule);
      expect(respectsSensitiveSlotsTs(aimed, rule)).toBe(expected);
      if (expected) accepted++;
    }
    expect(accepted).toBeGreaterThan(500);
    expect(accepted).toBeLessThan(11_500);
  });
});
