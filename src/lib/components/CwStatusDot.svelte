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
		label ??
			(status === 'online'
				? 'Online'
				: status === 'offline'
					? 'Offline'
					: status === 'warning'
						? 'Warning'
						: 'Loading')
	);
</script>

<!-- Not a live region: dots appear in lists/tables where announcing every
     change would be noisy. Consumers own announcements. -->
<span class="cw-status-dot {className}">
	<span
		class="cw-status-dot__dot cw-status-dot__dot--{status} cw-status-dot__dot--{size}"
		role={showLabel ? undefined : 'img'}
		aria-label={showLabel ? undefined : statusLabel}
		aria-hidden={showLabel ? 'true' : undefined}
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
		position: relative;
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
		background-color: var(--cw-status-online);
	}

	.cw-status-dot__dot--offline {
		background-color: var(--cw-status-offline);
	}

	.cw-status-dot__dot--offline::after,
	.cw-status-dot__dot--warning::after {
		content: '';
		position: absolute;
		inset: -0.2rem;
		border: 2px solid color-mix(in srgb, currentColor 62%, transparent);
		border-radius: inherit;
		pointer-events: none;
		opacity: 0;
	}

	.cw-status-dot__dot--offline::after {
		color: var(--cw-status-offline);
	}

	.cw-status-dot__dot--loading {
		background-color: var(--cw-status-loading);
	}

	.cw-status-dot__dot--warning {
		background-color: var(--cw-status-warning);
	}

	.cw-status-dot__dot--warning::after {
		color: var(--cw-status-warning);
	}

	/* Motion only for users who haven't asked to reduce it. Without motion
	   the ring stays hidden and the dot is static. */
	@media (prefers-reduced-motion: no-preference) {
		.cw-status-dot__dot--offline {
			animation: cw-status-dot-offline-core 1.25s ease-in-out infinite;
		}

		.cw-status-dot__dot--offline::after {
			animation: cw-status-dot-ring 1.25s ease-out infinite;
		}

		.cw-status-dot__dot--loading {
			animation: cw-status-dot-pulse 1.1s ease-in-out infinite;
		}

		.cw-status-dot__dot--warning::after {
			animation: cw-status-dot-ring 1.5s ease-out infinite;
		}
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

	@keyframes cw-status-dot-offline-core {
		0%,
		100% {
			transform: scale(0.9);
		}
		45% {
			transform: scale(1);
		}
	}

	@keyframes cw-status-dot-ring {
		0% {
			opacity: 0.68;
			transform: scale(0.65);
		}
		70% {
			opacity: 0;
			transform: scale(1.8);
		}
		100% {
			opacity: 0;
			transform: scale(1.8);
		}
	}
</style>
