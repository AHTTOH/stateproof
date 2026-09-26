// Human-level policy input -> contract Policy struct, and back to readable text.
import { Op, type Condition, type Policy } from '@stateproof/contract';
import { MAX_CONDITIONS, SET_SIZE } from '../constants.js';
import { bytes32ToLabel, labelToBytes32 } from '../encoding/bytes.js';
import { decodeClaimValue, encodeClaimValue, type ClaimInput } from '../encoding/claims.js';
import { getClaim, getSchema, schemaByIdBytes, schemaIdBytes, type CredentialSchema } from '../schemas/index.js';
import { operatorByName, operatorByOp, type OperatorName } from './operators.js';

export interface ConditionInput {
  readonly claim: string;
  readonly op: OperatorName;
  readonly value?: ClaimInput;
  readonly value2?: ClaimInput;
  readonly values?: readonly ClaimInput[];
}

export interface PolicyInput {
  readonly schema: string;
  readonly issuerId: string;
  readonly conditions: readonly ConditionInput[];
  readonly reveal: string | null;
}

const ignoredCondition = (): Condition => ({
  claimIndex: 0n,
  op: Op.ignore,
  value: 0n,
  value2: 0n,
  set: Array<bigint>(SET_SIZE).fill(0n),
});

const required = (input: ConditionInput, field: 'value' | 'value2'): ClaimInput => {
  const v = input[field];
  if (v === undefined || v === '') throw new Error(`${input.claim} ${input.op}: ${field} is required`);
  return v;
};

const buildCondition = (schema: CredentialSchema, input: ConditionInput): Condition => {
  const claim = getClaim(schema, input.claim);
  const def = operatorByName(input.op);
  if (!def.claimTypes.includes(claim.type)) {
    throw new Error(`Operator "${def.label}" does not apply to ${claim.label} (${claim.type})`);
  }
  const base = { ...ignoredCondition(), claimIndex: BigInt(claim.slot), op: def.op };
  switch (def.arity) {
    case 'one':
      return { ...base, value: encodeClaimValue(claim, required(input, 'value')) };
    case 'two': {
      const low = encodeClaimValue(claim, required(input, 'value'));
      const high = encodeClaimValue(claim, required(input, 'value2'));
      if (low > high) throw new Error(`${claim.label}: lower bound is above upper bound`);
      return { ...base, value: low, value2: high };
    }
    case 'set': {
      const values = (input.values ?? []).map((v) => encodeClaimValue(claim, v));
      if (values.length === 0) throw new Error(`${claim.label}: choose at least one value`);
      if (values.length > SET_SIZE) throw new Error(`${claim.label}: at most ${SET_SIZE} values`);
      // Padding repeats a real member, so it can never add a new match.
      return { ...base, set: [...values, ...Array<bigint>(SET_SIZE - values.length).fill(values[0])] };
    }
  }
};

export const buildPolicy = (input: PolicyInput): Policy => {
  const schema = getSchema(input.schema);
  if (input.conditions.length === 0) throw new Error('A policy needs at least one condition');
  if (input.conditions.length > MAX_CONDITIONS) throw new Error(`At most ${MAX_CONDITIONS} conditions`);
  const conditions = input.conditions.map((c) => buildCondition(schema, c));
  const revealSlot =
    input.reveal === null
      ? { is_some: false, value: 0n }
      : { is_some: true, value: BigInt(getClaim(schema, input.reveal).slot) };
  return {
    schemaId: schemaIdBytes(schema),
    issuerId: labelToBytes32(input.issuerId),
    conditions: [...conditions, ...Array.from({ length: MAX_CONDITIONS - conditions.length }, ignoredCondition)],
    revealSlot,
  };
};

export interface PolicyDescription {
  readonly schema: CredentialSchema;
  readonly issuerId: string;
  readonly conditions: readonly string[];
  readonly revealed: string | null;
  readonly notDisclosed: readonly string[];
}

const describeCondition = (schema: CredentialSchema, condition: Condition): string => {
  const claim = schema.claims.find((c) => BigInt(c.slot) === condition.claimIndex);
  if (!claim) throw new Error(`Condition refers to slot ${condition.claimIndex}, not defined in ${schema.id}`);
  const def = operatorByOp(condition.op);
  const unit = claim.unit ? ` ${claim.unit}` : '';
  switch (def.arity) {
    case 'one':
      return `${claim.label} ${def.label} ${decodeClaimValue(claim, condition.value)}${unit}`;
    case 'two':
      return `${claim.label} between ${decodeClaimValue(claim, condition.value)} and ${decodeClaimValue(claim, condition.value2)}${unit}`;
    case 'set': {
      const members = [...new Set(condition.set.map((v) => decodeClaimValue(claim, v)))];
      return `${claim.label} ${def.label} ${members.join(', ')}`;
    }
  }
};

export const describePolicy = (policy: Policy): PolicyDescription => {
  const schema = schemaByIdBytes(policy.schemaId);
  const active = policy.conditions.filter((c) => c.op !== Op.ignore);
  const revealedClaim = policy.revealSlot.is_some
    ? schema.claims.find((c) => BigInt(c.slot) === policy.revealSlot.value)
    : undefined;
  if (policy.revealSlot.is_some && !revealedClaim) throw new Error('Reveal slot is not defined in the schema');
  // Conditions that allow exactly one value tell the verifier that value on success:
  // `eq`, `in` with one distinct member, and `between` with equal bounds.
  const pinsValue = (c: Condition): boolean =>
    c.op === Op.eq || (c.op === Op.inSet && new Set(c.set).size === 1) || (c.op === Op.between && c.value === c.value2);
  const pinnedSlots = new Set(active.filter(pinsValue).map((c) => c.claimIndex));
  return {
    schema,
    issuerId: bytes32ToLabel(policy.issuerId),
    conditions: active.map((c) => describeCondition(schema, c)),
    revealed: revealedClaim ? revealedClaim.label : null,
    notDisclosed: schema.claims.filter((c) => c !== revealedClaim && !pinnedSlots.has(BigInt(c.slot))).map((c) => c.label),
  };
};
