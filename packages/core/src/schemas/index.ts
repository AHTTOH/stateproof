// Schema registry. The JSON files are the single source for slot layout, labels
// and enum codes; the policy builder, encoder and UI all read from here.
import { CLAIM_SLOTS } from '../constants.js';
import { labelToBytes32 } from '../encoding/bytes.js';
import employment from './employment.json' with { type: 'json' };
import identity from './identity.json' with { type: 'json' };

export type ClaimType = 'enum' | 'integer' | 'date';

export interface ClaimDefinition {
  readonly key: string;
  readonly slot: number;
  readonly label: string;
  readonly type: ClaimType;
  readonly unit?: string;
  readonly codes?: Readonly<Record<string, number>>;
}

export interface CredentialSchema {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly label: string;
  readonly claims: readonly ClaimDefinition[];
}

const CLAIM_TYPES: readonly ClaimType[] = ['enum', 'integer', 'date'];

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
    if (claim.type === 'enum' && (!claim.codes || Object.keys(claim.codes).length === 0)) {
      throw new Error(`${raw.id}.${claim.key}: enum claim needs codes`);
    }
    slots.add(claim.slot);
    keys.add(claim.key);
  }
  labelToBytes32(raw.label);
  return raw;
};

export const SCHEMAS: readonly CredentialSchema[] = [
  validateSchema(employment as CredentialSchema),
  validateSchema(identity as CredentialSchema),
];

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

export const schemaIdBytes = (schema: CredentialSchema): Uint8Array => labelToBytes32(schema.label);

export const schemaByIdBytes = (id: Uint8Array): CredentialSchema => {
  const schema = SCHEMAS.find((s) => bytesEqual(schemaIdBytes(s), id));
  if (!schema) throw new Error('Unknown schema id on chain');
  return schema;
};

const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);
