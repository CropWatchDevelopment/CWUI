<script lang="ts">
	import { CwButton, CwExpandPanel } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let controlled = $state(true);
	let lastToggle = $state('none yet');
	const expandExample = `<CwExpandPanel title="Sensor configuration" open>
\t<p>Configure thresholds and reporting intervals.</p>
</CwExpandPanel>`;
</script>

<h2>CwExpandPanel</h2>
<p class="demo-desc">
	Collapsible panel with an animated expand and collapse. The header is a native button with
	<code>aria-expanded</code> and <code>aria-controls</code>, and collapsed content can't be tabbed
	into. Supports custom headers, bindable state and a disabled mode.
</p>

<section class="demo-section">
	<h3>Basic</h3>
	<div class="demo-stack">
		<CwExpandPanel title="Sensor configuration" open>
			<p>Configure thresholds, calibration offsets, and reporting intervals for each connected sensor.</p>
		</CwExpandPanel>

		<CwExpandPanel title="Alert rules">
			<p>Define rules that trigger notifications when sensor readings exceed configured thresholds.</p>
		</CwExpandPanel>

		<CwExpandPanel title="Data export">
			<p>Export historical sensor data as CSV or JSON for offline analysis.</p>
		</CwExpandPanel>
	</div>
	<DemoCodeExample code={expandExample} title="CwExpandPanel example" />
</section>

<section class="demo-section">
	<h3>Controlled (bind:open)</h3>
	<div class="demo-row demo-controlled-row">
		<CwButton size="sm" variant="secondary" onclick={() => (controlled = !controlled)}>
			Toggle externally
		</CwButton>
		<span class="demo-hint">Panel is <strong>{controlled ? 'open' : 'closed'}</strong></span>
	</div>
	<CwExpandPanel title="Controlled panel" bind:open={controlled}>
		<p>This panel's state is bound to a parent variable and can be toggled externally.</p>
	</CwExpandPanel>
</section>

<section class="demo-section">
	<h3>onToggle callback</h3>
	<CwExpandPanel title="Toggle callback" onToggle={(open) => (lastToggle = open ? 'Opened' : 'Closed')}>
		<p>The readout below updates when you open or close this panel.</p>
	</CwExpandPanel>
	<p class="demo-event" aria-live="polite">Last event: {lastToggle}</p>
</section>

<section class="demo-section">
	<h3>Custom header snippet</h3>
	<CwExpandPanel>
		{#snippet header(open)}
			<div class="demo-custom-header">
				<span class="demo-badge" class:demo-badge--active={open}>{open ? 'ON' : 'OFF'}</span>
				<span>Irrigation controller</span>
			</div>
		{/snippet}
		<p>The header slot receives the <code>open</code> boolean so you can render dynamic content.</p>
	</CwExpandPanel>
</section>

<section class="demo-section">
	<h3>Disabled</h3>
	<CwExpandPanel title="Locked panel (disabled)" disabled>
		<p>You should never see this content.</p>
	</CwExpandPanel>
</section>

<style>
	.demo-hint strong {
		color: var(--cw-accent-text);
	}

	.demo-section p:not([class]) {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	code {
		padding: 0.1rem 0.3rem;
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
	}
	.demo-controlled-row {
		margin-bottom: var(--cw-space-3);
	}

	.demo-controlled-row .demo-hint {
		margin-top: 0;
	}

	.demo-custom-header {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-badge {
		display: inline-block;
		padding: 0.1rem 0.4rem;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		color: var(--cw-text-muted);
		text-transform: uppercase;
	}

	.demo-badge--active {
		background: var(--cw-tone-success-bg);
		color: var(--cw-tone-success-text);
	}
</style>
