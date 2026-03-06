<script lang="ts">
	import type CwTextArea from '$lib/components/CwTextArea.svelte';
	import { CwButton, CwCard, CwTextArea as CwTextAreaComponent } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let fieldNotes = $state('');
	let validationValue = $state('');
	let validationError = $state('');
	let validationValid = $state(false);
	let validationField = $state<CwTextArea | null>(null);

	const basicExample = `<CwTextArea
\tlabel="Field notes"
\tplaceholder="Log observations, thresholds, or operator context..."
\tbind:value={notes}
\thint="Use the theme picker in the header to verify light and dark mode."
\trows={5}
\tmaxlength={280}
\tshowCount
/>`;

	const validationExample = `<script lang="ts">
\timport { CwTextArea } from '@cropwatchdevelopment/cwui';

\ttype ValidatableTextArea = {
\t\treportValidity: () => boolean;
\t\tsetCustomValidity: (message: string) => void;
\t};

\tlet summary = $state('');
\tlet error = $state('');
\tlet valid = $state(false);
\tlet field = $state<ValidatableTextArea | null>(null);

\tfunction handleInput() {
\t\terror = '';
\t\tvalid = false;
\t\tfield?.setCustomValidity('');
\t}

\tfunction validate(event: SubmitEvent) {
\t\tevent.preventDefault();
\t\terror = '';
\t\tvalid = false;
\t\tfield?.setCustomValidity('');

\t\tif (!(field?.reportValidity() ?? true)) return;

\t\tif (summary.trim().length < 20) {
\t\t\terror = 'Add at least 20 characters so the next shift has enough context.';
\t\t\treturn;
\t\t}

\t\tvalid = true;
\t}
<\\/script>

<form onsubmit={validate}>
\t<CwTextArea
\t\tbind:this={field}
\t\tlabel="Shift handoff"
\t\tname="handoff"
\t\trequired
\t\tminlength={10}
\t\tmaxlength={240}
\t\tbind:value={summary}
\t\terror={error}
\t\tvalid={valid}
\t\toninput={handleInput}
\t\tshowCount
\t/>
</form>`;

	function resetValidationState() {
		validationError = '';
		validationValid = false;
		validationField?.setCustomValidity('');
	}

	function handleValidationInput() {
		resetValidationState();
	}

	function fillSample() {
		validationValue =
			'Pump 3 restarted at 04:20. Moisture readings climbed 6% after irrigation cycle B and stayed stable through the last sync.';
		resetValidationState();
	}

	function validateTextArea(event: SubmitEvent) {
		event.preventDefault();
		resetValidationState();

		if (!(validationField?.reportValidity() ?? true)) {
			return;
		}

		const trimmed = validationValue.trim();
		if (trimmed.length < 20) {
			validationError = 'Add at least 20 characters so the next shift has enough context.';
			return;
		}

		if (/lorem ipsum/i.test(trimmed)) {
			const message = 'Replace placeholder text before submitting.';
			validationError = message;
			validationField?.setCustomValidity(message);
			validationField?.reportValidity();
			return;
		}

		validationValid = true;
	}
</script>

<h2>CwTextArea</h2>
<p class="demo-desc">
	Multi-line input with the same CWUI field treatment as <code>CwInput</code>, plus
	native-friendly validation hooks and responsive layout behavior.
</p>

<div class="demo-grid">
	<CwCard
		title="Basic Usage"
		subtitle="Helper text, counter, and full-width responsive behavior."
		elevated
	>
		<div class="demo-stack">
			<CwTextAreaComponent
				label="Field notes"
				placeholder="Log observations, thresholds, or operator context..."
				bind:value={fieldNotes}
				hint="Use the theme picker in the header to verify both light and dark themes."
				rows={5}
				maxlength={280}
				showCount
			/>

			<div class="demo-preview">
				<span class="demo-preview__label">Live preview</span>
				<p>{fieldNotes || 'Nothing entered yet.'}</p>
			</div>
		</div>
	</CwCard>

	<CwCard
		title="Validation Demo"
		subtitle="Combines browser validation attributes with custom client-side rules."
		elevated
	>
		<form class="demo-form" onsubmit={validateTextArea}>
			<CwTextAreaComponent
				bind:this={validationField}
				label="Shift handoff"
				name="handoff"
				placeholder="Summarize what changed before the next operator takes over..."
				required
				minlength={10}
				maxlength={240}
				bind:value={validationValue}
				error={validationError}
				valid={validationValid}
				hint="Required. Native validation checks required/minlength/maxlength, then custom rules can layer on top."
				showCount
				oninput={handleValidationInput}
			/>

			<div class="demo-actions">
				<CwButton type="submit">Validate</CwButton>
				<CwButton type="button" variant="secondary" onclick={fillSample}>
					Load sample
				</CwButton>
			</div>
		</form>

		{#if validationValid}
			<p class="demo-success">Validation passed. This textarea is ready for submit handling.</p>
		{/if}
	</CwCard>
</div>

<section class="demo-section">
	<h3>Code Samples</h3>
	<DemoCodeExample code={basicExample} title="Basic CwTextArea" />
	<DemoCodeExample code={validationExample} title="Validation with CwTextArea" />
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
		margin-bottom: var(--cw-space-3);
		color: var(--cw-text-secondary);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-accent);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
		max-width: 48rem;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: var(--cw-space-4);
		align-items: start;
	}

	.demo-stack,
	.demo-form {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
	}

	.demo-preview {
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		background: color-mix(in srgb, var(--cw-bg-elevated) 72%, transparent);
	}

	.demo-preview__label {
		display: inline-block;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		margin-bottom: var(--cw-space-2);
	}

	.demo-preview p {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.demo-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.demo-success {
		margin-top: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-tone-success-text);
	}

	.demo-section {
		margin-top: var(--cw-space-6);
	}

	@media (max-width: 40rem) {
		.demo-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
