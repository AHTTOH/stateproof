// Privacy leak scanner. Collects every atom that the chain can see (ledger state and the
// public side of each call) and looks for private values in them.
//
// Both sources are normalized to the same token form: the atom's little-endian bytes as
// lowercase hex with trailing zero bytes removed (the ledger prints zero as "-", which
// normalizes to the empty token and is ignored). Matching is exact per token, never by
// substring, so a hash that merely contains the digits of a value is not a false hit.
// A scan is only trusted together with a positive control: a value that is public on
// purpose must be found, which proves the scanner reads the data it claims to read.

export type SecretValue = bigint | Uint8Array;

export interface Secret {
  readonly name: string;
  readonly value: SecretValue;
}

export interface LeakHit {
  readonly name: string;
  readonly token: string;
  readonly source: string;
}

const hex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const trimTrailingZeroBytes = (h: string): string => {
  let end = h.length;
  while (end >= 2 && h.slice(end - 2, end) === '00') end -= 2;
  return h.slice(0, end);
};

const bigintToLeHex = (value: bigint): string => {
  if (value < 0n) throw new Error('negative values are not ledger atoms');
  let out = '';
  let v = value;
  while (v > 0n) {
    out += (v & 0xffn).toString(16).padStart(2, '0');
    v >>= 8n;
  }
  return out;
};

export const secretToken = (value: SecretValue): string =>
  typeof value === 'bigint' ? bigintToLeHex(value) : trimTrailingZeroBytes(hex(value));

// The parts of a call that reach the chain. `privateTranscriptOutputs` (witness values)
// stays with the prover and is excluded; scanning it is the scanner's own sanity check.
export const publicCallData = (proofData: unknown): unknown => {
  const p = proofData as { input?: unknown; output?: unknown; publicTranscript?: unknown } | null;
  return { input: p?.input, output: p?.output, publicTranscript: p?.publicTranscript };
};

export const privateCallData = (proofData: unknown): unknown =>
  (proofData as { privateTranscriptOutputs?: unknown } | null)?.privateTranscriptOutputs;

// Every Uint8Array reachable from the given data.
export const tokensFromCallData = (data: unknown): string[] => {
  const out: string[] = [];
  const seen = new Set<unknown>();
  const walk = (x: unknown): void => {
    if (x === null || x === undefined) return;
    if (x instanceof Uint8Array) {
      out.push(trimTrailingZeroBytes(hex(x)));
      return;
    }
    if (typeof x !== 'object' || seen.has(x)) return;
    seen.add(x);
    if (Array.isArray(x)) {
      for (const item of x) walk(item);
      return;
    }
    for (const value of Object.values(x as Record<string, unknown>)) walk(value);
  };
  walk(data);
  return out.filter((t) => t.length > 0);
};

// Tokens from the printed form of a ledger StateValue: cell atoms "<[a, b, -]: ...>"
// and Merkle leaves "index: <64 hex>".
export const tokensFromStateDump = (dump: string): string[] => {
  const out: string[] = [];
  for (const match of dump.matchAll(/<\[([^\]]*)\]/g)) {
    for (const part of match[1].split(',')) {
      const token = part.trim();
      if (token !== '-' && token !== '' && /^[0-9a-f]+$/.test(token)) out.push(token);
    }
  }
  for (const match of dump.matchAll(/\b\d+: ([0-9a-f]{64})\b/g)) out.push(match[1]);
  return out;
};

export const scanTokens = (tokens: readonly string[], secrets: readonly Secret[], source: string): LeakHit[] => {
  const set = new Set(tokens);
  const hits: LeakHit[] = [];
  for (const secret of secrets) {
    const token = secretToken(secret.value);
    if (token.length > 0 && set.has(token)) hits.push({ name: secret.name, token, source });
  }
  return hits;
};
