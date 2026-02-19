<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		closeOnBackdrop?: boolean;
		closeOnEscape?: boolean;
		children?: Snippet;
		actions?: Snippet;
		onclose?: () => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		closeOnBackdrop = true,
		closeOnEscape = true,
		children,
		actions,
		onclose,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let dialogRef = $state<HTMLDialogElement | null>(null);
	let previouslyFocused: HTMLElement | null = null;

	function close() {
		open = false;
		onclose?.();
		previouslyFocused?.focus();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === dialogRef) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (closeOnEscape && e.key === 'Escape') {
			e.preventDefault();
			close();
		}

		// Focus trap
		if (e.key === 'Tab' && dialogRef) {
			const focusableElements = dialogRef.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusableElements[0];
			const last = focusableElements[focusableElements.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last?.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first?.focus();
				}
			}
		}
	}

	$effect(() => {
		if (open && dialogRef) {
			previouslyFocused = document.activeElement as HTMLElement;
			dialogRef.showModal();

			// Auto-focus first focusable or the dialog itself
			const firstFocusable = dialogRef.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (firstFocusable) {
				firstFocusable.focus();
			}
		} else if (!open && dialogRef?.open) {
			dialogRef.close();
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogRef}
	class="cw-dialog {className}"
	aria-labelledby={title ? `${uid}-title` : undefined}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
>
	<div class="cw-dialog__panel">
		<div class="cw-dialog__header">
			{#if title}
				<h2 class="cw-dialog__title" id="{uid}-title">{title}</h2>
			{/if}
			<button type="button" class="cw-dialog__close" onclick={close} aria-label="Close dialog">
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		{#if children}
			<div class="cw-dialog__body">
				{@render children()}
			</div>
		{/if}

		{#if actions}
			<div class="cw-dialog__actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</dialog>

<style>
	.cw-dialog {
		position: fixed;
		inset: 0;
		margin: auto;
		border: none;
		padding: 0;
		background: transparent;
		max-width: min(90vw, 32rem);
		width: 100%;
		max-height: 85dvh;
		z-index: var(--cw-z-modal);
	}

	.cw-dialog::backdrop {
		background: rgb(0 0 0 / 0.6);
		backdrop-filter: blur(2px);
	}

	.cw-dialog__panel {
		display: flex;
		flex-direction: column;
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		box-shadow: var(--cw-shadow-xl);
		overflow: hidden;
		max-height: 85dvh;
	}

	.cw-dialog__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-4) var(--cw-space-6);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-dialog__title {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		margin: 0;
		line-height: var(--cw-leading-tight);
	}

	.cw-dialog__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: none;
		color: var(--cw-text-muted);
		cursor: pointer;
		border-radius: var(--cw-radius-md);
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dialog__close:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-dialog__close svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-dialog__body {
		padding: var(--cw-space-6);
		overflow-y: auto;
		flex: 1;
	}

	.cw-dialog__actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4) var(--cw-space-6);
		border-top: 1px solid var(--cw-border-muted);
	}
</style>
