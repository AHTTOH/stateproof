// Holder answers a verification request (PRD §6 · §8): review the boundary, then prove.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Op, pureCircuits, submitProof, type Request } from '@stateproof/contract';
import { bytes32ToLabel, describePolicy, fromHex32, getSchema, schemaByIdBytes, type CredentialDocument } from '@stateproof/core';
import { useLace } from '../../app/LaceContext';
import { errorMessage, useAsync } from '../../app/useAsync';
import { explorerTxUrl, issuerInfo } from '../../app/env';
import { Boundary } from '../../components/Boundary';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest } from '../../state/ledger';
import { loadHolderWallet, proofInputs, type HolderWallet } from '../../state/holderWallet';
import { PersonaPicker } from './HolderPage';

interface LocalCheck {
  readonly ok: boolean;
  readonly reasons: readonly string[];
}

// Runs the same predicate circuits locally so the holder learns why a proof would fail
// before anything is generated or sent.
const checkLocally = (wallet: HolderWallet, doc: CredentialDocument, request: Request): LocalCheck => {
  const { credential } = proofInputs(wallet, doc);
  const described = describePolicy(request.policy);
  const active = request.policy.conditions.filter((c) => c.op !== Op.ignore);
  const reasons = active.flatMap((c, i) => (pureCircuits.conditionHolds(credential.claims, c) ? [] : [`Not met: ${described.conditions[i]}`]));
  if (credential.expiresAt <= request.referenceTime) reasons.push('Your credential expired before the reference time of this request');
  if (credential.issuedAt > request.referenceTime) reasons.push('Your credential was issued after the reference time of this request');
  return { ok: reasons.length === 0, reasons };
};

const matchingCredential = (wallet: HolderWallet, request: Request): CredentialDocument | null => {
  const schema = schemaByIdBytes(request.policy.schemaId);
  const issuerId = bytes32ToLabel(request.policy.issuerId);
  return wallet.credentials.find((d) => d.schema === schema.id && d.issuer.id === issuerId) ?? null;
};

export const VerifyPage = () => {
  const { requestId = '' } = useParams();
  const lace = useLace();
  const view = useAsync(() => fetchRequest(requestId), [requestId]);
  const [wallet, setWallet] = useState<HolderWallet | null>(loadHolderWallet());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const request = view.data?.request ?? null;
  const doc = useMemo(() => (wallet && request ? matchingCredential(wallet, request) : null), [wallet, request]);
  const check = useMemo(() => (wallet && doc && request ? checkLocally(wallet, doc, request) : null), [wallet, doc, request]);

  if (view.loading) return <p className="muted">Reading the request from the ledger…</p>;
  if (view.error || !view.data || !request) return <p className="notice error" role="alert">{view.error}</p>;
  const { receipt } = view.data;
  const schema = getSchema(receipt.policy.schema.id);

  const prove = async () => {
    if (!wallet || !doc) return;
    setBusy(true);
    setError(null);
    try {
      const session = await lace.connect();
      const result = await submitProof(session.providers, session.contract, fromHex32(requestId), proofInputs(wallet, doc));
      setTxHash(result.txHash);
      view.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="page-title">
        A verifier asks you to prove something <StatusBadge status={receipt.status} />
      </h1>
      <p className="lede">
        They ask about your {schema.title} from {issuerInfo(receipt.policy.issuerId).name}. Review exactly what crosses
        over before you prove anything.
      </p>

      <Boundary description={receipt.policy} verifierLabel="The verifier" issuerName={issuerInfo(receipt.policy.issuerId).name} />

      {receipt.status !== 'pending' ? (
        <p className="notice">
          This request is {receipt.status}. <Link to={`/request/${requestId}`}>Open the receipt</Link>
        </p>
      ) : wallet === null ? (
        <>
          <h2 className="section-title">Load your credentials first</h2>
          <PersonaPicker onPick={setWallet} />
        </>
      ) : doc === null ? (
        <p className="notice error">
          {wallet.label} has no {schema.title} from {issuerInfo(receipt.policy.issuerId).name}. Nothing can be proven.
        </p>
      ) : check && !check.ok ? (
        <div className="notice error" role="alert">
          <strong>Your credential does not satisfy this request.</strong> No proof was generated and nothing was sent.
          <ul>
            {check.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="stack">
          <p className="small muted">
            Using {wallet.label}’s {schema.title}. The proof is generated in this browser (a few seconds). Lace then asks
            you to approve the network fee.
          </p>
          <div>
            <button type="button" className="btn prove" disabled={busy} onClick={prove}>
              {busy ? 'Proving privately…' : 'Verify privately'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="notice error" role="alert">{error}</p>}
      {txHash && (
        <p className="notice ok">
          Proof accepted on chain. <a href={explorerTxUrl(txHash)}>Transaction</a>. <Link to={`/request/${requestId}`}>View receipt</Link>
        </p>
      )}
    </>
  );
};
