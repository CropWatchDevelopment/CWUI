<script lang="ts">
	import { CwSpinner, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const spinnerExample = `<CwSpinner size="md" />
<CwSpinner size="lg" showLabel label="Loading data..." />`;
</script>

<h2>CwSpinner</h2>
<p class="demo-desc">
	Loading indicator shared by buttons, tables and other async states. It is hidden from screen
	readers unless <code>showLabel</code> is set, so pair a bare spinner with visible or
	<code>aria-busy</code> context.
</p>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row">
		<CwSpinner size="sm" />
		<CwSpinner size="md" />
		<CwSpinner size="lg" />
		<CwSpinner size="xl" />
	</div>
</section>

<section class="demo-section">
	<h3>With Label</h3>
	<div class="demo-stack">
		<CwSpinner size="md" showLabel label="Loading sensor data…" />
		<CwSpinner size="lg" showLabel label="Syncing greenhouse devices…" />
	</div>
</section>

<section class="demo-section">
	<h3>Inline Usage</h3>
	<div class="demo-row">
		<CwButton loading>Saving Changes</CwButton>
		<div class="demo-pill">
			<CwSpinner size="md" />
			<span>Refreshing table rows…</span>
		</div>
	</div>
</section>

<DemoCodeExample code={spinnerExample} title="CwSpinner example" />

<style>
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); }


	.demo-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3);
		border-radius: var(--cw-radius-full);
		background: var(--cw-bg-muted);
		border: 1px solid var(--cw-border-default);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}
</style>
