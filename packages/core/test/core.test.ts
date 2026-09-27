import { describe, expect, it } from 'vitest';
import { Op, generateIssuerKeyPair, pureCircuits } from '@stateproof/contract';
import {
  CLAIM_SLOTS,
  MAX_CONDITIONS,
  SET_SIZE,
  SCHEMAS,
  buildPolicy,
  buildReceipt,
  createHolderSecret,
  dateToDays,
  daysToDate,
  decodeSubject,
  describePolicy,
  encodeSubject,
  getSchema,
  holderCommitOf,
  issueCredential,
  labelToBytes32,
  toContractCredential,
  validateSchema,
  verifyCredentialDocument,
  type PolicyInput,
} from '../src/index.js';

const zeros = (n: number) => Array<bigint>(n).fill(0n);

describe('constants match the compiled circuit', () => {
  it('CLAIM_SLOTS is the claim vector length', () => {
    expect(pureCircuits.selectClaim(zeros(CLAIM_SLOTS), 0n)).toBe(0n);
    expect(() => pureCircuits.selectClaim(zeros(CLAIM_SLOTS + 1), 0n)).toThrow();
    expect(() => pureCircuits.selectClaim(zeros(CLAIM_SLOTS - 1), 0n)).toThrow();
  });

  it('MAX_CONDITIONS and SET_SIZE are the policy vector lengths', () => {
    const input: PolicyInput = { schema: 'employment', issuerId: 'issuer:acme-hr', conditions: [{ claim: 'employmentStatus', op: 'eq', value: 'Active' }], reveal: null };
    const policy = buildPolicy(input);
    expect(policy.conditions).toHaveLength(MAX_CONDITIONS);
    expect(policy.conditions[0].set).toHaveLength(SET_SIZE);
    expect(() => pureCircuits.assertWellFormedPolicy(policy)).not.toThrow();
    expect(() => pureCircuits.assertWellFormedPolicy({ ...policy, conditions: [...policy.conditions, policy.conditions[0]] })).toThrow();
    const cond = { ...policy.conditions[0], set: zeros(SET_SIZE + 1) };
    expect(() => pureCircuits.conditionHolds(zeros(CLAIM_SLOTS), cond)).toThrow();
  });
});

describe('schemas and claim encoding', () => {
  it('ships two valid schemas with labels that fit 32 bytes', () => {
    expect(SCHEMAS.map((s) => s.id)).toEqual(['employment', 'identity']);
    for (const s of SCHEMAS) expect(labelToBytes32(s.label)).toHaveLength(32);
  });

  it('round-trips a subject through the slot encoding', () => {
    const schema = getSchema('identity');
    const subject = { birthDate: '1995-03-14', ageYears: 31, nationality: 'KR', region: 'Gyeonggi' };
    const slots = encodeSubject(schema, subject);
    expect(slots).toHaveLength(CLAIM_SLOTS);
    expect(slots[3]).toBe(41n);
    expect(decodeSubject(schema, slots)).toEqual({ ...subject, ageYears: '31' });
  });

  it('encodes dates as whole UTC days', () => {
    expect(dateToDays('1970-01-02')).toBe(1n);
    expect(daysToDate(dateToDays('2026-09-25'))).toBe('2026-09-25');
  });

  it('refuses missing, unknown and invalid claims instead of defaulting', () => {
    const schema = getSchema('employment');
    const ok = { employmentStatus: 'Active', jobCategory: 'Design', employmentStartDate: '2024-07-01', employmentMonths: 26 };
    expect(() => encodeSubject(schema, { ...ok, employmentMonths: undefined as never })).toThrow(/missing employmentMonths/);
    expect(() => encodeSubject(schema, { ...ok, salary: 1 })).toThrow(/unknown claims salary/);
    expect(() => encodeSubject(schema, { ...ok, employmentStatus: 'Retired' })).toThrow(/not one of/);
    expect(() => encodeSubject(schema, { ...ok, employmentStartDate: '07/01/2024' })).toThrow(/YYYY-MM-DD/);
  });
});

