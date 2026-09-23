<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		/** Accessible name used when no visible `title` is provided. */
		ariaLabel?: string;
		/** Accessible label for the close button. */
		closeLabel?: string;
		/** Hide the close (×) button, e.g. for blocking confirmations. */
		hideClose?: boolean;
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
		ariaLabel,
		closeLabel = 'Close dialog',
		hideClose = false,
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

	const focusableSelector =
		'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	function getFocusableElements(): HTMLElement[] {
		if (!dialogRef) return [];
		return Array.from(dialogRef.querySelectorAll<HTMLElement>(focusableSelector)).filter(
			(el) => el.offsetParent !== null
		);
	}

	function close() {
		if (!open) return;
		open = false;
		onclose?.();
		previouslyFocused?.focus();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === dialogRef) {
			close();
		}
	}

	function handleCancel(e: Event) {
		// Always take over the browser's built-in Escape handling so component
		// state stays in sync (and so closeOnEscape={false} actually prevents closing).
		e.preventDefault();
		if (closeOnEscape) {
			close();
		}
	}

	function handleNativeClose() {
		// The dialog was closed natively outside the component's own close path
		// (e.g. a form method="dialog" submit). Sync component state. When the
		// close originated from close(), `open` is already false and this is a no-op,
		// so the consumer onclose callback does not double-fire.
		if (open) {
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
			const focusableElements = getFocusableElements();
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
			const firstFocusable = getFocusableElements()[0];
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
	class="cw-dialog"
	aria-labelledby={title ? `${uid}-title` : undefined}
	aria-label={title ? undefined : ariaLabel}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	oncancel={handleCancel}
	onclose={handleNativeClose}
>
	<div class={['cw-dialog__panel', className]}>
		{#if title || !hideClose}
			<div class={['cw-dialog__header', !title && 'cw-dialog__header--untitled']}>
				{#if title}
					<h2 class="cw-dialog__title" id="{uid}-title">{title}</h2>
				{/if}
				{#if !hideClose}
					<button type="button" class="cw-dialog__close" onclick={close} aria-label={closeLabel}>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M4 4l8 8M12 4l-8 8"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
		{/if}

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
	/* Lock page scroll while any CwDialog is open. */
	:global(html:has(dialog.cw-dialog[open])) {
		overflow: hidden;
	}

	.cw-dialog {
		position: fixed;
		inset: 0;
		margin: auto;
		border: none;
		padding: 0;
		background: transparent;
		/* Keep a gutter on phones so rounded corners never touch the screen edge. */
		width: calc(100% - 2 * var(--cw-space-4));
		max-width: 100vw;
		max-height: 85dvh;
		box-sizing: border-box;
		z-index: var(--cw-z-modal);
		opacity: 0;
		transform: translateY(0.5rem) scale(0.98);
		transition:
			opacity var(--cw-duration-fast) var(--cw-ease-in),
			transform var(--cw-duration-fast) var(--cw-ease-in),
			overlay var(--cw-duration-fast) allow-discrete,
			display var(--cw-duration-fast) allow-discrete;
	}

	.cw-dialog[open] {
		opacity: 1;
		transform: none;
		transition:
			opacity var(--cw-duration-normal) var(--cw-ease-out),
			transform var(--cw-duration-normal) var(--cw-ease-out),
			overlay var(--cw-duration-normal) allow-discrete,
			display var(--cw-duration-normal) allow-discrete;
	}

	@starting-style {
		.cw-dialog[open] {
			opacity: 0;
			transform: translateY(0.5rem) scale(0.98);
		}
	}

	.cw-dialog::backdrop {
		background: var(--cw-scrim);
		backdrop-filter: blur(4px);
		opacity: 0;
		transition:
			opacity var(--cw-duration-fast) var(--cw-ease-in),
			overlay var(--cw-duration-fast) allow-discrete,
			display var(--cw-duration-fast) allow-discrete;
	}

	.cw-dialog[open]::backdrop {
		opacity: 1;
		transition-duration: var(--cw-duration-normal);
	}

	@starting-style {
		.cw-dialog[open]::backdrop {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-dialog,
		.cw-dialog[open] {
			transform: none;
		}
	}

	.cw-dialog__panel {
		width: 100%;
		max-width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		background-color: var(--cw-overlay-bg);
		color: var(--cw-text-primary);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-modal-radius);
		box-shadow: var(--cw-elevation-modal);
		overflow: hidden;
		max-height: 85dvh;
		box-sizing: border-box;
	}

	@media (min-width: 768px) {
		.cw-dialog {
			width: 100%;
		}

		.cw-dialog__panel {
			width: min(var(--cw-dialog-width, 80vw), calc(100vw - 2rem));
			max-width: 100%;
		}
	}

	@media (min-width: 1024px) {
		.cw-dialog__panel {
			width: min(var(--cw-dialog-width, 50vw), calc(100vw - 2rem));
			max-width: 100%;
		}
	}

	.cw-dialog__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4) var(--cw-space-6);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-dialog__header--untitled {
		justify-content: flex-end;
		padding-block: var(--cw-space-2);
		padding-inline-end: var(--cw-space-3);
		border-bottom: none;
	}

	.cw-dialog__title {
		min-width: 0;
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		margin: 0;
		line-height: var(--cw-leading-tight);
		overflow-wrap: anywhere;
	}

	.cw-dialog__close {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-inline-end: calc(-1 * var(--cw-space-2));
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
		width: 1.125rem;
		height: 1.125rem;
	}

	.cw-dialog__body {
		padding: var(--cw-space-6);
		overflow-y: auto;
		flex: 1;
	}

	.cw-dialog__header--untitled + .cw-dialog__body {
		padding-top: 0;
	}

	@media (max-width: 639px) {
		.cw-dialog__header,
		.cw-dialog__body,
		.cw-dialog__actions {
			padding-inline: var(--cw-space-4);
		}
	}

	.cw-dialog__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4) var(--cw-space-6);
		border-top: 1px solid var(--cw-border-muted);
	}
</style>
