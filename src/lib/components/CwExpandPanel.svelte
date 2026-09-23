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

	const uid = $props.id();
</script>

<div class={['cw-expand', open && 'cw-expand--open', disabled && 'cw-expand--disabled', className]}>
	<button
		type="button"
		class="cw-expand__header"
		id="{uid}-header"
		aria-expanded={open}
		aria-controls="{uid}-body"
		{disabled}
		onclick={toggle}
	>
		<span class="cw-expand__header-content">
			{#if header}
				{@render header(open)}
			{:else}
				<span class="cw-expand__title">{title}</span>
			{/if}
		</span>

		<svg class="cw-expand__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	<div
		class="cw-expand__body-wrapper"
		id="{uid}-body"
		role="region"
		aria-labelledby="{uid}-header"
		inert={!open}
	>
		<div class="cw-expand__body">
			<div class="cw-expand__body-inner">
				{@render children?.()}
			</div>
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
		width: 100%;
		border: none;
		font: inherit;
		color: inherit;
		text-align: start;
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
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: calc(-1 * var(--cw-focus-ring-width));
		border-radius: var(--cw-radius-md);
	}

	.cw-expand--disabled .cw-expand__header {
		cursor: not-allowed;
		opacity: var(--cw-opacity-disabled);
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

	/* Padding lives on an inner wrapper so it animates with the height
	   instead of snapping when the panel toggles. */
	.cw-expand__body-inner {
		padding: 0 var(--cw-space-4) var(--cw-space-4);
	}
</style>
