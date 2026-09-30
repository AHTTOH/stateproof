import { describe, expect, it } from 'vitest';
import { Op, generateIssuerKeyPair, pureCircuits } from '@stateproof/contract';
import {
  CLAIM_SLOTS,
  MAX_CONDITIONS,
  SET_SIZE,
  SCHEMAS,
  PolicyInputError,
  buildPolicy,
  buildReceipt,
  createHolderSecret,
  createIssuanceRequest,
  dateToDays,
  daysToDate,
  decodeSubject,
  describePolicy,
  encodeSubject,
  getSchema,
  holderCommitFromRequest,
  holderCommitOf,
  issueCredential,
  labelToBytes32,
  latestBirthDateForAge,
  minimumAgeCondition,
  normalizeName,
  schemaRule,
  sealSubject,
  subjectIdFor,
  toContractCredential,
  toHex,
  validateSchema,
  verifyCredentialDocument,
  type PolicyInput,
} from '../src/index.js';

const zeros = (n: number) => Array<bigint>(n).fill(0n);

const careerSubject = { employmentStatus: 'Active', jobCategory: 'Engineering', careerMonths: 38, annualSalary: 5_400, employmentType: 'Permanent' };
const youthSubject = { birthDate: '2006-05-20', region: 'Gyeonggi', studentStatus: 'Enrolled', partTimeMonths: 14 };

describe('constants match the compiled circuit', () => {
  it('CLAIM_SLOTS is the claim vector length', () => {
    expect(pureCircuits.selectClaim(zeros(CLAIM_SLOTS), 0n)).toBe(0n);
    expect(() => pureCircuits.selectClaim(zeros(CLAIM_SLOTS + 1), 0n)).toThrow();
    expect(() => pureCircuits.selectClaim(zeros(CLAIM_SLOTS - 1), 0n)).toThrow();
  });

  it('MAX_CONDITIONS and SET_SIZE are the policy vector lengths', () => {
    const policy = buildPolicy({ schema: 'career', conditions: [{ claim: 'employmentStatus', op: 'eq', value: 'Active' }], reveal: null });
    expect(policy.conditions).toHaveLength(MAX_CONDITIONS);
    expect(policy.conditions[0].set).toHaveLength(SET_SIZE);
    expect(() => pureCircuits.assertWellFormedPolicy(policy)).not.toThrow();
    expect(() => pureCircuits.assertWellFormedPolicy({ ...policy, conditions: [...policy.conditions, policy.conditions[0]] })).toThrow();
  });

  it('schemaRule has one entry per claim slot and matches the circuit rule type', () => {
    for (const schema of SCHEMAS) {
      const rule = schemaRule(schema);
      expect(rule.slots).toHaveLength(CLAIM_SLOTS);
      expect(() => pureCircuits.respectsSensitiveSlots(buildPolicy({ schema: schema.id, conditions: [{ claim: schema.claims[1].key, op: schema.claims[1].operators[0], value: Object.keys(schema.claims[1].codes ?? { x: 1 })[0] }], reveal: null }), rule)).not.toThrow();
    }
  });
});

