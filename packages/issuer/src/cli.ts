// Issuer CLI (v2).
//   npm run issue -w @stateproof/issuer -- keygen --issuer issuer:acme-hr
//   npm run issue -w @stateproof/issuer -- issue --issuer issuer:acme-hr --request req.json --subject subject.json --out cred.json
//       [--issued-at 2026-09-01T00:00:00Z] [--expires-at 2027-09-01T00:00:00Z] [--epoch 0]
//   npm run issue -w @stateproof/issuer -- personas
//
// req.json     = the holder's IssuanceRequest: { "schema": "career", "holderCommit": "0x..." }
// subject.json = { "name": "...", "birthDate": "YYYY-MM-DD", "claims": { ...schema claims } }
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { ENV_FILE, findIssuer, loadRegistry } from './registry.js';
import { keygen } from './keys/keygen.js';
import { envKeyLookup, issuePersonas } from './issue/personas.js';
import { issueFromRequest, parseIssuanceRequest, parseSubjectInput } from './issue/issue.js';

const USAGE = [
  'usage:',
  '  cli.ts keygen --issuer <id>',
  '  cli.ts issue --issuer <id> --request <file> --subject <file> --out <file> [--issued-at <iso>] [--expires-at <iso>] [--epoch <n>]',
  '  cli.ts personas',
].join('\n');

const YEAR_MS = 365 * 86_400_000;

const readJson = async (file: string): Promise<unknown> => JSON.parse(await readFile(path.resolve(file), 'utf8'));

const issue = async (values: Record<string, string | undefined>): Promise<string> => {
  if (!values.issuer || !values.request || !values.subject || !values.out) throw new Error(USAGE);
  const registry = await loadRegistry();
  const entry = findIssuer(registry, values.issuer);
  const now = Date.now();
  const doc = await issueFromRequest({
    issuer: entry,
    keyPair: envKeyLookup(entry),
    request: parseIssuanceRequest(await readJson(values.request)),
    subject: parseSubjectInput(await readJson(values.subject)),
    issuedAt: values['issued-at'] ?? new Date(Math.floor(now / 1000) * 1000).toISOString(),
    expiresAt: values['expires-at'] ?? new Date(Math.floor((now + YEAR_MS) / 1000) * 1000).toISOString(),
    epoch: values.epoch === undefined ? undefined : Number(values.epoch),
  });
  await writeFile(path.resolve(values.out), `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  return `${entry.id} issued a ${doc.schema} credential (epoch ${doc.issuer.epoch}) -> ${values.out}`;
};

const main = async (): Promise<string> => {
  if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      issuer: { type: 'string' },
      request: { type: 'string' },
      subject: { type: 'string' },
      out: { type: 'string' },
      'issued-at': { type: 'string' },
      'expires-at': { type: 'string' },
      epoch: { type: 'string' },
    },
  });
  switch (positionals[0]) {
    case 'keygen':
      if (!values.issuer) throw new Error(USAGE);
      return keygen(values.issuer);
    case 'issue':
      return issue(values);
    case 'personas':
      return issuePersonas();
    default:
      throw new Error(USAGE);
  }
};

main().then(
  (message) => process.stdout.write(`${message}\n`),
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  },
);
