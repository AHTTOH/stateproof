import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NETWORK, demoRequestsFor } from './env';

// The holder page pulls in the ledger and prover WASM; fetch it while the visitor reads.
const PREFETCH_DELAY_MS = 1500;
const usePrefetchHolderPage = () => {
  useEffect(() => {
    const timer = window.setTimeout(() => void import('../routes/holder/VerifyPage'), PREFETCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);
};

const TryIt = () => {
  const demo = demoRequestsFor();
  if (demo === null) return <p className="notice">No demo requests are configured for {NETWORK}.</p>;
  return (
    <section className="try" aria-labelledby="try-title">
      <h2 id="try-title">Try it now, no wallet needed</h2>
      <p>
        <Link className="btn prove" to="/demo">
          Open a pending demo request
        </Link>
      </p>
      <ol className="try-steps">
        <li>Open a pending request (the button above picks one that is still open, or choose below).</li>
        <li>
          Load the fictional holder <strong>Minji</strong>.
        </li>
        <li>
          Press <strong>Try the proof without a wallet</strong>. Your browser generates a real zero-knowledge proof for
          that request (usually 10 to 30 seconds). Nothing is signed or submitted.
        </li>
      </ol>
      <ul className="try-links">
        {demo.pending.map((r) => (
          <li key={r.requestId}>
            <Link to={`/holder/verify/${r.requestId}`}>
              <strong>{r.title}</strong>
              <span className="small muted">{r.reveals === null ? 'Asks to see no value' : `Asks to see one value: ${r.reveals}`}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="small">
        Results already written on Preprod:{' '}
        {demo.verified.map((r, i) => (
          <span key={r.requestId}>
            {i > 0 && '; '}
            <Link to={`/request/${r.requestId}`}>{r.title}</Link>
          </span>
        ))}
        .
      </p>
    </section>
  );
};

export const HomePage = () => {
  usePrefetchHolderPage();
  return (
    <>
      <h1 className="hero-title">Prove the condition. Keep the data.</h1>
      <p className="lede">
        StateProof lets a verifier ask “is this person employed for at least a year?” or “are they an adult living in Seoul
        or Gyeonggi?” and get a yes, checked by zero-knowledge proof on Midnight, without receiving the birth date,
        employment record or home address behind it.
      </p>
      <TryIt />
      <nav className="roles" aria-label="Start as">
        <Link to="/verifier">
          <strong>Verifier</strong>
          <span className="muted">Compose conditions, send a link, read a receipt.</span>
        </Link>
        <Link to="/holder">
          <strong>Holder</strong>
          <span className="muted">Keep credentials in your browser and prove only what is asked.</span>
        </Link>
        <Link to="/issuer">
          <strong>Issuer</strong>
          <span className="muted">Sign credentials. Registered keys are trusted by the contract.</span>
        </Link>
      </nav>
    </>
  );
};
