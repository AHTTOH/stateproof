// Verification receipt (PRD §17): everything here is read back from the public ledger.
import type { Request, VerificationResult } from '@stateproof/contract';
import { decodeClaimValue } from '../encoding/claims.js';
import { toHex } from '../encoding/bytes.js';
import { describePolicy, type PolicyDescription } from '../policy/builder.js';

export type RequestStatus = 'pending' | 'verified' | 'expired';

export interface Receipt {
  readonly requestId: string;
  readonly status: RequestStatus;
  readonly policy: PolicyDescription;
  readonly referenceTime: Date;
  readonly expiresAt: Date;
  readonly revealed: { readonly label: string; readonly value: string } | null;
}

export const requestStatus = (result: VerificationResult | null, expiresAt: bigint, nowSeconds: bigint): RequestStatus => {
  if (result !== null) return 'verified';
  return nowSeconds >= expiresAt ? 'expired' : 'pending';
};

export const buildReceipt = (
  requestId: Uint8Array,
  request: Request,
  result: VerificationResult | null,
  nowSeconds: bigint,
): Receipt => {
  const policy = describePolicy(request.policy);
  let revealed: Receipt['revealed'] = null;
  if (result !== null && result.revealed.is_some) {
    const claim = policy.schema.claims.find((c) => BigInt(c.slot) === request.policy.revealSlot.value);
    if (!claim) throw new Error('Revealed slot is not defined in the schema');
    revealed = { label: claim.label, value: decodeClaimValue(claim, result.revealed.value) };
  }
  return {
    requestId: toHex(requestId),
    status: requestStatus(result, request.expiresAt, nowSeconds),
    policy,
    referenceTime: new Date(Number(request.referenceTime) * 1000),
    expiresAt: new Date(Number(request.expiresAt) * 1000),
    revealed,
  };
};
