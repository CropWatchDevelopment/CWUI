<script lang="ts">
	import { onMount } from 'svelte';
	import type { CwLineChartDataPoint, CwLineChartSecondaryDataPoint } from '../types/index.js';

	interface Props {
		/** Primary data series (required) */
		data: CwLineChartDataPoint[];
		/** Optional secondary data series (right Y-axis) */
		secondaryData?: CwLineChartSecondaryDataPoint[];
		/** Horizontal threshold line value */
		threshold?: number;
		/** Left Y-axis label */
		primaryLabel?: string;
		/** Right Y-axis label */
		secondaryLabel?: string;
		/** Primary unit (e.g. "°C") */
		primaryUnit?: string;
		/** Secondary unit */
		secondaryUnit?: string;
		/** Chart height in px */
		height?: number;
		/** Show grid lines */
		showGrid?: boolean;
		class?: string;
	}

	let {
		data,
		secondaryData = [],
		threshold,
		primaryLabel = 'Value',
		secondaryLabel = 'Secondary',
		primaryUnit = '',
		secondaryUnit = '',
		height = 300,
		showGrid = true,
		class: className = ''
	}: Props = $props();

	/* ── Refs & state ─────────────────────────────────── */
	let chartContainer: HTMLDivElement | undefined = $state(undefined);
	let width = $state(600);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let showPrimary = $state(true);
	let showSecondary = $state(true);
	let showThreshold = $state(true);

	interface TooltipPayload {
		primary: CwLineChartDataPoint | null;
		secondary: CwLineChartSecondaryDataPoint | null;
	}
	let tooltipData = $state<TooltipPayload | null>(null);

	const uid = $props.id();

	/* ── Margins ──────────────────────────────────────── */
	const margin = $derived({
		top: 20,
		right: secondaryData.length > 0 ? 60 : 20,
		bottom: 60,
		left: 60
	});

	/* ── Derived dimensions ───────────────────────────── */
	const chartWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const chartHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	/* ── Y range (primary) ────────────────────────────── */
	const primaryRange = $derived.by(() => {
		const vals = showPrimary ? data.map((d) => d.value) : [];
		if (showThreshold && threshold !== undefined) vals.push(threshold);
		if (vals.length === 0) return { min: 0, max: 1 };
		const mn = Math.min(...vals);
		const mx = Math.max(...vals);
		const pad = (mx - mn) * 0.1 || 1;
		return { min: mn - pad, max: mx + pad };
	});

	/* ── Y range (secondary) ──────────────────────────── */
	const secondaryRange = $derived.by(() => {
		if (!secondaryData.length) return { min: 0, max: 1 };
		const vals = showSecondary ? secondaryData.map((d) => d.value) : [];
		if (vals.length === 0) return { min: 0, max: 1 };
		const mn = Math.min(...vals);
		const mx = Math.max(...vals);
		const pad = (mx - mn) * 0.1 || 1;
		return { min: mn - pad, max: mx + pad };
	});

	/* ── Tick calculation ─────────────────────────────── */
	function calcTicks(min: number, max: number): number[] {
		const range = max - min;
		let step: number;
		if (range <= 1) step = 0.1;
		else if (range <= 5) step = 0.5;
		else if (range <= 10) step = 1;
		else if (range <= 50) step = 5;
		else if (range <= 100) step = 10;
		else if (range <= 500) step = 50;
		else step = Math.ceil(range / 10);
		const ticks: number[] = [];
		let v = Math.ceil(min / step) * step;
		while (v <= max) {
			ticks.push(Math.round(v * 1000) / 1000);
			v += step;
		}
		return ticks;
	}

	const primaryTicks = $derived(calcTicks(primaryRange.min, primaryRange.max));
	const secondaryTicks = $derived(calcTicks(secondaryRange.min, secondaryRange.max));

	/* ── X (time) range ───────────────────────────────── */
	const timeRange = $derived.by(() => {
		const allTimes = [
			...data.map((d) => new Date(d.timestamp).getTime()),
			...secondaryData.map((d) => new Date(d.timestamp).getTime())
		];
		if (allTimes.length === 0) {
			const now = Date.now();
			return { min: now - 86400000, max: now };
		}
		return { min: Math.min(...allTimes), max: Math.max(...allTimes) };
	});

	/* ── Scale functions ──────────────────────────────── */
	function scaleX(timestamp: string | Date): number {
		const t = new Date(timestamp).getTime();
		const span = timeRange.max - timeRange.min || 1;
		return ((t - timeRange.min) / span) * chartWidth;
	}

	function scalePrimaryY(value: number): number {
		const span = primaryRange.max - primaryRange.min || 1;
		return chartHeight - ((value - primaryRange.min) / span) * chartHeight;
	}

	function scaleSecondaryY(value: number): number {
		const span = secondaryRange.max - secondaryRange.min || 1;
		return chartHeight - ((value - secondaryRange.min) / span) * chartHeight;
	}

	/* ── SVG paths ────────────────────────────────────── */
	const primaryPath = $derived(
		data
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.timestamp)} ${scalePrimaryY(d.value)}`)
			.join(' ')
	);

	const secondaryPath = $derived(
		secondaryData
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.timestamp)} ${scaleSecondaryY(d.value)}`)
			.join(' ')
	);

	/* ── Time labels ──────────────────────────────────── */
	const timeLabels = $derived.by(() => {
		const count = Math.min(8, Math.max(2, Math.floor(chartWidth / 80)));
		const span = timeRange.max - timeRange.min;
		const step = span / (count - 1 || 1);
		const labels: { time: number; text: string }[] = [];
		const oneDay = 86400000;
		const oneWeek = oneDay * 7;

		for (let i = 0; i < count; i++) {
			const t = timeRange.min + step * i;
			const d = new Date(t);
			let text: string;
			if (span < oneDay) {
				text = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
			} else if (span < oneWeek) {
				text = d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' +
					d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
			} else {
				text = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
			}
			labels.push({ time: t, text });
		}
		return labels;
	});

	/* ── Mouse interaction ────────────────────────────── */
	function handleMouseMove(event: MouseEvent) {
		if (!chartContainer) return;
		const rect = chartContainer.getBoundingClientRect();
		const relX = event.clientX - rect.left - margin.left;
		mouseX = event.clientX - rect.left;
		mouseY = event.clientY - rect.top;

		if (relX < 0 || relX > chartWidth) {
			tooltipData = null;
			return;
		}

		let closestPrimary: CwLineChartDataPoint | null = null;
		let closestDist = Infinity;
		for (const d of data) {
			const dist = Math.abs(scaleX(d.timestamp) - relX);
			if (dist < closestDist) {
				closestDist = dist;
				closestPrimary = d;
			}
		}

		let closestSecondary: CwLineChartSecondaryDataPoint | null = null;
		let closestSecDist = Infinity;
		for (const d of secondaryData) {
			const dist = Math.abs(scaleX(d.timestamp) - relX);
			if (dist < closestSecDist) {
				closestSecDist = dist;
				closestSecondary = d;
			}
		}

		tooltipData = { primary: closestPrimary, secondary: closestSecondary };
	}

	function handleMouseLeave() {
		tooltipData = null;
	}

	/* ── Tooltip position (clamped) ───────────────────── */
	const tooltipLeft = $derived(Math.min(mouseX + 15, width - 180));
	const tooltipTop = $derived(Math.max(10, mouseY - 70));

	/* ── ResizeObserver ───────────────────────────────── */
	onMount(() => {
		if (!chartContainer) return;
		const observer = new ResizeObserver((entries) => {
			width = entries[0].contentRect.width;
		});
		observer.observe(chartContainer);
		return () => observer.disconnect();
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="cw-lchart {className}"
	bind:this={chartContainer}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	<svg
		width={width}
		height={height}
		style="overflow:visible"
	>
		<defs>
			<linearGradient id="lineGradient-{uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={chartHeight}>
				<stop offset="0%"   stop-color="rgb(239 68 68)"  />
				<stop offset="25%"  stop-color="rgb(249 115 22)" />
				<stop offset="50%"  stop-color="rgb(234 179 8)"  />
				<stop offset="75%"  stop-color="rgb(34 197 94)"  />
				<stop offset="100%" stop-color="rgb(59 130 246)" />
			</linearGradient>
		</defs>

		<g transform="translate({margin.left},{margin.top})">
			<!-- Grid lines -->
			{#if showGrid}
				{#each primaryTicks as tick}
					<line
						x1="0" y1={scalePrimaryY(tick)} x2={chartWidth} y2={scalePrimaryY(tick)}
						class="cw-lchart__grid"
					/>
				{/each}
				{#each timeLabels as lbl}
					{@const x = ((lbl.time - timeRange.min) / (timeRange.max - timeRange.min || 1)) * chartWidth}
					<line
						x1={x} y1="0" x2={x} y2={chartHeight}
						class="cw-lchart__grid"
					/>
				{/each}
			{/if}

			<!-- Threshold line -->
			{#if showThreshold && threshold !== undefined}
				{@const ty = scalePrimaryY(threshold)}
				<line x1="0" y1={ty} x2={chartWidth} y2={ty} class="cw-lchart__threshold" />
				<text x={chartWidth + 4} y={ty + 4} class="cw-lchart__threshold-label">
					{threshold}{primaryUnit}
				</text>
			{/if}

			<!-- Primary line -->
			{#if showPrimary && data.length > 1}
				<path
					d={primaryPath}
					fill="none"
					stroke="url(#lineGradient-{uid})"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/if}

			<!-- Secondary line -->
			{#if showSecondary && secondaryData.length > 1}
				<path
					d={secondaryPath}
					fill="none"
					stroke="rgb(168 85 247)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray="6,3"
				/>
			{/if}

			<!-- Primary data points -->
			{#if showPrimary}
				{#each data as point}
					{@const cx = scaleX(point.timestamp)}
					{@const cy = scalePrimaryY(point.value)}
					<circle
						{cx} {cy} r="3"
						fill={threshold !== undefined && point.value > threshold ? 'rgb(239 68 68)' : 'rgb(59 130 246)'}
						stroke="rgb(15 23 42)"
						stroke-width="1"
					/>
				{/each}
			{/if}

			<!-- Alert markers -->
			{#if showPrimary}
				{#each data.filter((d) => d.alert) as point}
					{@const ax = scaleX(point.timestamp)}
					{@const ay = scalePrimaryY(point.value)}
					<g transform="translate({ax},{ay - 20})">
						<circle
							r="10"
							fill={point.alert?.severity === 'critical' ? 'rgb(239 68 68)' : 'rgb(245 158 11)'}
							stroke="rgb(15 23 42)"
							stroke-width="2"
							class="cw-lchart__pulse"
						/>
						<text y="4" fill="white" font-size="12" font-weight="bold" text-anchor="middle">!</text>
					</g>
				{/each}
			{/if}

			<!-- ─── LEFT Y-AXIS ─── -->
			<line x1="0" y1="0" x2="0" y2={chartHeight} class="cw-lchart__axis" />
			{#each primaryTicks as tick}
				{@const y = scalePrimaryY(tick)}
				<line x1="-5" y1={y} x2="0" y2={y} class="cw-lchart__axis" />
				<text x="-10" y={y} class="cw-lchart__tick cw-lchart__tick--left">{tick}</text>
			{/each}
			<text
				x={-chartHeight / 2}
				y="-45"
				transform="rotate(-90)"
				class="cw-lchart__axis-label cw-lchart__axis-label--primary"
			>
				{primaryLabel}
			</text>

			<!-- ─── RIGHT Y-AXIS ─── -->
			{#if secondaryData.length > 0}
				<line x1={chartWidth} y1="0" x2={chartWidth} y2={chartHeight} class="cw-lchart__axis" />
				{#each secondaryTicks as tick}
					{@const y = scaleSecondaryY(tick)}
					<line x1={chartWidth} y1={y} x2={chartWidth + 5} y2={y} class="cw-lchart__axis" />
					<text x={chartWidth + 10} y={y} class="cw-lchart__tick cw-lchart__tick--right">{tick}</text>
				{/each}
				<text
					x={chartHeight / 2}
					y={-chartWidth - 45}
					transform="rotate(90)"
					class="cw-lchart__axis-label cw-lchart__axis-label--secondary"
				>
					{secondaryLabel}
				</text>
			{/if}

			<!-- ─── X-AXIS ─── -->
			<line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} class="cw-lchart__axis" />
			{#each timeLabels as lbl}
				{@const x = ((lbl.time - timeRange.min) / (timeRange.max - timeRange.min || 1)) * chartWidth}
				<line x1={x} y1={chartHeight} x2={x} y2={chartHeight + 5} class="cw-lchart__axis" />
				<text
					x={x}
					y={chartHeight + 12}
					transform="rotate(-45,{x},{chartHeight + 12})"
					class="cw-lchart__time-label"
				>
					{lbl.text}
				</text>
			{/each}

			<!-- Hover crosshair -->
			{#if tooltipData}
				{@const hoverX = mouseX - margin.left}
				{#if hoverX >= 0 && hoverX <= chartWidth}
					<line
						x1={hoverX} y1="0" x2={hoverX} y2={chartHeight}
						stroke="rgb(148 163 184)"
						stroke-width="1"
						stroke-dasharray="3,3"
						opacity="0.5"
					/>
				{/if}
			{/if}
		</g>
	</svg>

	<!-- Tooltip -->
	{#if tooltipData}
		<div
			class="cw-lchart__tooltip"
			style="left:{tooltipLeft}px;top:{tooltipTop}px"
		>
			{#if tooltipData.primary && showPrimary}
				<div class="cw-lchart__tt-row">
					<span class="cw-lchart__dot cw-lchart__dot--sky"></span>
					<span class="cw-lchart__tt-muted">{primaryLabel}:</span>
					<span class="cw-lchart__tt-value">{tooltipData.primary.value.toFixed(2)}{primaryUnit}</span>
				</div>
				<div class="cw-lchart__tt-time">
					{new Date(tooltipData.primary.timestamp).toLocaleString()}
				</div>
				{#if tooltipData.primary.alert}
					<div class="cw-lchart__tt-alert">
						<svg viewBox="0 0 16 16" fill="none" class="cw-lchart__tt-alert-icon"><path d="M8 1l7 14H1L8 1z" stroke="currentColor" stroke-width="1.5"/></svg>
						{tooltipData.primary.alert.message}
					</div>
				{/if}
			{/if}
			{#if tooltipData.secondary && showSecondary}
				<div class="cw-lchart__tt-row" style="margin-top:0.25rem">
					<span class="cw-lchart__dot cw-lchart__dot--purple"></span>
					<span class="cw-lchart__tt-muted">{secondaryLabel}:</span>
					<span class="cw-lchart__tt-value">{tooltipData.secondary.value.toFixed(2)}{secondaryUnit}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Legend -->
	<div class="cw-lchart__legend">
		<button
			type="button"
			class="cw-lchart__legend-btn"
			class:cw-lchart__legend-btn--inactive={!showPrimary}
			onclick={() => (showPrimary = !showPrimary)}
		>
			<span class="cw-lchart__legend-marker cw-lchart__legend-marker--primary"></span>
			{primaryLabel}
		</button>

		{#if secondaryData.length > 0}
			<button
				type="button"
				class="cw-lchart__legend-btn"
				class:cw-lchart__legend-btn--inactive={!showSecondary}
				onclick={() => (showSecondary = !showSecondary)}
			>
				<span class="cw-lchart__legend-marker cw-lchart__legend-marker--secondary"></span>
				{secondaryLabel}
			</button>
		{/if}

		{#if threshold !== undefined}
			<button
				type="button"
				class="cw-lchart__legend-btn"
				class:cw-lchart__legend-btn--inactive={!showThreshold}
				onclick={() => (showThreshold = !showThreshold)}
			>
				<span class="cw-lchart__legend-marker cw-lchart__legend-marker--threshold"></span>
				Threshold ({threshold}{primaryUnit})
			</button>
		{/if}
	</div>
</div>

<style>
	/* ── Container ────────────────────────── */
	.cw-lchart {
		position: relative;
		width: 100%;
		user-select: none;
	}

	/* ── Grid ─────────────────────────────── */
	.cw-lchart__grid {
		stroke: rgb(51 65 85);
		stroke-width: 1;
		stroke-dasharray: 4,4;
		opacity: 0.5;
	}

	/* ── Threshold ────────────────────────── */
	.cw-lchart__threshold {
		stroke: rgb(148 163 184);
		stroke-width: 2;
		stroke-dasharray: 6,4;
	}
	.cw-lchart__threshold-label {
		fill: rgb(148 163 184);
		font-size: 10px;
	}

	/* ── Axes ─────────────────────────────── */
	.cw-lchart__axis {
		stroke: rgb(71 85 105);
		stroke-width: 1;
	}
	.cw-lchart__tick {
		fill: rgb(148 163 184);
		font-size: 11px;
		dominant-baseline: middle;
	}
	.cw-lchart__tick--left {
		text-anchor: end;
	}
	.cw-lchart__tick--right {
		text-anchor: start;
		fill: rgb(192 132 252);
	}
	.cw-lchart__axis-label {
		font-size: 12px;
		font-weight: 500;
		text-anchor: middle;
	}
	.cw-lchart__axis-label--primary {
		fill: rgb(14 165 233);
	}
	.cw-lchart__axis-label--secondary {
		fill: rgb(168 85 247);
	}
	.cw-lchart__time-label {
		fill: rgb(148 163 184);
		font-size: 10px;
		text-anchor: end;
	}

	/* ── Pulse animation ──────────────────── */
	@keyframes cw-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	.cw-lchart__pulse {
		animation: cw-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	/* ── Tooltip ──────────────────────────── */
	.cw-lchart__tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 50;
		border-radius: 0.5rem;
		border: 1px solid #334155;
		background-color: rgba(30, 41, 59, 0.95);
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
		backdrop-filter: blur(4px);
		color: #e2e8f0;
	}
	.cw-lchart__tt-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.cw-lchart__tt-muted {
		color: #94a3b8;
	}
	.cw-lchart__tt-value {
		color: #ffffff;
		font-weight: 500;
	}
	.cw-lchart__tt-time {
		color: #64748b;
		font-size: 0.65rem;
		margin-top: 0.125rem;
	}
	.cw-lchart__dot {
		height: 8px;
		width: 8px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.cw-lchart__dot--sky    { background-color: #0ea5e9; }
	.cw-lchart__dot--purple { background-color: #a855f7; }

	.cw-lchart__tt-alert {
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-radius: 0.25rem;
		background-color: rgba(245, 158, 11, 0.20);
		padding: 0.25rem 0.5rem;
		color: #fcd34d;
	}
	.cw-lchart__tt-alert-icon {
		height: 12px;
		width: 12px;
	}

	/* ── Legend ────────────────────────────── */
	.cw-lchart__legend {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.75rem;
	}
	.cw-lchart__legend-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #cbd5e1;
		font-family: inherit;
		font-size: inherit;
		transition: color 0.15s;
	}
	.cw-lchart__legend-btn--inactive {
		color: #64748b;
		text-decoration: line-through;
	}
	.cw-lchart__legend-marker {
		display: inline-block;
		height: 2px;
		width: 1rem;
		border-radius: 9999px;
	}
	.cw-lchart__legend-marker--primary {
		background-color: #0ea5e9;
	}
	.cw-lchart__legend-marker--secondary {
		background: repeating-linear-gradient(
			90deg,
			rgb(168, 85, 247),
			rgb(168, 85, 247) 4px,
			transparent 4px,
			transparent 6px
		);
	}
	.cw-lchart__legend-marker--threshold {
		border-top: 2px dashed #94a3b8;
		background: none;
	}
</style>
