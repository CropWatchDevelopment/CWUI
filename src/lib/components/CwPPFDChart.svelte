<script lang="ts">
	import type { CwPPFDStatus, CwPPFDTick } from '../types/index.js';

	interface Props {
		current: number;
		targetMin: number;
		targetMax: number;
		plant?: string;
		unit?: string;
		domainMin?: number;
		domainMax?: number;
		ticks?: Array<number | CwPPFDTick>;
		dliToday?: number;
		updatedAt?: string | Date | number;
		showSummary?: boolean;
		showDelta?: boolean;
		lowLabel?: string;
		optimalLabel?: string;
		highLabel?: string;
		class?: string;
	}

	let {
		current,
		targetMin,
		targetMax,
		plant = '',
		unit = 'µmol/m²/s',
		domainMin = 0,
		domainMax,
		ticks,
		dliToday,
		updatedAt,
		showSummary = true,
		showDelta = true,
		lowLabel = 'Low',
		optimalLabel = 'Optimal',
		highLabel = 'High',
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const ppfdFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
	const dliFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});

	function roundUpToStep(value: number, step: number): number {
		return Math.ceil(value / step) * step;
	}

	function clampPercent(value: number): number {
		return Math.max(0, Math.min(100, value));
	}

	function toDate(input: string | Date | number): Date {
		if (input instanceof Date) return input;
		if (typeof input === 'number') {
			return new Date(input < 1_000_000_000_000 ? input * 1000 : input);
		}
		return new Date(input);
	}

	function formatUpdatedAt(input: string | Date | number): string {
		const date = toDate(input);
		return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
	}

	function normalizeTick(tick: number | CwPPFDTick): CwPPFDTick {
		if (typeof tick === 'number') {
			return { value: tick, label: ppfdFormatter.format(tick) };
		}

		return {
			value: tick.value,
			label: tick.label ?? ppfdFormatter.format(tick.value)
		};
	}

	const normalizedRange = $derived.by(() => ({
		min: Math.min(targetMin, targetMax),
		max: Math.max(targetMin, targetMax)
	}));

	const computedDomainMax = $derived.by(() => {
		const baseline = Math.max(
			1200,
			normalizedRange.max * 1.3,
			current * 1.1,
			domainMin + 200
		);
		const requested = domainMax ?? baseline;
		const guaranteedMax = Math.max(
			requested,
			normalizedRange.max,
			current,
			domainMin + 200
		);

		return roundUpToStep(guaranteedMax, 200);
	});

	function scale(value: number): number {
		const span = computedDomainMax - domainMin || 1;
		return ((value - domainMin) / span) * 100;
	}

	const lowBoundaryPercent = $derived(clampPercent(scale(normalizedRange.min)));
	const highBoundaryPercent = $derived(clampPercent(scale(normalizedRange.max)));
	const markerPercent = $derived(clampPercent(scale(current)));
	const optimalWidth = $derived(Math.max(0, highBoundaryPercent - lowBoundaryPercent));
	const markerAlign = $derived(
		markerPercent <= 10 ? 'start' : markerPercent >= 90 ? 'end' : 'center'
	);
	const showTargetTag = $derived(optimalWidth >= 16);
	const trackGradient = $derived(
		`linear-gradient(90deg, var(--cw-ppfd-low) 0%, var(--cw-ppfd-low) ${lowBoundaryPercent}%, var(--cw-ppfd-optimal) ${lowBoundaryPercent}%, var(--cw-ppfd-optimal) ${highBoundaryPercent}%, var(--cw-ppfd-high) ${highBoundaryPercent}%, var(--cw-ppfd-high) 100%)`
	);

	const status = $derived.by<CwPPFDStatus>(() => {
		if (current < normalizedRange.min) return 'low';
		if (current > normalizedRange.max) return 'high';
		return 'optimal';
	});

	const statusLabel = $derived(
		status === 'low' ? 'Too low' : status === 'high' ? 'Too high' : 'Optimal'
	);
	const heading = $derived(plant.trim() ? `${plant} PPFD` : 'PPFD range gauge');
	const formattedCurrent = $derived(`${ppfdFormatter.format(current)} ${unit}`);
	const formattedTargetRange = $derived(
		`${ppfdFormatter.format(normalizedRange.min)}-${ppfdFormatter.format(normalizedRange.max)} ${unit}`
	);
	const formattedDli = $derived(
		dliToday === undefined ? '' : `${dliFormatter.format(dliToday)} mol/m²/day`
	);
	const updatedLabel = $derived(updatedAt === undefined ? '' : formatUpdatedAt(updatedAt));
	const deltaMessage = $derived.by(() => {
		if (!showDelta) return '';
		if (status === 'low') {
			return `${ppfdFormatter.format(normalizedRange.min - current)} ${unit} below target`;
		}
		if (status === 'high') {
			return `${ppfdFormatter.format(current - normalizedRange.max)} ${unit} above target`;
		}
		return 'Inside target band';
	});

	const gaugeTicks = $derived.by(() => {
		if (ticks?.length) {
			return ticks
				.map(normalizeTick)
				.filter((tick) => tick.value >= domainMin && tick.value <= computedDomainMax)
				.sort((a, b) => a.value - b.value);
		}

		const count = Math.floor((computedDomainMax - domainMin) / 200) + 1;
		return Array.from({ length: count }, (_, index) => {
			const value = domainMin + index * 200;
			return { value, label: ppfdFormatter.format(value) };
		});
	});

	const srSummary = $derived.by(() => {
		const parts = [
			heading,
			`Current ${formattedCurrent}`,
			`Target ${formattedTargetRange}`,
			`Status ${statusLabel}`
		];

		if (deltaMessage) parts.push(deltaMessage);
		if (formattedDli) parts.push(`DLI today ${formattedDli}`);
		return `${parts.join('. ')}.`;
	});
