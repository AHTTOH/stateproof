// Contract Policy struct -> what the holder and verifier read, in a display language.
import { Op, type Condition, type Policy } from '@stateproof/contract';
import { MAX_CLAIM_VALUE } from '../constants.js';
import { bytes32ToLabel } from '../encoding/bytes.js';
import { decodeClaimValue } from '../encoding/claims.js';
import type { Locale } from '../locale.js';
import { claimLabel, claimUnit, claimValueText, schemaByIdBytes, type ClaimDefinition, type CredentialSchema } from '../schemas/index.js';
import { operatorByOp } from './operators.js';
import { formatCondition, formatConditionValue, withUnit, type ConditionParts } from './phrases.js';

export interface PolicyDescription {
  readonly schema: CredentialSchema;
  readonly issuerId: string;
  readonly conditions: readonly string[];
  readonly revealed: string | null;
  readonly notDisclosed: readonly string[];
}

const claimAt = (schema: CredentialSchema, slot: bigint): ClaimDefinition => {
  const claim = schema.claims.find((c) => BigInt(c.slot) === slot);
  if (!claim) throw new Error(`Condition refers to slot ${slot}, not defined in ${schema.id}`);
  return claim;
};

const conditionParts = (claim: ClaimDefinition, condition: Condition, locale: Locale): ConditionParts => {
  const def = operatorByOp(condition.op);
  const unit = claimUnit(claim, locale);
  const show = (v: bigint) => withUnit(claimValueText(claim, decodeClaimValue(claim, v), locale), unit, locale);
  const raw = def.arity === 'one' ? [condition.value] : def.arity === 'two' ? [condition.value, condition.value2] : [...new Set(condition.set)];
  return { op: def.name, label: claimLabel(claim, locale), values: raw.map(show) };
};

export const describeCondition = (schema: CredentialSchema, condition: Condition, locale: Locale): string =>
  formatCondition(conditionParts(claimAt(schema, condition.claimIndex), condition, locale), locale);

// A successful proof tells the verifier a claim's exact value when the conditions on that
// slot, taken together, leave only one value (e.g. `eq`, or `>= 26` with `<= 26`).
const pinnedEnum = (claim: ClaimDefinition, conditions: readonly Condition[]): boolean => {
  const allowed = conditions.reduce<ReadonlySet<bigint>>((codes, c) => {
    switch (c.op) {
      case Op.eq:
        return new Set([...codes].filter((v) => v === c.value));
      case Op.neq:
        return new Set([...codes].filter((v) => v !== c.value));
      case Op.inSet:
        return new Set([...codes].filter((v) => c.set.includes(v)));
      default:
        return codes;
    }
  }, new Set(Object.values(claim.codes ?? {}).map(BigInt)));
  return allowed.size === 1;
};

const pinnedRange = (conditions: readonly Condition[]): boolean => {
  const range = conditions.reduce(
    (r, c) => {
      switch (c.op) {
        case Op.gte:
          return { ...r, low: r.low > c.value ? r.low : c.value };
        case Op.lte:
          return { ...r, high: r.high < c.value ? r.high : c.value };
        case Op.eq:
          return { low: r.low > c.value ? r.low : c.value, high: r.high < c.value ? r.high : c.value };
        case Op.between:
          return { low: r.low > c.value ? r.low : c.value, high: r.high < c.value2 ? r.high : c.value2 };
        default:
          return r;
      }
    },
    { low: 0n, high: MAX_CLAIM_VALUE },
  );
  const excluded = new Set(conditions.filter((c) => c.op === Op.neq).map((c) => c.value));
  let { low, high } = range;
  while (low <= high && excluded.has(low)) low += 1n;
  while (high >= low && excluded.has(high)) high -= 1n;
  return low === high;
};

const pinnedValue = (claim: ClaimDefinition, conditions: readonly Condition[]): boolean =>
  conditions.length > 0 && (claim.type === 'enum' ? pinnedEnum(claim, conditions) : pinnedRange(conditions));

const activeConditions = (policy: Policy): readonly Condition[] => policy.conditions.filter((c) => c.op !== Op.ignore);

const pinnedSlotsOf = (schema: CredentialSchema, active: readonly Condition[]): ReadonlySet<bigint> =>
  new Set(schema.claims.filter((claim) => pinnedValue(claim, active.filter((c) => c.claimIndex === BigInt(claim.slot)))).map((c) => BigInt(c.slot)));

// One entry per schema claim: what a successful proof tells the verifier about that claim.
export interface ClaimDisclosure {
  readonly claim: ClaimDefinition;
  readonly label: string;
  // Conditions on this claim without the label, e.g. "12개월 이상"; empty when none.
  readonly conditions: readonly string[];
  // The request asks to see this value itself.
  readonly revealed: boolean;
  // The conditions leave a single value, so success tells the verifier that value.
  readonly pinned: boolean;
}

export const claimDisclosures = (policy: Policy, locale: Locale): readonly ClaimDisclosure[] => {
  const schema = schemaByIdBytes(policy.schemaId);
  const active = activeConditions(policy);
  const pinned = pinnedSlotsOf(schema, active);
  return schema.claims.map((claim) => ({
    claim,
    label: claimLabel(claim, locale),
    conditions: active.filter((c) => c.claimIndex === BigInt(claim.slot)).map((c) => formatConditionValue(conditionParts(claim, c, locale), locale)),
    revealed: policy.revealSlot.is_some && policy.revealSlot.value === BigInt(claim.slot),
    pinned: pinned.has(BigInt(claim.slot)),
  }));
};

export const describePolicy = (policy: Policy, locale: Locale): PolicyDescription => {
  const schema = schemaByIdBytes(policy.schemaId);
  const active = activeConditions(policy);
  const revealedClaim = policy.revealSlot.is_some ? claimAt(schema, policy.revealSlot.value) : undefined;
  const pinnedSlots = pinnedSlotsOf(schema, active);
  return {
    schema,
    issuerId: bytes32ToLabel(policy.issuerId),
    conditions: active.map((c) => describeCondition(schema, c, locale)),
    revealed: revealedClaim ? claimLabel(revealedClaim, locale) : null,
    notDisclosed: schema.claims
      .filter((c) => c !== revealedClaim && !pinnedSlots.has(BigInt(c.slot)))
      .map((c) => claimLabel(c, locale)),
  };
};
