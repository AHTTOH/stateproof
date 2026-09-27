// The privacy boundary as one table: this browser on the left (midnight), the seal line in the
// middle, what the verifier and the public ledger get on the right.
import { useI18n } from '../app/i18n';
import type { MessageKey } from '../app/messages';
import type { SealRow, SealState } from './sealRows';

const TAG: Readonly<Record<SealState, MessageKey>> = {
  proven: 'seal.tag.proven',
  revealed: 'seal.tag.revealed',
  sealed: 'seal.tag.sealed',
  failed: 'seal.tag.failed',
};

interface SealTableProps {
  readonly rows: readonly SealRow[];
  readonly issuerName: string;
  readonly verifierHeading: string;
  // Heading of the holder column; null hides the column (verifier and receipt views).
  readonly holderHeading: string | null;
}

export const SealTable = ({ rows, issuerName, verifierHeading, holderHeading }: SealTableProps) => {
  const { t } = useI18n();
  const signature: SealRow = {
    key: '__signature',
    label: t('seal.signature'),
    holderValue: t('seal.signatureHolder'),
    state: 'proven',
    verifierValue: t('seal.signatureVerifier', { issuer: issuerName }),
  };
  const verifierText = (row: SealRow): string => {
    if (row.verifierValue !== null) return row.verifierValue;
    return row.state === 'revealed' ? t('seal.revealPending') : t('seal.sealedValue');
  };
  return (
    <table className="seal">
      <thead>
        <tr>
          {holderHeading !== null && <th className="seal-holder-head">{holderHeading}</th>}
          <th className="seal-line-head">{t('seal.lineHead')}</th>
          <th>{verifierHeading}</th>
        </tr>
      </thead>
      <tbody>
        {[...rows, signature].map((row) => (
          <tr key={row.key} className={`is-${row.state}`}>
            {holderHeading !== null && (
              <td className="seal-holder">
                <span className="seal-label">{row.label}</span>
                {row.holderValue === null ? (
                  <span className="seal-empty">{t('seal.noHolder')}</span>
                ) : (
                  <span className="seal-value">{row.holderValue}</span>
                )}
              </td>
            )}
            <td className="seal-line">
              <span className="seal-tag">{t(TAG[row.state])}</span>
            </td>
            <td className="seal-verifier">
              <span className="seal-label">{row.label}</span>
              <span className="seal-value">{row.state === 'revealed' && row.verifierValue !== null ? <mark>{row.verifierValue}</mark> : verifierText(row)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
