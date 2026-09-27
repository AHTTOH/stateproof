import { explainError } from '../app/errors';

// Actionable summary on top, the untouched technical message one click away.
export const ErrorNotice = ({ message }: { readonly message: string }) => {
  const { summary, detail } = explainError(message);
  return (
    <div className="notice error" role="alert">
      <div>{summary}</div>
      {detail !== summary && (
        <details className="small">
          <summary>Technical details</summary>
          <pre className="hash">
            {detail}
          </pre>
        </details>
      )}
    </div>
  );
};
