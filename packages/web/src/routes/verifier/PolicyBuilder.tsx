// Policy Builder (PRD §5): schema -> claim -> operator -> value, rendered from the schema JSON.
import {
  MAX_CONDITIONS,
  SCHEMAS,
  claimLabel,
  claimUnit,
  claimValueText,
  getClaim,
  getSchema,
  operatorLabel,
  operatorsForClaim,
  schemaTitle,
  type ClaimDefinition,
  type ConditionInput,
  type OperatorName,
  type PolicyInput,
} from '@stateproof/core';
import { ISSUERS, issuerName } from '../../app/env';
import { useI18n } from '../../app/i18n';
import { Field } from '../../components/Field';

interface PolicyBuilderProps {
  readonly value: PolicyInput;
  onChange(next: PolicyInput): void;
}

const defaultCondition = (claim: ClaimDefinition): ConditionInput => {
  const op = operatorsForClaim(claim)[0].name;
  return { claim: claim.key, op };
};

const enumCodes = (claim: ClaimDefinition): readonly string[] => {
  if (!claim.codes) throw new Error(`${claim.key} is not an enum claim`);
  return Object.keys(claim.codes);
};

interface ValueInputProps {
  readonly claim: ClaimDefinition;
  readonly value: string;
  onChange(v: string): void;
  readonly id?: string;
  readonly label?: string;
}

const ValueInput = ({ claim, value, onChange, id, label }: ValueInputProps) => {
  const { t, locale } = useI18n();
  if (claim.type === 'enum') {
    return (
      <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('policy.choose')}</option>
        {enumCodes(claim).map((k) => (
          <option key={k} value={k}>
            {claimValueText(claim, k, locale)}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      id={id}
      aria-label={label}
      type={claim.type === 'date' ? 'date' : 'number'}
      min={claim.type === 'integer' ? 0 : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

interface ConditionRowProps {
  readonly schemaId: string;
  readonly condition: ConditionInput;
  onChange(c: ConditionInput): void;
  onRemove(): void;
}

const ConditionRow = ({ schemaId, condition, onChange, onRemove }: ConditionRowProps) => {
  const { t, locale } = useI18n();
  const schema = getSchema(schemaId);
  const claim = getClaim(schema, condition.claim);
  const label = claimLabel(claim, locale);
  const unit = claimUnit(claim, locale);
  const valueLabel = unit === undefined ? t('policy.value') : t('policy.valueUnit', { unit });
  const selectedSet = new Set((condition.values ?? []).map(String));
  const toggle = (code: string, checked: boolean) => {
    const next = checked ? [...selectedSet, code] : [...selectedSet].filter((c) => c !== code);
    onChange({ ...condition, values: next });
  };
  return (
    <div className="policy-grid">
      <Field label={t('policy.claim')}>
        {(id) => (
          <select id={id} value={condition.claim} onChange={(e) => onChange(defaultCondition(getClaim(schema, e.target.value)))}>
            {schema.claims.map((c) => (
              <option key={c.key} value={c.key}>
                {claimLabel(c, locale)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label={t('policy.condition')}>
        {(id) => (
          <select id={id} value={condition.op} onChange={(e) => onChange({ claim: condition.claim, op: e.target.value as OperatorName })}>
            {operatorsForClaim(claim).map((o) => (
              <option key={o.name} value={o.name}>
                {operatorLabel(o, locale)}
              </option>
            ))}
          </select>
        )}
      </Field>
      {condition.op === 'inSet' ? (
        <fieldset className="field">
          <legend>{valueLabel}</legend>
          <div className="chips">
            {enumCodes(claim).map((k) => (
              <label key={k} className="chip">
                <input type="checkbox" checked={selectedSet.has(k)} onChange={(e) => toggle(k, e.target.checked)} />
                {claimValueText(claim, k, locale)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <Field label={valueLabel}>
          {(id) => (
            <div className="inline">
              <ValueInput claim={claim} id={id} value={String(condition.value ?? '')} onChange={(v) => onChange({ ...condition, value: v })} />
              {condition.op === 'between' && (
                <ValueInput
                  claim={claim}
                  label={t('policy.upperValue', { label })}
                  value={String(condition.value2 ?? '')}
                  onChange={(v) => onChange({ ...condition, value2: v })}
                />
              )}
            </div>
          )}
        </Field>
      )}
      <button type="button" className="btn quiet small" onClick={onRemove} aria-label={t('policy.removeAria', { label })}>
        {t('policy.remove')}
      </button>
    </div>
  );
};

export const PolicyBuilder = ({ value, onChange }: PolicyBuilderProps) => {
  const { t, locale } = useI18n();
  const schema = getSchema(value.schema);
  const issuers = ISSUERS.filter((i) => i.schemas.includes(schema.id));
  const setConditions = (conditions: readonly ConditionInput[]) => onChange({ ...value, conditions });
  const switchSchema = (schemaId: string) => {
    const next = getSchema(schemaId);
    const issuer = ISSUERS.find((i) => i.schemas.includes(next.id));
    if (!issuer) throw new Error(`No issuer in config/issuers.json issues ${next.id}`);
    onChange({ schema: next.id, issuerId: issuer.id, conditions: [defaultCondition(next.claims[0])], reveal: null });
  };
  return (
    <div className="stack">
      <div className="inline">
        <Field label={t('policy.credentialType')}>
          {(id) => (
            <select id={id} value={value.schema} onChange={(e) => switchSchema(e.target.value)}>
              {SCHEMAS.map((s) => (
                <option key={s.id} value={s.id}>
                  {schemaTitle(s, locale)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label={t('policy.trustedIssuer')}>
          {(id) => (
            <select id={id} value={value.issuerId} onChange={(e) => onChange({ ...value, issuerId: e.target.value })}>
              {issuers.map((i) => (
                <option key={i.id} value={i.id}>
                  {issuerName(i, locale)}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div>
        {value.conditions.map((c, i) => (
          <ConditionRow
            key={`${i}-${c.claim}`}
            schemaId={schema.id}
            condition={c}
            onChange={(next) => setConditions(value.conditions.map((old, j) => (j === i ? next : old)))}
            onRemove={() => setConditions(value.conditions.filter((_, j) => j !== i))}
          />
        ))}
      </div>

      <div className="inline">
        <button
          type="button"
          className="btn quiet"
          disabled={value.conditions.length >= MAX_CONDITIONS}
          onClick={() => setConditions([...value.conditions, defaultCondition(schema.claims[0])])}
        >
          {t('policy.add')}
        </button>
        <span className="muted small">{t('policy.andNote', { max: MAX_CONDITIONS })}</span>
      </div>

      <Field label={t('policy.reveal')}>
        {(id) => (
          <select id={id} value={value.reveal ?? ''} onChange={(e) => onChange({ ...value, reveal: e.target.value === '' ? null : e.target.value })}>
            <option value="">{t('policy.revealNone')}</option>
            {schema.claims.map((c) => (
              <option key={c.key} value={c.key}>
                {claimLabel(c, locale)}
              </option>
            ))}
          </select>
        )}
      </Field>
    </div>
  );
};
