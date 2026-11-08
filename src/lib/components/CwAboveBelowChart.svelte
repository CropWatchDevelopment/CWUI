<script lang="ts" module>
	/**
	 * Display text for `CwAboveBelowChart` (i18n). Every field is optional;
	 * omitted fields fall back to English.
	 */
	export interface CwAboveBelowChartLabels {
		/** Card title when no `title` prop is given ("Above & below ground"). */
		title?: string;
		/** Light strip heading ("Light"). */
		light?: string;
		/** Air layer heading ("Air"). */
		air?: string;
		/** Ground layer heading ("Ground"). */
		ground?: string;
		/** Label on the line between the air and ground layers ("Ground level"). */
		groundLevel?: string;
		/** Light strip: the current PPFD ("PPFD now"). */
		ppfdNow?: string;
		/** Light strip: the highest PPFD ("Peak"). */
		ppfdPeak?: string;
		/** Light strip: the daily light integral so far ("DLI today"). */
		dliToday?: string;
		/** Light strip: the daily light goal; gets `targetName` when there is one ("Tomato goal" / "Goal"). */
		dliGoal?: (targetName: string) => string;
		/** Under each bar: the lowest reading ("Low"). */
		low?: string;
		/** Under each bar: the average ("Avg"). */
		average?: string;
		/** Under each bar: the highest reading ("High"). */
		high?: string;
		/** The target line under a reading (`(range) => "Target 20–25°C"`). */
		target?: (range: string) => string;
		/** Accessible name of the legend ("Legend"). */
		legend?: string;
		/** Legend: the current-value dot ("Now"). */
		legendNow?: string;
		/** Legend: the average tick ("Avg"). */
		legendAverage?: string;
		/** Legend: the readings' span ("Low–high"). */
		legendRange?: string;
		/** Legend: the target band; gets `targetName` when there is one ("Tomato target" / "Target"). */
		legendTarget?: (targetName: string) => string;
		/** Status chip past the lower stress limit ("Too low"). */
		statusTooLow?: string;
		/** Status chip below the optimal band ("Low"). */
		statusLow?: string;
		/** Status chip inside the optimal band ("Optimal"). */
		statusOptimal?: string;
		/** Status chip above the optimal band ("High"). */
		statusHigh?: string;
		/** Status chip past the upper stress limit ("Too high"). */
		statusTooHigh?: string;
	}

	const DEFAULT_LABELS: Required<CwAboveBelowChartLabels> = {
		title: 'Above & below ground',
		light: 'Light',
		air: 'Air',
		ground: 'Ground',
		groundLevel: 'Ground level',
		ppfdNow: 'PPFD now',
		ppfdPeak: 'Peak',
		dliToday: 'DLI today',
		dliGoal: (targetName) => (targetName ? `${targetName} goal` : 'Goal'),
		low: 'Low',
		average: 'Avg',
		high: 'High',
		target: (range) => `Target ${range}`,
		legend: 'Legend',
		legendNow: 'Now',
		legendAverage: 'Avg',
		legendRange: 'Low–high',
		legendTarget: (targetName) => (targetName ? `${targetName} target` : 'Target'),
		statusTooLow: 'Too low',
		statusLow: 'Low',
		statusOptimal: 'Optimal',
		statusHigh: 'High',
		statusTooHigh: 'Too high'
	};
</script>

