/**
 * `CwDliCard`'s built-in text, one entry per language. The card picks it from
 * its `locale`; its `labels` prop overrides any string. Add a language by
 * adding its entry here (and to CW_LANGUAGES).
 */
import { cwTextFor, type CwText } from '../i18n/cwLanguage.js';
import type { DliCardLabels } from './DliCard.svelte';

const en: Required<DliCardLabels> = {
	title: 'DLI Today',
	statusVeryLow: 'Very low',
	statusSlightlyLow: 'Slightly low',
	statusLow: 'Low',
	statusGood: 'Good',
	statusHigh: 'High',
	statusVeryHigh: 'Very high',
	statusPrefix: 'Status:',
	historyTitle: 'Daily history',
	historyListLabel: 'Daily DLI history',
	historyCount: (days) => `${days} days`,
	targetForCrop: (cropName, range) => `Target for ${cropName}: ${range}`,
	target: (range) => `Target: ${range}`,
	targetExpected: (target, expected) => `${target} · ${expected} expected by now`,
	valueAriaLabel: (value, unit, targetText, status) =>
		`DLI today ${value} ${unit}. ${targetText}. Status: ${status}.`,
	barAriaLabel: (scaleMax, value, unit, range, status) =>
		`DLI range bar from 0 to ${scaleMax} ${unit}. Current value ${value} ${unit}. Target range ${range}. Status: ${status}.`,
	outlookNeeded: 'Still needed',
	outlookRoom: 'Room left',
	outlookOver: 'Over target',
	outlookBehind: 'Falling short',
	outlookOnTrack: 'On track',
	outlookReached: 'Target reached',
	outlookAbove: 'Above target',
	outlookLightLeftUntil: (share, time) => `${share} of the light left · sunset ${time}`,
	outlookLightLeftUntilAssumed: (share, time) =>
		`${share} of the light left · day assumed to end ${time}`,
	outlookLightLeft: (share) => `${share} of the light left`,
	outlookPace: (value, unit) => `At today's pace ≈ ${value} ${unit}`,
	outlookAssumedHint:
		'The light times are assumed: the location has no coordinates. Set its latitude and longitude for real sunrise and sunset.'
};

const ja: Required<DliCardLabels> = {
	title: '本日の DLI',
	statusVeryLow: '非常に低い',
	statusSlightlyLow: 'やや低い',
	statusLow: '低い',
	statusGood: '良好',
	statusHigh: '高い',
	statusVeryHigh: '非常に高い',
	statusPrefix: 'ステータス:',
	historyTitle: '日別履歴',
	historyListLabel: '日別 DLI 履歴',
	historyCount: (days) => `${days} 日`,
	targetForCrop: (cropName, range) => `${cropName} の目標: ${range}`,
	target: (range) => `目標: ${range}`,
	targetExpected: (target, expected) => `${target} · 現時点の目安 ${expected}`,
	valueAriaLabel: (value, unit, targetText, status) =>
		`本日の DLI ${value} ${unit}。${targetText}。ステータス: ${status}。`,
	barAriaLabel: (scaleMax, value, unit, range, status) =>
		`DLI 範囲バー 0〜${scaleMax} ${unit}。現在値 ${value} ${unit}。目標範囲 ${range}。ステータス: ${status}。`,
	outlookNeeded: 'あと必要',
	outlookRoom: '目標内の残り',
	outlookOver: '目標超過分',
	outlookBehind: '不足見込み',
	outlookOnTrack: '達成見込み',
	outlookReached: '目標達成',
	outlookAbove: '目標超過',
	outlookLightLeftUntil: (share, time) => `残りの日照 ${share} · 日没 ${time}`,
	outlookLightLeftUntilAssumed: (share, time) => `残りの日照 ${share} · ${time} 終了と仮定`,
	outlookLightLeft: (share) => `残りの日照 ${share}`,
	outlookPace: (value, unit) => `このペースで約 ${value} ${unit}`,
	outlookAssumedHint:
		'日照時間は仮定です（ロケーションの緯度・経度が未設定）。緯度・経度を設定すると、実際の日の出・日の入りで計算します。'
};

/** Every language the DLI card has text for. */
export const DLI_CARD_TEXT: CwText<Required<DliCardLabels>> = { en, ja };

/** The DLI card's text for a locale ("ja-JP" → Japanese), English when there is none. */
export function cwDliCardText(locale?: string | null): Required<DliCardLabels> {
	return cwTextFor(DLI_CARD_TEXT, locale);
}
