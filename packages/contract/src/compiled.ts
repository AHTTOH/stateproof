import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as CompiledStateProof from './managed/stateproof/contract/index.js';
import { witnesses, type StateProofPrivateState } from './witnesses.js';

// Circuit ids, used by zk-config providers to locate keys/<id>.prover and zkir/<id>.bzkir.
export const STATEPROOF_CIRCUITS = ['registerIssuer', 'createRequest', 'submitProof'] as const;
export type StateProofCircuitId = (typeof STATEPROOF_CIRCUITS)[number];

// Compiled artifacts directory, relative to this package's src/.
export const MANAGED_DIR = 'managed/stateproof';

export const CompiledStateProofContract = CompiledContract.make<
  CompiledStateProof.Contract<StateProofPrivateState>
>('StateProof', CompiledStateProof.Contract<StateProofPrivateState>).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(`./${MANAGED_DIR}`),
);
