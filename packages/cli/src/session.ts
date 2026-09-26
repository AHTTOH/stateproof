// Shared lifecycle for CLI commands: open wallet -> build providers -> run -> save state.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { StateProofProviders } from '@stateproof/contract';
import { REPO_ROOT, loadCliConfig, type CliConfig } from './config.js';
import { createLogger, type Logger } from './logger.js';
import { buildProviders } from './providers.js';
import { openOperatorWallet, type OperatorWallet } from './wallet.js';

export interface Session {
  readonly config: CliConfig;
  readonly logger: Logger;
  readonly providers: StateProofProviders;
  readonly wallet: OperatorWallet;
}

export const runSession = async (name: string, body: (session: Session) => Promise<void>): Promise<void> => {
  const config = loadCliConfig();
  const logger = createLogger();
  logger.info(`${name} on ${config.network.networkId}`);
  const wallet = await openOperatorWallet(config, logger);
  try {
    await body({ config, logger, wallet, providers: buildProviders(config, wallet, logger) });
  } finally {
    await wallet.stop();
  }
};

// True when the module is the script being run (tsx src/x.ts), false when imported.
export const isMain = (moduleUrl: string): boolean =>
  process.argv[1] !== undefined && path.resolve(fileURLToPath(moduleUrl)) === path.resolve(process.argv[1]);

export const exitOnError = (promise: Promise<void>): void => {
  promise.then(
    () => process.exit(0),
    (error: unknown) => {
      process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
      process.exit(1);
    },
  );
};

// Public deployment record, read by the web app and the README.
export interface DeploymentRecord {
  readonly contractAddress: string;
  readonly deployedAt: string;
  readonly deployTxHash: string;
  readonly compiler: string;
}

const DEPLOYMENTS_FILE = path.join(REPO_ROOT, 'config', 'deployments.json');

export const readDeployments = async (): Promise<Record<string, DeploymentRecord>> => {
  try {
    return JSON.parse(await readFile(DEPLOYMENTS_FILE, 'utf8')) as Record<string, DeploymentRecord>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw e;
  }
};

export const requireDeployment = async (networkId: string): Promise<DeploymentRecord> => {
  const record = (await readDeployments())[networkId];
  if (!record) throw new Error(`No deployment for ${networkId} in config/deployments.json. Run the deploy command first.`);
  return record;
};

export const writeDeployment = async (networkId: string, record: DeploymentRecord): Promise<void> => {
  const all = await readDeployments();
  await writeFile(DEPLOYMENTS_FILE, `${JSON.stringify({ ...all, [networkId]: record }, null, 2)}\n`, 'utf8');
};
