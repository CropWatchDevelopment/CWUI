<script lang="ts">
	import { CwTimePicker } from '$lib/index.js';
	import type { CwTimeValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let irrigationStart = $state<CwTimeValue>({ hours: 6, minutes: 30 });
	let lightsOut = $state<CwTimeValue>({ hours: 21, minutes: 45 });
	let maintenanceWindow = $state<CwTimeValue>({ hours: 13, minutes: 0 });

	const timePickerExample = `<script lang="ts">
\timport { CwTimePicker } from '@cropwatchdevelopment/cwui';
\timport type { CwTimeValue } from '@cropwatchdevelopment/cwui';

\tlet quietHours = $state<CwTimeValue>({ hours: 22, minutes: 0 });
<\/script>

<CwTimePicker
\tlabel="Quiet hours begin"
\tminuteStep={5}
\tbind:value={quietHours}
\tonchange={(value) => console.log(value)}
/>`;
</script>

<h2>CwTimePicker</h2>
<p class="demo-desc">
	Standalone time-of-day picker with 24-hour editing, stepper controls, and a live 12-hour display below.
</p>

<div class="demo-grid">
	<div class="demo-card">
		<h3>Irrigation Start</h3>
		<p class="demo-copy">Use the 24-hour editor, then confirm the AM/PM conversion underneath.</p>
		<CwTimePicker
			label="Irrigation start"
			bind:value={irrigationStart}
			onchange={(value) => console.log('Irrigation start:', value)}
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
			onchange={(value) => console.log('Lights out:', value)}
		/>
		<pre class="demo-output">{JSON.stringify(lightsOut, null, 2)}</pre>
	</div>

	<div class="demo-card">
		<h3>Disabled State</h3>
		<p class="demo-copy">Disabled styling keeps the same theme language in both light and dark mode.</p>
		<CwTimePicker label="Maintenance window" bind:value={maintenanceWindow} disabled />
		<pre class="demo-output">{JSON.stringify(maintenanceWindow, null, 2)}</pre>
	</div>
</div>

<DemoCodeExample code={timePickerExample} title="CwTimePicker example" />

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

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--cw-space-4);
	}

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
