// Schema registry. The JSON files are the single source for slot layout, labels
// and enum codes; the policy builder, encoder and UI all read from here.
import { CLAIM_SLOTS } from '../constants.js';
import { labelToBytes32 } from '../encoding/bytes.js';
import { TRANSLATED_LOCALES, type Locale, type TranslatedLocale } from '../locale.js';
import { OPERATORS, type OperatorName } from '../policy/operators.js';
import type { SchemaRule } from '@stateproof/contract';
import career from './career.json' with { type: 'json' };
import youthWork from './youth-work.json' with { type: 'json' };

export type ClaimType = 'enum' | 'integer' | 'date';

export interface ClaimText {
  readonly label: string;
  readonly unit?: string;
  // Enum claims only: display text for every code name.
  readonly values?: Readonly<Record<string, string>>;
}

export interface ClaimDefinition {
  readonly key: string;
  readonly slot: number;
  readonly label: string;
  readonly type: ClaimType;
  readonly unit?: string;
  // Operators a verifier may use on this claim. Values recorded at issuance that only grow
  // afterwards (age, months employed) allow "at least" only, which stays true over time.
  readonly operators: readonly OperatorName[];
  readonly codes?: Readonly<Record<string, number>>;
  // Protected value (salary, birth date): verifiers may only ask for a range at least
  // minWidth wide. Enforced on chain by createRequest (SchemaRule) and mirrored here.
  readonly sensitive?: { readonly minWidth: number };
  readonly i18n: Readonly<Record<TranslatedLocale, ClaimText>>;
}

export interface CredentialSchema {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly i18n: Readonly<Record<TranslatedLocale, { readonly title: string }>>;
  readonly label: string;
  readonly claims: readonly ClaimDefinition[];
}

const CLAIM_TYPES: readonly ClaimType[] = ['enum', 'integer', 'date'];

// Every translated locale must cover the claim completely; a gap is a schema error, not English text.
const validateClaimText = (schemaId: string, claim: ClaimDefinition): void => {
  for (const locale of TRANSLATED_LOCALES) {
    const text = claim.i18n?.[locale];
    const where = `${schemaId}.${claim.key} (${locale})`;
    if (!text?.label) throw new Error(`${where}: label is required`);
    if ((claim.unit === undefined) !== (text.unit === undefined)) throw new Error(`${where}: unit must be given exactly when the claim has one`);
    if (claim.type === 'enum') {
      const missing = Object.keys(claim.codes ?? {}).filter((code) => !text.values?.[code]);
      if (missing.length > 0) throw new Error(`${where}: no text for ${missing.join(', ')}`);
    }
  }
};

