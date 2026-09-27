// Midnight Lace connection through the DApp Connector API 4.x.
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';
import semver from 'semver';

const COMPATIBLE_CONNECTOR_API = '4.x';
const DISCOVERY_TIMEOUT_MS = 3_000;
const DISCOVERY_POLL_MS = 100;

const findWallet = (): InitialAPI | null => {
  const wallets = window.midnight ? Object.values(window.midnight) : [];
  const match = wallets.find(
    (w): w is InitialAPI =>
      !!w && typeof w === 'object' && 'apiVersion' in w && semver.satisfies(String(w.apiVersion), COMPATIBLE_CONNECTOR_API),
  );
  return match ?? null;
};

// Resolves once a compatible Lace is injected, or false after the discovery window.
export const detectLace = async (): Promise<boolean> => {
  const deadline = Date.now() + DISCOVERY_TIMEOUT_MS;
  while (findWallet() === null) {
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, DISCOVERY_POLL_MS));
  }
  return true;
};

const waitForWallet = async (): Promise<InitialAPI> => {
  const wallet = (await detectLace()) ? findWallet() : null;
  if (wallet === null) throw new Error('Midnight Lace was not found. Install the Lace extension and enable Midnight, then reload.');
  return wallet;
};

export const connectLace = async (networkId: string): Promise<ConnectedAPI> => {
  const wallet = await waitForWallet();
  const api = await wallet.connect(networkId);
  const status = await api.getConnectionStatus();
  if (status.status !== 'connected') throw new Error(`Lace is not connected (${status.status}). Unlock it and try again.`);
  return api;
};
