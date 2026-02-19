<script lang="ts">
	import { CwExpandPanel } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let controlled = $state(true);
	let lastToggle = $state<string>('');
	const expandExample = `<CwExpandPanel title="Sensor Configuration" open>
\t<p>Configure thresholds and reporting intervals.</p>
</CwExpandPanel>`;
</script>

<h2>CwExpandPanel</h2>
<p class="demo-desc">Collapsible panel with animated expand / collapse. Supports custom headers, bindable state, and disabled mode.</p>

<section class="demo-section">
	<h3>Basic</h3>
	<div class="demo-stack">
		<CwExpandPanel title="Sensor Configuration" open>
			<p>Configure thresholds, calibration offsets, and reporting intervals for each connected sensor.</p>
		</CwExpandPanel>

		<CwExpandPanel title="Alert Rules">
			<p>Define rules that trigger notifications when sensor readings exceed configured thresholds.</p>
		</CwExpandPanel>

		<CwExpandPanel title="Data Export">
			<p>Export historical sensor data as CSV or JSON for offline analysis.</p>
		</CwExpandPanel>
	</div>
	<DemoCodeExample code={expandExample} title="CwExpandPanel example" />
</section>

<section class="demo-section">
	<h3>Controlled (bind:open)</h3>
	<p class="demo-hint">
		Panel is <strong>{controlled ? 'open' : 'closed'}</strong> —
		<button class="demo-toggle" onclick={() => (controlled = !controlled)}>Toggle externally</button>
	</p>
	<CwExpandPanel title="Controlled Panel" bind:open={controlled}>
		<p>This panel's state is bound to a parent variable and can be toggled externally.</p>
	</CwExpandPanel>
</section>

<section class="demo-section">
	<h3>onToggle callback</h3>
	<p class="demo-hint">Last toggle: <strong>{lastToggle || '—'}</strong></p>
	<CwExpandPanel title="Toggle Callback" onToggle={(open) => (lastToggle = open ? 'Opened' : 'Closed')}>
		<p>Check the "Last toggle" text above when you open or close this panel.</p>
	</CwExpandPanel>
</section>

<section class="demo-section">
	<h3>Custom header snippet</h3>
	<CwExpandPanel>
		{#snippet header(open)}
			<div class="demo-custom-header">
				<span class="demo-badge" class:demo-badge--active={open}>{open ? 'ON' : 'OFF'}</span>
				<span>Irrigation Controller</span>
			</div>
		{/snippet}
		<p>The header slot receives the <code>open</code> boolean so you can render dynamic content.</p>
	</CwExpandPanel>
</section>

<section class="demo-section">
	<h3>Disabled</h3>
	<CwExpandPanel title="Locked Panel (disabled)" disabled>
		<p>You should never see this content.</p>
	</CwExpandPanel>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-6); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-hint strong { color: var(--cw-accent); }
	.demo-section { margin-bottom: var(--cw-space-8); }
	.demo-section p { font-size: var(--cw-text-sm); color: var(--cw-text-secondary); }
	.demo-section code { background: var(--cw-bg-muted); padding: 0.1rem 0.3rem; border-radius: var(--cw-radius-sm); font-size: var(--cw-text-xs); }

	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
	}

	.demo-toggle {
		font-size: var(--cw-text-xs);
		padding: 0.125rem 0.5rem;
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-elevated);
		color: var(--cw-accent);
		cursor: pointer;
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
		font-size: 0.625rem;
		font-weight: var(--cw-font-bold);
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		color: var(--cw-text-muted);
		text-transform: uppercase;
	}
	.demo-badge--active {
		background: color-mix(in srgb, var(--cw-success-500) 20%, transparent);
		color: var(--cw-success-500);
	}
</style>