describe('policy builder', () => {
  const demo: PolicyInput = {
    schema: 'identity',
    issuerId: 'issuer:gov-id-demo',
    conditions: [
      { claim: 'ageYears', op: 'gte', value: 19 },
      { claim: 'region', op: 'inSet', values: ['Seoul', 'Gyeonggi'] },
      { claim: 'nationality', op: 'eq', value: 'KR' },
    ],
    reveal: 'region',
  };

  it('builds a policy the circuit evaluates as expected', () => {
    const policy = buildPolicy(demo);
    const schema = getSchema('identity');
    const pass = encodeSubject(schema, { birthDate: '1995-03-14', ageYears: 31, nationality: 'KR', region: 'Gyeonggi' });
    const failRegion = encodeSubject(schema, { birthDate: '1995-03-14', ageYears: 31, nationality: 'KR', region: 'Busan' });
    const failAge = encodeSubject(schema, { birthDate: '2010-03-14', ageYears: 16, nationality: 'KR', region: 'Seoul' });
    expect(pureCircuits.policyHolds(pass, policy)).toBe(true);
    expect(pureCircuits.policyHolds(failRegion, policy)).toBe(false);
    expect(pureCircuits.policyHolds(failAge, policy)).toBe(false);
    expect(policy.conditions[3].op).toBe(Op.ignore);
    expect(policy.revealSlot).toEqual({ is_some: true, value: 3n });
  });

  it('describes the policy for the holder, including what is not disclosed', () => {
    const d = describePolicy(buildPolicy(demo), 'en');
    expect(d.conditions).toEqual(['Age at issuance at least 19 years', 'Region of residence is one of Seoul, Gyeonggi', 'Nationality is KR']);
    expect(d.revealed).toBe('Region of residence');
    expect(d.notDisclosed).toEqual(['Date of birth', 'Age at issuance']);
  });

  it('treats one-value conditions as disclosing that value', () => {
    const d = describePolicy(
      buildPolicy({
        ...demo,
        conditions: [
          { claim: 'region', op: 'inSet', values: ['Seoul'] },
          { claim: 'birthDate', op: 'between', value: '1995-03-14', value2: '1995-03-14' },
        ],
        reveal: null,
      }),
      'en',
    );
    expect(d.notDisclosed).toEqual(['Age at issuance', 'Nationality']);
  });

  it('treats conditions that together leave one value as disclosing it', () => {
    const employment = { schema: 'employment', issuerId: 'issuer:acme-hr', reveal: null } as const;
    const notDisclosed = (conditions: PolicyInput['conditions']) => describePolicy(buildPolicy({ ...employment, conditions }), 'en').notDisclosed;
    const startDay = { claim: 'employmentStartDate', op: 'gte', value: '2024-07-01' } as const;
    expect(notDisclosed([startDay, { claim: 'employmentStartDate', op: 'lte', value: '2024-07-01' }])).not.toContain('Employment start date');
    expect(notDisclosed([startDay, { claim: 'employmentStartDate', op: 'lte', value: '2024-07-02' }, { claim: 'employmentStartDate', op: 'neq', value: '2024-07-02' }])).not.toContain('Employment start date');
    expect(notDisclosed([startDay, { claim: 'employmentStartDate', op: 'lte', value: '2024-07-02' }])).toContain('Employment start date');
    expect(notDisclosed([{ claim: 'employmentStatus', op: 'neq', value: 'Active' }, { claim: 'employmentStatus', op: 'neq', value: 'Leave' }])).not.toContain('Employment status');
    expect(notDisclosed([{ claim: 'employmentStatus', op: 'neq', value: 'Active' }])).toContain('Employment status');
    expect(notDisclosed([{ claim: 'jobCategory', op: 'inSet', values: ['Design', 'Sales'] }, { claim: 'jobCategory', op: 'neq', value: 'Sales' }])).not.toContain('Job category');
  });

  it('allows only "at least" on values recorded at issuance', () => {
    for (const op of ['lte', 'eq', 'neq'] as const) {
      expect(() => buildPolicy({ ...demo, conditions: [{ claim: 'ageYears', op, value: 24 }] })).toThrow(/not allowed for Age at issuance/);
    }
    expect(() => buildPolicy({ ...demo, conditions: [{ claim: 'ageYears', op: 'between', value: 19, value2: 24 }] })).toThrow(/not allowed/);
    expect(() => buildPolicy({ schema: 'employment', issuerId: 'issuer:acme-hr', reveal: null, conditions: [{ claim: 'employmentMonths', op: 'lte', value: 6 }] })).toThrow(/not allowed for Months employed/);
  });

  it('rejects invalid policies', () => {
    expect(() => buildPolicy({ ...demo, conditions: [] })).toThrow(/at least one/);
    expect(() => buildPolicy({ ...demo, conditions: Array(MAX_CONDITIONS + 1).fill(demo.conditions[0]) })).toThrow(/At most/);
    expect(() => buildPolicy({ ...demo, conditions: [{ claim: 'region', op: 'gte', value: 'Seoul' }] })).toThrow(/not allowed/);
    expect(() => buildPolicy({ ...demo, conditions: [{ claim: 'birthDate', op: 'between', value: '2000-01-02', value2: '2000-01-01' }] })).toThrow(/lower bound/);
    expect(() => buildPolicy({ ...demo, conditions: [{ claim: 'ageYears', op: 'gte' }] })).toThrow(/value is required/);
    expect(() => buildPolicy({ ...demo, reveal: 'salary' })).toThrow(/no claim salary/);
  });
});

