<script lang="ts">
	import type { CwSize, CwStatusDotStatus } from '../types/index.js';

	interface Props {
		/** Current status of the dot */
		status?: CwStatusDotStatus;
		/** Dot size */
		size?: CwSize;
		/** Optional custom text label */
		label?: string;
		/** Whether to render text label next to the dot */
		showLabel?: boolean;
		class?: string;
	}

	let {
		status = 'offline',
		size = 'md',
		label,
		showLabel = false,
		class: className = ''
	}: Props = $props();

	const statusLabel = $derived(
		label ?? (status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Loading')
	);
</script>

<span class="cw-status-dot {className}" role="status" aria-label={statusLabel}>
	<span
		class="cw-status-dot__dot cw-status-dot__dot--{status} cw-status-dot__dot--{size}"
		aria-hidden="true"
	></span>
	{#if showLabel}
		<span class="cw-status-dot__label">{statusLabel}</span>
	{/if}
</span>

<style>
	.cw-status-dot {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-status-dot__dot {
		display: inline-block;
		border-radius: var(--cw-radius-full);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--cw-bg-surface) 75%, transparent);
	}

	.cw-status-dot__dot--sm {
		width: 0.5rem;
		height: 0.5rem;
	}

	.cw-status-dot__dot--md {
		width: 0.625rem;
		height: 0.625rem;
	}

	.cw-status-dot__dot--lg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.cw-status-dot__dot--online {
		background-color: var(--cw-success-500);
	}

	.cw-status-dot__dot--offline {
		background-color: var(--cw-danger-500);
	}

	.cw-status-dot__dot--loading {
		background-color: var(--cw-warning-500);
		animation: cw-status-dot-pulse 1.1s ease-in-out infinite;
	}

	.cw-status-dot__label {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	@keyframes cw-status-dot-pulse {
		0% {
			opacity: 0.55;
			transform: scale(0.92);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0.55;
			transform: scale(0.92);
		}
	}
</style>
