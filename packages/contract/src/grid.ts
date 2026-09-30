// Grid points for createRequest. Bounds on a protected slot must be multiples of the slot's
// grid step; the verifier passes the multipliers so the circuit only has to multiply.
import { Op, type GridPoint, type Policy, type SchemaRule } from './managed/stateproof/contract/index.js';

export class OffGridError extends Error {
  constructor(
    readonly slot: number,
    readonly value: bigint,
    readonly step: bigint,
  ) {
    super(`Bound ${value} on protected slot ${slot} is not a multiple of its grid step ${step}`);
    this.name = 'OffGridError';
  }
}

const multiplier = (slot: number, value: bigint, step: bigint): bigint => {
  if (value % step !== 0n) throw new OffGridError(slot, value, step);
  return value / step;
};

// Throws OffGridError when a bound does not sit on the grid; the chain would refuse it too.
export const gridForPolicy = (policy: Policy, rule: SchemaRule): GridPoint[] =>
  policy.conditions.map((c) => {
    const slot = Number(c.claimIndex);
    const r = rule.slots[slot];
    if (!r || !r.sensitive || c.op === Op.ignore) return { lo: 0n, hi: 0n };
    return {
      lo: multiplier(slot, c.value, r.step),
      hi: c.op === Op.between ? multiplier(slot, c.value2, r.step) : 0n,
    };
  });

// Best-effort grid for tests that must reach the circuit with an off-grid policy.
export const unsafeGridForPolicy = (policy: Policy, rule: SchemaRule): GridPoint[] =>
  policy.conditions.map((c) => {
    const r = rule.slots[Number(c.claimIndex)];
    if (!r || !r.sensitive || c.op === Op.ignore) return { lo: 0n, hi: 0n };
    return { lo: c.value / r.step, hi: c.op === Op.between ? c.value2 / r.step : 0n };
  });
