import type { RequestStatus } from '@stateproof/core';

const LABELS: Record<RequestStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  expired: 'Expired',
};

export const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <span className={`status ${status}`}>{LABELS[status]}</span>
);
