// Holder answers a verification request (PRD §6 · §8): see the seal line, then prove.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { submitProof } from '@stateproof/contract';
import { bytes32ToLabel, fromHex32, schemaByIdBytes, schemaTitle } from '@stateproof/core';
import { demoRequestsFor, explorerTxUrl, issuerInfo, issuerName } from '../../app/env';
import { personaNameKey, useI18n } from '../../app/i18n';
import { useLace } from '../../app/LaceContext';
import { errorMessage, useAsync } from '../../app/useAsync';
import { useElapsed } from '../../app/useElapsed';
import { ErrorNotice } from '../../components/ErrorNotice';
import { PageError } from '../../components/PageError';
import { ProofBand } from '../../components/ProofBand';
import { SealTable } from '../../components/SealTable';
import { buildSealRows, displayClaimValue } from '../../components/sealRows';
import { STATUS_LABEL, StatusBadge } from '../../components/StatusBadge';
import { detectLace } from '../../providers/lace';
import type { DryRunResult } from '../../providers/dryRun';
import { DEMO_PERSONAS, adoptDemoPersona, loadHolderWallet, proofInputs, type HolderWallet } from '../../state/holderWallet';
import { fetchRequest, receiptOf } from '../../state/ledger';
import { checkLocally, matchingCredential, type LocalReason } from '../../state/localCheck';

const NO_FAILURES: ReadonlySet<string> = new Set();

const isDemoRequest = (requestId: string): boolean =>
  demoRequestsFor()?.pending.some((r) => r.requestId === requestId.toLowerCase()) === true;

const useLaceDetected = (): boolean | null => {
  const [found, setFound] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    void detectLace().then((result) => live && setFound(result));
    return () => {
      live = false;
    };
  }, []);
  return found;
};