export const validateSchema = (raw: CredentialSchema): CredentialSchema => {
  const slots = new Set<number>();
  const keys = new Set<string>();
  for (const claim of raw.claims) {
    if (!Number.isInteger(claim.slot) || claim.slot < 0 || claim.slot >= CLAIM_SLOTS) {
      throw new Error(`${raw.id}.${claim.key}: slot ${claim.slot} outside 0..${CLAIM_SLOTS - 1}`);
    }
    if (slots.has(claim.slot)) throw new Error(`${raw.id}: slot ${claim.slot} used twice`);
    if (keys.has(claim.key)) throw new Error(`${raw.id}: key ${claim.key} used twice`);
    if (!CLAIM_TYPES.includes(claim.type)) throw new Error(`${raw.id}.${claim.key}: unknown type ${claim.type}`);
    if (!Array.isArray(claim.operators) || claim.operators.length === 0) {
      throw new Error(`${raw.id}.${claim.key}: operators list is required`);
    }
    for (const name of claim.operators) {
      const def = OPERATORS.find((o) => o.name === name);
      if (!def) throw new Error(`${raw.id}.${claim.key}: unknown operator ${name}`);
      if (!def.claimTypes.includes(claim.type)) throw new Error(`${raw.id}.${claim.key}: operator ${name} does not apply to ${claim.type}`);
    }
    if (claim.type === 'enum' && (!claim.codes || Object.keys(claim.codes).length === 0)) {
      throw new Error(`${raw.id}.${claim.key}: enum claim needs codes`);
    }
    if (claim.sensitive) {
      const ranges: readonly OperatorName[] = ['gte', 'lte', 'between'];
      if (!Number.isInteger(claim.sensitive.minWidth) || claim.sensitive.minWidth < 1) {
        throw new Error(`${raw.id}.${claim.key}: sensitive.minWidth must be a positive integer`);
      }
      if (claim.type === 'enum') throw new Error(`${raw.id}.${claim.key}: enum claims cannot be sensitive`);
      const bad = claim.operators.filter((op) => !ranges.includes(op));
      if (bad.length > 0) throw new Error(`${raw.id}.${claim.key}: sensitive claims allow only ranges, not ${bad.join(', ')}`);
    }
    validateClaimText(raw.id, claim);
    slots.add(claim.slot);
    keys.add(claim.key);
  }
  for (const locale of TRANSLATED_LOCALES) {
    if (!raw.i18n?.[locale]?.title) throw new Error(`${raw.id} (${locale}): title is required`);
  }
  labelToBytes32(raw.label);
  return raw;
};

export const SCHEMAS: readonly CredentialSchema[] = [
  validateSchema(career as CredentialSchema),
  validateSchema(youthWork as CredentialSchema),
];

// On-chain form of the schema's protection rule, registered once with registerSchema.
export const schemaRule = (schema: CredentialSchema): SchemaRule => ({
  slots: Array.from({ length: CLAIM_SLOTS }, (_, slot) => {
    const claim = schema.claims.find((c) => c.slot === slot);
    return claim?.sensitive ? { sensitive: true, minWidth: BigInt(claim.sensitive.minWidth) } : { sensitive: false, minWidth: 0n };
  }),
});

export const sensitiveClaims = (schema: CredentialSchema): readonly ClaimDefinition[] =>
  schema.claims.filter((c) => c.sensitive !== undefined);

export const getSchema = (id: string): CredentialSchema => {
  const schema = SCHEMAS.find((s) => s.id === id);
  if (!schema) throw new Error(`Unknown credential schema: ${id}`);
  return schema;
};

export const getClaim = (schema: CredentialSchema, key: string): ClaimDefinition => {
  const claim = schema.claims.find((c) => c.key === key);
  if (!claim) throw new Error(`Schema ${schema.id} has no claim ${key}`);
  return claim;
};

export const schemaTitle = (schema: CredentialSchema, locale: Locale): string =>
  locale === 'en' ? schema.title : schema.i18n[locale].title;

export const claimLabel = (claim: ClaimDefinition, locale: Locale): string => (locale === 'en' ? claim.label : claim.i18n[locale].label);

// undefined exactly when the claim has no unit (validated above for every locale).
export const claimUnit = (claim: ClaimDefinition, locale: Locale): string | undefined =>
  locale === 'en' ? claim.unit : claim.i18n[locale].unit;

// Display text for a decoded value: enum code names are translated, dates and numbers are not.
export const claimValueText = (claim: ClaimDefinition, decoded: string, locale: Locale): string => {
  if (claim.type !== 'enum' || locale === 'en') return decoded;
  const text = claim.i18n[locale].values?.[decoded];
  if (text === undefined) throw new Error(`${claim.key}: no ${locale} text for ${decoded}`);
  return text;
};

export const schemaIdBytes = (schema: CredentialSchema): Uint8Array => labelToBytes32(schema.label);

export const schemaByIdBytes = (id: Uint8Array): CredentialSchema => {
  const schema = SCHEMAS.find((s) => bytesEqual(schemaIdBytes(s), id));
  if (!schema) throw new Error('Unknown schema id on chain');
  return schema;
};

const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);