describe('schemas and claim encoding', () => {
  it('ships the career and youth-work schemas with labels that fit 32 bytes', () => {
    expect(SCHEMAS.map((s) => s.id)).toEqual(['career', 'youth-work']);
    for (const s of SCHEMAS) expect(labelToBytes32(s.label)).toHaveLength(32);
  });

  it('marks salary and birth date as the protected claims', () => {
    expect(schemaRule(getSchema('career')).slots.map((s) => s.sensitive)).toEqual([false, false, false, true, false, false, false, false]);
    expect(schemaRule(getSchema('career')).slots[3]).toEqual({ sensitive: true, minWidth: 500n, step: 500n });
    expect(schemaRule(getSchema('youth-work')).slots[0]).toEqual({ sensitive: true, minWidth: 365n, step: 1n });
  });

  it('refuses a schema that marks an enum sensitive or allows exact operators on a sensitive claim', () => {
    const career = getSchema('career');
    const salary = career.claims[3];
    expect(() => validateSchema({ ...career, claims: [...career.claims.slice(0, 3), { ...salary, operators: ['gte', 'eq'] }, career.claims[4]] })).toThrow(/only ranges, not eq/);
    const status = career.claims[0];
    expect(() => validateSchema({ ...career, claims: [{ ...status, sensitive: { minWidth: 1, step: 1 } }, ...career.claims.slice(1)] })).toThrow(/enum claims cannot be sensitive/);
  });

  it('round-trips subjects through the slot encoding', () => {
    const career = getSchema('career');
    expect(decodeSubject(career, encodeSubject(career, careerSubject))).toEqual({ ...careerSubject, careerMonths: '38', annualSalary: '5400' });
    const youth = getSchema('youth-work');
    const slots = encodeSubject(youth, youthSubject);
    expect(slots[1]).toBe(41n);
    expect(decodeSubject(youth, slots)).toEqual({ ...youthSubject, partTimeMonths: '14' });
  });

  it('encodes dates as whole UTC days', () => {
    expect(dateToDays('1970-01-02')).toBe(1n);
    expect(daysToDate(dateToDays('2026-09-25'))).toBe('2026-09-25');
  });

  it('refuses missing, unknown and invalid claims instead of defaulting', () => {
    const schema = getSchema('career');
    expect(() => encodeSubject(schema, { ...careerSubject, careerMonths: undefined as never })).toThrow(/missing careerMonths/);
    expect(() => encodeSubject(schema, { ...careerSubject, bonus: 1 })).toThrow(/unknown claims bonus/);
    expect(() => encodeSubject(schema, { ...careerSubject, employmentStatus: 'Retired' })).toThrow(/not one of/);
  });
});

describe('policy builder', () => {
  const salaryAsk: PolicyInput = {
    schema: 'career',
    conditions: [
      { claim: 'careerMonths', op: 'gte', value: 36 },
      { claim: 'annualSalary', op: 'gte', value: 5_000 },
      { claim: 'jobCategory', op: 'inSet', values: ['Engineering', 'Product'] },
    ],
    reveal: 'employmentType',
  };

  it('builds a policy the circuit evaluates as expected', () => {
    const policy = buildPolicy(salaryAsk);
    const schema = getSchema('career');
    expect(pureCircuits.policyHolds(encodeSubject(schema, careerSubject), policy)).toBe(true);
    expect(pureCircuits.policyHolds(encodeSubject(schema, { ...careerSubject, annualSalary: 4_999 }), policy)).toBe(false);
    expect(pureCircuits.policyHolds(encodeSubject(schema, { ...careerSubject, careerMonths: 35 }), policy)).toBe(false);
    expect(policy.conditions[3].op).toBe(Op.ignore);
    expect(policy.revealSlot).toEqual({ is_some: true, value: 4n });
    expect(pureCircuits.respectsSensitiveSlots(policy, schemaRule(schema))).toBe(true);
  });

  it('refuses what the chain would refuse for a protected claim, with a code the UI can explain', () => {
    const code = (input: PolicyInput) => {
      try {
        buildPolicy(input);
        return 'accepted';
      } catch (e) {
        return e instanceof PolicyInputError ? e.code : 'other';
      }
    };
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'eq', value: 5_210 }] })).toBe('operatorNotAllowed');
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'between', value: 5_000, value2: 5_100 }] })).toBe('protectedOffGrid');
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'between', value: 5_000, value2: 5_000 }] })).toBe('protectedTooNarrow');
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'gte', value: 5_500 }, { claim: 'annualSalary', op: 'lte', value: 5_500 }] })).toBe('protectedTooNarrow');
    expect(code({ ...salaryAsk, reveal: 'annualSalary' })).toBe('protectedRevealed');
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'gte', value: 5_100 }] })).toBe('protectedOffGrid');
    expect(code({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'between', value: 5_000, value2: 5_500 }] })).toBe('accepted');
  });

  it('describes the policy for the applicant, including what is not disclosed', () => {
    const d = describePolicy(buildPolicy(salaryAsk), 'ko');
    expect(d.conditions).toEqual(['직무 경력 36개월 이상', '직전 연봉 5000만원 이상', '직무 개발, 기획 중 하나']);
    expect(d.revealed).toBe('고용 형태');
    expect(d.notDisclosed).toEqual(['재직 상태', '직무', '직무 경력', '직전 연봉']);
  });

  it('rejects invalid policies', () => {
    expect(() => buildPolicy({ ...salaryAsk, conditions: [] })).toThrow(/at least one/);
    expect(() => buildPolicy({ ...salaryAsk, conditions: Array(MAX_CONDITIONS + 1).fill(salaryAsk.conditions[0]) })).toThrow(/At most/);
    expect(() => buildPolicy({ ...salaryAsk, conditions: [{ claim: 'jobCategory', op: 'gte', value: 'Design' }] })).toThrow(/not allowed/);
    expect(() => buildPolicy({ ...salaryAsk, conditions: [{ claim: 'annualSalary', op: 'between', value: 6_000, value2: 5_000 }] })).toThrow(/lower bound/);
    expect(() => buildPolicy({ ...salaryAsk, conditions: [{ claim: 'careerMonths', op: 'gte' }] })).toThrow(/value is required/);
    expect(() => buildPolicy({ ...salaryAsk, reveal: 'bonus' })).toThrow(/no claim bonus/);
  });
});

