<script lang="ts">
	/**
	 * The picture CwRuleCondition draws for one limit: an example reading over
	 * time with the alert line, the reset line and the four moments that
	 * matter. Internal; it gets its text already filled in.
	 */
	import { ruleExampleGeometry } from '../cwRuleCondition.js';

	interface Props {
		direction: 'below' | 'above';
		title: string;
		note: string;
		/** Names of the two lines ("Alert value", "Reset value") and their values ("5 °C"). */
		alertLine: string;
		alertValue: string;
		resetLine: string;
		resetValue: string;
		zone: string;
		time: string;
		/** What the chart shows, for screen readers. */
		aria: string;
		/** The four numbered steps under the chart. */
		steps: { title: string; text: string }[];
	}

	let {
		direction,
		title,
		note,
		alertLine,
		alertValue,
		resetLine,
		resetValue,
		zone,
		time,
		aria,
		steps
	}: Props = $props();

	const HEIGHT = 210;
	/** Room above the plot, so a marker on the top edge is not cut. */
	const TOP = 20;
	const PLOT = 180;
	/** From this width the two lines are named at their right end; below it, in a legend. */
	const WIDE = 560;
	const GUTTER = 168;
	/** Step 1 and 4 alert, step 3 resets, step 2 changes nothing. */
	const STEP_KINDS = ['alert', 'quiet', 'reset', 'alert'] as const;

	let measured = $state(0);
	// Until the browser has measured it (and on the server) the chart is drawn wide.
	const width = $derived(measured || 760);
	const wide = $derived(width >= WIDE);
	const plotWidth = $derived(Math.max(120, width - (wide ? GUTTER : 0)));
	const radius = $derived(wide ? 12 : 10);
	const geometry = $derived(ruleExampleGeometry(direction, plotWidth, PLOT));
	const labelX = $derived(plotWidth + 12);
</script>