</script>

<section class="cw-ppfd-chart {className}">
	<div class="cw-ppfd-chart__header">
		<div class="cw-ppfd-chart__header-copy">
			<p class="cw-ppfd-chart__eyebrow">Photosynthetic Photon Flux Density</p>
			<h3 id="{uid}-title" class="cw-ppfd-chart__title">{heading}</h3>
			{#if updatedLabel}
				<p class="cw-ppfd-chart__updated">Updated {updatedLabel}</p>
			{/if}
		</div>

		<div class="cw-ppfd-chart__reading">
			<span class="cw-ppfd-chart__reading-label">Current PPFD</span>
			<strong class="cw-ppfd-chart__reading-value">{formattedCurrent}</strong>
		</div>
	</div>

	{#if showSummary}
		<dl class="cw-ppfd-chart__stats">
			<div class="cw-ppfd-chart__stat">
				<dt>Target range</dt>
				<dd>{formattedTargetRange}</dd>
			</div>

			<div class="cw-ppfd-chart__stat cw-ppfd-chart__stat--status cw-ppfd-chart__stat--{status}">
				<dt>Status</dt>
				<dd>{statusLabel}</dd>
			</div>

			{#if formattedDli}
				<div class="cw-ppfd-chart__stat">
					<dt>DLI today</dt>
					<dd>{formattedDli}</dd>
				</div>
			{/if}
		</dl>
	{/if}

	<div
		class="cw-ppfd-chart__gauge-shell"
		aria-labelledby="{uid}-title"
		aria-describedby="{uid}-summary"
	>
		<p id="{uid}-summary" class="cw-ppfd-chart__sr-only">{srSummary}</p>

		<div class="cw-ppfd-chart__zone-legend" aria-hidden="true">
			<span class="cw-ppfd-chart__zone-pill cw-ppfd-chart__zone-pill--low">{lowLabel}</span>
			<span class="cw-ppfd-chart__zone-pill cw-ppfd-chart__zone-pill--optimal">
				{optimalLabel}
			</span>
			<span class="cw-ppfd-chart__zone-pill cw-ppfd-chart__zone-pill--high">{highLabel}</span>
		</div>

		<div class="cw-ppfd-chart__stage">
			<div
				class="cw-ppfd-chart__marker-label cw-ppfd-chart__marker-label--{markerAlign}"
				style:left="{markerPercent}%"
			>
				<span>Current</span>
				<strong>{formattedCurrent}</strong>
			</div>

			<div class="cw-ppfd-chart__track" style:background={trackGradient}>
				{#if showTargetTag}
					<div
						class="cw-ppfd-chart__target-pill"
						style:left="{lowBoundaryPercent + optimalWidth / 2}%"
					>
						{formattedTargetRange}
					</div>
				{/if}

				<span class="cw-ppfd-chart__marker-line" style:left="{markerPercent}%"></span>
			</div>

			<div class="cw-ppfd-chart__ticks" aria-hidden="true">
				{#each gaugeTicks as tick, index (tick.value)}
					<div
						class="cw-ppfd-chart__tick
							{index === 0 ? ' cw-ppfd-chart__tick--start' : ''}
							{index === gaugeTicks.length - 1 ? ' cw-ppfd-chart__tick--end' : ''}"
						style:left="{clampPercent(scale(tick.value))}%"
					>
						<span class="cw-ppfd-chart__tick-mark"></span>
						<span class="cw-ppfd-chart__tick-label">{tick.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#if showDelta}
		<p class="cw-ppfd-chart__delta cw-ppfd-chart__delta--{status}">{deltaMessage}</p>
	{/if}
</section>

<style>
	.cw-ppfd-chart {
		--cw-ppfd-low: color-mix(in srgb, var(--cw-warning-500) 76%, var(--cw-bg-surface));
		--cw-ppfd-optimal: color-mix(in srgb, var(--cw-success-500) 76%, var(--cw-bg-surface));
		--cw-ppfd-high: color-mix(in srgb, var(--cw-danger-500) 72%, var(--cw-bg-surface));
		border: 1px solid var(--cw-chart-card-border, var(--cw-border-default));
		border-radius: 1.5rem;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 94%, transparent),
				var(--cw-chart-card-bg, var(--cw-bg-surface))
			);
		box-shadow: var(--cw-chart-card-shadow, var(--cw-shadow-md));
		color: var(--cw-text-primary);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-5);
		padding: var(--cw-space-6);
	}

	.cw-ppfd-chart__header {
		align-items: flex-start;
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
		justify-content: space-between;
	}

	.cw-ppfd-chart__header-copy {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
	}

	.cw-ppfd-chart__eyebrow {
		color: var(--cw-chart-card-muted, var(--cw-text-muted));
		font-size: var(--cw-text-xs);
		letter-spacing: 0.18em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__title {
		font-size: var(--cw-text-2xl);
		font-weight: var(--cw-font-semibold);
		letter-spacing: -0.02em;
		margin: 0;
	}

	.cw-ppfd-chart__updated {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin: 0;
	}

	.cw-ppfd-chart__reading {
		background: color-mix(in srgb, var(--cw-bg-muted) 62%, var(--cw-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 80%, transparent);
		border-radius: var(--cw-radius-xl);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: min(100%, 14rem);
		padding: var(--cw-space-4);
	}

	.cw-ppfd-chart__reading-label {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__reading-value {
		font-size: clamp(1.5rem, 2vw, 2rem);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.cw-ppfd-chart__stats {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		margin: 0;
	}

	.cw-ppfd-chart__stat {
		background: color-mix(in srgb, var(--cw-bg-muted) 48%, var(--cw-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 76%, transparent);
		border-radius: var(--cw-radius-xl);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		min-width: 0;
		padding: var(--cw-space-4);
	}

	.cw-ppfd-chart__stat dt {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		letter-spacing: 0.12em;
		margin: 0;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__stat dd {
		font-size: var(--cw-text-lg);
		font-variant-numeric: tabular-nums;
		font-weight: var(--cw-font-semibold);
		margin: 0;
	}

	.cw-ppfd-chart__stat--status {
		border-color: transparent;
	}

	.cw-ppfd-chart__stat--low {
		background: color-mix(in srgb, var(--cw-warning-100) 60%, transparent);
		color: var(--cw-tone-warning-text);
	}

	.cw-ppfd-chart__stat--optimal {
		background: color-mix(in srgb, var(--cw-success-100) 40%, transparent);
		color: var(--cw-tone-success-text);
	}

	.cw-ppfd-chart__stat--high {
		background: color-mix(in srgb, var(--cw-danger-100) 34%, transparent);
		color: var(--cw-tone-danger-text);
	}

	.cw-ppfd-chart__gauge-shell {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
	}

	.cw-ppfd-chart__zone-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.cw-ppfd-chart__zone-pill {
		border: 1px solid transparent;
		border-radius: var(--cw-radius-full);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		padding: 0.3rem 0.65rem;
	}

	.cw-ppfd-chart__zone-pill--low {
		background: color-mix(in srgb, var(--cw-warning-100) 70%, transparent);
		border-color: color-mix(in srgb, var(--cw-warning-400) 48%, transparent);
		color: var(--cw-tone-warning-text);
	}

	.cw-ppfd-chart__zone-pill--optimal {
		background: color-mix(in srgb, var(--cw-success-100) 40%, transparent);
		border-color: color-mix(in srgb, var(--cw-success-400) 48%, transparent);
		color: var(--cw-tone-success-text);
	}

	.cw-ppfd-chart__zone-pill--high {
		background: color-mix(in srgb, var(--cw-danger-100) 32%, transparent);
		border-color: color-mix(in srgb, var(--cw-danger-400) 42%, transparent);
		color: var(--cw-tone-danger-text);
	}

	.cw-ppfd-chart__stage {
		padding-top: 3.25rem;
		position: relative;
	}

	.cw-ppfd-chart__marker-label {
		background: color-mix(in srgb, var(--cw-bg-elevated) 94%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		border-radius: var(--cw-radius-lg);
		box-shadow: 0 8px 18px color-mix(in srgb, var(--cw-bg-base) 26%, transparent);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		max-width: min(15rem, 78vw);
		padding: 0.55rem 0.75rem;
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		z-index: 2;
	}

	.cw-ppfd-chart__marker-label--start {
		transform: translateX(0);
	}

	.cw-ppfd-chart__marker-label--end {
		transform: translateX(-100%);
	}

	.cw-ppfd-chart__marker-label span {
		color: var(--cw-text-muted);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.cw-ppfd-chart__marker-label strong {
		font-size: var(--cw-text-sm);
		font-variant-numeric: tabular-nums;
	}

	.cw-ppfd-chart__track {
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 70%, transparent);
		border-radius: var(--cw-radius-full);
		box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 10%, transparent);
		height: 1rem;
		position: relative;
	}

	.cw-ppfd-chart__target-pill {
		background: color-mix(in srgb, var(--cw-bg-base) 48%, transparent);
		border: 1px solid color-mix(in srgb, #ffffff 14%, transparent);
		border-radius: var(--cw-radius-full);
		color: var(--cw-text-primary);
		font-size: 0.68rem;
		font-variant-numeric: tabular-nums;
		padding: 0.15rem 0.55rem;
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		white-space: nowrap;
	}

	.cw-ppfd-chart__marker-line {
		background: #ffffff;
		border-radius: var(--cw-radius-full);
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--cw-gray-950) 28%, transparent),
			0 10px 18px color-mix(in srgb, var(--cw-bg-base) 34%, transparent);
		height: 3.8rem;
		left: 0;
		position: absolute;
		top: -2.4rem;
		transform: translateX(-50%);
		width: 0.2rem;
		z-index: 1;
	}

	.cw-ppfd-chart__marker-line::after {
		background: #ffffff;
		border: 2px solid color-mix(in srgb, var(--cw-gray-950) 18%, transparent);
		border-radius: var(--cw-radius-full);
		content: '';
		height: 0.7rem;
		left: 50%;
		position: absolute;
		top: 2.05rem;
		transform: translate(-50%, -50%);
		width: 0.7rem;
	}

	.cw-ppfd-chart__ticks {
		height: 2.5rem;
		margin-top: 0.7rem;
		position: relative;
	}

	.cw-ppfd-chart__tick {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		left: 0;
		position: absolute;
		top: 0;
		transform: translateX(-50%);
	}

	.cw-ppfd-chart__tick--start {
		transform: translateX(0);
	}

	.cw-ppfd-chart__tick--end {
		transform: translateX(-100%);
	}

	.cw-ppfd-chart__tick-mark {
		background: color-mix(in srgb, var(--cw-border-strong) 80%, transparent);
		border-radius: var(--cw-radius-full);
		height: 0.55rem;
		width: 1px;
	}

	.cw-ppfd-chart__tick-label {
		color: var(--cw-text-muted);
		font-size: 0.68rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.cw-ppfd-chart__delta {
		border-radius: var(--cw-radius-lg);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		margin: 0;
		padding: 0.8rem 0.95rem;
	}

	.cw-ppfd-chart__delta--low {
		background: color-mix(in srgb, var(--cw-warning-100) 68%, transparent);
		color: var(--cw-tone-warning-text);
	}

	.cw-ppfd-chart__delta--optimal {
		background: color-mix(in srgb, var(--cw-success-100) 44%, transparent);
		color: var(--cw-tone-success-text);
	}

	.cw-ppfd-chart__delta--high {
		background: color-mix(in srgb, var(--cw-danger-100) 34%, transparent);
		color: var(--cw-tone-danger-text);
	}

	.cw-ppfd-chart__sr-only {
		border: 0;
		clip: rect(0 0 0 0);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}

	@media (max-width: 640px) {
		.cw-ppfd-chart {
			padding: var(--cw-space-5);
		}

		.cw-ppfd-chart__reading {
			width: 100%;
		}

		.cw-ppfd-chart__stats {
			grid-template-columns: 1fr;
		}

		.cw-ppfd-chart__tick:nth-child(even):not(.cw-ppfd-chart__tick--start):not(
				.cw-ppfd-chart__tick--end
			)
			.cw-ppfd-chart__tick-label {
			display: none;
		}
	}
</style>
