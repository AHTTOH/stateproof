// Private state and witness implementations for the StateProof contract.
// Witnesses read only from private state and throw when a value is missing:
// a missing credential or admin secret is a caller error, never something to paper over.
import type { JubjubPoint, MerkleTreePath, WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Credential, Ledger, Signature } from './managed/stateproof/contract/index.js';

export interface HolderProofInputs {
  readonly credential: Credential;
  readonly signature: Signature;
  readonly holderSecret: Uint8Array;
  // Public key of the issuer that signed, and its path in the current issuer tree.
  // Both come from the public ledger; the holder computes them locally.
  readonly issuerPublicKey: JubjubPoint;
  readonly issuerPath: MerkleTreePath<Uint8Array>;
  // Nonce from the private request link. Only needed for requests sealed to one person;
  // any value works for open requests.
  readonly requestNonce: Uint8Array;
}

export interface StateProofPrivateState {
  readonly adminSecret: Uint8Array | null;
  readonly issuerSecret: bigint | null;
  readonly proofInputs: HolderProofInputs | null;
}

export const emptyPrivateState = (): StateProofPrivateState => ({ adminSecret: null, issuerSecret: null, proofInputs: null });

export const adminPrivateState = (adminSecret: Uint8Array): StateProofPrivateState => ({
  adminSecret,
  issuerSecret: null,
  proofInputs: null,
});

export const issuerPrivateState = (issuerSecret: bigint): StateProofPrivateState => ({
  adminSecret: null,
  issuerSecret,
  proofInputs: null,
});

export const holderPrivateState = (proofInputs: HolderProofInputs): StateProofPrivateState => ({
  adminSecret: null,
  issuerSecret: null,
  proofInputs,
});

export const NO_NONCE: Uint8Array = new Uint8Array(32);

type Ctx = WitnessContext<Ledger, StateProofPrivateState>;

const requireProofInputs = (privateState: StateProofPrivateState): HolderProofInputs => {
  if (privateState.proofInputs === null) {
    throw new Error('No credential selected: set proofInputs in private state before submitProof');
  }
  return privateState.proofInputs;
};

export const witnesses = {
  adminSecret: ({ privateState }: Ctx): [StateProofPrivateState, Uint8Array] => {
    if (privateState.adminSecret === null) {
      throw new Error('Admin secret is not present in private state: only the deployer can run this circuit');
    }
    return [privateState, privateState.adminSecret];
  },
  issuerSecret: ({ privateState }: Ctx): [StateProofPrivateState, bigint] => {
    if (privateState.issuerSecret === null) {
      throw new Error('Issuer secret is not present in private state: only the issuer can rotate its epoch');
    }
    return [privateState, privateState.issuerSecret];
  },
  credential: ({ privateState }: Ctx): [StateProofPrivateState, Credential] => [
    privateState,
    requireProofInputs(privateState).credential,
  ],
  credentialSignature: ({ privateState }: Ctx): [StateProofPrivateState, Signature] => [
    privateState,
    requireProofInputs(privateState).signature,
  ],
  holderSecret: ({ privateState }: Ctx): [StateProofPrivateState, Uint8Array] => [
    privateState,
    requireProofInputs(privateState).holderSecret,
  ],
  issuerPublicKey: ({ privateState }: Ctx): [StateProofPrivateState, JubjubPoint] => [
    privateState,
    requireProofInputs(privateState).issuerPublicKey,
  ],
  issuerPath: ({ privateState }: Ctx): [StateProofPrivateState, MerkleTreePath<Uint8Array>] => [
    privateState,
    requireProofInputs(privateState).issuerPath,
  ],
  requestNonce: ({ privateState }: Ctx): [StateProofPrivateState, Uint8Array] => [
    privateState,
    requireProofInputs(privateState).requestNonce,
  ],
};
