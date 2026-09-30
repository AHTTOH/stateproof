// Issuer registry (v2). Public data lives in config/issuers.json, signing secrets only in .env.
//
// One entry is one on-chain registration: registerIssuer(issuerId, schemaId, publicKey, slot).
// The contract maps an issuer id to exactly one schema, so an organisation that issues two
// schemas has two entries (two ids, two keys, two slots).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ISSUER_SLOTS, getSchema, labelToBytes32, type IssuerPublicKeyJson } from '@stateproof/core';

export interface IssuerEntry {
  // On-chain issuer id label (<= 32 bytes UTF-8), e.g. "issuer:acme-hr".
  readonly id: string;
  // Display name (English) and translations.
  readonly name: string;
  readonly i18n: { readonly ko: { readonly name: string } };
  // Schema id from packages/core/src/schemas (career | youth-work).
  readonly schema: string;
  // Leaf position in the issuer Merkle tree, 0..63, unique per contract.
  readonly slot: number;
  // Issuer epoch the next credentials are issued in. rotate-epoch increments it.
  readonly epoch: number;
  // Name of the .env variable holding the secret scalar (hex). Never the secret itself.
  readonly secretEnv: string;
  readonly publicKey: IssuerPublicKeyJson | null;
}

export interface IssuerRegistry {
  readonly $comment: string;
  readonly version: 2;
  readonly issuers: readonly IssuerEntry[];
}

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const ISSUERS_FILE = path.join(REPO_ROOT, 'config', 'issuers.json');
export const ENV_FILE = path.join(REPO_ROOT, '.env');

export const validateRegistry = (registry: IssuerRegistry): IssuerRegistry => {
  if (registry.version !== 2) throw new Error('config/issuers.json is not the v2 shape (version: 2)');
  const ids = new Set<string>();
  const slots = new Set<number>();
  const envs = new Set<string>();
  for (const entry of registry.issuers) {
    labelToBytes32(entry.id);
    getSchema(entry.schema);
    if (!entry.name || !entry.i18n?.ko?.name) throw new Error(`${entry.id}: name and i18n.ko.name are required`);
    if (!Number.isInteger(entry.slot) || entry.slot < 0 || entry.slot >= ISSUER_SLOTS) {
      throw new Error(`${entry.id}: slot ${entry.slot} outside 0..${ISSUER_SLOTS - 1}`);
    }
    if (!Number.isInteger(entry.epoch) || entry.epoch < 0) throw new Error(`${entry.id}: epoch must be a non-negative integer`);
    if (!/^[A-Z][A-Z0-9_]*$/.test(entry.secretEnv)) throw new Error(`${entry.id}: secretEnv must be an env variable name`);
    if (ids.has(entry.id)) throw new Error(`issuer id ${entry.id} used twice`);
    if (slots.has(entry.slot)) throw new Error(`slot ${entry.slot} used twice`);
    if (envs.has(entry.secretEnv)) throw new Error(`secretEnv ${entry.secretEnv} used twice`);
    ids.add(entry.id);
    slots.add(entry.slot);
    envs.add(entry.secretEnv);
  }
  return registry;
};

export const loadRegistry = async (file: string = ISSUERS_FILE): Promise<IssuerRegistry> =>
  validateRegistry(JSON.parse(await readFile(file, 'utf8')) as IssuerRegistry);

export const saveRegistry = async (registry: IssuerRegistry, file: string = ISSUERS_FILE): Promise<void> =>
  writeFile(file, `${JSON.stringify(validateRegistry(registry), null, 2)}\n`, 'utf8');

export const findIssuer = (registry: IssuerRegistry, id: string): IssuerEntry => {
  const entry = registry.issuers.find((i) => i.id === id);
  if (!entry) throw new Error(`Issuer ${id} is not in config/issuers.json`);
  return entry;
};

export const updateIssuer = (registry: IssuerRegistry, id: string, patch: Partial<Pick<IssuerEntry, 'epoch' | 'publicKey'>>): IssuerRegistry => {
  findIssuer(registry, id);
  return { ...registry, issuers: registry.issuers.map((i) => (i.id === id ? { ...i, ...patch } : i)) };
};

export const issuerSecretHex = (entry: IssuerEntry, env: NodeJS.ProcessEnv = process.env): string => {
  const value = env[entry.secretEnv];
  if (!value) throw new Error(`${entry.secretEnv} is not set. Run "keygen --issuer ${entry.id}" and keep the secret in .env`);
  return value;
};
