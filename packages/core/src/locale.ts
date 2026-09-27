// Display languages. English text is the top-level label/unit/code names in the schema
// JSON and config; every other locale is stored under an explicit i18n entry.
export const LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type TranslatedLocale = Exclude<Locale, 'en'>;
export const TRANSLATED_LOCALES: readonly TranslatedLocale[] = ['ko'];

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);
