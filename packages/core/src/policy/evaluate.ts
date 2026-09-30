// Plain TypeScript mirror of the circuit's predicate engine and minimal-disclosure rule.
// The holder app runs this before proving (instant feedback, no proof for a sure failure)
// and the verifier app runs it before submitting a request. A differential test checks it
// against the compiled circuits on randomized and boundary-heavy inputs.
import { Op, type Condition, type Policy, type SchemaRule } from '@stateproof/contract';
import { CLAIM_SLOTS, MAX_CLAIM_VALUE } from '../constants.js';

export const conditionHoldsTs = (claims: readonly bigint[], c: Condition): boolean => {
  if (c.claimIndex >= BigInt(CLAIM_SLOTS)) throw new Error('Claim index out of range');
  const v = claims[Number(c.claimIndex)];
  switch (c.op) {
    case Op.ignore:
      return true;
    case Op.gte:
      return v >= c.value;
    case Op.lte:
      return v <= c.value;
    case Op.eq:
      return v === c.value;
    case Op.neq:
      return v !== c.value;
    case Op.between:
      return v >= c.value && v <= c.value2;
    case Op.inSet:
      return c.set.includes(v);
  }
};

export const policyHoldsTs = (claims: readonly bigint[], policy: Policy): boolean =>
  policy.conditions.every((c) => conditionHoldsTs(claims, c));

export interface SlotBounds {
  readonly lo: bigint;
  readonly hi: bigint;
  readonly exact: boolean;
}

export const slotBoundsTs = (conditions: readonly Condition[], slot: bigint): SlotBounds =>
  conditions.reduce<SlotBounds>(
    (acc, c) => {
      if (c.claimIndex !== slot || c.op === Op.ignore) return acc;
      switch (c.op) {
        case Op.gte:
          return { ...acc, lo: acc.lo > c.value ? acc.lo : c.value };
        case Op.lte:
          return { ...acc, hi: acc.hi < c.value ? acc.hi : c.value };
        case Op.between:
          return { ...acc, lo: acc.lo > c.value ? acc.lo : c.value, hi: acc.hi < c.value2 ? acc.hi : c.value2 };
        default:
          return { ...acc, exact: true };
      }
    },
    { lo: 0n, hi: MAX_CLAIM_VALUE, exact: false },
  );

export type SlotVerdict = 'ok' | 'exact' | 'revealed' | 'tooNarrow';

// Why a sensitive slot fails, for the verifier UI. 'ok' when the slot is fine.
export const slotVerdict = (policy: Policy, rule: SchemaRule, slot: number): SlotVerdict => {
  const r = rule.slots[slot];
  if (!r.sensitive) return 'ok';
  const b = slotBoundsTs(policy.conditions, BigInt(slot));
  if (b.exact) return 'exact';
  if (policy.revealSlot.is_some && policy.revealSlot.value === BigInt(slot)) return 'revealed';
  if (!(b.hi >= b.lo && b.hi >= b.lo + r.minWidth)) return 'tooNarrow';
  return 'ok';
};

export const respectsSensitiveSlotsTs = (policy: Policy, rule: SchemaRule): boolean =>
  rule.slots.every((_, slot) => slotVerdict(policy, rule, slot) === 'ok');

// Bounds on protected slots that are not multiples of the slot's grid step.
export const offGridBounds = (policy: Policy, rule: SchemaRule): { slot: number; value: bigint; step: bigint }[] =>
  policy.conditions.flatMap((c) => {
    const slot = Number(c.claimIndex);
    const r = rule.slots[slot];
    if (!r || !r.sensitive || c.op === Op.ignore) return [];
    const values = c.op === Op.between ? [c.value, c.value2] : [c.value];
    return values.filter((v) => v % r.step !== 0n).map((value) => ({ slot, value, step: r.step }));
  });

// Every grid cell a protected slot can be narrowed to is still [k*step, (k+1)*step).
export const gridCellOf = (value: bigint, step: bigint): { lo: bigint; hi: bigint } => {
  const lo = (value / step) * step;
  return { lo, hi: lo + step };
};
