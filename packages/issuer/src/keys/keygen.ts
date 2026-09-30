// Issuer key generation, one key per (issuer, schema) registration.
// The public key goes to config/issuers.json, the secret scalar is appended to the repo .env
// under the entry's secretEnv. .env is git-ignored; the secret is never printed.
import { appendFile, readFile } from 'node:fs/promises';
import { generateIssuerKeyPair } from '@stateproof/contract';
import { bigintToHex, publicKeyToJson } from '@stateproof/core';
import { ENV_FILE, ISSUERS_FILE, findIssuer, loadRegistry, saveRegistry, updateIssuer } from '../registry.js';

const readEnvFile = async (file: string): Promise<string> => {
  try {
    return await readFile(file, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw e;
  }
};

export interface KeygenPaths {
  readonly issuersFile: string;
  readonly envFile: string;
}

export const keygen = async (issuerId: string, paths: KeygenPaths = { issuersFile: ISSUERS_FILE, envFile: ENV_FILE }): Promise<string> => {
  const registry = await loadRegistry(paths.issuersFile);
  const entry = findIssuer(registry, issuerId);
  const env = await readEnvFile(paths.envFile);
  if (new RegExp(`^${entry.secretEnv}=.+`, 'm').test(env)) {
    throw new Error(`${entry.secretEnv} already exists in .env. Remove it first to replace the key (re-register the issuer afterwards).`);
  }
  const keyPair = generateIssuerKeyPair();
  await appendFile(paths.envFile, `${env === '' || env.endsWith('\n') ? '' : '\n'}${entry.secretEnv}=${bigintToHex(keyPair.secretScalar)}\n`);
  // A new key starts a new registration, so the epoch starts at 0 again.
  await saveRegistry(updateIssuer(registry, issuerId, { publicKey: publicKeyToJson(keyPair.publicKey), epoch: 0 }), paths.issuersFile);
  return `${issuerId} (${entry.schema}, slot ${entry.slot}): public key written to config/issuers.json, secret appended to .env as ${entry.secretEnv}`;
};
