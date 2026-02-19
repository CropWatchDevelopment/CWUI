<script lang="ts">
	import type { CwToastItem } from '../types/index.js';

	interface Props {
		item: CwToastItem;
		ondismiss: (id: string) => void;
		class?: string;
	}

	let { item, ondismiss, class: className = '' }: Props = $props();

	// Auto-dismiss timer
	$effect(() => {
		if (item.duration <= 0) return;
		const timer = setTimeout(() => {
			ondismiss(item.id);
		}, item.duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="cw-toast cw-toast--{item.tone} {className}"
	role="alert"
	aria-live="assertive"
	aria-atomic="true"
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

	<p class="cw-toast__message">{item.message}</p>

	{#if item.dismissible}
		<button
			type="button"
			class="cw-toast__close"
			onclick={() => ondismiss(item.id)}
			aria-label="Dismiss notification"
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.cw-toast {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		border-radius: var(--cw-radius-lg);
		border: 1px solid;
		box-shadow: var(--cw-shadow-lg);
		min-width: 18rem;
		max-width: 28rem;
		animation: cw-toast-in var(--cw-duration-slow) var(--cw-ease-out);
	}

	/* ── Tones ───────────────────────────── */
	.cw-toast--primary {
		background-color: var(--cw-tone-primary-bg);
		border-color: var(--cw-tone-primary-border);
		color: var(--cw-tone-primary-text);
	}
	.cw-toast--secondary {
		background-color: var(--cw-tone-secondary-bg);
		border-color: var(--cw-tone-secondary-border);
		color: var(--cw-tone-secondary-text);
	}
	.cw-toast--info {
		background-color: var(--cw-tone-info-bg);
		border-color: var(--cw-tone-info-border);
		color: var(--cw-tone-info-text);
	}
	.cw-toast--warning {
		background-color: var(--cw-tone-warning-bg);
		border-color: var(--cw-tone-warning-border);
		color: var(--cw-tone-warning-text);
	}
	.cw-toast--danger {
		background-color: var(--cw-tone-danger-bg);
		border-color: var(--cw-tone-danger-border);
		color: var(--cw-tone-danger-text);
	}
	.cw-toast--success {
		background-color: var(--cw-tone-success-bg);
		border-color: var(--cw-tone-success-border);
		color: var(--cw-tone-success-text);
	}

	.cw-toast__icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.125rem;
	}

	.cw-toast__icon svg {
		width: 100%;
		height: 100%;
	}

	.cw-toast__message {
		flex: 1;
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
		margin: 0;
	}

	.cw-toast__close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		background: none;
		color: currentColor;
		cursor: pointer;
		border-radius: var(--cw-radius-sm);
		opacity: 0.6;
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-toast__close:hover {
		opacity: 1;
	}

	.cw-toast__close svg {
		width: 0.875rem;
		height: 0.875rem;
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
