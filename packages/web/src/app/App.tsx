import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { HolderPage } from '../routes/holder/HolderPage';
import { VerifyPage } from '../routes/holder/VerifyPage';
import { IssuerPage } from '../routes/issuer/IssuerPage';
import { RequestPage } from '../routes/verifier/RequestPage';
import { VerifierPage } from '../routes/verifier/VerifierPage';
import { HomePage } from './HomePage';
import { LaceProvider } from './LaceContext';

export const App = () => (
  <LaceProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="verifier" element={<VerifierPage />} />
          <Route path="request/:requestId" element={<RequestPage />} />
          <Route path="holder" element={<HolderPage />} />
          <Route path="holder/verify/:requestId" element={<VerifyPage />} />
          <Route path="issuer" element={<IssuerPage />} />
          <Route path="*" element={<p className="notice error">Page not found.</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </LaceProvider>
);
