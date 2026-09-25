// Requests this browser created as a verifier. Only ids and labels are stored locally;
// status and policy are always read back from the ledger.
const STORAGE_KEY = 'stateproof.verifier.v1';

export interface StoredRequest {
  readonly requestId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly txId: string;
}

export const loadRequests = (): readonly StoredRequest[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? [] : (JSON.parse(raw) as StoredRequest[]);
};

export const rememberRequest = (request: StoredRequest): readonly StoredRequest[] => {
  const next = [request, ...loadRequests()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
