import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum Op { ignore = 0,
                 gte = 1,
                 lte = 2,
                 eq = 3,
                 neq = 4,
                 between = 5,
                 inSet = 6
}

export type Credential = { schemaId: Uint8Array;
                           issuerId: Uint8Array;
                           holderCommit: bigint;
                           claims: bigint[];
                           issuedAt: bigint;
                           expiresAt: bigint;
                           salt: Uint8Array
                         };

export type Signature = { r: __compactRuntime.JubjubPoint; s: bigint };

export type Condition = { claimIndex: bigint;
                          op: Op;
                          value: bigint;
                          value2: bigint;
                          set: bigint[]
                        };

export type Policy = { schemaId: Uint8Array;
                       issuerId: Uint8Array;
                       conditions: Condition[];
                       revealSlot: { is_some: boolean, value: bigint }
                     };

export type Request = { policy: Policy; referenceTime: bigint; expiresAt: bigint
                      };

export type VerificationResult = { revealed: { is_some: boolean, value: bigint }
                                 };

export type Witnesses<PS> = {
  adminSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  credential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Credential];
  credentialSignature(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Signature];
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  credentialDomain(): Uint8Array;
  signatureDomain(): Uint8Array;
  holderDomain(): Uint8Array;
  adminDomain(): Uint8Array;
  credentialRoot(credential_0: Credential): bigint;
  signingChallenge(root_0: bigint,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   r_0: __compactRuntime.JubjubPoint): bigint;
  holderCommitment(secret_0: Uint8Array): bigint;
  derivePublicKey(secretScalar_0: bigint): __compactRuntime.JubjubPoint;
  assertUsablePoint(point_0: __compactRuntime.JubjubPoint): [];
  isValidSignature(publicKey_0: __compactRuntime.JubjubPoint,
                   signature_0: Signature,
                   challenge_0: bigint): boolean;
  selectClaim(claims_0: bigint[], index_0: bigint): bigint;
  conditionHolds(claims_0: bigint[], condition_0: Condition): boolean;
  policyHolds(claims_0: bigint[], policy_0: Policy): boolean;
  assertWellFormedPolicy(policy_0: Policy): [];
  revealedClaim(claims_0: bigint[],
                revealSlot_0: { is_some: boolean, value: bigint }): { is_some: boolean,
                                                                      value: bigint
                                                                    };
}

export type Circuits<PS> = {
  credentialDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  signatureDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  adminDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credentialRoot(context: __compactRuntime.CircuitContext<PS>,
                 credential_0: Credential): __compactRuntime.CircuitResults<PS, bigint>;
  signingChallenge(context: __compactRuntime.CircuitContext<PS>,
                   root_0: bigint,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   r_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, bigint>;
  holderCommitment(context: __compactRuntime.CircuitContext<PS>,
                   secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  derivePublicKey(context: __compactRuntime.CircuitContext<PS>,
                  secretScalar_0: bigint): __compactRuntime.CircuitResults<PS, __compactRuntime.JubjubPoint>;
  assertUsablePoint(context: __compactRuntime.CircuitContext<PS>,
                    point_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  isValidSignature(context: __compactRuntime.CircuitContext<PS>,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   signature_0: Signature,
                   challenge_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  selectClaim(context: __compactRuntime.CircuitContext<PS>,
              claims_0: bigint[],
              index_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  conditionHolds(context: __compactRuntime.CircuitContext<PS>,
                 claims_0: bigint[],
                 condition_0: Condition): __compactRuntime.CircuitResults<PS, boolean>;
  policyHolds(context: __compactRuntime.CircuitContext<PS>,
              claims_0: bigint[],
              policy_0: Policy): __compactRuntime.CircuitResults<PS, boolean>;
  assertWellFormedPolicy(context: __compactRuntime.CircuitContext<PS>,
                         policy_0: Policy): __compactRuntime.CircuitResults<PS, []>;
  revealedClaim(context: __compactRuntime.CircuitContext<PS>,
                claims_0: bigint[],
                revealSlot_0: { is_some: boolean, value: bigint }): __compactRuntime.CircuitResults<PS, { is_some: boolean,
                                                                                                          value: bigint
                                                                                                        }>;
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  issuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): __compactRuntime.JubjubPoint;
    [Symbol.iterator](): Iterator<[Uint8Array, __compactRuntime.JubjubPoint]>
  };
  requests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Request;
    [Symbol.iterator](): Iterator<[Uint8Array, Request]>
  };
  results: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): VerificationResult;
    [Symbol.iterator](): Iterator<[Uint8Array, VerificationResult]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
