<script lang="ts">
	import { CwCheckbox } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let includeOffline = $state(true);
	let includeAlerts = $state(false);
	let includeNotes = $state(true);
	let smsAlerts = $state(false);
	let emailDigest = $state(true);
	let pushAlerts = $state(false);

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
	<h3>Stacked Options</h3>
	<div class="demo-stack">
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
	<h3>Compact Row</h3>
	<div class="demo-inline-group" aria-label="Notification preferences">
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

	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-elevated);
	}

	.demo-inline-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-elevated);
	}

	.demo-hint {
		margin-top: var(--cw-space-2);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
	}

	.demo-hint strong {
		color: var(--cw-accent);
	}
</style>
