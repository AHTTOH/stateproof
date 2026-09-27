import type { PolicyDescription } from '@stateproof/core';

interface BoundaryProps {
  readonly description: PolicyDescription;
  readonly issuerName: string;
  readonly learnHeading: string;
  readonly sealedHeading: string;
  // The revealed value once a proof is on chain; null before that or when nothing is revealed.
  readonly revealedValue: string | null;
}

// The privacy boundary made literal: what crosses to the verifier vs what stays with the holder.
export const Boundary = ({ description, issuerName, learnHeading, sealedHeading, revealedValue }: BoundaryProps) => (
  <div className="boundary">
    <section className="proven" aria-labelledby="boundary-proven">
      <h2 id="boundary-proven">{learnHeading}</h2>
      <ul>
        {description.conditions.map((c) => (
          <li key={c}>
            <span>{c}</span>
          </li>
        ))}
        <li>
          <span>Signed by {issuerName}</span>
        </li>
        {description.revealed !== null && (
          <li className="revealed">
            <span>
              {revealedValue === null
                ? `The ${description.revealed.toLowerCase()} itself, the one value this request asks to see`
                : `${description.revealed}: ${revealedValue}`}
            </span>
          </li>
        )}
      </ul>
      <p className="small muted">The result and any revealed value are written to the public Midnight ledger.</p>
    </section>
    <section className="sealed" aria-labelledby="boundary-sealed">
      <h2 id="boundary-sealed">{sealedHeading}</h2>
      <ul>
        {description.notDisclosed.map((label) => (
          <li key={label}>
            <span>The exact {label.toLowerCase()}</span>
          </li>
        ))}
        <li>
          <span>The credential itself or its signature</span>
        </li>
      </ul>
    </section>
  </div>
);
