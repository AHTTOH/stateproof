// /demo: opens the first reviewer request that is still pending. Demo requests are single use
// (anyone can answer them), so the entry point checks the ledger instead of trusting a fixed link.
import { Link, Navigate } from 'react-router-dom';
import { NETWORK, demoRequestsFor } from '../../app/env';
import { useI18n } from '../../app/i18n';
import { useAsync } from '../../app/useAsync';
import { PageError } from '../../components/PageError';
import { firstPendingRequest } from '../../state/ledger';

export const DemoPage = () => {
  const { t, locale } = useI18n();
  const demo = demoRequestsFor();
  const pick = useAsync(() => (demo === null ? Promise.resolve(null) : firstPendingRequest(demo.pending.map((r) => r.requestId))), [demo]);

  if (demo === null) return <p className="notice">{t('home.noDemo', { network: NETWORK })}</p>;
  if (pick.loading) return <p className="muted" role="status">{t('demo.finding')}</p>;
  if (pick.error) return <PageError title={t('demo.error')} message={pick.error} />;
  if (pick.data) return <Navigate replace to={`/holder/verify/${pick.data}`} />;
  return (
    <>
      <h1 className="page-title">{t('demo.allAnswered')}</h1>
      <p className="lede">{t('demo.allAnsweredBody', { network: NETWORK })}</p>
      <ul className="rows">
        {[...demo.pending, ...demo.verified].map((r) => (
          <li key={r.requestId}>
            <Link to={`/request/${r.requestId}`}>{r.title[locale]}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};
