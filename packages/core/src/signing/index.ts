// Issuer and holder key material on top of the contract's Schnorr primitives.
import type { JubjubPoint } from '@midnight-ntwrk/compact-runtime';
import {
  issuerKeyPairFromScalar,
  pureCircuits,
  signCredential,
  verifyCredentialSignature,
  type IssuerKeyPair,
} from '@stateproof/contract';
import { bigintToHex, hexToBigint, randomBytes32, toHex } from '../encoding/bytes.js';
import {
  buildCredentialDocument,
  toContractCredential,
  toContractSignature,
  unsignedContractCredential,
  type CredentialDocument,
  type UnsignedCredentialInput,
} from '../encoding/credential.js';

export interface IssuerPublicKeyJson {
  readonly x: string;
  readonly y: string;
}

export const publicKeyToJson = (pk: JubjubPoint): IssuerPublicKeyJson => ({ x: bigintToHex(pk.x), y: bigintToHex(pk.y) });

export const publicKeyFromJson = (json: IssuerPublicKeyJson): JubjubPoint => ({
  x: hexToBigint(json.x),
  y: hexToBigint(json.y),
});

export const issuerKeyPairFromHex = (secretScalarHex: string): IssuerKeyPair =>
  issuerKeyPairFromScalar(hexToBigint(secretScalarHex));

// The holder secret never leaves the holder; the issuer only sees its commitment.
export const createHolderSecret = (): Uint8Array => randomBytes32();

export const holderCommitOf = (holderSecret: Uint8Array): bigint => pureCircuits.holderCommitment(holderSecret);

export const issueCredential = (input: Omit<UnsignedCredentialInput, 'salt'>, keyPair: IssuerKeyPair): CredentialDocument => {
  const full: UnsignedCredentialInput = { ...input, salt: randomBytes32() };
  const signature = signCredential(unsignedContractCredential(full), keyPair);
  return buildCredentialDocument(full, signature);
};

export const verifyCredentialDocument = (doc: CredentialDocument, issuerPublicKey: JubjubPoint): boolean =>
  verifyCredentialSignature(toContractCredential(doc), toContractSignature(doc), issuerPublicKey);

export const holderSecretToHex = (secret: Uint8Array): string => toHex(secret);
