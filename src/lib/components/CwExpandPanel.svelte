<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Panel heading text. Ignored if the `header` snippet is provided. */
		title?: string;
		/** Whether the panel is expanded. Bindable. */
		open?: boolean;
		/** Disable interaction. */
		disabled?: boolean;
		/** Custom header snippet — receives the current `open` state. */
		header?: Snippet<[boolean]>;
		/** Panel body content. */
		children?: Snippet;
		/** Fired when the panel is toggled. */
		onToggle?: (open: boolean) => void;
		class?: string;
	}

	let {
		title = '',
		open = $bindable(false),
		disabled = false,
		header,
		children,
		onToggle,
		class: className = ''
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		open = !open;
		onToggle?.(open);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div class="cw-expand {className}" class:cw-expand--open={open} class:cw-expand--disabled={disabled}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="cw-expand__header"
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-expanded={open}
		aria-disabled={disabled}
		onclick={toggle}
		onkeydown={onKeydown}
	>
		<span class="cw-expand__header-content">
			{#if header}
				{@render header(open)}
			{:else}
				<span class="cw-expand__title">{title}</span>
			{/if}
		</span>

		<svg class="cw-expand__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</div>

	<div class="cw-expand__body-wrapper" aria-hidden={!open}>
		<div class="cw-expand__body">
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.cw-expand {
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		background-color: var(--cw-bg-elevated);
		overflow: hidden;
		font-family: var(--cw-font-family);
	}

	/* ── Header ──────────────────────── */
	.cw-expand__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		cursor: pointer;
		user-select: none;
		background: transparent;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-expand__header:hover {
		background-color: var(--cw-bg-muted);
	}

	.cw-expand__header:focus-visible {
		outline: 2px solid var(--cw-accent);
		outline-offset: -2px;
		border-radius: var(--cw-radius-md);
	}

	.cw-expand--disabled .cw-expand__header {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.cw-expand--disabled .cw-expand__header:hover {
		background-color: transparent;
	}

	.cw-expand__header-content {
		flex: 1;
		min-width: 0;
	}

	.cw-expand__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	/* ── Chevron ─────────────────────── */
	.cw-expand__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-text-muted);
		transition: transform var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-expand--open .cw-expand__chevron {
		transform: rotate(180deg);
	}

	/* ── Body (animated collapse) ───── */
	.cw-expand__body-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-expand--open .cw-expand__body-wrapper {
		grid-template-rows: 1fr;
	}

	.cw-expand__body {
		overflow: hidden;
	}

	.cw-expand--open .cw-expand__body {
		padding: 0 var(--cw-space-4) var(--cw-space-4);
	}
</style>
