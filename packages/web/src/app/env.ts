// Build-time and repo-level configuration. Missing values surface as errors, never defaults.
import networks from '../../../../config/networks.json';
import deployments from '../../../../config/deployments.json';
import issuers from '../../../../config/issuers.json';
import demoRequests from '../../../../config/demo-requests.json';
import { TRANSLATED_LOCALES, type Locale, type TranslatedLocale } from '@stateproof/core/locale';

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
  readonly i18n: Readonly<Record<TranslatedLocale, { readonly name: string }>>;
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

// Every issuer needs a display name in every translated locale; a gap fails at startup.
const withNames = (list: readonly IssuerInfo[]): readonly IssuerInfo[] => {
  for (const issuer of list) {
    for (const locale of TRANSLATED_LOCALES) {
      if (!issuer.i18n?.[locale]?.name) throw new Error(`${issuer.id} has no ${locale} name in config/issuers.json`);
    }
  }
  return list;
};

export const ISSUERS: readonly IssuerInfo[] = withNames((issuers as { issuers: IssuerInfo[] }).issuers);

export const issuerName = (issuer: IssuerInfo, locale: Locale): string => (locale === 'en' ? issuer.name : issuer.i18n[locale].name);

export const issuerInfo = (id: string): IssuerInfo => {
  const entry = ISSUERS.find((i) => i.id === id);
  if (!entry) throw new Error(`Issuer ${id} is not in config/issuers.json`);
  return entry;
};

export type LocalizedText = Readonly<Record<Locale, string>>;

export interface DemoRequest {
  readonly requestId: string;
  readonly title: LocalizedText;
}

export interface PendingDemoRequest extends DemoRequest {
  readonly label: LocalizedText;
  readonly conditions: Readonly<Record<Locale, readonly string[]>>;
  // Label of the one value the request asks to see, or null when it asks for none.
  readonly reveals: LocalizedText | null;
}

export interface DemoRequests {
  // The request and demo persona the home page uses to show the seal line.
  readonly preview: { readonly requestId: string; readonly personaId: string };
  readonly pending: readonly PendingDemoRequest[];
  readonly verified: readonly DemoRequest[];
}

// Requests created for reviewers (config/demo-requests.json). null means none on this
// network; the home page then shows that state instead of links.
export const demoRequestsFor = (): DemoRequests | null =>
  (demoRequests as Record<string, DemoRequests | undefined>)[NETWORK] ?? null;

export const zkBaseUrl = (): string => new URL(`${import.meta.env.BASE_URL}${__STATEPROOF_ZK_ROUTE__}/`, window.location.origin).toString();

export const explorerTxUrl = (txHash: string): string => `${networkEndpoints().explorer}/transactions/${txHash}`;

export const explorerContractUrl = (address: string): string => `${networkEndpoints().explorer}/contracts/${address}`;
