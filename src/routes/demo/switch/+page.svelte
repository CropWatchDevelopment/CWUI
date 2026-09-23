<script lang="ts">
	import { CwSwitch } from '$lib/index.js';
	import type { CwSwitchLabelPosition } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let onlineOnly = $state(true);
	let notifyByEmail = $state(false);
	let notifyBySms = $state(false);
	let acceptTerms = $state(false);
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
		<CwSwitch
			label="Accept data-sharing terms"
			description="Required before readings can be shared with your agronomist."
			bind:checked={acceptTerms}
			error={acceptTerms ? undefined : 'You must accept the terms to enable sharing'}
		/>
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
	.demo-hint strong { color: var(--cw-accent-text); }
	.demo-positions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr));
		gap: var(--cw-space-4);
	}
	.demo-position-card {
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background-color: var(--cw-bg-surface);
	}
</style>
