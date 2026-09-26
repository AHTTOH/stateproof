// Builds the exact submitProof transaction a holder would send and proves it in the
// browser, without a wallet and without submitting. Throwaway Zswap keys stand in for the
// wallet's public keys; nothing is balanced, signed or broadcast.
import { createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { ZswapSecretKeys } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
  CompiledStateProofContract,
  STATEPROOF_PRIVATE_STATE_ID,
  holderPrivateState,
  type HolderProofInputs,
  type StateProofCircuitId,
  type StateProofPrivateState,
} from '@stateproof/contract';
import { randomBytes32 } from '@stateproof/core';
import { requireContractAddress, zkBaseUrl } from '../app/env';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';
import { publicDataProvider } from './midnight';
import { workerProofProvider } from './workerProving';

export interface DryRunResult {
  readonly proveMs: number;
  readonly txBytes: number;
}

export const dryRunProof = async (requestId: Uint8Array, inputs: HolderProofInputs): Promise<DryRunResult> => {
  const address = requireContractAddress();
  const base = zkBaseUrl();
  const keys = ZswapSecretKeys.fromSeed(randomBytes32());
  const privateStateProvider = inMemoryPrivateStateProvider<typeof STATEPROOF_PRIVATE_STATE_ID, StateProofPrivateState>();
  privateStateProvider.setContractAddress(address);
  await privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, holderPrivateState(inputs));

  const unproven = await createUnprovenCallTx(
    {
      zkConfigProvider: new FetchZkConfigProvider<StateProofCircuitId>(base, fetch.bind(window)),
      publicDataProvider: publicDataProvider(),
      privateStateProvider,
      walletProvider: {
        getCoinPublicKey: () => keys.coinPublicKey,
        getEncryptionPublicKey: () => keys.encryptionPublicKey,
        balanceTx: () => Promise.reject(new Error('A dry run never balances or submits a transaction')),
      },
    },
    {
      compiledContract: CompiledStateProofContract,
      contractAddress: address,
      circuitId: 'submitProof',
      privateStateId: STATEPROOF_PRIVATE_STATE_ID,
      args: [requestId],
    },
  );

  const started = performance.now();
  const proven = await workerProofProvider(base).proveTx(unproven.private.unprovenTx);
  return { proveMs: Math.round(performance.now() - started), txBytes: proven.serialize().length };
};
