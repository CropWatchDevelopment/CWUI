<script lang="ts">
	import { CwOfflineOverlay, CwSwitch } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let simulateOffline = $state(false);

	const offlineExample = `let simulateOffline = $state(false);

<CwSwitch
\tlabel="Simulate offline"
\tbind:checked={simulateOffline}
/>

<CwOfflineOverlay
\tforceOffline={simulateOffline}
\tonRetry={() => (simulateOffline = false)}
/>`;
</script>

<h2>CwOfflineOverlay</h2>
<p class="demo-desc">
	Full-screen offline state with reconnect toast. For demo mode, toggle simulation to force the overlay.
</p>

<div class="demo-card">
	<CwSwitch
		label="Simulate offline"
		description="Clicking retry will return to online mode in this demo."
		bind:checked={simulateOffline}
	/>
</div>

<DemoCodeExample code={offlineExample} title="CwOfflineOverlay example" />

<CwOfflineOverlay
	forceOffline={simulateOffline}
	onRetry={() => (simulateOffline = false)}
/>

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
</style>
