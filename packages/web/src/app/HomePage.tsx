import { lazy, Suspense, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NETWORK, demoRequestsFor } from './env';
import { useI18n } from './i18n';
import { ScrollStory } from './ScrollStory';
import heroShield from '../assets/hero-shield.webp';

// The preview reads the ledger and needs the contract runtime, so it loads after first paint.
const SealPreview = lazy(() => import('../routes/holder/SealPreview').then((m) => ({ default: m.SealPreview })));

// The holder page pulls in the ledger and prover WASM; fetch it while the visitor reads.
const PREFETCH_DELAY_MS = 1500;
const usePrefetchHolderPage = () => {
  useEffect(() => {
    const timer = window.setTimeout(() => void import('../routes/holder/VerifyPage'), PREFETCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);
};

const DemoRequests = () => {
  const { t, locale } = useI18n();
  const demo = demoRequestsFor();
  if (demo === null) return <p className="notice">{t('home.noDemo', { network: NETWORK })}</p>;
  return (
    <section aria-labelledby="demo-title">
      <div className="demo-head">
        <h2 id="demo-title">{t('home.demoTitle')}</h2>
        <Link className="btn primary" to="/demo">
          {t('home.try.open')}
        </Link>
      </div>
      {/* One card per kind of request; spare copies of the same request stay reachable through /demo. */}
      <ul className="request-cards">
        {demo.pending
          .filter((r, i, all) => all.findIndex((o) => o.title.ko === r.title.ko) === i)
          .map((r) => (
            <li key={r.requestId}>
              <div className="request-card-head">
                <strong>{r.label[locale]}</strong>
                <span className="status pending">{t('status.pending')}</span>
              </div>
              <ul className="checks">
                {r.conditions[locale].map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <span className="small muted">{r.reveals === null ? t('home.try.asksNone') : t('home.try.asks', { value: r.reveals[locale] })}</span>
              <Link className="btn primary" to={`/holder/verify/${r.requestId}`}>
                {t('verify.dry')}
              </Link>
            </li>
          ))}
      </ul>
      <ol className="steps">
        <li>{t('home.try.step1')}</li>
        <li>{t('home.try.step2')}</li>
        <li>{t('home.try.step3')}</li>
      </ol>
    </section>
  );
};

const LowerLinks = () => {
  const { t, locale } = useI18n();
  const demo = demoRequestsFor();
  return (
    <div className="lower">
      <section aria-labelledby="results-title">
        <h2 className="section-title" id="results-title">
          {t('home.try.results')}
        </h2>
        {demo !== null && (
          <ul className="rows">
            {demo.verified.map((r) => (
              <li key={r.requestId}>
                <Link to={`/request/${r.requestId}`}>{r.title[locale]}</Link>
                <span className="status verified">{t('status.verified')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <nav aria-labelledby="roles-title">
        <h2 className="section-title" id="roles-title">
          {t('home.roles')}
        </h2>
        <ul className="rows link-rows">
          <li>
            <Link to="/verifier">{t('nav.verifier')}</Link>
            <span className="small muted">{t('home.role.verifier')}</span>
          </li>
          <li>
            <Link to="/holder">{t('nav.holder')}</Link>
            <span className="small muted">{t('home.role.holder')}</span>
          </li>
          <li>
            <Link to="/issuer">{t('nav.issuer')}</Link>
            <span className="small muted">{t('home.role.issuer')}</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export const HomePage = () => {
  const { t } = useI18n();
  usePrefetchHolderPage();
  return (
    <>
      <section className="hero">
        <img className="hero-art" src={heroShield} alt="" width={1536} height={1024} />
        <h1>{t('home.lede')}</h1>
        <p>{t('home.hero.sub')}</p>
        <div className="actions">
          <Link className="btn primary" to="/demo">
            {t('home.try.open')}
          </Link>
          <a className="btn quiet" href="#results-title">
            {t('home.hero.receipt')}
          </a>
        </div>
      </section>
      <ScrollStory />
      <div className="home">
        <div>
          <DemoRequests />
        </div>
        <aside className="preview" aria-label={t('seal.lineHead')}>
          <Suspense fallback={<div className="preview-skeleton" aria-hidden="true" />}>
            <SealPreview />
          </Suspense>
        </aside>
      </div>
      <LowerLinks />
    </>
  );
};
