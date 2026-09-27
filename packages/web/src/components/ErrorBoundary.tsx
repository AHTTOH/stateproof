import { Component, type ErrorInfo, type ReactNode } from 'react';
import { PageError } from './PageError';
import { useI18n } from '../app/i18n';

const Crash = ({ message }: { readonly message: string }) => {
  const { t } = useI18n();
  return <PageError title={t('crash.title')} message={message} />;
};

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

// Keeps a failure inside one page: the masthead and navigation stay usable.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('StateProof page error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error === null) return this.props.children;
    return <Crash message={this.state.error.message} />;
  }
}
