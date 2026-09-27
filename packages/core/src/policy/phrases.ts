// One condition as a sentence fragment in each display language.
import type { Locale } from '../locale.js';
import type { OperatorName } from './operators.js';

export interface ConditionParts {
  readonly op: OperatorName;
  readonly label: string;
  // Display values with their unit already attached, in condition order (set members deduplicated).
  readonly values: readonly string[];
}

const english = ({ op, label, values }: ConditionParts): string => {
  switch (op) {
    case 'gte':
      return `${label} at least ${values[0]}`;
    case 'lte':
      return `${label} at most ${values[0]}`;
    case 'eq':
      return `${label} is ${values[0]}`;
    case 'neq':
      return `${label} is not ${values[0]}`;
    case 'between':
      return `${label} between ${values[0]} and ${values[1]}`;
    case 'inSet':
      return `${label} is one of ${values.join(', ')}`;
  }
};

// Korean avoids particles that depend on the final consonant by using label-first forms.
const korean = ({ op, label, values }: ConditionParts): string => {
  switch (op) {
    case 'gte':
      return `${label} ${values[0]} 이상`;
    case 'lte':
      return `${label} ${values[0]} 이하`;
    case 'eq':
      return `${label} ${values[0]}`;
    case 'neq':
      return `${label} ${values[0]} 제외`;
    case 'between':
      return `${label} ${values[0]}부터 ${values[1]}까지`;
    case 'inSet':
      return `${label} ${values.join(', ')} 중 하나`;
  }
};

const PHRASES: Readonly<Record<Locale, (parts: ConditionParts) => string>> = { en: english, ko: korean };

export const formatCondition = (parts: ConditionParts, locale: Locale): string => PHRASES[locale](parts);

// English puts a space before the unit ("12 months"); Korean attaches it ("12개월").
export const withUnit = (value: string, unit: string | undefined, locale: Locale): string => {
  if (unit === undefined) return value;
  return locale === 'en' ? `${value} ${unit}` : `${value}${unit}`;
};

// The same condition without the claim label, for tables that already show the label in its own column.
const englishShort = ({ op, values }: ConditionParts): string => {
  switch (op) {
    case 'gte':
      return `at least ${values[0]}`;
    case 'lte':
      return `at most ${values[0]}`;
    case 'eq':
      return values[0];
    case 'neq':
      return `not ${values[0]}`;
    case 'between':
      return `${values[0]} to ${values[1]}`;
    case 'inSet':
      return `one of ${values.join(', ')}`;
  }
};

const koreanShort = ({ op, values }: ConditionParts): string => {
  switch (op) {
    case 'gte':
      return `${values[0]} 이상`;
    case 'lte':
      return `${values[0]} 이하`;
    case 'eq':
      return values[0];
    case 'neq':
      return `${values[0]} 제외`;
    case 'between':
      return `${values[0]}부터 ${values[1]}까지`;
    case 'inSet':
      return `${values.join(', ')} 중 하나`;
  }
};

const SHORT_PHRASES: Readonly<Record<Locale, (parts: ConditionParts) => string>> = { en: englishShort, ko: koreanShort };

export const formatConditionValue = (parts: ConditionParts, locale: Locale): string => SHORT_PHRASES[locale](parts);
