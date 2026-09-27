// Human-level policy input -> contract Policy struct. Reading it back is in describe.ts.
import { Op, type Condition, type Policy } from '@stateproof/contract';
import { MAX_CONDITIONS, SET_SIZE } from '../constants.js';
import { labelToBytes32 } from '../encoding/bytes.js';
import { encodeClaimValue, type ClaimInput } from '../encoding/claims.js';
import { getClaim, getSchema, schemaIdBytes, type ClaimDefinition, type CredentialSchema } from '../schemas/index.js';
import { PolicyInputError } from './input-error.js';
import { operatorByName, operatorsForClaim, type OperatorName } from './operators.js';

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
  if (v === undefined || v === '') throw new PolicyInputError('valueRequired', `${input.claim} ${input.op}: ${field} is required`, input.claim, null);
  return v;
};

const encode = (claim: ClaimDefinition, input: ClaimInput): bigint => {
  try {
    return encodeClaimValue(claim, input);
  } catch (e) {
    throw new PolicyInputError('invalidValue', e instanceof Error ? e.message : String(e), claim.key, null);
  }
};

const buildCondition = (schema: CredentialSchema, input: ConditionInput): Condition => {
  const claim = getClaim(schema, input.claim);
  const def = operatorByName(input.op);
  if (!claim.operators.includes(def.name)) {
    const allowed = operatorsForClaim(claim).map((o) => `"${o.label}"`).join(', ');
    throw new PolicyInputError('operatorNotAllowed', `Operator "${def.label}" is not allowed for ${claim.label}. Allowed: ${allowed}`, claim.key, null);
  }
  const base = { ...ignoredCondition(), claimIndex: BigInt(claim.slot), op: def.op };
  switch (def.arity) {
    case 'one':
      return { ...base, value: encode(claim, required(input, 'value')) };
    case 'two': {
      const low = encode(claim, required(input, 'value'));
      const high = encode(claim, required(input, 'value2'));
      if (low > high) throw new PolicyInputError('boundsReversed', `${claim.label}: lower bound is above upper bound`, claim.key, null);
      return { ...base, value: low, value2: high };
    }
    case 'set': {
      const values = (input.values ?? []).map((v) => encode(claim, v));
      if (values.length === 0) throw new PolicyInputError('setEmpty', `${claim.label}: choose at least one value`, claim.key, null);
      if (values.length > SET_SIZE) throw new PolicyInputError('setTooLarge', `${claim.label}: at most ${SET_SIZE} values`, claim.key, SET_SIZE);
      // Padding repeats a real member, so it can never add a new match.
      return { ...base, set: [...values, ...Array<bigint>(SET_SIZE - values.length).fill(values[0])] };
    }
  }
};

export const buildPolicy = (input: PolicyInput): Policy => {
  const schema = getSchema(input.schema);
  if (input.conditions.length === 0) throw new PolicyInputError('noConditions', 'A policy needs at least one condition', null, null);
  if (input.conditions.length > MAX_CONDITIONS) {
    throw new PolicyInputError('tooManyConditions', `At most ${MAX_CONDITIONS} conditions`, null, MAX_CONDITIONS);
  }
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
