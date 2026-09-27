// /demo: opens the first reviewer request that is still pending. Demo requests are single use
// (anyone can answer them), so the entry point checks the ledger instead of trusting a fixed link.
import { Link, Navigate } from 'react-router-dom';
import { NETWORK, demoRequestsFor } from '../../app/env';
import { useAsync } from '../../app/useAsync';
import { PageError } from '../../components/PageError';
import { firstPendingRequest } from '../../state/ledger';

export const DemoPage = () => {
  const demo = demoRequestsFor();
  const pick = useAsync(() => (demo === null ? Promise.resolve(null) : firstPendingRequest(demo.pending.map((r) => r.requestId))), [demo]);

  if (demo === null) return <p className="notice">No demo requests are configured for {NETWORK}.</p>;
  if (pick.loading) return <p className="muted" role="status">Finding an open demo request on the Midnight ledger…</p>;
  if (pick.error) return <PageError title="The demo request list could not be checked" message={pick.error} />;
  if (pick.data) return <Navigate replace to={`/holder/verify/${pick.data}`} />;
  return (
    <>
      <h1 className="page-title">All demo requests have been answered</h1>
      <p className="lede">
        Each demo request accepts one proof, and every one listed for {NETWORK} already has a result. The receipts below
        show what was proven.
      </p>
      <ul className="rows">
        {[...demo.pending, ...demo.verified].map((r) => (
          <li key={r.requestId}>
            <Link to={`/request/${r.requestId}`}>{r.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
