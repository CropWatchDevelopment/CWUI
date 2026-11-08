/**
 * Built-in component text. A component with built-in text keeps one entry per
 * language and picks it from its `locale` prop; its `labels` prop still
 * overrides any string. English is the fallback for a missing language, so a
 * language can be added here and to components one at a time.
 */

/** Languages CWUI components can ship text for. */
export const CW_LANGUAGES = ['en', 'ja'] as const;

export type CwLanguage = (typeof CW_LANGUAGES)[number];

/** Used when the locale is unset or its language has no text. */
export const CW_DEFAULT_LANGUAGE: CwLanguage = 'en';

/** A component's text: English always, other languages as they are translated. */
export type CwText<T> = { en: T } & Partial<Record<CwLanguage, T>>;

/** The CWUI language of a BCP 47 locale ("ja-JP" → "ja"); English when unset or unknown. */
export function cwLanguageFor(locale?: string | null): CwLanguage {
	const language = locale?.trim().toLowerCase().split(/[-_]/)[0] ?? '';
	return (CW_LANGUAGES as readonly string[]).includes(language)
		? (language as CwLanguage)
		: CW_DEFAULT_LANGUAGE;
}

/** A component's text for a locale, falling back to English. */
export function cwTextFor<T>(text: CwText<T>, locale?: string | null): T {
	return text[cwLanguageFor(locale)] ?? text.en;
}
