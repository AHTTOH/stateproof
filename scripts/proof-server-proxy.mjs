#!/usr/bin/env node
// Forwards http://127.0.0.1:6300 (where Lace expects a local proof server) to the proof
// server configured for the network in config/networks.json.
//
// Why: Lace only offers a local proof server for its own fee (DUST) proofs. Those requests
// are small, and the Midnight public proof server accepts them. StateProof circuit proofs
// never go through here: the web app proves them in the browser.
// Privacy trade-off: the wallet's fee proof inputs travel to the public server. Use the
// Docker proof server (infra/proof-server) to keep everything on your machine.
//
// Usage: node scripts/proof-server-proxy.mjs <network>     e.g. preprod
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LISTEN_HOST = '127.0.0.1';
const LISTEN_PORT = 6300;
const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'transfer-encoding', 'keep-alive']);

const network = process.argv[2];
if (!network) {
  console.error('usage: node scripts/proof-server-proxy.mjs <network>');
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const networks = JSON.parse(readFileSync(path.join(root, 'config', 'networks.json'), 'utf8'));
const upstream = networks[network]?.proofServer;
if (!upstream) {
  console.error(`config/networks.json has no proofServer for "${network}"`);
  process.exit(1);
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

createServer(async (req, res) => {
  const started = Date.now();
  try {
    const body = await readBody(req);
    const headers = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !HOP_BY_HOP.has(k)));
    const response = await fetch(new URL(req.url, upstream), {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });
    const out = Buffer.from(await response.arrayBuffer());
    response.headers.forEach((v, k) => {
      if (!HOP_BY_HOP.has(k) && k !== 'content-encoding') res.setHeader(k, v);
    });
    res.writeHead(response.status);
    res.end(out);
    console.log(`${req.method} ${req.url} ${body.length}B -> ${response.status} ${out.length}B ${Date.now() - started}ms`);
  } catch (e) {
    console.error(`${req.method} ${req.url} failed: ${e.message}`);
    res.writeHead(502);
    res.end(`proxy error: ${e.message}`);
  }
}).listen(LISTEN_PORT, LISTEN_HOST, () => console.log(`proof server proxy ${LISTEN_HOST}:${LISTEN_PORT} -> ${upstream}`));
