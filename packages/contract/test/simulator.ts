// In-process harness: runs StateProof circuits against a local ledger without proofs.
import {
  type CircuitContext,
  CostModel,
  QueryContext,
  createConstructorContext,
  sampleContractAddress,
  type JubjubPoint,
} from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, type GridPoint, type Ledger, type Policy, type SchemaRule } from '../src/managed/stateproof/contract/index.js';
import { unsafeGridForPolicy } from '../src/grid.js';
import {
  adminPrivateState,
  emptyPrivateState,
  holderPrivateState,
  issuerPrivateState,
  witnesses,
  type HolderProofInputs,
  type StateProofPrivateState,
} from '../src/witnesses.js';

const DUMMY_COIN_PUBLIC_KEY = '0'.repeat(64);

export interface CallRecord {
  readonly circuit: string;
  // Public transcript of the call, as the chain would see it.
  readonly transcript: unknown;
}

export class StateProofSimulator {
  readonly contract = new Contract<StateProofPrivateState>(witnesses);
  private context: CircuitContext<StateProofPrivateState>;
  readonly calls: CallRecord[] = [];

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

  // Printed ledger state: every stored cell, as the indexer would serve it.
  stateDump(): string {
    return String(this.context.currentQueryContext.state);
  }

  private withPrivateState(privateState: StateProofPrivateState): void {
    this.context = { ...this.context, currentPrivateState: privateState };
  }

  asAdmin(adminSecret: Uint8Array): this {
    this.withPrivateState(adminPrivateState(adminSecret));
    return this;
  }

  asIssuer(secretScalar: bigint): this {
    this.withPrivateState(issuerPrivateState(secretScalar));
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

  private record<T extends { context: CircuitContext<StateProofPrivateState>; proofData?: unknown }>(circuit: string, result: T): T {
    this.context = result.context;
    this.calls.push({ circuit, transcript: result.proofData });
    return result;
  }

  registerSchema(schemaId: Uint8Array, rule: SchemaRule): Ledger {
    this.record('registerSchema', this.contract.impureCircuits.registerSchema(this.context, schemaId, rule));
    return this.getLedger();
  }

  registerIssuer(issuerId: Uint8Array, schemaId: Uint8Array, publicKey: JubjubPoint, slot: bigint): Ledger {
    this.record('registerIssuer', this.contract.impureCircuits.registerIssuer(this.context, issuerId, schemaId, publicKey, slot));
    return this.getLedger();
  }

  rotateIssuerEpoch(issuerId: Uint8Array): Ledger {
    this.record('rotateIssuerEpoch', this.contract.impureCircuits.rotateIssuerEpoch(this.context, issuerId));
    return this.getLedger();
  }

  deactivateIssuer(issuerId: Uint8Array): Ledger {
    this.record('deactivateIssuer', this.contract.impureCircuits.deactivateIssuer(this.context, issuerId));
    return this.getLedger();
  }

  // The grid defaults to the one derived from the schema's registered rule (rounding down
  // off-grid bounds, so the circuit gets to refuse them); tests may pass their own.
  createRequest(
    requestId: Uint8Array,
    policy: Policy,
    referenceTime: bigint,
    expiresAt: bigint,
    subjectCommit: { is_some: boolean; value: bigint } = { is_some: false, value: 0n },
    grid?: GridPoint[],
  ): Ledger {
    const state = this.getLedger();
    const points =
      grid ??
      (state.schemaRules.member(policy.schemaId)
        ? unsafeGridForPolicy(policy, state.schemaRules.lookup(policy.schemaId))
        : policy.conditions.map(() => ({ lo: 0n, hi: 0n })));
    this.record(
      'createRequest',
      this.contract.impureCircuits.createRequest(this.context, requestId, policy, points, referenceTime, expiresAt, subjectCommit),
    );
    return this.getLedger();
  }

  submitProof(requestId: Uint8Array): Uint8Array {
    return this.record('submitProof', this.contract.impureCircuits.submitProof(this.context, requestId)).result;
  }
}
