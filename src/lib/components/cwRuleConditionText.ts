/**
 * `CwRuleCondition`'s built-in text, one entry per language. The control
 * picks it from its `locale`; its `labels` prop overrides any string. Add a
 * language by adding its entry here (and to CW_LANGUAGES).
 *
 * `{name}` marks where a value goes: `{value}` and `{reset}` are numbers with
 * their unit ("5 °C"), `{reading}` is the reading's name, `{when}` and
 * `{back}` are the phrases below, `{gap}` is the suggested distance.
 */
import { cwTextFor, type CwText } from '../i18n/cwLanguage.js';

export interface CwRuleConditionLabels {
	/** Label of the "drops below / rises above" picker. */
	conditionLabel: string;
	conditionPlaceholder: string;
	valueLabel: string;
	valuePlaceholder: string;
	resetLabel: string;
	resetPlaceholder: string;
	/** Placeholder of the reset field while it will be filled in from the alert value. */
	resetPlaceholderAuto: string;
	/** Tooltip of the help mark on the reset label. */
	resetHelp: string;
	/** The help mark's accessible name: "Help: … (opens in a new tab)". */
	helpName: string;
	helpNewTab: string;
	/** Accessible name of the °C / °F switch. */
	unitLabel: string;

	opBelow: string;
	opBelowOrEqual: string;
	opAbove: string;
	opAboveOrEqual: string;
	opEquals: string;

	/** Under the reset field while it holds the suggested value. */
	suggestedAbove: string;
	suggestedBelow: string;
	/** The button that puts the suggested reset in. */
	useSuggested: string;

	/** The sentence that says what the rule will do. */
	summary: string;
	/** The same for "is exactly", which has no reset value. */
	summaryExact: string;
	/** In place of the sentence until the limits are complete. */
	summaryEmpty: string;
	/** `{one}` in the sentence, set in bold. */
	summaryOne: string;
	/** `{reading}` when the reading has no name. */
	summaryReading: string;
	/** Between the `{when}` phrases of two limits. */
	summaryOr: string;
	/** Between the `{back}` phrases of two limits. */
	summaryAnd: string;
	whenBelow: string;
	whenBelowOrEqual: string;
	whenAbove: string;
	whenAboveOrEqual: string;
	whenEquals: string;
	backAbove: string;
	backAtOrAbove: string;
	backBelow: string;
	backAtOrBelow: string;

	exampleTitle: string;
	exampleNote: string;
	exampleAlertLine: string;
	exampleResetLine: string;
	exampleZone: string;
	exampleTime: string;
	/** What the chart shows, for screen readers. */
	exampleAria: string;
	stepAlertBelow: string;
	stepAlertBelowOrEqual: string;
	stepAlertAbove: string;
	stepAlertAboveOrEqual: string;
	stepAlertText: string;
	stepHover: string;
	stepHoverText: string;
	stepResetAbove: string;
	stepResetAtOrAbove: string;
	stepResetBelow: string;
	stepResetAtOrBelow: string;
	stepResetText: string;
	/** The fourth step: `{title}` is the first step's title. */
	stepAgain: string;
	stepAgainText: string;

	/** Between two limits on one reading. */
	orLabel: string;
	orHint: string;
	addLimit: string;
	addLimitHint: string;
	removeLimit: string;

	errorCondition: string;
	errorValueMissing: string;
	errorResetMissing: string;
	errorNumber: string;
	/** Under the reset field when it is on the alert side. */
	errorResetMustBeAbove: string;
	errorResetMustBeBelow: string;
	/** The full explanation of the same mistake. */
	errorResetWrongSideBelow: string;
	errorResetWrongSideAbove: string;
	errorOverlap: string;
	errorNeverResets: string;
}

