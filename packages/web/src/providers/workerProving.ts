// ProofProvider backed by prover.worker.ts. The key location passed by Midnight.js is
// ignored here because zkir reads it from the serialized preimage itself.
import { createProofProvider, type ProofProvider } from '@midnight-ntwrk/midnight-js-types';
import type { ProverRequest, ProverResponse } from './prover.worker';

type Pending = { resolve(r: ProverResponse): void; reject(e: Error): void };
type RequestBody = ProverRequest extends infer R ? (R extends ProverRequest ? Omit<R, 'id' | 'zkBase'> : never) : never;

export const createWorkerProofProvider = (zkBase: string): ProofProvider => {
  const worker = new Worker(new URL('./prover.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, Pending>();
  let nextId = 0;
  worker.onmessage = (event: MessageEvent<ProverResponse>) => {
    const entry = pending.get(event.data.id);
    if (!entry) return;
    pending.delete(event.data.id);
    entry.resolve(event.data);
  };
  worker.onerror = (event: ErrorEvent) => {
    const error = new Error(`Prover worker crashed: ${event.message}`);
    pending.forEach((entry) => entry.reject(error));
    pending.clear();
  };
  const call = (req: RequestBody): Promise<ProverResponse> => {
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
