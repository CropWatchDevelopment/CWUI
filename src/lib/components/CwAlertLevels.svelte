<script lang="ts">
	/**
	 * Named, coloured levels for a reading ("Too cold: below 5 °C"), as a report
	 * uses them to mark values. Each level is one row; a scale above shows how
	 * the readings will be marked.
	 *
	 * The value is a `CwAlertPointsValue`, as CwAlertPointsEditor uses: one
	 * point per level, numbers as text, temperatures stored in °C.
	 */
	import { untrack } from 'svelte';
	import type {
		CwAlertPointCondition,
		CwAlertPointRule,
		CwAlertPointsValue
	} from '../types/index.js';
	import CwButton from './CwButton.svelte';
	import CwDropdown from './CwDropdown.svelte';
	import CwInput from './CwInput.svelte';
	import CwTooltip from './CwTooltip.svelte';
	import {
		alertLevelBand,
		alertLevelOverlaps,
		alertLevelProblems,
		alertLevelScale,
		alertLevelTicks,
		CW_ALERT_LEVEL_COLORS,
		CW_ALERT_LEVEL_CONDITIONS,
		nextAlertLevelColor,
		type CwAlertLevelField,
		type CwAlertLevelNumbers,
		type CwAlertLevelProblemKind
	} from './cwAlertLevels.js';
	import { cwAlertLevelsText, type CwAlertLevelsLabels } from './cwAlertLevelsText.js';
	import {
		fillRuleText,
		parseRuleNumber,
		ruleNumberText,
		ruleTextToDisplay,
		ruleTextToStorage,
		ruleUnitOf,
		ruleValueToDisplay,
		type CwRuleUnit
	} from './cwRuleCondition.js';

	type NumberField = 'value' | 'min' | 'max';

	interface Props {
		value?: CwAlertPointsValue;
		onchange?: (value: CwAlertPointsValue) => void;
		/** A temperature gets the °C / °F switch. Any other reading shows `unit` and is stored as typed. */
		temperature?: boolean;
		/** The unit of a reading that is not a temperature ("%", "ppm", "cm"). */
		unit?: string;
		/** BCP 47 locale: picks the built-in text (English, Japanese) and the number format. */
		locale?: string;
		/** Override any built-in string. */
		labels?: Partial<CwAlertLevelsLabels>;
		/** Prefix of the field ids. */
		id?: string;
		class?: string;
	}

	let {
		value = $bindable({ unit: 'C', center: '0', points: [] }),
		onchange,
		temperature = true,
		unit = '',
		locale,
		labels = {},
		id,
		class: className = ''
	}: Props = $props();

	const OPTION = {
		lessThan: 'opBelow',
		lessThanOrEqual: 'opBelowOrEqual',
		greaterThan: 'opAbove',
		greaterThanOrEqual: 'opAboveOrEqual',
		range: 'opBetween',
		equals: 'opEquals'
	} as const;
	const BAND = {
		lessThan: 'bandBelow',
		lessThanOrEqual: 'bandBelowOrEqual',
		greaterThan: 'bandAbove',
		greaterThanOrEqual: 'bandAboveOrEqual',
		range: 'bandBetween',
		equals: 'bandEquals'
	} as const;
	const UNITS: CwRuleUnit[] = ['C', 'F'];

	const uid = $props.id();
	const baseId = $derived(id ?? uid);
	const l = $derived({ ...cwAlertLevelsText(locale), ...labels });
	const numberFormat = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }));

	/** The unit temperatures are typed in. A choice for the eyes only: values are stored in °C. */
	let shownUnit = $state<CwRuleUnit>(untrack(() => ruleUnitOf(value.unit)));
	const typedUnit = $derived<CwRuleUnit>(temperature ? shownUnit : 'C');
	const unitText = $derived(temperature ? `°${shownUnit}` : unit.trim());

	/** What is in a number field while it is being typed in, by `id:field`. */
	let drafts = $state<Record<string, string>>({});
	/** Fields the user has left: only those complain about being empty. */
	let touched = $state<Record<string, boolean>>({});

	const points = $derived(value.points);
	const problems = $derived(alertLevelProblems(points));
	const overlaps = $derived(alertLevelOverlaps(points));
	const conditionOptions = $derived(
		CW_ALERT_LEVEL_CONDITIONS.map((condition) => ({ label: l[OPTION[condition]], value: condition }))
	);

	const key = (point: CwAlertPointRule, field: CwAlertLevelField) => `${point.id}:${field}`;
	const shown = (point: CwAlertPointRule, field: NumberField) =>
		drafts[key(point, field)] ?? ruleTextToDisplay(point[field], typedUnit);

	function shownNumber(point: CwAlertPointRule, field: NumberField): number | null {
		const stored = parseRuleNumber(point[field]);
		if (stored === null) return null;
		return Number(ruleNumberText(ruleValueToDisplay(stored, typedUnit), 4));
	}

	function withUnit(amount: number): string {
		const formatted = numberFormat.format(amount);
		if (!unitText) return formatted;
		return unitText === '%' ? `${formatted}%` : `${formatted} ${unitText}`;
	}

	/** A colour the native picker accepts: `#rrggbb`, lower case. */
	function colorOf(point: CwAlertPointRule): string {
		const color = point.color.trim().toLowerCase();
		return /^#[0-9a-f]{6}$/.test(color) ? color : CW_ALERT_LEVEL_COLORS[0];
	}

	/**
	 * Sets the native picker's colour as a property. As a `value` attribute it
	 * is cleared for a moment when the server-rendered page comes alive, and the
	 * browser warns that an empty colour is not a colour.
	 */
	function pickerColor(node: HTMLInputElement, color: string) {
		node.value = color;
		return {
			update(next: string) {
				node.value = next;
			}
		};
	}

	const nameOf = (point: CwAlertPointRule, index: number) =>
		point.name.trim() || fillRuleText(l.defaultName, { number: String(index + 1) });

	function commit(next: CwAlertPointRule[]) {
		value = { ...value, unit: 'C', points: next };
		onchange?.(value);
	}

	function patch(point: CwAlertPointRule, change: Partial<CwAlertPointRule>) {
		commit(points.map((other) => (other.id === point.id ? { ...other, ...change } : other)));
	}

	function typeNumber(point: CwAlertPointRule, field: NumberField, typed: string) {
		drafts[key(point, field)] = typed;
		patch(point, { [field]: ruleTextToStorage(typed, typedUnit) });
	}

	function leave(point: CwAlertPointRule, field: CwAlertLevelField) {
		delete drafts[key(point, field)];
		touched[key(point, field)] = true;
	}

	function chooseCondition(point: CwAlertPointRule, condition: CwAlertPointCondition) {
		const change: Partial<CwAlertPointRule> = { condition };
		// The number already typed moves to the field that now stands for it.
		if (condition === 'range' && !point.min.trim()) change.min = point.value;
		if (condition !== 'range' && !point.value.trim()) change.value = point.min;
		patch(point, change);
	}

	function chooseUnit(next: CwRuleUnit) {
		shownUnit = next;
		drafts = {};
	}

	function addLevel() {
		let number = points.length + 1;
		while (points.some((point) => point.id === `alert-level-${number}`)) number += 1;
		commit([
			...points,
			{
				id: `alert-level-${number}`,
				name: fillRuleText(l.defaultName, { number: String(points.length + 1) }),
				color: nextAlertLevelColor(points),
				condition: 'greaterThan',
				value: '',
				min: '',
				max: ''
			}
		]);
	}

	const hasProblem = (index: number, field: CwAlertLevelField, kind: CwAlertLevelProblemKind) =>
		(problems[index] ?? []).some((problem) => problem.field === field && problem.kind === kind);

	function numberError(
		index: number,
		point: CwAlertPointRule,
		field: NumberField
	): string | undefined {
		if (hasProblem(index, field, 'rangeOrder')) return l.errorRangeOrder;
		if (!touched[key(point, field)]) return undefined;
		if (hasProblem(index, field, 'valueMissing')) return l.errorValue;
		if (hasProblem(index, field, 'valueInvalid')) return l.errorNumber;
		return undefined;
	}

	const nameError = (index: number, point: CwAlertPointRule) =>
		touched[key(point, 'name')] && hasProblem(index, 'name', 'nameMissing')
			? l.errorName
			: undefined;

	/** Each level's numbers in the unit shown, for the scale. */
	const levels = $derived<CwAlertLevelNumbers[]>(
		points.map((point) => ({
			id: point.id,
			condition: point.condition,
			value: shownNumber(point, 'value'),
			min: shownNumber(point, 'min'),
			max: shownNumber(point, 'max')
		}))
	);
	const scale = $derived(alertLevelScale(levels));

	/** The levels as drawn: left to right, each with the room its name has before the next one. */
	const bands = $derived.by(() => {
		if (!scale) return [];
		const drawn = points
			.flatMap((point, index) => {
				const band = alertLevelBand(levels[index], scale);
				return band ? [{ ...band, point, index, color: colorOf(point), name: nameOf(point, index) }] : [];
			})
			.sort((a, b) => a.left - b.left);
		return drawn.map((band, position) => ({
			...band,
			room: (drawn[position + 1]?.left ?? 100) - band.left
		}));
	});

	const ticks = $derived(scale ? alertLevelTicks(levels, scale) : []);

	const previewAria = $derived.by(() => {
		if (!scale) return '';
		const phrases = bands.map((band) =>
			fillRuleText(l[BAND[band.point.condition]], {
				name: band.name,
				value: withUnit(levels[band.index].value ?? 0),
				min: withUnit(levels[band.index].min ?? 0),
				max: withUnit(levels[band.index].max ?? 0)
			})
		);
		return fillRuleText(l.previewAria, {
			min: withUnit(scale.min),
			max: withUnit(scale.max),
			bands: phrases.join(' ')
		});
	});
