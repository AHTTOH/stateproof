// Holder answers a verification request (PRD §6 · §8): review the boundary, then prove.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Op, pureCircuits, submitProof, type Request } from '@stateproof/contract';
import { bytes32ToLabel, describePolicy, fromHex32, getSchema, schemaByIdBytes, type CredentialDocument } from '@stateproof/core';
import { useLace } from '../../app/LaceContext';
import { errorMessage, useAsync } from '../../app/useAsync';
import { demoRequestsFor, explorerTxUrl, issuerInfo } from '../../app/env';
import { Boundary } from '../../components/Boundary';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchRequest } from '../../state/ledger';
import { clearHolderWallet, loadHolderWallet, proofInputs, type HolderWallet } from '../../state/holderWallet';
import type { DryRunResult } from '../../providers/dryRun';
import { PersonaPicker } from './HolderPage';
import { ErrorNotice } from '../../components/ErrorNotice';
import { PageError } from '../../components/PageError';
import { useElapsed } from '../../app/useElapsed';
import { detectLace } from '../../providers/lace';

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

const isDemoRequest = (requestId: string): boolean =>
  demoRequestsFor()?.pending.some((r) => r.requestId === requestId.toLowerCase()) === true;

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
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const [dryBusy, setDryBusy] = useState(false);
  const [hasLace, setHasLace] = useState<boolean | null>(null);
  const working = busy || dryBusy;
  const elapsed = useElapsed(working);

  useEffect(() => {
    let live = true;
    void detectLace().then((found) => live && setHasLace(found));
    return () => {
      live = false;
    };
  }, []);

  const request = view.data?.request ?? null;
  const doc = useMemo(() => (wallet && request ? matchingCredential(wallet, request) : null), [wallet, request]);
  const check = useMemo(() => (wallet && doc && request ? checkLocally(wallet, doc, request) : null), [wallet, doc, request]);

  if (view.loading) return <p className="muted" role="status">Reading the request from the Midnight ledger…</p>;
  if (view.error || !view.data || !request) {
    return <PageError title="This request could not be opened" message={view.error ?? 'The ledger returned no data for this request'} />;
  }
  const { receipt } = view.data;
  const schema = getSchema(receipt.policy.schema.id);

  const prove = async () => {
    if (!wallet || !doc || working) return;
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

  // Same transaction as Verify privately, proved here with throwaway keys and never submitted.
  const tryWithoutWallet = async () => {
    if (!wallet || !doc || working) return;
    setDryBusy(true);
    setError(null);
    setDryRun(null);
    try {
      const { dryRunProof } = await import('../../providers/dryRun');
      setDryRun(await dryRunProof(fromHex32(requestId), proofInputs(wallet, doc)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDryBusy(false);
    }
  };

  const verifyButton = (className: string) => (
    <button type="button" className={className} aria-disabled={working} onClick={prove}>
      {busy ? 'Proving privately…' : 'Verify privately'}
    </button>
  );
  const dryRunButton = (className: string) => (
    <button type="button" className={className} aria-disabled={working} onClick={tryWithoutWallet}>
      {dryBusy ? 'Generating the proof…' : 'Try the proof without a wallet'}
    </button>
  );

  const switchPersona = () => {
    clearHolderWallet();
    setWallet(null);
    setDryRun(null);
    setError(null);
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

      <Boundary
        description={receipt.policy}
        issuerName={issuerInfo(receipt.policy.issuerId).name}
        learnHeading="The verifier will learn"
        sealedHeading="They will NOT receive"
        revealedValue={null}
      />

      {receipt.status === 'pending' && wallet !== null && (
        <p className="inline small">
          <span>
            Holder: <strong>{wallet.label}</strong>
          </span>
          <button type="button" className="btn quiet" disabled={working} onClick={switchPersona}>
            Use a different persona
          </button>
        </p>
      )}

      {receipt.status !== 'pending' ? (
        <p className="notice">
          This request is {receipt.status}. <Link to={`/request/${requestId}`}>Open the receipt</Link>
          {isDemoRequest(requestId) && (
            <>
              {' '}
              or <Link to="/demo">open another pending demo request</Link>
            </>
          )}
          .
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
            Using the {schema.title} held by {wallet.label}. The proof is generated in this browser, usually in 10 to 30
            seconds.
          </p>
          {/* Without Lace the wallet-free proof becomes the primary action, first in both visual and tab order. */}
          <div className="inline">
            {hasLace === false ? (
              <>
                {dryRunButton('btn prove')}
                {verifyButton('btn quiet')}
              </>
            ) : (
              <>
                {verifyButton('btn prove')}
                {dryRunButton('btn quiet')}
              </>
            )}
          </div>
          <p className="progress small" role="status" aria-live="polite">
            {busy && 'Generating the proof in this browser. Lace will then ask you to approve the network fee.'}
            {dryBusy && 'Building the transaction and generating the zero-knowledge proof in this browser.'}
            {working && <span aria-hidden="true"> {elapsed} s</span>}
          </p>
          <p className="small muted">
            {hasLace === false
              ? 'Lace is not installed in this browser, so Verify privately cannot submit. Try the proof without a wallet builds the same transaction with throwaway keys and generates the zero-knowledge proof here. Nothing is signed or submitted.'
              : 'Verify privately asks Lace to pay the network fee and submit. Try the proof without a wallet builds the same transaction with throwaway keys and generates the proof here; nothing is signed or submitted.'}
          </p>
        </div>
      )}

      {dryRun && (
        <p className="notice ok" role="status">
          Zero-knowledge proof generated in this browser in {(dryRun.proveMs / 1000).toFixed(1)} s. The proven transaction is{' '}
          {(dryRun.txBytes / 1024).toFixed(1)} KB and contains no credential data. It was not submitted; Verify privately
          sends this same transaction through Lace.
        </p>
      )}
      {error && <ErrorNotice message={error} />}
      {txHash && (
        <p className="notice ok" role="status">
          Proof accepted on chain. <a href={explorerTxUrl(txHash)}>Transaction</a>. <Link to={`/request/${requestId}`}>View receipt</Link>
        </p>
      )}
    </>
  );
};
