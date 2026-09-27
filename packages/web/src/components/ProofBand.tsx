// The dark strip shown while a proof runs: elapsed seconds, a ruler against the usual range,
// and where the work happens.
import { useI18n } from '../app/i18n';

// Ruler length; proofs usually take 10 to 30 seconds (12 to 15 measured on a laptop).
const RULER_SECONDS = 30;
const RULER_MARKS = [0, 10, 20, 30] as const;
const RING_LENGTH = 2 * Math.PI * 52;

interface ProofBandProps {
  readonly mode: 'dry' | 'lace';
  readonly elapsed: number;
}

export const ProofBand = ({ mode, elapsed }: ProofBandProps) => {
  const { t } = useI18n();
  const fill = Math.min(elapsed / RULER_SECONDS, 1) * 100;
  return (
    <section className="proof-band" aria-live="polite" role="status">
      <div className="proof-ring" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" className="proof-ring-track" />
          <circle cx="60" cy="60" r="52" className="proof-ring-fill" style={{ strokeDashoffset: RING_LENGTH * (1 - fill / 100) }} />
        </svg>
        <div className="proof-band-count">
          {elapsed}
          <small>{t('proof.secondsUnit')}</small>
        </div>
      </div>
      <div>
        <p className="proof-band-stage">{mode === 'dry' ? t('verify.progressDry') : t('verify.progressLace')}</p>
        <div className="ruler" aria-hidden="true">
          <div className="ruler-fill" style={{ width: `${fill}%` }} />
        </div>
        <div className="ruler-scale" aria-hidden="true">
          {RULER_MARKS.map((m) => (
            <span key={m}>{t('verify.seconds', { seconds: m })}</span>
          ))}
        </div>
      </div>
      <dl>
        <div>
          <dt>{t('proof.where')}</dt>
          <dd>{t('proof.whereValue')}</dd>
        </div>
        <div>
          <dt>{t('proof.circuit')}</dt>
          <dd>submitProof</dd>
        </div>
        <div>
          <dt>{t('proof.submit')}</dt>
          <dd>{mode === 'dry' ? t('proof.submitDry') : t('proof.submitLace')}</dd>
        </div>
      </dl>
    </section>
  );
};
