import { describe, expect, it } from 'vitest';
import { cwLanguageFor, cwTextFor } from './cwLanguage.js';

describe('cwLanguageFor', () => {
	it('takes the language from a BCP 47 locale', () => {
		expect(cwLanguageFor('ja-JP')).toBe('ja');
		expect(cwLanguageFor('JA')).toBe('ja');
		expect(cwLanguageFor('ja_JP')).toBe('ja');
		expect(cwLanguageFor(' en-US ')).toBe('en');
	});

	it('falls back to English when the locale is unset or has no text', () => {
		expect(cwLanguageFor(undefined)).toBe('en');
		expect(cwLanguageFor(null)).toBe('en');
		expect(cwLanguageFor('')).toBe('en');
		expect(cwLanguageFor('de-DE')).toBe('en');
	});
});

describe('cwTextFor', () => {
	it("picks the locale's text, and English for a language not translated yet", () => {
		const text = { en: 'Hello', ja: 'こんにちは' };
		expect(cwTextFor(text, 'ja-JP')).toBe('こんにちは');
		expect(cwTextFor(text, 'fr')).toBe('Hello');
		expect(cwTextFor({ en: 'Only English' }, 'ja')).toBe('Only English');
	});
});
