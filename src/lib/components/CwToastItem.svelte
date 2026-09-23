<script lang="ts">
	import type { CwToastItem } from '../types/index.js';

	interface Props {
		item: CwToastItem;
		ondismiss: (id: string) => void;
		/** Accessible label for the dismiss button */
		dismissLabel?: string;
		class?: string;
	}

	let {
		item,
		ondismiss,
		dismissLabel = 'Dismiss notification',
		class: className = ''
	}: Props = $props();

	// Auto-dismiss timer that pauses while the toast is hovered or focused,
	// so people have time to read it or reach the dismiss button (WCAG 2.2.1).
	let hovered = $state(false);
	let focused = $state(false);
	const paused = $derived(hovered || focused);
	let remaining = -1;

	$effect(() => {
		if (item.duration <= 0) return;
		if (remaining < 0) remaining = item.duration;
		if (paused) return;

		const startedAt = Date.now();
		const timer = setTimeout(() => ondismiss(item.id), remaining);
		return () => {
			clearTimeout(timer);
			remaining = Math.max(0, remaining - (Date.now() - startedAt));
		};
	});
</script>

<div
	class={['cw-toast', `cw-toast--${item.tone}`, className]}
	role="group"
	aria-label={item.title ?? item.message}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	<span class="cw-toast__icon" aria-hidden="true">
		{#if item.tone === 'success'}
			<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
		{:else if item.tone === 'danger'}
			<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
		{:else if item.tone === 'warning'}
			<svg viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13.5h13L8 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6.5V9M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
		{:else}
			<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
		{/if}
	</span>

	<div class="cw-toast__body">
		{#if item.title}
			<p class="cw-toast__title">{item.title}</p>
		{/if}
		<p class="cw-toast__message">{item.message}</p>
	</div>

	{#if item.dismissible}
		<button
			type="button"
			class="cw-toast__close"
			onclick={() => ondismiss(item.id)}
			aria-label={dismissLabel}
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
	{/if}
</div>

<style>
	/*
	 * Neutral overlay surface + a tone accent bar and tone-coloured icon.
	 * Body text stays --cw-text-primary, which avoids tone-on-tone contrast
	 * problems in both themes.
	 */
	.cw-toast {
		--cw-toast-accent: var(--cw-tone-info-solid-bg);
		--cw-toast-icon: var(--cw-tone-info-text);

		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-2) var(--cw-space-3) var(--cw-space-4);
		border-radius: var(--cw-popover-radius);
		border: 1px solid var(--cw-popover-border);
		border-inline-start: 4px solid var(--cw-toast-accent);
		background-color: var(--cw-overlay-bg);
		color: var(--cw-text-primary);
		box-shadow: var(--cw-elevation-popover);
		font-family: var(--cw-font-family);
		animation: cw-toast-in var(--cw-duration-normal) var(--cw-ease-out);
	}

	/* ── Tones ───────────────────────────── */
	.cw-toast--primary {
		--cw-toast-accent: var(--cw-tone-primary-solid-bg);
		--cw-toast-icon: var(--cw-tone-primary-text);
	}
	.cw-toast--secondary {
		--cw-toast-accent: var(--cw-tone-secondary-solid-bg);
		--cw-toast-icon: var(--cw-tone-secondary-text);
	}
	.cw-toast--warning {
		--cw-toast-accent: var(--cw-tone-warning-solid-bg);
		--cw-toast-icon: var(--cw-tone-warning-text);
	}
	.cw-toast--danger {
		--cw-toast-accent: var(--cw-tone-danger-solid-bg);
		--cw-toast-icon: var(--cw-tone-danger-text);
	}
	.cw-toast--success {
		--cw-toast-accent: var(--cw-tone-success-solid-bg);
		--cw-toast-icon: var(--cw-tone-success-text);
	}

	.cw-toast__icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.125rem;
		color: var(--cw-toast-icon);
	}

	.cw-toast__icon svg {
		width: 100%;
		height: 100%;
	}

	.cw-toast__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		padding-top: 0.125rem;
	}

	.cw-toast__title {
		margin: 0;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		overflow-wrap: anywhere;
	}

	.cw-toast__message {
		margin: 0;
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-secondary);
		overflow-wrap: anywhere;
	}

	.cw-toast__close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-block: calc(-1 * var(--cw-space-2));
		border: none;
		background: none;
		color: var(--cw-text-muted);
		cursor: pointer;
		border-radius: var(--cw-radius-md);
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-toast__close:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-toast__close svg {
		width: 1rem;
		height: 1rem;
	}

	@keyframes cw-toast-in {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