const en: CwRuleConditionLabels = {
	conditionLabel: 'Alert when it',
	conditionPlaceholder: 'Choose…',
	valueLabel: 'Alert value',
	valuePlaceholder: 'e.g. 5',
	resetLabel: 'Reset value',
	resetPlaceholder: 'e.g. 7',
	resetPlaceholderAuto: 'Filled in for you',
	resetHelp: 'Why a reset is needed',
	helpName: 'Help',
	helpNewTab: 'opens in a new tab',
	unitLabel: 'Unit',

	opBelow: 'drops below',
	opBelowOrEqual: 'drops to or below',
	opAbove: 'rises above',
	opAboveOrEqual: 'rises to or above',
	opEquals: 'is exactly',

	suggestedAbove: 'Suggested: {gap} above the alert value',
	suggestedBelow: 'Suggested: {gap} below the alert value',
	useSuggested: 'Use {value}',

	summary:
		'Sends {one} when {reading} {when}. Then it stays quiet until the reading is {back}. After that it can alert again.',
	summaryExact:
		'Sends {one} when {reading} {when}. It can alert again once the reading has been a different value.',
	summaryEmpty: 'Fill in the values to see what the rule will do.',
	summaryOne: 'one alert',
	summaryReading: 'the reading',
	summaryOr: ' or ',
	summaryAnd: ' and ',
	whenBelow: 'drops below {value}',
	whenBelowOrEqual: 'drops to {value} or below',
	whenAbove: 'rises above {value}',
	whenAboveOrEqual: 'rises to {value} or above',
	whenEquals: 'is exactly {value}',
	backAbove: 'back above {value}',
	backAtOrAbove: 'back at {value} or above',
	backBelow: 'back below {value}',
	backAtOrBelow: 'back at {value} or below',

	exampleTitle: 'Example: what this rule does',
	exampleNote: 'Sample readings',
	exampleAlertLine: 'Alert value',
	exampleResetLine: 'Reset value',
	exampleZone: 'Alert zone',
	exampleTime: 'Time',
	exampleAria:
		'Example readings over time. The reading {when} and one alert is sent. It moves around the alert value without a new alert. Once it is {back} the rule resets. Later the reading {when} again and a new alert is sent.',
	stepAlertBelow: 'Drops below {value}',
	stepAlertBelowOrEqual: 'Drops to {value} or below',
	stepAlertAbove: 'Rises above {value}',
	stepAlertAboveOrEqual: 'Rises to {value} or above',
	stepAlertText: 'One alert is sent.',
	stepHover: 'Hovers around {value}',
	stepHoverText: 'Nothing more is sent. It has not reached {reset} yet.',
	stepResetAbove: 'Back above {value}',
	stepResetAtOrAbove: 'Back at {value} or above',
	stepResetBelow: 'Back below {value}',
	stepResetAtOrBelow: 'Back at {value} or below',
	stepResetText: "The rule resets. No message is sent; the rule's history records it.",
	stepAgain: '{title} again',
	stepAgainText: 'A new alert is sent.',

	orLabel: 'OR',
	orHint: 'Either one sends the alert',
	addLimit: 'Add a second limit for this reading',
	addLimitHint: 'For example too cold or too hot.',
	removeLimit: 'Remove this limit',

	errorCondition: 'Choose when it should alert.',
	errorValueMissing: 'Enter an alert value.',
	errorResetMissing: 'Enter a reset value.',
	errorNumber: 'Enter a number.',
	errorResetMustBeAbove: 'Must be above {value}.',
	errorResetMustBeBelow: 'Must be below {value}.',
	errorResetWrongSideBelow:
		'{reset} is inside the alert zone. The reset value must be above {value}, or the rule would alert again on every reading.',
	errorResetWrongSideAbove:
		'{reset} is inside the alert zone. The reset value must be below {value}, or the rule would alert again on every reading.',
	errorOverlap:
		'This limit overlaps the one before it: some readings would match both. Change one of the values.',
	errorNeverResets:
		"With this reset value the rule could never reset: it lies inside the other limit's alert zone."
};

