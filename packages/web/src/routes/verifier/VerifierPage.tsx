// Verifier composes a policy, previews the seal line from its side, and publishes the request.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRequest, type Policy } from '@stateproof/contract';
import {
  PolicyInputError,
  buildPolicy,
  claimLabel,
  describePolicy,
  getClaim,
  getSchema,
  randomBytes32,
  toHex,
  type Locale,
  type PolicyInput,
} from '@stateproof/core';
import { contractAddress, explorerTxUrl, issuerInfo, issuerName, NETWORK } from '../../app/env';
import { useI18n } from '../../app/i18n';
import type { MessageKey } from '../../app/messages';
import { useLace } from '../../app/LaceContext';
import { errorMessage, useAsync } from '../../app/useAsync';
import { ErrorNotice } from '../../components/ErrorNotice';
import { Field } from '../../components/Field';
import { SealTable } from '../../components/SealTable';
import { buildSealRows } from '../../components/sealRows';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest, receiptOf } from '../../state/ledger';
import { loadRequests, rememberRequest, type StoredRequest } from '../../state/verifierRequests';
import { PolicyBuilder } from './PolicyBuilder';

const TTL_OPTIONS: readonly { readonly label: MessageKey; readonly seconds: number }[] = [
  { label: 'verifier.ttl.hour', seconds: 3_600 },
  { label: 'verifier.ttl.day', seconds: 86_400 },
  { label: 'verifier.ttl.week', seconds: 604_800 },
];

const STARTER_POLICY: PolicyInput = {
  schema: 'employment',
  issuerId: 'issuer:acme-hr',
  conditions: [
    { claim: 'employmentStatus', op: 'eq', value: 'Active' },
    { claim: 'employmentMonths', op: 'gte', value: 12 },
  ],
  reveal: null,
};

const NO_FAILURES: ReadonlySet<string> = new Set();

export const holderLink = (requestId: string): string => new URL(`/holder/verify/${requestId}`, window.location.origin).toString();

const RequestRow = ({ stored }: { readonly stored: StoredRequest }) => {
  const { t, locale } = useI18n();
  const view = useAsync(() => fetchRequest(stored.requestId), [stored.requestId]);
  return (
    <li>
      <div>
        <div className="row-title">
          <Link to={`/request/${stored.requestId}`}>{stored.label}</Link>
        </div>
        <div className="hash muted">{stored.requestId}</div>
        {view.error && <ErrorNotice message={view.error} />}
      </div>
      {view.data ? <StatusBadge status={receiptOf(view.data, locale).status} /> : view.loading && <span className="muted small">{t('verifier.readingLedger')}</span>}
    </li>
  );
};

// An empty value while composing is a hint, not an error.
type Preview = { readonly policy: Policy; readonly error: null; readonly hint: null } | { readonly policy: null; readonly error: string | null; readonly hint: string | null };

const composePreview = (input: PolicyInput, locale: Locale, t: (key: MessageKey, vars?: Record<string, string | number>) => string): Preview => {
  try {
    return { policy: buildPolicy(input), error: null, hint: null };
  } catch (e) {
    if (!(e instanceof PolicyInputError)) return { policy: null, error: errorMessage(e), hint: null };
    const vars = {
      ...(e.claimKey === null ? {} : { claim: claimLabel(getClaim(getSchema(input.schema), e.claimKey), locale) }),
      ...(e.limit === null ? {} : { max: e.limit }),
    };
    const text = t(`policy.error.${e.code}` as MessageKey, vars);
    return e.code === 'valueRequired' || e.code === 'setEmpty' ? { policy: null, error: null, hint: text } : { policy: null, error: text, hint: null };
  }
};

export const VerifierPage = () => {
  const { t, locale } = useI18n();
  const lace = useLace();
  const [policyInput, setPolicyInput] = useState<PolicyInput>(STARTER_POLICY);
  const [ttl, setTtl] = useState<number>(TTL_OPTIONS[1].seconds);
  const [requests, setRequests] = useState(loadRequests());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<StoredRequest | null>(null);

  const preview = useMemo(() => composePreview(policyInput, locale, t), [policyInput, locale, t]);
  const rows = useMemo(
    () => (preview.policy ? buildSealRows({ policy: preview.policy, locale, subject: null, failing: NO_FAILURES, revealedValue: null }) : []),
    [preview.policy, locale],
  );

  const create = async () => {
    if (!preview.policy || busy) return;
    setBusy(true);
    setError(null);
    try {
      const session = await lace.connect();
      const requestId = randomBytes32();
      const now = BigInt(Math.floor(Date.now() / 1000));
      const receipt = await createRequest(session.contract, requestId, preview.policy, now, now + BigInt(ttl));
      const stored: StoredRequest = {
        requestId: toHex(requestId),
        label: describePolicy(preview.policy, locale).conditions.join(', '),
        createdAt: new Date().toISOString(),
        txHash: receipt.txHash,
      };
      setRequests(rememberRequest(stored));
      setCreated(stored);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (contractAddress() === null) return <p className="notice error">{t('verifier.notDeployed', { network: NETWORK })}</p>;

  return (
    <>
      <h1 className="page-title">{t('verifier.title')}</h1>
      <p className="lede">{t('verifier.lede')}</p>

      <PolicyBuilder value={policyInput} onChange={setPolicyInput} />

      {preview.error !== null && <p className="notice error">{preview.error}</p>}
      {preview.hint !== null && <p className="muted">{preview.hint}</p>}
      {preview.policy && (
        <SealTable rows={rows} issuerName={issuerName(issuerInfo(policyInput.issuerId), locale)} holderHeading={null} verifierHeading={t('boundary.verifier.learn')} />
      )}

      <div className="actions">
        <Field label={t('verifier.ttl')}>
          {(id) => (
            <select id={id} value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
              {TTL_OPTIONS.map((o) => (
                <option key={o.seconds} value={o.seconds}>
                  {t(o.label)}
                </option>
              ))}
            </select>
          )}
        </Field>
        <button type="button" className="btn primary" disabled={!preview.policy} aria-disabled={busy} onClick={create}>
          {busy ? t('verifier.creating') : t('verifier.create')}
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      {created && (
        <div className="notice ok" role="status">
          {t('verifier.created')} <a href={explorerTxUrl(created.txHash)}>{t('common.transaction')}</a>
          <div className="hash" style={{ marginTop: 'var(--s-2)' }}>
            <a href={holderLink(created.requestId)}>{holderLink(created.requestId)}</a>
          </div>
        </div>
      )}

      <h2 className="section-title">{t('verifier.yours')}</h2>
      {requests.length === 0 ? (
        <p className="muted">
          {t('verifier.empty')} <Link to="/">{t('verifier.emptyDemo')}</Link>
        </p>
      ) : (
        <ul className="rows">
          {requests.map((r) => (
            <RequestRow key={r.requestId} stored={r} />
          ))}
        </ul>
      )}
    </>
  );
};
