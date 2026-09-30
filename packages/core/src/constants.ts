// Sizes fixed by the Compact struct definitions (packages/contract/src/modules).
// packages/core/test/core.test.ts ("constants match the compiled circuit") proves these match the contract.
export const CLAIM_SLOTS = 8;
export const MAX_CONDITIONS = 4;
export const SET_SIZE = 4;
// MerkleTree<6, ...> in stateproof.compact: at most 64 issuer registrations.
export const ISSUER_TREE_DEPTH = 6;
export const ISSUER_SLOTS = 2 ** ISSUER_TREE_DEPTH;

// Claims are Uint<64> in the circuit.
export const MAX_CLAIM_VALUE = 2n ** 64n - 1n;

export const SECONDS_PER_DAY = 86_400;

// createRequest accepts a reference time at most this far behind the chain clock.
export const REFERENCE_TOLERANCE_SECONDS = 3_600;

export const CREDENTIAL_FORMAT = 'stateproof-credential/v2';
export const SIGNATURE_TYPE = 'StateProofJubjubSchnorr2026';
