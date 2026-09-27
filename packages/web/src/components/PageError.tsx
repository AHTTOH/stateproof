import { Link } from 'react-router-dom';
import { ErrorNotice } from './ErrorNotice';

// A page that could not load its data: say what failed and offer a way back.
export const PageError = ({ title, message }: { readonly title: string; readonly message: string }) => (
  <>
    <h1 className="page-title">{title}</h1>
    <ErrorNotice message={message} />
    <p className="small">
      <Link to="/">Back to the start page</Link>
    </p>
  </>
);
