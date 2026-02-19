<script lang="ts">
	import { CwCard, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const cardExample = `<CwCard title="Device Summary" subtitle="Greenhouse 7">
\t{#snippet children()}
\t\t<p>All systems nominal.</p>
\t{/snippet}
</CwCard>`;
</script>

<h2>CwCard</h2>
<p class="demo-desc">Title, subtitle, elevated, actions, and custom header.</p>

<div class="demo-grid">
	<CwCard title="Basic Card">
		{#snippet children()}
			<p>Simple card with a title and body content.</p>
		{/snippet}
	</CwCard>

	<CwCard title="With Subtitle" subtitle="Extra context goes here">
		{#snippet children()}
			<p>Card with title and subtitle rendered in the header.</p>
		{/snippet}
	</CwCard>

	<CwCard title="Elevated" elevated>
		{#snippet children()}
			<p>This card has a raised shadow for emphasis.</p>
		{/snippet}
	</CwCard>

	<CwCard title="With Actions">
		{#snippet actions()}
			<CwButton size="sm" variant="ghost">Edit</CwButton>
			<CwButton size="sm" variant="primary">Save</CwButton>
		{/snippet}
		{#snippet children()}
			<p>Actions rendered in the card header row.</p>
		{/snippet}
	</CwCard>

	<CwCard title="Centered Title" titleAlign="center">
		{#snippet children()}
			<p>Center-aligned title support.</p>
		{/snippet}
	</CwCard>

	<CwCard title="Right Aligned" titleAlign="right">
		{#snippet children()}
			<p>Right-aligned title support.</p>
		{/snippet}
	</CwCard>

	<CwCard padded={false}>
		{#snippet children()}
			<div style="padding: var(--cw-space-4);">
				<p>No padding variant — useful for full-bleed content.</p>
			</div>
		{/snippet}
	</CwCard>
</div>

<DemoCodeExample code={cardExample} title="CwCard example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: var(--cw-space-4); }
	p { font-size: var(--cw-text-sm); color: var(--cw-text-secondary); }
</style>
