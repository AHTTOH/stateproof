// Home page preview: a real demo request from the ledger, seen with a demo persona's credential,
// drawn as the seal line table. Loaded lazily so the landing page itself stays light.
import { useMemo } from 'react';
import { demoRequestsFor, issuerInfo, issuerName, type DemoRequests } from '../../app/env';
import { personaNameKey, useI18n } from '../../app/i18n';
import { useAsync } from '../../app/useAsync';
import { SealTable } from '../../components/SealTable';
import { buildSealRows, displayClaimValue } from '../../components/sealRows';
import { DEMO_PERSONAS, type HolderWallet } from '../../state/holderWallet';
import { fetchRequest } from '../../state/ledger';
import { checkLocally, matchingCredential } from '../../state/localCheck';
import { bytes32ToLabel, getClaim, schemaByIdBytes } from '@stateproof/core';

const previewConfig = (): DemoRequests => {
  const demo = demoRequestsFor();
  if (demo === null) throw new Error('No demo requests are configured for this network');
  return demo;
};

export const SealPreview = () => {
  const { t, locale } = useI18n();
  const demo = previewConfig();
  const persona = DEMO_PERSONAS.find((p) => p.id === demo.preview.personaId);
  if (!persona) throw new Error(`Preview persona ${demo.preview.personaId} is not in demo-personas.json`);
  const listed = demo.pending.find((r) => r.requestId === demo.preview.requestId);
  if (!listed) throw new Error(`Preview request ${demo.preview.requestId} is not in the pending demo list`);
  const view = useAsync(() => fetchRequest(demo.preview.requestId), [demo.preview.requestId]);

  const content = useMemo(() => {
    if (!view.data) return null;
    const { request } = view.data;
    const wallet: HolderWallet = { personaId: persona.id, holderSecret: persona.holderSecret, credentials: persona.credentials };
    const doc = matchingCredential(wallet, request);
    if (doc === null) throw new Error(`Preview persona has no credential for request ${demo.preview.requestId}`);
    const schema = schemaByIdBytes(request.policy.schemaId);
    const revealedClaim = request.policy.revealSlot.is_some
      ? schema.claims.find((c) => BigInt(c.slot) === request.policy.revealSlot.value)
      : undefined;
    const subject = doc.credentialSubject;
    const revealedValue = revealedClaim ? displayClaimValue(getClaim(schema, revealedClaim.key), subject[revealedClaim.key], locale) : null;
    const rows = buildSealRows({ policy: request.policy, locale, subject, failing: checkLocally(wallet, doc, request, locale).failing, revealedValue });
    return { rows, issuer: issuerName(issuerInfo(bytes32ToLabel(request.policy.issuerId)), locale) };
  }, [view.data, persona, locale, demo.preview.requestId]);

  if (view.error) return <p className="muted small">{t('home.preview.error')}</p>;
  if (content === null) return <div className="preview-skeleton" aria-hidden="true" />;
  const holder = t(personaNameKey(persona.id));
  return (
    <>
      <p className="preview-title">{t('home.preview.title', { holder, request: listed.title[locale] })}</p>
      <SealTable
        rows={content.rows}
        issuerName={content.issuer}
        holderHeading={t('seal.holderHead', { holder })}
        verifierHeading={t('boundary.holder.learn')}
      />
      <p className="seal-note">{t('boundary.publicNote')}</p>
    </>
  );
};
