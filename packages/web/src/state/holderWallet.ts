// Holder credential wallet kept in this browser only (localStorage). Nothing here is sent
// anywhere: the credential becomes a private witness inside the proof.
import {
  CREDENTIAL_FORMAT,
  fromHex32,
  holderCommitOf,
  hexToBigint,
  publicKeyFromJson,
  toContractCredential,
  toContractSignature,
  verifyCredentialDocument,
  type CredentialDocument,
} from '@stateproof/core';
import type { HolderProofInputs } from '@stateproof/contract';
import { issuerInfo } from '../app/env';
import demo from './demo-personas.json';

const STORAGE_KEY = 'stateproof.holder.v1';

export interface HolderWallet {
  readonly label: string;
  readonly holderSecret: string;
  readonly credentials: readonly CredentialDocument[];
}

export interface DemoPersona {
  readonly id: string;
  readonly displayName: string;
  readonly holderSecret: string;
  readonly credentials: readonly CredentialDocument[];
}

export const DEMO_PERSONAS: readonly DemoPersona[] = (demo as unknown as { personas: DemoPersona[] }).personas;

export const loadHolderWallet = (): HolderWallet | null => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? null : (JSON.parse(raw) as HolderWallet);
};

const saveHolderWallet = (wallet: HolderWallet): HolderWallet => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
};

export const clearHolderWallet = (): void => window.localStorage.removeItem(STORAGE_KEY);

export const issuerSignatureValid = (doc: CredentialDocument): boolean => {
  const issuer = issuerInfo(doc.issuer.id);
  if (issuer.publicKey === null) throw new Error(`${issuer.id} has no published public key`);
  return verifyCredentialDocument(doc, publicKeyFromJson(issuer.publicKey));
};

const assertImportable = (wallet: HolderWallet, doc: CredentialDocument): void => {
  if (doc.format !== CREDENTIAL_FORMAT) throw new Error(`Unsupported credential format: ${String(doc.format)}`);
  if (!issuerSignatureValid(doc)) throw new Error('Issuer signature does not verify. The file was altered or the issuer is unknown.');
  if (hexToBigint(doc.binding.holderCommit) !== holderCommitOf(fromHex32(wallet.holderSecret))) {
    throw new Error('This credential is bound to a different holder secret.');
  }
};

export const adoptDemoPersona = (persona: DemoPersona): HolderWallet => {
  const wallet: HolderWallet = { label: persona.displayName, holderSecret: persona.holderSecret, credentials: persona.credentials };
  persona.credentials.forEach((doc) => assertImportable(wallet, doc));
  return saveHolderWallet(wallet);
};

export const importCredential = (wallet: HolderWallet, json: string): HolderWallet => {
  const doc = JSON.parse(json) as CredentialDocument;
  assertImportable(wallet, doc);
  return saveHolderWallet({ ...wallet, credentials: [...wallet.credentials, doc] });
};

export const proofInputs = (wallet: HolderWallet, doc: CredentialDocument): HolderProofInputs => ({
  credential: toContractCredential(doc),
  signature: toContractSignature(doc),
  holderSecret: fromHex32(wallet.holderSecret),
});

export const isExpired = (doc: CredentialDocument, at: Date): boolean => Date.parse(doc.expiresAt) <= at.getTime();
