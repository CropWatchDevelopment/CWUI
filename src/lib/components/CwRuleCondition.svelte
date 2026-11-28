<script lang="ts">
	/**
	 * One condition of an alert rule: when a reading should set off the alert,
	 * and the reset value it has to come back past before the rule can alert
	 * again. It says in a sentence what the rule will do, draws an example, and
	 * keeps the reset on the safe side of the limit.
	 *
	 * The value is a `CwAlertPointsValue`, as CwAlertPointsEditor uses: one
	 * point per limit, numbers as text, temperatures stored in °C.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type {
		CwAlertPointCondition,
		CwAlertPointRule,
		CwAlertPointsValue
	} from '../types/index.js';
	import CwButton from './CwButton.svelte';
	import CwDropdown from './CwDropdown.svelte';
	import CwHelp from './CwHelp.svelte';
	import CwInput from './CwInput.svelte';
	import RuleExample from './alert-points/RuleExample.svelte';
	import {
		CW_RULE_CONDITIONS,
		fillRuleTemplate,
		fillRuleText,
		oppositeRuleCondition,
		parseRuleNumber,
		ruleDirection,
		ruleLimitProblems,
		ruleNumberText,
		ruleTextToDisplay,
		ruleTextToStorage,
		ruleUnitOf,
		ruleValueToDisplay,
		suggestedRuleReset,
		type CwRuleProblemKind,
		type CwRuleTextPart,
		type CwRuleUnit
	} from './cwRuleCondition.js';
	import { cwRuleConditionText, type CwRuleConditionLabels } from './cwRuleConditionText.js';

	type Field = 'value' | 'reset';
	type DirectionalCondition = Exclude<CwAlertPointCondition, 'equals' | 'range'>;

	interface Props {
		value?: CwAlertPointsValue;
		onchange?: (value: CwAlertPointsValue) => void;
		/** The reading's name as the sentence uses it ("Temperature"). */
		readingName?: string;
		/** The control that picks the reading. Shown as the first field. */
		reading?: Snippet;
		/**
		 * A temperature gets the °C / °F switch and a suggested reset. Any other
		 * reading shows `unit` and is stored exactly as typed.
		 */
		temperature?: boolean;
		/** The unit of a reading that is not a temperature ("%", "ppm", "cm"). */
		unit?: string;
		/**
		 * How far past the alert value the suggested reset sits, in the unit
		 * shown. Left out: 2 (°C) or 4 (°F) for a temperature, no suggestion for
		 * other readings. `null` never suggests.
		 */
		suggestedGap?: number | null;
		/** The article that explains resets. With it, "Reset value" carries a help mark. */
		helpHref?: string;
		/** Draw the example under the fields. */
		example?: boolean;
		/** BCP 47 locale: picks the built-in text (English, Japanese) and the number format. */
		locale?: string;
		/** Override any built-in string. */
		labels?: Partial<CwRuleConditionLabels>;
		/** Prefix of the field ids. */
		id?: string;
		class?: string;
	}

	let {
		value = $bindable({ unit: 'C', center: '0', points: [] }),
		onchange,
		readingName,
		reading,
		temperature = true,
		unit = '',
		suggestedGap,
		helpHref,
		example = true,
		locale,
		labels = {},
		id,
		class: className = ''
	}: Props = $props();

	const WHEN = {
		lessThan: 'whenBelow',
		lessThanOrEqual: 'whenBelowOrEqual',
		greaterThan: 'whenAbove',
		greaterThanOrEqual: 'whenAboveOrEqual',
		equals: 'whenEquals'
	} as const;
	const BACK = {
		lessThan: 'backAbove',
		lessThanOrEqual: 'backAtOrAbove',
		greaterThan: 'backBelow',
		greaterThanOrEqual: 'backAtOrBelow'
	} as const;
	const STEP_ALERT = {
		lessThan: 'stepAlertBelow',
		lessThanOrEqual: 'stepAlertBelowOrEqual',
		greaterThan: 'stepAlertAbove',
		greaterThanOrEqual: 'stepAlertAboveOrEqual'
	} as const;
	const STEP_RESET = {
		lessThan: 'stepResetAbove',
		lessThanOrEqual: 'stepResetAtOrAbove',
		greaterThan: 'stepResetBelow',
		greaterThanOrEqual: 'stepResetAtOrBelow'
	} as const;
	const OPTION = {
		lessThan: 'opBelow',
		lessThanOrEqual: 'opBelowOrEqual',
		greaterThan: 'opAbove',
		greaterThanOrEqual: 'opAboveOrEqual',
		equals: 'opEquals'
	} as const;
	const UNITS: CwRuleUnit[] = ['C', 'F'];

	const uid = $props.id();
	const baseId = $derived(id ?? uid);
	const l = $derived({ ...cwRuleConditionText(locale), ...labels });
	const numberFormat = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }));

	/** The unit temperatures are typed in. A choice for the eyes only: values are stored in °C. */
	let shownUnit = $state<CwRuleUnit>(untrack(() => ruleUnitOf(value.unit)));
	const typedUnit = $derived<CwRuleUnit>(temperature ? shownUnit : 'C');
	const unitText = $derived(temperature ? `°${shownUnit}` : unit.trim());
	const gap = $derived(
		suggestedGap !== undefined ? suggestedGap : temperature ? (shownUnit === 'F' ? 4 : 2) : null
	);

	/** What is in a field while it is being typed in ("-", "3."), by `id:field`. */
	let drafts = $state<Record<string, string>>({});
	/** Fields the user has left: only those complain about being empty. */
	let touched = $state<Record<string, boolean>>({});
	/** Whether a limit's reset still follows the suggestion, by point id. */
	const followsSuggestion = new Map<string, boolean>();

	const points = $derived(value.points);
	const problems = $derived(ruleLimitProblems(points));
	const complete = $derived(points.length > 0 && problems.every((own) => own.length === 0));
	/** Something is still to be typed (as opposed to typed wrongly). */
	const unfinished = $derived(
		points.length === 0 ||
			problems.some((own) =>
				own.some((problem) =>
					['valueMissing', 'valueInvalid', 'resetMissing', 'resetInvalid', 'unsupported'].includes(
						problem.kind
					)
				)
			)
	);
	const conditionOptions = $derived(
		CW_RULE_CONDITIONS.map((condition) => ({ label: l[OPTION[condition]], value: condition }))
	);

	const key = (point: CwAlertPointRule, field: Field) => `${point.id}:${field}`;

	/** The text in a field: what is being typed, else the stored value in the shown unit. */
	const shown = (point: CwAlertPointRule, field: Field) =>
		drafts[key(point, field)] ?? ruleTextToDisplay(point[field], typedUnit);

	function shownNumber(point: CwAlertPointRule, field: Field): number | null {
		const stored = parseRuleNumber(point[field]);
		if (stored === null) return null;
		return Number(ruleNumberText(ruleValueToDisplay(stored, typedUnit), 4));
	}

	/** A number with the unit, as the sentences say it: "5 °C", "80%", "1,000 ppm". */
	function withUnit(amount: number): string {
		const formatted = numberFormat.format(amount);
		if (!unitText) return formatted;
		return unitText === '%' ? `${formatted}%` : `${formatted} ${unitText}`;
	}

	function follows(point: CwAlertPointRule): boolean {
		if (!followsSuggestion.has(point.id)) {
			// A limit that arrives with a reset keeps it; an empty one gets the suggestion.
			followsSuggestion.set(point.id, !(point.reset ?? '').trim());
		}
		return followsSuggestion.get(point.id) === true;
	}

	/** The suggested reset for a limit, in the shown unit. */
	function suggestionFor(point: CwAlertPointRule): number | null {
		const amount = shownNumber(point, 'value');
		return gap === null || amount === null
			? null
			: suggestedRuleReset(point.condition, amount, gap);
	}

	function holdsSuggestion(point: CwAlertPointRule): boolean {
		const reset = shownNumber(point, 'reset');
		const suggestion = suggestionFor(point);
		return reset !== null && suggestion !== null && Math.abs(reset - suggestion) < 1e-6;
	}

	/** The stored reset to suggest for what is typed as the alert value. */
	function suggestedStored(condition: CwAlertPointCondition, typedValue: string): string {
		const amount = parseRuleNumber(typedValue);
		const suggestion =
			gap === null || amount === null ? null : suggestedRuleReset(condition, amount, gap);
		return suggestion === null ? '' : ruleTextToStorage(ruleNumberText(suggestion), typedUnit);
	}

	function commit(next: CwAlertPointRule[]) {
		value = { ...value, unit: 'C', points: next };
		onchange?.(value);
	}

	function patch(point: CwAlertPointRule, change: Partial<CwAlertPointRule>) {
		commit(points.map((other) => (other.id === point.id ? { ...other, ...change } : other)));
	}

	function typeValue(point: CwAlertPointRule, typed: string) {
		drafts[key(point, 'value')] = typed;
		const change: Partial<CwAlertPointRule> = { value: ruleTextToStorage(typed, typedUnit) };
		if (ruleDirection(point.condition) === 'exact') {
			// "Is exactly" has no reset of its own: the stored one mirrors the value.
			change.reset = change.value;
		} else if (gap !== null && follows(point)) {
			change.reset = suggestedStored(point.condition, typed);
			delete drafts[key(point, 'reset')];
		}
		patch(point, change);
	}

	function typeReset(point: CwAlertPointRule, typed: string) {
		drafts[key(point, 'reset')] = typed;
		followsSuggestion.set(point.id, false);
		patch(point, { reset: ruleTextToStorage(typed, typedUnit) });
	}

	function leave(point: CwAlertPointRule, field: Field) {
		delete drafts[key(point, field)];
		touched[key(point, field)] = true;
	}

	function chooseCondition(point: CwAlertPointRule, condition: CwAlertPointCondition) {
		const change: Partial<CwAlertPointRule> = { condition };
		if (ruleDirection(condition) === 'exact') {
			change.reset = point.value;
			followsSuggestion.set(point.id, true);
		} else if (gap !== null && follows(point)) {
			change.reset = suggestedStored(condition, shown(point, 'value'));
		}
		delete drafts[key(point, 'reset')];
		patch(point, change);
	}

	function useSuggestion(point: CwAlertPointRule) {
		followsSuggestion.set(point.id, true);
		delete drafts[key(point, 'reset')];
		patch(point, { reset: suggestedStored(point.condition, shown(point, 'value')) });
	}

	function chooseUnit(next: CwRuleUnit) {
		if (next === shownUnit) return;
		shownUnit = next;
		// The same stored values, typed again in the new unit.
		drafts = {};
		// A reset that follows the suggestion follows it in the new unit too
		// (2 °C or 4 °F past the limit), so it stays a round number.
		if (gap === null) return;
		const following = points.filter(
			(point) => follows(point) && ruleDirection(point.condition) !== 'exact'
		);
		if (following.length === 0) return;
		commit(
			points.map((point) =>
				following.includes(point)
					? { ...point, reset: suggestedStored(point.condition, shown(point, 'value')) }
					: point
			)
		);
	}

	function addLimit() {
		const first = points[0];
		let number = points.length + 1;
		while (points.some((point) => point.id === `rule-limit-${number}`)) number += 1;
		commit([
			...points,
			{
				id: `rule-limit-${number}`,
				name: '',
				color: first?.color ?? '#3987e5',
				condition: first ? oppositeRuleCondition(first.condition) : 'greaterThan',
				value: '',
				min: '',
				max: '',
				reset: ''
			}
		]);
	}

	function removeLimit(point: CwAlertPointRule) {
		followsSuggestion.delete(point.id);
		commit(points.filter((other) => other.id !== point.id));
	}

	const hasProblem = (index: number, kind: CwRuleProblemKind) =>
		(problems[index] ?? []).some((problem) => problem.kind === kind);

	function conditionError(index: number): string | undefined {
		return hasProblem(index, 'unsupported') ? l.errorCondition : undefined;
	}

	function valueError(index: number, point: CwAlertPointRule): string | undefined {
		const left = touched[key(point, 'value')];
		if (hasProblem(index, 'overlap')) return l.errorOverlap;
		if (left && hasProblem(index, 'valueMissing')) return l.errorValueMissing;
		if (left && hasProblem(index, 'valueInvalid')) return l.errorNumber;
		return undefined;
	}

	function resetError(index: number, point: CwAlertPointRule): string | undefined {
		const left = touched[key(point, 'reset')];
		if (hasProblem(index, 'resetWrongSide')) {
			const amount = shownNumber(point, 'value');
			const template =
				ruleDirection(point.condition) === 'below'
					? l.errorResetMustBeAbove
					: l.errorResetMustBeBelow;
			return fillRuleText(template, { value: amount === null ? '' : withUnit(amount) });
		}
		if (hasProblem(index, 'neverResets')) return l.errorNeverResets;
		if (left && hasProblem(index, 'resetMissing')) return l.errorResetMissing;
		if (left && hasProblem(index, 'resetInvalid')) return l.errorNumber;
		return undefined;
	}

	/** The full explanation of a reset on the alert side. */
	function wrongSideText(point: CwAlertPointRule): string {
		const amount = shownNumber(point, 'value');
		const reset = shownNumber(point, 'reset');
		return fillRuleText(
			ruleDirection(point.condition) === 'below'
				? l.errorResetWrongSideBelow
				: l.errorResetWrongSideAbove,
			{
				value: amount === null ? '' : withUnit(amount),
				reset: reset === null ? '' : withUnit(reset)
			}
		);
	}

	function suggestionHint(point: CwAlertPointRule): string {
		return fillRuleText(
			ruleDirection(point.condition) === 'below' ? l.suggestedAbove : l.suggestedBelow,
			{ gap: gap === null ? '' : withUnit(gap) }
		);
	}

	const phrase = (template: string, amount: number | null) =>
		fillRuleTemplate(template, { value: amount === null ? '' : withUnit(amount) }, ['value']);

	const plain = (parts: CwRuleTextPart[]) => parts.map((part) => part.text).join('');

	/** The sentence that says what the rule will do, once every limit is complete. */
	const summary = $derived.by<CwRuleTextPart[] | null>(() => {
		if (!complete) return null;

		const joined = (groups: CwRuleTextPart[][], separator: string) =>
			groups.flatMap((group, index) =>
				index === 0 ? group : [{ text: separator, strong: false }, ...group]
			);
		const whens = points.map((point) =>
			phrase(l[WHEN[point.condition as keyof typeof WHEN]], shownNumber(point, 'value'))
		);
		const backs = points
			.filter((point) => point.condition in BACK)
			.map((point) =>
				phrase(l[BACK[point.condition as DirectionalCondition]], shownNumber(point, 'reset'))
			);

		// The phrases hold bold parts of their own, so they go in after the sentence is filled.
		const WHEN_SLOT = '\u0001';
		const BACK_SLOT = '\u0002';
		return fillRuleTemplate(
			backs.length > 0 ? l.summary : l.summaryExact,
			{
				one: l.summaryOne,
				reading: readingName?.trim() || l.summaryReading,
				when: WHEN_SLOT,
				back: BACK_SLOT
			},
			['one']
		).flatMap((part) =>
			part.text === WHEN_SLOT
				? joined(whens, l.summaryOr)
				: part.text === BACK_SLOT
					? joined(backs, l.summaryAnd)
					: [part]
		);
	});

	/** The example is drawn for one complete limit with a reset: that is the case it explains. */
	const exampleProps = $derived.by(() => {
		const point = points[0];
		if (!example || !complete || points.length !== 1 || !(point.condition in BACK)) return null;

		const condition = point.condition as DirectionalCondition;
		const amount = shownNumber(point, 'value');
		const reset = shownNumber(point, 'reset');
		const alertValue = amount === null ? '' : withUnit(amount);
		const resetValue = reset === null ? '' : withUnit(reset);
		const alertTitle = fillRuleText(l[STEP_ALERT[condition]], { value: alertValue });
		return {
			direction: ruleDirection(condition) as 'below' | 'above',
			title: l.exampleTitle,
			note: l.exampleNote,
			alertLine: l.exampleAlertLine,
			alertValue,
			resetLine: l.exampleResetLine,
			resetValue,
			zone: l.exampleZone,
			time: l.exampleTime,
			aria: fillRuleText(l.exampleAria, {
				when: plain(phrase(l[WHEN[condition]], amount)),
				back: plain(phrase(l[BACK[condition]], reset))
			}),
			steps: [
				{ title: alertTitle, text: l.stepAlertText },
				{
					title: fillRuleText(l.stepHover, { value: alertValue }),
					text: fillRuleText(l.stepHoverText, { reset: resetValue })
				},
				{
					title: fillRuleText(l[STEP_RESET[condition]], { value: resetValue }),
					text: l.stepResetText
				},
				{ title: fillRuleText(l.stepAgain, { title: alertTitle }), text: l.stepAgainText }
			]
		};
	});
