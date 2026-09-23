<script lang="ts">
	import { CwOfflineOverlay, CwSwitch } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let simulateOffline = $state(false);
	let retrySucceeds = $state(true);
	let lastEvent = $state('none yet');

	async function handleRetry() {
		lastEvent = 'retry started';
		// Simulate a network check that takes a moment.
		await new Promise((resolve) => setTimeout(resolve, 1200));
		if (retrySucceeds) {
			simulateOffline = false;
			lastEvent = 'retry succeeded';
		} else {
			lastEvent = 'retry failed, still offline';
		}
	}

	const offlineExample = `<CwOfflineOverlay
\tforceOffline={simulateOffline}
\tonRetry={async () => {
\t\tawait checkConnection();
\t}}
/>

<!-- Or let the overlay check the network itself: -->
<CwOfflineOverlay pingUrl="/api/health" />`;
</script>

<h2>CwOfflineOverlay</h2>
<p class="demo-desc">
	Blocking modal shown when the browser loses its connection, with a “back online” notice when it
	returns. Retry never reloads the page: it calls <code>onRetry</code> (which may return a promise)
	or re-checks the network, optionally by pinging <code>pingUrl</code>. When a toast context
	exists, the reconnect notice is shown as a toast.
</p>

<section class="demo-section">
	<h3>Simulate</h3>
	<div class="demo-panel demo-stack">
		<CwSwitch
			label="Simulate offline"
			description="Shows the overlay immediately."
			bind:checked={simulateOffline}
		/>
		<CwSwitch
			label="Retry succeeds"
			description="When off, Retry spins for a moment and the overlay stays open."
			bind:checked={retrySucceeds}
		/>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
	<DemoCodeExample code={offlineExample} title="CwOfflineOverlay example" />
</section>

<CwOfflineOverlay forceOffline={simulateOffline} onRetry={handleRetry} />
