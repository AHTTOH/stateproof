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
    return _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_8.alignment()));
  }
  fromValue(value_0) {
    return {
      schemaId: _descriptor_0.fromValue(value_0),
      conditions: _descriptor_6.fromValue(value_0),
      revealSlot: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.schemaId).concat(_descriptor_6.toValue(value_0.conditions).concat(_descriptor_8.toValue(value_0.revealSlot)));
  }
}

const _descriptor_9 = new _Policy_0();

const _descriptor_10 = __compactRuntime.CompactTypeField;

class _Maybe_1 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_10.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_7.fromValue(value_0),
      value: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.is_some).concat(_descriptor_10.toValue(value_0.value));
  }
}

const _descriptor_11 = new _Maybe_1();

class _Request_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_11.alignment())));
  }
  fromValue(value_0) {
    return {
      policy: _descriptor_9.fromValue(value_0),
      referenceTime: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0),
      subjectCommit: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.policy).concat(_descriptor_3.toValue(value_0.referenceTime).concat(_descriptor_3.toValue(value_0.expiresAt).concat(_descriptor_11.toValue(value_0.subjectCommit))));
  }
}

const _descriptor_12 = new _Request_0();

class _MerkleTreeDigest_0 {
  alignment() {
    return _descriptor_10.alignment();
  }
  fromValue(value_0) {
    return {
      field: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_10.toValue(value_0.field);
  }
}

const _descriptor_13 = new _MerkleTreeDigest_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _Maybe_2 {
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

const _descriptor_15 = new _Maybe_2();

class _Answer_0 {
  alignment() {
    return _descriptor_15.alignment();
  }
  fromValue(value_0) {
    return {
      revealed: _descriptor_15.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_15.toValue(value_0.revealed);
  }
}

const _descriptor_16 = new _Answer_0();

const _descriptor_17 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_18 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

class _IssuerRecord_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_17.alignment().concat(_descriptor_18.alignment().concat(_descriptor_3.alignment().concat(_descriptor_7.alignment()))));
  }
  fromValue(value_0) {
    return {
      schemaId: _descriptor_0.fromValue(value_0),
      publicKey: _descriptor_17.fromValue(value_0),
      epoch: _descriptor_18.fromValue(value_0),
      slot: _descriptor_3.fromValue(value_0),
      active: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.schemaId).concat(_descriptor_17.toValue(value_0.publicKey).concat(_descriptor_18.toValue(value_0.epoch).concat(_descriptor_3.toValue(value_0.slot).concat(_descriptor_7.toValue(value_0.active)))));
  }
}

const _descriptor_19 = new _IssuerRecord_0();

class _SlotRule_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_3.alignment());
  }
  fromValue(value_0) {
    return {
      sensitive: _descriptor_7.fromValue(value_0),
      minWidth: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.sensitive).concat(_descriptor_3.toValue(value_0.minWidth));
  }
}

const _descriptor_20 = new _SlotRule_0();

const _descriptor_21 = new __compactRuntime.CompactTypeVector(8, _descriptor_20);

class _SchemaRule_0 {
  alignment() {
    return _descriptor_21.alignment();
  }
  fromValue(value_0) {
    return {
      slots: _descriptor_21.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_21.toValue(value_0.slots);
  }
}

const _descriptor_22 = new _SchemaRule_0();

class _MerkleTreePathEntry_0 {
  alignment() {
    return _descriptor_13.alignment().concat(_descriptor_7.alignment());
  }
  fromValue(value_0) {
    return {
      sibling: _descriptor_13.fromValue(value_0),
      goes_left: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.sibling).concat(_descriptor_7.toValue(value_0.goes_left));
  }
}

const _descriptor_23 = new _MerkleTreePathEntry_0();

const _descriptor_24 = new __compactRuntime.CompactTypeVector(6, _descriptor_23);

class _MerkleTreePath_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_24.alignment());
  }
  fromValue(value_0) {
    return {
      leaf: _descriptor_0.fromValue(value_0),
      path: _descriptor_24.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.leaf).concat(_descriptor_24.toValue(value_0.path));
  }
}

const _descriptor_25 = new _MerkleTreePath_0();

class _Signature_0 {
  alignment() {
    return _descriptor_17.alignment().concat(_descriptor_10.alignment());
  }
  fromValue(value_0) {
    return {
      r: _descriptor_17.fromValue(value_0),
      s: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_17.toValue(value_0.r).concat(_descriptor_10.toValue(value_0.s));
  }
}

const _descriptor_26 = new _Signature_0();

const _descriptor_27 = new __compactRuntime.CompactTypeVector(8, _descriptor_3);

class _Credential_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_18.alignment().concat(_descriptor_10.alignment().concat(_descriptor_10.alignment().concat(_descriptor_27.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment()))))))));
  }
  fromValue(value_0) {
    return {
      schemaId: _descriptor_0.fromValue(value_0),
      issuerId: _descriptor_0.fromValue(value_0),
      epoch: _descriptor_18.fromValue(value_0),
      holderCommit: _descriptor_10.fromValue(value_0),
      subjectId: _descriptor_10.fromValue(value_0),
      claims: _descriptor_27.fromValue(value_0),
      issuedAt: _descriptor_3.fromValue(value_0),
      expiresAt: _descriptor_3.fromValue(value_0),
      salt: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.schemaId).concat(_descriptor_0.toValue(value_0.issuerId).concat(_descriptor_18.toValue(value_0.epoch).concat(_descriptor_10.toValue(value_0.holderCommit).concat(_descriptor_10.toValue(value_0.subjectId).concat(_descriptor_27.toValue(value_0.claims).concat(_descriptor_3.toValue(value_0.issuedAt).concat(_descriptor_3.toValue(value_0.expiresAt).concat(_descriptor_0.toValue(value_0.salt)))))))));
  }
}

const _descriptor_28 = new _Credential_0();

class _Bounds_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_7.alignment()));
  }
  fromValue(value_0) {
    return {
      lo: _descriptor_3.fromValue(value_0),
      hi: _descriptor_3.fromValue(value_0),
      exact: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.lo).concat(_descriptor_3.toValue(value_0.hi).concat(_descriptor_7.toValue(value_0.exact)));
  }
}

const _descriptor_29 = new _Bounds_0();

const _descriptor_30 = new __compactRuntime.CompactTypeVector(8, _descriptor_1);

const _descriptor_31 = new __compactRuntime.CompactTypeBytes(6);

class _LeafPreimage_0 {
  alignment() {
    return _descriptor_31.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      domain_sep: _descriptor_31.fromValue(value_0),
      data: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_31.toValue(value_0.domain_sep).concat(_descriptor_0.toValue(value_0.data));
  }
}

const _descriptor_32 = new _LeafPreimage_0();

const _descriptor_33 = new __compactRuntime.CompactTypeVector(2, _descriptor_10);

const _descriptor_34 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _PseudonymPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      requestId: _descriptor_0.fromValue(value_0),
      secret: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_0.toValue(value_0.requestId).concat(_descriptor_0.toValue(value_0.secret)));
  }
}

const _descriptor_35 = new _PseudonymPreimage_0();

class _IssuerLeafPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_17.alignment().concat(_descriptor_18.alignment()))));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      issuerId: _descriptor_0.fromValue(value_0),
      schemaId: _descriptor_0.fromValue(value_0),
      publicKey: _descriptor_17.fromValue(value_0),
      epoch: _descriptor_18.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_0.toValue(value_0.issuerId).concat(_descriptor_0.toValue(value_0.schemaId).concat(_descriptor_17.toValue(value_0.publicKey).concat(_descriptor_18.toValue(value_0.epoch)))));
  }
}

