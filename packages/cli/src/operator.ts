// Long-running operator: restores the wallet once (minutes on Preprod) and then runs tasks on
// request, so repeated commands do not pay the restore cost. Listens on 127.0.0.1 only.
//   npm run operator -w @stateproof/cli -- --network preprod
//   curl -X POST http://127.0.0.1:$OPERATOR_PORT/status | /register-schemas | /register-issuers | /exit
import { createServer } from 'node:http';
import { parseArgs } from 'node:util';
import { loadCliConfig, requireEnv, resolveNetworkName } from './config.js';
import { registerIssuers, registerSchemas, walletStatus } from './commands.js';
import { runSession, type Session } from './session.js';

const LISTEN_HOST = '127.0.0.1';

const TASKS: Record<string, (s: Session) => Promise<unknown>> = {
  '/status': walletStatus,
  '/register-schemas': registerSchemas,
  '/register-issuers': registerIssuers,
};

const serve = (session: Session, port: number): Promise<void> =>
  new Promise((resolve) => {
    let queue: Promise<unknown> = Promise.resolve();
    const server = createServer((req, res) => {
      const url = req.url ?? '';
      if (req.method !== 'POST') {
        res.writeHead(405).end('POST only\n');
        return;
      }
      if (url === '/exit') {
        res.end('stopping\n');
        server.close(() => resolve());
        return;
      }
      const task = TASKS[url];
      if (!task) {
        res.writeHead(404).end(`unknown task ${url}; available: ${Object.keys(TASKS).join(' ')} /exit\n`);
        return;
      }
      // Tasks share one wallet, so they run strictly one after another.
      queue = queue.then(async () => {
        session.logger.info(`task ${url} started`);
        try {
          const result = await task(session);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(`${JSON.stringify({ ok: true, result: result ?? null })}\n`);
          session.logger.info(`task ${url} done`);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          session.logger.error(`task ${url} failed: ${message}`);
          res.writeHead(500, { 'Content-Type': 'application/json' }).end(`${JSON.stringify({ ok: false, error: message })}\n`);
        }
      });
    });
    server.listen(port, LISTEN_HOST, () => session.logger.info(`operator ready on http://${LISTEN_HOST}:${port}`));
  });

const { values } = parseArgs({ options: { network: { type: 'string' } } });
runSession('operator', loadCliConfig(resolveNetworkName(values.network)), (session) => serve(session, Number(requireEnv('OPERATOR_PORT')))).then(
  () => process.exit(0),
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    process.exit(1);
  },
);
