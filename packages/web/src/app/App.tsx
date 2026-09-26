import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HomePage } from './HomePage';
import { LaceProvider } from './LaceContext';

// Each role page loads with its own chunk; the landing page stays light.
const VerifierPage = lazy(() => import('../routes/verifier/VerifierPage').then((m) => ({ default: m.VerifierPage })));
const RequestPage = lazy(() => import('../routes/verifier/RequestPage').then((m) => ({ default: m.RequestPage })));
const HolderPage = lazy(() => import('../routes/holder/HolderPage').then((m) => ({ default: m.HolderPage })));
const VerifyPage = lazy(() => import('../routes/holder/VerifyPage').then((m) => ({ default: m.VerifyPage })));
const IssuerPage = lazy(() => import('../routes/issuer/IssuerPage').then((m) => ({ default: m.IssuerPage })));

const page = (node: ReactNode) => <Suspense fallback={<p className="muted">Loading…</p>}>{node}</Suspense>;

export const App = () => (
  <LaceProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="verifier" element={page(<VerifierPage />)} />
          <Route path="request/:requestId" element={page(<RequestPage />)} />
          <Route path="holder" element={page(<HolderPage />)} />
          <Route path="holder/verify/:requestId" element={page(<VerifyPage />)} />
          <Route path="issuer" element={page(<IssuerPage />)} />
          <Route path="*" element={<p className="notice error">Page not found.</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </LaceProvider>
);
