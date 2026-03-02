<script lang="ts">
	import type { CwSize } from '../types/index.js';

	type CwSpinnerSize = CwSize | 'xl';

	interface Props {
		size?: CwSpinnerSize;
		showLabel?: boolean;
		label?: string;
		class?: string;
	}

	let {
		size = 'md',
		showLabel = false,
		label = 'Loading...',
		class: className = ''
	}: Props = $props();
</script>

<span
	class="cw-spinner cw-spinner--{size} {className}"
	role={showLabel ? 'status' : undefined}
	aria-live={showLabel ? 'polite' : undefined}
>
	<svg viewBox="0 0 24 24" fill="none" class="cw-spinner__icon cw-spin" aria-hidden={showLabel ? undefined : 'true'}>
		<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
		<path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
	</svg>
	{#if showLabel}
		<span class="cw-spinner__label">{label}</span>
	{/if}
</span>

<style>
	.cw-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		color: currentColor;
	}

	.cw-spinner__icon {
		display: block;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.cw-spinner--sm .cw-spinner__icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.cw-spinner--md .cw-spinner__icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-spinner--lg .cw-spinner__icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.cw-spinner--xl .cw-spinner__icon {
		width: 1.75rem;
		height: 1.75rem;
	}

	.cw-spinner__label {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}
</style>
