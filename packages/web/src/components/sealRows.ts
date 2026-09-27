// View model for the seal line table: one row per credential claim, saying what the holder has
// on this side and what crosses to the verifier on the other.
import type { Policy } from '@stateproof/contract';
import {
  claimDisclosures,
  claimUnit,
  claimValueText,
  withUnit,
  type ClaimDefinition,
  type Locale,
} from '@stateproof/core';

export type SealState = 'proven' | 'revealed' | 'sealed' | 'failed';

export interface SealRow {
  readonly key: string;
  readonly label: string;
  // The holder's own value, shown only on the holder side; null when no credential is loaded.
  readonly holderValue: string | null;
  readonly state: SealState;
  // What the verifier gets; null means nothing (sealed) or a requested value not known yet.
  readonly verifierValue: string | null;
}

type Subject = Readonly<Record<string, string | number>>;

export const displayClaimValue = (claim: ClaimDefinition, raw: string | number, locale: Locale): string =>
  withUnit(claimValueText(claim, String(raw), locale), claimUnit(claim, locale), locale);

const holderValueOf = (claim: ClaimDefinition, subject: Subject | null, locale: Locale): string | null => {
  if (subject === null) return null;
  const raw = subject[claim.key];
  if (raw === undefined) throw new Error(`Credential has no value for ${claim.key}`);
  return displayClaimValue(claim, raw, locale);
};

export interface SealInputs {
  readonly policy: Policy;
  readonly locale: Locale;
  readonly subject: Subject | null;
  // Claim keys whose conditions fail for the loaded credential.
  readonly failing: ReadonlySet<string>;
  // Display text of the revealed value: the holder's own value before a proof, the chain value on a receipt.
  readonly revealedValue: string | null;
}

export const buildSealRows = ({ policy, locale, subject, failing, revealedValue }: SealInputs): readonly SealRow[] =>
  claimDisclosures(policy, locale).map((d) => {
    const base = { key: d.claim.key, label: d.label, holderValue: holderValueOf(d.claim, subject, locale) };
    if (d.revealed) return { ...base, state: 'revealed', verifierValue: revealedValue };
    if (d.conditions.length > 0) {
      const state: SealState = failing.has(d.claim.key) ? 'failed' : d.pinned ? 'revealed' : 'proven';
      return { ...base, state, verifierValue: d.conditions.join(', ') };
    }
    return { ...base, state: 'sealed', verifierValue: null };
  });
