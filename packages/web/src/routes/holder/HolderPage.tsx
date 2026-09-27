// The holder's credentials in this browser. Demo personas are fictional and public by design.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSchema, schemaTitle } from '@stateproof/core';
import { issuerInfo, issuerName } from '../../app/env';
import { personaNameKey, useI18n } from '../../app/i18n';
import { errorMessage } from '../../app/useAsync';
import { ErrorNotice } from '../../components/ErrorNotice';
import {
  DEMO_PERSONAS,
  adoptDemoPersona,
  importCredential,
  isExpired,
  issuerSignatureValid,
  loadHolderWallet,
  type HolderWallet,
} from '../../state/holderWallet';

export const HolderPage = () => {
  const { t, locale } = useI18n();
  const [wallet, setWallet] = useState<HolderWallet | null>(loadHolderWallet());
  const [error, setError] = useState<string | null>(null);
  const now = new Date();

  const pick = (personaId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (!persona) return;
    try {
      setWallet(adoptDemoPersona(persona));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

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
      <h1 className="page-title">{t('holder.title')}</h1>
      <p className="lede">{t('holder.lede')}</p>

      <div className="persona-bar">
        <span>{t('verify.holderFictional')}</span>
        <div className="segmented" role="group" aria-label={t('verify.holder')}>
          {DEMO_PERSONAS.map((p) => (
            <button key={p.id} type="button" aria-pressed={wallet?.personaId === p.id} onClick={() => pick(p.id)}>
              {t(personaNameKey(p.id, 'short'))}
            </button>
          ))}
        </div>
      </div>

      {wallet === null && <p className="empty-state">{t('holder.empty')}</p>}
      {wallet !== null && (
        <>
          <ul className="rows" style={{ marginTop: 'var(--s-4)' }}>
            {wallet.credentials.map((doc) => {
              const expired = isExpired(doc, now);
              const valid = issuerSignatureValid(doc);
              return (
                <li key={`${doc.schema}-${doc.binding.salt}`}>
                  <div>
                    <div className="row-title">{schemaTitle(getSchema(doc.schema), locale)}</div>
                    <div className="small">{t('holder.issuedBy', { issuer: issuerName(issuerInfo(doc.issuer.id), locale) })}</div>
                    <div className="small muted">{t('holder.valid', { from: doc.issuedAt.slice(0, 10), to: doc.expiresAt.slice(0, 10) })}</div>
                  </div>
                  <span className={`status ${!valid || expired ? 'invalid' : 'verified'}`}>
                    {!valid ? t('holder.signatureInvalid') : expired ? t('holder.expired') : t('holder.ready')}
                  </span>
                </li>
              );
            })}
          </ul>
          <p>
            <Link className="btn primary" to="/start">
              {t('holder.openRequest')}
            </Link>
          </p>
          <div className="field" style={{ marginTop: 'var(--s-6)' }}>
            <label htmlFor="import">{t('holder.import')}</label>
            <input id="import" type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </div>
        </>
      )}
      {error && <ErrorNotice message={error} />}
    </>
  );
};
