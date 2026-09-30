// Shared lifecycle for CLI commands: open wallet -> build providers -> run -> save state.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StateProofProviders } from '@stateproof/contract';
import { CONTRACT_MANAGED_DIR, REPO_ROOT, type CliConfig } from './config.js';
import { createLogger, type Logger } from './logger.js';
import { buildProviders, type ProvingMeter } from './providers.js';
import { openOperatorWallet, type OperatorWallet } from './wallet.js';

export interface Session {
  readonly config: CliConfig;
  readonly logger: Logger;
  readonly providers: StateProofProviders;
  readonly proving: ProvingMeter;
  readonly wallet: OperatorWallet;
}

export const runSession = async <T,>(name: string, config: CliConfig, body: (session: Session) => Promise<T>): Promise<T> => {
  const logger = createLogger();
  logger.info(`${name} on ${config.networkName} (${config.network.networkId})`);
  const wallet = await openOperatorWallet(config, logger);
  try {
    const { providers, proving } = buildProviders(config, wallet, logger);
    return await body({ config, logger, wallet, providers, proving });
  } finally {
    await wallet.stop();
  }
};

// The compiler that produced the committed artifacts, as recorded by compactc itself.
export const compilerVersion = async (): Promise<string> => {
  const info = JSON.parse(await readFile(path.join(CONTRACT_MANAGED_DIR, 'compiler', 'contract-info.json'), 'utf8')) as Record<string, unknown>;
  const version = info['compiler-version'];
  if (typeof version !== 'string') throw new Error('contract-info.json has no compiler-version');
  return version;
};

// Public deployment record, read by the web app and the README. Keyed by network name.
export interface DeploymentRecord {
  readonly contractVersion: 'v2';
  readonly contractAddress: string;
  readonly deployedAt: string;
  readonly deployTxId: string;
  readonly deployTxHash: string;
  readonly blockHeight: number;
  readonly compiler: string;
}

export const DEPLOYMENTS_FILE = path.join(REPO_ROOT, 'config', 'deployments.json');

export const readDeployments = async (): Promise<Record<string, DeploymentRecord>> => {
  try {
    return JSON.parse(await readFile(DEPLOYMENTS_FILE, 'utf8')) as Record<string, DeploymentRecord>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw e;
  }
};

export const requireDeployment = async (networkName: string): Promise<DeploymentRecord> => {
  const record = (await readDeployments())[networkName];
  if (!record) throw new Error(`No deployment for ${networkName} in config/deployments.json. Run the deploy command first.`);
  if (record.contractVersion !== 'v2') {
    throw new Error(`config/deployments.json ${networkName} is a v1 deployment; deploy v2 first (docs/runbook-preprod.md)`);
  }
  return record;
};

export const writeDeployment = async (networkName: string, record: DeploymentRecord): Promise<void> => {
  const all = await readDeployments();
  await writeFile(DEPLOYMENTS_FILE, `${JSON.stringify({ ...all, [networkName]: record }, null, 2)}\n`, 'utf8');
};

export const nowSeconds = (): bigint => BigInt(Math.floor(Date.now() / 1000));
