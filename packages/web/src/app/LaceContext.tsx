import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { DeployedStateProof, StateProofProviders } from '@stateproof/contract';
import { NETWORK, requireContractAddress } from './env';

export interface WalletConnection {
  readonly api: ConnectedAPI;
  readonly providers: StateProofProviders;
}

export interface WalletSession extends WalletConnection {
  readonly contract: DeployedStateProof;
}

interface LaceState {
  readonly session: WalletSession | null;
  readonly connecting: boolean;
  readonly error: string | null;
  // Wallet + providers only; used by operator tools before a contract exists.
  connectWallet(): Promise<WalletConnection>;
  // Wallet + providers + the deployed StateProof contract from config/deployments.json.
  connect(): Promise<WalletSession>;
}

const LaceContext = createContext<LaceState | null>(null);

// Lace locks itself after idle time; a cached connection is only reused while it still answers.
const stillConnected = async (c: WalletConnection): Promise<boolean> => {
  try {
    return (await c.api.getConnectionStatus()).status === 'connected';
  } catch {
    return false;
  }
};

export const LaceProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [session, setSession] = useState<WalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setConnecting(true);
    setError(null);
    try {
      return await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectWallet = useCallback(async (): Promise<WalletConnection> => {
    if (wallet && (await stillConnected(wallet))) return wallet;
    setWallet(null);
    setSession(null);
    return track(async () => {
      // Loaded on demand: the wallet stack (ledger WASM) is only needed once someone transacts.
      const [{ connectLace }, { walletProviders }] = await Promise.all([import('../providers/lace'), import('../providers/midnight')]);
      const api = await connectLace(NETWORK);
      const next = { api, providers: await walletProviders(api) };
      setWallet(next);
      return next;
    });
  }, [wallet, track]);

  const connect = useCallback(async (): Promise<WalletSession> => {
    if (session && (await stillConnected(session))) return session;
    const base = await connectWallet();
    return track(async () => {
      const { joinStateProof, emptyPrivateState } = await import('@stateproof/contract');
      const contract = await joinStateProof(base.providers, requireContractAddress(), emptyPrivateState());
      const next = { ...base, contract };
      setSession(next);
      return next;
    });
  }, [session, connectWallet, track]);

  const value = useMemo(() => ({ session, connecting, error, connectWallet, connect }), [session, connecting, error, connectWallet, connect]);
  return <LaceContext.Provider value={value}>{children}</LaceContext.Provider>;
};

export const useLace = (): LaceState => {
  const ctx = useContext(LaceContext);
  if (!ctx) throw new Error('useLace outside LaceProvider');
  return ctx;
};