</script>

{#snippet unitSuffix()}
	{#if unitText}
		<span class="cw-alert-levels__unit">{unitText}</span>
	{/if}
{/snippet}

<div class="cw-alert-levels {className}">
	{#if points.length > 0}
		<figure class="cw-alert-levels__preview">
			<figcaption class="cw-alert-levels__preview-head">
				<span class="cw-alert-levels__preview-title">{l.previewTitle}</span>
				{#if temperature}
					<span class="cw-alert-levels__units" role="group" aria-label={l.unitLabel}>
						{#each UNITS as option (option)}
							<button
								type="button"
								class="cw-alert-levels__unit-button"
								class:cw-alert-levels__unit-button--on={shownUnit === option}
								aria-pressed={shownUnit === option}
								onclick={() => chooseUnit(option)}
							>
								°{option}
							</button>
						{/each}
					</span>
				{/if}
			</figcaption>

			{#if scale}
				<div class="cw-alert-levels__scale" role="img" aria-label={previewAria}>
					<div class="cw-alert-levels__names" aria-hidden="true">
						{#each bands as band (band.point.id)}
							<!-- A name that has no room before the next level is told by its colour and its row. -->
							{#if band.room >= 8}
								<span
									class="cw-alert-levels__name"
									style:left="{band.left}%"
									style:max-width="{band.room}%"
								>
									{band.name}
								</span>
							{/if}
						{/each}
					</div>
					<div class="cw-alert-levels__track" aria-hidden="true">
						{#each bands as band (band.point.id)}
							<span
								class="cw-alert-levels__band"
								class:cw-alert-levels__band--mark={band.mark}
								style:left="{band.left}%"
								style:width="{band.width}%"
								style:background-color={band.color}
							></span>
						{/each}
					</div>
					<div class="cw-alert-levels__ticks" aria-hidden="true">
						{#each ticks as tick (tick.left)}
							<span
								class="cw-alert-levels__tick"
								class:cw-alert-levels__tick--edge={tick.edge}
								class:cw-alert-levels__tick--start={tick.left === 0}
								class:cw-alert-levels__tick--end={tick.left === 100}
								style:left="{tick.left}%"
							>
								{tick.left === 100 ? withUnit(tick.value) : numberFormat.format(tick.value)}
							</span>
						{/each}
					</div>
				</div>
			{:else}
				<p class="cw-alert-levels__preview-empty">{l.previewEmpty}</p>
			{/if}
		</figure>

		<div class="cw-alert-levels__list">
			<div class="cw-alert-levels__header" aria-hidden="true">
				<span>{l.colorHeader}</span>
				<span>{l.nameHeader}</span>
				<span>{l.conditionHeader}</span>
				<span>{l.valueHeader}</span>
				<span></span>
			</div>

			{#each points as point, index (point.id)}
				{@const name = nameOf(point, index)}
				<div class="cw-alert-levels__row">
					<label class="cw-alert-levels__color">
						<input
							type="color"
							use:pickerColor={colorOf(point)}
							aria-label={fillRuleText(l.colorLabel, { name })}
							oninput={(event) => patch(point, { color: event.currentTarget.value })}
						/>
						<span class="cw-alert-levels__dot" style:background-color={colorOf(point)}></span>
					</label>

					<div class="cw-alert-levels__cell cw-alert-levels__cell--name">
						<CwInput
							id="{baseId}-{index}-name"
							aria-label={l.nameHeader}
							value={point.name}
							placeholder={l.namePlaceholder}
							error={nameError(index, point)}
							oninput={(event) => patch(point, { name: (event.target as HTMLInputElement).value })}
							onblur={() => leave(point, 'name')}
						/>
					</div>

					<div class="cw-alert-levels__cell cw-alert-levels__cell--condition">
						<CwDropdown
							id="{baseId}-{index}-condition"
							ariaLabel={l.conditionHeader}
							options={conditionOptions}
							value={point.condition}
							onchange={(next) => chooseCondition(point, next as CwAlertPointCondition)}
						/>
					</div>

					<div class="cw-alert-levels__cell cw-alert-levels__cell--value">
						{#if point.condition === 'range'}
							<div class="cw-alert-levels__range">
								<CwInput
									id="{baseId}-{index}-min"
									type="numeric"
									aria-label={l.fromLabel}
									value={shown(point, 'min')}
									error={numberError(index, point, 'min')}
									oninput={(event) =>
										typeNumber(point, 'min', (event.target as HTMLInputElement).value)}
									onblur={() => leave(point, 'min')}
								/>
								<span class="cw-alert-levels__and">{l.rangeAnd}</span>
								<CwInput
									id="{baseId}-{index}-max"
									type="numeric"
									aria-label={l.toLabel}
									value={shown(point, 'max')}
									error={numberError(index, point, 'max')}
									oninput={(event) =>
										typeNumber(point, 'max', (event.target as HTMLInputElement).value)}
									onblur={() => leave(point, 'max')}
								/>
								<!-- Once, after both: inside each field it would leave no room for the number. -->
								{#if unitText}
									<span class="cw-alert-levels__and">{unitText}</span>
								{/if}
							</div>
						{:else}
							<CwInput
								id="{baseId}-{index}-value"
								type="numeric"
								aria-label={l.valueHeader}
								value={shown(point, 'value')}
								error={numberError(index, point, 'value')}
								oninput={(event) =>
									typeNumber(point, 'value', (event.target as HTMLInputElement).value)}
								onblur={() => leave(point, 'value')}
							>
								{#snippet rightSlot()}
									{@render unitSuffix()}
								{/snippet}
							</CwInput>
						{/if}
					</div>

					<div class="cw-alert-levels__remove">
						<CwTooltip value={fillRuleText(l.removeLevel, { name })}>
							<CwButton
								class="cw-alert-levels__remove-button"
								variant="ghost"
								aria-label={fillRuleText(l.removeLevel, { name })}
								onclick={() => commit(points.filter((other) => other.id !== point.id))}
							>
								<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
									<path
										d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M6.75 7v4M9.25 7v4"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</CwButton>
						</CwTooltip>
					</div>
				</div>
			{/each}
		</div>

		{#if overlaps.length > 0}
			<ul class="cw-alert-levels__notes" role="status">
				{#each overlaps as [first, second] (`${first}-${second}`)}
					<li>
						{fillRuleText(l.overlapNote, {
							first: nameOf(points[first], first),
							second: nameOf(points[second], second)
						})}
					</li>
				{/each}
			</ul>
		{/if}
	{:else}
		<div class="cw-alert-levels__empty">
			<strong>{l.emptyTitle}</strong>
			<span>{l.emptyText}</span>
		</div>
	{/if}

	<div class="cw-alert-levels__add">
		<CwButton variant="secondary" onclick={addLevel}>
			<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
				<path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			{l.addLevel}
		</CwButton>
	</div>
</div>

<style>
	.cw-alert-levels {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-5);
		min-width: 0;
	}

	/* ── Preview ─────────────────────────── */
	.cw-alert-levels__preview {
		--_surface: var(--cw-chart-card-bg, var(--cw-bg-surface));
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		margin: 0;
		padding: var(--cw-space-4);
		background-color: var(--_surface);
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-muted));
		border-radius: var(--cw-card-radius);
	}

	.cw-alert-levels__preview-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2) var(--cw-space-4);
	}

	.cw-alert-levels__preview-title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-alert-levels__preview-empty {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	.cw-alert-levels__units {
		display: inline-flex;
		gap: 2px;
		padding: 2px;
		background-color: var(--cw-bg-surface-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}

	.cw-alert-levels__unit-button {
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

	.cw-alert-levels__unit-button--on {
		color: var(--cw-text-inverse);
		background-color: var(--cw-accent);
	}

	.cw-alert-levels__unit-button:focus-visible {
		outline: 2px solid var(--cw-focus-ring-color);
		outline-offset: 1px;
	}

	.cw-alert-levels__scale {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.cw-alert-levels__names,
	.cw-alert-levels__ticks {
		position: relative;
		height: 1.125rem;
		font-size: var(--cw-text-xs);
	}

	.cw-alert-levels__name {
		position: absolute;
		top: 0;
		overflow: hidden;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		text-overflow: ellipsis;
		white-space: nowrap;
		/* Room between it and the next name. */
		padding-right: var(--cw-space-2);
		box-sizing: border-box;
	}

	.cw-alert-levels__track {
		position: relative;
		height: 1.5rem;
		overflow: hidden;
		background-color: var(--cw-bg-surface-elevated);
		border-radius: var(--cw-radius-md);
	}

	/* One pixel in from each side: two levels that touch keep a 2px gap. */
	.cw-alert-levels__band {
		position: absolute;
		top: 0;
		bottom: 0;
		margin: 0 1px;
		border-radius: var(--cw-radius-sm);
		box-sizing: border-box;
	}

	/* "Exactly" has no width of its own. */
	.cw-alert-levels__band--mark {
		width: 4px !important;
		margin-left: -2px;
		border-radius: 2px;
	}

	.cw-alert-levels__tick {
		position: absolute;
		top: 0;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		white-space: nowrap;
		transform: translateX(-50%);
	}

	.cw-alert-levels__tick--edge {
		font-weight: var(--cw-font-normal, 400);
		color: var(--cw-text-muted);
	}

	.cw-alert-levels__tick--start {
		transform: none;
	}

	.cw-alert-levels__tick--end {
		transform: translateX(-100%);
	}

	/* ── Rows ────────────────────────────── */
	.cw-alert-levels__list {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
	}

	.cw-alert-levels__header {
		display: none;
		padding: 0 var(--cw-space-3);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.04em;
		color: var(--cw-text-muted);
	}

	.cw-alert-levels__row {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
		grid-template-areas:
			'color name remove'
			'condition condition condition'
			'value value value';
		gap: var(--cw-space-3);
		align-items: start;
		padding: var(--cw-space-3);
		background-color: var(--cw-bg-surface-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-card-radius);
	}

	.cw-alert-levels__color {
		grid-area: color;
	}

	.cw-alert-levels__cell {
		min-width: 0;
	}

	.cw-alert-levels__cell--name {
		grid-area: name;
	}

	.cw-alert-levels__cell--condition {
		grid-area: condition;
	}

	.cw-alert-levels__cell--value {
		grid-area: value;
	}

	.cw-alert-levels__remove {
		grid-area: remove;
	}

	@container (min-width: 40rem) {
		.cw-alert-levels__header,
		.cw-alert-levels__row {
			display: grid;
			grid-template-columns: 2.5rem minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.7fr) 2.5rem;
			grid-template-areas: 'color name condition value remove';
			gap: var(--cw-space-3);
		}

		.cw-alert-levels__row {
			padding: var(--cw-space-2) var(--cw-space-3);
		}
	}

	.cw-alert-levels__color {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: 2.5rem;
		height: var(--cw-control-h-md);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		cursor: pointer;
	}

	/* The native picker covers the control, unseen: a click anywhere opens it. */
	.cw-alert-levels__color input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		opacity: 0;
		cursor: pointer;
	}

	.cw-alert-levels__color:focus-within {
		border-color: var(--cw-focus-ring-color);
		outline: 2px solid var(--cw-focus-ring-color);
		outline-offset: 1px;
	}

	.cw-alert-levels__dot {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--cw-radius-full);
		pointer-events: none;
	}

	.cw-alert-levels__range {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
		gap: var(--cw-space-2);
		align-items: start;
	}

	/* Two fields share the cell: CwInput's usual room for its stepper would leave none for the number. */
	.cw-alert-levels__range :global(.cw-input__field--has-stepper) {
		padding-right: 2.5rem;
	}

	.cw-alert-levels__range :global(.cw-input__field--has-right.cw-input__field--has-stepper) {
		padding-right: 3.75rem;
	}

	.cw-alert-levels__and {
		min-height: var(--cw-control-h-md);
		display: inline-flex;
		align-items: center;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	.cw-alert-levels__unit {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		white-space: nowrap;
	}

	.cw-alert-levels__remove :global(.cw-alert-levels__remove-button) {
		width: 2.5rem;
		min-height: var(--cw-control-h-md);
		padding: 0;
		color: var(--cw-tone-danger-text);
	}

	/* ── Notes, empty state, add ─────────── */
	.cw-alert-levels__notes {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		margin: 0;
		padding: var(--cw-space-3) var(--cw-space-4);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-primary);
		list-style: none;
		background-color: var(--cw-tone-warning-bg-subtle, var(--cw-bg-elevated));
		border: 1px solid var(--cw-tone-warning-border, var(--cw-border-default));
		border-radius: var(--cw-control-radius);
	}

	.cw-alert-levels__empty {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		padding: var(--cw-space-4);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		border: 1px dashed var(--cw-border-default);
		border-radius: var(--cw-card-radius);
	}

	.cw-alert-levels__empty strong {
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-alert-levels__add {
		display: flex;
	}
</style>
