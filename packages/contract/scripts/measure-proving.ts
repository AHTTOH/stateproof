// Measures real ZK proving time for every v2 circuit with the zkir-v2 WASM prover (the same
// prover the browser runs in a Web Worker). Circuit call data comes from the in-process
// simulator; `proofDataIntoSerializedPreimage` turns it into the prover's input.
// Usage: npx tsx scripts/measure-proving.ts [--out ../../docs/proving-times.json]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proofDataIntoSerializedPreimage } from '@midnight-ntwrk/onchain-runtime-v3';
import { provingProvider, Zkir } from '@midnight-ntwrk/zkir-v2';
import { holderCredential, openRequest, world } from '../test/fixtures.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const managed = path.join(here, '../src/managed/stateproof');
const networks = JSON.parse(readFileSync(path.join(here, '../../../config/networks.json'), 'utf8'));
const artifacts: string = networks.preprod.zkArtifacts;
// Shared with the web build; filled by scripts/fetch-zk-params.sh where S3 is blocked.
const cacheDir = path.join(here, '../../../.zk-params');

const params = async (k: number): Promise<Uint8Array> => {
  const file = path.join(cacheDir, `bls_midnight_2p${k}`);
  if (existsSync(file)) return new Uint8Array(readFileSync(file));
  mkdirSync(cacheDir, { recursive: true });
  const res = await fetch(`${artifacts}/bls_midnight_2p${k}`);
  if (!res.ok) throw new Error(`params k=${k}: HTTP ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  writeFileSync(file, bytes);
  return bytes;
};

const keys = (circuit: string) => ({
  proverKey: new Uint8Array(readFileSync(path.join(managed, 'keys', `${circuit}.prover`))),
  verifierKey: new Uint8Array(readFileSync(path.join(managed, 'keys', `${circuit}.verifier`))),
  ir: new Uint8Array(readFileSync(path.join(managed, 'zkir', `${circuit}.bzkir`))),
});

const prover = provingProvider({ lookupKey: async (location) => keys(location), getParams: params });

const w = world();
const fx = holderCredential(w);
const id = openRequest(w);
w.sim.asHolder(fx.inputs).submitProof(id);
w.sim.asIssuer(w.issuer.secretScalar).rotateIssuerEpoch(w.issuerId);

const results: { circuit: string; k: number; proofBytes: number; proveMs: number; checked: boolean }[] = [];
for (const call of w.sim.calls) {
  const data = call.transcript as {
    input: Parameters<typeof proofDataIntoSerializedPreimage>[0];
    output: Parameters<typeof proofDataIntoSerializedPreimage>[1];
    publicTranscript: Parameters<typeof proofDataIntoSerializedPreimage>[2];
    privateTranscriptOutputs: Parameters<typeof proofDataIntoSerializedPreimage>[3];
  };
  const preimage = proofDataIntoSerializedPreimage(data.input, data.output, data.publicTranscript, data.privateTranscriptOutputs, call.circuit);
  const k = Zkir.deserialize(keys(call.circuit).ir).getK();
  await prover.check(preimage, call.circuit);
  const t0 = performance.now();
  const proof = await prover.prove(preimage, call.circuit);
  const proveMs = Math.round(performance.now() - t0);
  results.push({ circuit: call.circuit, k, proofBytes: proof.length, proveMs, checked: true });
  console.log(`${call.circuit.padEnd(18)} k=${k} proof=${proof.length}B ${proveMs}ms`);
}

const outArg = process.argv.indexOf('--out');
if (outArg > 0) {
  const out = path.resolve(process.argv[outArg + 1]);
  writeFileSync(
    out,
    JSON.stringify(
      { measuredAt: new Date().toISOString(), runtime: `node ${process.version}`, platform: `${process.platform}-${process.arch}`, prover: '@midnight-ntwrk/zkir-v2 WASM', results },
      null,
      2,
    ) + '\n',
  );
  console.log(`wrote ${out}`);
}
