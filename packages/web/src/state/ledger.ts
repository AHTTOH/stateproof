// Read-only ledger access. Works without a wallet.
import { readLedger, type Ledger, type Request, type VerificationResult } from '@stateproof/contract';
import { buildReceipt, fromHex32, type Receipt } from '@stateproof/core';
import { requireContractAddress } from '../app/env';
import { publicDataProvider } from '../providers/midnight';

export const fetchLedger = (): Promise<Ledger> => readLedger(publicDataProvider(), requireContractAddress());

export interface RequestView {
  readonly request: Request;
  readonly result: VerificationResult | null;
  readonly receipt: Receipt;
}

export const fetchRequest = async (requestIdHex: string): Promise<RequestView> => {
  const id = fromHex32(requestIdHex);
  const ledger = await fetchLedger();
  if (!ledger.requests.member(id)) throw new Error(`Request ${requestIdHex} does not exist on this contract`);
  const request = ledger.requests.lookup(id);
  const result = ledger.results.member(id) ? ledger.results.lookup(id) : null;
  return { request, result, receipt: buildReceipt(id, request, result, BigInt(Math.floor(Date.now() / 1000))) };
};
