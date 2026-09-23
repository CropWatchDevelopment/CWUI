<script lang="ts">
	import { tick } from 'svelte';
	import { isCwToastUrgent, useCwToast } from './cwToastContext.svelte.js';
	import CwToastItem from './CwToastItem.svelte';

	interface Props {
		/** Accessible name for the notifications region */
		label?: string;
		/** Accessible label for each toast's dismiss button */
		dismissLabel?: string;
		class?: string;
	}

	const toast = useCwToast();
	let { label = 'Notifications', dismissLabel, class: className = '' }: Props = $props();

	let containerEl = $state<HTMLElement | null>(null);

	/*
	 * Live regions are mounted permanently (screen readers ignore regions that
	 * appear together with their content). Routine tones are announced politely;
	 * warning/danger interrupt.
	 */
	let politeText = $state('');
	let alertText = $state('');
	const announced = new Set<string>();

	$effect(() => {
		const current = toast.items;
		const currentIds = new Set(current.map((t) => t.id));
		for (const id of announced) if (!currentIds.has(id)) announced.delete(id);

		for (const item of current) {
			if (announced.has(item.id)) continue;
			announced.add(item.id);
			const text = item.title ? `${item.title}. ${item.message}` : item.message;
			if (isCwToastUrgent(item.tone)) {
				alertText = '';
				void tick().then(() => (alertText = text));
			} else {
				politeText = '';
				void tick().then(() => (politeText = text));
			}
		}
	});

	/*
	 * Render in the top layer (popover="manual") so toasts stay visible above
	 * open modal dialogs. Re-showing moves the popover to the top of the stack.
	 */
	const supportsPopover =
		typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

	$effect(() => {
		const el = containerEl;
		const count = toast.items.length;
		if (!el || !supportsPopover) return;
		try {
			if (el.matches(':popover-open')) el.hidePopover();
			if (count > 0) el.showPopover();
		} catch {
			// Element not connected or popover unsupported — fall back to fixed positioning.
		}
	});
</script>

<div class="cw-toast-live" aria-live="polite" role="status">{politeText}</div>
<div class="cw-toast-live" aria-live="assertive" role="alert">{alertText}</div>

<section
	bind:this={containerEl}
	class={['cw-toast-container', className]}
	aria-label={label}
	popover={supportsPopover ? 'manual' : undefined}
	hidden={toast.items.length === 0 && !supportsPopover}
>
	{#each toast.items as item (item.id)}
		<CwToastItem {item} ondismiss={toast.dismiss} {dismissLabel} />
	{/each}
</section>

<style>
	.cw-toast-live {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	.cw-toast-container {
		position: fixed;
		inset: auto;
		/* Sit just below the 5rem app header. */
		top: calc(5rem + env(safe-area-inset-top, 0px) + var(--cw-space-3));
		right: max(var(--cw-space-4), env(safe-area-inset-right, 0px));
		z-index: var(--cw-z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		width: min(28rem, calc(100vw - 2 * var(--cw-space-4)));
		max-height: calc(100dvh - 6rem);
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		overflow: visible;
		pointer-events: none;
	}

	/* The popover UA stylesheet hides closed popovers; keep layout identical when open. */
	.cw-toast-container:popover-open {
		display: flex;
	}

	.cw-toast-container > :global(*) {
		pointer-events: auto;
	}

	@media (max-width: 640px) {
		.cw-toast-container {
			top: calc(env(safe-area-inset-top, 0px) + var(--cw-space-3));
			left: max(var(--cw-space-3), env(safe-area-inset-left, 0px));
			right: max(var(--cw-space-3), env(safe-area-inset-right, 0px));
			width: auto;
		}
	}
</style>
