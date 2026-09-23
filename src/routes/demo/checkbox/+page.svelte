<script lang="ts">
	import { CwCheckbox } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let includeOffline = $state(true);
	let includeAlerts = $state(false);
	let includeNotes = $state(true);
	let smsAlerts = $state(false);
	let emailDigest = $state(true);
	let pushAlerts = $state(false);
	let acceptTerms = $state(false);

	let sensors = $state([
		{ id: 'temp', label: 'Temperature', checked: true },
		{ id: 'humidity', label: 'Humidity', checked: false },
		{ id: 'co2', label: 'CO₂', checked: true }
	]);

	const checkedCount = $derived(sensors.filter((sensor) => sensor.checked).length);
	const allChecked = $derived(checkedCount === sensors.length);
	const someChecked = $derived(checkedCount > 0 && !allChecked);

	function toggleAll(checked: boolean) {
		for (const sensor of sensors) sensor.checked = checked;
	}

	const indeterminateExample = `<CwCheckbox
\tlabel="All sensors"
\tchecked={allChecked}
\tindeterminate={someChecked}
\tonchange={(checked) => toggleAll(checked)}
/>`;

	const checkboxExample = `<script lang="ts">
\timport { CwCheckbox } from '@cropwatchdevelopment/cwui';

\tlet includeOffline = $state(true);
<\/script>

<CwCheckbox
\tname="includeOffline"
\tlabel="Include offline devices"
\tdescription="Keep stale or disconnected devices in the table."
\tbind:checked={includeOffline}
/>`;
</script>

<h2>CwCheckbox</h2>
<p class="demo-desc">
	Checkbox control for independent yes/no selections. It uses a real checkbox input, explicit form
	<code>name</code> support, and the same light/dark theme tokens as the rest of CWUI.
</p>

<section class="demo-section">
	<h3>Basic</h3>
	<CwCheckbox
		name="includeOffline"
		label="Include offline devices"
		description="Keep stale or disconnected devices in the table."
		value="yes"
		bind:checked={includeOffline}
	/>
	<p class="demo-hint">State: <strong>{includeOffline ? 'Checked' : 'Unchecked'}</strong></p>
	<DemoCodeExample code={checkboxExample} title="CwCheckbox example" />
</section>

<section class="demo-section">
	<h3>Stacked options</h3>
	<div class="demo-stack demo-panel">
		<CwCheckbox
			name="filters"
			value="alerts"
			label="Show alerts"
			description="Include active alert rows in the report export."
			bind:checked={includeAlerts}
		/>
		<CwCheckbox
			name="filters"
			value="notes"
			label="Include notes"
			description="Attach operator notes to each exported record."
			bind:checked={includeNotes}
		/>
		<CwCheckbox
			name="filters"
			value="audit"
			label="Locked option"
			description="Disabled example for unavailable export add-ons."
			checked
			disabled
		/>
	</div>
</section>

<section class="demo-section">
	<h3>Indeterminate "select all"</h3>
	<div class="demo-stack demo-panel">
		<CwCheckbox
			label="All sensors"
			description="Mixed state shows a dash when only some sensors are selected."
			checked={allChecked}
			indeterminate={someChecked}
			onchange={(checked) => toggleAll(checked)}
		/>
		<div class="demo-nested">
			{#each sensors as sensor (sensor.id)}
				<CwCheckbox name="sensors" value={sensor.id} label={sensor.label} bind:checked={sensor.checked} />
			{/each}
		</div>
	</div>
	<DemoCodeExample code={indeterminateExample} title="Indeterminate checkbox" />
</section>

<section class="demo-section">
	<h3>Required with error</h3>
	<div class="demo-panel">
		<CwCheckbox
			name="terms"
			label="I confirm the calibration values are correct"
			required
			error={acceptTerms ? undefined : 'Confirm before saving the calibration'}
			bind:checked={acceptTerms}
		/>
	</div>
</section>

<section class="demo-section">
	<h3>Compact row</h3>
	<div class="demo-inline-group demo-panel" role="group" aria-label="Notification preferences">
		<CwCheckbox name="notifySms" label="SMS alerts" bind:checked={smsAlerts} />
		<CwCheckbox name="notifyEmail" label="Email digest" bind:checked={emailDigest} />
		<CwCheckbox name="notifyPush" label="Push alerts" bind:checked={pushAlerts} />
	</div>
	<p class="demo-hint">
		Enabled:
		<strong>
			{[
				smsAlerts ? 'SMS' : null,
				emailDigest ? 'Email' : null,
				pushAlerts ? 'Push' : null
			].filter(Boolean).join(', ') || 'None'}
		</strong>
	</p>
</section>

<style>
	.demo-inline-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
	}
	.demo-nested {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding-left: var(--cw-space-6);
	}

	.demo-hint strong {
		color: var(--cw-accent-text);
	}
</style>
