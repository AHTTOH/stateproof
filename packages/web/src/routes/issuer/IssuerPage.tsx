// Trusted issuers: public keys from config/issuers.json checked against the on-chain registry.
import { getSchema, labelToBytes32 } from '@stateproof/core';
import { ISSUERS, NETWORK, contractAddress } from '../../app/env';
import { useAsync } from '../../app/useAsync';
import { fetchLedger } from '../../state/ledger';
import { OperatorPanel } from './OperatorPanel';

export const IssuerPage = () => {
  const deployed = contractAddress() !== null;
  const ledger = useAsync(() => (deployed ? fetchLedger() : Promise.resolve(null)), [deployed]);
  const onChain = (id: string, pk: { x: string; y: string } | null): 'registered' | 'missing' | 'mismatch' => {
    if (!ledger.data || pk === null) return 'missing';
    const key = labelToBytes32(id);
    if (!ledger.data.issuers.member(key)) return 'missing';
    const stored = ledger.data.issuers.lookup(key);
    return stored.x === BigInt(pk.x) && stored.y === BigInt(pk.y) ? 'registered' : 'mismatch';
  };

  return (
    <>
      <h1 className="page-title">Issuers sign, the chain remembers who to trust</h1>
      <p className="lede">
        An issuer signs a credential with a Jubjub Schnorr key and binds it to the holder’s secret commitment. The contract
        admin registers the issuer’s public key on chain; every proof checks the signature against that key inside the
        circuit.
      </p>
      {!deployed && <p className="notice">StateProof is not deployed on {NETWORK} yet. Use the operator tools below.</p>}
      {ledger.error && <p className="notice error" role="alert">{ledger.error}</p>}
      <ul className="rows">
        {ISSUERS.map((i) => {
          const state = onChain(i.id, i.publicKey);
          return (
            <li key={i.id}>
              <div>
                <div className="row-title">{i.name}</div>
                <div className="small">Issues {i.schemas.map((s) => getSchema(s).title).join(', ')}</div>
                <div className="hash muted">{i.id}</div>
              </div>
              <span className={`status ${state === 'registered' ? 'verified' : 'invalid'}`}>
                {ledger.loading ? 'Checking' : state === 'registered' ? 'Registered on chain' : state === 'mismatch' ? 'Key mismatch' : 'Not registered'}
              </span>
            </li>
          );
        })}
      </ul>
      <h2 className="section-title">Issue credentials</h2>
      <p className="small">
        Issuance runs off chain with the issuer CLI, so signing keys never touch a browser:
      </p>
      <pre className="hash">
        {`npm run issue -w @stateproof/issuer -- keygen --issuer issuer:acme-hr
npm run issue -w @stateproof/issuer -- personas
npm run register-issuer -w @stateproof/cli`}
      </pre>
      <OperatorPanel />
    </>
  );
};
