import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from './HomePage';
import { I18nProvider, useI18n } from './i18n';
import { LaceProvider } from './LaceContext';

// Each role page loads with its own chunk; the landing page stays light.
const VerifierPage = lazy(() => import('../routes/verifier/VerifierPage').then((m) => ({ default: m.VerifierPage })));
const RequestPage = lazy(() => import('../routes/verifier/RequestPage').then((m) => ({ default: m.RequestPage })));
const HolderPage = lazy(() => import('../routes/holder/HolderPage').then((m) => ({ default: m.HolderPage })));
const VerifyPage = lazy(() => import('../routes/holder/VerifyPage').then((m) => ({ default: m.VerifyPage })));
const DemoPage = lazy(() => import('../routes/holder/DemoPage').then((m) => ({ default: m.DemoPage })));
const IssuerPage = lazy(() => import('../routes/issuer/IssuerPage').then((m) => ({ default: m.IssuerPage })));

const ChunkLoading = () => {
  const { t } = useI18n();
  return (
    <p className="muted" role="status" style={{ marginTop: 'var(--s-10)' }}>
      {t('common.loadingChunk')}
    </p>
  );
};

const page = (node: ReactNode) => <Suspense fallback={<ChunkLoading />}>{node}</Suspense>;

const NotFound = () => {
  const { t } = useI18n();
  return (
    <>
      <h1 className="page-title">{t('notFound.title')}</h1>
      <p>
        <Link to="/">{t('common.toStart')}</Link>
      </p>
    </>
  );
};

export const App = () => (
  <I18nProvider>
    <LaceProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="verifier" element={page(<VerifierPage />)} />
            <Route path="request/:requestId" element={page(<RequestPage />)} />
            <Route path="demo" element={page(<DemoPage />)} />
            <Route path="holder" element={page(<HolderPage />)} />
            <Route path="holder/verify/:requestId" element={page(<VerifyPage />)} />
            <Route path="issuer" element={page(<IssuerPage />)} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LaceProvider>
  </I18nProvider>
);
