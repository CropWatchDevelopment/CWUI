<script lang="ts">
	import { CwTimePicker } from '$lib/index.js';
	import type { CwTimeValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let irrigationStart = $state<CwTimeValue>({ hours: 6, minutes: 30 });
	let lightsOut = $state<CwTimeValue>({ hours: 21, minutes: 45 });
	let maintenanceWindow = $state<CwTimeValue>({ hours: 13, minutes: 0 });
	let frostCheck = $state<CwTimeValue>({ hours: 4, minutes: 15 });
	let lastEvent = $state('none yet');

	function fmt(value: CwTimeValue | null | undefined) {
		if (!value) return 'cleared';
		return `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;
	}

	const timePickerExample = `<script lang="ts">
\timport { CwTimePicker } from '@cropwatchdevelopment/cwui';
\timport type { CwTimeValue } from '@cropwatchdevelopment/cwui';

\tlet quietHours = $state<CwTimeValue>({ hours: 22, minutes: 0 });\n\tfunction save(value: CwTimeValue) {\n\t\t// persist the schedule\n\t}
<\/script>

<CwTimePicker
\tlabel="Quiet hours begin"
\tminuteStep={5}
\tbind:value={quietHours}
\tonchange={(value) => save(value)}
/>`;
</script>

<h2>CwTimePicker</h2>
<p class="demo-desc">
	Standalone time-of-day picker with 24-hour editing and stepper controls. In locales that use a
	12-hour clock it also shows an AM/PM readout (<code>twelveHourDisplay="auto"</code>, the default).
</p>

<div class="demo-grid">
	<div class="demo-card">
		<h3>Irrigation Start</h3>
		<p class="demo-copy">Forced 12-hour readout so the AM/PM conversion is always visible.</p>
		<CwTimePicker
			label="Irrigation start"
			twelveHourDisplay
			bind:value={irrigationStart}
			onchange={(value) => (lastEvent = `irrigation start → ${fmt(value)}`)}
		/>
		<pre class="demo-output">{JSON.stringify(irrigationStart, null, 2)}</pre>
	</div>

	<div class="demo-card">
		<h3>Stepped Selection</h3>
		<p class="demo-copy">A 5-minute step keeps common scheduling workflows fast without losing the 24-hour format.</p>
		<CwTimePicker
			label="Lights out"
			minuteStep={5}
			bind:value={lightsOut}
			onchange={(value) => (lastEvent = `lights out → ${fmt(value)}`)}
		/>
		<pre class="demo-output">{JSON.stringify(lightsOut, null, 2)}</pre>
	</div>

	<div class="demo-card">
		<h3>Disabled State</h3>
		<p class="demo-copy">Disabled styling keeps the same theme language in both light and dark mode.</p>
		<CwTimePicker label="Maintenance window" bind:value={maintenanceWindow} disabled />
		<pre class="demo-output">{JSON.stringify(maintenanceWindow, null, 2)}</pre>
	</div>

	<div class="demo-card">
		<h3>Required, error &amp; localised labels</h3>
		<p class="demo-copy">
			Errors are linked to the inputs with <code>aria-describedby</code>. Every string can be
			replaced through <code>labels</code>.
		</p>
		<CwTimePicker
			label="Frost check"
			required
			error="Must be before sunrise (05:30)"
			locale="ja-JP"
			labels={{ hour: '時', minute: '分', clock24: '24時間表示' }}
			bind:value={frostCheck}
			onchange={(value) => (lastEvent = `frost check → ${fmt(value)}`)}
		/>
	</div>
</div>

<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>

<DemoCodeExample code={timePickerExample} title="CwTimePicker example" />

<style>


	.demo-card {
		display: grid;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-elevated);
	}

	.demo-copy {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	.demo-output {
		margin: 0;
		padding: var(--cw-space-3);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
		background: color-mix(in srgb, var(--cw-bg-muted) 68%, transparent);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		overflow-x: auto;
	}
</style>
