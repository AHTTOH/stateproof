// Public request / receipt page (PRD §17). Reads only the ledger; no wallet needed.
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { RequestStatus } from '@stateproof/core';
import { bytes32ToLabel } from '@stateproof/core';
import { issuerInfo, issuerName } from '../../app/env';
import { useI18n } from '../../app/i18n';
import type { MessageKey } from '../../app/messages';
import { useAsync } from '../../app/useAsync';
import { PageError } from '../../components/PageError';
import { SealTable } from '../../components/SealTable';
import { buildSealRows } from '../../components/sealRows';
import { STATUS_LABEL } from '../../components/StatusBadge';
import { fetchRequest, receiptOf } from '../../state/ledger';
import { holderLink } from './VerifierPage';
import sealMedal from '../../assets/seal-medal.webp';

const LEDE: Readonly<Record<RequestStatus, MessageKey>> = {
  verified: 'receipt.lede.verified',
  pending: 'receipt.lede.pending',
  expired: 'receipt.lede.expired',
};

const HEADING: Readonly<Record<RequestStatus, MessageKey>> = {
  verified: 'boundary.verified.learn',
  pending: 'boundary.holder.learn',
  expired: 'boundary.expired.learn',
};

const NO_FAILURES: ReadonlySet<string> = new Set();

// Dates follow the page language (index.html lang), not the OS locale, so the UI reads in one language.
const TIME_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'long' };

const Time = ({ value }: { readonly value: Date }) => (
  <time dateTime={value.toISOString()} title={value.toISOString()}>
    {value.toLocaleString(document.documentElement.lang, TIME_FORMAT)}
  </time>
);

export const RequestPage = () => {
  const { requestId = '' } = useParams();
  const { t, locale } = useI18n();
  const view = useAsync(() => fetchRequest(requestId), [requestId]);
  const receipt = useMemo(() => (view.data ? receiptOf(view.data, locale) : null), [view.data, locale]);
  const rows = useMemo(
    () =>
      view.data && receipt
        ? buildSealRows({ policy: view.data.request.policy, locale, subject: null, failing: NO_FAILURES, revealedValue: receipt.revealed ? receipt.revealed.value : null })
        : [],
    [view.data, receipt, locale],
  );

  if (view.loading) return <p className="muted" role="status">{t('receipt.loading')}</p>;
  if (view.error || !view.data || !receipt) return <PageError title={t('receipt.error')} message={view.error ?? t('common.noLedgerData')} />;
  const issuer = issuerName(issuerInfo(bytes32ToLabel(view.data.request.policy.issuerId)), locale);

  return (
    <>
      <section className={`status-band ${receipt.status}`}>
        <div>
          <span className="kicker">{t('receipt.title')}</span>
          <h1>{t(STATUS_LABEL[receipt.status])}</h1>
          <p>{t(LEDE[receipt.status])}</p>
          {receipt.revealed && (
            <p className="status-band-reveal">
              <span>{receipt.revealed.label}</span> {receipt.revealed.value}
            </p>
          )}
        </div>
        {receipt.status === 'verified' && <img className="status-band-art" src={sealMedal} alt="" width={1024} height={1024} />}
      </section>
      <SealTable rows={rows} issuerName={issuer} holderHeading={null} verifierHeading={t(HEADING[receipt.status])} />
      <p className="seal-note">{t('boundary.publicNote')}</p>
      <ul className="rows">
        <li>
          <span>{receipt.policy.revealed === null ? t('receipt.revealedValue') : receipt.policy.revealed}</span>
          {receipt.revealed ? (
            <strong>{receipt.revealed.value}</strong>
          ) : (
            <span className="muted">
              {receipt.policy.revealed === null ? t('receipt.noneRequested') : receipt.status === 'pending' ? t('receipt.shownAfter') : t('receipt.notRevealed')}
            </span>
          )}
        </li>
        <li>
          <span>{t('receipt.issuer')}</span>
          <span>{issuer}</span>
        </li>
        <li>
          <span>{t('receipt.checkedAsOf')}</span>
          <Time value={receipt.referenceTime} />
        </li>
        <li>
          <span>{t('receipt.expires')}</span>
          <Time value={receipt.expiresAt} />
        </li>
        <li>
          <span>{t('receipt.requestId')}</span>
          <span className="hash">{receipt.requestId}</span>
        </li>
      </ul>
      {receipt.status === 'pending' && (
        <p className="small">
          {t('receipt.holderLink')}: <a className="hash" href={holderLink(receipt.requestId)}>{holderLink(receipt.requestId)}</a>
        </p>
      )}
      <p className="small">
        <Link to="/verifier">{t('receipt.back')}</Link>
      </p>
    </>
  );
};
