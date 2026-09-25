import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly loading: boolean;
  reload(): void;
}

export const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export const useAsync = <T,>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.resolve().then(load).then(
      (value) => alive && (setData(value), setLoading(false)),
      (e: unknown) => alive && (setError(errorMessage(e)), setLoading(false)),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, error, loading, reload };
};
