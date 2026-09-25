import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { NETWORK } from './env';
import { App } from './App';
import '../styles/app.css';

// Midnight.js and Apollo expect Node-style globals in the browser.
(globalThis as { Buffer?: unknown }).Buffer = Buffer;
(globalThis as { process?: unknown }).process = { env: { NODE_ENV: import.meta.env.MODE } };

setNetworkId(NETWORK);

const root = document.getElementById('root');
if (!root) throw new Error('#root element missing from index.html');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
