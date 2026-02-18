<script lang="ts">
	import { CwDateTimeRangePicker } from '$lib/index.js';
	import type { CwDateValue } from '$lib/index.js';

	let singleVal = $state<CwDateValue | undefined>(undefined);
	let rangeVal = $state<CwDateValue | undefined>(undefined);
	let monthVal = $state<CwDateValue | undefined>(undefined);
	let timeVal = $state<CwDateValue | undefined>(undefined);
</script>

<h2>CwDateTimeRangePicker</h2>
<p class="demo-desc">Calendar picker — single/range, day/month/year granularity, optional time.</p>

<div class="demo-grid">
	<div>
		<h3>Single Day</h3>
		<CwDateTimeRangePicker
			mode="single"
			granularity="day"
			bind:value={singleVal}
			onchange={(v) => console.log('Single:', v)}
		/>
		{#if singleVal}
			<pre class="demo-output">{JSON.stringify(singleVal, null, 2)}</pre>
		{/if}
	</div>

	<div>
		<h3>Date Range</h3>
		<CwDateTimeRangePicker
			mode="range"
			granularity="day"
			bind:value={rangeVal}
			onchange={(v) => console.log('Range:', v)}
		/>
		{#if rangeVal}
			<pre class="demo-output">{JSON.stringify(rangeVal, null, 2)}</pre>
		{/if}
	</div>

	<div>
		<h3>Month Granularity</h3>
		<CwDateTimeRangePicker
			mode="single"
			granularity="month"
			bind:value={monthVal}
		/>
		{#if monthVal}
			<pre class="demo-output">{JSON.stringify(monthVal, null, 2)}</pre>
		{/if}
	</div>

	<div>
		<h3>With Time</h3>
		<CwDateTimeRangePicker
			mode="range"
			granularity="day"
			includeTime
			bind:value={timeVal}
		/>
		{#if timeVal}
			<pre class="demo-output">{JSON.stringify(timeVal, null, 2)}</pre>
		{/if}
	</div>
</div>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: var(--cw-space-6); }
	.demo-output {
		margin-top: var(--cw-space-2);
		padding: var(--cw-space-2);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
		background: var(--cw-bg-muted);
		border-radius: var(--cw-radius-sm);
		overflow-x: auto;
	}
</style>
