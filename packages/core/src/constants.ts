// Sizes fixed by the Compact struct definitions (packages/contract/src/modules).
// packages/core/test/core.test.ts ("constants match the compiled circuit") proves these match the contract.
export const CLAIM_SLOTS = 8;
export const MAX_CONDITIONS = 4;
export const SET_SIZE = 4;

// Claims are Uint<64> in the circuit.
export const MAX_CLAIM_VALUE = 2n ** 64n - 1n;

export const SECONDS_PER_DAY = 86_400;

export const CREDENTIAL_FORMAT = 'stateproof-credential/v1';
export const SIGNATURE_TYPE = 'StateProofJubjubSchnorr2026';
