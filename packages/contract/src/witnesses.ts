// Private state and witness implementations for the StateProof contract.
// Witnesses read only from private state and throw when a value is missing:
// a missing credential or admin secret is a caller error, never something to paper over.
import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Credential, Ledger, Signature } from './managed/stateproof/contract/index.js';

export interface HolderProofInputs {
  readonly credential: Credential;
  readonly signature: Signature;
  readonly holderSecret: Uint8Array;
}

export interface StateProofPrivateState {
  readonly adminSecret: Uint8Array | null;
  readonly proofInputs: HolderProofInputs | null;
}

export const emptyPrivateState = (): StateProofPrivateState => ({ adminSecret: null, proofInputs: null });

export const adminPrivateState = (adminSecret: Uint8Array): StateProofPrivateState => ({
  adminSecret,
  proofInputs: null,
});

export const holderPrivateState = (proofInputs: HolderProofInputs): StateProofPrivateState => ({
  adminSecret: null,
  proofInputs,
});

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
};
