// Read-only ledger access. Works without a wallet.
import { readLedger, type Ledger, type Request, type VerificationResult } from '@stateproof/contract';
import { buildReceipt, fromHex32, requestStatus, type Locale, type Receipt } from '@stateproof/core';
import { requireContractAddress } from '../app/env';
import { publicDataProvider } from '../providers/midnight';

export const fetchLedger = (): Promise<Ledger> => readLedger(publicDataProvider(), requireContractAddress());

// Raw ledger data for one request; the display text is built per language with receiptOf.
export interface RequestView {
  readonly requestId: Uint8Array;
  readonly request: Request;
  readonly result: VerificationResult | null;
  readonly readAt: bigint;
}

const REQUEST_ID = /^[0-9a-f]{64}$/i;

const nowSeconds = (): bigint => BigInt(Math.floor(Date.now() / 1000));

export const receiptOf = (view: RequestView, locale: Locale): Receipt =>
  buildReceipt(view.requestId, view.request, view.result, view.readAt, locale);

// First id in the list whose request is still open (not answered, not expired), with one ledger read.
export const firstPendingRequest = async (requestIdsHex: readonly string[]): Promise<string | null> => {
  const ledger = await fetchLedger();
  const now = nowSeconds();
  const open = requestIdsHex.find((hex) => {
    const id = fromHex32(hex);
    if (!ledger.requests.member(id)) return false;
    const result = ledger.results.member(id) ? ledger.results.lookup(id) : null;
    return requestStatus(result, ledger.requests.lookup(id).expiresAt, now) === 'pending';
  });
  return open ?? null;
};

export const fetchRequest = async (requestIdHex: string): Promise<RequestView> => {
  if (!REQUEST_ID.test(requestIdHex)) throw new Error(`Invalid request id in link: ${requestIdHex}`);
  const requestId = fromHex32(requestIdHex);
  const ledger = await fetchLedger();
  if (!ledger.requests.member(requestId)) throw new Error(`Request ${requestIdHex} does not exist on this contract`);
  const request = ledger.requests.lookup(requestId);
  const result = ledger.results.member(requestId) ? ledger.results.lookup(requestId) : null;
  return { requestId, request, result, readAt: nowSeconds() };
};
