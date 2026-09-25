// Typed access to a deployed StateProof contract, shared by the CLI and the web app.
import { deployContract, findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders, PublicDataProvider } from '@midnight-ntwrk/midnight-js-types';
import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import {
  ledger,
  type Contract,
  type Ledger,
  type Policy,
  type Witnesses,
} from './managed/stateproof/contract/index.js';
import { CompiledStateProofContract, type StateProofCircuitId } from './compiled.js';
import {
  adminPrivateState,
  holderPrivateState,
  type HolderProofInputs,
  type StateProofPrivateState,
} from './witnesses.js';

export const STATEPROOF_PRIVATE_STATE_ID = 'stateproofPrivateState';
export type StateProofPrivateStateId = typeof STATEPROOF_PRIVATE_STATE_ID;

export type StateProofContract = Contract<StateProofPrivateState, Witnesses<StateProofPrivateState>>;
export type StateProofProviders = MidnightProviders<StateProofCircuitId, StateProofPrivateStateId, StateProofPrivateState>;
export type DeployedStateProof = FoundContract<StateProofContract>;

export interface TxReceipt {
  readonly txId: string;
  readonly txHash: string;
  readonly blockHeight: number;
}

const receiptOf = (pub: { txId: unknown; txHash: unknown; blockHeight: unknown }): TxReceipt => ({
  txId: String(pub.txId),
  txHash: String(pub.txHash),
  blockHeight: Number(pub.blockHeight),
});

export const deployStateProof = async (
  providers: StateProofProviders,
  adminSecret: Uint8Array,
): Promise<{ contract: DeployedStateProof; address: ContractAddress; receipt: TxReceipt }> => {
  const contract = await deployContract(providers, {
    compiledContract: CompiledStateProofContract,
    privateStateId: STATEPROOF_PRIVATE_STATE_ID,
    initialPrivateState: adminPrivateState(adminSecret),
  });
  const pub = contract.deployTxData.public;
  return { contract, address: pub.contractAddress, receipt: receiptOf(pub) };
};

export const joinStateProof = async (
  providers: StateProofProviders,
  address: ContractAddress,
  privateState: StateProofPrivateState,
): Promise<DeployedStateProof> => {
  providers.privateStateProvider.setContractAddress(address);
  return findDeployedContract(providers, {
    contractAddress: address,
    compiledContract: CompiledStateProofContract,
    privateStateId: STATEPROOF_PRIVATE_STATE_ID,
    initialPrivateState: privateState,
  });
};

export const registerIssuer = async (
  contract: DeployedStateProof,
  issuerId: Uint8Array,
  publicKey: { x: bigint; y: bigint },
): Promise<TxReceipt> => receiptOf((await contract.callTx.registerIssuer(issuerId, publicKey)).public);

export const createRequest = async (
  contract: DeployedStateProof,
  requestId: Uint8Array,
  policy: Policy,
  referenceTime: bigint,
  expiresAt: bigint,
): Promise<TxReceipt> =>
  receiptOf((await contract.callTx.createRequest(requestId, policy, referenceTime, expiresAt)).public);

// Loads the holder's credential into private state right before proving, so the
// witnesses see exactly the credential the holder picked for this request.
export const submitProof = async (
  providers: StateProofProviders,
  contract: DeployedStateProof,
  requestId: Uint8Array,
  inputs: HolderProofInputs,
): Promise<TxReceipt> => {
  await providers.privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, holderPrivateState(inputs));
  return receiptOf((await contract.callTx.submitProof(requestId)).public);
};

export const readLedger = async (publicData: PublicDataProvider, address: ContractAddress): Promise<Ledger> => {
  const state = await publicData.queryContractState(address);
  if (state === null) throw new Error(`No StateProof contract at ${address}`);
  return ledger(state.data);
};
