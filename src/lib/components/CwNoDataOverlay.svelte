<script lang="ts">
	import { CW_DEFAULT_NO_DATA_MESSAGE } from './cwNoData.js';

	interface Props {
		message?: string;
		/** Show the empty-state icon above the message. */
		showIcon?: boolean;
	}

	let { message = CW_DEFAULT_NO_DATA_MESSAGE, showIcon = true }: Props = $props();

	const displayMessage = $derived(
		message.trim().length > 0 ? message : CW_DEFAULT_NO_DATA_MESSAGE
	);

	let overlayEl = $state<HTMLElement | null>(null);

	/*
	 * The blurred content underneath is only a backdrop: make it inert so it
	 * can't be tabbed into or read out by screen readers while the overlay shows.
	 */
	$effect(() => {
		const host = overlayEl?.parentElement;
		if (!overlayEl || !host) return;
		const siblings = Array.from(host.children).filter(
			(el): el is HTMLElement => el !== overlayEl && el instanceof HTMLElement && !el.inert
		);
		for (const el of siblings) el.inert = true;
		return () => {
			for (const el of siblings) el.inert = false;
		};
	});
</script>

<div class="cw-no-data-overlay" role="status" bind:this={overlayEl}>
	<div class="cw-no-data-overlay__message">
		{#if showIcon}
			<svg class="cw-no-data-overlay__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M4 19h16M6 15l3.5-4 3 2.5L18 7"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-dasharray="2.5 2.5"
				/>
			</svg>
		{/if}
		<p class="cw-no-data-overlay__text">{displayMessage}</p>
	</div>
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
		z-index: var(--cw-z-inline-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-4);
		background-color: color-mix(in srgb, var(--cw-bg-surface) 64%, transparent);
		backdrop-filter: blur(2px);
		text-align: center;
	}

	.cw-no-data-overlay__message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--cw-space-2);
		max-width: min(32rem, 100%);
		padding: var(--cw-space-3) var(--cw-space-4);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		background-color: var(--cw-popover-bg);
		box-shadow: var(--cw-elevation-popover);
		color: var(--cw-text-primary);
	}

	.cw-no-data-overlay__icon {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--cw-text-muted);
	}

	.cw-no-data-overlay__text {
		margin: 0;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-normal);
		overflow-wrap: anywhere;
	}

	/* Fallback without color-mix: use the theme surface directly (works in both themes). */
	@supports not (background-color: color-mix(in srgb, white, black)) {
		.cw-no-data-overlay {
			background-color: var(--cw-bg-surface);
			opacity: 0.96;
		}
	}
</style>
