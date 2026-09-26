// Midnight.js providers for the CLI: WASM proving from local files, level private state.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { WebSocket } from 'ws';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { StateProofCircuitId, StateProofPrivateState, StateProofPrivateStateId, StateProofProviders } from '@stateproof/contract';
import { createWasmProofProvider, midnightKeyUrls, paramsUrl, type KeyMaterialSource } from '@stateproof/contract/proving';
import { CONTRACT_MANAGED_DIR, type CliConfig } from './config.js';
import type { Logger } from './logger.js';
import type { OperatorWallet } from './wallet.js';

// Apollo (indexer client) expects a global WebSocket in Node.
(globalThis as { WebSocket?: unknown }).WebSocket = WebSocket;

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
};

const cachedFetch = async (cacheDir: string, name: string, url: string, logger: Logger): Promise<Uint8Array> => {
  const file = path.join(cacheDir, name);
  try {
    return new Uint8Array(await readFile(file));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  logger.info(`Downloading ${url}`);
  const bytes = await fetchBytes(url);
  await mkdir(cacheDir, { recursive: true });
  await writeFile(file, bytes);
  return bytes;
};

export const nodeKeyMaterialSource = (config: CliConfig, logger: Logger): KeyMaterialSource => {
  const zk = new NodeZkConfigProvider<StateProofCircuitId>(CONTRACT_MANAGED_DIR);
  const { zkArtifacts, midnightKeyVersion } = config.network;
  return {
    circuitKeys: async (id) => {
      const cfg = await zk.get(id as StateProofCircuitId);
      return { proverKey: cfg.proverKey, verifierKey: cfg.verifierKey, ir: cfg.zkir };
    },
    midnightKeys: async (location) => {
      const urls = midnightKeyUrls(zkArtifacts, midnightKeyVersion, location);
      const stem = location.replaceAll('/', '_');
      return {
        proverKey: await cachedFetch(config.zkParamsCacheDir, `${stem}.prover`, urls.prover, logger),
        verifierKey: await cachedFetch(config.zkParamsCacheDir, `${stem}.verifier`, urls.verifier, logger),
        ir: await cachedFetch(config.zkParamsCacheDir, `${stem}.bzkir`, urls.ir, logger),
      };
    },
    params: (k) => cachedFetch(config.zkParamsCacheDir, `bls_midnight_2p${k}`, paramsUrl(zkArtifacts, k), logger),
  };
};

export const buildProviders = (config: CliConfig, wallet: OperatorWallet, logger: Logger): StateProofProviders => {
  setNetworkId(config.network.networkId);
  return {
    privateStateProvider: levelPrivateStateProvider<StateProofPrivateStateId, StateProofPrivateState>({
      midnightDbName: path.join(config.privateStateDir, 'midnight-level-db'),
      privateStateStoreName: 'stateproof-private-state',
      signingKeyStoreName: 'stateproof-signing-keys',
      privateStoragePasswordProvider: () => config.privateStatePassword,
      accountId: config.operatorSeed,
    }),
    publicDataProvider: indexerPublicDataProvider(config.network.indexer, config.network.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider<StateProofCircuitId>(CONTRACT_MANAGED_DIR),
    proofProvider: createWasmProofProvider(nodeKeyMaterialSource(config, logger)),
    walletProvider: wallet.provider,
    midnightProvider: {
      // A rejected submission must hand its DUST coin back: without revert the wallet keeps
      // treating the coin as spent and the balance silently shrinks (seen on Preprod 2026-09-26).
      submitTx: async (tx) => {
        try {
          return await wallet.provider.submitTx(tx);
        } catch (e) {
          await wallet.provider.wallet.revertTransaction(tx);
          logger.warn('Submission rejected; reverted the transaction in the wallet so its DUST coin is spendable again');
          throw e;
        }
      },
    },
  };
};
