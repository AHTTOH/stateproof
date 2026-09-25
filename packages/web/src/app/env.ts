// Build-time and repo-level configuration. Missing values surface as errors, never defaults.
import networks from '../../../../config/networks.json';
import deployments from '../../../../config/deployments.json';
import issuers from '../../../../config/issuers.json';

declare const __STATEPROOF_NETWORK__: string;
declare const __STATEPROOF_ZK_ROUTE__: string;

export interface NetworkEndpoints {
  readonly networkId: string;
  readonly indexer: string;
  readonly indexerWS: string;
  readonly explorer: string;
  readonly faucet: string;
}

export interface IssuerInfo {
  readonly id: string;
  readonly name: string;
  readonly schemas: readonly string[];
  readonly publicKey: { readonly x: string; readonly y: string } | null;
}

export const NETWORK: string = __STATEPROOF_NETWORK__;

export const networkEndpoints = (): NetworkEndpoints => {
  const entry = (networks as Record<string, unknown>)[NETWORK] as NetworkEndpoints | undefined;
  if (!entry) throw new Error(`Network ${NETWORK} is not in config/networks.json`);
  return entry;
};

// null means "not deployed on this network yet"; pages show that state explicitly.
export const contractAddress = (): string | null => {
  const record = (deployments as Record<string, { contractAddress?: string }>)[NETWORK];
  return record?.contractAddress ?? null;
};

export const requireContractAddress = (): string => {
  const address = contractAddress();
  if (address === null) throw new Error(`StateProof is not deployed on ${NETWORK} yet (config/deployments.json)`);
  return address;
};

export const ISSUERS: readonly IssuerInfo[] = (issuers as { issuers: IssuerInfo[] }).issuers;

export const issuerInfo = (id: string): IssuerInfo => {
  const entry = ISSUERS.find((i) => i.id === id);
  if (!entry) throw new Error(`Issuer ${id} is not in config/issuers.json`);
  return entry;
};

export const zkBaseUrl = (): string => new URL(`${import.meta.env.BASE_URL}${__STATEPROOF_ZK_ROUTE__}/`, window.location.origin).toString();

export const explorerTxUrl = (txHash: string): string => `${networkEndpoints().explorer}/transactions/${txHash}`;

export const explorerContractUrl = (address: string): string => `${networkEndpoints().explorer}/contracts/${address}`;
