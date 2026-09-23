<script lang="ts">
	import { CwDateTimeRangePicker } from '$lib/index.js';
	import type { CwDateValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let singleVal = $state<CwDateValue | undefined>(undefined);
	let rangeVal = $state<CwDateValue | undefined>(undefined);
	let monthVal = $state<CwDateValue | undefined>(undefined);
	let timeVal = $state<CwDateValue | undefined>(undefined);
	let futureVal = $state<CwDateValue | undefined>(undefined);
	let requiredVal = $state<CwDateValue | undefined>(undefined);
	let localeVal = $state<CwDateValue | undefined>(undefined);
	let lastEvent = $state('none yet');

	const today = new Date();
	const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);

	const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

	function pad(value: number) {
		return String(value).padStart(2, '0');
	}

	function describe(value: CwDateValue | undefined): string {
		if (!value) return 'Nothing selected';
		if ('date' in value) {
			const time = value.time ? ` ${pad(value.time.hours)}:${pad(value.time.minutes)}` : '';
			return `${dateFormat.format(value.date)}${time}`;
		}
		const startTime = value.startTime
			? ` ${pad(value.startTime.hours)}:${pad(value.startTime.minutes)}`
			: '';
		const endTime = value.endTime ? ` ${pad(value.endTime.hours)}:${pad(value.endTime.minutes)}` : '';
		return `${dateFormat.format(value.start)}${startTime} – ${dateFormat.format(value.end)}${endTime}`;
	}

	const datePickerExample = `<CwDateTimeRangePicker
\tlabel="Report period"
\tmode="range"
\tgranularity="day"
\tincludeTime
\trequired
\tminDate={thirtyDaysAgo}
\tbind:value
/>

<!-- maxDate defaults to today; pass null to allow future dates -->
<CwDateTimeRangePicker label="Harvest date" maxDate={null} bind:value={harvest} />`;
</script>

<h2>CwDateTimeRangePicker</h2>
<p class="demo-desc">
	Single dates or ranges at day, month or year granularity, with optional time. The calendar grid is
	keyboard-operable (arrows, Home/End, PageUp/PageDown, Shift+Page for years) and month and weekday
	names follow the <code>locale</code>.
</p>

<section class="demo-section">
	<h3>Modes and granularity</h3>
	<div class="demo-grid">
		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Single day"
				mode="single"
				granularity="day"
				bind:value={singleVal}
				onchange={(v) => (lastEvent = `Single day: ${describe(v)}`)}
			/>
			<p class="demo-output">{describe(singleVal)}</p>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Date range"
				mode="range"
				granularity="day"
				bind:value={rangeVal}
				onchange={(v) => (lastEvent = `Date range: ${describe(v)}`)}
			/>
			<p class="demo-output">{describe(rangeVal)}</p>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Month"
				mode="single"
				granularity="month"
				bind:value={monthVal}
			/>
			<p class="demo-output">{describe(monthVal)}</p>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Range with time"
				mode="range"
				granularity="day"
				includeTime
				bind:value={timeVal}
			/>
			<p class="demo-output">{describe(timeVal)}</p>
		</div>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
</section>

<section class="demo-section">
	<h3>Limits, validation and locale</h3>
	<div class="demo-grid">
		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Last 30 days only"
				hint="Between 30 days ago and today"
				minDate={thirtyDaysAgo}
				bind:value={singleVal}
			/>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Planned harvest"
				hint="Future dates allowed (maxDate={'{null}'})"
				maxDate={null}
				bind:value={futureVal}
			/>
			<p class="demo-output">{describe(futureVal)}</p>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker
				label="Report period"
				mode="range"
				required
				error={requiredVal ? undefined : 'Choose a report period'}
				bind:value={requiredVal}
			/>
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker label="Disabled" disabled />
		</div>

		<div class="demo-picker">
			<CwDateTimeRangePicker label="日付 (ja-JP)" locale="ja-JP" bind:value={localeVal} />
			<p class="demo-output">{describe(localeVal)}</p>
		</div>
	</div>
	<DemoCodeExample code={datePickerExample} title="CwDateTimeRangePicker example" />
</section>

<style>
	.demo-picker {
		min-width: 0;
	}

	.demo-output {
		margin-top: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-secondary);
		background: var(--cw-bg-muted);
		border-radius: var(--cw-radius-md);
		overflow-wrap: anywhere;
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
