// In-process harness: runs StateProof circuits against a local ledger without proofs.
import {
  type CircuitContext,
  CostModel,
  QueryContext,
  createConstructorContext,
  sampleContractAddress,
  type JubjubPoint,
} from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, type Ledger, type Policy } from '../src/managed/stateproof/contract/index.js';
import {
  adminPrivateState,
  emptyPrivateState,
  holderPrivateState,
  witnesses,
  type HolderProofInputs,
  type StateProofPrivateState,
} from '../src/witnesses.js';

const DUMMY_COIN_PUBLIC_KEY = '0'.repeat(64);

export class StateProofSimulator {
  readonly contract = new Contract<StateProofPrivateState>(witnesses);
  private context: CircuitContext<StateProofPrivateState>;

  constructor(adminSecret: Uint8Array, blockTimeSeconds: bigint) {
    const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(
      createConstructorContext(adminPrivateState(adminSecret), DUMMY_COIN_PUBLIC_KEY),
    );
    this.context = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
    this.setBlockTime(blockTimeSeconds);
  }

  setBlockTime(seconds: bigint): void {
    const query = this.context.currentQueryContext;
    query.block = { ...query.block, secondsSinceEpoch: seconds, lastBlockTime: seconds };
  }

  getLedger(): Ledger {
    return ledger(this.context.currentQueryContext.state);
  }

  private withPrivateState(privateState: StateProofPrivateState): void {
    this.context = { ...this.context, currentPrivateState: privateState };
  }

  asAdmin(adminSecret: Uint8Array): this {
    this.withPrivateState(adminPrivateState(adminSecret));
    return this;
  }

  asVerifier(): this {
    this.withPrivateState(emptyPrivateState());
    return this;
  }

  asHolder(inputs: HolderProofInputs): this {
    this.withPrivateState(holderPrivateState(inputs));
    return this;
  }

  registerIssuer(issuerId: Uint8Array, publicKey: JubjubPoint): Ledger {
    this.context = this.contract.impureCircuits.registerIssuer(this.context, issuerId, publicKey).context;
    return this.getLedger();
  }

  createRequest(requestId: Uint8Array, policy: Policy, referenceTime: bigint, expiresAt: bigint): Ledger {
    this.context = this.contract.impureCircuits.createRequest(
      this.context,
      requestId,
      policy,
      referenceTime,
      expiresAt,
    ).context;
    return this.getLedger();
  }

  submitProof(requestId: Uint8Array): Ledger {
    this.context = this.contract.impureCircuits.submitProof(this.context, requestId).context;
    return this.getLedger();
  }
}
