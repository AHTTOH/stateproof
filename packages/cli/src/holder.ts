// Holder side used by the CLI: build proof inputs from a credential document and submit a proof,
// keeping the call's public and private data so the e2e can scan what the chain saw.
import { readFile } from 'node:fs/promises';
import {
  NO_NONCE,
  STATEPROOF_PRIVATE_STATE_ID,
  holderPrivateState,
  issuerWitnessFor,
  type DeployedStateProof,
  type HolderProofInputs,
  type Ledger,
  type StateProofProviders,
  type TxReceipt,
} from '@stateproof/contract';
import { fromHex32, toContractCredential, toContractSignature, type CredentialDocument } from '@stateproof/core';
import { DEMO_PERSONAS_FILE, type DemoPersonasFile, type PersonaBundle } from '@stateproof/issuer';

export const loadDemoPersonas = async (file: string = DEMO_PERSONAS_FILE): Promise<DemoPersonasFile> =>
  JSON.parse(await readFile(file, 'utf8')) as DemoPersonasFile;

export const findPersona = (file: DemoPersonasFile, id: string): PersonaBundle => {
  const persona = file.personas.find((p) => p.id === id);
  if (!persona) throw new Error(`Persona ${id} is not in config/demo-personas.v2.json`);
  return persona;
};

export const personaCredential = (persona: PersonaBundle, schema: string): CredentialDocument => {
  const entry = persona.credentials.find((c) => c.credential.schema === schema);
  if (!entry) throw new Error(`${persona.id} has no ${schema} credential`);
  return entry.credential;
};

// Issuer key and path come from the public ledger, as the holder app computes them.
export const proofInputsFor = (
  doc: CredentialDocument,
  holderSecret: Uint8Array,
  ledger: Ledger,
  requestNonce: Uint8Array = NO_NONCE,
): HolderProofInputs => {
  const credential = toContractCredential(doc);
  return { credential, signature: toContractSignature(doc), holderSecret, requestNonce, ...issuerWitnessFor(ledger, credential) };
};

export const personaSecret = (persona: PersonaBundle): Uint8Array => fromHex32(persona.holderSecret);

// What reached the chain from one call (as in packages/contract/src/leak-scan.ts publicCallData),
// and what stayed with the prover.
export interface CallData {
  readonly publicData: unknown;
  readonly privateData: unknown;
}

export interface CallTxLike {
  readonly public: { readonly txId: unknown; readonly txHash: unknown; readonly blockHeight: unknown; readonly publicTranscript: unknown };
  readonly private: { readonly input: unknown; readonly output: unknown; readonly privateTranscriptOutputs: unknown };
}

export const receiptOf = (tx: CallTxLike): TxReceipt => ({
  txId: String(tx.public.txId),
  txHash: String(tx.public.txHash),
  blockHeight: Number(tx.public.blockHeight),
});

export const callDataOf = (tx: CallTxLike): CallData => ({
  publicData: { input: tx.private.input, output: tx.private.output, publicTranscript: tx.public.publicTranscript },
  privateData: tx.private.privateTranscriptOutputs,
});

export const submitProofTx = async (
  providers: StateProofProviders,
  contract: DeployedStateProof,
  requestId: Uint8Array,
  inputs: HolderProofInputs,
): Promise<{ receipt: TxReceipt; pseudonym: Uint8Array; call: CallData }> => {
  await providers.privateStateProvider.set(STATEPROOF_PRIVATE_STATE_ID, holderPrivateState(inputs));
  const tx = await contract.callTx.submitProof(requestId);
  return { receipt: receiptOf(tx), pseudonym: tx.private.result, call: callDataOf(tx) };
};
