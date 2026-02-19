<script lang="ts">
	import { CwDialog, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let dialogOpen = $state(false);
	let backdropDialog = $state(false);
	const dialogExample = `let open = $state(false);

<CwButton onclick={() => (open = true)}>Open Dialog</CwButton>
<CwDialog bind:open={open} title="Confirm Action">
\t{#snippet children()}
\t\t<p>Are you sure you want to proceed?</p>
\t{/snippet}
</CwDialog>`;
</script>

<h2>CwDialog</h2>
<p class="demo-desc">Native &lt;dialog&gt; with focus trap, escape, backdrop click.</p>

<div class="demo-row">
	<CwButton onclick={() => (dialogOpen = true)}>Open Dialog</CwButton>
	<CwButton variant="secondary" onclick={() => (backdropDialog = true)}>Backdrop Close Disabled</CwButton>
</div>

<CwDialog bind:open={dialogOpen} title="Confirm Action">
	{#snippet children()}
		<p>Are you sure you want to proceed? This action cannot be undone.</p>
	{/snippet}
	{#snippet actions()}
		<CwButton variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</CwButton>
		<CwButton variant="danger" onclick={() => (dialogOpen = false)}>Delete</CwButton>
	{/snippet}
</CwDialog>

<CwDialog bind:open={backdropDialog} title="No Backdrop Close" closeOnBackdrop={false}>
	{#snippet children()}
		<p>This dialog can only be closed via Escape key or the button below.</p>
	{/snippet}
	{#snippet actions()}
		<CwButton onclick={() => (backdropDialog = false)}>Close</CwButton>
	{/snippet}
</CwDialog>

<DemoCodeExample code={dialogExample} title="CwDialog example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-3); align-items: center; }
	p { font-size: var(--cw-text-sm); color: var(--cw-text-secondary); }
</style>