<script lang="ts">
	import type { CwNoDataMessage } from '../types/index.js';
	import CwChip from './CwChip.svelte';
	import CwNoDataOverlay from './CwNoDataOverlay.svelte';
	import { getCwNoDataMessage, hasCwNoData } from './cwNoData.js';
	import { formatCwNumber, isCwFiniteNumber } from '../utils/cwFormat.js';
	import { metricColor } from '../utils/metricColors.js';
	import {
		cwAboveBelowBar,
		cwAboveBelowColorFor,
		cwAboveBelowIconFor,
		cwAboveBelowStatusTone,
		formatCwTargetRange,
		isCwSummaryEmpty,
		judgeCwReading,
		summarizeCwReadings,
		type CwAboveBelowBar,
		type CwAboveBelowIcon,
		type CwAboveBelowLight,
		type CwAboveBelowMetric,
		type CwAboveBelowStatus
	} from './cwAboveBelowChart.js';

	interface Props {
		/** Readings above the ground line: air temperature, humidity, CO₂… */
		air?: CwAboveBelowMetric[];
		/** Readings below it: soil temperature, moisture, EC, pH… */
		ground?: CwAboveBelowMetric[];
		/** The light strip above the air layer; leave it out for boards without a light sensor. */
		light?: CwAboveBelowLight | null;
		/** Card title; defaults to `labels.title`. */
		title?: string;
		/** Line under the title, e.g. the range and the time of the latest reading. */
		subtitle?: string;
		/** Whose targets the bands show (usually the crop's name), for the legend and the light goal. */
		targetName?: string;
		/** Tints the light, air and ground layers (default true). */
		tinted?: boolean;
		/** Leaves out readings with no value at all, e.g. pH on a probe without it (default true). */
		hideEmpty?: boolean;
		/** Shows a placeholder while the readings load. */
		loading?: boolean;
		noData?: CwNoDataMessage;
		/** Heading level for the title (default 3); the layer headings use the next level. */
		headingLevel?: 1 | 2 | 3 | 4 | 5;
		/** BCP 47 locale for numbers (defaults to the runtime locale). */
		locale?: string;
		labels?: CwAboveBelowChartLabels;
		class?: string;
	}

	let {
		air = [],
		ground = [],
		light = null,
		title,
		subtitle,
		targetName = '',
		tinted = true,
		hideEmpty = true,
		loading = false,
		noData,
		headingLevel = 3,
		locale,
		labels = {},
		class: className = ''
	}: Props = $props();

	interface MetricView {
		key: string;
		label: string;
		unit: string;
		color: string;
		icon: CwAboveBelowIcon;
		current: string;
		low: string;
		average: string;
		high: string;
		bar: CwAboveBelowBar | null;
		status: CwAboveBelowStatus | null;
		statusLabel: string;
		targetLine: string | null;
	}

	const uid = $props.id();
	// Layer colours come from the CropWatch metric palette (3:1 on both themes).
	const sunColor = metricColor('light').color;
	const earthColor = metricColor('soil_temperature').color;

	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));
	const headingTag = $derived(`h${headingLevel}`);
	const layerHeadingTag = $derived(`h${Math.min(headingLevel + 1, 6)}`);

	function statusText(status: CwAboveBelowStatus): string {
		switch (status) {
			case 'too_low':
				return l.statusTooLow;
			case 'low':
				return l.statusLow;
			case 'optimal':
				return l.statusOptimal;
			case 'high':
				return l.statusHigh;
			case 'too_high':
				return l.statusTooHigh;
		}
	}

	function toView(metric: CwAboveBelowMetric): MetricView | null {
		const summary = summarizeCwReadings(metric.data, metric);
		if (hideEmpty && isCwSummaryEmpty(summary)) return null;
		const decimals = metric.decimals ?? 1;
		const format = (value: number | null) => formatCwNumber(value, { decimals, locale });
		const status = judgeCwReading(summary.current, metric.target);
		const range = formatCwTargetRange(metric.target, { decimals, unit: metric.unit, locale });
		return {
			key: metric.key,
			label: metric.label,
			unit: metric.unit ?? '',
			color: cwAboveBelowColorFor(metric),
			icon: metric.icon ?? cwAboveBelowIconFor(metric.key),
			current: format(summary.current),
			low: format(summary.min),
			average: format(summary.avg),
			high: format(summary.max),
			bar: cwAboveBelowBar(summary, metric.target),
			status,
			statusLabel: status ? statusText(status) : '',
			targetLine: metric.note || (range ? l.target(range) : null)
		};
	}

	const airViews = $derived(air.map(toView).filter((view): view is MetricView => view !== null));
	const groundViews = $derived(
		ground.map(toView).filter((view): view is MetricView => view !== null)
	);
	const hasTargets = $derived([...airViews, ...groundViews].some((view) => view.bar?.band));

	const lightView = $derived.by(() => {
		if (!light) return null;
		const summary = summarizeCwReadings(light.data, { current: light.current });
		const current = summary.current;
		const peak = isCwFiniteNumber(light.peak) ? light.peak : summary.max;
		const dli = isCwFiniteNumber(light.dli) ? light.dli : null;
		const goal = formatCwTargetRange(
			{ optimalMin: light.dliTarget?.min, optimalMax: light.dliTarget?.max },
			{ decimals: 1, locale }
		);
		if (current === null && peak === null && dli === null && goal === null) return null;
		return {
			current: current === null ? null : formatCwNumber(current, { decimals: 0, locale }),
			peak: peak === null ? null : formatCwNumber(peak, { decimals: 0, locale }),
			dli: dli === null ? null : formatCwNumber(dli, { decimals: 1, locale }),
			goal,
			ppfdUnit: light.ppfdUnit ?? 'µmol/m²/s',
			dliUnit: light.dliUnit ?? 'mol/m²',
			dliTargetUnit: light.dliTargetUnit ?? 'mol/m²/day'
		};
	});

	const hasLayers = $derived(airViews.length > 0 || groundViews.length > 0);
