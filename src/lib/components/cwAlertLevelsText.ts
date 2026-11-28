/**
 * `CwAlertLevels`' built-in text, one entry per language. The control picks
 * it from its `locale`; its `labels` prop overrides any string. Add a
 * language by adding its entry here (and to CW_LANGUAGES).
 *
 * `{name}` marks where a value goes: `{value}`, `{min}` and `{max}` are
 * numbers with their unit, `{name}`, `{first}` and `{second}` are level
 * names, `{number}` counts levels, `{bands}` is the list of level phrases.
 */
import { cwTextFor, type CwText } from '../i18n/cwLanguage.js';

export interface CwAlertLevelsLabels {
	previewTitle: string;
	/** In place of the scale until a level is complete. */
	previewEmpty: string;
	/** What the scale shows, for screen readers. */
	previewAria: string;
	/** Accessible name of the °C / °F switch. */
	unitLabel: string;

	colorHeader: string;
	nameHeader: string;
	conditionHeader: string;
	valueHeader: string;
	/** Accessible name of a level's colour picker. */
	colorLabel: string;
	namePlaceholder: string;
	/** Accessible names of the two fields of "between". */
	fromLabel: string;
	toLabel: string;
	/** Between the two fields of "between". */
	rangeAnd: string;

	opBelow: string;
	opBelowOrEqual: string;
	opAbove: string;
	opAboveOrEqual: string;
	opBetween: string;
	opEquals: string;

	/** A level as the scale's description reads it. */
	bandBelow: string;
	bandBelowOrEqual: string;
	bandAbove: string;
	bandAboveOrEqual: string;
	bandBetween: string;
	bandEquals: string;

	addLevel: string;
	removeLevel: string;
	/** The name a new level starts with. */
	defaultName: string;
	emptyTitle: string;
	emptyText: string;

	errorName: string;
	errorValue: string;
	errorNumber: string;
	errorRangeOrder: string;
	overlapNote: string;
}

const en: CwAlertLevelsLabels = {
	previewTitle: 'How readings will be marked',
	previewEmpty: 'Fill in a level to see how readings will be marked.',
	previewAria: 'A scale from {min} to {max}. {bands}',
	unitLabel: 'Unit',

	colorHeader: 'Colour',
	nameHeader: 'Name',
	conditionHeader: 'When the reading is',
	valueHeader: 'Value',
	colorLabel: 'Colour of {name}',
	namePlaceholder: 'e.g. Too hot',
	fromLabel: 'From',
	toLabel: 'To',
	rangeAnd: 'and',

	opBelow: 'below',
	opBelowOrEqual: 'at or below',
	opAbove: 'above',
	opAboveOrEqual: 'at or above',
	opBetween: 'between',
	opEquals: 'exactly',

	bandBelow: '{name}: below {value}.',
	bandBelowOrEqual: '{name}: {value} or below.',
	bandAbove: '{name}: above {value}.',
	bandAboveOrEqual: '{name}: {value} or above.',
	bandBetween: '{name}: {min} to {max}.',
	bandEquals: '{name}: exactly {value}.',

	addLevel: 'Add an alert level',
	removeLevel: 'Remove {name}',
	defaultName: 'Level {number}',
	emptyTitle: 'No alert levels yet.',
	emptyText: 'Add one to mark readings in the report.',

	errorName: 'Enter a name.',
	errorValue: 'Enter a value.',
	errorNumber: 'Enter a number.',
	errorRangeOrder: 'Must be higher than the first value.',
	overlapNote: '{first} and {second} overlap: some readings match both.'
};

const ja: CwAlertLevelsLabels = {
	previewTitle: '測定値の色分け',
	previewEmpty: 'レベルを入力すると、色分けのプレビューが表示されます。',
	previewAria: '{min}から{max}までの目盛り。{bands}',
	unitLabel: '単位',

	colorHeader: '色',
	nameHeader: '名前',
	conditionHeader: '測定値の条件',
	valueHeader: '値',
	colorLabel: '{name}の色',
	namePlaceholder: '例：高温',
	fromLabel: '下限',
	toLabel: '上限',
	rangeAnd: '〜',

	opBelow: 'より低い',
	opBelowOrEqual: '以下',
	opAbove: 'より高い',
	opAboveOrEqual: '以上',
	opBetween: '範囲内',
	opEquals: 'ちょうど',

	bandBelow: '{name}：{value}未満。',
	bandBelowOrEqual: '{name}：{value}以下。',
	bandAbove: '{name}：{value}より上。',
	bandAboveOrEqual: '{name}：{value}以上。',
	bandBetween: '{name}：{min}から{max}まで。',
	bandEquals: '{name}：ちょうど{value}。',

	addLevel: 'アラートレベルを追加',
	removeLevel: '{name}を削除',
	defaultName: 'レベル{number}',
	emptyTitle: 'アラートレベルはまだありません。',
	emptyText: '追加すると、レポート内の測定値を色分けできます。',

	errorName: '名前を入力してください。',
	errorValue: '値を入力してください。',
	errorNumber: '数値を入力してください。',
	errorRangeOrder: '下限より大きい値にしてください。',
	overlapNote: '{first}と{second}の範囲が重なっています。両方に当てはまる測定値があります。'
};

/** Every language the alert levels control has text for. */
export const ALERT_LEVELS_TEXT: CwText<CwAlertLevelsLabels> = { en, ja };

/** The control's text for a locale ("ja-JP" → Japanese), English when there is none. */
export function cwAlertLevelsText(locale?: string | null): CwAlertLevelsLabels {
	return cwTextFor(ALERT_LEVELS_TEXT, locale);
}
