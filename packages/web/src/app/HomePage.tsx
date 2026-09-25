import { Link } from 'react-router-dom';

export const HomePage = () => (
  <>
    <h1 className="hero-title">Prove the condition. Keep the data.</h1>
    <p className="lede">
      StateProof lets a verifier ask “is this person employed for at least a year?” or “are they an adult living in Seoul
      or Gyeonggi?” and get a yes, checked by zero-knowledge proof on Midnight, without ever receiving a birth date, an
      employment record or an address.
    </p>
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
