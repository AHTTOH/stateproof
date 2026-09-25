import { Op } from '@stateproof/contract';
import type { ClaimType } from '../schemas/index.js';

export type OperatorName = 'gte' | 'lte' | 'eq' | 'neq' | 'between' | 'inSet';

export interface OperatorDefinition {
  readonly name: OperatorName;
  readonly op: Op;
  readonly label: string;
  readonly symbol: string;
  readonly claimTypes: readonly ClaimType[];
  readonly arity: 'one' | 'two' | 'set';
}

export const OPERATORS: readonly OperatorDefinition[] = [
  { name: 'gte', op: Op.gte, label: 'at least', symbol: '>=', claimTypes: ['integer', 'date'], arity: 'one' },
  { name: 'lte', op: Op.lte, label: 'at most', symbol: '<=', claimTypes: ['integer', 'date'], arity: 'one' },
  { name: 'eq', op: Op.eq, label: 'is', symbol: '=', claimTypes: ['enum', 'integer', 'date'], arity: 'one' },
  { name: 'neq', op: Op.neq, label: 'is not', symbol: '!=', claimTypes: ['enum', 'integer', 'date'], arity: 'one' },
  { name: 'between', op: Op.between, label: 'between', symbol: 'between', claimTypes: ['integer', 'date'], arity: 'two' },
  { name: 'inSet', op: Op.inSet, label: 'is one of', symbol: 'in', claimTypes: ['enum'], arity: 'set' },
];

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

export const operatorsForClaimType = (type: ClaimType): readonly OperatorDefinition[] =>
  OPERATORS.filter((o) => o.claimTypes.includes(type));
