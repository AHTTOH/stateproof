import { Op } from '@stateproof/contract';
import type { Locale, TranslatedLocale } from '../locale.js';
import type { ClaimDefinition, ClaimType } from '../schemas/index.js';

export type OperatorName = 'gte' | 'lte' | 'eq' | 'neq' | 'between' | 'inSet';

export interface OperatorDefinition {
  readonly name: OperatorName;
  readonly op: Op;
  readonly label: string;
  readonly symbol: string;
  readonly claimTypes: readonly ClaimType[];
  readonly arity: 'one' | 'two' | 'set';
  readonly i18n: Readonly<Record<TranslatedLocale, { readonly label: string }>>;
}

export const OPERATORS: readonly OperatorDefinition[] = [
  { name: 'gte', op: Op.gte, label: 'at least', symbol: '>=', claimTypes: ['integer', 'date'], arity: 'one', i18n: { ko: { label: '이상' } } },
  { name: 'lte', op: Op.lte, label: 'at most', symbol: '<=', claimTypes: ['integer', 'date'], arity: 'one', i18n: { ko: { label: '이하' } } },
  { name: 'eq', op: Op.eq, label: 'is', symbol: '=', claimTypes: ['enum', 'integer', 'date'], arity: 'one', i18n: { ko: { label: '같음' } } },
  { name: 'neq', op: Op.neq, label: 'is not', symbol: '!=', claimTypes: ['enum', 'integer', 'date'], arity: 'one', i18n: { ko: { label: '제외' } } },
  { name: 'between', op: Op.between, label: 'between', symbol: 'between', claimTypes: ['integer', 'date'], arity: 'two', i18n: { ko: { label: '범위' } } },
  { name: 'inSet', op: Op.inSet, label: 'is one of', symbol: 'in', claimTypes: ['enum'], arity: 'set', i18n: { ko: { label: '다음 중 하나' } } },
];

export const operatorLabel = (def: OperatorDefinition, locale: Locale): string => (locale === 'en' ? def.label : def.i18n[locale].label);

export const operatorByName = (name: OperatorName): OperatorDefinition => {
  const def = OPERATORS.find((o) => o.name === name);
  if (!def) throw new Error(`Unknown operator ${name}`);
  return def;
};

export const operatorByOp = (op: Op): OperatorDefinition => {
  const def = OPERATORS.find((o) => o.op === op);
  if (!def) throw new Error(`Operator code ${op} has no definition`);
  return def;
};

// In the order the schema lists them; the first one is the default in the policy builder.
export const operatorsForClaim = (claim: ClaimDefinition): readonly OperatorDefinition[] => claim.operators.map(operatorByName);
