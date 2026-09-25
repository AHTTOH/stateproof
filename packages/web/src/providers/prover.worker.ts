// Runs the zkir WASM prover off the main thread. Keys and parameters are fetched here
// from the app origin, so the page stays responsive while a proof is generated.
import { check, prove, type KeyMaterialProvider } from '@midnight-ntwrk/zkir-v2';

export type ProverRequest =
  | { readonly id: number; readonly op: 'prove'; readonly preimage: Uint8Array; readonly overwriteBindingInput?: bigint; readonly zkBase: string }
  | { readonly id: number; readonly op: 'check'; readonly preimage: Uint8Array; readonly zkBase: string };

export type ProverResponse =
  | { readonly id: number; readonly ok: true; readonly proof?: Uint8Array; readonly checked?: (bigint | undefined)[] }
  | { readonly id: number; readonly ok: false; readonly error: string };

const fetchBytes = async (url: string): Promise<Uint8Array> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (type.includes('text/html')) throw new Error(`GET ${url} returned HTML, the artifact is missing`);
  return new Uint8Array(await res.arrayBuffer());
};

const keyMaterial = (zkBase: string): KeyMaterialProvider => ({
  lookupKey: async (location) => {
    if (location.startsWith('midnight/')) throw new Error(`${location} is proved by the wallet, not by this app`);
    const [proverKey, verifierKey, ir] = await Promise.all([
      fetchBytes(new URL(`keys/${location}.prover`, zkBase).toString()),
      fetchBytes(new URL(`keys/${location}.verifier`, zkBase).toString()),
      fetchBytes(new URL(`zkir/${location}.bzkir`, zkBase).toString()),
    ]);
    return { proverKey, verifierKey, ir };
  },
  getParams: (k) => fetchBytes(new URL(`params/bls_midnight_2p${k}`, zkBase).toString()),
});

self.onmessage = async (event: MessageEvent<ProverRequest>) => {
  const req = event.data;
  try {
    const km = keyMaterial(req.zkBase);
    const response: ProverResponse =
      req.op === 'prove'
        ? { id: req.id, ok: true, proof: await prove(req.preimage, km, req.overwriteBindingInput) }
        : { id: req.id, ok: true, checked: await check(req.preimage, km) };
    self.postMessage(response);
  } catch (e) {
    self.postMessage({ id: req.id, ok: false, error: e instanceof Error ? e.message : String(e) } satisfies ProverResponse);
  }
};
