<script lang="ts">
	import { CwChip } from '$lib/index.js';

	const tones = ['primary', 'secondary', 'info', 'warning', 'danger', 'success'] as const;
	const variants = ['solid', 'soft', 'outline'] as const;
</script>

<h2>CwChip</h2>
<p class="demo-desc">Tone × variant × size matrix with dismissible option.</p>

{#each variants as variant}
	<section class="demo-section">
		<h3>{variant}</h3>
		<div class="demo-row">
			{#each tones as tone}
				<CwChip {tone} {variant} label={tone} />
			{/each}
		</div>
	</section>
{/each}

<section class="demo-section">
	<h3>Dismissible</h3>
	<div class="demo-row">
		{#each tones as tone}
			<CwChip {tone} variant="soft" label={tone} dismissible ondismiss={() => alert(`Dismissed ${tone}`)} />
		{/each}
	</div>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row">
		<CwChip tone="primary" label="Small" size="sm" />
		<CwChip tone="primary" label="Medium" size="md" />
		<CwChip tone="primary" label="Large" size="lg" />
	</div>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); text-transform: capitalize; }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-bottom: var(--cw-space-6); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-3); align-items: center; }
</style>
