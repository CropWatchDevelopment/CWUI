import { describe, expect, it } from 'vitest';
import { cwDliCardText, DLI_CARD_TEXT } from './dliCardText.js';

describe('DLI card text', () => {
	it('has every string in every language', () => {
		const english = Object.keys(DLI_CARD_TEXT.en).sort();
		for (const text of Object.values(DLI_CARD_TEXT)) {
			expect(Object.keys(text ?? {}).sort()).toEqual(english);
		}
	});

	it('is picked from the locale, with English as the fallback', () => {
		expect(cwDliCardText('ja-JP').title).toBe('本日の DLI');
		expect(cwDliCardText('ja-JP').targetForCrop('トマト', '20–30')).toBe('トマト の目標: 20–30');
		expect(cwDliCardText('en-US').outlookNeeded).toBe('Still needed');
		expect(cwDliCardText('ko-KR').title).toBe('DLI Today');
		expect(cwDliCardText().outlookPace('16.4', 'mol/m²/day')).toBe(
			"At today's pace ≈ 16.4 mol/m²/day"
		);
	});
});
