// Off-chain half of the issuer Schnorr scheme defined in modules/credential.compact.
// Hashing and curve operations run through the compiled pure circuits, so the TS
// side can never drift from what submitProof verifies. Only the scalar step
// s = k + c * sk is done here, modulo the Jubjub prime subgroup order.
import type { JubjubPoint } from '@midnight-ntwrk/compact-runtime';
import { pureCircuits, type Credential, type Signature } from './managed/stateproof/contract/index.js';

export const JUBJUB_SUBGROUP_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;

// 64 random bytes reduced mod r_J keep the modulo bias negligible (< 2^-250).
const SCALAR_SOURCE_BYTES = 64;

export interface IssuerKeyPair {
  readonly secretScalar: bigint;
  readonly publicKey: JubjubPoint;
}

const reduce = (value: bigint): bigint => {
  const r = value % JUBJUB_SUBGROUP_ORDER;
  return r >= 0n ? r : r + JUBJUB_SUBGROUP_ORDER;
};

const bytesToBigInt = (bytes: Uint8Array): bigint =>
  bytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);

export const randomScalar = (): bigint => {
  const bytes = new Uint8Array(SCALAR_SOURCE_BYTES);
  crypto.getRandomValues(bytes);
  const scalar = reduce(bytesToBigInt(bytes));
  if (scalar === 0n) {
    throw new Error('Random scalar reduced to zero; retry');
  }
  return scalar;
};

export const issuerKeyPairFromScalar = (secretScalar: bigint): IssuerKeyPair => {
  if (secretScalar <= 0n || secretScalar >= JUBJUB_SUBGROUP_ORDER) {
    throw new Error('Issuer secret scalar must be in [1, r_J)');
  }
  return { secretScalar, publicKey: pureCircuits.derivePublicKey(secretScalar) };
};

export const generateIssuerKeyPair = (): IssuerKeyPair => issuerKeyPairFromScalar(randomScalar());

export const credentialChallenge = (credential: Credential, publicKey: JubjubPoint, r: JubjubPoint): bigint =>
  pureCircuits.signingChallenge(pureCircuits.credentialRoot(credential), publicKey, r);

// nonceScalar must be fresh per signature: reusing it with a different credential leaks the key.
export const signCredential = (
  credential: Credential,
  keyPair: IssuerKeyPair,
  nonceScalar: bigint = randomScalar(),
): Signature => {
  const r = pureCircuits.derivePublicKey(nonceScalar);
  const challenge = credentialChallenge(credential, keyPair.publicKey, r);
  return { r, s: reduce(nonceScalar + challenge * keyPair.secretScalar) };
};

export const verifyCredentialSignature = (
  credential: Credential,
  signature: Signature,
  publicKey: JubjubPoint,
): boolean =>
  pureCircuits.isValidSignature(publicKey, signature, credentialChallenge(credential, publicKey, signature.r));
