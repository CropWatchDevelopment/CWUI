<script lang="ts">
	import { CwRadio } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let irrigationMode = $state('automatic');
	let notificationChannel = $state('email');
	let publishScope = $state('all');

	const radioExample = `<script lang="ts">
\timport { CwRadio } from '@cropwatchdevelopment/cwui';

\tlet irrigationMode = $state('automatic');
<\/script>

<fieldset>
\t<legend>Irrigation mode</legend>
\t<CwRadio
\t\tname="irrigation-mode"
\t\tvalue="automatic"
\t\tlabel="Automatic"
\t\tdescription="Follow the scheduled automation rules."
\t\tbind:group={irrigationMode}
\t/>
\t<CwRadio
\t\tname="irrigation-mode"
\t\tvalue="manual"
\t\tlabel="Manual"
\t\tdescription="Only run when an operator starts a cycle."
\t\tbind:group={irrigationMode}
\t/>
</fieldset>`;
</script>

<h2>CwRadio</h2>
<p class="demo-desc">
	Themed radio input with native form behavior. Group radios by sharing the same <code>name</code> and
	<code>bind:group</code> value.
</p>

<section class="demo-section">
	<h3>Stacked Group</h3>
	<fieldset class="demo-radio-group">
		<legend class="demo-legend">Irrigation mode</legend>
		<div class="demo-stack">
			<CwRadio
				name="irrigation-mode"
				value="automatic"
				label="Automatic"
				description="Follow the scheduled automation rules."
				bind:group={irrigationMode}
			/>
			<CwRadio
				name="irrigation-mode"
				value="manual"
				label="Manual"
				description="Only run when an operator starts a cycle."
				bind:group={irrigationMode}
			/>
			<CwRadio
				name="irrigation-mode"
				value="paused"
				label="Paused"
				description="Keep the configuration but stop new cycles."
				bind:group={irrigationMode}
			/>
		</div>
	</fieldset>
	<p class="demo-hint">Selected: <strong>{irrigationMode}</strong></p>
	<DemoCodeExample code={radioExample} title="CwRadio group example" />
</section>

<section class="demo-section">
	<h3>Compact Row</h3>
	<div class="demo-inline-group" role="radiogroup" aria-label="Notification channel">
		<CwRadio name="notification-channel" value="email" label="Email" bind:group={notificationChannel} />
		<CwRadio name="notification-channel" value="sms" label="SMS" bind:group={notificationChannel} />
		<CwRadio name="notification-channel" value="push" label="Push" bind:group={notificationChannel} />
	</div>
	<p class="demo-hint">Channel: <strong>{notificationChannel}</strong></p>
</section>

<section class="demo-section">
	<h3>Disabled Option</h3>
	<fieldset class="demo-radio-group">
		<legend class="demo-legend">Publish scope</legend>
		<div class="demo-stack">
			<CwRadio
				name="publish-scope"
				value="all"
				label="All devices"
				description="Push changes to every greenhouse in the fleet."
				bind:group={publishScope}
			/>
			<CwRadio
				name="publish-scope"
				value="active"
				label="Active greenhouse only"
				description="Limit the rollout to the greenhouse you are viewing."
				bind:group={publishScope}
			/>
			<CwRadio
				name="publish-scope"
				value="locked"
				label="Archive scope"
				description="Disabled example for unavailable rollout targets."
				group="locked"
				disabled
			/>
		</div>
	</fieldset>
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

	.demo-radio-group {
		display: grid;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-elevated);
	}

	.demo-legend {
		padding: 0 var(--cw-space-2);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-stack {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
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
