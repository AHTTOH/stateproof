// Operator tools: deploy a StateProof instance and register the configured issuers with Lace.
// The admin secret is typed in, used for the transaction and never stored.
import { useState } from 'react';
import {
  adminPrivateState,
  deployStateProof,
  joinStateProof,
  readLedger,
  registerIssuer,
} from '@stateproof/contract';
import { fromHex32, labelToBytes32, publicKeyFromJson, randomBytes32, toHex } from '@stateproof/core';
import { ISSUERS, contractAddress, explorerTxUrl, issuerName } from '../../app/env';
import { useI18n } from '../../app/i18n';
import { useLace } from '../../app/LaceContext';
import { errorMessage } from '../../app/useAsync';
import { ErrorNotice } from '../../components/ErrorNotice';

interface LogLine {
  readonly text: string;
  readonly txHash?: string;
}

export const OperatorPanel = () => {
  const { t, locale } = useI18n();
  const lace = useLace();
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<readonly LogLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const append = (line: LogLine) => setLog((prev) => [...prev, line]);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const deploy = () =>
    run(async () => {
      const { providers } = await lace.connectWallet();
      const adminSecret = fromHex32(secret);
      const { address, receipt } = await deployStateProof(providers, adminSecret);
      append({ text: t('operator.deployed', { address }), txHash: receipt.txHash });
    });

  const register = () =>
    run(async () => {
      const address = contractAddress();
      if (address === null) throw new Error('No contract in config/deployments.json for this network');
      const { providers } = await lace.connectWallet();
      const admin = await joinStateProof(providers, address, adminPrivateState(fromHex32(secret)));
      for (const issuer of ISSUERS) {
        if (issuer.publicKey === null) throw new Error(`${issuer.id} has no public key in config/issuers.json`);
        const id = labelToBytes32(issuer.id);
        const key = publicKeyFromJson(issuer.publicKey);
        const ledger = await readLedger(providers.publicDataProvider, address);
        if (ledger.issuers.member(id)) {
          const onChain = ledger.issuers.lookup(id);
          if (onChain.x === key.x && onChain.y === key.y) {
            append({ text: t('operator.alreadyRegistered', { issuer: issuerName(issuer, locale) }) });
            continue;
          }
        }
        const receipt = await registerIssuer(admin, id, key);
        append({ text: t('operator.registered', { issuer: issuerName(issuer, locale) }), txHash: receipt.txHash });
      }
    });

  return (
    <details className="stack" style={{ marginTop: 'var(--s-12)' }}>
      <summary className="section-title" style={{ cursor: 'pointer' }}>
        {t('operator.title')}
      </summary>
      <p className="small muted">{t('operator.body')}</p>
      <div className="inline">
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="admin-secret">{t('operator.secret')}</label>
          <input id="admin-secret" type="password" autoComplete="off" spellCheck={false} value={secret} onChange={(e) => setSecret(e.target.value.trim())} />
        </div>
        <button type="button" className="btn quiet" onClick={() => setSecret(toHex(randomBytes32()))}>
          {t('operator.generate')}
        </button>
      </div>
      <div className="inline">
        <button type="button" className="btn" disabled={busy || secret === ''} onClick={deploy}>
          {t('operator.deploy')}
        </button>
        <button type="button" className="btn quiet" disabled={busy || secret === '' || contractAddress() === null} onClick={register}>
          {t('operator.register')}
        </button>
        {busy && <span className="muted small">{t('operator.waiting')}</span>}
      </div>
      {error && <ErrorNotice message={error} />}
      {log.length > 0 && (
        <ul className="rows">
          {log.map((l, i) => (
            <li key={i}>
              <span>{l.text}</span>
              {l.txHash ? <a className="hash" href={explorerTxUrl(l.txHash)}>{t('common.transaction')}</a> : <span />}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
};
