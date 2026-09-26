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
import { ISSUERS, contractAddress, explorerTxUrl } from '../../app/env';
import { useLace } from '../../app/LaceContext';
import { errorMessage } from '../../app/useAsync';
import { ErrorNotice } from '../../components/ErrorNotice';

interface LogLine {
  readonly text: string;
  readonly txHash?: string;
}

export const OperatorPanel = () => {
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
      append({ text: `Deployed at ${address}. Add it to config/deployments.json and rebuild.`, txHash: receipt.txHash });
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
            append({ text: `${issuer.name}: already registered` });
            continue;
          }
        }
        const receipt = await registerIssuer(admin, id, key);
        append({ text: `${issuer.name}: registered`, txHash: receipt.txHash });
      }
    });

  return (
    <details className="stack" style={{ marginTop: 'var(--s-12)' }}>
      <summary className="section-title" style={{ cursor: 'pointer' }}>
        Operator tools
      </summary>
      <p className="small muted">
        Deploy your own StateProof instance or register the issuers from config/issuers.json, paying fees with Lace. The
        admin secret is a 32-byte hex value; its hash becomes the on-chain admin. It is not stored by this page.
      </p>
      <div className="inline">
        <div className="field" style={{ flex: 1 }}>
          <label htmlFor="admin-secret">Admin secret (hex)</label>
          <input id="admin-secret" type="password" autoComplete="off" spellCheck={false} value={secret} onChange={(e) => setSecret(e.target.value.trim())} />
        </div>
        <button type="button" className="btn quiet" onClick={() => setSecret(toHex(randomBytes32()))}>
          Generate
        </button>
      </div>
      <div className="inline">
        <button type="button" className="btn" disabled={busy || secret === ''} onClick={deploy}>
          Deploy new contract
        </button>
        <button type="button" className="btn quiet" disabled={busy || secret === '' || contractAddress() === null} onClick={register}>
          Register issuers
        </button>
        {busy && <span className="muted small">Waiting for Lace and the network…</span>}
      </div>
      {error && <ErrorNotice message={error} />}
      {log.length > 0 && (
        <ul className="rows">
          {log.map((l, i) => (
            <li key={i}>
              <span>{l.text}</span>
              {l.txHash ? <a className="hash" href={explorerTxUrl(l.txHash)}>transaction</a> : <span />}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
};
