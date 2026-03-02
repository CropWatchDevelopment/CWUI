<script lang="ts">
	import { CwSpinner, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const spinnerExample = `<CwSpinner size="md" />
<CwSpinner size="lg" showLabel label="Loading data..." />`;
</script>

<h2>CwSpinner</h2>
<p class="demo-desc">Reusable loading indicator shared by buttons, tables, and async UI states.</p>

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
		<CwSpinner size="md" showLabel label="Loading sensor data..." />
		<CwSpinner size="lg" showLabel label="Syncing greenhouse devices..." />
	</div>
</section>

<section class="demo-section">
	<h3>Inline Usage</h3>
	<div class="demo-row">
		<CwButton loading>Saving Changes</CwButton>
		<div class="demo-pill">
			<CwSpinner size="md" />
			<span>Refreshing table rows...</span>
		</div>
	</div>
</section>

<DemoCodeExample code={spinnerExample} title="CwSpinner example" />

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin-bottom: var(--cw-space-2);
		color: var(--cw-text-secondary);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-section {
		margin-bottom: var(--cw-space-6);
	}

	.demo-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-4);
	}

	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
	}

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