describe('만 나이 (youth work)', () => {
  it('turns "at least N on the reference date" into a latest birth date', () => {
    expect(latestBirthDateForAge('2026-09-30', 18)).toBe('2008-09-30');
    expect(latestBirthDateForAge('2027-02-28', 19)).toBe('2008-02-28');
    // 29 February does not exist in 2027: the latest qualifying date is 28 February.
    expect(latestBirthDateForAge('2028-02-29', 1)).toBe('2027-02-28');
  });

  it('matches the definition for every reference date in 2027 and 2028', () => {
    const ageOn = (birth: Date, ref: Date) => {
      let age = ref.getUTCFullYear() - birth.getUTCFullYear();
      const before = ref.getUTCMonth() < birth.getUTCMonth() || (ref.getUTCMonth() === birth.getUTCMonth() && ref.getUTCDate() < birth.getUTCDate());
      if (before) age--;
      return age;
    };
    let checked = 0;
    for (let t = Date.UTC(2027, 0, 1); t <= Date.UTC(2028, 11, 31); t += 86_400_000) {
      const ref = new Date(t);
      const iso = ref.toISOString().slice(0, 10);
      const latest = new Date(`${latestBirthDateForAge(iso, 18)}T00:00:00Z`);
      expect(ageOn(latest, ref)).toBeGreaterThanOrEqual(18);
      const dayAfter = new Date(latest.getTime() + 86_400_000);
      expect(ageOn(dayAfter, ref)).toBeLessThan(18);
      checked++;
    }
    expect(checked).toBe(731);
  });

  it('builds an age question the chain accepts (one-sided range on the protected birth date)', () => {
    const policy = buildPolicy({ schema: 'youth-work', conditions: [minimumAgeCondition('2026-09-30', 18), { claim: 'region', op: 'inSet', values: ['Seoul', 'Gyeonggi'] }], reveal: null });
    const youth = getSchema('youth-work');
    expect(pureCircuits.respectsSensitiveSlots(policy, schemaRule(youth))).toBe(true);
    expect(pureCircuits.policyHolds(encodeSubject(youth, youthSubject), policy)).toBe(true);
    expect(pureCircuits.policyHolds(encodeSubject(youth, { ...youthSubject, birthDate: '2008-10-01' }), policy)).toBe(false);
    expect(describePolicy(policy, 'ko').conditions[0]).toBe('생년월일 2008-09-30 이하');
  });
});

