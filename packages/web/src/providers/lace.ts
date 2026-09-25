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

const waitForWallet = async (): Promise<InitialAPI> => {
  const deadline = Date.now() + DISCOVERY_TIMEOUT_MS;
  for (;;) {
    const wallet = findWallet();
    if (wallet) return wallet;
    if (Date.now() > deadline) {
      throw new Error('Midnight Lace was not found. Install the Lace extension and enable Midnight, then reload.');
    }
    await new Promise((r) => setTimeout(r, DISCOVERY_POLL_MS));
  }
};

export const connectLace = async (networkId: string): Promise<ConnectedAPI> => {
  const wallet = await waitForWallet();
  const api = await wallet.connect(networkId);
  const status = await api.getConnectionStatus();
  if (status.status !== 'connected') throw new Error(`Lace is not connected (${status.status}). Unlock it and try again.`);
  return api;
};
