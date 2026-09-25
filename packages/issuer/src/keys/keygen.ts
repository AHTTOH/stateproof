// Issuer key generation: public key to config/issuers.json, secret to the repo .env.
import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { generateIssuerKeyPair } from '@stateproof/contract';
import { bigintToHex, publicKeyToJson } from '@stateproof/core';
import { REPO_ROOT, findIssuer, loadRegistry, saveRegistry } from '../registry.js';

export const ENV_FILE = path.join(REPO_ROOT, '.env');

const readEnvFile = async (): Promise<string> => {
  try {
    return await readFile(ENV_FILE, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw e;
  }
};

export const keygen = async (issuerId: string): Promise<string> => {
  const registry = await loadRegistry();
  const entry = findIssuer(registry, issuerId);
  const env = await readEnvFile();
  if (new RegExp(`^${entry.secretEnv}=.+`, 'm').test(env)) {
    throw new Error(`${entry.secretEnv} already exists in .env. Remove it first to rotate the key.`);
  }
  const keyPair = generateIssuerKeyPair();
  await appendFile(ENV_FILE, `${env === '' || env.endsWith('\n') ? '' : '\n'}${entry.secretEnv}=${bigintToHex(keyPair.secretScalar)}\n`);
  await saveRegistry({
    ...registry,
    issuers: registry.issuers.map((i) => (i.id === issuerId ? { ...i, publicKey: publicKeyToJson(keyPair.publicKey) } : i)),
  });
  return `${issuerId}: public key written to config/issuers.json, secret appended to .env as ${entry.secretEnv}`;
};
