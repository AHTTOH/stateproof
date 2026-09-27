// Display language for the whole app: Korean by default, English on request.
// The choice is a per-viewer convenience kept in localStorage; storage failures only
// mean the choice is not remembered.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
// Subpath import: the full core entry pulls in the contract runtime, which the landing page must not load.
import { isLocale, type Locale } from '@stateproof/core/locale';
import { MESSAGES, type MessageKey } from './messages';

const DEFAULT_LOCALE: Locale = 'ko';
const STORAGE_KEY = 'stateproof.locale';

const readStoredLocale = (): Locale | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored !== null && isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

const storeLocale = (locale: Locale): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Private windows can refuse storage; the language still switches for this visit.
  }
};

type Vars = Readonly<Record<string, string | number>>;

// "{name}" placeholders are replaced from vars; a placeholder without a value is a bug and throws.
const interpolate = (template: string, vars: Vars | undefined): string =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars?.[name];
    if (value === undefined) throw new Error(`Message placeholder {${name}} has no value`);
    return String(value);
  });

interface I18n {
  readonly locale: Locale;
  setLocale(locale: Locale): void;
  t(key: MessageKey, vars?: Vars): string;
}

const I18nContext = createContext<I18n | null>(null);

export const I18nProvider = ({ children }: { readonly children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale() ?? DEFAULT_LOCALE);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = useCallback((next: Locale) => {
    storeLocale(next);
    setLocaleState(next);
  }, []);
  const value = useMemo<I18n>(
    () => ({ locale, setLocale, t: (key, vars) => interpolate(MESSAGES[locale][key], vars) }),
    [locale, setLocale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18n => {
  const context = useContext(I18nContext);
  if (context === null) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};

// Message key for a demo persona's display name; a persona without one is a messages.ts gap.
export const personaNameKey = (personaId: string, form: 'full' | 'short' = 'full'): MessageKey => {
  const key = form === 'full' ? `persona.${personaId}` : `persona.${personaId}.short`;
  if (!(key in MESSAGES.ko)) throw new Error(`No display name for persona ${personaId} in messages.ts`);
  return key as MessageKey;
};
