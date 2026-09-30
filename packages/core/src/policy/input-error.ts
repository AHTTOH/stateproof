// A policy the verifier is still composing can be incomplete or invalid. The code lets a UI
// explain the problem in its own language; the message stays English for logs and the CLI.
export type PolicyInputErrorCode =
  | 'noConditions'
  | 'tooManyConditions'
  | 'operatorNotAllowed'
  | 'valueRequired'
  | 'invalidValue'
  | 'boundsReversed'
  | 'setEmpty'
  | 'setTooLarge'
  // Mirrors createRequest's minimal-disclosure rule for sensitive claims.
  | 'protectedExact'
  | 'protectedRevealed'
  | 'protectedTooNarrow';

export class PolicyInputError extends Error {
  constructor(
    readonly code: PolicyInputErrorCode,
    message: string,
    // Claim key the problem is about, or null for policy-wide problems.
    readonly claimKey: string | null,
    // The limit that was exceeded, for the "too many" codes; null otherwise.
    readonly limit: number | null,
  ) {
    super(message);
    this.name = 'PolicyInputError';
  }
}
