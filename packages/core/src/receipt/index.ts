// Verification receipt: everything here is read back from the public ledger.
// A request collects answers keyed by per-request pseudonyms; a sealed request (one named
// applicant) can only ever collect answers from that person.
import type { Answer, Request } from '@stateproof/contract';
import { decodeClaimValue } from '../encoding/claims.js';
import type { Locale } from '../locale.js';
import { toHex } from '../encoding/bytes.js';
import { describePolicy, type PolicyDescription } from '../policy/describe.js';
import { claimLabel, claimValueText } from '../schemas/index.js';

export type RequestStatus = 'open' | 'expired';

export interface AnswerView {
  readonly pseudonym: string;
  readonly revealed: { readonly label: string; readonly value: string } | null;
}

export interface Receipt {
  readonly requestId: string;
  readonly status: RequestStatus;
  // True when the request is for one named applicant (subject seal).
  readonly sealed: boolean;
  readonly policy: PolicyDescription;
  readonly referenceTime: Date;
  readonly expiresAt: Date;
  readonly answers: readonly AnswerView[];
}

export const requestStatus = (expiresAt: bigint, nowSeconds: bigint): RequestStatus => (nowSeconds >= expiresAt ? 'expired' : 'open');

const answerView = (request: Request, policy: PolicyDescription, pseudonym: Uint8Array, answer: Answer, locale: Locale): AnswerView => {
  let revealed: AnswerView['revealed'] = null;
  if (answer.revealed.is_some) {
    const claim = policy.schema.claims.find((c) => BigInt(c.slot) === request.policy.revealSlot.value);
    if (!claim) throw new Error('Revealed slot is not defined in the schema');
    revealed = { label: claimLabel(claim, locale), value: claimValueText(claim, decodeClaimValue(claim, answer.revealed.value), locale) };
  }
  return { pseudonym: toHex(pseudonym), revealed };
};

export const buildReceipt = (
  requestId: Uint8Array,
  request: Request,
  answers: Iterable<readonly [Uint8Array, Answer]>,
  nowSeconds: bigint,
  locale: Locale,
): Receipt => {
  const policy = describePolicy(request.policy, locale);
  return {
    requestId: toHex(requestId),
    status: requestStatus(request.expiresAt, nowSeconds),
    sealed: request.subjectCommit.is_some,
    policy,
    referenceTime: new Date(Number(request.referenceTime) * 1000),
    expiresAt: new Date(Number(request.expiresAt) * 1000),
    answers: [...answers].map(([pseudonym, answer]) => answerView(request, policy, pseudonym, answer, locale)),
  };
};
