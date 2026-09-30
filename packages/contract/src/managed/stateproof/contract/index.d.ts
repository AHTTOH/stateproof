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
                           epoch: bigint;
                           holderCommit: bigint;
                           subjectId: bigint;
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
                       conditions: Condition[];
                       revealSlot: { is_some: boolean, value: bigint }
                     };

export type SlotRule = { sensitive: boolean; minWidth: bigint };

export type SchemaRule = { slots: SlotRule[] };

export type Bounds = { lo: bigint; hi: bigint; exact: boolean };

export type Request = { policy: Policy;
                        referenceTime: bigint;
                        expiresAt: bigint;
                        subjectCommit: { is_some: boolean, value: bigint }
                      };

export type Answer = { revealed: { is_some: boolean, value: bigint } };

export type IssuerRecord = { schemaId: Uint8Array;
                             publicKey: __compactRuntime.JubjubPoint;
                             epoch: bigint;
                             slot: bigint;
                             active: boolean
                           };

export type Witnesses<PS> = {
  adminSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  issuerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  credential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Credential];
  credentialSignature(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Signature];
  holderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  issuerPublicKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, __compactRuntime.JubjubPoint];
  issuerPath(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { leaf: Uint8Array,
                                                                           path: { sibling: { field: bigint
                                                                                            },
                                                                                   goes_left: boolean
                                                                                 }[]
                                                                         }];
  requestNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerSchema(context: __compactRuntime.CircuitContext<PS>,
                 schemaId_0: Uint8Array,
                 rule_0: SchemaRule): __compactRuntime.CircuitResults<PS, []>;
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 schemaId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint,
                 slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rotateIssuerEpoch(context: __compactRuntime.CircuitContext<PS>,
                    issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deactivateIssuer(context: __compactRuntime.CircuitContext<PS>,
                   issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint,
                subjectCommit_0: { is_some: boolean, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type ProvableCircuits<PS> = {
  registerSchema(context: __compactRuntime.CircuitContext<PS>,
                 schemaId_0: Uint8Array,
                 rule_0: SchemaRule): __compactRuntime.CircuitResults<PS, []>;
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 schemaId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint,
                 slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rotateIssuerEpoch(context: __compactRuntime.CircuitContext<PS>,
                    issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deactivateIssuer(context: __compactRuntime.CircuitContext<PS>,
                   issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint,
                subjectCommit_0: { is_some: boolean, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type PureCircuits = {
  credentialDomain(): Uint8Array;
  signatureDomain(): Uint8Array;
  holderDomain(): Uint8Array;
  adminDomain(): Uint8Array;
  issuerLeafDomain(): Uint8Array;
  subjectDomain(): Uint8Array;
  subjectCommitDomain(): Uint8Array;
  pseudonymDomain(): Uint8Array;
  credentialRoot(credential_0: Credential): bigint;
  signingChallenge(root_0: bigint,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   r_0: __compactRuntime.JubjubPoint): bigint;
  holderCommitment(secret_0: Uint8Array): bigint;
  subjectIdOf(digest_0: Uint8Array): bigint;
  subjectCommitment(subjectId_0: bigint, nonce_0: Uint8Array): bigint;
  pseudonymFor(requestId_0: Uint8Array, secret_0: Uint8Array): Uint8Array;
  issuerLeaf(issuerId_0: Uint8Array,
             schemaId_0: Uint8Array,
             publicKey_0: __compactRuntime.JubjubPoint,
             epoch_0: bigint): Uint8Array;
  derivePublicKey(secretScalar_0: bigint): __compactRuntime.JubjubPoint;
  samePoint(a_0: __compactRuntime.JubjubPoint, b_0: __compactRuntime.JubjubPoint): boolean;
  assertUsablePoint(point_0: __compactRuntime.JubjubPoint): [];
  isValidSignature(publicKey_0: __compactRuntime.JubjubPoint,
                   signature_0: Signature,
                   challenge_0: bigint): boolean;
  slotIndexes(): bigint[];
  selectClaim(claims_0: bigint[], index_0: bigint): bigint;
  conditionHolds(claims_0: bigint[], condition_0: Condition): boolean;
  policyHolds(claims_0: bigint[], policy_0: Policy): boolean;
  assertWellFormedPolicy(policy_0: Policy): [];
  slotBounds(conditions_0: Condition[], slot_0: bigint): Bounds;
  slotRespected(policy_0: Policy, r_0: SlotRule, slot_0: bigint): boolean;
  respectsSensitiveSlots(policy_0: Policy, rule_0: SchemaRule): boolean;
  revealedClaim(claims_0: bigint[],
                revealSlot_0: { is_some: boolean, value: bigint }): { is_some: boolean,
                                                                      value: bigint
                                                                    };
  referenceTolerance(): bigint;
}

export type Circuits<PS> = {
  credentialDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  signatureDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  holderDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  adminDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issuerLeafDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  subjectDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  subjectCommitDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  pseudonymDomain(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credentialRoot(context: __compactRuntime.CircuitContext<PS>,
                 credential_0: Credential): __compactRuntime.CircuitResults<PS, bigint>;
  signingChallenge(context: __compactRuntime.CircuitContext<PS>,
                   root_0: bigint,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   r_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, bigint>;
  holderCommitment(context: __compactRuntime.CircuitContext<PS>,
                   secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  subjectIdOf(context: __compactRuntime.CircuitContext<PS>, digest_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  subjectCommitment(context: __compactRuntime.CircuitContext<PS>,
                    subjectId_0: bigint,
                    nonce_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  pseudonymFor(context: __compactRuntime.CircuitContext<PS>,
               requestId_0: Uint8Array,
               secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  issuerLeaf(context: __compactRuntime.CircuitContext<PS>,
             issuerId_0: Uint8Array,
             schemaId_0: Uint8Array,
             publicKey_0: __compactRuntime.JubjubPoint,
             epoch_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  derivePublicKey(context: __compactRuntime.CircuitContext<PS>,
                  secretScalar_0: bigint): __compactRuntime.CircuitResults<PS, __compactRuntime.JubjubPoint>;
  samePoint(context: __compactRuntime.CircuitContext<PS>,
            a_0: __compactRuntime.JubjubPoint,
            b_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, boolean>;
  assertUsablePoint(context: __compactRuntime.CircuitContext<PS>,
                    point_0: __compactRuntime.JubjubPoint): __compactRuntime.CircuitResults<PS, []>;
  isValidSignature(context: __compactRuntime.CircuitContext<PS>,
                   publicKey_0: __compactRuntime.JubjubPoint,
                   signature_0: Signature,
                   challenge_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  slotIndexes(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint[]>;
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
  slotBounds(context: __compactRuntime.CircuitContext<PS>,
             conditions_0: Condition[],
             slot_0: bigint): __compactRuntime.CircuitResults<PS, Bounds>;
  slotRespected(context: __compactRuntime.CircuitContext<PS>,
                policy_0: Policy,
                r_0: SlotRule,
                slot_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  respectsSensitiveSlots(context: __compactRuntime.CircuitContext<PS>,
                         policy_0: Policy,
                         rule_0: SchemaRule): __compactRuntime.CircuitResults<PS, boolean>;
  revealedClaim(context: __compactRuntime.CircuitContext<PS>,
                claims_0: bigint[],
                revealSlot_0: { is_some: boolean, value: bigint }): __compactRuntime.CircuitResults<PS, { is_some: boolean,
                                                                                                          value: bigint
                                                                                                        }>;
  referenceTolerance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  registerSchema(context: __compactRuntime.CircuitContext<PS>,
                 schemaId_0: Uint8Array,
                 rule_0: SchemaRule): __compactRuntime.CircuitResults<PS, []>;
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerId_0: Uint8Array,
                 schemaId_0: Uint8Array,
                 publicKey_0: __compactRuntime.JubjubPoint,
                 slot_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  rotateIssuerEpoch(context: __compactRuntime.CircuitContext<PS>,
                    issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deactivateIssuer(context: __compactRuntime.CircuitContext<PS>,
                   issuerId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policy_0: Policy,
                referenceTime_0: bigint,
                expiresAt_0: bigint,
                subjectCommit_0: { is_some: boolean, value: bigint }): __compactRuntime.CircuitResults<PS, []>;
  submitProof(context: __compactRuntime.CircuitContext<PS>,
              requestId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  issuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): IssuerRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, IssuerRecord]>
  };
  issuerSlots: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
  issuerTree: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
  schemaRules: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): SchemaRule;
    [Symbol.iterator](): Iterator<[Uint8Array, SchemaRule]>
  };
  requests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Request;
    [Symbol.iterator](): Iterator<[Uint8Array, Request]>
  };
  answers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): {
      isEmpty(): boolean;
      size(): bigint;
      member(key_1: Uint8Array): boolean;
      lookup(key_1: Uint8Array): Answer;
      [Symbol.iterator](): Iterator<[Uint8Array, Answer]>
    }
  };
  answerCounts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { read(): bigint }
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
