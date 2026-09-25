// Operator wallet with persisted sync state.
// A fresh Preprod sync takes hours (the DUST wallet replays ~1.5M events), so the
// serialized shielded / unshielded / DUST states are saved after every sync and
// restored on the next run. The state file holds no secrets beyond what the seed
// already gives, but it stays out of git (it is written to WALLET_STATE_FILE).
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as Rx from 'rxjs';
import { MidnightWalletProvider, WalletFactory, WalletSeeds, type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import {
  DustWallet,
  InMemoryTransactionHistoryStorage,
  ShieldedWallet,
  UnshieldedWallet,
  WalletEntrySchema,
  createKeystore,
  mergeWalletEntries,
} from '@midnight-ntwrk/wallet-sdk';
import { DustSecretKey, LedgerParameters, ZswapSecretKeys } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { CliConfig } from './config.js';
import type { Logger } from './logger.js';

const PROGRESS_LOG_INTERVAL_MS = 30_000;
const FEE_BLOCKS_MARGIN = 5;
const ADDITIONAL_FEE_OVERHEAD = 1_000n;

interface SavedWalletState {
  readonly savedAt: string;
  readonly networkId: string;
  readonly shielded: string;
  readonly unshielded: string;
  readonly dust: string;
}

export const toEnvironmentConfiguration = (config: CliConfig): EnvironmentConfiguration => ({
  walletNetworkId: config.network.networkId,
  networkId: config.network.networkId,
  indexer: config.network.indexer,
  indexerWS: config.network.indexerWS,
  node: config.network.node,
  nodeWS: config.network.nodeWS,
  faucet: config.network.faucet,
  proofServer: config.network.proofServer,
} as EnvironmentConfiguration);

const walletConfiguration = (env: EnvironmentConfiguration) => ({
  indexerClientConnection: { indexerHttpUrl: env.indexer, indexerWsUrl: env.indexerWS },
  provingServerUrl: new URL(env.proofServer),
  networkId: env.walletNetworkId,
  relayURL: new URL(env.nodeWS),
  txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries),
  costParameters: { feeBlocksMargin: FEE_BLOCKS_MARGIN },
});

const dustOptions = () => ({
  ledgerParams: LedgerParameters.initialParameters(),
  additionalFeeOverhead: ADDITIONAL_FEE_OVERHEAD,
  feeBlocksMargin: FEE_BLOCKS_MARGIN,
});

const readSavedState = async (file: string, networkId: string): Promise<SavedWalletState | null> => {
  if (!existsSync(file)) return null;
  const saved = JSON.parse(await readFile(file, 'utf8')) as SavedWalletState;
  if (saved.networkId !== networkId) throw new Error(`${file} belongs to ${saved.networkId}, not ${networkId}`);
  return saved;
};

export interface OperatorWallet {
  readonly provider: MidnightWalletProvider;
  saveState(): Promise<void>;
  stop(): Promise<void>;
}

export const openOperatorWallet = async (config: CliConfig, logger: Logger): Promise<OperatorWallet> => {
  const env = toEnvironmentConfiguration(config);
  const walletConfig = walletConfiguration(env);
  const seeds = WalletSeeds.fromMasterSeed(config.operatorSeed);
  const keystore = createKeystore(seeds.unshielded, env.walletNetworkId);
  const saved = await readSavedState(config.walletStateFile, env.walletNetworkId);
  const dust = dustOptions();

  logger.info(saved ? `Restoring wallet state saved at ${saved.savedAt}` : 'No saved wallet state: full sync from genesis (hours on Preprod)');
  const shielded = saved
    ? ShieldedWallet(walletConfig).restore(saved.shielded)
    : WalletFactory.createShieldedWallet(walletConfig, seeds.shielded);
  const unshielded = saved
    ? UnshieldedWallet(walletConfig).restore(saved.unshielded)
    : WalletFactory.createUnshieldedWallet(walletConfig, keystore);
  const dustWallet = saved
    ? DustWallet({ ...walletConfig, costParameters: dust }).restore(saved.dust)
    : WalletFactory.createDustWallet(walletConfig, seeds.dust, dust);
  const facade = await WalletFactory.createWalletFacade(walletConfig, shielded, unshielded, dustWallet);
  const provider = await MidnightWalletProvider.withWallet(
    logger,
    env,
    facade,
    ZswapSecretKeys.fromSeed(seeds.shielded),
    DustSecretKey.fromSeed(seeds.dust),
    keystore,
  );
  await provider.start(false);

  const saveState = async (): Promise<void> => {
    const state: SavedWalletState = {
      savedAt: new Date().toISOString(),
      networkId: env.walletNetworkId,
      shielded: await facade.shielded.serializeState(),
      unshielded: await facade.unshielded.serializeState(),
      dust: await facade.dust.serializeState(),
    };
    await mkdir(path.dirname(config.walletStateFile), { recursive: true });
    const tmp = `${config.walletStateFile}.tmp`;
    await writeFile(tmp, JSON.stringify(state));
    await rename(tmp, config.walletStateFile);
    logger.info(`Wallet state saved to ${config.walletStateFile}`);
  };

  await waitForSync(facade, logger);
  await saveState();
  return {
    provider,
    saveState,
    stop: async () => {
      await saveState();
      await provider.stop();
    },
  };
};

type Facade = MidnightWalletProvider['wallet'];

const isComplete = (progress: unknown): boolean =>
  typeof (progress as { isStrictlyComplete?: unknown })?.isStrictlyComplete === 'function' &&
  (progress as { isStrictlyComplete: () => boolean }).isStrictlyComplete();

const waitForSync = async (facade: Facade, logger: Logger): Promise<void> => {
  const started = Date.now();
  await Rx.firstValueFrom(
    facade.state().pipe(
      Rx.throttleTime(PROGRESS_LOG_INTERVAL_MS, undefined, { leading: true, trailing: true }),
      Rx.tap((s) => {
        const d = s.dust.state.progress as { appliedIndex?: unknown; highestRelevantWalletIndex?: unknown };
        logger.info(
          `sync ${Math.round((Date.now() - started) / 1000)}s: shielded=${isComplete(s.shielded.state.progress)} unshielded=${isComplete(s.unshielded.progress)} dust=${String(d.appliedIndex)}/${String(d.highestRelevantWalletIndex)}`,
        );
      }),
      Rx.filter((s) => isComplete(s.shielded.state.progress) && isComplete(s.unshielded.progress) && isComplete(s.dust.state.progress)),
    ),
  );
  logger.info(`Wallet synced in ${Math.round((Date.now() - started) / 1000)}s`);
};
