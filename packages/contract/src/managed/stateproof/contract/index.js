import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var Op;
(function (Op) {
  Op[Op['ignore'] = 0] = 'ignore';
  Op[Op['gte'] = 1] = 'gte';
  Op[Op['lte'] = 2] = 'lte';
  Op[Op['eq'] = 3] = 'eq';
  Op[Op['neq'] = 4] = 'neq';
  Op[Op['between'] = 5] = 'between';
  Op[Op['inSet'] = 6] = 'inSet';
})(Op || (Op = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeEnum(6, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = new __compactRuntime.CompactTypeVector(4, _descriptor_3);

class _Condition_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment()))));
  }
  fromValue(value_0) {
    return {
      claimIndex: _descriptor_1.fromValue(value_0),
      op: _descriptor_2.fromValue(value_0),
      value: _descriptor_3.fromValue(value_0),
      value2: _descriptor_3.fromValue(value_0),
      set: _descriptor_4.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.claimIndex).concat(_descriptor_2.toValue(value_0.op).concat(_descriptor_3.toValue(value_0.value).concat(_descriptor_3.toValue(value_0.value2).concat(_descriptor_4.toValue(value_0.set)))));
  }
}

const _descriptor_5 = new _Condition_0();

const _descriptor_6 = new __compactRuntime.CompactTypeVector(4, _descriptor_5);

const _descriptor_7 = __compactRuntime.CompactTypeBoolean;

class _Maybe_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_7.fromValue(value_0),
      value: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.is_some).concat(_descriptor_1.toValue(value_0.value));
  }
}

const _descriptor_8 = new _Maybe_0();

class _Policy_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_8.alignment())));
  }
  fromValue(value_0) {
    return {
      schemaId: _descriptor_0.fromValue(value_0),
      issuerId: _descriptor_0.fromValue(value_0),
      conditions: _descriptor_6.fromValue(value_0),
      revealSlot: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.schemaId).concat(_descriptor_0.toValue(value_0.issuerId).concat(_descriptor_6.toValue(value_0.conditions).concat(_descriptor_8.toValue(value_0.revealSlot))));
  }
}

const _descriptor_9 = new _Policy_0();

class _Request_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()));
  }
  fromValue(value_0) {
    return {
      policy: _descriptor_9.fromValue(value_0),
      referenceTime: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.policy).concat(_descriptor_3.toValue(value_0.referenceTime).concat(_descriptor_3.toValue(value_0.expiresAt)));
  }
}

const _descriptor_10 = new _Request_0();

class _Maybe_1 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_3.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_7.fromValue(value_0),
      value: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.is_some).concat(_descriptor_3.toValue(value_0.value));
  }
}

const _descriptor_11 = new _Maybe_1();

class _VerificationResult_0 {
  alignment() {
    return _descriptor_11.alignment();
  }
  fromValue(value_0) {
    return {
      revealed: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_11.toValue(value_0.revealed);
  }
}

const _descriptor_12 = new _VerificationResult_0();

const _descriptor_13 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_14 = __compactRuntime.CompactTypeField;

const _descriptor_15 = new __compactRuntime.CompactTypeVector(8, _descriptor_3);

class _Credential_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_14.alignment().concat(_descriptor_15.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment()))))));
  }
  fromValue(value_0) {
    return {
      schemaId: _descriptor_0.fromValue(value_0),
      issuerId: _descriptor_0.fromValue(value_0),
      holderCommit: _descriptor_14.fromValue(value_0),
      claims: _descriptor_15.fromValue(value_0),
      issuedAt: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0),
      salt: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.schemaId).concat(_descriptor_0.toValue(value_0.issuerId).concat(_descriptor_14.toValue(value_0.holderCommit).concat(_descriptor_15.toValue(value_0.claims).concat(_descriptor_3.toValue(value_0.issuedAt).concat(_descriptor_3.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.salt)))))));
  }
}

const _descriptor_16 = new _Credential_0();

class _Signature_0 {
  alignment() {
    return _descriptor_13.alignment().concat(_descriptor_14.alignment());
  }
  fromValue(value_0) {
    return {
      r: _descriptor_13.fromValue(value_0),
      s: _descriptor_14.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.r).concat(_descriptor_14.toValue(value_0.s));
  }
}

