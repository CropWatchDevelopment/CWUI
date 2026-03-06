<script lang="ts">
	import { CwStatusDot } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const statusDotExample = `<CwStatusDot status="online" showLabel />
<CwStatusDot status="offline" showLabel />
<CwStatusDot status="loading" showLabel />
<CwStatusDot status="warning" showLabel />

<!-- Offline status is animated (CSS pulse) -->
<CwStatusDot status="offline" size="lg" label="Offline (pulsing)" showLabel />`;
</script>

<h2>CwStatusDot</h2>
<p class="demo-desc">Simple status indicator for online, offline, loading, and warning states. Offline and warning statuses include ring animations; loading pulses.</p>

<div class="demo-card">
	<div class="demo-row">
		<CwStatusDot status="online" showLabel />
		<CwStatusDot status="offline" showLabel />
		<CwStatusDot status="loading" showLabel />
		<CwStatusDot status="warning" showLabel />
	</div>
</div>

<div class="demo-card">
	<span class="demo-label">Sizes</span>
	<div class="demo-row">
		<CwStatusDot status="online" size="sm" />
		<CwStatusDot status="online" size="md" />
		<CwStatusDot status="online" size="lg" />
	</div>
</div>

<div class="demo-card">
	<span class="demo-label">Offline pulse</span>
	<div class="demo-row">
		<CwStatusDot status="offline" size="lg" label="Offline (pulsing)" showLabel />
	</div>
</div>

<div class="demo-card">
	<span class="demo-label">Warning ring</span>
	<div class="demo-row">
		<CwStatusDot status="warning" size="lg" label="Warning (ring)" showLabel />
	</div>
</div>

<DemoCodeExample code={statusDotExample} title="CwStatusDot example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		margin-bottom: var(--cw-space-4);
	}
	.demo-row { display: flex; align-items: center; gap: var(--cw-space-5); flex-wrap: wrap; }
	.demo-label { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
</style>
