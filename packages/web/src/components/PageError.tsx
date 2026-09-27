import { Link } from 'react-router-dom';
import { useI18n } from '../app/i18n';
import { ErrorNotice } from './ErrorNotice';

// A page that could not load its data: say what failed and offer a way back.
export const PageError = ({ title, message }: { readonly title: string; readonly message: string }) => {
  const { t } = useI18n();
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <ErrorNotice message={message} />
      <p className="small">
        <Link to="/">{t('common.toStart')}</Link>
      </p>
    </>
  );
};