const _descriptor_17 = new _Signature_0();

class _HolderPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      secret: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_0.toValue(value_0.secret));
  }
}

const _descriptor_18 = new _HolderPreimage_0();

const _descriptor_19 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _CredentialPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_16.alignment());
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      credential: _descriptor_16.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_16.toValue(value_0.credential));
  }
}

const _descriptor_20 = new _CredentialPreimage_0();

class _ChallengePreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_14.alignment().concat(_descriptor_13.alignment().concat(_descriptor_13.alignment())));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      root: _descriptor_14.fromValue(value_0),
      publicKey: _descriptor_13.fromValue(value_0),
      r: _descriptor_13.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_14.toValue(value_0.root).concat(_descriptor_13.toValue(value_0.publicKey).concat(_descriptor_13.toValue(value_0.r))));
  }
}

const _descriptor_21 = new _ChallengePreimage_0();

class _Either_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_7.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_22 = new _Either_0();

const _descriptor_23 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_24 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.adminSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named adminSecret');
    }
    if (typeof(witnesses_0.credential) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credential');
    }
    if (typeof(witnesses_0.credentialSignature) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named credentialSignature');
    }
    if (typeof(witnesses_0.holderSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named holderSecret');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      credentialDomain(context, ...args_1) {
        return { result: pureCircuits.credentialDomain(...args_1), context };
      },
      signatureDomain(context, ...args_1) {
        return { result: pureCircuits.signatureDomain(...args_1), context };
      },
      holderDomain(context, ...args_1) {
        return { result: pureCircuits.holderDomain(...args_1), context };
      },
      adminDomain(context, ...args_1) {
        return { result: pureCircuits.adminDomain(...args_1), context };
      },
      credentialRoot(context, ...args_1) {
        return { result: pureCircuits.credentialRoot(...args_1), context };
      },
      signingChallenge(context, ...args_1) {
        return { result: pureCircuits.signingChallenge(...args_1), context };
      },
      holderCommitment(context, ...args_1) {
        return { result: pureCircuits.holderCommitment(...args_1), context };
      },
      derivePublicKey(context, ...args_1) {
        return { result: pureCircuits.derivePublicKey(...args_1), context };
      },
      assertUsablePoint(context, ...args_1) {
        return { result: pureCircuits.assertUsablePoint(...args_1), context };
      },
      isValidSignature(context, ...args_1) {
        return { result: pureCircuits.isValidSignature(...args_1), context };
      },
      selectClaim(context, ...args_1) {
        return { result: pureCircuits.selectClaim(...args_1), context };
      },
      conditionHolds(context, ...args_1) {
        return { result: pureCircuits.conditionHolds(...args_1), context };
      },
      policyHolds(context, ...args_1) {
        return { result: pureCircuits.policyHolds(...args_1), context };
      },
      assertWellFormedPolicy(context, ...args_1) {
        return { result: pureCircuits.assertWellFormedPolicy(...args_1), context };
      },
      revealedClaim(context, ...args_1) {
        return { result: pureCircuits.revealedClaim(...args_1), context };
      },
      registerIssuer: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerIssuer: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerId_0 = args_1[1];
        const publicKey_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 44 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerId_0.buffer instanceof ArrayBuffer && issuerId_0.BYTES_PER_ELEMENT === 1 && issuerId_0.length === 32)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 44 char 1',
                                     'Bytes<32>',
                                     issuerId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerId_0).concat(_descriptor_13.toValue(publicKey_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_13.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerIssuer_0(context,
                                                partialProofData,
                                                issuerId_0,
                                                publicKey_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      createRequest: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`createRequest: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const policy_0 = args_1[2];
        const referenceTime_0 = args_1[3];
        const expiresAt_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 50 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 50 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && policy_0.issuerId.buffer instanceof ArrayBuffer && policy_0.issuerId.BYTES_PER_ELEMENT === 1 && policy_0.issuerId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'stateproof.compact line 50 char 1',
                                     'struct Policy<schemaId: Bytes<32>, issuerId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                     policy_0)
        }
        if (!(typeof(referenceTime_0) === 'bigint' && referenceTime_0 >= 0n && referenceTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'stateproof.compact line 50 char 1',
                                     'Uint<0..18446744073709551616>',
                                     referenceTime_0)
        }
        if (!(typeof(expiresAt_0) === 'bigint' && expiresAt_0 >= 0n && expiresAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'stateproof.compact line 50 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiresAt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_9.toValue(policy_0).concat(_descriptor_3.toValue(referenceTime_0).concat(_descriptor_3.toValue(expiresAt_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createRequest_0(context,
                                               partialProofData,
                                               requestId_0,
                                               policy_0,
                                               referenceTime_0,
                                               expiresAt_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      submitProof: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`submitProof: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('submitProof',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 69 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('submitProof',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 69 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._submitProof_0(context,
                                             partialProofData,
                                             requestId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerIssuer: this.circuits.registerIssuer,
      createRequest: this.circuits.createRequest,
      submitProof: this.circuits.submitProof
    };
    this.provableCircuits = {
      registerIssuer: this.circuits.registerIssuer,
      createRequest: this.circuits.createRequest,
      submitProof: this.circuits.submitProof
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerIssuer', new __compactRuntime.ContractOperation());
    state_0.setOperation('createRequest', new __compactRuntime.ContractOperation());
    state_0.setOperation('submitProof', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(1n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(2n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(3n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = this._adminKey_0(this._adminSecret_0(context, partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _some_0(value_0) { return { is_some: true, value: value_0 }; }
  _none_0() { return { is_some: false, value: 0n }; }
  _blockTimeLt_0(context, partialProofData, time_0) {
    return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_1.toValue(2n),
                                                                                                 alignment: _descriptor_1.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(time_0),
                                                                                                                             alignment: _descriptor_3.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_20, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_21, value_0);
    return result_0;
  }
  _transientHash_2(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_18, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_19, value_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _upgradeFromTransient_0(x_0) {
    const result_0 = __compactRuntime.upgradeFromTransient(x_0);
    return result_0;
  }
  _jubjubPointX_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointX(np_0);
    return result_0;
  }
  _jubjubPointY_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointY(np_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _credentialDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _signatureDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 115, 105, 103, 110, 97, 116, 117, 114, 101, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _holderDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 104, 111, 108, 100, 101, 114, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _adminDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 97, 100, 109, 105, 110, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _credentialRoot_0(credential_0) {
    return this._transientHash_0({ domain: this._credentialDomain_0(),
                                   credential: credential_0 });
  }
  _signingChallenge_0(root_0, publicKey_0, r_0) {
    return this._degradeToTransient_0(this._upgradeFromTransient_0(this._transientHash_1({ domain:
                                                                                             this._signatureDomain_0(),
                                                                                           root:
                                                                                             root_0,
                                                                                           publicKey:
                                                                                             publicKey_0,
                                                                                           r:
                                                                                             r_0 })));
  }
  _holderCommitment_0(secret_0) {
    return this._transientHash_2({ domain: this._holderDomain_0(),
                                   secret: secret_0 });
  }
  _derivePublicKey_0(secretScalar_0) {
    return this._ecMulGenerator_0(secretScalar_0);
  }
  _samePoint_0(a_0, b_0) {
    return this._jubjubPointX_0(a_0) === this._jubjubPointX_0(b_0)
           &&
           this._jubjubPointY_0(a_0) === this._jubjubPointY_0(b_0);
  }
  _assertUsablePoint_0(point_0) {
    __compactRuntime.assert(this._jubjubPointX_0(point_0) !== 0n
                            ||
                            this._jubjubPointY_0(point_0) !== 1n,
                            'Point must not be the identity');
    const projected_0 = this._ecMul_0(this._ecMul_0(point_0,
                                                    819310549611346726241370945440405716213240158234039660170669895299022906775n),
                                      8n);
    __compactRuntime.assert(this._samePoint_0(point_0, projected_0),
                            'Point must lie in the prime-order subgroup');
    return [];
  }
  _isValidSignature_0(publicKey_0, signature_0, challenge_0) {
    const left_0 = this._ecMulGenerator_0(signature_0.s);
    const right_0 = this._ecAdd_0(signature_0.r,
                                  this._ecMul_0(publicKey_0, challenge_0));
    return this._samePoint_0(left_0, right_0);
  }
  _selectClaim_0(claims_0, index_0) {
    __compactRuntime.assert(index_0 < 8n, 'Claim index out of range');
    const slots_0 = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n];
    return this._folder_0(((acc_0, value_0, slot_0) =>
                           {
                             if (this._equal_0(slot_0, index_0)) {
                               return value_0;
                             } else {
                               return acc_0;
                             }
                           }),
                          0n,
                          claims_0,
                          slots_0);
  }
  _conditionHolds_0(claims_0, condition_0) {
    const value_0 = this._selectClaim_0(claims_0, condition_0.claimIndex);
    const inSet_0 = this._folder_1(((acc_0, member_0) =>
                                    {
                                      return acc_0
                                             ||
                                             this._equal_1(member_0, value_0);
                                    }),
                                   false,
                                   condition_0.set);
    return condition_0.op === 0
           ||
           (condition_0.op === 1 ?
            value_0 >= condition_0.value :
            condition_0.op === 2 ?
            value_0 <= condition_0.value :
            condition_0.op === 3 ?
            this._equal_2(value_0, condition_0.value) :
            condition_0.op === 4 ?
            !this._equal_3(value_0, condition_0.value) :
            condition_0.op === 5 ?
            value_0 >= condition_0.value && value_0 <= condition_0.value2 :
            inSet_0);
  }
  _policyHolds_0(claims_0, policy_0) {
    return this._folder_2(((acc_0, condition_0) =>
                           {
                             return acc_0
                                    &&
                                    this._conditionHolds_0(claims_0, condition_0);
                           }),
                          true,
                          policy_0.conditions);
  }
  _assertWellFormedPolicy_0(policy_0) {
    this._folder_3(((t_0, condition_0) =>
                    {
                      let t_1;
                      __compactRuntime.assert((t_1 = condition_0.claimIndex,
                                               t_1 < 8n),
                                              'Condition claim index out of range');
                      let t_2;
                      __compactRuntime.assert(condition_0.op !== 5
                                              ||
                                              (t_2 = condition_0.value,
                                               t_2 <= condition_0.value2),
                                              'Between bounds are reversed');
                      return t_0;
                    }),
                   [],
                   policy_0.conditions);
    let t_3;
    __compactRuntime.assert(!policy_0.revealSlot.is_some
                            ||
                            (t_3 = policy_0.revealSlot.value, t_3 < 8n),
                            'Reveal slot out of range');
    return [];
  }
  _revealedClaim_0(claims_0, revealSlot_0) {
    if (revealSlot_0.is_some) {
      return this._some_0(this._selectClaim_0(claims_0, revealSlot_0.value));
    } else {
      return this._none_0();
    }
  }
  _adminSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.adminSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('adminSecret',
                                 'return value',
                                 'stateproof.compact line 31 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _credential_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credential(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.schemaId.buffer instanceof ArrayBuffer && result_0.schemaId.BYTES_PER_ELEMENT === 1 && result_0.schemaId.length === 32 && result_0.issuerId.buffer instanceof ArrayBuffer && result_0.issuerId.BYTES_PER_ELEMENT === 1 && result_0.issuerId.length === 32 && typeof(result_0.holderCommit) === 'bigint' && result_0.holderCommit >= 0 && result_0.holderCommit <= __compactRuntime.MAX_FIELD && Array.isArray(result_0.claims) && result_0.claims.length === 8 && result_0.claims.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && typeof(result_0.issuedAt) === 'bigint' && result_0.issuedAt >= 0n && result_0.issuedAt <= 18446744073709551615n && typeof(result_0.expiresAt) === 'bigint' && result_0.expiresAt >= 0n && result_0.expiresAt <= 18446744073709551615n && result_0.salt.buffer instanceof ArrayBuffer && result_0.salt.BYTES_PER_ELEMENT === 1 && result_0.salt.length === 32)) {
      __compactRuntime.typeError('credential',
                                 'return value',
                                 'stateproof.compact line 32 char 1',
                                 'struct Credential<schemaId: Bytes<32>, issuerId: Bytes<32>, holderCommit: Field, claims: Vector<8, Uint<0..18446744073709551616>>, issuedAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>, salt: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_16.toValue(result_0),
      alignment: _descriptor_16.alignment()
    });
    return result_0;
  }
  _credentialSignature_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credentialSignature(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && true && typeof(result_0.s) === 'bigint' && result_0.s >= 0 && result_0.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('credentialSignature',
                                 'return value',
                                 'stateproof.compact line 33 char 1',
                                 'struct Signature<r: Opaque<"JubjubPoint">, s: Field>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _holderSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.holderSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('holderSecret',
                                 'return value',
                                 'stateproof.compact line 34 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _adminKey_0(secret_0) {
    return this._persistentHash_0([this._adminDomain_0(), secret_0]);
  }
  _registerIssuer_0(context, partialProofData, issuerId_0, publicKey_0) {
    __compactRuntime.assert(this._equal_4(this._adminKey_0(this._adminSecret_0(context,
                                                                               partialProofData)),
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_1.toValue(0n),
                                                                                                                                alignment: _descriptor_1.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only the admin can register issuers');
    this._assertUsablePoint_0(publicKey_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(issuerId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(publicKey_0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _createRequest_0(context,
                   partialProofData,
                   requestId_0,
                   policy_0,
                   referenceTime_0,
                   expiresAt_0)
  {
    const id_0 = requestId_0;
    const publicPolicy_0 = policy_0;
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(2n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Request id already used');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = publicPolicy_0.issuerId,
                             _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(1n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Policy issuer is not registered');
    this._assertWellFormedPolicy_0(publicPolicy_0);
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                expiresAt_0),
                            'Request expiry must be in the future');
    const tmp_1 = { policy: publicPolicy_0,
                    referenceTime: referenceTime_0,
                    expiresAt: expiresAt_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(2n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(tmp_1),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _submitProof_0(context, partialProofData, requestId_0) {
    const id_0 = requestId_0;
    __compactRuntime.assert(_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(2n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Unknown request');
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(3n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Request already answered');
    const request_0 = _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_1.toValue(2n),
                                                                                                             alignment: _descriptor_1.alignment() } }] } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_0.toValue(id_0),
                                                                                                             alignment: _descriptor_0.alignment() } }] } },
                                                                                  { popeq: { cached: false,
                                                                                             result: undefined } }]).value);
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                request_0.expiresAt),
                            'Request expired');
    const cred_0 = this._credential_0(context, partialProofData);
    const signature_0 = this._credentialSignature_0(context, partialProofData);
    __compactRuntime.assert(this._equal_5(cred_0.schemaId,
                                          request_0.policy.schemaId),
                            'Credential schema does not match the policy');
    __compactRuntime.assert(this._equal_6(cred_0.issuerId,
                                          request_0.policy.issuerId),
                            'Credential issuer does not match the policy');
    let tmp_0;
    const issuerKey_0 = (tmp_0 = request_0.policy.issuerId,
                         _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                    partialProofData,
                                                                                    [
                                                                                     { dup: { n: 0 } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_1.toValue(1n),
                                                                                                                alignment: _descriptor_1.alignment() } }] } },
                                                                                     { idx: { cached: false,
                                                                                              pushPath: false,
                                                                                              path: [
                                                                                                     { tag: 'value',
                                                                                                       value: { value: _descriptor_0.toValue(tmp_0),
                                                                                                                alignment: _descriptor_0.alignment() } }] } },
                                                                                     { popeq: { cached: false,
                                                                                                result: undefined } }]).value));
    const challenge_0 = this._signingChallenge_0(this._credentialRoot_0(cred_0),
                                                 issuerKey_0,
                                                 signature_0.r);
    __compactRuntime.assert(this._isValidSignature_0(issuerKey_0,
                                                     signature_0,
                                                     challenge_0),
                            'Invalid issuer signature');
    let t_0;
    __compactRuntime.assert((t_0 = cred_0.issuedAt,
                             t_0 <= request_0.referenceTime),
                            'Credential is not valid yet');
    let t_1;
    __compactRuntime.assert((t_1 = request_0.referenceTime,
                             t_1 < cred_0.expiresAt),
                            'Credential expired');
    __compactRuntime.assert(this._holderCommitment_0(this._holderSecret_0(context,
                                                                          partialProofData))
                            ===
                            cred_0.holderCommit,
                            'Credential is bound to another holder');
    __compactRuntime.assert(this._policyHolds_0(cred_0.claims, request_0.policy),
                            'Policy conditions are not satisfied');
    const tmp_1 = { revealed:
                      this._revealedClaim_0(cred_0.claims,
                                            request_0.policy.revealSlot) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(tmp_1),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_0(f, x, a0, a1) {
    for (let i = 0; i < 8; i++) { x = f(x, a0[i], a1[i]); }
    return x;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_1(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_2(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _folder_3(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get admin() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(0n),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    issuers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'stateproof.compact line 25 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'stateproof.compact line 25 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(1n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_13.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    requests: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'stateproof.compact line 27 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(2n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'stateproof.compact line 27 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(2n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_10.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    results: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(3n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(3n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'stateproof.compact line 29 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(3n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'stateproof.compact line 29 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_12.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(3n),
                                                                                                      alignment: _descriptor_1.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_12.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  adminSecret: (...args) => undefined,
  credential: (...args) => undefined,
  credentialSignature: (...args) => undefined,
  holderSecret: (...args) => undefined
});
export const pureCircuits = {
  credentialDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`credentialDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._credentialDomain_0();
  },
  signatureDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`signatureDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._signatureDomain_0();
  },
  holderDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`holderDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._holderDomain_0();
  },
  adminDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`adminDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._adminDomain_0();
  },
  credentialRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`credentialRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && credential_0.schemaId.buffer instanceof ArrayBuffer && credential_0.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schemaId.length === 32 && credential_0.issuerId.buffer instanceof ArrayBuffer && credential_0.issuerId.BYTES_PER_ELEMENT === 1 && credential_0.issuerId.length === 32 && typeof(credential_0.holderCommit) === 'bigint' && credential_0.holderCommit >= 0 && credential_0.holderCommit <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims) && credential_0.claims.length === 8 && credential_0.claims.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && credential_0.salt.buffer instanceof ArrayBuffer && credential_0.salt.BYTES_PER_ELEMENT === 1 && credential_0.salt.length === 32)) {
      __compactRuntime.typeError('credentialRoot',
                                 'argument 1',
                                 'credential.compact line 41 char 1',
                                 'struct Credential<schemaId: Bytes<32>, issuerId: Bytes<32>, holderCommit: Field, claims: Vector<8, Uint<0..18446744073709551616>>, issuedAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>, salt: Bytes<32>>',
                                 credential_0)
    }
    return _dummyContract._credentialRoot_0(credential_0);
  },
  signingChallenge: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`signingChallenge: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const root_0 = args_0[0];
    const publicKey_0 = args_0[1];
    const r_0 = args_0[2];
    if (!(typeof(root_0) === 'bigint' && root_0 >= 0 && root_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('signingChallenge',
                                 'argument 1',
                                 'credential.compact line 50 char 1',
                                 'Field',
                                 root_0)
    }
    return _dummyContract._signingChallenge_0(root_0, publicKey_0, r_0);
  },
  holderCommitment: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`holderCommitment: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('holderCommitment',
                                 'argument 1',
                                 'credential.compact line 56 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._holderCommitment_0(secret_0);
  },
  derivePublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`derivePublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secretScalar_0 = args_0[0];
    if (!(typeof(secretScalar_0) === 'bigint' && secretScalar_0 >= 0 && secretScalar_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('derivePublicKey',
                                 'argument 1',
                                 'credential.compact line 60 char 1',
                                 'Field',
                                 secretScalar_0)
    }
    return _dummyContract._derivePublicKey_0(secretScalar_0);
  },
  assertUsablePoint: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertUsablePoint: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const point_0 = args_0[0];
    return _dummyContract._assertUsablePoint_0(point_0);
  },
  isValidSignature: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`isValidSignature: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const publicKey_0 = args_0[0];
    const signature_0 = args_0[1];
    const challenge_0 = args_0[2];
    if (!(typeof(signature_0) === 'object' && true && typeof(signature_0.s) === 'bigint' && signature_0.s >= 0 && signature_0.s <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('isValidSignature',
                                 'argument 2',
                                 'credential.compact line 80 char 1',
                                 'struct Signature<r: Opaque<"JubjubPoint">, s: Field>',
                                 signature_0)
    }
    if (!(typeof(challenge_0) === 'bigint' && challenge_0 >= 0 && challenge_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('isValidSignature',
                                 'argument 3',
                                 'credential.compact line 80 char 1',
                                 'Field',
                                 challenge_0)
    }
    return _dummyContract._isValidSignature_0(publicKey_0,
                                              signature_0,
                                              challenge_0);
  },
  selectClaim: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`selectClaim: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    const index_0 = args_0[1];
    if (!(Array.isArray(claims_0) && claims_0.length === 8 && claims_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('selectClaim',
                                 'argument 1',
                                 'policy.compact line 22 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(index_0) === 'bigint' && index_0 >= 0n && index_0 <= 255n)) {
      __compactRuntime.typeError('selectClaim',
                                 'argument 2',
                                 'policy.compact line 22 char 1',
                                 'Uint<0..256>',
                                 index_0)
    }
    return _dummyContract._selectClaim_0(claims_0, index_0);
  },
  conditionHolds: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`conditionHolds: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    const condition_0 = args_0[1];
    if (!(Array.isArray(claims_0) && claims_0.length === 8 && claims_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('conditionHolds',
                                 'argument 1',
                                 'policy.compact line 33 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(condition_0) === 'object' && typeof(condition_0.claimIndex) === 'bigint' && condition_0.claimIndex >= 0n && condition_0.claimIndex <= 255n && typeof(condition_0.op) === 'number' && condition_0.op >= 0 && condition_0.op <= 6 && typeof(condition_0.value) === 'bigint' && condition_0.value >= 0n && condition_0.value <= 18446744073709551615n && typeof(condition_0.value2) === 'bigint' && condition_0.value2 >= 0n && condition_0.value2 <= 18446744073709551615n && Array.isArray(condition_0.set) && condition_0.set.length === 4 && condition_0.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('conditionHolds',
                                 'argument 2',
                                 'policy.compact line 33 char 1',
                                 'struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>',
                                 condition_0)
    }
    return _dummyContract._conditionHolds_0(claims_0, condition_0);
  },
  policyHolds: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`policyHolds: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    const policy_0 = args_0[1];
    if (!(Array.isArray(claims_0) && claims_0.length === 8 && claims_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('policyHolds',
                                 'argument 1',
                                 'policy.compact line 49 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && policy_0.issuerId.buffer instanceof ArrayBuffer && policy_0.issuerId.BYTES_PER_ELEMENT === 1 && policy_0.issuerId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('policyHolds',
                                 'argument 2',
                                 'policy.compact line 49 char 1',
                                 'struct Policy<schemaId: Bytes<32>, issuerId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    return _dummyContract._policyHolds_0(claims_0, policy_0);
  },
  assertWellFormedPolicy: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertWellFormedPolicy: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const policy_0 = args_0[0];
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && policy_0.issuerId.buffer instanceof ArrayBuffer && policy_0.issuerId.BYTES_PER_ELEMENT === 1 && policy_0.issuerId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('assertWellFormedPolicy',
                                 'argument 1',
                                 'policy.compact line 57 char 1',
                                 'struct Policy<schemaId: Bytes<32>, issuerId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    return _dummyContract._assertWellFormedPolicy_0(policy_0);
  },
  revealedClaim: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`revealedClaim: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const claims_0 = args_0[0];
    const revealSlot_0 = args_0[1];
    if (!(Array.isArray(claims_0) && claims_0.length === 8 && claims_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('revealedClaim',
                                 'argument 1',
                                 'policy.compact line 65 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(revealSlot_0) === 'object' && typeof(revealSlot_0.is_some) === 'boolean' && typeof(revealSlot_0.value) === 'bigint' && revealSlot_0.value >= 0n && revealSlot_0.value <= 255n)) {
      __compactRuntime.typeError('revealedClaim',
                                 'argument 2',
                                 'policy.compact line 65 char 1',
                                 'struct Maybe<is_some: Boolean, value: Uint<0..256>>',
                                 revealSlot_0)
    }
    return _dummyContract._revealedClaim_0(claims_0, revealSlot_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
