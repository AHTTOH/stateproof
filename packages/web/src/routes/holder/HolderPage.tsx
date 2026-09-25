import { useState } from 'react';
import { getSchema } from '@stateproof/core';
import { errorMessage } from '../../app/useAsync';
import { issuerInfo } from '../../app/env';
import {
  DEMO_PERSONAS,
  adoptDemoPersona,
  clearHolderWallet,
  importCredential,
  isExpired,
  issuerSignatureValid,
  loadHolderWallet,
  type HolderWallet,
} from '../../state/holderWallet';

export const PersonaPicker = ({ onPick }: { onPick(w: HolderWallet): void }) => {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="stack">
      <p className="muted small">
        Demo personas are fictional. Their credentials were issued by the demo issuers in config/issuers.json and their
        holder secrets are public so anyone can replay the demo.
      </p>
      <div className="inline">
        {DEMO_PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="btn quiet"
            onClick={() => {
              try {
                onPick(adoptDemoPersona(p));
              } catch (e) {
                setError(errorMessage(e));
              }
            }}
          >
            Use {p.displayName}
          </button>
        ))}
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
    </div>
  );
};

export const HolderPage = () => {
  const [wallet, setWallet] = useState<HolderWallet | null>(loadHolderWallet());
  const [error, setError] = useState<string | null>(null);
  const now = new Date();

  const onFile = async (file: File) => {
    if (!wallet) return;
    try {
      setWallet(importCredential(wallet, await file.text()));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <>
      <h1 className="page-title">Your credentials stay here</h1>
      <p className="lede">
        Credentials live in this browser. When a verifier sends you a link, you prove the conditions they ask for and
        nothing else leaves this device.
      </p>

      {wallet === null ? (
        <>
          <h2 className="section-title">Start with a demo persona</h2>
          <PersonaPicker onPick={setWallet} />
        </>
      ) : (
        <>
          <div className="inline">
            <strong>{wallet.label}</strong>
            <button
              type="button"
              className="btn quiet"
              onClick={() => {
                clearHolderWallet();
                setWallet(null);
              }}
            >
              Switch persona
            </button>
          </div>
          <ul className="rows" style={{ marginTop: 'var(--s-4)' }}>
            {wallet.credentials.map((doc) => {
              const expired = isExpired(doc, now);
              const valid = issuerSignatureValid(doc);
              return (
                <li key={`${doc.schema}-${doc.binding.salt}`}>
                  <div>
                    <div className="row-title">{getSchema(doc.schema).title}</div>
                    <div className="small">Issued by {issuerInfo(doc.issuer.id).name}</div>
                    <div className="small muted">
                      Valid {doc.issuedAt.slice(0, 10)} to {doc.expiresAt.slice(0, 10)}
                    </div>
                  </div>
                  <span className={`status ${!valid || expired ? 'invalid' : 'verified'}`}>
                    {!valid ? 'Signature invalid' : expired ? 'Expired' : 'Ready'}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="field" style={{ marginTop: 'var(--s-6)' }}>
            <label htmlFor="import">Import a credential file bound to this holder</label>
            <input id="import" type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </div>
          {error && <p className="notice error" role="alert">{error}</p>}
        </>
      )}
    </>
  );
};
