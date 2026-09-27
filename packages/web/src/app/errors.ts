// Turns wallet, network and SDK failures into something a user can act on.
// The raw message is always kept so nothing is hidden, only explained.

export interface ExplainedError {
  readonly summary: string;
  readonly detail: string;
}

interface Rule {
  readonly match: RegExp;
  readonly summary: string;
}

const RULES: readonly Rule[] = [
  {
    match: /^Invalid request id in link/,
    summary: 'This link does not contain a valid request id. A request id is 64 hexadecimal characters; check that the whole link was copied.',
  },
  {
    match: /does not exist on this contract/,
    summary: 'This request is not on the current StateProof contract. The link may be mistyped or come from an older deployment.',
  },
  {
    match: /Lace was not found/i,
    summary:
      'Midnight Lace was not found. Install the Lace extension, turn on the Midnight account, then reload this page. On a holder request page you can still generate the proof without a wallet.',
  },
  {
    match: /Custom error: 170/,
    summary:
      'The network rejected the fee (DUST) proof. This happens when the wallet has not caught up with its last transaction. Wait a minute and try again.',
  },
  {
    match: /could not balance dust|insufficient ?funds/i,
    summary:
      'Your wallet has no spendable DUST for the network fee. In Lace, designate tNIGHT for DUST generation (DUST button) and wait until the tDUST balance is above zero.',
  },
  {
    match: /localhost:6300|proof server|ERR_CONNECTION_REFUSED/i,
    summary:
      'Lace could not reach a proof server at localhost:6300. Start one with "docker compose -f infra/proof-server/docker-compose.yml up -d" or "node scripts/proof-server-proxy.mjs preprod".',
  },
  {
    match: /network ?id|network mismatch|different network/i,
    summary: 'Lace is on a different Midnight network. In Lace: Settings, Network, Testnet, then choose Preprod for Midnight.',
  },
  {
    match: /channel .* was shutdown|user (rejected|denied|cancell?ed)|request was (rejected|denied|cancell?ed)|declined by the user/i,
    summary: 'The Lace window was closed or the request was declined. Try again and approve it in Lace.',
  },
  {
    match: /Lace is not connected|wallet is locked|is locked/i,
    summary: 'Lace is locked or disconnected. Unlock Lace and try again.',
  },
  // Generic network failure last, so the specific proof server and Lace rules win.
  {
    match: /Failed to fetch|NetworkError|Load failed/i,
    summary: 'Could not reach the Midnight network service. Check your connection and reload the page.',
  },
];

const FIRST_LINE_LIMIT = 220;

export const explainError = (raw: string): ExplainedError => {
  const rule = RULES.find((r) => r.match.test(raw));
  if (rule) return { summary: rule.summary, detail: raw };
  const [firstLine] = raw.split('\n', 1);
  return { summary: firstLine.length > FIRST_LINE_LIMIT ? `${firstLine.slice(0, FIRST_LINE_LIMIT)}…` : firstLine, detail: raw };
};
