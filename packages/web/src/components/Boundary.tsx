import type { PolicyDescription } from '@stateproof/core';

interface BoundaryProps {
  readonly description: PolicyDescription;
  readonly verifierLabel: string;
}

// The privacy boundary made literal: what crosses to the verifier vs what stays here.
export const Boundary = ({ description, verifierLabel }: BoundaryProps) => (
  <div className="boundary">
    <section className="proven" aria-labelledby="boundary-proven">
      <h3 id="boundary-proven">{verifierLabel} will learn</h3>
      <ul>
        {description.conditions.map((c) => (
          <li key={c}>
            <span>That {c.charAt(0).toLowerCase() + c.slice(1)}</span>
          </li>
        ))}
        <li>
          <span>That the credential was signed by {description.issuerId}</span>
        </li>
        {description.revealed !== null && (
          <li>
            <span>Your {description.revealed.toLowerCase()} (the one value this request asks to see)</span>
          </li>
        )}
      </ul>
    </section>
    <section className="sealed" aria-labelledby="boundary-sealed">
      <h3 id="boundary-sealed">They will NOT receive</h3>
      <ul>
        {description.notDisclosed.map((label) => (
          <li key={label}>
            <span>Your {label.toLowerCase()}</span>
          </li>
        ))}
        <li>
          <span>The credential itself or its signature</span>
        </li>
      </ul>
    </section>
  </div>
);