<figure class="cw-rule-example">
	<figcaption class="cw-rule-example__caption">
		<span class="cw-rule-example__title">{title}</span>
		<span class="cw-rule-example__note">{note}</span>
	</figcaption>

	{#if !wide}
		<div class="cw-rule-example__legend" aria-hidden="true">
			<span class="cw-rule-example__legend-item">
				<span class="cw-rule-example__swatch cw-rule-example__swatch--alert"></span>
				<strong>{alertLine}</strong>
				{alertValue}
			</span>
			<span class="cw-rule-example__legend-item">
				<span class="cw-rule-example__swatch cw-rule-example__swatch--reset"></span>
				<strong>{resetLine}</strong>
				{resetValue}
			</span>
		</div>
	{/if}

	<div class="cw-rule-example__chart" bind:clientWidth={measured}>
		<svg role="img" aria-label={aria} viewBox="0 0 {width} {HEIGHT}" width="100%" height={HEIGHT}>
			<g transform="translate(0 {TOP})">
				<rect
					class="cw-rule-example__zone"
					x="0"
					y={geometry.zone.y}
					width={plotWidth}
					height={geometry.zone.height}
				/>
				<line class="cw-rule-example__axis" x1="0" y1={PLOT} x2={plotWidth} y2={PLOT} />
				<line
					class="cw-rule-example__line cw-rule-example__line--alert"
					x1="0"
					y1={geometry.alertY}
					x2={plotWidth}
					y2={geometry.alertY}
				/>
				<line
					class="cw-rule-example__line cw-rule-example__line--reset"
					x1="0"
					y1={geometry.resetY}
					x2={plotWidth}
					y2={geometry.resetY}
				/>
				<polyline class="cw-rule-example__reading" points={geometry.polyline} />
				<text class="cw-rule-example__zone-label" x="8" y={direction === 'below' ? PLOT - 10 : 16}>
					{zone}
				</text>

				{#each geometry.steps as step, index (index)}
					<circle
						class="cw-rule-example__marker cw-rule-example__marker--{STEP_KINDS[index]}"
						cx={step.x}
						cy={step.y}
						r={radius}
					/>
					<text
						class="cw-rule-example__digit cw-rule-example__digit--{STEP_KINDS[index]}"
						x={step.x}
						y={step.y + 4}
					>
						{index + 1}
					</text>
				{/each}

				{#if wide}
					<line
						class="cw-rule-example__line cw-rule-example__line--reset"
						x1={labelX}
						y1={geometry.resetY}
						x2={labelX + 18}
						y2={geometry.resetY}
					/>
					<text class="cw-rule-example__label" x={labelX + 26} y={geometry.resetY + 4}>
						<tspan class="cw-rule-example__label-name">{resetLine}</tspan>
						<tspan dx="4">{resetValue}</tspan>
					</text>
					<line
						class="cw-rule-example__line cw-rule-example__line--alert"
						x1={labelX}
						y1={geometry.alertY}
						x2={labelX + 18}
						y2={geometry.alertY}
					/>
					<text class="cw-rule-example__label" x={labelX + 26} y={geometry.alertY + 4}>
						<tspan class="cw-rule-example__label-name">{alertLine}</tspan>
						<tspan dx="4">{alertValue}</tspan>
					</text>
					<text class="cw-rule-example__time" x={labelX} y={PLOT + 4}>{time} →</text>
				{/if}
			</g>
		</svg>
	</div>

	<ol class="cw-rule-example__steps">
		{#each steps as step, index (index)}
			<li class="cw-rule-example__step">
				<span
					class="cw-rule-example__badge cw-rule-example__badge--{STEP_KINDS[index]}"
					aria-hidden="true"
				>
					{index + 1}
				</span>
				<span class="cw-rule-example__step-text">
					<strong>{step.title}</strong>
					{step.text}
				</span>
			</li>
		{/each}
	</ol>
</figure>

<style>
	.cw-rule-example {
		/* Checked as a pair for colour-blind separation and contrast on both themes. */
		--_alert: var(--cw-rule-alert, var(--cw-status-alarm));
		--_reset: var(--cw-rule-reset, var(--cw-info-500));
		--_surface: var(--cw-chart-card-bg, var(--cw-bg-surface));
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		margin: 0;
		padding: var(--cw-space-4);
		background-color: var(--_surface);
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-muted));
		border-radius: var(--cw-card-radius);
	}

	.cw-rule-example__caption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--cw-space-1) var(--cw-space-4);
	}

	.cw-rule-example__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-rule-example__note {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-rule-example__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-1) var(--cw-space-4);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
	}

	.cw-rule-example__legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.cw-rule-example__legend-item strong {
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-rule-example__swatch {
		width: 1rem;
		height: 2px;
	}

	.cw-rule-example__swatch--alert {
		background-color: var(--_alert);
	}

	.cw-rule-example__swatch--reset {
		background-color: var(--_reset);
	}

	.cw-rule-example__chart {
		min-width: 0;
	}

	.cw-rule-example__chart svg {
		display: block;
		font-family: var(--cw-font-family);
	}

	.cw-rule-example__zone {
		fill: var(--_alert);
		fill-opacity: 0.13;
	}

	.cw-rule-example__axis {
		stroke: var(--cw-border-muted);
		stroke-width: 1;
	}

	.cw-rule-example__line {
		stroke-width: 2;
	}

	.cw-rule-example__line--alert {
		stroke: var(--_alert);
	}

	.cw-rule-example__line--reset {
		stroke: var(--_reset);
	}

	.cw-rule-example__reading {
		fill: none;
		stroke: var(--cw-text-secondary);
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.cw-rule-example__zone-label,
	.cw-rule-example__label,
	.cw-rule-example__time {
		font-size: 12px;
		fill: var(--cw-text-secondary);
	}

	.cw-rule-example__time {
		fill: var(--cw-text-muted);
	}

	.cw-rule-example__label-name {
		font-weight: var(--cw-font-semibold);
		fill: var(--cw-text-primary);
	}

	/* A ring in the surface colour keeps a marker apart from the line under it. */
	.cw-rule-example__marker {
		stroke: var(--_surface);
		stroke-width: 2;
	}

	.cw-rule-example__marker--alert {
		fill: var(--_alert);
	}

	.cw-rule-example__marker--reset {
		fill: var(--_reset);
	}

	.cw-rule-example__marker--quiet {
		fill: var(--_surface);
		stroke: var(--cw-text-secondary);
	}

	.cw-rule-example__digit {
		font-size: 12px;
		font-weight: var(--cw-font-bold);
		text-anchor: middle;
	}

	.cw-rule-example__digit--alert {
		fill: #ffffff;
	}

	.cw-rule-example__digit--reset {
		fill: #07111d;
	}

	.cw-rule-example__digit--quiet {
		fill: var(--cw-text-primary);
	}

	.cw-rule-example__steps {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--cw-space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@container (min-width: 40rem) {
		.cw-rule-example__steps {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: var(--cw-space-4);
		}
	}

	.cw-rule-example__step {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
	}

	.cw-rule-example__badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 1.375rem;
		height: 1.375rem;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		border-radius: var(--cw-radius-full);
	}

	.cw-rule-example__badge--alert {
		color: #ffffff;
		background-color: var(--_alert);
	}

	.cw-rule-example__badge--reset {
		color: #07111d;
		background-color: var(--_reset);
	}

	.cw-rule-example__badge--quiet {
		color: var(--cw-text-primary);
		border: 2px solid var(--cw-text-secondary);
	}

	.cw-rule-example__step-text {
		font-size: var(--cw-text-xs);
		line-height: 1.45;
		color: var(--cw-text-secondary);
	}

	.cw-rule-example__step-text strong {
		display: block;
		font-size: 0.8125rem;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}
</style>
