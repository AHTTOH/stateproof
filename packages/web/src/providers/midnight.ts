// Providers for the browser. Circuit proofs are generated here with the zkir WASM prover;
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
import { createWasmProofProvider, type KeyMaterialSource } from '@stateproof/contract/proving';
import { fromHex, toHex } from '@stateproof/core';
import { networkEndpoints, zkBaseUrl } from '../app/env';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider';

export const publicDataProvider = (): PublicDataProvider => {
  const net = networkEndpoints();
  return indexerPublicDataProvider(net.indexer, net.indexerWS);
};

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
};

const browserKeySource = (zk: FetchZkConfigProvider<StateProofCircuitId>, base: string): KeyMaterialSource => ({
  circuitKeys: async (id) => {
    const cfg = await zk.get(id as StateProofCircuitId);
    return { proverKey: cfg.proverKey, verifierKey: cfg.verifierKey, ir: cfg.zkir };
  },
  midnightKeys: (location) => Promise.reject(new Error(`${location} is proved by the wallet, not by this app`)),
  params: (k) => fetchBytes(new URL(`params/bls_midnight_2p${k}`, base).toString()),
});

export const walletProviders = async (api: ConnectedAPI): Promise<StateProofProviders> => {
  const base = zkBaseUrl();
  const zkConfigProvider = new FetchZkConfigProvider<StateProofCircuitId>(base, fetch.bind(window));
  const addresses = await api.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryPrivateStateProvider<'stateproofPrivateState', StateProofPrivateState>(),
    publicDataProvider: publicDataProvider(),
    zkConfigProvider,
    proofProvider: createWasmProofProvider(browserKeySource(zkConfigProvider, base)),
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