</script>

{#snippet glyph(name: CwAboveBelowIcon | 'sun' | 'cloud' | 'layers', size: number)}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		focusable="false"
	>
		{#if name === 'thermometer'}
			<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
		{:else if name === 'humidity'}
			<path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
			<path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2" />
		{:else if name === 'co2'}
			<path d="M9.59 4.59A2 2 0 1 1 11 8H2M12.59 19.41A2 2 0 1 0 14 16H2M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
		{:else if name === 'moisture'}
			<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
		{:else if name === 'ec'}
			<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
		{:else if name === 'ph'}
			<path
				d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.13a2 2 0 0 1-.21-.9V2M8.5 2h7M7 16h10"
			/>
		{:else if name === 'vpd'}
			<path d="M12 14l4-4M3.34 19a10 10 0 1 1 17.32 0" />
		{:else if name === 'light' || name === 'sun'}
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
			/>
		{:else if name === 'cloud'}
			<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
		{:else if name === 'layers'}
			<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
		{:else}
			<circle cx="12" cy="12" r="4" />
		{/if}
	</svg>
{/snippet}

{#snippet layer(kind: 'air' | 'ground', heading: string, views: MetricView[])}
	<section class="cw-ab__layer cw-ab__layer--{kind}" aria-labelledby="{uid}-{kind}">
		<div class="cw-ab__layer-label">
			<span class="cw-ab__layer-icon cw-ab__layer-icon--{kind}" aria-hidden="true">
				{@render glyph(kind === 'air' ? 'cloud' : 'layers', 18)}
			</span>
			<svelte:element this={layerHeadingTag} id="{uid}-{kind}" class="cw-ab__layer-title">
				{heading}
			</svelte:element>
		</div>
		<ul class="cw-ab__metrics" style:--cw-ab-columns={views.length}>
			{#each views as metric (metric.key)}
				<li class="cw-ab__metric" style:--cw-ab-color={metric.color}>
					<div class="cw-ab__metric-head">
						<span class="cw-ab__metric-icon" aria-hidden="true">{@render glyph(metric.icon, 16)}</span>
						<span class="cw-ab__metric-label" title={metric.label}>{metric.label}</span>
						{#if metric.status}
							<span class="cw-ab__metric-status">
								<CwChip
									size="sm"
									variant="soft"
									tone={cwAboveBelowStatusTone(metric.status)}
									label={metric.statusLabel}
								/>
							</span>
						{/if}
					</div>
					<p class="cw-ab__metric-value">
						<span class="cw-ab__metric-number">{metric.current}</span>
						{#if metric.unit}<span class="cw-ab__metric-unit">{metric.unit}</span>{/if}
					</p>
					<div class="cw-ab__bar" aria-hidden="true">
						{#if metric.bar?.band}
							<span
								class="cw-ab__bar-band"
								style:left="{metric.bar.band.left}%"
								style:width="{metric.bar.band.width}%"
							></span>
						{/if}
						<span class="cw-ab__bar-track"></span>
						{#if metric.bar?.span}
							<span
								class="cw-ab__bar-span"
								style:left="{metric.bar.span.left}%"
								style:width="{metric.bar.span.width}%"
							></span>
						{/if}
						{#if metric.bar && metric.bar.avg !== null}
							<span class="cw-ab__bar-avg" style:left="{metric.bar.avg}%"></span>
						{/if}
						{#if metric.bar && metric.bar.now !== null}
							<span class="cw-ab__bar-now" style:left="{metric.bar.now}%"></span>
						{/if}
					</div>
					<div class="cw-ab__metric-foot">
						<dl class="cw-ab__stats">
							<div><dt>{l.low}</dt><dd>{metric.low}</dd></div>
							<div><dt>{l.average}</dt><dd>{metric.average}</dd></div>
							<div><dt>{l.high}</dt><dd>{metric.high}</dd></div>
						</dl>
						{#if metric.targetLine}<p class="cw-ab__target">{metric.targetLine}</p>{/if}
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/snippet}

<section
	class="cw-ab cw-no-data-host {className}"
	class:cw-ab--tinted={tinted}
	class:cw-no-data-host--active={hasNoData}
	style:--cw-ab-sun={sunColor}
	style:--cw-ab-earth={earthColor}
	aria-labelledby="{uid}-title"
	aria-busy={loading || undefined}
>
	<header class="cw-ab__header">
		<div class="cw-ab__heading">
			<svelte:element this={headingTag} id="{uid}-title" class="cw-ab__title">
				{title ?? l.title}
			</svelte:element>
			{#if subtitle}<p class="cw-ab__subtitle">{subtitle}</p>{/if}
		</div>
		{#if !loading && hasLayers}
			<ul class="cw-ab__legend" aria-label={l.legend}>
				<li><span class="cw-ab__key cw-ab__key--now" aria-hidden="true"></span>{l.legendNow}</li>
				<li><span class="cw-ab__key cw-ab__key--avg" aria-hidden="true"></span>{l.legendAverage}</li>
				<li><span class="cw-ab__key cw-ab__key--range" aria-hidden="true"></span>{l.legendRange}</li>
				{#if hasTargets}
					<li>
						<span class="cw-ab__key cw-ab__key--target" aria-hidden="true"></span>{l.legendTarget(targetName)}
					</li>
				{/if}
			</ul>
		{/if}
	</header>

	{#if loading}
		<div class="cw-ab__skeleton" aria-hidden="true"><span></span><span></span></div>
	{:else if lightView || hasLayers}
		<div class="cw-ab__layers">
			{#if lightView}
				<section class="cw-ab__light" aria-label={l.light}>
					<p class="cw-ab__light-title">
						<span class="cw-ab__layer-icon cw-ab__layer-icon--sun" aria-hidden="true">
							{@render glyph('sun', 14)}
						</span>
						<span>{l.light}</span>
						{#if lightView.current !== null}
							<span class="cw-ab__light-now">
								<span class="cw-visually-hidden">{l.ppfdNow}</span>
								<strong>{lightView.current}</strong>
								<span class="cw-ab__light-unit">{lightView.ppfdUnit}</span>
							</span>
						{/if}
					</p>
					<dl class="cw-ab__light-values">
						{#if lightView.current !== null}
							<div class="cw-ab__light-item cw-ab__light-item--now">
								<dt>{l.ppfdNow}</dt>
								<dd><strong>{lightView.current}</strong> {lightView.ppfdUnit}</dd>
							</div>
						{/if}
						{#if lightView.peak !== null}
							<div class="cw-ab__light-item">
								<dt>{l.ppfdPeak}</dt>
								<dd><strong>{lightView.peak}</strong> {lightView.ppfdUnit}</dd>
							</div>
						{/if}
						{#if lightView.dli !== null}
							<div class="cw-ab__light-item">
								<dt>{l.dliToday}</dt>
								<dd><strong>{lightView.dli}</strong> {lightView.dliUnit}</dd>
							</div>
						{/if}
						{#if lightView.goal !== null}
							<div class="cw-ab__light-item">
								<dt>{l.dliGoal(targetName)}</dt>
								<dd><strong>{lightView.goal}</strong> {lightView.dliTargetUnit}</dd>
							</div>
						{/if}
					</dl>
				</section>
			{/if}
			{#if airViews.length > 0}
				{@render layer('air', l.air, airViews)}
			{/if}
			{#if airViews.length > 0 && groundViews.length > 0}
				<div class="cw-ab__ground-line" aria-hidden="true"><span>{l.groundLevel}</span></div>
			{/if}
			{#if groundViews.length > 0}
				{@render layer('ground', l.ground, groundViews)}
			{/if}
		</div>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-ab {
		--cw-ab-sky: var(--cw-info-500);
		--cw-ab-divider: var(--cw-chart-card-cell-border, var(--cw-border-muted));
		--cw-ab-muted: var(--cw-chart-card-muted, var(--cw-text-muted));
		--cw-ab-surface: var(--cw-chart-card-bg, var(--cw-bg-surface));
		container-type: inline-size;
		display: grid;
		gap: var(--cw-space-4);
		min-width: 0;
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: var(--cw-card-radius);
		background-color: var(--cw-ab-surface);
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-sm));
		color: var(--cw-text-primary);
	}

	/* ── Header ─────────────────────────────────────────── */
	.cw-ab__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-2) var(--cw-space-4);
		min-width: 0;
	}

	.cw-ab__heading {
		display: grid;
		flex: 1 1 16rem;
		gap: var(--cw-space-1);
		min-width: 0;
	}

	.cw-ab__title {
		margin: 0;
		color: var(--cw-chart-card-title, var(--cw-text-primary));
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
	}

	.cw-ab__subtitle {
		margin: 0;
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
	}

	.cw-ab__legend {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-1) var(--cw-space-4);
		margin: 0;
		padding: var(--cw-space-1) 0 0;
		list-style: none;
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-xs);
		line-height: 1rem;
	}

	.cw-ab__legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.cw-ab__key {
		display: inline-block;
		flex: none;
		box-sizing: border-box;
	}

	.cw-ab__key--now {
		width: 0.625rem;
		height: 0.625rem;
		border: 2px solid var(--cw-ab-surface);
		border-radius: var(--cw-radius-full);
		background: var(--cw-text-primary);
		box-shadow: 0 0 0 1px var(--cw-text-primary);
	}

	.cw-ab__key--avg {
		width: 2px;
		height: 0.75rem;
		border-radius: 1px;
		background: var(--cw-text-secondary);
	}

	.cw-ab__key--range {
		width: 1.125rem;
		height: 0.375rem;
		border-radius: var(--cw-radius-full);
		background: var(--cw-border-default);
	}

	.cw-ab__key--target {
		width: 1.125rem;
		height: 0.75rem;
		border: 1px dashed var(--cw-tone-success-border);
		border-radius: 3px;
		background: var(--cw-tone-success-bg-subtle);
	}

	/* ── Layers ─────────────────────────────────────────── */
	.cw-ab__layers {
		min-width: 0;
		overflow: hidden;
		border: 1px solid var(--cw-ab-divider);
		border-radius: var(--cw-radius-lg);
	}

	.cw-ab__layer-icon {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--cw-radius-lg);
	}

	.cw-ab__layer-icon--sun {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--cw-radius-md);
		background: color-mix(in srgb, var(--cw-ab-sun) 18%, transparent);
		color: var(--cw-ab-sun);
	}

	.cw-ab__layer-icon--air {
		background: color-mix(in srgb, var(--cw-ab-sky) 16%, transparent);
		color: var(--cw-tone-info-text);
	}

	.cw-ab__layer-icon--ground {
		background: color-mix(in srgb, var(--cw-ab-earth) 16%, transparent);
		color: var(--cw-ab-earth);
	}

	/* Light strip */
	.cw-ab__light {
		display: grid;
		grid-template-columns: 10.5rem minmax(0, 1fr);
		align-items: center;
		padding: 0.625rem 0;
		border-bottom: 1px solid var(--cw-ab-divider);
	}

	.cw-ab--tinted .cw-ab__light {
		background: color-mix(in srgb, var(--cw-ab-sun) 9%, transparent);
	}

	.cw-ab__light-title {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		margin: 0;
		padding: 0 1.25rem;
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
	}

	.cw-ab__light-now {
		display: none;
		align-items: baseline;
		gap: 0.1875rem;
		margin-left: auto;
		font-variant-numeric: tabular-nums;
	}

	.cw-ab__light-now strong {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-semibold);
		line-height: 1.1;
	}

	.cw-ab__light-unit {
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-normal);
	}

	.cw-ab__light-values {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--cw-space-1) var(--cw-space-8);
		margin: 0;
		padding: 0 1.25rem;
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-xs);
		line-height: 1.25rem;
		font-variant-numeric: tabular-nums;
	}

	.cw-ab__light-item {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
	}

	.cw-ab__light-item dd {
		margin: 0;
	}

	.cw-ab__light-item strong {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
	}

	/* Air and ground layers */
	.cw-ab__layer {
		display: grid;
		grid-template-columns: 10.5rem minmax(0, 1fr);
		padding: var(--cw-space-4) 0;
	}

	.cw-ab--tinted .cw-ab__layer--air {
		background: color-mix(in srgb, var(--cw-ab-sky) 7%, transparent);
	}

	.cw-ab--tinted .cw-ab__layer--ground {
		background: color-mix(in srgb, var(--cw-ab-earth) 8%, transparent);
	}

	.cw-ab__layer-label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.375rem;
		padding: 0 1.25rem;
	}

	/* Clears the "Ground level" label sitting on the line above. */
	.cw-ab__layer--ground .cw-ab__layer-label {
		padding-top: var(--cw-space-2);
	}

	.cw-ab__layer-title {
		margin: 0;
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
	}

	.cw-ab__ground-line {
		position: relative;
		height: 0;
		border-top: 2px solid var(--cw-ab-earth);
	}

	.cw-ab__ground-line span {
		position: absolute;
		top: -0.6875rem;
		left: 1.25rem;
		padding: 0.125rem 0.5rem;
		border: 1px solid var(--cw-ab-earth);
		border-radius: var(--cw-radius-full);
		background: var(--cw-ab-surface);
		color: var(--cw-ab-muted);
		font-size: 0.6875rem;
		font-weight: var(--cw-font-semibold);
		line-height: 0.875rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* ── Readings ───────────────────────────────────────── */
	.cw-ab__metrics {
		display: grid;
		grid-template-columns: repeat(var(--cw-ab-columns, 3), minmax(0, 1fr));
		min-width: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cw-ab__metric {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas: 'head' 'value' 'bar' 'foot';
		row-gap: var(--cw-space-2);
		min-width: 0;
		padding: 0 1.25rem;
	}

	.cw-ab__metric + .cw-ab__metric {
		border-left: 1px solid var(--cw-ab-divider);
	}

	.cw-ab__metric-head {
		grid-area: head;
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-width: 0;
		min-height: 1.375rem;
	}

	.cw-ab__metric-icon {
		display: inline-flex;
		flex: none;
		color: var(--cw-ab-color);
	}

	.cw-ab__metric-label {
		min-width: 0;
		overflow: hidden;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-ab__metric-status {
		display: inline-flex;
		flex: none;
		margin-left: auto;
	}

	.cw-ab__metric-value {
		grid-area: value;
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		margin: 0;
	}

	.cw-ab__metric-number {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-3xl);
		font-weight: var(--cw-font-semibold);
		line-height: 1.1;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
	}

	.cw-ab__metric-unit {
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-sm);
	}

	.cw-ab__bar {
		grid-area: bar;
		position: relative;
		height: 1.25rem;
	}

	.cw-ab__bar > span {
		position: absolute;
		box-sizing: border-box;
	}

	.cw-ab__bar-band {
		top: 2px;
		height: 1rem;
		border: 1px dashed var(--cw-tone-success-border);
		border-radius: var(--cw-radius-sm);
		background: var(--cw-tone-success-bg-subtle);
	}

	.cw-ab__bar-track {
		top: 7px;
		right: 0;
		left: 0;
		height: 6px;
		border-radius: var(--cw-radius-full);
		background: var(--cw-bg-subtle);
	}

	.cw-ab__bar-span {
		top: 7px;
		min-width: 6px;
		height: 6px;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-ab-color) 60%, transparent);
	}

	.cw-ab__bar-avg {
		top: 3px;
		width: 2px;
		height: 14px;
		margin-left: -1px;
		border-radius: 1px;
		background: var(--cw-text-secondary);
	}

	.cw-ab__bar-now {
		top: 4px;
		width: 12px;
		height: 12px;
		margin-left: -6px;
		border: 2px solid var(--cw-ab-surface);
		border-radius: var(--cw-radius-full);
		background: var(--cw-text-primary);
		box-shadow: 0 0 0 1px var(--cw-text-primary);
	}

	.cw-ab__metric-foot {
		grid-area: foot;
		display: grid;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-ab__stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0 var(--cw-space-2);
		margin: 0;
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-xs);
		line-height: 1rem;
		font-variant-numeric: tabular-nums;
	}

	.cw-ab__stats div {
		display: flex;
		gap: 0.25rem;
	}

	.cw-ab__stats dd {
		margin: 0;
		color: var(--cw-text-secondary);
		font-weight: var(--cw-font-semibold);
	}

	.cw-ab__target {
		margin: 0;
		color: var(--cw-ab-muted);
		font-size: var(--cw-text-xs);
		line-height: 1rem;
	}

	/* ── Loading ────────────────────────────────────────── */
	.cw-ab__skeleton {
		display: grid;
		gap: var(--cw-space-3);
	}

	.cw-ab__skeleton span {
		display: block;
		height: 6rem;
		border-radius: var(--cw-radius-lg);
		background: linear-gradient(
			90deg,
			var(--cw-bg-muted) 0%,
			var(--cw-bg-subtle) 50%,
			var(--cw-bg-muted) 100%
		);
		background-size: 200% 100%;
		animation: cw-ab-shimmer 1.4s ease-in-out infinite;
	}

	@keyframes cw-ab-shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-ab__skeleton span {
			animation: none;
		}
	}

	/* ── Tablet width: layer names above the readings ───── */
	@container (max-width: 56rem) {
		.cw-ab__light {
			display: flex;
			flex-wrap: wrap;
			gap: var(--cw-space-1) var(--cw-space-6);
			padding: 0.625rem var(--cw-space-4);
		}

		.cw-ab__light-title,
		.cw-ab__light-values {
			padding: 0;
		}

		.cw-ab__light-values {
			gap: var(--cw-space-1) var(--cw-space-5);
		}

		.cw-ab__layer {
			grid-template-columns: minmax(0, 1fr);
			row-gap: var(--cw-space-3);
			padding: 0.875rem 0 var(--cw-space-4);
		}

		.cw-ab__layer-label,
		.cw-ab__layer--ground .cw-ab__layer-label {
			flex-direction: row;
			align-items: center;
			gap: var(--cw-space-2);
			padding: 0 var(--cw-space-4);
		}

		.cw-ab__layer-icon--air,
		.cw-ab__layer-icon--ground {
			width: 1.75rem;
			height: 1.75rem;
		}

		.cw-ab__ground-line span {
			right: var(--cw-space-4);
			left: auto;
		}

		.cw-ab__metric {
			padding: 0 var(--cw-space-4);
		}

		.cw-ab__metric-label {
			font-size: 0.8125rem;
		}

		.cw-ab__metric-number {
			font-size: var(--cw-text-2xl);
		}
	}

	/* ── Phone width: one row per reading ───────────────── */
	@container (max-width: 40rem) {
		.cw-ab__light {
			display: grid;
			gap: var(--cw-space-1);
			padding: 0.625rem 0.875rem;
		}

		.cw-ab__light-now {
			display: inline-flex;
		}

		.cw-ab__light-item--now {
			display: none;
		}

		.cw-ab__light-values {
			gap: 0.125rem 0.875rem;
			line-height: 1.125rem;
		}

		.cw-ab__light-values strong {
			color: var(--cw-text-secondary);
			font-size: var(--cw-text-xs);
		}

		.cw-ab__layer {
			row-gap: var(--cw-space-1);
			padding: var(--cw-space-3) 0.875rem 0.375rem;
		}

		.cw-ab__layer-label,
		.cw-ab__layer--ground .cw-ab__layer-label {
			padding: 0 0 var(--cw-space-1);
		}

		.cw-ab__ground-line span {
			right: 0.875rem;
		}

		.cw-ab__metrics {
			grid-template-columns: minmax(0, 1fr);
		}

		.cw-ab__metric {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-areas: 'head value' 'bar bar' 'foot foot';
			column-gap: var(--cw-space-2);
			row-gap: 0.375rem;
			padding: 0.625rem 0;
		}

		.cw-ab__metric + .cw-ab__metric {
			border-top: 1px solid var(--cw-ab-divider);
			border-left: 0;
		}

		.cw-ab__metric-label {
			font-size: var(--cw-text-sm);
		}

		.cw-ab__metric-status {
			margin-left: 0;
		}

		.cw-ab__metric-value {
			align-self: center;
			gap: 0.1875rem;
		}

		.cw-ab__metric-number {
			font-size: var(--cw-text-xl);
		}

		.cw-ab__metric-unit {
			font-size: var(--cw-text-xs);
		}

		.cw-ab__metric-foot {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 0.125rem var(--cw-space-3);
		}

		.cw-ab__stats {
			justify-content: flex-start;
			gap: 0 0.625rem;
		}
	}
</style>