describe('subject binding', () => {
  it('normalizes names so spacing and latin case do not matter', () => {
    expect(normalizeName(' 김 민지 ')).toBe('김민지');
    expect(normalizeName('Kim Minji')).toBe(normalizeName('kimminji'));
  });

  it('gives issuer and verifier the same subject id from the same name and birth date', async () => {
    expect(await subjectIdFor('김민지', '1994-03-02')).toBe(await subjectIdFor('김 민지', '1994-03-02'));
    expect(await subjectIdFor('김민지', '1994-03-02')).not.toBe(await subjectIdFor('김민지', '1994-03-03'));
  });

  it('seals a subject so that only the nonce holder can reproduce the commitment', async () => {
    const seal = await sealSubject('김민지', '1994-03-02');
    const id = await subjectIdFor('김민지', '1994-03-02');
    expect(pureCircuits.subjectCommitment(id, seal.nonce)).toBe(seal.commitment);
    expect(pureCircuits.subjectCommitment(id, new Uint8Array(32))).not.toBe(seal.commitment);
  });
});

describe('issuance (AC-4: the issuer never handles the holder secret)', () => {
  const issuer = generateIssuerKeyPair();
  const holderSecret = createHolderSecret();
  const request = createIssuanceRequest('career', holderSecret);

  const issue = async () =>
    issueCredential(
      {
        schema: 'career',
        issuer: { id: 'issuer:acme-hr', name: 'ACME HR (demo)', epoch: 0 },
        issuedAt: '2026-09-01T00:00:00Z',
        expiresAt: '2027-09-01T00:00:00Z',
        credentialSubject: careerSubject,
        holderCommit: holderCommitFromRequest(request),
        subjectId: await subjectIdFor('김민지', '1994-03-02'),
      },
      issuer,
    );

  it('sends only a commitment in the issuance request', () => {
    expect(Object.keys(request).sort()).toEqual(['holderCommit', 'schema']);
    expect(JSON.stringify(request)).not.toContain(toHex(holderSecret));
    expect(holderCommitFromRequest(request)).toBe(holderCommitOf(holderSecret));
  });

  it('produces a document that verifies, binds the holder and contains no secret', async () => {
    const doc = await issue();
    expect(verifyCredentialDocument(doc, issuer.publicKey)).toBe(true);
    expect(verifyCredentialDocument(doc, generateIssuerKeyPair().publicKey)).toBe(false);
    expect(toContractCredential(doc).holderCommit).toBe(holderCommitOf(holderSecret));
    expect(JSON.stringify(doc)).not.toContain(toHex(holderSecret));
    expect(verifyCredentialDocument(JSON.parse(JSON.stringify(doc)), issuer.publicKey)).toBe(true);
  });

  it('breaks the signature when any claim, the epoch or the subject changes', async () => {
    const doc = await issue();
    expect(verifyCredentialDocument({ ...doc, credentialSubject: { ...doc.credentialSubject, annualSalary: 6_400 } }, issuer.publicKey)).toBe(false);
    expect(verifyCredentialDocument({ ...doc, issuer: { ...doc.issuer, epoch: 1 } }, issuer.publicKey)).toBe(false);
    expect(verifyCredentialDocument({ ...doc, binding: { ...doc.binding, subjectId: '0x01' } }, issuer.publicKey)).toBe(false);
  });
});

describe('receipt', () => {
  const policy = buildPolicy({ schema: 'career', conditions: [{ claim: 'employmentStatus', op: 'eq', value: 'Active' }], reveal: 'jobCategory' });
  const request = { policy, referenceTime: 1_790_000_000n, expiresAt: 1_790_086_400n, subjectCommit: { is_some: false, value: 0n } };
  const id = labelToBytes32('req');
  const p1 = labelToBytes32('pseudonym-1');

  it('reports open and expired requests and lists pseudonymous answers', () => {
    expect(buildReceipt(id, request, [], 1_790_000_100n, 'en').status).toBe('open');
    expect(buildReceipt(id, request, [], 1_790_086_400n, 'en').status).toBe('expired');
    const r = buildReceipt(id, request, [[p1, { revealed: { is_some: true, value: 2n } }]], 1_790_000_100n, 'ko');
    expect(r.sealed).toBe(false);
    expect(r.answers).toEqual([{ pseudonym: toHex(p1), revealed: { label: '직무', value: '디자인' } }]);
  });
});
