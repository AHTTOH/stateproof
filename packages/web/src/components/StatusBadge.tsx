import type { RequestStatus } from '@stateproof/core';
import { useI18n } from '../app/i18n';
import type { MessageKey } from '../app/messages';

export const STATUS_LABEL: Readonly<Record<RequestStatus, MessageKey>> = {
  verified: 'status.verified',
  pending: 'status.pending',
  expired: 'status.expired',
};

export const StatusBadge = ({ status }: { readonly status: RequestStatus }) => {
  const { t } = useI18n();
  return <span className={`status ${status}`}>{t(STATUS_LABEL[status])}</span>;
};