</script>

{#snippet unitSlot(withSwitch: boolean)}
	{#if temperature && withSwitch}
		<span class="cw-rule-condition__units" role="group" aria-label={l.unitLabel}>
			{#each UNITS as option (option)}
				<button
					type="button"
					class="cw-rule-condition__unit-button"
					class:cw-rule-condition__unit-button--on={shownUnit === option}
					aria-pressed={shownUnit === option}
					onclick={() => chooseUnit(option)}
				>
					°{option}
				</button>
			{/each}
		</span>
	{:else if unitText}
		<span class="cw-rule-condition__unit">{unitText}</span>
	{/if}
{/snippet}

{#snippet resetField(point: CwAlertPointRule, index: number)}
	{@const fieldId = `${baseId}-${index}-reset`}
	{@const error = resetError(index, point)}
	<div class="cw-rule-condition__reset">
		{#if helpHref}
			<CwHelp
				href={helpHref}
				label={l.resetHelp}
				labels={{ help: l.helpName, newTab: l.helpNewTab }}
			>
				<label class="cw-rule-condition__label" for={fieldId}>{l.resetLabel}</label>
			</CwHelp>
		{:else}
			<label class="cw-rule-condition__label" for={fieldId}>{l.resetLabel}</label>
		{/if}
		<CwInput
			id={fieldId}
			type="numeric"
			value={shown(point, 'reset')}
			placeholder={gap !== null && follows(point) ? l.resetPlaceholderAuto : l.resetPlaceholder}
			{error}
			oninput={(event) => typeReset(point, (event.target as HTMLInputElement).value)}
			onblur={() => leave(point, 'reset')}
		>
			{#snippet rightSlot()}
				{@render unitSlot(false)}
			{/snippet}
		</CwInput>
		{#if !error && holdsSuggestion(point)}
			<p class="cw-rule-condition__hint">
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M3.5 8.5l3 3 6-7"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				{suggestionHint(point)}
			</p>
		{/if}
	</div>
{/snippet}

{#snippet summaryPanel()}
	<!-- While a value is typed wrongly, its error says what to do: no sentence then. -->
	<p
		class="cw-rule-condition__summary"
		class:cw-rule-condition__summary--empty={!summary}
		hidden={!summary && !unfinished}
	>
		<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path
				d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 3.5-1.5 4.75-1.5 4.75h12s-1.5-1.25-1.5-4.75A4.5 4.5 0 0 0 10 3zM8.25 15.25a1.9 1.9 0 0 0 3.5 0"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<span aria-live="polite">
			{#if summary}
				{#each summary as part, index (index)}{#if part.strong}<strong>{part.text}</strong
						>{:else}{part.text}{/if}{/each}
			{:else}
				{l.summaryEmpty}
			{/if}
		</span>
	</p>
{/snippet}

<div class="cw-rule-condition {className}">
	{#each points as point, index (point.id)}
		{@const direction = ruleDirection(point.condition)}
		{@const first = index === 0}
		{@const suggestion = suggestionFor(point)}

		{#if !first}
			<div class="cw-rule-condition__or">
				<span class="cw-rule-condition__or-pill">{l.orLabel}</span>
				<span class="cw-rule-condition__or-hint">{l.orHint}</span>
				<CwButton variant="ghost" size="sm" onclick={() => removeLimit(point)}>
					{l.removeLimit}
				</CwButton>
			</div>
		{/if}

		<div class="cw-rule-condition__limit">
			<div
				class="cw-rule-condition__fields"
				class:cw-rule-condition__fields--three={(first && !!reading) || (!first && direction !== 'exact')}
			>
				{#if first && reading}
					<div class="cw-rule-condition__reading">{@render reading()}</div>
				{/if}
				<CwDropdown
					id="{baseId}-{index}-condition"
					label={l.conditionLabel}
					placeholder={l.conditionPlaceholder}
					options={conditionOptions}
					value={direction === null ? '' : point.condition}
					error={conditionError(index)}
					onchange={(next) => chooseCondition(point, next as CwAlertPointCondition)}
				/>
				<div
					class="cw-rule-condition__value"
					class:cw-rule-condition__value--switch={temperature && first}
				>
					<CwInput
						id="{baseId}-{index}-value"
						type="numeric"
						label={l.valueLabel}
						value={shown(point, 'value')}
						placeholder={l.valuePlaceholder}
						error={valueError(index, point)}
						oninput={(event) => typeValue(point, (event.target as HTMLInputElement).value)}
						onblur={() => leave(point, 'value')}
					>
						{#snippet rightSlot()}
							{@render unitSlot(first)}
						{/snippet}
					</CwInput>
				</div>
				{#if !first && direction !== 'exact'}
					{@render resetField(point, index)}
				{/if}
			</div>

			{#if first && direction !== 'exact'}
				<div class="cw-rule-condition__reset-row">
					{@render resetField(point, index)}
					{#if points.length === 1}
						{@render summaryPanel()}
					{/if}
				</div>
			{:else if first && points.length === 1}
				{@render summaryPanel()}
			{/if}

			{#if hasProblem(index, 'resetWrongSide')}
				<div class="cw-rule-condition__warning" role="status">
					<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path
							d="M10 3.5l7 12.5H3l7-12.5zM10 8.5v3.5M10 14.25v.25"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<div class="cw-rule-condition__warning-body">
						<p>{wrongSideText(point)}</p>
						{#if suggestion !== null}
							<CwButton variant="secondary" size="sm" onclick={() => useSuggestion(point)}>
								{fillRuleText(l.useSuggested, { value: withUnit(suggestion) })}
							</CwButton>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}

	{#if points.length > 1}
		{@render summaryPanel()}
	{/if}

	{#if points.length === 0 || (points.length === 1 && ruleDirection(points[0].condition) !== 'exact')}
		<div class="cw-rule-condition__add">
			<CwButton variant="ghost" size="sm" onclick={addLimit}>
				<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
					<path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
				{l.addLimit}
			</CwButton>
			<span class="cw-rule-condition__add-hint">{l.addLimitHint}</span>
		</div>
	{/if}

	{#if exampleProps}
		<RuleExample {...exampleProps} />
	{/if}
</div>

<style>
	.cw-rule-condition {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
		min-width: 0;
	}

	.cw-rule-condition__limit {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
	}

	.cw-rule-condition__fields,
	.cw-rule-condition__reset-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--cw-space-4);
		align-items: start;
	}

	@container (min-width: 40rem) {
		.cw-rule-condition__fields {
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		}

		.cw-rule-condition__fields--three {
			grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.25fr) minmax(0, 1fr);
		}

		.cw-rule-condition__reset-row {
			grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
		}
	}

	.cw-rule-condition__reading {
		min-width: 0;
	}

	.cw-rule-condition__reset {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--cw-space-1);
		min-width: 0;
	}

	.cw-rule-condition__reset :global(.cw-input) {
		width: 100%;
	}

	.cw-rule-condition__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-rule-condition__unit {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		white-space: nowrap;
	}

	.cw-rule-condition__value {
		min-width: 0;
	}

	/* The unit switch is wider than the room CwInput keeps for its right side. */
	.cw-rule-condition__value--switch :global(.cw-input__field) {
		padding-right: 8.75rem;
	}

	.cw-rule-condition__units {
		display: inline-flex;
		gap: 2px;
		padding: 2px;
		/* CwInput's right side lets clicks through to the field; these are buttons. */
		pointer-events: auto;
		background-color: var(--cw-bg-surface-elevated);
		border-radius: var(--cw-radius-md);
	}

	.cw-rule-condition__unit-button {
		min-width: 2.125rem;
		height: 1.625rem;
		padding: 0 var(--cw-space-2);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		background-color: transparent;
		border: 0;
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
	}

	.cw-rule-condition__unit-button--on {
		color: var(--cw-text-inverse);
		background-color: var(--cw-accent);
	}

	.cw-rule-condition__unit-button:focus-visible {
		outline: 2px solid var(--cw-focus-ring-color);
		outline-offset: 1px;
	}

	.cw-rule-condition__hint {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-rule-condition__hint svg {
		flex-shrink: 0;
		width: 0.875rem;
		height: 0.875rem;
		color: var(--cw-status-online);
	}

	.cw-rule-condition__summary {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		margin: 0;
		padding: var(--cw-space-3) var(--cw-space-4);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-secondary);
		background-color: var(--cw-bg-elevated);
		border-radius: var(--cw-control-radius);
	}

	/* Beside the reset field it lines up with the field, not with its label. */
	@container (min-width: 40rem) {
		.cw-rule-condition__reset-row > .cw-rule-condition__summary {
			margin-top: calc(var(--cw-text-sm) * 1.5 + var(--cw-space-1));
		}
	}

	.cw-rule-condition__summary--empty {
		color: var(--cw-text-muted);
	}

	/* `display: flex` above would otherwise show a hidden one. */
	.cw-rule-condition__summary[hidden] {
		display: none;
	}

	.cw-rule-condition__summary svg {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 1px;
	}

	.cw-rule-condition__summary strong {
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-rule-condition__warning {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		background-color: var(--cw-tone-danger-bg-subtle);
		border: 1px solid var(--cw-tone-danger-border);
		border-radius: var(--cw-control-radius);
	}

	.cw-rule-condition__warning svg {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 1px;
		color: var(--cw-tone-danger-text);
	}

	.cw-rule-condition__warning-body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.625rem;
	}

	.cw-rule-condition__warning p {
		margin: 0;
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-primary);
	}

	.cw-rule-condition__or {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-2) var(--cw-space-3);
	}

	.cw-rule-condition__or-pill {
		display: inline-flex;
		align-items: center;
		height: 1.5rem;
		padding: 0 0.625rem;
		font-size: 0.6875rem;
		font-weight: var(--cw-font-bold);
		letter-spacing: 0.08em;
		color: var(--cw-text-inverse);
		background-color: var(--cw-accent);
		border-radius: var(--cw-radius-full);
	}

	.cw-rule-condition__or-hint {
		flex: 1;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-rule-condition__add {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-1) var(--cw-space-3);
	}

	.cw-rule-condition__add-hint {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}
</style>
