<script lang="ts">
	import { useCwToast } from './cwToastContext.svelte.js';
	import CwToastItem from './CwToastItem.svelte';

	interface Props {
		class?: string;
	}

	const toast = useCwToast();
	let { class: className = '' }: Props = $props();
</script>

{#if toast.items.length > 0}
	<div class="cw-toast-container {className}" aria-label="Notifications" role="region">
		{#each toast.items as item (item.id)}
			<CwToastItem {item} ondismiss={toast.dismiss} />
		{/each}
	</div>
{/if}

<style>
	.cw-toast-container {
		position: fixed;
		top: var(--cw-space-4);
		right: var(--cw-space-4);
		z-index: var(--cw-z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		pointer-events: none;
	}

	.cw-toast-container > :global(*) {
		pointer-events: auto;
	}

	@media (max-width: 640px) {
		.cw-toast-container {
			left: var(--cw-space-4);
			right: var(--cw-space-4);
		}
	}
</style>
