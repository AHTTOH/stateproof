// Message format between the page and prover.worker.ts. Kept separate so the page can
// import it without pulling the prover WASM into the main bundle.
export type ProverRequest =
  | { readonly id: number; readonly op: 'prove'; readonly preimage: Uint8Array; readonly overwriteBindingInput?: bigint; readonly zkBase: string }
  | { readonly id: number; readonly op: 'check'; readonly preimage: Uint8Array; readonly zkBase: string };

// Sent once after the WASM module has initialised; see workerProving.ts.
export const WORKER_READY = 'stateproof-prover-ready';

export type ProverResponse =
  | { readonly id: number; readonly ok: true; readonly proof?: Uint8Array; readonly checked?: (bigint | undefined)[] }
  | { readonly id: number; readonly ok: false; readonly error: string };
