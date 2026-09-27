// Trusted issuers: public keys from config/issuers.json checked against the on-chain registry.
import { getSchema, labelToBytes32, schemaTitle } from '@stateproof/core';
import { ISSUERS, NETWORK, contractAddress, issuerName } from '../../app/env';
import { useI18n } from '../../app/i18n';
import type { MessageKey } from '../../app/messages';
import { useAsync } from '../../app/useAsync';
import { ErrorNotice } from '../../components/ErrorNotice';
import { fetchLedger } from '../../state/ledger';
import { OperatorPanel } from './OperatorPanel';

type RegistryState = 'checking' | 'unknown' | 'registered' | 'missing' | 'mismatch';

const STATE_LABEL: Readonly<Record<RegistryState, MessageKey>> = {
  checking: 'issuer.state.checking',
  unknown: 'issuer.state.unknown',
  registered: 'issuer.state.registered',
  missing: 'issuer.state.missing',
  mismatch: 'issuer.state.mismatch',
};

const STATE_CLASS: Readonly<Record<RegistryState, string>> = {
  checking: 'pending',
  unknown: 'pending',
  registered: 'verified',
  missing: 'invalid',
  mismatch: 'invalid',
};

export const IssuerPage = () => {
  const { t, locale } = useI18n();
  const deployed = contractAddress() !== null;
  const ledger = useAsync(() => (deployed ? fetchLedger() : Promise.resolve(null)), [deployed]);
  // A failed ledger read is "could not check", never "not registered".
  const onChain = (id: string, pk: { x: string; y: string } | null): RegistryState => {
    if (ledger.loading) return 'checking';
    if (ledger.error) return 'unknown';
    if (!ledger.data || pk === null) return 'missing';
    const key = labelToBytes32(id);
    if (!ledger.data.issuers.member(key)) return 'missing';
    const stored = ledger.data.issuers.lookup(key);
    return stored.x === BigInt(pk.x) && stored.y === BigInt(pk.y) ? 'registered' : 'mismatch';
  };

  return (
    <>
      <h1 className="page-title">{t('issuer.title')}</h1>
      <p className="lede">{t('issuer.lede')}</p>
      {!deployed && <p className="notice">{t('issuer.notDeployed', { network: NETWORK })}</p>}
      {ledger.error && <ErrorNotice message={ledger.error} />}
      <ul className="rows">
        {ISSUERS.map((i) => {
          const state = onChain(i.id, i.publicKey);
          return (
            <li key={i.id}>
              <div>
                <div className="row-title">{issuerName(i, locale)}</div>
                <div className="small">{t('issuer.issues', { schemas: i.schemas.map((s) => schemaTitle(getSchema(s), locale)).join(', ') })}</div>
                <div className="hash muted">{i.id}</div>
              </div>
              <span className={`status ${STATE_CLASS[state]}`}>{t(STATE_LABEL[state])}</span>
            </li>
          );
        })}
      </ul>
      <h2 className="section-title">{t('issuer.issueTitle')}</h2>
      <p className="small">{t('issuer.issueBody')}</p>
      <pre className="hash">
        {`npm run issue -w @stateproof/issuer -- keygen --issuer issuer:acme-hr
npm run issue -w @stateproof/issuer -- personas
npm run register-issuer -w @stateproof/cli`}
      </pre>
      <OperatorPanel />
    </>
  );
};
