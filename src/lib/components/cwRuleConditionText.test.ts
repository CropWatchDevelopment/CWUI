import { describe, expect, it } from 'vitest';
import { fillRuleText } from './cwRuleCondition.js';
import { cwRuleConditionText, RULE_CONDITION_TEXT } from './cwRuleConditionText.js';

const names = (template: string) => [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('rule condition text', () => {
	it('has every string in every language', () => {
		const english = Object.keys(RULE_CONDITION_TEXT.en).sort();
		for (const text of Object.values(RULE_CONDITION_TEXT)) {
			expect(Object.keys(text ?? {}).sort()).toEqual(english);
		}
	});

	it('uses the same placeholders in every language, so no value is dropped by a translation', () => {
		for (const [language, text] of Object.entries(RULE_CONDITION_TEXT)) {
			for (const [key, template] of Object.entries(text ?? {})) {
				expect(names(template), `${language}.${key}`).toEqual(
					names(RULE_CONDITION_TEXT.en[key as keyof typeof RULE_CONDITION_TEXT.en])
				);
			}
		}
	});

	it('is picked from the locale, with English as the fallback', () => {
		expect(cwRuleConditionText('ja-JP').resetLabel).toBe('リセット値');
		expect(cwRuleConditionText('en-US').resetLabel).toBe('Reset value');
		expect(cwRuleConditionText('ko-KR').valueLabel).toBe('Alert value');
		expect(cwRuleConditionText().opBelow).toBe('drops below');
	});

	it('reads as a sentence once filled, in both languages', () => {
		const english = cwRuleConditionText('en');
		expect(
			fillRuleText(english.summary, {
				one: english.summaryOne,
				reading: 'Temperature',
				when: fillRuleText(english.whenBelow, { value: '5 °C' }),
				back: fillRuleText(english.backAbove, { value: '7 °C' })
			})
		).toBe(
			'Sends one alert when Temperature drops below 5 °C. Then it stays quiet until the reading is back above 7 °C. After that it can alert again.'
		);

		const japanese = cwRuleConditionText('ja');
		expect(
			fillRuleText(japanese.summary, {
				one: japanese.summaryOne,
				reading: '温度',
				when: fillRuleText(japanese.whenBelow, { value: '5 °C' }),
				back: fillRuleText(japanese.backAbove, { value: '7 °C' })
			})
		).toBe(
			'温度が5 °Cを下回ると、アラートを1回送信します。その後は、測定値が7 °Cを上回るまで通知しません。戻った後は、再びアラートを送信できます。'
		);
	});
});
