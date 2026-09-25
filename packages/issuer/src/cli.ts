// Issuer CLI.
//   npm run issue -w @stateproof/issuer -- keygen --issuer issuer:acme-hr
//   npm run issue -w @stateproof/issuer -- personas
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { ENV_FILE, keygen } from './keys/keygen.js';
import { issuePersonas } from './issue/personas.js';

const USAGE = 'usage: cli.ts keygen --issuer <id> | personas';

const main = async (): Promise<string> => {
  if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
  const { positionals, values } = parseArgs({ allowPositionals: true, options: { issuer: { type: 'string' } } });
  switch (positionals[0]) {
    case 'keygen':
      if (!values.issuer) throw new Error(USAGE);
      return keygen(values.issuer);
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
