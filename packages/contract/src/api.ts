// Typed access to a deployed StateProof contract, shared by the CLI and the web app.
import { deployContract, findDeployedContract, type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders, PublicDataProvider } from '@midnight-ntwrk/midnight-js-types';
import type { ContractAddress, JubjubPoint, MerkleTreePath } from '@midnight-ntwrk/compact-runtime';
import {
  ledger,
  pureCircuits,
  type Contract,
  type Credential,
  type Ledger,
  type Policy,
  type SchemaRule,
  type Witnesses,
} from './managed/stateproof/contract/index.js';
import { CompiledStateProofContract, type StateProofCircuitId } from './compiled.js';
import {
  adminPrivateState,
  holderPrivateState,
  issuerPrivateState,
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

export interface AnswerReceipt extends TxReceipt {
  readonly pseudonym: Uint8Array;
}

const receiptOf = (pub: { txId: unknown; txHash: unknown; blockHeight: unknown }): TxReceipt => ({
  txId: String(pub.txId),
  txHash: String(pub.txHash),
  blockHeight: Number(pub.blockHeight),
});

export const NO_SUBJECT = { is_some: false, value: 0n } as const;

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

export const registerSchema = async (contract: DeployedStateProof, schemaId: Uint8Array, rule: SchemaRule): Promise<TxReceipt> =>
  receiptOf((await contract.callTx.registerSchema(schemaId, rule)).public);

export const registerIssuer = async (
  contract: DeployedStateProof,
  issuerId: Uint8Array,
  schemaId: Uint8Array,
  publicKey: JubjubPoint,
  slot: bigint,
): Promise<TxReceipt> => receiptOf((await contract.callTx.registerIssuer(issuerId, schemaId, publicKey, slot)).public);

export const rotateIssuerEpoch = async (
  providers: StateProofProviders,
  contract: DeployedStateProof,
  issuerId: Uint8Array,
  issuerSecretScalar: bigint,
): Promise<TxReceipt> => {
  await providers.privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, issuerPrivateState(issuerSecretScalar));
  return receiptOf((await contract.callTx.rotateIssuerEpoch(issuerId)).public);
};

export const deactivateIssuer = async (contract: DeployedStateProof, issuerId: Uint8Array): Promise<TxReceipt> =>
  receiptOf((await contract.callTx.deactivateIssuer(issuerId)).public);

export const createRequest = async (
  contract: DeployedStateProof,
  requestId: Uint8Array,
  policy: Policy,
  referenceTime: bigint,
  expiresAt: bigint,
  subjectCommit: { is_some: boolean; value: bigint } = NO_SUBJECT,
): Promise<TxReceipt> =>
  receiptOf((await contract.callTx.createRequest(requestId, policy, referenceTime, expiresAt, subjectCommit)).public);

// Loads the holder's credential into private state right before proving, so the
// witnesses see exactly the credential the holder picked for this request.
export const submitProof = async (
  providers: StateProofProviders,
  contract: DeployedStateProof,
  requestId: Uint8Array,
  inputs: HolderProofInputs,
): Promise<AnswerReceipt> => {
  await providers.privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, holderPrivateState(inputs));
  const tx = await contract.callTx.submitProof(requestId);
  return { ...receiptOf(tx.public), pseudonym: pureCircuits.pseudonymFor(requestId, inputs.holderSecret) };
};

export const readLedger = async (publicData: PublicDataProvider, address: ContractAddress): Promise<Ledger> => {
  const state = await publicData.queryContractState(address);
  if (state === null) throw new Error(`No StateProof contract at ${address}`);
  return ledger(state.data);
};

// Everything the holder needs about the signer, computed from public ledger data on the
// holder's own device: the issuer's current leaf and its Merkle path.
export const issuerWitnessFor = (
  state: Ledger,
  credential: Credential,
): { issuerPublicKey: JubjubPoint; issuerPath: MerkleTreePath<Uint8Array> } => {
  if (!state.issuers.member(credential.issuerId)) throw new Error('The issuer of this credential is not registered');
  const record = state.issuers.lookup(credential.issuerId);
  if (!record.active) throw new Error('The issuer of this credential was deactivated');
  if (record.epoch !== credential.epoch) {
    throw new Error(`This credential is from issuer epoch ${credential.epoch}; the issuer is now at ${record.epoch}. Ask for a re-issued credential.`);
  }
  const leaf = pureCircuits.issuerLeaf(credential.issuerId, record.schemaId, record.publicKey, record.epoch);
  return { issuerPublicKey: record.publicKey, issuerPath: state.issuerTree.pathForLeaf(record.slot, leaf) };
};
