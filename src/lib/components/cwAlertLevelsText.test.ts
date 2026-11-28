import { describe, expect, it } from 'vitest';
import { fillRuleText } from './cwRuleCondition.js';
import { ALERT_LEVELS_TEXT, cwAlertLevelsText } from './cwAlertLevelsText.js';

const names = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('alert levels text', () => {
	it('has every string in every language', () => {
		const english = Object.keys(ALERT_LEVELS_TEXT.en).sort();
		for (const text of Object.values(ALERT_LEVELS_TEXT)) {
			expect(Object.keys(text ?? {}).sort()).toEqual(english);
		}
	});

	it('uses the same placeholders in every language, so no value is dropped by a translation', () => {
		for (const [language, text] of Object.entries(ALERT_LEVELS_TEXT)) {
			for (const [key, template] of Object.entries(text ?? {})) {
				expect(names(template), `${language}.${key}`).toEqual(
					names(ALERT_LEVELS_TEXT.en[key as keyof typeof ALERT_LEVELS_TEXT.en])
				);
			}
		}
	});

	it('is picked from the locale, with English as the fallback', () => {
		expect(cwAlertLevelsText('ja-JP').addLevel).toBe('アラートレベルを追加');
		expect(cwAlertLevelsText('en-GB').addLevel).toBe('Add an alert level');
		expect(cwAlertLevelsText('fr').opBetween).toBe('between');
		expect(cwAlertLevelsText().nameHeader).toBe('Name');
	});

	it('reads as text once filled', () => {
		expect(fillRuleText(cwAlertLevelsText('en').bandBetween, { name: 'Ideal', min: '18 °C', max: '26 °C' })).toBe(
			'Ideal: 18 °C to 26 °C.'
		);
		expect(fillRuleText(cwAlertLevelsText('ja').defaultName, { number: '2' })).toBe('レベル2');
	});
});
