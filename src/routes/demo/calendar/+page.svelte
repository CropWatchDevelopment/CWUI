<script lang="ts">
	import { CwCalendar } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let selectedDate = $state<Date | null>(null);

	/* ── Fake event data keyed by "YYYY-MM-DD" ─── */
	const events: Record<string, { title: string; color: string }[]> = {
		[fmt(new Date())]: [
			{ title: 'Sensor calibration', color: 'var(--cw-primary-500)' },
			{ title: 'Field inspection', color: 'var(--cw-success-500)' }
		],
		[fmt(daysFromNow(2))]: [
			{ title: 'Irrigation schedule', color: 'var(--cw-info-500)' }
		],
		[fmt(daysFromNow(-1))]: [
			{ title: 'Battery replaced', color: 'var(--cw-warning-500)' }
		],
		[fmt(daysFromNow(5))]: [
			{ title: 'Harvest window', color: 'var(--cw-danger-500)' },
			{ title: 'Weather alert', color: 'var(--cw-warning-500)' }
		]
	};

	/* ── Fake weather icons by day-of-week ── */
	const weatherIcons: Record<number, string> = {
		0: '☀️', 1: '🌤️', 2: '⛅', 3: '🌧️', 4: '🌦️', 5: '☁️', 6: '🌤️'
	};

	function fmt(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	function daysFromNow(n: number): Date {
		const d = new Date();
		d.setDate(d.getDate() + n);
		return d;
	}

	function getEvents(date: Date) {
		return events[fmt(date)] ?? [];
	}

	const calendarExample = `<CwCalendar
\tonDateClick={(date) => (selectedDate = date)}
/>`;
</script>

<h2>CwCalendar</h2>
<p class="demo-desc">Monthly calendar grid with customisable day headers, trailing actions, and content slots.</p>

<section class="demo-section">
	<h3>Full Featured</h3>
	<p class="demo-hint">Each day has a title, weather icon trailing slot, and event chips in the content body. Click a day to select it.</p>
	<CwCalendar
		onDateClick={(d) => (selectedDate = d)}
	>
		{#snippet dayHeader(date)}
			{@const evts = getEvents(date)}
			{#if evts.length > 0}
				<span class="demo-day-title">{evts[0].title}</span>
			{/if}
		{/snippet}

		{#snippet dayTrailing(date)}
			<span class="demo-weather">{weatherIcons[date.getDay()]}</span>
		{/snippet}

		{#snippet dayContent(date)}
			{@const evts = getEvents(date)}
			{#each evts as evt}
				<div class="demo-event" style="border-left-color:{evt.color}">
					{evt.title}
				</div>
			{/each}
		{/snippet}
	</CwCalendar>

	{#if selectedDate}
		<p class="demo-selected">Selected: <strong>{selectedDate.toLocaleDateString()}</strong></p>
	{/if}
</section>

<section class="demo-section">
	<h3>Minimal (no slots)</h3>
	<CwCalendar />
	<DemoCodeExample code={calendarExample} title="CwCalendar example" />
</section>

<section class="demo-section">
	<h3>With Ellipsis Menu Trailing</h3>
	<CwCalendar>
		{#snippet dayTrailing(_date)}
			<button type="button" class="demo-ellipsis" aria-label="Day options">
				<svg viewBox="0 0 16 16" fill="none" style="width:0.875rem;height:0.875rem">
					<circle cx="8" cy="3" r="1.5" fill="currentColor"/>
					<circle cx="8" cy="8" r="1.5" fill="currentColor"/>
					<circle cx="8" cy="13" r="1.5" fill="currentColor"/>
				</svg>
			</button>
		{/snippet}
	</CwCalendar>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-section { margin-bottom: var(--cw-space-8); }

	.demo-day-title {
		font-size: 0.625rem;
		color: var(--cw-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-weather {
		font-size: 0.75rem;
		line-height: 1;
	}

	.demo-event {
		padding: 0.125rem 0.25rem;
		margin-bottom: 0.125rem;
		border-left: 2px solid;
		border-radius: 0 var(--cw-radius-sm) var(--cw-radius-sm) 0;
		background-color: var(--cw-bg-muted);
		font-size: 0.625rem;
		line-height: 1.25;
		color: var(--cw-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.demo-selected {
		margin-top: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}
	.demo-selected strong {
		color: var(--cw-accent);
	}

	.demo-ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: var(--cw-radius-sm);
		color: var(--cw-text-muted);
		cursor: pointer;
	}
	.demo-ellipsis:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}
</style>
