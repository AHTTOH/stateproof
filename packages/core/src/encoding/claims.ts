// Claim values <-> Uint<64> slots, driven by the schema definition.
import { CLAIM_SLOTS, MAX_CLAIM_VALUE, SECONDS_PER_DAY } from '../constants.js';
import type { ClaimDefinition, CredentialSchema } from '../schemas/index.js';

export type ClaimInput = string | number;
export type CredentialSubject = Readonly<Record<string, ClaimInput>>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const dateToDays = (isoDate: string): bigint => {
  if (!ISO_DATE.test(isoDate)) throw new Error(`Expected YYYY-MM-DD, got ${isoDate}`);
  const ms = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new Error(`Invalid date ${isoDate}`);
  if (ms < 0) throw new Error(`Dates before 1970-01-01 are not supported: ${isoDate}`);
  return BigInt(ms / 1000 / SECONDS_PER_DAY);
};

export const daysToDate = (days: bigint): string =>
  new Date(Number(days) * SECONDS_PER_DAY * 1000).toISOString().slice(0, 10);

const checkRange = (claim: ClaimDefinition, value: bigint): bigint => {
  if (value < 0n || value > MAX_CLAIM_VALUE) throw new Error(`${claim.key}: ${value} outside Uint<64>`);
  return value;
};

export const encodeClaimValue = (claim: ClaimDefinition, input: ClaimInput): bigint => {
  switch (claim.type) {
    case 'enum': {
      const codes = claim.codes ?? {};
      const code = codes[String(input)];
      if (code === undefined) {
        throw new Error(`${claim.key}: "${input}" is not one of ${Object.keys(codes).join(', ')}`);
      }
      return BigInt(code);
    }
    case 'integer': {
      const n = typeof input === 'number' ? input : Number(input);
      if (!Number.isSafeInteger(n)) throw new Error(`${claim.key}: "${input}" is not an integer`);
      return checkRange(claim, BigInt(n));
    }
    case 'date':
      return checkRange(claim, dateToDays(String(input)));
  }
};

export const decodeClaimValue = (claim: ClaimDefinition, value: bigint): string => {
  switch (claim.type) {
    case 'enum': {
      const entry = Object.entries(claim.codes ?? {}).find(([, code]) => BigInt(code) === value);
      if (!entry) throw new Error(`${claim.key}: code ${value} not in schema`);
      return entry[0];
    }
    case 'integer':
      return value.toString();
    case 'date':
      return daysToDate(value);
  }
};

// Unused slots are zero: the schema, not the value, says which slots carry meaning,
// and the policy validator refuses conditions on slots the schema does not define.
export const encodeSubject = (schema: CredentialSchema, subject: CredentialSubject): bigint[] => {
  const slots = Array<bigint>(CLAIM_SLOTS).fill(0n);
  for (const claim of schema.claims) {
    const input = subject[claim.key];
    if (input === undefined) throw new Error(`${schema.id}: subject is missing ${claim.key}`);
    slots[claim.slot] = encodeClaimValue(claim, input);
  }
  const extra = Object.keys(subject).filter((k) => !schema.claims.some((c) => c.key === k));
  if (extra.length > 0) throw new Error(`${schema.id}: unknown claims ${extra.join(', ')}`);
  return slots;
};

export const decodeSubject = (schema: CredentialSchema, slots: readonly bigint[]): Record<string, string> =>
  Object.fromEntries(schema.claims.map((claim) => [claim.key, decodeClaimValue(claim, slots[claim.slot])]));
