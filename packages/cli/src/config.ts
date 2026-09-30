// CLI configuration: endpoints from config/networks.json, secrets and paths from .env.
//
// Preprod / preview: every value comes from .env and a missing one stops the command.
// undeployed (local devnet, infra/devnet): nothing secret exists, so the CLI uses the dev-preset
// genesis wallet seed published in config/networks.json, a throw-away private-state directory
// and a fixed devnet-only password. None of those values protect anything.
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const CONTRACT_MANAGED_DIR = path.join(REPO_ROOT, 'packages', 'contract', 'src', 'managed', 'stateproof');

export type ProverKind = 'wasm' | 'proof-server';

export interface NetworkConfig {
  readonly networkId: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  readonly nodeWS: string;
  readonly proofServer: string;
  readonly faucet: string | null;
  readonly explorer: string | null;
  readonly zkArtifacts: string;
  readonly midnightKeyVersion: number;
  // Who proves StateProof circuits. The public Preprod proof server refuses contract-circuit
  // bodies, so remote networks prove with the zkir-v2 WASM prover; the local devnet has its
  // own proof server.
  readonly prover: ProverKind;
  // Local devnet only: the pre-funded genesis wallet of the dev preset (public knowledge).
  readonly genesisWalletSeed?: string;
}

export interface CliConfig {
  readonly networkName: string;
  readonly network: NetworkConfig;
  readonly operatorSeed: string;
  // null: do not persist wallet sync state (local devnet: the chain is new on every start).
  readonly walletStateFile: string | null;
  readonly zkParamsCacheDir: string;
  readonly privateStateDir: string;
  readonly privateStatePassword: string;
  readonly prover: ProverKind;
}

const ENV_FILE = path.join(REPO_ROOT, '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
};

export const optionalEnv = (name: string): string | null => process.env[name] || null;

const REQUIRED_KEYS: readonly (keyof NetworkConfig)[] = [
  'networkId', 'indexer', 'indexerWS', 'node', 'nodeWS', 'proofServer', 'zkArtifacts', 'midnightKeyVersion', 'prover',
];

export const LOCAL_NETWORK = 'undeployed';
const DEVNET_PRIVATE_STATE_PASSWORD = 'StateProof-Devnet-Only-Password-1';

export const loadNetwork = (name: string): NetworkConfig => {
  const all = JSON.parse(readFileSync(path.join(REPO_ROOT, 'config', 'networks.json'), 'utf8')) as Record<string, unknown>;
  const entry = all[name] as Partial<NetworkConfig> | undefined;
  if (name.startsWith('$') || !entry || typeof entry !== 'object') throw new Error(`Network "${name}" is not in config/networks.json`);
  const missing = REQUIRED_KEYS.filter((k) => entry[k] === undefined || entry[k] === '');
  if (missing.length > 0) throw new Error(`config/networks.json ${name} is missing ${missing.join(', ')}`);
  if (entry.prover !== 'wasm' && entry.prover !== 'proof-server') throw new Error(`config/networks.json ${name}: prover must be wasm or proof-server`);
  return { faucet: null, explorer: null, ...entry } as NetworkConfig;
};

// --network flag first, then STATEPROOF_NETWORK.
export const resolveNetworkName = (flag: string | undefined): string => {
  const name = flag ?? process.env.STATEPROOF_NETWORK;
  if (!name) throw new Error('Choose a network with --network <undeployed|preprod|preview> or STATEPROOF_NETWORK');
  return name;
};

export const loadCliConfig = (networkName: string, options: { prover?: ProverKind } = {}): CliConfig => {
  const network = loadNetwork(networkName);
  const prover = options.prover ?? network.prover;
  if (networkName === LOCAL_NETWORK) {
    if (!network.genesisWalletSeed) throw new Error('config/networks.json undeployed needs genesisWalletSeed');
    return {
      networkName,
      network,
      operatorSeed: network.genesisWalletSeed,
      walletStateFile: null,
      zkParamsCacheDir: path.resolve(REPO_ROOT, optionalEnv('ZK_PARAMS_CACHE_DIR') ?? '.cache/zk-params'),
      privateStateDir: mkdtempSync(path.join(tmpdir(), 'stateproof-devnet-')),
      privateStatePassword: DEVNET_PRIVATE_STATE_PASSWORD,
      prover,
    };
  }
  return {
    networkName,
    network,
    operatorSeed: requireEnv('OPERATOR_WALLET_SEED'),
    walletStateFile: path.resolve(REPO_ROOT, requireEnv('WALLET_STATE_FILE')),
    zkParamsCacheDir: path.resolve(REPO_ROOT, requireEnv('ZK_PARAMS_CACHE_DIR')),
    privateStateDir: path.resolve(REPO_ROOT, requireEnv('PRIVATE_STATE_DIR')),
    privateStatePassword: requireEnv('PRIVATE_STATE_PASSWORD'),
    prover,
  };
};
