// Runs the same predicate circuits the proof uses, locally, so the holder learns why a proof
// would fail before anything is generated or sent.
import { Op, pureCircuits, type Request } from '@stateproof/contract';
import { bytes32ToLabel, describeCondition, schemaByIdBytes, type CredentialDocument, type Locale } from '@stateproof/core';
import { proofInputs, type HolderWallet } from './holderWallet';

export type LocalReason =
  | { readonly kind: 'condition'; readonly text: string }
  | { readonly kind: 'expired' }
  | { readonly kind: 'issuedAfter' };

export interface LocalCheck {
  readonly ok: boolean;
  // Claim keys with at least one unmet condition.
  readonly failing: ReadonlySet<string>;
  readonly reasons: readonly LocalReason[];
}

export const checkLocally = (wallet: HolderWallet, doc: CredentialDocument, request: Request, locale: Locale): LocalCheck => {
  const { credential } = proofInputs(wallet, doc);
  const schema = schemaByIdBytes(request.policy.schemaId);
  const unmet = request.policy.conditions.filter((c) => c.op !== Op.ignore && !pureCircuits.conditionHolds(credential.claims, c));
  const failing = new Set(unmet.flatMap((c) => schema.claims.filter((claim) => BigInt(claim.slot) === c.claimIndex).map((claim) => claim.key)));
  const reasons: LocalReason[] = unmet.map((c) => ({ kind: 'condition', text: describeCondition(schema, c, locale) }));
  if (credential.expiresAt <= request.referenceTime) reasons.push({ kind: 'expired' });
  if (credential.issuedAt > request.referenceTime) reasons.push({ kind: 'issuedAfter' });
  return { ok: reasons.length === 0, failing, reasons };
};

export const matchingCredential = (wallet: HolderWallet, request: Request): CredentialDocument | null => {
  const schema = schemaByIdBytes(request.policy.schemaId);
  const issuerId = bytes32ToLabel(request.policy.issuerId);
  return wallet.credentials.find((d) => d.schema === schema.id && d.issuer.id === issuerId) ?? null;
};
