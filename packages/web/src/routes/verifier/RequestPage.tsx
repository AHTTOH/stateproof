// Public request / receipt page (PRD §17). Reads only the ledger; no wallet needed.
import { Link, useParams } from 'react-router-dom';
import type { RequestStatus } from '@stateproof/core';
import { issuerInfo } from '../../app/env';
import { useAsync } from '../../app/useAsync';
import { Boundary } from '../../components/Boundary';
import { PageError } from '../../components/PageError';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest } from '../../state/ledger';
import { holderLink } from './VerifierPage';

const LEDE: Record<RequestStatus, string> = {
  verified:
    'A holder proved every condition below with a credential from the trusted issuer. The proof was checked by the Midnight network before this result was written.',
  pending: 'Waiting for the holder. The result appears here once their proof is accepted on chain.',
  expired: 'This request expired before a valid proof arrived.',
};

const HEADINGS: Record<RequestStatus, { readonly learn: string; readonly sealed: string }> = {
  verified: { learn: 'Proven to the verifier', sealed: 'Never disclosed' },
  pending: { learn: 'The verifier will learn', sealed: 'They will NOT receive' },
  expired: { learn: 'This request asked for', sealed: 'It never asked for' },
};

// Dates follow the page language (index.html lang), not the OS locale, so the UI reads in one language.
const TIME_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'long' };

const Time = ({ value }: { readonly value: Date }) => (
  <time dateTime={value.toISOString()} title={value.toISOString()}>
    {value.toLocaleString(document.documentElement.lang, TIME_FORMAT)}
  </time>
);

export const RequestPage = () => {
  const { requestId = '' } = useParams();
  const view = useAsync(() => fetchRequest(requestId), [requestId]);

  if (view.loading) return <p className="muted" role="status">Reading the Midnight ledger…</p>;
  if (view.error || !view.data) {
    return <PageError title="This receipt could not be opened" message={view.error ?? 'The ledger returned no data for this request'} />;
  }
  const { receipt } = view.data;
  const issuerName = issuerInfo(receipt.policy.issuerId).name;

  return (
    <>
      <h1 className="page-title">
        Verification receipt <StatusBadge status={receipt.status} />
      </h1>
      <p className="lede">{LEDE[receipt.status]}</p>
      <Boundary
        description={receipt.policy}
        issuerName={issuerName}
        learnHeading={HEADINGS[receipt.status].learn}
        sealedHeading={HEADINGS[receipt.status].sealed}
        revealedValue={receipt.revealed?.value ?? null}
      />
      <ul className="rows">
        <li>
          <span>{receipt.policy.revealed ?? 'Revealed value'}</span>
          {receipt.revealed ? (
            <strong>{receipt.revealed.value}</strong>
          ) : (
            <span className="muted">
              {receipt.policy.revealed === null ? 'None requested' : receipt.status === 'pending' ? 'Shown after a valid proof' : 'Not revealed'}
            </span>
          )}
        </li>
        <li>
          <span>Issuer</span>
          <span>{issuerName}</span>
        </li>
        <li>
          <span>Credential checked as of</span>
          <Time value={receipt.referenceTime} />
        </li>
        <li>
          <span>Request expires</span>
          <Time value={receipt.expiresAt} />
        </li>
        <li>
          <span>Request id</span>
          <span className="hash">{receipt.requestId}</span>
        </li>
      </ul>
      {receipt.status === 'pending' && (
        <p className="small">
          Holder link: <a className="hash" href={holderLink(receipt.requestId)}>{holderLink(receipt.requestId)}</a>
        </p>
      )}
      <p className="small">
        <Link to="/verifier">Back to verifier</Link>
      </p>
    </>
  );
};