const ja: CwRuleConditionLabels = {
	conditionLabel: 'アラートの条件',
	conditionPlaceholder: '選択…',
	valueLabel: 'しきい値',
	valuePlaceholder: '例：5',
	resetLabel: 'リセット値',
	resetPlaceholder: '例：7',
	resetPlaceholderAuto: '自動で入力されます',
	resetHelp: 'リセットが必要な理由',
	helpName: 'ヘルプ',
	helpNewTab: '新しいタブで開きます',
	unitLabel: '単位',

	opBelow: '下回ったとき',
	opBelowOrEqual: '以下になったとき',
	opAbove: '上回ったとき',
	opAboveOrEqual: '以上になったとき',
	opEquals: 'ちょうど同じ値のとき',

	suggestedAbove: 'おすすめ：しきい値より{gap}高い値',
	suggestedBelow: 'おすすめ：しきい値より{gap}低い値',
	useSuggested: '{value}にする',

	summary:
		'{reading}が{when}と、{one}します。その後は、測定値が{back}まで通知しません。戻った後は、再びアラートを送信できます。',
	summaryExact:
		'{reading}が{when}と、{one}します。測定値が別の値になった後は、再びアラートを送信できます。',
	summaryEmpty: '値を入力すると、ルールの動きが表示されます。',
	summaryOne: 'アラートを1回送信',
	summaryReading: '測定値',
	summaryOr: 'か、',
	summaryAnd: '、かつ',
	whenBelow: '{value}を下回る',
	whenBelowOrEqual: '{value}以下になる',
	whenAbove: '{value}を上回る',
	whenAboveOrEqual: '{value}以上になる',
	whenEquals: 'ちょうど{value}になる',
	backAbove: '{value}を上回る',
	backAtOrAbove: '{value}以上に戻る',
	backBelow: '{value}を下回る',
	backAtOrBelow: '{value}以下に戻る',

	exampleTitle: '例：このルールの動き',
	exampleNote: 'サンプルの測定値',
	exampleAlertLine: 'しきい値',
	exampleResetLine: 'リセット値',
	exampleZone: 'アラート範囲',
	exampleTime: '時間',
	exampleAria:
		'時間ごとの測定値の例。測定値が{when}とアラートを1回送信します。しきい値の近くで上下しても、新しいアラートは送信されません。測定値が{back}とルールがリセットされます。その後、測定値がふたたび{when}と新しいアラートを送信します。',
	stepAlertBelow: '{value}を下回る',
	stepAlertBelowOrEqual: '{value}以下になる',
	stepAlertAbove: '{value}を上回る',
	stepAlertAboveOrEqual: '{value}以上になる',
	stepAlertText: 'アラートを1回送信します。',
	stepHover: '{value}の前後で上下する',
	stepHoverText: '追加の通知はありません。まだ{reset}に達していません。',
	stepResetAbove: '{value}を上回る',
	stepResetAtOrAbove: '{value}以上に戻る',
	stepResetBelow: '{value}を下回る',
	stepResetAtOrBelow: '{value}以下に戻る',
	stepResetText: 'ルールがリセットされます。通知は送信されず、ルールの履歴に記録されます。',
	stepAgain: 'ふたたび{title}',
	stepAgainText: '新しいアラートを送信します。',

	orLabel: 'または',
	orHint: 'どちらかに当てはまるとアラートを送信します',
	addLimit: 'このデータ項目に2つ目のしきい値を追加',
	addLimitHint: '例：低すぎる場合と高すぎる場合の両方。',
	removeLimit: 'このしきい値を削除',

	errorCondition: 'アラートの条件を選択してください。',
	errorValueMissing: 'しきい値を入力してください。',
	errorResetMissing: 'リセット値を入力してください。',
	errorNumber: '数値を入力してください。',
	errorResetMustBeAbove: '{value}より高い値にしてください。',
	errorResetMustBeBelow: '{value}より低い値にしてください。',
	errorResetWrongSideBelow:
		'{reset}はアラート範囲の中です。リセット値は{value}より高い値にしてください。このままでは、測定のたびにアラートが送信されます。',
	errorResetWrongSideAbove:
		'{reset}はアラート範囲の中です。リセット値は{value}より低い値にしてください。このままでは、測定のたびにアラートが送信されます。',
	errorOverlap:
		'このしきい値は、前のしきい値と範囲が重なっています。どちらかの値を変更してください。',
	errorNeverResets:
		'このリセット値ではルールがリセットされません。もう一方のしきい値のアラート範囲に入っています。'
};

/** Every language the rule condition control has text for. */
export const RULE_CONDITION_TEXT: CwText<CwRuleConditionLabels> = { en, ja };

/** The control's text for a locale ("ja-JP" → Japanese), English when there is none. */
export function cwRuleConditionText(locale?: string | null): CwRuleConditionLabels {
	return cwTextFor(RULE_CONDITION_TEXT, locale);
}