describe('issuance', () => {
  const issuer = generateIssuerKeyPair();
  const holderSecret = createHolderSecret();
  const doc = issueCredential(
    {
      schema: 'employment',
      issuer: { id: 'issuer:acme-hr', name: 'ACME HR (demo)' },
      issuedAt: '2026-09-01T00:00:00Z',
      expiresAt: '2027-09-01T00:00:00Z',
      credentialSubject: { employmentStatus: 'Active', jobCategory: 'Engineering', employmentStartDate: '2024-07-01', employmentMonths: 26 },
      holderCommit: holderCommitOf(holderSecret),
    },
    issuer,
  );

  it('produces a document whose signature verifies against the issuer key', () => {
    expect(verifyCredentialDocument(doc, issuer.publicKey)).toBe(true);
    expect(verifyCredentialDocument(doc, generateIssuerKeyPair().publicKey)).toBe(false);
  });

  it('breaks the signature when any claim changes', () => {
    const tampered = { ...doc, credentialSubject: { ...doc.credentialSubject, employmentMonths: 60 } };
    expect(verifyCredentialDocument(tampered, issuer.publicKey)).toBe(false);
  });

  it('binds the credential to the holder commitment', () => {
    expect(toContractCredential(doc).holderCommit).toBe(holderCommitOf(holderSecret));
  });

  it('survives a JSON round trip', () => {
    const copy = JSON.parse(JSON.stringify(doc));
    expect(verifyCredentialDocument(copy, issuer.publicKey)).toBe(true);
  });
});

describe('receipt', () => {
  const policy = buildPolicy({ schema: 'employment', issuerId: 'issuer:acme-hr', conditions: [{ claim: 'employmentStatus', op: 'eq', value: 'Active' }], reveal: 'jobCategory' });
  const request = { policy, referenceTime: 1_790_000_000n, expiresAt: 1_790_086_400n };
  const id = labelToBytes32('req');

  it('reports pending, expired and verified states', () => {
    expect(buildReceipt(id, request, null, 1_790_000_100n, 'en').status).toBe('pending');
    expect(buildReceipt(id, request, null, 1_790_086_400n, 'en').status).toBe('expired');
    const verified = buildReceipt(id, request, { revealed: { is_some: true, value: 2n } }, 1_790_000_100n, 'en');
    expect(verified.status).toBe('verified');
    expect(verified.revealed).toEqual({ label: 'Job category', value: 'Design' });
    expect(buildReceipt(id, request, { revealed: { is_some: true, value: 2n } }, 1_790_000_100n, 'ko').revealed).toEqual({ label: '직무', value: '디자인' });
  });
});

describe('korean text', () => {
  it('describes the demo policies in Korean', () => {
    const employment = describePolicy(
      buildPolicy({
        schema: 'employment',
        issuerId: 'issuer:acme-hr',
        conditions: [
          { claim: 'employmentStatus', op: 'eq', value: 'Active' },
          { claim: 'employmentMonths', op: 'gte', value: 12 },
        ],
        reveal: 'jobCategory',
      }),
      'ko',
    );
    expect(employment.conditions).toEqual(['재직 상태 재직 중', '근속 기간 12개월 이상']);
    expect(employment.revealed).toBe('직무');
    expect(employment.notDisclosed).toEqual(['입사일', '근속 기간']);
    const identity = describePolicy(
      buildPolicy({
        schema: 'identity',
        issuerId: 'issuer:gov-id-demo',
        conditions: [
          { claim: 'ageYears', op: 'gte', value: 19 },
          { claim: 'region', op: 'inSet', values: ['Seoul', 'Gyeonggi'] },
        ],
        reveal: 'region',
      }),
      'ko',
    );
    expect(identity.conditions).toEqual(['발급 시점 나이 19세 이상', '거주지 서울, 경기 중 하나']);
  });

  it('refuses a schema whose Korean text is incomplete instead of showing English', () => {
    const schema = getSchema('employment');
    const [status, ...rest] = schema.claims;
    const withoutLeave = { ...status, i18n: { ko: { ...status.i18n.ko, values: { Active: '재직 중', Terminated: '퇴사' } } } };
    expect(() => validateSchema({ ...schema, claims: [withoutLeave, ...rest] })).toThrow(/no text for Leave/);
    expect(() => validateSchema({ ...schema, i18n: { ko: { title: '' } } })).toThrow(/title is required/);
  });
});
