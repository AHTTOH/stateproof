// Demo issuer registry: public data lives in config/issuers.json, secrets only in .env.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IssuerPublicKeyJson } from '@stateproof/core';

export interface IssuerEntry {
  readonly id: string;
  readonly name: string;
  readonly schemas: readonly string[];
  readonly secretEnv: string;
  readonly publicKey: IssuerPublicKeyJson | null;
}

export interface IssuerRegistry {
  readonly $comment: string;
  readonly issuers: readonly IssuerEntry[];
}

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const ISSUERS_FILE = path.join(REPO_ROOT, 'config', 'issuers.json');

export const loadRegistry = async (): Promise<IssuerRegistry> =>
  JSON.parse(await readFile(ISSUERS_FILE, 'utf8')) as IssuerRegistry;

export const saveRegistry = async (registry: IssuerRegistry): Promise<void> =>
  writeFile(ISSUERS_FILE, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

export const findIssuer = (registry: IssuerRegistry, id: string): IssuerEntry => {
  const entry = registry.issuers.find((i) => i.id === id);
  if (!entry) throw new Error(`Issuer ${id} is not in config/issuers.json`);
  return entry;
};

export const issuerSecretHex = (entry: IssuerEntry): string => {
  const value = process.env[entry.secretEnv];
  if (!value) throw new Error(`${entry.secretEnv} is not set. Run "keygen --issuer ${entry.id}" and put the secret in .env`);
  return value;
};
