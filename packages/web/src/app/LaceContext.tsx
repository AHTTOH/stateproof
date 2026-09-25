import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { joinStateProof, emptyPrivateState, type DeployedStateProof, type StateProofProviders } from '@stateproof/contract';
import { connectLace } from '../providers/lace';
import { walletProviders } from '../providers/midnight';
import { NETWORK, requireContractAddress } from './env';

export interface WalletSession {
  readonly api: ConnectedAPI;
  readonly providers: StateProofProviders;
  readonly contract: DeployedStateProof;
}

interface LaceState {
  readonly session: WalletSession | null;
  readonly connecting: boolean;
  readonly error: string | null;
  connect(): Promise<WalletSession>;
}

const LaceContext = createContext<LaceState | null>(null);

export const LaceProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (): Promise<WalletSession> => {
    if (session) return session;
    setConnecting(true);
    setError(null);
    try {
      const api = await connectLace(NETWORK);
      const providers = await walletProviders(api);
      const contract = await joinStateProof(providers, requireContractAddress(), emptyPrivateState());
      const next = { api, providers, contract };
      setSession(next);
      return next;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setConnecting(false);
    }
  }, [session]);

  const value = useMemo(() => ({ session, connecting, error, connect }), [session, connecting, error, connect]);
  return <LaceContext.Provider value={value}>{children}</LaceContext.Provider>;
};

export const useLace = (): LaceState => {
  const ctx = useContext(LaceContext);
  if (!ctx) throw new Error('useLace outside LaceProvider');
  return ctx;
};
