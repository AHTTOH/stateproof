import { useId, type ReactNode } from 'react';

interface FieldProps {
  readonly label: string;
  // Receives the id the label points to, so screen readers announce the control by name.
  readonly children: (id: string) => ReactNode;
}

export const Field = ({ label, children }: FieldProps) => {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
};
