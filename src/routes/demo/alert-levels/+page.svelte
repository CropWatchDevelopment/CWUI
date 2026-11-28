<script lang="ts">
	import { areAlertLevelsValid, CwAlertLevels, CwCard } from '$lib/index.js';
	import type { CwAlertPointsValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let levels = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{ id: '1', name: 'Too cold', color: '#3987E5', condition: 'lessThan', value: '5', min: '', max: '' },
			{ id: '2', name: 'Ideal', color: '#199E70', condition: 'range', value: '', min: '18', max: '26' },
			{ id: '3', name: 'Too hot', color: '#DA5E2D', condition: 'greaterThan', value: '30', min: '', max: '' }
		]
	});

	let empty = $state<CwAlertPointsValue>({ unit: 'C', center: '0', points: [] });

	let humidity = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{ id: '1', name: '乾燥', color: '#c98500', condition: 'lessThan', value: '40', min: '', max: '' },
			{ id: '2', name: '多湿', color: '#3987e5', condition: 'greaterThanOrEqual', value: '85', min: '', max: '' }
		]
	});

	const example = `<script lang="ts">
\timport { areAlertLevelsValid, CwAlertLevels } from '@cropwatchdevelopment/cwui';

\tlet levels = $state({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: [
\t\t\t{ id: '1', name: 'Too cold', color: '#3987e5', condition: 'lessThan', value: '5', min: '', max: '' },
\t\t\t{ id: '2', name: 'Ideal', color: '#199e70', condition: 'range', value: '', min: '18', max: '26' }
\t\t]
\t});
<\/script>

<CwAlertLevels bind:value={levels} />

<!-- A reading that is not a temperature, in Japanese. -->
<CwAlertLevels bind:value={humidity} temperature={false} unit="%" locale="ja" />

<button disabled={!areAlertLevelsValid(levels.points)}>Save</button>`;
</script>

<h2>CwAlertLevels</h2>
<p class="demo-desc">
	Named, coloured levels for a reading, as a report uses them to mark values. One row per level; the
	scale above fits itself to the numbers and shows how readings will be marked.
</p>

<section class="demo-section">
	<h3>Three levels</h3>
	<CwCard>
		<div class="demo-pad">
			<CwAlertLevels id="demo-levels" bind:value={levels} />
		</div>
	</CwCard>
	<div class="demo-output">
		<h3>Bound value (valid: {areAlertLevelsValid(levels.points)})</h3>
		<pre>{JSON.stringify(levels.points.map(({ name, color, condition, value, min, max }) => ({ name, color, condition, value, min, max })))}</pre>
	</div>
	<DemoCodeExample code={example} title="CwAlertLevels example" />
</section>

<section class="demo-section">
	<h3>No levels yet</h3>
	<CwCard>
		<div class="demo-pad">
			<CwAlertLevels id="demo-empty" bind:value={empty} />
		</div>
	</CwCard>
</section>

<section class="demo-section">
	<h3>Not a temperature, in Japanese</h3>
	<CwCard>
		<div class="demo-pad">
			<CwAlertLevels id="demo-humidity" bind:value={humidity} temperature={false} unit="%" locale="ja" />
		</div>
	</CwCard>
</section>

<style>
	.demo-pad {
		padding: var(--cw-space-5);
	}

	.demo-output {
		margin-top: var(--cw-space-4);
		padding: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}

	.demo-output h3 {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		margin: 0 0 var(--cw-space-2) 0;
	}

	.demo-output pre {
		margin: 0;
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
