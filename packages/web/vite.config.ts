import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { Zkir } from '@midnight-ntwrk/zkir-v2';

const WEB_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(WEB_DIR, '..', '..');
const MANAGED_DIR = path.join(REPO_ROOT, 'packages', 'contract', 'src', 'managed', 'stateproof');
const ZK_ROUTE = 'zk';

const rootEnv = path.join(REPO_ROOT, '.env');
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
const network = process.env.STATEPROOF_NETWORK;
if (!network) throw new Error('STATEPROOF_NETWORK is not set (see .env.example)');
const networks = JSON.parse(readFileSync(path.join(REPO_ROOT, 'config', 'networks.json'), 'utf8')) as Record<
  string,
  { zkArtifacts?: string }
>;
const zkArtifacts = networks[network]?.zkArtifacts;
if (!zkArtifacts) throw new Error(`config/networks.json ${network} has no zkArtifacts`);

// Public parameters sizes the compiled circuits need, read from the circuits themselves.
const circuitKs = (): number[] => {
  const dir = path.join(MANAGED_DIR, 'zkir');
  const ks = readdirSync(dir)
    .filter((f) => f.endsWith('.bzkir'))
    .map((f) => Zkir.deserialize(new Uint8Array(readFileSync(path.join(dir, f)))).getK());
  return [...new Set(ks)].sort((a, b) => a - b);
};

const fetchParams = async (k: number): Promise<Uint8Array> => {
  const url = `${zkArtifacts}/bls_midnight_2p${k}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
};

// Serves /zk/keys, /zk/zkir from the committed contract artifacts and /zk/params from
// the Midnight public store. The public store sends no CORS headers, so the browser
// must get the parameters from our own origin; the build copies them into dist.
const zkAssets = (): Plugin => {
  const paramCache = new Map<number, Uint8Array>();
  const params = async (k: number) => {
    const hit = paramCache.get(k);
    if (hit) return hit;
    const bytes = await fetchParams(k);
    paramCache.set(k, bytes);
    return bytes;
  };
  return {
    name: 'stateproof-zk-assets',
    configureServer(server) {
      server.middlewares.use(`/${ZK_ROUTE}`, (req, res, next) => {
        const url = req.url ?? '';
        const artifact = url.match(/^\/(keys|zkir)\/([A-Za-z0-9]+\.(prover|verifier|bzkir))$/);
        const param = url.match(/^\/params\/bls_midnight_2p(\d+)$/);
        if (artifact) {
          res.setHeader('Content-Type', 'application/octet-stream');
          res.end(readFileSync(path.join(MANAGED_DIR, artifact[1], artifact[2])));
          return;
        }
        if (param) {
          params(Number(param[1])).then(
            (bytes) => {
              res.setHeader('Content-Type', 'application/octet-stream');
              res.end(bytes);
            },
            (err: unknown) => next(err),
          );
          return;
        }
        next();
      });
    },
    async generateBundle() {
      for (const sub of ['keys', 'zkir']) {
        for (const file of readdirSync(path.join(MANAGED_DIR, sub)).filter((f) => !f.endsWith('.zkir'))) {
          this.emitFile({ type: 'asset', fileName: `${ZK_ROUTE}/${sub}/${file}`, source: readFileSync(path.join(MANAGED_DIR, sub, file)) });
        }
      }
      for (const k of circuitKs()) {
        this.emitFile({ type: 'asset', fileName: `${ZK_ROUTE}/params/bls_midnight_2p${k}`, source: await params(k) });
      }
    },
  };
};

export default defineConfig({
  cacheDir: './.vite',
  define: {
    __STATEPROOF_NETWORK__: JSON.stringify(network),
    __STATEPROOF_ZK_ROUTE__: JSON.stringify(ZK_ROUTE),
  },
  build: {
    target: 'esnext',
    commonjsOptions: { transformMixedEsModules: true, extensions: ['.js', '.cjs'], ignoreDynamicRequires: true },
  },
  plugins: [react(), wasm(), zkAssets()],
  optimizeDeps: {
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: [
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js',
      '@midnight-ntwrk/zkir-v2',
    ],
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
});
