<script lang="ts">
	import { CwSwitch } from '$lib/index.js';
	import type { CwSwitchLabelPosition } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let onlineOnly = $state(true);
	let notifyByEmail = $state(false);
	let notifyBySms = $state(false);
	const labelPositions: CwSwitchLabelPosition[] = ['top', 'bottom', 'left', 'right'];

	const switchExample = `<CwSwitch
	label="Show only online devices"
	description="Hide offline sensors from the dashboard"
	name="onlineOnly"
	value="yes"
	bind:checked={onlineOnly}
/>`;

	const labelPositionExample = `<CwSwitch label="Top label" labelPosition="top" />
<CwSwitch label="Bottom label" labelPosition="bottom" />
<CwSwitch label="Left label" labelPosition="left" />
<CwSwitch label="Right label" labelPosition="right" />`;
</script>

<h2>CwSwitch</h2>
<p class="demo-desc">Checkbox-based on/off control with native form attributes and bindable checked state.</p>

<section class="demo-section">
	<h3>Basic</h3>
	<CwSwitch
		label="Show only online devices"
		description="Hide offline sensors from the dashboard"
		name="onlineOnly"
		value="yes"
		bind:checked={onlineOnly}
	/>
	<p class="demo-hint">State: <strong>{onlineOnly ? 'On' : 'Off'}</strong></p>
	<DemoCodeExample code={switchExample} title="CwSwitch example" />
</section>

<section class="demo-section">
	<h3>Variants</h3>
	<div class="demo-stack">
		<CwSwitch label="Email notifications" bind:checked={notifyByEmail} />
		<CwSwitch label="SMS notifications" bind:checked={notifyBySms} />
		<CwSwitch label="Disabled switch" checked={true} disabled />
		<CwSwitch aria-label="Iconless switch" />
	</div>
</section>

<section class="demo-section">
	<h3>Label positions</h3>
	<div class="demo-positions">
		{#each labelPositions as position}
			<div class="demo-position-card">
				<CwSwitch
					label={`${position[0].toUpperCase()}${position.slice(1)} label`}
					description="Choose the control layout that fits the surface."
					labelPosition={position}
				/>
			</div>
		{/each}
	</div>
	<DemoCodeExample code={labelPositionExample} title="CwSwitch label positions" />
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-top: var(--cw-space-2); }
	.demo-hint strong { color: var(--cw-accent); }
	.demo-section { margin-bottom: var(--cw-space-6); }
	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
	}
	.demo-positions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--cw-space-4);
	}
	.demo-position-card {
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-subtle);
		border-radius: var(--cw-radius-lg);
		background-color: var(--cw-bg-surface);
	}
</style>
