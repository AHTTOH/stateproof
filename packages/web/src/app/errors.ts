// Turns wallet, network and SDK failures into something a user can act on.
// The raw message is always kept so nothing is hidden, only explained.
import type { MessageKey } from './messages';

export interface ExplainedError {
  // Message key of the explanation, or null when no rule knows this failure (show the raw first line).
  readonly key: MessageKey | null;
  readonly firstLine: string;
  readonly detail: string;
}

interface Rule {
  readonly match: RegExp;
  readonly key: MessageKey;
}

const RULES: readonly Rule[] = [
  { match: /^Invalid request id in link/, key: 'error.invalidId' },
  { match: /does not exist on this contract/, key: 'error.unknownRequest' },
  { match: /Lace was not found/i, key: 'error.laceMissing' },
  { match: /Custom error: 170/, key: 'error.dustProof' },
  { match: /could not balance dust|insufficient ?funds/i, key: 'error.noDust' },
  { match: /localhost:6300|proof server|ERR_CONNECTION_REFUSED/i, key: 'error.proofServer' },
  { match: /network ?id|network mismatch|different network/i, key: 'error.network' },
  {
    match: /channel .* was shutdown|user (rejected|denied|cancell?ed)|request was (rejected|denied|cancell?ed)|declined by the user/i,
    key: 'error.declined',
  },
  { match: /Lace is not connected|wallet is locked|is locked/i, key: 'error.locked' },
  // Generic network failure last, so the specific proof server and Lace rules win.
  { match: /Failed to fetch|NetworkError|Load failed/i, key: 'error.offline' },
];

const FIRST_LINE_LIMIT = 220;

export const explainError = (raw: string): ExplainedError => {
  const rule = RULES.find((r) => r.match.test(raw));
  const [line] = raw.split('\n', 1);
  const firstLine = line.length > FIRST_LINE_LIMIT ? `${line.slice(0, FIRST_LINE_LIMIT)}…` : line;
  return { key: rule ? rule.key : null, firstLine, detail: raw };
};
