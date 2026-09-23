<script lang="ts">
	import { CwDialog, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let confirmOpen = $state(false);
	let backdropOpen = $state(false);
	let untitledOpen = $state(false);
	let longOpen = $state(false);
	let lastEvent = $state('none yet');

	const releaseNotes = [
		'Sensor cards now show a stale state when a device stops reporting.',
		'Charts render a shared "No data available" overlay instead of fake zeros.',
		'Form controls share one height scale: sm, md and lg.',
		'The side navigation becomes an off-canvas drawer on phones.',
		'Toasts pause while hovered or focused and never auto-dismiss danger messages.',
		'Tables support compact density, numeric columns and a sticky header with maxHeight.',
		'Dialogs lock page scroll and animate in and out.',
		'Focus rings use one solid, high-contrast outline everywhere.',
		'Status colours come from shared --cw-status-* tokens.',
		'Light-theme borders and tone colours meet contrast targets.',
		'The offline overlay re-checks the connection instead of reloading the page.',
		'Calendars and date pickers are fully keyboard-operable.'
	];

	function confirmDelete() {
		confirmOpen = false;
		lastEvent = 'Deleted "Greenhouse 7 sensor"';
	}

	const dialogExample = `let open = $state(false);

<CwButton onclick={() => (open = true)}>Delete device</CwButton>
<CwDialog bind:open title="Delete device?">
\t<p>This removes the sensor and its history. This can't be undone.</p>
\t{#snippet actions()}
\t\t<CwButton variant="ghost" onclick={() => (open = false)}>Cancel</CwButton>
\t\t<CwButton variant="danger" onclick={remove}>Delete</CwButton>
\t{/snippet}
</CwDialog>

<!-- No visible title: give it an accessible name instead -->
<CwDialog bind:open={previewOpen} ariaLabel="Photo preview">…</CwDialog>`;
</script>

<h2>CwDialog</h2>
<p class="demo-desc">
	Built on the native <code>&lt;dialog&gt;</code> element: focus is trapped inside, Escape closes it,
	page scroll is locked while it's open, and focus returns to the trigger on close.
</p>

<section class="demo-section">
	<h3>Confirmation</h3>
	<div class="demo-row">
		<CwButton variant="danger" onclick={() => (confirmOpen = true)}>Delete device</CwButton>
		<CwButton variant="secondary" onclick={() => (backdropOpen = true)}>
			Backdrop close disabled
		</CwButton>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
</section>

<section class="demo-section">
	<h3>Untitled and long content</h3>
	<div class="demo-row">
		<CwButton variant="secondary" onclick={() => (untitledOpen = true)}>Untitled dialog</CwButton>
		<CwButton variant="secondary" onclick={() => (longOpen = true)}>Scrolling content</CwButton>
	</div>
	<p class="demo-hint">
		Without a <code>title</code>, pass <code>ariaLabel</code>; the close button stays on the right.
	</p>
	<DemoCodeExample code={dialogExample} title="CwDialog example" />
</section>

<CwDialog bind:open={confirmOpen} title="Delete device?">
	<p class="demo-dialog-copy">
		This removes "Greenhouse 7 sensor" and its reading history. This can't be undone.
	</p>
	{#snippet actions()}
		<CwButton variant="ghost" onclick={() => (confirmOpen = false)}>Cancel</CwButton>
		<CwButton variant="danger" onclick={confirmDelete}>Delete</CwButton>
	{/snippet}
</CwDialog>

<CwDialog bind:open={backdropOpen} title="Backdrop click disabled" closeOnBackdrop={false}>
	<p class="demo-dialog-copy">
		Clicking outside does nothing. Close it with Escape or the button below.
	</p>
	{#snippet actions()}
		<CwButton onclick={() => (backdropOpen = false)}>Close</CwButton>
	{/snippet}
</CwDialog>

<CwDialog bind:open={untitledOpen} ariaLabel="Sync complete">
	<p class="demo-dialog-copy">
		All 24 devices synced successfully. This dialog has no visible title, so it is named with
		<code>ariaLabel</code>.
	</p>
	{#snippet actions()}
		<CwButton variant="primary" onclick={() => (untitledOpen = false)}>Done</CwButton>
	{/snippet}
</CwDialog>

<CwDialog bind:open={longOpen} title="What's new in this release">
	<ul class="demo-dialog-list">
		{#each releaseNotes as note (note)}
			<li>{note}</li>
		{/each}
	</ul>
	{#snippet actions()}
		<CwButton variant="primary" onclick={() => (longOpen = false)}>Got it</CwButton>
	{/snippet}
</CwDialog>

<style>
	.demo-dialog-copy {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-dialog-list {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
		padding-left: var(--cw-space-5);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
		color: var(--cw-text-secondary);
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}
</style>
