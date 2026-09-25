// CLI configuration: endpoints from config/networks.json, secrets and paths from .env.
// Every value is required; nothing falls back to a default.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const CONTRACT_MANAGED_DIR = path.join(REPO_ROOT, 'packages', 'contract', 'src', 'managed', 'stateproof');

export interface NetworkConfig {
  readonly networkId: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly nodeWS: string;
  readonly proofServer: string;
  readonly faucet: string;
  readonly explorer: string;
  readonly zkArtifacts: string;
  readonly midnightKeyVersion: number;
}

export interface CliConfig {
  readonly network: NetworkConfig;
  readonly operatorSeed: string;
  readonly walletStateFile: string;
  readonly zkParamsCacheDir: string;
  readonly privateStateDir: string;
  readonly privateStatePassword: string;
}

const ENV_FILE = path.join(REPO_ROOT, '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
};

export const optionalEnv = (name: string): string | null => process.env[name] || null;

const NETWORK_KEYS: readonly (keyof NetworkConfig)[] = [
  'networkId', 'indexer', 'indexerWS', 'node', 'nodeWS', 'proofServer', 'faucet', 'explorer', 'zkArtifacts', 'midnightKeyVersion',
];

export const loadNetwork = (name: string): NetworkConfig => {
  const all = JSON.parse(readFileSync(path.join(REPO_ROOT, 'config', 'networks.json'), 'utf8')) as Record<string, unknown>;
  const entry = all[name] as Partial<NetworkConfig> | undefined;
  if (!entry || typeof entry !== 'object') throw new Error(`Network "${name}" is not in config/networks.json`);
  const missing = NETWORK_KEYS.filter((k) => entry[k] === undefined || entry[k] === '');
  if (missing.length > 0) throw new Error(`config/networks.json ${name} is missing ${missing.join(', ')}`);
  return entry as NetworkConfig;
};

export const loadCliConfig = (): CliConfig => ({
  network: loadNetwork(requireEnv('STATEPROOF_NETWORK')),
  operatorSeed: requireEnv('OPERATOR_WALLET_SEED'),
  walletStateFile: path.resolve(REPO_ROOT, requireEnv('WALLET_STATE_FILE')),
  zkParamsCacheDir: path.resolve(REPO_ROOT, requireEnv('ZK_PARAMS_CACHE_DIR')),
  privateStateDir: path.resolve(REPO_ROOT, requireEnv('PRIVATE_STATE_DIR')),
  privateStatePassword: requireEnv('PRIVATE_STATE_PASSWORD'),
});
