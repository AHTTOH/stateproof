// ProofProvider backed by prover.worker.ts. The key location passed by Midnight.js is
// ignored here because zkir reads it from the serialized preimage itself.
import { createProofProvider, type ProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { WORKER_READY, type ProverRequest, type ProverResponse } from './proverProtocol';

type Pending = { resolve(r: ProverResponse): void; reject(e: Error): void };

// A worker that has not finished loading its WASM by then is treated as failed.
const WORKER_START_TIMEOUT_MS = 60_000;
// One worker per artifact origin, shared by the Lace flow and the wallet-free proof.
const providers = new Map<string, ProofProvider>();
type RequestBody = ProverRequest extends infer R ? (R extends ProverRequest ? Omit<R, 'id' | 'zkBase'> : never) : never;

export const workerProofProvider = (zkBase: string): ProofProvider => {
  const existing = providers.get(zkBase);
  if (existing) return existing;
  const created = createWorkerProofProvider(zkBase, () => providers.delete(zkBase));
  providers.set(zkBase, created);
  return created;
};

// onDead drops the cached provider so the next proof starts a fresh worker.
const createWorkerProofProvider = (zkBase: string, onDead: () => void): ProofProvider => {
  const worker = new Worker(new URL('./prover.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, Pending>();
  let nextId = 0;
  let markReady: () => void = () => {};
  let markFailed: (e: Error) => void = () => {};
  const ready = new Promise<void>((resolve, reject) => {
    markReady = resolve;
    markFailed = reject;
  });
  const startTimer = setTimeout(() => {
    markFailed(new Error(`The prover did not start within ${WORKER_START_TIMEOUT_MS / 1000}s. Check the connection and try again.`));
    worker.terminate();
    onDead();
  }, WORKER_START_TIMEOUT_MS);
  worker.onmessage = (event: MessageEvent<ProverResponse | typeof WORKER_READY>) => {
    if (event.data === WORKER_READY) {
      clearTimeout(startTimer);
      markReady();
      return;
    }
    const entry = pending.get(event.data.id);
    if (!entry) return;
    pending.delete(event.data.id);
    entry.resolve(event.data);
  };
  worker.onerror = (event: ErrorEvent) => {
    const error = new Error(`Prover worker crashed: ${event.message}`);
    clearTimeout(startTimer);
    markFailed(error);
    worker.terminate();
    onDead();
    pending.forEach((entry) => entry.reject(error));
    pending.clear();
  };
  const call = async (req: RequestBody): Promise<ProverResponse> => {
    await ready;
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ ...req, id, zkBase } as ProverRequest);
    });
  };
  const unwrap = (r: ProverResponse): Extract<ProverResponse, { ok: true }> => {
    if (!r.ok) throw new Error(`Proof generation failed: ${r.error}`);
    return r;
  };
  return createProofProvider({
    prove: async (preimage, _keyLocation, overwriteBindingInput) => {
      const r = unwrap(await call({ op: 'prove', preimage, overwriteBindingInput }));
      if (!r.proof) throw new Error('Prover returned no proof');
      return r.proof;
    },
    check: async (preimage) => {
      const r = unwrap(await call({ op: 'check', preimage }));
      if (!r.checked) throw new Error('Prover returned no check result');
      return r.checked;
    },
  });
};
