// Policy Builder (PRD §5): schema -> claim -> operator -> value, rendered from the schema JSON.
import {
  MAX_CONDITIONS,
  SCHEMAS,
  getClaim,
  getSchema,
  operatorsForClaimType,
  type ClaimDefinition,
  type ConditionInput,
  type OperatorName,
  type PolicyInput,
} from '@stateproof/core';
import { ISSUERS } from '../../app/env';

interface PolicyBuilderProps {
  readonly value: PolicyInput;
  onChange(next: PolicyInput): void;
}

const defaultCondition = (claim: ClaimDefinition): ConditionInput => {
  const op = operatorsForClaimType(claim.type)[0].name;
  return { claim: claim.key, op };
};

const ValueInput = ({ claim, value, onChange, label }: { claim: ClaimDefinition; value: string; onChange(v: string): void; label: string }) => {
  if (claim.type === 'enum') {
    return (
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose…</option>
        {Object.keys(claim.codes ?? {}).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      aria-label={label}
      type={claim.type === 'date' ? 'date' : 'number'}
      min={claim.type === 'integer' ? 0 : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const ConditionRow = ({ schemaId, condition, onChange, onRemove }: { schemaId: string; condition: ConditionInput; onChange(c: ConditionInput): void; onRemove(): void }) => {
  const schema = getSchema(schemaId);
  const claim = getClaim(schema, condition.claim);
  const ops = operatorsForClaimType(claim.type);
  const selectedSet = new Set((condition.values ?? []).map(String));
  return (
    <div className="policy-grid">
      <div className="field">
        <label>Claim</label>
        <select value={condition.claim} onChange={(e) => onChange(defaultCondition(getClaim(schema, e.target.value)))}>
          {schema.claims.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Condition</label>
        <select value={condition.op} onChange={(e) => onChange({ claim: condition.claim, op: e.target.value as OperatorName })}>
          {ops.map((o) => (
            <option key={o.name} value={o.name}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Value{claim.unit ? ` (${claim.unit})` : ''}</label>
        {condition.op === 'inSet' ? (
          <div className="chips">
            {Object.keys(claim.codes ?? {}).map((k) => (
              <label key={k} className="chip">
                <input
                  type="checkbox"
                  checked={selectedSet.has(k)}
                  onChange={(e) => {
                    const next = new Set(selectedSet);
                    if (e.target.checked) next.add(k);
                    else next.delete(k);
                    onChange({ ...condition, values: [...next] });
                  }}
                />
                {k}
              </label>
            ))}
          </div>
        ) : (
          <div className="inline">
            <ValueInput claim={claim} label="value" value={String(condition.value ?? '')} onChange={(v) => onChange({ ...condition, value: v })} />
            {condition.op === 'between' && (
              <ValueInput claim={claim} label="upper value" value={String(condition.value2 ?? '')} onChange={(v) => onChange({ ...condition, value2: v })} />
            )}
          </div>
        )}
      </div>
      <button type="button" className="btn quiet" onClick={onRemove} aria-label={`Remove condition on ${claim.label}`}>
        Remove
      </button>
    </div>
  );
};

export const PolicyBuilder = ({ value, onChange }: PolicyBuilderProps) => {
  const schema = getSchema(value.schema);
  const issuers = ISSUERS.filter((i) => i.schemas.includes(schema.id));
  const setConditions = (conditions: readonly ConditionInput[]) => onChange({ ...value, conditions });
  return (
    <div className="stack">
      <div className="inline">
        <div className="field">
          <label>Credential type</label>
          <select
            value={value.schema}
            onChange={(e) => {
              const next = getSchema(e.target.value);
              const issuer = ISSUERS.find((i) => i.schemas.includes(next.id));
              if (!issuer) throw new Error(`No issuer in config/issuers.json issues ${next.id}`);
              onChange({ schema: next.id, issuerId: issuer.id, conditions: [defaultCondition(next.claims[0])], reveal: null });
            }}
          >
            {SCHEMAS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Trusted issuer</label>
          <select value={value.issuerId} onChange={(e) => onChange({ ...value, issuerId: e.target.value })}>
            {issuers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
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
          Add condition
        </button>
        <span className="muted small">
          All conditions must hold (AND). Up to {MAX_CONDITIONS}.
        </span>
      </div>

      <div className="field">
        <label>Also reveal one value (optional)</label>
        <select value={value.reveal ?? ''} onChange={(e) => onChange({ ...value, reveal: e.target.value === '' ? null : e.target.value })}>
          <option value="">Reveal nothing</option>
          {schema.claims.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