export const VerifyPage = () => {
  const { requestId = '' } = useParams();
  const { t, locale } = useI18n();
  const lace = useLace();
  const view = useAsync(() => fetchRequest(requestId), [requestId]);
  const [wallet, setWallet] = useState<HolderWallet | null>(loadHolderWallet());
  const [busy, setBusy] = useState(false);
  const [dryBusy, setDryBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState<DryRunResult | null>(null);
  const hasLace = useLaceDetected();
  const working = busy || dryBusy;
  const elapsed = useElapsed(working);

  const request = view.data ? view.data.request : null;
  const receipt = useMemo(() => (view.data ? receiptOf(view.data, locale) : null), [view.data, locale]);
  const doc = useMemo(() => (wallet && request ? matchingCredential(wallet, request) : null), [wallet, request]);
  const check = useMemo(() => (wallet && doc && request ? checkLocally(wallet, doc, request, locale) : null), [wallet, doc, request, locale]);
  const rows = useMemo(() => {
    if (!request) return [];
    const schema = schemaByIdBytes(request.policy.schemaId);
    const revealed = request.policy.revealSlot.is_some ? schema.claims.find((c) => BigInt(c.slot) === request.policy.revealSlot.value) : undefined;
    const subject = doc === null ? null : doc.credentialSubject;
    return buildSealRows({
      policy: request.policy,
      locale,
      subject,
      failing: check === null ? NO_FAILURES : check.failing,
      revealedValue: revealed && subject ? displayClaimValue(revealed, subject[revealed.key], locale) : null,
    });
  }, [request, doc, check, locale]);

  if (view.loading) return <p className="muted" role="status">{t('verify.loading')}</p>;
  if (view.error || !request || !receipt) return <PageError title={t('verify.error')} message={view.error ?? t('common.noLedgerData')} />;

  const schema = receipt.policy.schema;
  const issuer = issuerName(issuerInfo(bytes32ToLabel(request.policy.issuerId)), locale);
  const holderName = wallet === null ? null : t(personaNameKey(wallet.personaId));

  const pickPersona = (personaId: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (!persona || working) return;
    try {
      setWallet(adoptDemoPersona(persona));
      setDryRun(null);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

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

  // Same transaction as Lace submission, proved here with throwaway keys and never submitted.
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

  const reasonText = (r: LocalReason): string =>
    r.kind === 'condition' ? t('verify.notMetItem', { condition: r.text }) : r.kind === 'expired' ? t('verify.reasonExpired') : t('verify.reasonIssuedAfter');

  const laceButton = (className: string) => (
    <button type="button" className={className} aria-disabled={working} onClick={prove}>
      {busy ? t('verify.laceBusy') : t('verify.lace')}
    </button>
  );
  const dryButton = (className: string) => (
    <button type="button" className={className} aria-disabled={working} onClick={tryWithoutWallet}>
      {dryBusy ? t('verify.dryBusy') : t('verify.dry')}
    </button>
  );

  return (
    <>
      <h1 className="page-title">
        {t('verify.title')} <StatusBadge status={receipt.status} />
      </h1>
      <p className="context">{t('verify.context', { issuer, schema: schemaTitle(schema, locale) })}</p>

      <div className="persona-bar">
        <span>{t('verify.holderFictional')}</span>
        <div className="segmented" role="group" aria-label={t('verify.holder')}>
          {DEMO_PERSONAS.map((p) => (
            <button key={p.id} type="button" aria-pressed={wallet?.personaId === p.id} disabled={working} onClick={() => pickPersona(p.id)}>
              {t(personaNameKey(p.id, 'short'))}
            </button>
          ))}
        </div>
      </div>

      <SealTable
        rows={rows}
        issuerName={issuer}
        holderHeading={holderName === null ? t('seal.holderHeadEmpty') : t('seal.holderHead', { holder: holderName })}
        verifierHeading={t('boundary.holder.learn')}
      />
      <p className="seal-note">{t('boundary.publicNote')}</p>

      {receipt.status !== 'pending' ? (
        <p className="notice">
          {t('verify.closed', { status: t(STATUS_LABEL[receipt.status]) })} <Link to={`/request/${requestId}`}>{t('common.viewReceipt')}</Link>
          {isDemoRequest(requestId) && (
            <>
              {' '}
              <Link to="/demo">{t('verify.anotherDemo')}</Link>
            </>
          )}
        </p>
      ) : wallet === null || holderName === null ? null : doc === null ? (
        <p className="notice error">{t('verify.noCredential', { holder: holderName, issuer, schema: schemaTitle(schema, locale) })}</p>
      ) : check && !check.ok ? (
        <div className="notice error" role="alert">
          <strong>{t('verify.notMet')}</strong> {t('verify.notMetBody')}
          <ul>
            {check.reasons.map((r) => (
              <li key={reasonText(r)}>{reasonText(r)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {/* Without Lace the wallet-free proof is the primary action, first in visual and tab order. */}
          <div className="actions">
            {hasLace === false ? (
              <>
                {dryButton('btn primary')}
                {laceButton('btn quiet')}
              </>
            ) : (
              <>
                {laceButton('btn primary')}
                {dryButton('btn quiet')}
              </>
            )}
          </div>
          <p className="small muted">{hasLace === false ? t('verify.helpNoLace') : t('verify.helpLace')}</p>
          {working && <ProofBand mode={dryBusy ? 'dry' : 'lace'} elapsed={elapsed} />}
        </>
      )}

      {dryRun && (
        <p className="notice ok" role="status">
          {t('verify.dryResult', { seconds: (dryRun.proveMs / 1000).toFixed(1), size: (dryRun.txBytes / 1024).toFixed(1) })}
        </p>
      )}
      {error && <ErrorNotice message={error} />}
      {txHash && (
        <p className="notice ok" role="status">
          {t('verify.accepted')} <a href={explorerTxUrl(txHash)}>{t('common.transaction')}</a>{' '}
          <Link to={`/request/${requestId}`}>{t('common.viewReceipt')}</Link>
        </p>
      )}
    </>
  );
};
