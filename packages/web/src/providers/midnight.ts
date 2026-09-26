// Providers for the browser. Circuit proofs are generated in a Web Worker with the zkir WASM prover;
// Lace only balances the transaction (DUST fees) and submits it.
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { PublicDataProvider, UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import {
  Binding,
  Proof,
  SignatureEnabled,
  Transaction,
  type FinalizedTransaction,
  type TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { StateProofCircuitId, StateProofPrivateState, StateProofProviders } from '@stateproof/contract';
import { fromHex, toHex } from '@stateproof/core';
import { networkEndpoints, zkBaseUrl } from '../app/env';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';
import { createWorkerProofProvider } from './workerProving';

// The provider defaults to isomorphic-ws, whose browser build has no named WebSocket
// export; without the browser's own WebSocket the tx-confirmation subscription never opens.
export const publicDataProvider = (): PublicDataProvider => {
  const net = networkEndpoints();
  return indexerPublicDataProvider(net.indexer, net.indexerWS, globalThis.WebSocket as unknown as Parameters<typeof indexerPublicDataProvider>[2]);
};

export const walletProviders = async (api: ConnectedAPI): Promise<StateProofProviders> => {
  const base = zkBaseUrl();
  const zkConfigProvider = new FetchZkConfigProvider<StateProofCircuitId>(base, fetch.bind(window));
  const addresses = await api.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryPrivateStateProvider<'stateproofPrivateState', StateProofPrivateState>(),
    publicDataProvider: publicDataProvider(),
    zkConfigProvider,
    proofProvider: createWorkerProofProvider(base),
    walletProvider: {
      getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
        const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>('signature', 'proof', 'binding', fromHex(balanced.tx));
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await api.submitTransaction(toHex(tx.serialize()));
        const [txId] = tx.identifiers();
        if (txId === undefined) throw new Error('Submitted transaction has no identifier');
        return txId;
      },
    },
  };
};