const _descriptor_36 = new _IssuerLeafPreimage_0();

class _SubjectIdPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      digest: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_0.toValue(value_0.digest));
  }
}

const _descriptor_37 = new _SubjectIdPreimage_0();

class _SubjectCommitPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_10.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      subjectId: _descriptor_10.fromValue(value_0),
      nonce: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_10.toValue(value_0.subjectId).concat(_descriptor_0.toValue(value_0.nonce)));
  }
}

const _descriptor_38 = new _SubjectCommitPreimage_0();

class _ChallengePreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_10.alignment().concat(_descriptor_17.alignment().concat(_descriptor_17.alignment())));
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      root: _descriptor_10.fromValue(value_0),
      publicKey: _descriptor_17.fromValue(value_0),
      r: _descriptor_17.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_10.toValue(value_0.root).concat(_descriptor_17.toValue(value_0.publicKey).concat(_descriptor_17.toValue(value_0.r))));
  }
}

const _descriptor_39 = new _ChallengePreimage_0();

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

const _descriptor_40 = new _HolderPreimage_0();

class _CredentialPreimage_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_28.alignment());
  }
  fromValue(value_0) {
    return {
      domain: _descriptor_0.fromValue(value_0),
      credential: _descriptor_28.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.domain).concat(_descriptor_28.toValue(value_0.credential));
  }
}

const _descriptor_41 = new _CredentialPreimage_0();

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

const _descriptor_42 = new _Either_0();

const _descriptor_43 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

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

