// Local ZK proving with the zkir-v2 WASM prover (Node and browser).
// Separate entry point (@stateproof/contract/proving) so code that never proves
// does not pull the prover WASM into its bundle.
import { provingProvider } from '@midnight-ntwrk/zkir-v2';
import { createProofProvider, type ProofProvider } from '@midnight-ntwrk/midnight-js-types';

export interface KeyMaterial {
  readonly proverKey: Uint8Array;
  readonly verifierKey: Uint8Array;
  readonly ir: Uint8Array;
}

export interface KeyMaterialSource {
  // StateProof circuits: keys/<id>.prover, keys/<id>.verifier, zkir/<id>.bzkir
  circuitKeys(circuitId: string): Promise<KeyMaterial>;
  // Built-in Midnight circuits such as midnight/zswap/spend, fetched from the public artifact store
  midnightKeys(location: string): Promise<KeyMaterial>;
  // Public parameters bls_midnight_2p{k}
  params(k: number): Promise<Uint8Array>;
}

const MIDNIGHT_KEY_PREFIX = 'midnight/';

export const createWasmProofProvider = (source: KeyMaterialSource): ProofProvider =>
  createProofProvider(
    provingProvider({
      lookupKey: (location: string) =>
        location.startsWith(MIDNIGHT_KEY_PREFIX) ? source.midnightKeys(location) : source.circuitKeys(location),
      getParams: (k: number) => source.params(k),
    }),
  );

// URL layout of the public artifact store (same as wallet-sdk-prover-client).
export const midnightKeyUrls = (baseUrl: string, version: number, location: string) => {
  const [, kind, name] = location.split('/');
  if (!kind || !name) throw new Error(`Unexpected Midnight key location ${location}`);
  const stem = `${baseUrl}/${kind}/${version}/${name}`;
  return { prover: `${stem}.prover`, verifier: `${stem}.verifier`, ir: `${stem}.bzkir` };
};

export const paramsUrl = (baseUrl: string, k: number): string => `${baseUrl}/bls_midnight_2p${k}`;
