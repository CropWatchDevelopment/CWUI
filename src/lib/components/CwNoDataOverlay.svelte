<script lang="ts">
	import { CW_DEFAULT_NO_DATA_MESSAGE } from './cwNoData.js';

	interface Props {
		message?: string;
	}

	let { message = CW_DEFAULT_NO_DATA_MESSAGE }: Props = $props();

	const displayMessage = $derived(
		message.trim().length > 0 ? message : CW_DEFAULT_NO_DATA_MESSAGE
	);
</script>

<div class="cw-no-data-overlay" role="status" aria-live="polite">
	<p class="cw-no-data-overlay__message">{displayMessage}</p>
</div>

<style>
	:global(.cw-no-data-host) {
		position: relative;
	}

	:global(.cw-no-data-host--active) {
		overflow: hidden;
	}

	:global(.cw-no-data-host--active > :not(.cw-no-data-overlay)) {
		filter: blur(3px);
		opacity: 0.45;
		pointer-events: none;
		user-select: none;
	}

	.cw-no-data-overlay {
		position: absolute;
		inset: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-4);
		background-color: color-mix(in srgb, var(--cw-bg-surface) 64%, transparent);
		backdrop-filter: blur(2px);
		text-align: center;
	}

	.cw-no-data-overlay__message {
		max-width: min(32rem, 100%);
		margin: 0;
		padding: var(--cw-space-3) var(--cw-space-4);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 84%, transparent);
		border-radius: var(--cw-radius-md);
		background-color: color-mix(in srgb, var(--cw-bg-elevated) 92%, transparent);
		box-shadow: var(--cw-shadow-md);
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-normal);
		overflow-wrap: anywhere;
	}

	@supports not (background-color: color-mix(in srgb, white, black)) {
		.cw-no-data-overlay {
			background-color: rgba(255, 255, 255, 0.64);
		}

		.cw-no-data-overlay__message {
			background-color: rgba(255, 255, 255, 0.92);
			border-color: rgba(0, 0, 0, 0.14);
		}
	}
</style>