const _descriptor_44 = new _ContractAddress_0();

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
    if (typeof(witnesses_0.issuerSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named issuerSecret');
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
    if (typeof(witnesses_0.issuerPublicKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named issuerPublicKey');
    }
    if (typeof(witnesses_0.issuerPath) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named issuerPath');
    }
    if (typeof(witnesses_0.requestNonce) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named requestNonce');
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
      issuerLeafDomain(context, ...args_1) {
        return { result: pureCircuits.issuerLeafDomain(...args_1), context };
      },
      subjectDomain(context, ...args_1) {
        return { result: pureCircuits.subjectDomain(...args_1), context };
      },
      subjectCommitDomain(context, ...args_1) {
        return { result: pureCircuits.subjectCommitDomain(...args_1), context };
      },
      pseudonymDomain(context, ...args_1) {
        return { result: pureCircuits.pseudonymDomain(...args_1), context };
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
      subjectIdOf(context, ...args_1) {
        return { result: pureCircuits.subjectIdOf(...args_1), context };
      },
      subjectCommitment(context, ...args_1) {
        return { result: pureCircuits.subjectCommitment(...args_1), context };
      },
      pseudonymFor(context, ...args_1) {
        return { result: pureCircuits.pseudonymFor(...args_1), context };
      },
      issuerLeaf(context, ...args_1) {
        return { result: pureCircuits.issuerLeaf(...args_1), context };
      },
      derivePublicKey(context, ...args_1) {
        return { result: pureCircuits.derivePublicKey(...args_1), context };
      },
      samePoint(context, ...args_1) {
        return { result: pureCircuits.samePoint(...args_1), context };
      },
      assertUsablePoint(context, ...args_1) {
        return { result: pureCircuits.assertUsablePoint(...args_1), context };
      },
      isValidSignature(context, ...args_1) {
        return { result: pureCircuits.isValidSignature(...args_1), context };
      },
      slotIndexes(context, ...args_1) {
        return { result: pureCircuits.slotIndexes(...args_1), context };
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
      slotBounds(context, ...args_1) {
        return { result: pureCircuits.slotBounds(...args_1), context };
      },
      slotRespected(context, ...args_1) {
        return { result: pureCircuits.slotRespected(...args_1), context };
      },
      respectsSensitiveSlots(context, ...args_1) {
        return { result: pureCircuits.respectsSensitiveSlots(...args_1), context };
      },
      revealedClaim(context, ...args_1) {
        return { result: pureCircuits.revealedClaim(...args_1), context };
      },
      referenceTolerance(context, ...args_1) {
        return { result: pureCircuits.referenceTolerance(...args_1), context };
      },
      registerSchema: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerSchema: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const schemaId_0 = args_1[1];
        const rule_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerSchema',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 78 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(schemaId_0.buffer instanceof ArrayBuffer && schemaId_0.BYTES_PER_ELEMENT === 1 && schemaId_0.length === 32)) {
          __compactRuntime.typeError('registerSchema',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 78 char 1',
                                     'Bytes<32>',
                                     schemaId_0)
        }
        if (!(typeof(rule_0) === 'object' && Array.isArray(rule_0.slots) && rule_0.slots.length === 8 && rule_0.slots.every((t) => typeof(t) === 'object' && typeof(t.sensitive) === 'boolean' && typeof(t.minWidth) === 'bigint' && t.minWidth >= 0n && t.minWidth <= 18446744073709551615n))) {
          __compactRuntime.typeError('registerSchema',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'stateproof.compact line 78 char 1',
                                     'struct SchemaRule<slots: Vector<8, struct SlotRule<sensitive: Boolean, minWidth: Uint<0..18446744073709551616>>>>',
                                     rule_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(schemaId_0).concat(_descriptor_22.toValue(rule_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_22.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerSchema_0(context,
                                                partialProofData,
                                                schemaId_0,
                                                rule_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      registerIssuer: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`registerIssuer: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerId_0 = args_1[1];
        const schemaId_0 = args_1[2];
        const publicKey_0 = args_1[3];
        const slot_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 85 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerId_0.buffer instanceof ArrayBuffer && issuerId_0.BYTES_PER_ELEMENT === 1 && issuerId_0.length === 32)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 85 char 1',
                                     'Bytes<32>',
                                     issuerId_0)
        }
        if (!(schemaId_0.buffer instanceof ArrayBuffer && schemaId_0.BYTES_PER_ELEMENT === 1 && schemaId_0.length === 32)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'stateproof.compact line 85 char 1',
                                     'Bytes<32>',
                                     schemaId_0)
        }
        if (!(typeof(slot_0) === 'bigint' && slot_0 >= 0n && slot_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('registerIssuer',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'stateproof.compact line 85 char 1',
                                     'Uint<0..18446744073709551616>',
                                     slot_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerId_0).concat(_descriptor_0.toValue(schemaId_0).concat(_descriptor_17.toValue(publicKey_0).concat(_descriptor_3.toValue(slot_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_17.alignment().concat(_descriptor_3.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._registerIssuer_0(context,
                                                partialProofData,
                                                issuerId_0,
                                                schemaId_0,
                                                publicKey_0,
                                                slot_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      rotateIssuerEpoch: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`rotateIssuerEpoch: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('rotateIssuerEpoch',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 103 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerId_0.buffer instanceof ArrayBuffer && issuerId_0.BYTES_PER_ELEMENT === 1 && issuerId_0.length === 32)) {
          __compactRuntime.typeError('rotateIssuerEpoch',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 103 char 1',
                                     'Bytes<32>',
                                     issuerId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._rotateIssuerEpoch_0(context,
                                                   partialProofData,
                                                   issuerId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      deactivateIssuer: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`deactivateIssuer: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const issuerId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('deactivateIssuer',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 121 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(issuerId_0.buffer instanceof ArrayBuffer && issuerId_0.BYTES_PER_ELEMENT === 1 && issuerId_0.length === 32)) {
          __compactRuntime.typeError('deactivateIssuer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 121 char 1',
                                     'Bytes<32>',
                                     issuerId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(issuerId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._deactivateIssuer_0(context,
                                                  partialProofData,
                                                  issuerId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      createRequest: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`createRequest: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const policy_0 = args_1[2];
        const referenceTime_0 = args_1[3];
        const expiresAt_0 = args_1[4];
        const subjectCommit_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'struct Policy<schemaId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                     policy_0)
        }
        if (!(typeof(referenceTime_0) === 'bigint' && referenceTime_0 >= 0n && referenceTime_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'Uint<0..18446744073709551616>',
                                     referenceTime_0)
        }
        if (!(typeof(expiresAt_0) === 'bigint' && expiresAt_0 >= 0n && expiresAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiresAt_0)
        }
        if (!(typeof(subjectCommit_0) === 'object' && typeof(subjectCommit_0.is_some) === 'boolean' && typeof(subjectCommit_0.value) === 'bigint' && subjectCommit_0.value >= 0 && subjectCommit_0.value <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('createRequest',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'stateproof.compact line 136 char 1',
                                     'struct Maybe<is_some: Boolean, value: Field>',
                                     subjectCommit_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_9.toValue(policy_0).concat(_descriptor_3.toValue(referenceTime_0).concat(_descriptor_3.toValue(expiresAt_0).concat(_descriptor_11.toValue(subjectCommit_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_9.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_11.alignment()))))
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
                                               expiresAt_0,
                                               subjectCommit_0);
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
                                     'stateproof.compact line 166 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('submitProof',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'stateproof.compact line 166 char 1',
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
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      registerSchema: this.circuits.registerSchema,
      registerIssuer: this.circuits.registerIssuer,
      rotateIssuerEpoch: this.circuits.rotateIssuerEpoch,
      deactivateIssuer: this.circuits.deactivateIssuer,
      createRequest: this.circuits.createRequest,
      submitProof: this.circuits.submitProof
    };
    this.provableCircuits = {
      registerSchema: this.circuits.registerSchema,
      registerIssuer: this.circuits.registerIssuer,
      rotateIssuerEpoch: this.circuits.rotateIssuerEpoch,
      deactivateIssuer: this.circuits.deactivateIssuer,
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
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('registerSchema', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerIssuer', new __compactRuntime.ContractOperation());
    state_0.setOperation('rotateIssuerEpoch', new __compactRuntime.ContractOperation());
    state_0.setOperation('deactivateIssuer', new __compactRuntime.ContractOperation());
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
                                                 value: __compactRuntime.StateValue.newArray()
                                                          .arrayPush(__compactRuntime.StateValue.newBoundedMerkleTree(
                                                                       new __compactRuntime.StateBoundedMerkleTree(6)
                                                                     )).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                        alignment: _descriptor_3.alignment() }))
                                                          .encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(4n),
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(5n),
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(6n),
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(7n),
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
  _merkleTreePathRoot_0(path_0) {
    return { field:
               this._folder_0((...args_0) =>
                                this._merkleTreePathEntryRoot_0(...args_0),
                              this._degradeToTransient_0(this._persistentHash_1({ domain_sep:
                                                                                    new Uint8Array([109, 100, 110, 58, 108, 104]),
                                                                                  data:
                                                                                    path_0.leaf })),
                              path_0.path) };
  }
  _merkleTreePathEntryRoot_0(recursiveDigest_0, entry_0) {
    const left_0 = entry_0.goes_left ? recursiveDigest_0 : entry_0.sibling.field;
    const right_0 = entry_0.goes_left ?
                    entry_0.sibling.field :
                    recursiveDigest_0;
    return this._transientHash_7([left_0, right_0]);
  }
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
  _blockTimeGte_0(context, partialProofData, time_0) {
    return !this._blockTimeLt_0(context, partialProofData, time_0);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_41, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_39, value_0);
    return result_0;
  }
  _transientHash_2(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_40, value_0);
    return result_0;
  }
  _transientHash_3(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_37, value_0);
    return result_0;
  }
  _transientHash_4(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_38, value_0);
    return result_0;
  }
  _transientHash_5(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_35, value_0);
    return result_0;
  }
  _transientHash_6(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_36, value_0);
    return result_0;
  }
  _transientHash_7(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_33, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_34, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_32, value_0);
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
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 99, 114, 101, 100, 101, 110, 116, 105, 97, 108, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _signatureDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 115, 105, 103, 110, 97, 116, 117, 114, 101, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _holderDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 104, 111, 108, 100, 101, 114, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _adminDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 97, 100, 109, 105, 110, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _issuerLeafDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 105, 115, 115, 117, 101, 114, 45, 108, 101, 97, 102, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0]);
  }
  _subjectDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 115, 117, 98, 106, 101, 99, 116, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  _subjectCommitDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 115, 117, 98, 106, 101, 99, 116, 45, 99, 111, 109, 109, 105, 116, 58, 118, 50, 0, 0, 0, 0]);
  }
  _pseudonymDomain_0() {
    return new Uint8Array([115, 116, 97, 116, 101, 112, 114, 111, 111, 102, 58, 112, 115, 101, 117, 100, 111, 110, 121, 109, 58, 118, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
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
  _subjectIdOf_0(digest_0) {
    return this._transientHash_3({ domain: this._subjectDomain_0(),
                                   digest: digest_0 });
  }
  _subjectCommitment_0(subjectId_0, nonce_0) {
    return this._transientHash_4({ domain: this._subjectCommitDomain_0(),
                                   subjectId: subjectId_0,
                                   nonce: nonce_0 });
  }
  _pseudonymFor_0(requestId_0, secret_0) {
    return this._upgradeFromTransient_0(this._transientHash_5({ domain:
                                                                  this._pseudonymDomain_0(),
                                                                requestId:
                                                                  requestId_0,
                                                                secret: secret_0 }));
  }
  _issuerLeaf_0(issuerId_0, schemaId_0, publicKey_0, epoch_0) {
    return this._upgradeFromTransient_0(this._transientHash_6({ domain:
                                                                  this._issuerLeafDomain_0(),
                                                                issuerId:
                                                                  issuerId_0,
                                                                schemaId:
                                                                  schemaId_0,
                                                                publicKey:
                                                                  publicKey_0,
                                                                epoch: epoch_0 }));
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
  _slotIndexes_0() { return [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n]; }
  _selectClaim_0(claims_0, index_0) {
    __compactRuntime.assert(index_0 < 8n, 'Claim index out of range');
    return this._folder_1(((acc_0, value_0, slot_0) =>
                           {
                             if (this._equal_0(slot_0, index_0)) {
                               return value_0;
                             } else {
                               return acc_0;
                             }
                           }),
                          0n,
                          claims_0,
                          this._slotIndexes_0());
  }
  _conditionHolds_0(claims_0, condition_0) {
    const value_0 = this._selectClaim_0(claims_0, condition_0.claimIndex);
    const inSet_0 = this._folder_2(((acc_0, member_0) =>
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
    return this._folder_3(((acc_0, condition_0) =>
                           {
                             return acc_0
                                    &&
                                    this._conditionHolds_0(claims_0, condition_0);
                           }),
                          true,
                          policy_0.conditions);
  }
  _assertWellFormedPolicy_0(policy_0) {
    this._folder_4(((t_0, condition_0) =>
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
  _maxU64_0(a_0, b_0) { if (a_0 > b_0) { return a_0; } else { return b_0; } }
  _minU64_0(a_0, b_0) { if (a_0 < b_0) { return a_0; } else { return b_0; } }
  _slotBounds_0(conditions_0, slot_0) {
    return this._folder_5(((acc_0, c_0) =>
                           {
                             if (!this._equal_4(c_0.claimIndex, slot_0)
                                 ||
                                 c_0.op === 0)
                             {
                               return acc_0;
                             } else {
                               if (c_0.op === 1) {
                                 return { lo:
                                            this._maxU64_0(acc_0.lo, c_0.value),
                                          hi: acc_0.hi,
                                          exact: acc_0.exact };
                               } else {
                                 if (c_0.op === 2) {
                                   return { lo: acc_0.lo,
                                            hi:
                                              this._minU64_0(acc_0.hi, c_0.value),
                                            exact: acc_0.exact };
                                 } else {
                                   if (c_0.op === 5) {
                                     return { lo:
                                                this._maxU64_0(acc_0.lo,
                                                               c_0.value),
                                              hi:
                                                this._minU64_0(acc_0.hi,
                                                               c_0.value2),
                                              exact: acc_0.exact };
                                   } else {
                                     return { lo: acc_0.lo,
                                              hi: acc_0.hi,
                                              exact: true };
                                   }
                                 }
                               }
                             }
                           }),
                          { lo: 0n, hi: 18446744073709551615n, exact: false },
                          conditions_0);
  }
  _slotRespected_0(policy_0, r_0, slot_0) {
    const b_0 = this._slotBounds_0(policy_0.conditions, slot_0);
    const revealsIt_0 = policy_0.revealSlot.is_some
                        &&
                        this._equal_5(policy_0.revealSlot.value, slot_0);
    let t_0, t_1;
    const wideEnough_0 = (t_1 = b_0.hi, t_1 >= b_0.lo)
                         &&
                         (t_0 = b_0.hi, t_0 >= b_0.lo + r_0.minWidth);
    return !r_0.sensitive || !b_0.exact && !revealsIt_0 && wideEnough_0;
  }
  _respectsSensitiveSlots_0(policy_0, rule_0) {
    return this._folder_6(((acc_0, r_0, slot_0) =>
                           {
                             return acc_0
                                    &&
                                    this._slotRespected_0(policy_0, r_0, slot_0);
                           }),
                          true,
                          rule_0.slots,
                          this._slotIndexes_0());
  }
  _revealedClaim_0(claims_0, revealSlot_0) {
    if (revealSlot_0.is_some) {
      return this._some_0(this._selectClaim_0(claims_0, revealSlot_0.value));
    } else {
      return this._none_0();
    }
  }
  _referenceTolerance_0() { return 3600n; }
  _adminSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.adminSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('adminSecret',
                                 'return value',
                                 'stateproof.compact line 57 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _issuerSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.issuerSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0 && result_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('issuerSecret',
                                 'return value',
                                 'stateproof.compact line 58 char 1',
                                 'Field',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_10.toValue(result_0),
      alignment: _descriptor_10.alignment()
    });
    return result_0;
  }
  _credential_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.credential(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.schemaId.buffer instanceof ArrayBuffer && result_0.schemaId.BYTES_PER_ELEMENT === 1 && result_0.schemaId.length === 32 && result_0.issuerId.buffer instanceof ArrayBuffer && result_0.issuerId.BYTES_PER_ELEMENT === 1 && result_0.issuerId.length === 32 && typeof(result_0.epoch) === 'bigint' && result_0.epoch >= 0n && result_0.epoch <= 4294967295n && typeof(result_0.holderCommit) === 'bigint' && result_0.holderCommit >= 0 && result_0.holderCommit <= __compactRuntime.MAX_FIELD && typeof(result_0.subjectId) === 'bigint' && result_0.subjectId >= 0 && result_0.subjectId <= __compactRuntime.MAX_FIELD && Array.isArray(result_0.claims) && result_0.claims.length === 8 && result_0.claims.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && typeof(result_0.issuedAt) === 'bigint' && result_0.issuedAt >= 0n && result_0.issuedAt <= 18446744073709551615n && typeof(result_0.expiresAt) === 'bigint' && result_0.expiresAt >= 0n && result_0.expiresAt <= 18446744073709551615n && result_0.salt.buffer instanceof ArrayBuffer && result_0.salt.BYTES_PER_ELEMENT === 1 && result_0.salt.length === 32)) {
      __compactRuntime.typeError('credential',
                                 'return value',
                                 'stateproof.compact line 59 char 1',
                                 'struct Credential<schemaId: Bytes<32>, issuerId: Bytes<32>, epoch: Uint<0..4294967296>, holderCommit: Field, subjectId: Field, claims: Vector<8, Uint<0..18446744073709551616>>, issuedAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>, salt: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_28.toValue(result_0),
      alignment: _descriptor_28.alignment()
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
                                 'stateproof.compact line 60 char 1',
                                 'struct Signature<r: Opaque<"JubjubPoint">, s: Field>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_26.toValue(result_0),
      alignment: _descriptor_26.alignment()
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
                                 'stateproof.compact line 61 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _issuerPublicKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.issuerPublicKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _issuerPath_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.issuerPath(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.leaf.buffer instanceof ArrayBuffer && result_0.leaf.BYTES_PER_ELEMENT === 1 && result_0.leaf.length === 32 && Array.isArray(result_0.path) && result_0.path.length === 6 && result_0.path.every((t) => typeof(t) === 'object' && typeof(t.sibling) === 'object' && typeof(t.sibling.field) === 'bigint' && t.sibling.field >= 0 && t.sibling.field <= __compactRuntime.MAX_FIELD && typeof(t.goes_left) === 'boolean'))) {
      __compactRuntime.typeError('issuerPath',
                                 'return value',
                                 'stateproof.compact line 63 char 1',
                                 'struct MerkleTreePath<leaf: Bytes<32>, path: Vector<6, struct MerkleTreePathEntry<sibling: struct MerkleTreeDigest<field: Field>, goes_left: Boolean>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_25.toValue(result_0),
      alignment: _descriptor_25.alignment()
    });
    return result_0;
  }
  _requestNonce_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.requestNonce(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('requestNonce',
                                 'return value',
                                 'stateproof.compact line 64 char 1',
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
  _requireAdmin_0(context, partialProofData) {
    __compactRuntime.assert(this._equal_6(this._adminKey_0(this._adminSecret_0(context,
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
                            'Only the admin can do this');
    return [];
  }
  _registerSchema_0(context, partialProofData, schemaId_0, rule_0) {
    this._requireAdmin_0(context, partialProofData);
    const id_0 = schemaId_0;
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Schema already registered');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(4n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_22.toValue(rule_0),
                                                                                              alignment: _descriptor_22.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _registerIssuer_0(context,
                    partialProofData,
                    issuerId_0,
                    schemaId_0,
                    publicKey_0,
                    slot_0)
  {
    this._requireAdmin_0(context, partialProofData);
    const id_0 = issuerId_0;
    const schema_0 = schemaId_0;
    const key_0 = publicKey_0;
    const position_0 = slot_0;
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Issuer already registered');
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
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(position_0),
                                                                                                                                               alignment: _descriptor_3.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Issuer slot already used');
    __compactRuntime.assert(position_0 < 64n, 'Issuer slot out of range');
    __compactRuntime.assert(_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_1.toValue(4n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(schema_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Schema is not registered');
    this._assertUsablePoint_0(key_0);
    const tmp_0 = { schemaId: schema_0,
                    publicKey: key_0,
                    epoch: 0n,
                    slot: position_0,
                    active: true };
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(tmp_0),
                                                                                              alignment: _descriptor_19.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(position_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = this._issuerLeaf_0(id_0, schema_0, key_0, 0n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(0n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(position_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_0.toValue(tmp_1),
                                                                                                alignment: _descriptor_0.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(position_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { addi: { immediate: 1 } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'lt',
                                       { branch: { skip: 2 } },
                                       'pop',
                                       { jmp: { skip: 2 } },
                                       { swap: { n: 0 } },
                                       'pop',
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _rotateIssuerEpoch_0(context, partialProofData, issuerId_0) {
    const id_0 = issuerId_0;
    __compactRuntime.assert(_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Unknown issuer');
    const record_0 = _descriptor_19.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                   value: { value: _descriptor_0.toValue(id_0),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    __compactRuntime.assert(record_0.active, 'Issuer is deactivated');
    __compactRuntime.assert(this._samePoint_0(this._derivePublicKey_0(this._issuerSecret_0(context,
                                                                                           partialProofData)),
                                              record_0.publicKey),
                            'Only the issuer can rotate its epoch');
    const next_0 = ((t1) => {
                     if (t1 > 4294967295n) {
                       throw new __compactRuntime.CompactError('stateproof.compact line 109 char 16: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                     }
                     return t1;
                   })(record_0.epoch + 1n);
    const tmp_0 = { schemaId: record_0.schemaId,
                    publicKey: record_0.publicKey,
                    epoch: next_0,
                    slot: record_0.slot,
                    active: true };
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(tmp_0),
                                                                                              alignment: _descriptor_19.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = this._issuerLeaf_0(id_0,
                                     record_0.schemaId,
                                     record_0.publicKey,
                                     next_0);
    const tmp_2 = record_0.slot;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(0n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_2),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_0.toValue(tmp_1),
                                                                                                alignment: _descriptor_0.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_2),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { addi: { immediate: 1 } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'lt',
                                       { branch: { skip: 2 } },
                                       'pop',
                                       { jmp: { skip: 2 } },
                                       { swap: { n: 0 } },
                                       'pop',
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _deactivateIssuer_0(context, partialProofData, issuerId_0) {
    this._requireAdmin_0(context, partialProofData);
    const id_0 = issuerId_0;
    __compactRuntime.assert(_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Unknown issuer');
    const record_0 = _descriptor_19.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                   value: { value: _descriptor_0.toValue(id_0),
                                                                                                            alignment: _descriptor_0.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    const tmp_0 = { schemaId: record_0.schemaId,
                    publicKey: record_0.publicKey,
                    epoch: record_0.epoch,
                    slot: record_0.slot,
                    active: false };
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_19.toValue(tmp_0),
                                                                                              alignment: _descriptor_19.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = record_0.slot;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(3n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(0n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_1),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                                alignment: _descriptor_0.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(1n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_1),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { addi: { immediate: 1 } },
                                       { dup: { n: 1 } },
                                       { dup: { n: 1 } },
                                       'lt',
                                       { branch: { skip: 2 } },
                                       'pop',
                                       { jmp: { skip: 2 } },
                                       { swap: { n: 0 } },
                                       'pop',
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _createRequest_0(context,
                   partialProofData,
                   requestId_0,
                   policy_0,
                   referenceTime_0,
                   expiresAt_0,
                   subjectCommit_0)
  {
    const id_0 = requestId_0;
    const publicPolicy_0 = policy_0;
    const reference_0 = referenceTime_0;
    const expiry_0 = expiresAt_0;
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(5n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Request id already used');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = publicPolicy_0.schemaId,
                             _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Schema is not registered');
    this._assertWellFormedPolicy_0(publicPolicy_0);
    let tmp_1;
    __compactRuntime.assert(this._respectsSensitiveSlots_0(publicPolicy_0,
                                                           (tmp_1 = publicPolicy_0.schemaId,
                                                            _descriptor_22.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                       partialProofData,
                                                                                                                       [
                                                                                                                        { dup: { n: 0 } },
                                                                                                                        { idx: { cached: false,
                                                                                                                                 pushPath: false,
                                                                                                                                 path: [
                                                                                                                                        { tag: 'value',
                                                                                                                                          value: { value: _descriptor_1.toValue(4n),
                                                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                                                        { idx: { cached: false,
                                                                                                                                 pushPath: false,
                                                                                                                                 path: [
                                                                                                                                        { tag: 'value',
                                                                                                                                          value: { value: _descriptor_0.toValue(tmp_1),
                                                                                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                                                                                        { popeq: { cached: false,
                                                                                                                                   result: undefined } }]).value))),
                            'Policy narrows a protected value too far');
    __compactRuntime.assert(this._blockTimeGte_0(context,
                                                 partialProofData,
                                                 reference_0),
                            'Reference time is in the future');
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                ((t1) => {
                                                  if (t1 > 18446744073709551615n) {
                                                    throw new __compactRuntime.CompactError('stateproof.compact line 154 char 22: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                                  }
                                                  return t1;
                                                })(reference_0
                                                   +
                                                   this._referenceTolerance_0())),
                            'Reference time is too old');
    __compactRuntime.assert(this._blockTimeLt_0(context,
                                                partialProofData,
                                                expiry_0),
                            'Request expiry must be in the future');
    const tmp_2 = { policy: publicPolicy_0,
                    referenceTime: reference_0,
                    expiresAt: expiry_0,
                    subjectCommit: subjectCommit_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(5n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(tmp_2),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(6n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(7n),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
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
                                                                                                         value: { value: _descriptor_1.toValue(5n),
                                                                                                                  alignment: _descriptor_1.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Unknown request');
    const request_0 = _descriptor_12.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_1.toValue(5n),
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
    const issuerKey_0 = this._issuerPublicKey_0(context, partialProofData);
    const path_0 = this._issuerPath_0(context, partialProofData);
    __compactRuntime.assert(this._equal_7(cred_0.schemaId,
                                          request_0.policy.schemaId),
                            'Credential schema does not match the policy');
    __compactRuntime.assert(this._equal_8(path_0.leaf,
                                          this._issuerLeaf_0(cred_0.issuerId,
                                                             cred_0.schemaId,
                                                             issuerKey_0,
                                                             cred_0.epoch)),
                            'Issuer path does not belong to this credential');
    let tmp_0;
    __compactRuntime.assert((tmp_0 = this._merkleTreePathRoot_0(path_0),
                             _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                                          value: { value: _descriptor_1.toValue(0n),
                                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                                        'root',
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_13.alignment() }).encode() } },
                                                                                        'eq',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Credential issuer is not in the current issuer set');
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
    const secret_0 = this._holderSecret_0(context, partialProofData);
    __compactRuntime.assert(this._holderCommitment_0(secret_0)
                            ===
                            cred_0.holderCommit,
                            'Credential is bound to another holder');
    __compactRuntime.assert(!request_0.subjectCommit.is_some
                            ||
                            this._subjectCommitment_0(cred_0.subjectId,
                                                      this._requestNonce_0(context,
                                                                           partialProofData))
                            ===
                            request_0.subjectCommit.value,
                            'Credential belongs to a different person than the one this request is for');
    __compactRuntime.assert(this._policyHolds_0(cred_0.claims, request_0.policy),
                            'Policy conditions are not satisfied');
    const pseudonym_0 = this._pseudonymFor_0(id_0, secret_0);
    __compactRuntime.assert(!_descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_1.toValue(6n),
                                                                                                                   alignment: _descriptor_1.alignment() } },
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_0.toValue(id_0),
                                                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pseudonym_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'This holder already answered this request');
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
                                                         value: { value: _descriptor_1.toValue(6n),
                                                                  alignment: _descriptor_1.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_0.toValue(id_0),
                                                                  alignment: _descriptor_0.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pseudonym_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_16.toValue(tmp_1),
                                                                                              alignment: _descriptor_16.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    const tmp_2 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(7n),
                                                                  alignment: _descriptor_1.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_0.toValue(id_0),
                                                                  alignment: _descriptor_0.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_14.toValue(tmp_2),
                                                                alignment: _descriptor_14.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 2 } }]);
    return pseudonym_0;
  }
  _folder_0(f, x, a0) {
    for (let i = 0; i < 6; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_1(f, x, a0, a1) {
    for (let i = 0; i < 8; i++) { x = f(x, a0[i], a1[i]); }
    return x;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_2(f, x, a0) {
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
  _folder_3(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _folder_4(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_5(f, x, a0) {
    for (let i = 0; i < 4; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_6(f, x, a0, a1) {
    for (let i = 0; i < 8; i++) { x = f(x, a0[i], a1[i]); }
    return x;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
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
                                     'stateproof.compact line 43 char 1',
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
                                     'stateproof.compact line 43 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_19.fromValue(__compactRuntime.queryLedgerState(context,
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
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_19.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    issuerSlots: {
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
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'stateproof.compact line 45 char 1',
                                     'Uint<0..18446744073709551616>',
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
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(key_0),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'stateproof.compact line 45 char 1',
                                     'Uint<0..18446744073709551616>',
                                     key_0)
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
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
                                                                                            value: { value: _descriptor_3.toValue(key_0),
                                                                                                     alignment: _descriptor_3.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_3.fromValue(key.value),      _descriptor_0.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    issuerTree: {
      isFull(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isFull: expected 0 arguments, received ${args_0.length}`);
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
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(1n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(64n),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'lt',
                                                                          'neg',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      checkRoot(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`checkRoot: expected 1 argument, received ${args_0.length}`);
        }
        const rt_0 = args_0[0];
        if (!(typeof(rt_0) === 'object' && typeof(rt_0.field) === 'bigint' && rt_0.field >= 0 && rt_0.field <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('checkRoot',
                                     'argument 1',
                                     'stateproof.compact line 48 char 1',
                                     'struct MerkleTreeDigest<field: Field>',
                                     rt_0)
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
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(0n),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          'root',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(rt_0),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      root(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`root: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return ((result) => result             ? __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(result)             : undefined)(self_0.asArray()[0].asBoundedMerkleTree().rehash().root()?.value);
      },
      firstFree(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`first_free: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return __compactRuntime.CompactTypeField.fromValue(self_0.asArray()[1].asCell().value);
      },
      pathForLeaf(...args_0) {
        if (args_0.length !== 2) {
          throw new __compactRuntime.CompactError(`path_for_leaf: expected 2 arguments, received ${args_0.length}`);
        }
        const index_0 = args_0[0];
        const leaf_0 = args_0[1];
        if (!(typeof(index_0) === 'bigint' && index_0 >= 0 && index_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 1',
                                     'stateproof.compact line 48 char 1',
                                     'Field',
                                     index_0)
        }
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 2',
                                     'stateproof.compact line 48 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[3];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(6, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().pathForLeaf(    index_0,    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      },
      findPathForLeaf(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`find_path_for_leaf: expected 1 argument, received ${args_0.length}`);
        }
        const leaf_0 = args_0[0];
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('find_path_for_leaf',
                                     'argument 1',
                                     'stateproof.compact line 48 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[3];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(6, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().findPathForLeaf(    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      }
    },
    schemaRules: {
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
                                                                                            value: { value: _descriptor_1.toValue(4n),
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
                                                                                            value: { value: _descriptor_1.toValue(4n),
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
                                     'stateproof.compact line 50 char 1',
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
                                                                                            value: { value: _descriptor_1.toValue(4n),
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
                                     'stateproof.compact line 50 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_22.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_1.toValue(4n),
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
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_22.fromValue(value.value)    ];  })[Symbol.iterator]();
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
                                                                                            value: { value: _descriptor_1.toValue(5n),
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
                                                                                            value: { value: _descriptor_1.toValue(5n),
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
                                     'stateproof.compact line 52 char 1',
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
                                                                                            value: { value: _descriptor_1.toValue(5n),
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
                                     'stateproof.compact line 52 char 1',
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
                                                                                             value: { value: _descriptor_1.toValue(5n),
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
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_12.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    answers: {
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
                                                                                            value: { value: _descriptor_1.toValue(6n),
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
                                                                                            value: { value: _descriptor_1.toValue(6n),
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
                                     'stateproof.compact line 54 char 1',
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
                                                                                            value: { value: _descriptor_1.toValue(6n),
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
                                     'stateproof.compact line 54 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        if (state.asArray()[6].asMap().get({ value: _descriptor_0.toValue(key_0),
                                             alignment: _descriptor_0.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          isEmpty(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(6n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              'size',
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                                                                     alignment: _descriptor_3.alignment() }).encode() } },
                                                                              'eq',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          size(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(6n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              'size',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          member(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(key_1.buffer instanceof ArrayBuffer && key_1.BYTES_PER_ELEMENT === 1 && key_1.length === 32)) {
              __compactRuntime.typeError('member',
                                         'argument 1',
                                         'stateproof.compact line 54 char 39',
                                         'Bytes<32>',
                                         key_1)
            }
            return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(6n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_1),
                                                                                                                                     alignment: _descriptor_0.alignment() }).encode() } },
                                                                              'member',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          lookup(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(key_1.buffer instanceof ArrayBuffer && key_1.BYTES_PER_ELEMENT === 1 && key_1.length === 32)) {
              __compactRuntime.typeError('lookup',
                                         'argument 1',
                                         'stateproof.compact line 54 char 39',
                                         'Bytes<32>',
                                         key_1)
            }
            return _descriptor_16.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_1.toValue(6n),
                                                                                                          alignment: _descriptor_1.alignment() } },
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(key_0),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(key_1),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               { popeq: { cached: false,
                                                                                          result: undefined } }]).value);
          },
          [Symbol.iterator](...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_1.length}`);
            }
            const self_0 = state.asArray()[6].asMap().get({ value: _descriptor_0.toValue(key_0),
                                                            alignment: _descriptor_0.alignment() });
            return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_16.fromValue(value.value)    ];  })[Symbol.iterator]();
          }
        }
      }
    },
    answerCounts: {
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
                                                                                            value: { value: _descriptor_1.toValue(7n),
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
                                                                                            value: { value: _descriptor_1.toValue(7n),
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
                                     'stateproof.compact line 55 char 1',
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
                                                                                            value: { value: _descriptor_1.toValue(7n),
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
                                     'stateproof.compact line 55 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        if (state.asArray()[7].asMap().get({ value: _descriptor_0.toValue(key_0),
                                             alignment: _descriptor_0.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          read(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`read: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(7n),
                                                                                                         alignment: _descriptor_1.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_0.toValue(key_0),
                                                                                                         alignment: _descriptor_0.alignment() } }] } },
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          }
        }
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  adminSecret: (...args) => undefined,
  issuerSecret: (...args) => undefined,
  credential: (...args) => undefined,
  credentialSignature: (...args) => undefined,
  holderSecret: (...args) => undefined,
  issuerPublicKey: (...args) => undefined,
  issuerPath: (...args) => undefined,
  requestNonce: (...args) => undefined
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
  issuerLeafDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`issuerLeafDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._issuerLeafDomain_0();
  },
  subjectDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`subjectDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._subjectDomain_0();
  },
  subjectCommitDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`subjectCommitDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._subjectCommitDomain_0();
  },
  pseudonymDomain: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`pseudonymDomain: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._pseudonymDomain_0();
  },
  credentialRoot: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`credentialRoot: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const credential_0 = args_0[0];
    if (!(typeof(credential_0) === 'object' && credential_0.schemaId.buffer instanceof ArrayBuffer && credential_0.schemaId.BYTES_PER_ELEMENT === 1 && credential_0.schemaId.length === 32 && credential_0.issuerId.buffer instanceof ArrayBuffer && credential_0.issuerId.BYTES_PER_ELEMENT === 1 && credential_0.issuerId.length === 32 && typeof(credential_0.epoch) === 'bigint' && credential_0.epoch >= 0n && credential_0.epoch <= 4294967295n && typeof(credential_0.holderCommit) === 'bigint' && credential_0.holderCommit >= 0 && credential_0.holderCommit <= __compactRuntime.MAX_FIELD && typeof(credential_0.subjectId) === 'bigint' && credential_0.subjectId >= 0 && credential_0.subjectId <= __compactRuntime.MAX_FIELD && Array.isArray(credential_0.claims) && credential_0.claims.length === 8 && credential_0.claims.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n) && typeof(credential_0.issuedAt) === 'bigint' && credential_0.issuedAt >= 0n && credential_0.issuedAt <= 18446744073709551615n && typeof(credential_0.expiresAt) === 'bigint' && credential_0.expiresAt >= 0n && credential_0.expiresAt <= 18446744073709551615n && credential_0.salt.buffer instanceof ArrayBuffer && credential_0.salt.BYTES_PER_ELEMENT === 1 && credential_0.salt.length === 32)) {
      __compactRuntime.typeError('credentialRoot',
                                 'argument 1',
                                 'credential.compact line 77 char 1',
                                 'struct Credential<schemaId: Bytes<32>, issuerId: Bytes<32>, epoch: Uint<0..4294967296>, holderCommit: Field, subjectId: Field, claims: Vector<8, Uint<0..18446744073709551616>>, issuedAt: Uint<0..18446744073709551616>, expiresAt: Uint<0..18446744073709551616>, salt: Bytes<32>>',
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
                                 'credential.compact line 86 char 1',
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
                                 'credential.compact line 93 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._holderCommitment_0(secret_0);
  },
  subjectIdOf: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`subjectIdOf: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const digest_0 = args_0[0];
    if (!(digest_0.buffer instanceof ArrayBuffer && digest_0.BYTES_PER_ELEMENT === 1 && digest_0.length === 32)) {
      __compactRuntime.typeError('subjectIdOf',
                                 'argument 1',
                                 'credential.compact line 99 char 1',
                                 'Bytes<32>',
                                 digest_0)
    }
    return _dummyContract._subjectIdOf_0(digest_0);
  },
  subjectCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`subjectCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const subjectId_0 = args_0[0];
    const nonce_0 = args_0[1];
    if (!(typeof(subjectId_0) === 'bigint' && subjectId_0 >= 0 && subjectId_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('subjectCommitment',
                                 'argument 1',
                                 'credential.compact line 106 char 1',
                                 'Field',
                                 subjectId_0)
    }
    if (!(nonce_0.buffer instanceof ArrayBuffer && nonce_0.BYTES_PER_ELEMENT === 1 && nonce_0.length === 32)) {
      __compactRuntime.typeError('subjectCommitment',
                                 'argument 2',
                                 'credential.compact line 106 char 1',
                                 'Bytes<32>',
                                 nonce_0)
    }
    return _dummyContract._subjectCommitment_0(subjectId_0, nonce_0);
  },
  pseudonymFor: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`pseudonymFor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const requestId_0 = args_0[0];
    const secret_0 = args_0[1];
    if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
      __compactRuntime.typeError('pseudonymFor',
                                 'argument 1',
                                 'credential.compact line 114 char 1',
                                 'Bytes<32>',
                                 requestId_0)
    }
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('pseudonymFor',
                                 'argument 2',
                                 'credential.compact line 114 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._pseudonymFor_0(requestId_0, secret_0);
  },
  issuerLeaf: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`issuerLeaf: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const issuerId_0 = args_0[0];
    const schemaId_0 = args_0[1];
    const publicKey_0 = args_0[2];
    const epoch_0 = args_0[3];
    if (!(issuerId_0.buffer instanceof ArrayBuffer && issuerId_0.BYTES_PER_ELEMENT === 1 && issuerId_0.length === 32)) {
      __compactRuntime.typeError('issuerLeaf',
                                 'argument 1',
                                 'credential.compact line 120 char 1',
                                 'Bytes<32>',
                                 issuerId_0)
    }
    if (!(schemaId_0.buffer instanceof ArrayBuffer && schemaId_0.BYTES_PER_ELEMENT === 1 && schemaId_0.length === 32)) {
      __compactRuntime.typeError('issuerLeaf',
                                 'argument 2',
                                 'credential.compact line 120 char 1',
                                 'Bytes<32>',
                                 schemaId_0)
    }
    if (!(typeof(epoch_0) === 'bigint' && epoch_0 >= 0n && epoch_0 <= 4294967295n)) {
      __compactRuntime.typeError('issuerLeaf',
                                 'argument 4',
                                 'credential.compact line 120 char 1',
                                 'Uint<0..4294967296>',
                                 epoch_0)
    }
    return _dummyContract._issuerLeaf_0(issuerId_0,
                                        schemaId_0,
                                        publicKey_0,
                                        epoch_0);
  },
  derivePublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`derivePublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secretScalar_0 = args_0[0];
    if (!(typeof(secretScalar_0) === 'bigint' && secretScalar_0 >= 0 && secretScalar_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('derivePublicKey',
                                 'argument 1',
                                 'credential.compact line 130 char 1',
                                 'Field',
                                 secretScalar_0)
    }
    return _dummyContract._derivePublicKey_0(secretScalar_0);
  },
  samePoint: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`samePoint: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const a_0 = args_0[0];
    const b_0 = args_0[1];
    return _dummyContract._samePoint_0(a_0, b_0);
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
                                 'credential.compact line 150 char 1',
                                 'struct Signature<r: Opaque<"JubjubPoint">, s: Field>',
                                 signature_0)
    }
    if (!(typeof(challenge_0) === 'bigint' && challenge_0 >= 0 && challenge_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('isValidSignature',
                                 'argument 3',
                                 'credential.compact line 150 char 1',
                                 'Field',
                                 challenge_0)
    }
    return _dummyContract._isValidSignature_0(publicKey_0,
                                              signature_0,
                                              challenge_0);
  },
  slotIndexes: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`slotIndexes: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._slotIndexes_0();
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
                                 'policy.compact line 45 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(index_0) === 'bigint' && index_0 >= 0n && index_0 <= 255n)) {
      __compactRuntime.typeError('selectClaim',
                                 'argument 2',
                                 'policy.compact line 45 char 1',
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
                                 'policy.compact line 55 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(condition_0) === 'object' && typeof(condition_0.claimIndex) === 'bigint' && condition_0.claimIndex >= 0n && condition_0.claimIndex <= 255n && typeof(condition_0.op) === 'number' && condition_0.op >= 0 && condition_0.op <= 6 && typeof(condition_0.value) === 'bigint' && condition_0.value >= 0n && condition_0.value <= 18446744073709551615n && typeof(condition_0.value2) === 'bigint' && condition_0.value2 >= 0n && condition_0.value2 <= 18446744073709551615n && Array.isArray(condition_0.set) && condition_0.set.length === 4 && condition_0.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n))) {
      __compactRuntime.typeError('conditionHolds',
                                 'argument 2',
                                 'policy.compact line 55 char 1',
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
                                 'policy.compact line 71 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('policyHolds',
                                 'argument 2',
                                 'policy.compact line 71 char 1',
                                 'struct Policy<schemaId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    return _dummyContract._policyHolds_0(claims_0, policy_0);
  },
  assertWellFormedPolicy: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`assertWellFormedPolicy: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const policy_0 = args_0[0];
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('assertWellFormedPolicy',
                                 'argument 1',
                                 'policy.compact line 79 char 1',
                                 'struct Policy<schemaId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    return _dummyContract._assertWellFormedPolicy_0(policy_0);
  },
  slotBounds: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`slotBounds: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const conditions_0 = args_0[0];
    const slot_0 = args_0[1];
    if (!(Array.isArray(conditions_0) && conditions_0.length === 4 && conditions_0.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)))) {
      __compactRuntime.typeError('slotBounds',
                                 'argument 1',
                                 'policy.compact line 97 char 1',
                                 'Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>',
                                 conditions_0)
    }
    if (!(typeof(slot_0) === 'bigint' && slot_0 >= 0n && slot_0 <= 255n)) {
      __compactRuntime.typeError('slotBounds',
                                 'argument 2',
                                 'policy.compact line 97 char 1',
                                 'Uint<0..256>',
                                 slot_0)
    }
    return _dummyContract._slotBounds_0(conditions_0, slot_0);
  },
  slotRespected: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`slotRespected: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const policy_0 = args_0[0];
    const r_0 = args_0[1];
    const slot_0 = args_0[2];
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('slotRespected',
                                 'argument 1',
                                 'policy.compact line 110 char 1',
                                 'struct Policy<schemaId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    if (!(typeof(r_0) === 'object' && typeof(r_0.sensitive) === 'boolean' && typeof(r_0.minWidth) === 'bigint' && r_0.minWidth >= 0n && r_0.minWidth <= 18446744073709551615n)) {
      __compactRuntime.typeError('slotRespected',
                                 'argument 2',
                                 'policy.compact line 110 char 1',
                                 'struct SlotRule<sensitive: Boolean, minWidth: Uint<0..18446744073709551616>>',
                                 r_0)
    }
    if (!(typeof(slot_0) === 'bigint' && slot_0 >= 0n && slot_0 <= 255n)) {
      __compactRuntime.typeError('slotRespected',
                                 'argument 3',
                                 'policy.compact line 110 char 1',
                                 'Uint<0..256>',
                                 slot_0)
    }
    return _dummyContract._slotRespected_0(policy_0, r_0, slot_0);
  },
  respectsSensitiveSlots: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`respectsSensitiveSlots: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const policy_0 = args_0[0];
    const rule_0 = args_0[1];
    if (!(typeof(policy_0) === 'object' && policy_0.schemaId.buffer instanceof ArrayBuffer && policy_0.schemaId.BYTES_PER_ELEMENT === 1 && policy_0.schemaId.length === 32 && Array.isArray(policy_0.conditions) && policy_0.conditions.length === 4 && policy_0.conditions.every((t) => typeof(t) === 'object' && typeof(t.claimIndex) === 'bigint' && t.claimIndex >= 0n && t.claimIndex <= 255n && typeof(t.op) === 'number' && t.op >= 0 && t.op <= 6 && typeof(t.value) === 'bigint' && t.value >= 0n && t.value <= 18446744073709551615n && typeof(t.value2) === 'bigint' && t.value2 >= 0n && t.value2 <= 18446744073709551615n && Array.isArray(t.set) && t.set.length === 4 && t.set.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 18446744073709551615n)) && typeof(policy_0.revealSlot) === 'object' && typeof(policy_0.revealSlot.is_some) === 'boolean' && typeof(policy_0.revealSlot.value) === 'bigint' && policy_0.revealSlot.value >= 0n && policy_0.revealSlot.value <= 255n)) {
      __compactRuntime.typeError('respectsSensitiveSlots',
                                 'argument 1',
                                 'policy.compact line 118 char 1',
                                 'struct Policy<schemaId: Bytes<32>, conditions: Vector<4, struct Condition<claimIndex: Uint<0..256>, op: Enum<Op, ignore, gte, lte, eq, neq, between, inSet>, value: Uint<0..18446744073709551616>, value2: Uint<0..18446744073709551616>, set: Vector<4, Uint<0..18446744073709551616>>>>, revealSlot: struct Maybe<is_some: Boolean, value: Uint<0..256>>>',
                                 policy_0)
    }
    if (!(typeof(rule_0) === 'object' && Array.isArray(rule_0.slots) && rule_0.slots.length === 8 && rule_0.slots.every((t) => typeof(t) === 'object' && typeof(t.sensitive) === 'boolean' && typeof(t.minWidth) === 'bigint' && t.minWidth >= 0n && t.minWidth <= 18446744073709551615n))) {
      __compactRuntime.typeError('respectsSensitiveSlots',
                                 'argument 2',
                                 'policy.compact line 118 char 1',
                                 'struct SchemaRule<slots: Vector<8, struct SlotRule<sensitive: Boolean, minWidth: Uint<0..18446744073709551616>>>>',
                                 rule_0)
    }
    return _dummyContract._respectsSensitiveSlots_0(policy_0, rule_0);
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
                                 'policy.compact line 127 char 1',
                                 'Vector<8, Uint<0..18446744073709551616>>',
                                 claims_0)
    }
    if (!(typeof(revealSlot_0) === 'object' && typeof(revealSlot_0.is_some) === 'boolean' && typeof(revealSlot_0.value) === 'bigint' && revealSlot_0.value >= 0n && revealSlot_0.value <= 255n)) {
      __compactRuntime.typeError('revealedClaim',
                                 'argument 2',
                                 'policy.compact line 127 char 1',
                                 'struct Maybe<is_some: Boolean, value: Uint<0..256>>',
                                 revealSlot_0)
    }
    return _dummyContract._revealedClaim_0(claims_0, revealSlot_0);
  },
  referenceTolerance: (...args_0) => {
    if (args_0.length !== 0) {
      throw new __compactRuntime.CompactError(`referenceTolerance: expected 0 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    return _dummyContract._referenceTolerance_0();
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
