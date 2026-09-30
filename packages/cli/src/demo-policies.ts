// JobProof demo postings. Built with the core policy builder, so the TS side refuses exactly
// what createRequest would refuse. The over-asking policies at the end are assembled by hand on
// purpose: they are what a dishonest verifier would send, bypassing the builder, to show that
// the circuit itself refuses them.
import { Op, type Policy } from '@stateproof/contract';
import { SECONDS_PER_DAY, buildPolicy, getClaim, getSchema, latestBirthDateForAge, minimumAgeCondition, type PolicyInput } from '@stateproof/core';

// 경력직: 재직 중, 개발 직무, 개발 경력 36개월 이상, 직전 연봉 5,000만원 이상. Nothing revealed.
export const CAREER_OPEN: PolicyInput = {
  schema: 'career',
  conditions: [
    { claim: 'employmentStatus', op: 'eq', value: 'Active' },
    { claim: 'jobCategory', op: 'eq', value: 'Engineering' },
    { claim: 'careerMonths', op: 'gte', value: 36 },
    { claim: 'annualSalary', op: 'gte', value: 5_000 },
  ],
  reveal: null,
};

export const CAREER_SALARY_THRESHOLD = 5_000n;

const addDays = (isoDate: string, days: number): string =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * SECONDS_PER_DAY * 1000).toISOString().slice(0, 10);

// 알바 청년: 만 19~24세, 서울 또는 경기 거주, 알바 경력 6개월 이상. Nothing revealed.
// Age is a birth-date range: born after the latest date for age 25 and on or before the latest date for age 19.
export const youthWorkPolicyInput = (referenceDate: string): PolicyInput => ({
  schema: 'youth-work',
  conditions: [
    {
      claim: 'birthDate',
      op: 'between',
      value: addDays(latestBirthDateForAge(referenceDate, 25), 1),
      value2: minimumAgeCondition(referenceDate, 19).value,
    },
    { claim: 'region', op: 'inSet', values: ['Seoul', 'Gyeonggi'] },
    { claim: 'partTimeMonths', op: 'gte', value: 6 },
  ],
  reveal: null,
});

export const isoDateOf = (seconds: bigint): string => new Date(Number(seconds) * 1000).toISOString().slice(0, 10);

export const careerOpenPolicy = (): Policy => buildPolicy(CAREER_OPEN);
export const youthWorkPolicy = (referenceSeconds: bigint): Policy => buildPolicy(youthWorkPolicyInput(isoDateOf(referenceSeconds)));

const salarySlot = (): bigint => BigInt(getClaim(getSchema('career'), 'annualSalary').slot);

// Over-asking verifier #1: "tell me if the salary is exactly 5,210만원".
export const exactSalaryPolicy = (): Policy => {
  const base = careerOpenPolicy();
  const conditions = [...base.conditions];
  conditions[3] = { ...conditions[3], claimIndex: salarySlot(), op: Op.eq, value: 5_210n, value2: 0n };
  return { ...base, conditions };
};

// Over-asking verifier #2: a salary band narrower than the schema's minimum width (500만원).
export const narrowSalaryBandPolicy = (): Policy => {
  const base = careerOpenPolicy();
  const conditions = [...base.conditions];
  conditions[3] = { ...conditions[3], claimIndex: salarySlot(), op: Op.between, value: 5_000n, value2: 5_100n };
  return { ...base, conditions };
};

// Repeated-query attacker: "salary >= 5,000" was asked already; now ask ">= 5,100" to learn
// whether the value lies in [5,000, 5,100). The bound is off the 500만원 grid.
export const offGridSalaryPolicy = (): Policy => {
  const base = careerOpenPolicy();
  const conditions = [...base.conditions];
  conditions[3] = { ...conditions[3], claimIndex: salarySlot(), op: Op.gte, value: 5_100n, value2: 0n };
  return { ...base, conditions };
};
