// Human-level policy input -> contract Policy struct. Reading it back is in describe.ts.
// The builder refuses exactly what the chain would refuse, before any transaction is built.
import { Op, type Condition, type Policy } from '@stateproof/contract';
import { MAX_CONDITIONS, SET_SIZE } from '../constants.js';
import { encodeClaimValue, type ClaimInput } from '../encoding/claims.js';
import { claimLabel, getClaim, getSchema, schemaIdBytes, schemaRule, type ClaimDefinition, type CredentialSchema } from '../schemas/index.js';
import { PolicyInputError } from './input-error.js';
import { offGridBounds, slotVerdict } from './evaluate.js';
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

const assertProtectedClaims = (schema: CredentialSchema, policy: Policy): void => {
  const rule = schemaRule(schema);
  const [offGrid] = offGridBounds(policy, rule);
  if (offGrid) {
    const claim = schema.claims.find((c) => c.slot === offGrid.slot)!;
    throw new PolicyInputError(
      'protectedOffGrid',
      `${claimLabel(claim, 'en')} is protected: bounds must be multiples of ${offGrid.step}`,
      claim.key,
      Number(offGrid.step),
    );
  }
  for (const claim of schema.claims) {
    const verdict = slotVerdict(policy, rule, claim.slot);
    if (verdict === 'ok') continue;
    const label = claimLabel(claim, 'en');
    const width = claim.sensitive?.minWidth ?? 0;
    switch (verdict) {
      case 'exact':
        throw new PolicyInputError('protectedExact', `${label} is protected: ask for a range, not a single value`, claim.key, null);
      case 'revealed':
        throw new PolicyInputError('protectedRevealed', `${label} is protected and cannot be revealed`, claim.key, null);
      case 'tooNarrow':
        throw new PolicyInputError('protectedTooNarrow', `${label} is protected: the allowed range must be at least ${width} wide`, claim.key, width);
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
  const policy: Policy = {
    schemaId: schemaIdBytes(schema),
    conditions: [...conditions, ...Array.from({ length: MAX_CONDITIONS - conditions.length }, ignoredCondition)],
    revealSlot,
  };
  assertProtectedClaims(schema, policy);
  return policy;
};

// 만 나이: someone is at least `age` on `referenceDate` exactly when they were born on or
// before the same calendar day `age` years earlier. For a 29 February that does not exist in
// the target year, the latest qualifying birth date is 28 February.
export const latestBirthDateForAge = (referenceDate: string, age: number): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(referenceDate);
  if (!m) throw new Error(`Expected YYYY-MM-DD, got ${referenceDate}`);
  if (!Number.isInteger(age) || age < 0) throw new Error('Age must be a non-negative integer');
  const year = Number(m[1]) - age;
  let day = Number(m[3]);
  const month = Number(m[2]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) day = daysInMonth;
  return `${String(year).padStart(4, '0')}-${m[2]}-${String(day).padStart(2, '0')}`;
};

export const minimumAgeCondition = (referenceDate: string, age: number): ConditionInput => ({
  claim: 'birthDate',
  op: 'lte',
  value: latestBirthDateForAge(referenceDate, age),
});
