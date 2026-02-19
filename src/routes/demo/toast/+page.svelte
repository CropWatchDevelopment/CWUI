<script lang="ts">
	import { CwToastContainer, CwButton, createCwToastContext, useCwToast } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	createCwToastContext();
	const toast = useCwToast();

	const tones = ['primary', 'info', 'warning', 'danger', 'success'] as const;
	const toastExample = `createCwToastContext();
const toast = useCwToast();

<CwToastContainer />
<CwButton onclick={() => toast.add({ tone: 'success', message: 'Saved!' })}>
\tShow toast
</CwButton>`;
</script>

<CwToastContainer />

<h2>CwToast</h2>
<p class="demo-desc">Toast notifications with tone variants and auto-dismiss.</p>

<div class="demo-row">
	{#each tones as tone}
		<CwButton
			variant={tone === 'primary' ? 'primary' : tone === 'danger' ? 'danger' : 'secondary'}
			onclick={() => toast.add({ tone, message: `This is a ${tone} toast notification.` })}
		>
			{tone}
		</CwButton>
	{/each}
</div>

<section class="demo-section">
	<h3>Long-lived toast</h3>
	<CwButton
		variant="ghost"
		onclick={() => toast.add({ tone: 'info', message: 'This toast stays for 10 seconds.', duration: 10000 })}
	>
		10s Toast
	</CwButton>
	<DemoCodeExample code={toastExample} title="CwToast example" />
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-top: var(--cw-space-6); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-3); align-items: center; }
</style>
