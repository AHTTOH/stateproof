// StateProof v2 operator CLI.
//   npm run cli -- <command> --network <undeployed|preprod|preview> [options]
//
//   deploy                                     deploy a fresh contract, record it in config/deployments.json
//   register-schemas                           register career and youth-work with their schema rules
//   register-issuers                           register every issuer in config/issuers.json (id, schema, key, slot)
//   demo-requests [--ttl-days 30] [--sealed-for minji]
//                                              open postings for both schemas plus one sealed request
//   prove --request <hex> --persona <id> --schema <id> [--nonce <hex>]
//                                              submit one proof with a demo persona (config/demo-personas.v2.json)
//   rotate-epoch --issuer <id>                 the issuer rotates its epoch (revokes everything it issued)
//   address                                    the operator wallet's unshielded address (for the faucet), no sync
//   status                                     wallet NIGHT / DUST balances
//   e2e [--out <file>]                         the whole story on a fresh contract, writes docs/<network>-run.json
//
// Every command also takes --prover <wasm|proof-server> to override config/networks.json.
import { parseArgs } from 'node:util';
import { loadCliConfig, resolveNetworkName, type ProverKind } from './config.js';
import { demoRequests, deploy, prove, registerIssuers, registerSchemas, rotateEpoch, walletStatus } from './commands.js';
import { defaultRunFile, runE2E } from './e2e.js';
import { runSession } from './session.js';
import { unshieldedAddress } from './wallet.js';

const USAGE = 'usage: main.ts <address|deploy|register-schemas|register-issuers|demo-requests|prove|rotate-epoch|status|e2e> --network <name> [options]';

const main = async (): Promise<number> => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      network: { type: 'string' },
      prover: { type: 'string' },
      'ttl-days': { type: 'string' },
      'sealed-for': { type: 'string' },
      request: { type: 'string' },
      persona: { type: 'string' },
      schema: { type: 'string' },
      nonce: { type: 'string' },
      issuer: { type: 'string' },
      out: { type: 'string' },
    },
  });
  const command = positionals[0];
  if (!command) throw new Error(USAGE);
  if (values.prover !== undefined && values.prover !== 'wasm' && values.prover !== 'proof-server') throw new Error('--prover must be wasm or proof-server');
  const networkName = resolveNetworkName(values.network);
  const config = loadCliConfig(networkName, { prover: values.prover as ProverKind | undefined });
  switch (command) {
    case 'deploy':
      await runSession(command, config, deploy);
      return 0;
    case 'register-schemas':
      await runSession(command, config, registerSchemas);
      return 0;
    case 'register-issuers':
      await runSession(command, config, registerIssuers);
      return 0;
    case 'demo-requests': {
      const ttl = values['ttl-days'] ?? '30';
      if (!/^\d+$/.test(ttl) || Number(ttl) < 1) throw new Error('--ttl-days must be a positive integer');
      await runSession(command, config, (s) => demoRequests(s, { ttlDays: Number(ttl), sealedFor: values['sealed-for'] ?? 'minji' }));
      return 0;
    }
    case 'prove': {
      const { request, persona, schema, nonce } = values;
      if (!request || !persona || !schema) throw new Error('usage: prove --request <hex> --persona <id> --schema <career|youth-work> [--nonce <hex>]');
      await runSession(command, config, (s) => prove(s, { request, persona, schema, nonce }));
      return 0;
    }
    case 'rotate-epoch': {
      const issuer = values.issuer;
      if (!issuer) throw new Error('usage: rotate-epoch --issuer <id>');
      await runSession(command, config, (s) => rotateEpoch(s, { issuer }));
      return 0;
    }
    case 'address':
      process.stdout.write(`${unshieldedAddress(config)}
`);
      return 0;
    case 'status':
      await runSession(command, config, async (s) => void (await walletStatus(s)));
      return 0;
    case 'e2e': {
      const ok = await runSession(command, config, (s) => runE2E(s, { outFile: values.out ?? defaultRunFile(networkName) }));
      return ok ? 0 : 1;
    }
    default:
      throw new Error(USAGE);
  }
};

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    process.exit(1);
  },
);
