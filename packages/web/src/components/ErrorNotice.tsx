import { explainError } from '../app/errors';
import { useI18n } from '../app/i18n';

// Actionable summary on top, the untouched technical message one click away.
export const ErrorNotice = ({ message }: { readonly message: string }) => {
  const { t } = useI18n();
  const { key, firstLine, detail } = explainError(message);
  const summary = key === null ? firstLine : t(key);
  return (
    <div className="notice error" role="alert">
      <div>{summary}</div>
      {detail !== summary && (
        <details className="small">
          <summary>{t('error.details')}</summary>
          <pre className="hash">{detail}</pre>
        </details>
      )}
    </div>
  );
};
