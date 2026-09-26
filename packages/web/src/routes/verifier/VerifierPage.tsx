import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRequest } from '@stateproof/contract';
import { buildPolicy, describePolicy, randomBytes32, toHex, type PolicyInput } from '@stateproof/core';
import { useLace } from '../../app/LaceContext';
import { contractAddress, explorerTxUrl, NETWORK } from '../../app/env';
import { errorMessage, useAsync } from '../../app/useAsync';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest } from '../../state/ledger';
import { loadRequests, rememberRequest, type StoredRequest } from '../../state/verifierRequests';
import { PolicyBuilder } from './PolicyBuilder';
import { ErrorNotice } from '../../components/ErrorNotice';

const TTL_OPTIONS = [
  { label: '1 hour', seconds: 3_600 },
  { label: '1 day', seconds: 86_400 },
  { label: '7 days', seconds: 604_800 },
] as const;

const STARTER_POLICY: PolicyInput = {
  schema: 'employment',
  issuerId: 'issuer:acme-hr',
  conditions: [
    { claim: 'employmentStatus', op: 'eq', value: 'Active' },
    { claim: 'employmentMonths', op: 'gte', value: 12 },
  ],
  reveal: null,
};

export const holderLink = (requestId: string): string => new URL(`/holder/verify/${requestId}`, window.location.origin).toString();

const RequestRow = ({ stored }: { stored: StoredRequest }) => {
  const view = useAsync(() => fetchRequest(stored.requestId), [stored.requestId]);
  return (
    <li>
      <div>
        <div className="row-title">
          <Link to={`/request/${stored.requestId}`}>{stored.label}</Link>
        </div>
        <div className="hash muted">{stored.requestId}</div>
        {view.error && <div className="small" role="alert">{view.error}</div>}
      </div>
      {view.data ? <StatusBadge status={view.data.receipt.status} /> : <span className="muted small">{view.loading ? 'Reading ledger' : ''}</span>}
    </li>
  );
};

export const VerifierPage = () => {
  const lace = useLace();
  const [policyInput, setPolicyInput] = useState<PolicyInput>(STARTER_POLICY);
  const [ttl, setTtl] = useState<number>(TTL_OPTIONS[1].seconds);
  const [requests, setRequests] = useState(loadRequests());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<StoredRequest | null>(null);

  const preview = useMemo(() => {
    try {
      return { policy: buildPolicy(policyInput), error: null };
    } catch (e) {
      return { policy: null, error: errorMessage(e) };
    }
  }, [policyInput]);
  const description = preview.policy ? describePolicy(preview.policy) : null;

  const create = async () => {
    if (!preview.policy || !description) return;
    setBusy(true);
    setError(null);
    try {
      const session = await lace.connect();
      const requestId = randomBytes32();
      const now = BigInt(Math.floor(Date.now() / 1000));
      const receipt = await createRequest(session.contract, requestId, preview.policy, now, now + BigInt(ttl));
      const stored: StoredRequest = {
        requestId: toHex(requestId),
        label: description.conditions.join(' and '),
        createdAt: new Date().toISOString(),
        txHash: receipt.txHash,
      };
      setRequests(rememberRequest(stored));
      setCreated(stored);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (contractAddress() === null) {
    return <p className="notice error">StateProof is not deployed on {NETWORK} yet.</p>;
  }

  return (
    <>
      <h1 className="page-title">Ask for a fact, not a file</h1>
      <p className="lede">
        Compose the conditions you need. The holder proves them against a signed credential without sending you the
        credential. The policy is written on chain, so the holder sees exactly what you asked for.
      </p>

      <PolicyBuilder value={policyInput} onChange={setPolicyInput} />

      <h2 className="section-title">The holder will prove</h2>
      {preview.error && <p className="notice error">{preview.error}</p>}
      {description && (
        <ul className="rows">
          {description.conditions.map((c) => (
            <li key={c}>
              <span>{c}</span>
            </li>
          ))}
          <li>
            <span className="muted">
              {description.revealed ? `Revealed to you: ${description.revealed}` : 'No value is revealed, only the yes/no result.'}
            </span>
          </li>
        </ul>
      )}

      <div className="inline" style={{ marginTop: 'var(--s-6)' }}>
        <div className="field">
          <label>Request valid for</label>
          <select value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
            {TTL_OPTIONS.map((o) => (
              <option key={o.seconds} value={o.seconds}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn" disabled={!preview.policy || busy} onClick={create}>
          {busy ? 'Creating request in Lace' : 'Create verification request'}
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      {created && (
        <div className="notice ok">
          Request created (<a href={explorerTxUrl(created.txHash)}>transaction</a>). Send this link to the holder:
          <div className="hash" style={{ marginTop: 'var(--s-2)' }}>
            <a href={holderLink(created.requestId)}>{holderLink(created.requestId)}</a>
          </div>
        </div>
      )}

      <h2 className="section-title">Your requests</h2>
      {requests.length === 0 ? (
        <p className="muted">Requests you create from this browser appear here.</p>
      ) : (
        <ul className="rows">
          {requests.map((r) => (
            <RequestRow key={r.requestId} stored={r} />
          ))}
        </ul>
      )}
    </>
  );
};
