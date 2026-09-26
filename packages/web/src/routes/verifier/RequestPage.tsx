// Public request / receipt page (PRD §17). Reads only the ledger; no wallet needed.
import { Link, useParams } from 'react-router-dom';
import { issuerInfo } from '../../app/env';
import { useAsync } from '../../app/useAsync';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest } from '../../state/ledger';
import { holderLink } from './VerifierPage';

export const RequestPage = () => {
  const { requestId = '' } = useParams();
  const view = useAsync(() => fetchRequest(requestId), [requestId]);

  if (view.loading) return <p className="muted">Reading the ledger…</p>;
  if (view.error || !view.data) return <p className="notice error" role="alert">{view.error}</p>;
  const { receipt } = view.data;

  return (
    <>
      <h1 className="page-title">
        Verification receipt <StatusBadge status={receipt.status} />
      </h1>
      <p className="lede">
        {receipt.status === 'verified'
          ? 'A holder proved every condition below with a credential from the trusted issuer. The proof was checked by the Midnight network before this result was written.'
          : receipt.status === 'pending'
            ? 'Waiting for the holder. The result appears here once their proof is accepted on chain.'
            : 'This request expired before a valid proof arrived.'}
      </p>
      <ul className="rows">
        {receipt.policy.conditions.map((c) => (
          <li key={c}>
            <span>{c}</span>
            <span className={`status ${receipt.status === 'verified' ? 'verified' : 'pending'}`}>
              {receipt.status === 'verified' ? 'Proven' : 'Not yet'}
            </span>
          </li>
        ))}
        <li>
          <span>Issuer</span>
          <span>{issuerInfo(receipt.policy.issuerId).name}</span>
        </li>
        <li>
          <span>{receipt.revealed ? receipt.revealed.label : 'Revealed values'}</span>
          <span>{receipt.revealed ? receipt.revealed.value : 'None'}</span>
        </li>
        <li>
          <span>Exact values not disclosed</span>
          <span className="muted">{receipt.policy.notDisclosed.filter((l) => l !== receipt.revealed?.label).join(', ')}</span>
        </li>
        <li>
          <span>Reference time</span>
          <span>{receipt.referenceTime.toISOString()}</span>
        </li>
        <li>
          <span>Request expires</span>
          <span>{receipt.expiresAt.toISOString()}</span>
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
