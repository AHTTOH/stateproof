// Scroll-driven story on the home page: a credential in this browser, its values sealed one by one,
// and only the condition crossing to the verifier. The section is sticky; scroll progress (0..1)
// is written to the --p custom property and every motion is computed from it in CSS.
import { useEffect, useRef } from 'react';
import { useI18n } from './i18n';
import type { MessageKey } from './messages';

const STEPS: readonly { readonly title: MessageKey; readonly body: MessageKey }[] = [
  { title: 'story.1.title', body: 'story.1.body' },
  { title: 'story.2.title', body: 'story.2.body' },
  { title: 'story.3.title', body: 'story.3.body' },
  { title: 'story.4.title', body: 'story.4.body' },
];

// Fields of the sample holder's employment credential; sealed ones get a redaction bar in order.
const FIELDS: readonly { readonly label: MessageKey; readonly value: MessageKey; readonly sealed: boolean }[] = [
  { label: 'story.field.name', value: 'story.value.name', sealed: true },
  { label: 'story.field.birth', value: 'story.value.birth', sealed: true },
  { label: 'story.field.start', value: 'story.value.start', sealed: true },
  { label: 'story.field.status', value: 'story.value.status', sealed: false },
  { label: 'story.field.months', value: 'story.value.months', sealed: true },
];

const useScrollProgress = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1');
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 1 : Math.min(Math.max(-rect.top / travel, 0), 1);
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
};

export const ScrollStory = () => {
  const { t } = useI18n();
  const ref = useScrollProgress();
  let sealIndex = 0;
  return (
    <section className="story" ref={ref} aria-label={t('story.label')}>
      <div className="story-stage">
        <ol className="story-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} style={{ ['--i' as string]: i }}>
              <h2>{t(s.title)}</h2>
              <p>{t(s.body)}</p>
            </li>
          ))}
        </ol>
        <div className="story-visual" aria-hidden="true">
          <div className="story-card">
            <div className="story-card-head">
              <span>{t('story.card.title')}</span>
              <span>{t('story.card.issuer')}</span>
            </div>
            <dl>
              {FIELDS.map((f) => {
                const order = f.sealed ? sealIndex++ : -1;
                return (
                  <div key={f.label} className={f.sealed ? 'is-sealed' : 'is-open'} style={{ ['--k' as string]: order }}>
                    <dt>{t(f.label)}</dt>
                    <dd>
                      <span>{t(f.value)}</span>
                      {f.sealed && <i className="story-bar" />}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <div className="story-line" />
          <div className="story-verifier">
            <span className="story-verifier-label">{t('story.verifier')}</span>
            <span className="story-chip">{t('story.chip.status')}</span>
            <span className="story-chip">{t('story.chip.months')}</span>
            <span className="story-stamp">{t('status.verified')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
