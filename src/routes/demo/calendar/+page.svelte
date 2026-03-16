<script lang="ts">
	import { CwCalendar } from '$lib/index.js';

	interface DemoEvent {
		title: string;
		color: string;
	}

	interface DemoWeather {
		icon: string;
		label: string;
		high: number;
	}

	const today = new Date();
	const demoMinDate = new Date(today.getFullYear(), today.getMonth() - 1, 10);
	const demoMaxDate = new Date(today.getFullYear(), today.getMonth() + 1, 22);

	let selectedDate = $state<Date | null>(null);
	let visibleYear = $state(today.getFullYear());
	let visibleMonth = $state(today.getMonth());
	let lastMonthChange = $state(new Date(today.getFullYear(), today.getMonth(), 1));

	/* ── Fake event data keyed by "YYYY-MM-DD" ─────────────────────────────── */
	const events: Record<string, DemoEvent[]> = {
		[fmt(new Date())]: [
			{ title: 'Sensor calibration', color: 'var(--cw-primary-500)' },
			{ title: 'Field inspection', color: 'var(--cw-success-500)' }
		],
		[fmt(daysFromNow(2))]: [
			{ title: 'Irrigation schedule', color: 'var(--cw-info-500)' },
			{ title: 'Nutrient audit', color: 'var(--cw-warning-500)' }
		],
		[fmt(daysFromNow(5))]: [
			{ title: 'Harvest window', color: 'var(--cw-danger-500)' }
		],
		[fmt(daysFromNow(8))]: [
			{ title: 'Weather alert watch', color: 'var(--cw-warning-500)' },
			{ title: 'Pump maintenance', color: 'var(--cw-secondary-500)' }
		],
		[fmt(daysFromNow(13))]: [
			{ title: 'Weekly grow review', color: 'var(--cw-success-500)' }
		]
	};

	const weatherByWeekday: Record<number, DemoWeather> = {
		0: { icon: '☀️', label: 'Clear', high: 74 },
		1: { icon: '🌤️', label: 'Bright', high: 71 },
		2: { icon: '⛅', label: 'Mixed', high: 69 },
		3: { icon: '🌧️', label: 'Rain', high: 63 },
		4: { icon: '🌦️', label: 'Showers', high: 66 },
		5: { icon: '☁️', label: 'Cloudy', high: 64 },
		6: { icon: '🌤️', label: 'Dry', high: 72 }
	};

	function fmt(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	function daysFromNow(days: number): Date {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date;
	}

	function getEvents(date: Date): DemoEvent[] {
		return events[fmt(date)] ?? [];
	}

	function getWeather(date: Date): DemoWeather {
		return weatherByWeekday[date.getDay()] ?? weatherByWeekday[0];
	}

	function formatMonth(date: Date): string {
		return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
	}

	function formatShortDate(date: Date): string {
		return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function handleMonthChange(_year: number, _month: number, displayedMonth: Date) {
		lastMonthChange = displayedMonth;
	}

	const visibleMonthLabel = $derived(formatMonth(new Date(visibleYear, visibleMonth, 1)));
</script>

<h2>CwCalendar</h2>
<p class="demo-desc">Month calendar with bindable month state, snippet-based day rendering, and optional min/max date constraints.</p>

<section class="demo-section">
	<div class="demo-section__head">
		<div>
			<h3>Bounded planning calendar</h3>
			<p class="demo-hint">This example shows larger weather and text content, disabled dates outside the allowed range, and the month navigation callback updating a live summary.</p>
		</div>
	</div>

	<div class="demo-feature-grid">
		<div class="demo-feature-main">
			<CwCalendar
				bind:year={visibleYear}
				bind:month={visibleMonth}
				minDate={demoMinDate}
				maxDate={demoMaxDate}
				onDateClick={(date) => (selectedDate = date)}
				onMonthChange={handleMonthChange}
			>
				{#snippet dayHeader(date)}
					{@const dayEvents = getEvents(date)}
					<span class="demo-day-title">
						{dayEvents[0]?.title ?? 'Open day'}
					</span>
				{/snippet}

				{#snippet dayTrailing(date)}
					{@const weather = getWeather(date)}
					<div class="demo-weather" aria-label={`${weather.label}, high ${weather.high} degrees`}>
						<span class="demo-weather__icon">{weather.icon}</span>
						<span class="demo-weather__temp">{weather.high}°</span>
					</div>
				{/snippet}

				{#snippet dayContent(date)}
					{@const dayEvents = getEvents(date)}
					{#if dayEvents.length > 0}
						{#each dayEvents.slice(0, 2) as event (event.title)}
							<div class="demo-event" style:border-left-color={event.color}>
								{event.title}
							</div>
						{/each}
					{:else}
						<div class="demo-event demo-event--placeholder">
							No field work scheduled
						</div>
					{/if}
				{/snippet}
			</CwCalendar>
		</div>

		<aside class="demo-sidebar" aria-label="Calendar demo summary">
			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Visible month</span>
				<strong>{visibleMonthLabel}</strong>
				<p>Bound from the component via <code>bind:year</code> and <code>bind:month</code>.</p>
			</div>

			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Last month callback</span>
				<strong>{formatMonth(lastMonthChange)}</strong>
				<p>Updated only when the previous or next month buttons change the month.</p>
			</div>

			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Selectable range</span>
				<strong>{formatShortDate(demoMinDate)} to {formatShortDate(demoMaxDate)}</strong>
				<p>Navigation and date selection stop outside this window.</p>
			</div>

			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Last clicked date</span>
				<strong>{selectedDate ? formatShortDate(selectedDate) : 'Nothing selected yet'}</strong>
				<p>Day clicks are ignored for dates before <code>minDate</code> or after <code>maxDate</code>.</p>
			</div>
		</aside>
	</div>
</section>

<section class="demo-section">
	<h3>Minimal month grid</h3>
	<p class="demo-hint">Use the component with no snippets when you only need the shared month shell and date-grid layout.</p>
	<CwCalendar />
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin: 0 0 var(--cw-space-2);
		color: var(--cw-text-secondary);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-hint {
		margin: 0;
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-section {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-8);
	}

	.demo-section__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.demo-feature-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.8fr) minmax(16rem, 0.95fr);
		gap: var(--cw-space-5);
		align-items: start;
	}

	.demo-feature-main {
		min-width: 0;
	}

	.demo-sidebar {
		display: grid;
		gap: var(--cw-space-3);
	}

	.demo-summary-card {
		display: grid;
		gap: 0.35rem;
		padding: var(--cw-space-4);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		border-radius: var(--cw-radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 90%, white),
				color-mix(in srgb, var(--cw-bg-muted) 52%, white)
			);
		box-shadow: var(--cw-shadow-sm);
	}

	.demo-summary-card__eyebrow {
		font-size: 0.72rem;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-summary-card strong {
		font-size: var(--cw-text-base);
		color: var(--cw-text-primary);
	}

	.demo-summary-card p {
		margin: 0;
		font-size: var(--cw-text-sm);
		line-height: 1.55;
		color: var(--cw-text-secondary);
	}

	.demo-summary-card code {
		font-family: var(--cw-font-mono);
		font-size: 0.78rem;
		color: var(--cw-text-primary);
	}

	.demo-day-title {
		display: block;
		max-width: 100%;
		font-size: 0.82rem;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-weather {
		display: grid;
		justify-items: end;
		gap: 0.1rem;
	}

	.demo-weather__icon {
		font-size: 1.3rem;
	}

	.demo-weather__temp {
		font-size: 0.74rem;
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.demo-event {
		padding: 0.38rem 0.5rem;
		border-left: 3px solid;
		border-radius: 0 var(--cw-radius-sm) var(--cw-radius-sm) 0;
		background-color: color-mix(in srgb, var(--cw-bg-elevated) 90%, var(--cw-bg-muted));
		font-size: 0.76rem;
		line-height: 1.35;
		color: var(--cw-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-event--placeholder {
		border-left-color: transparent;
		color: var(--cw-text-muted);
	}

	@media (max-width: 68rem) {
		.demo-feature-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
