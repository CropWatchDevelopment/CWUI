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
<p class="demo-desc">
	Status indicator for online, offline, loading and warning states. Colours come from the shared
	<code>--cw-status-*</code> tokens, so dots match the sensor and location cards. Offline and
	warning use ring animations and loading pulses; all animation stops when the user prefers
	reduced motion. Without a visible label the dot is announced as an image with an accessible
	name.
</p>

<section class="demo-section">
	<h3>All statuses</h3>
	<div class="demo-panel demo-row">
		<CwStatusDot status="online" showLabel />
		<CwStatusDot status="offline" showLabel />
		<CwStatusDot status="loading" showLabel />
		<CwStatusDot status="warning" showLabel />
	</div>
</section>

<section class="demo-section">
	<h3>Dot only (accessible name, no visible label)</h3>
	<div class="demo-panel demo-row">
		<CwStatusDot status="online" label="Gateway online" />
		<CwStatusDot status="offline" label="Gateway offline" />
		<CwStatusDot status="loading" label="Checking gateway" />
		<CwStatusDot status="warning" label="Gateway degraded" />
	</div>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-panel demo-row">
		<CwStatusDot status="online" size="sm" label="Small" showLabel />
		<CwStatusDot status="online" size="md" label="Medium" showLabel />
		<CwStatusDot status="online" size="lg" label="Large" showLabel />
	</div>
</section>

<section class="demo-section">
	<h3>Animated states</h3>
	<div class="demo-panel demo-row">
		<CwStatusDot status="offline" size="lg" label="Offline (pulsing)" showLabel />
		<CwStatusDot status="warning" size="lg" label="Warning (ring)" showLabel />
	</div>
	<DemoCodeExample code={statusDotExample} title="CwStatusDot example" />
</section>
