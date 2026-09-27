import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { LOCALES } from '@stateproof/core/locale';
import { ErrorBoundary } from './ErrorBoundary';
import { NETWORK, contractAddress, explorerContractUrl } from '../app/env';
import { useI18n } from '../app/i18n';

const LanguageSwitch = () => {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="lang" role="group" aria-label={t('lang.label')}>
      {LOCALES.map((l) => (
        <button key={l} type="button" aria-pressed={locale === l} onClick={() => setLocale(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export const Layout = () => {
  const { t } = useI18n();
  const address = contractAddress();
  const { pathname } = useLocation();
  return (
    <div className="shell">
      <header className="masthead">
        <Link to="/" className="wordmark">
          <span className="wordmark-mark" aria-hidden="true" />
          StateProof
        </Link>
        <nav className="nav" aria-label={t('nav.label')}>
          <NavLink to="/verifier">{t('nav.verifier')}</NavLink>
          <NavLink to="/holder">{t('nav.holder')}</NavLink>
          <NavLink to="/issuer">{t('nav.issuer')}</NavLink>
        </nav>
        <div className="masthead-end">
          <span className="network">Midnight {NETWORK}</span>
          <LanguageSwitch />
        </div>
      </header>
      <main>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="footer">
        <span className="footer-brand">StateProof</span>
        <nav className="footer-links" aria-label={t('footer.links')}>
          <a href="https://github.com/AHTTOH/stateproof">GitHub</a>
          {address !== null && <a href={explorerContractUrl(address)}>{t('footer.contract')}</a>}
          <a href="https://midnight.network/">Midnight</a>
        </nav>
      </footer>
    </div>
  );
};
