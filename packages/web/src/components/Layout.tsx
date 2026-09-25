import { NavLink, Outlet, Link } from 'react-router-dom';
import { NETWORK, contractAddress } from '../app/env';

export const Layout = () => {
  const address = contractAddress();
  return (
    <div className="shell">
      <header className="masthead">
        <Link to="/" className="wordmark">
          State<span>Proof</span>
        </Link>
        <nav className="nav" aria-label="Roles">
          <NavLink to="/verifier">Verifier</NavLink>
          <NavLink to="/holder">Holder</NavLink>
          <NavLink to="/issuer">Issuer</NavLink>
        </nav>
        <span className="network">
          Midnight <b>{NETWORK}</b>
        </span>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          Proofs are generated inside this browser with the Midnight zkir prover. Your credential never leaves this device;
          Lace only pays the network fee and submits the transaction.
        </p>
        <p>
          Contract <span className="hash">{address ?? `not deployed on ${NETWORK}`}</span>. Test network data only. All
          people and issuers in the demo are fictional.
        </p>
      </footer>
    </div>
  );
};
