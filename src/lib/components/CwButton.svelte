<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwButtonVariant, CwSize } from '../types/index.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CwSpinner from './CwSpinner.svelte';

	type CwButtonIcon = string | { src: string } | { default: string } | Snippet;

	interface Props extends HTMLButtonAttributes {
		variant?: CwButtonVariant;
		size?: CwSize;
		loading?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		icon?: CwButtonIcon;
		children?: Snippet;
		class?: string;
	}

	function hasDefaultIconExport(value: unknown): value is { default: string } {
		return !!value && typeof value === 'object' && 'default' in value && typeof value.default === 'string';
	}

	function resolveIconSource(icon: CwButtonIcon | undefined) {
		if (!icon || typeof icon === 'function') return undefined;
		if (typeof icon === 'string') return icon;
		if ('src' in icon && typeof icon.src === 'string') return icon.src;
		if (hasDefaultIconExport(icon)) return icon.default;
		return undefined;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		fullWidth = false,
		icon,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
	const spinnerSize = $derived(size);
	const iconSource = $derived(resolveIconSource(icon));
	const iconSnippet = $derived(typeof icon === 'function' ? icon : undefined);
</script>

<button
	class="cw-button cw-button--{variant} cw-button--{size} {className}"
	class:cw-button--full={fullWidth}
	class:cw-button--loading={loading}
	disabled={isDisabled}
	aria-busy={loading}
	{...rest}
>
	{#if loading}
		<span class="cw-button__spinner" aria-hidden="true">
			<CwSpinner size={spinnerSize} />
		</span>
	{/if}
	<span class="cw-button__content" class:cw-button__content--hidden={loading}>
		{#if iconSource || iconSnippet}
			<span class="cw-button__icon" aria-hidden="true">
				{#if iconSource}
					<img src={iconSource} alt="" />
				{:else if iconSnippet}
					{@render iconSnippet()}
				{/if}
			</span>
		{/if}
		{@render children?.()}
	</span>
</button>

<style>
	.cw-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		border: 1px solid transparent;
		border-radius: var(--cw-radius-xl);
		font-family: var(--cw-font-family);
		font-weight: var(--cw-font-medium);
		line-height: 1;
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
		position: relative;
		white-space: nowrap;
		user-select: none;
	}

	/* ── Sizes ───────────────────────────── */
	.cw-button--sm {
		padding: var(--cw-space-1) var(--cw-space-3);
		font-size: var(--cw-text-xs);
		min-height: 1.75rem;
	}
	.cw-button--md {
		padding: var(--cw-space-2) var(--cw-space-4);
		font-size: var(--cw-text-sm);
		min-height: 2.25rem;
	}
	.cw-button--lg {
		padding: var(--cw-space-3) var(--cw-space-6);
		font-size: var(--cw-text-base);
		min-height: 2.75rem;
	}

	/* ── Variants ────────────────────────── */
	.cw-button--primary {
		background: var(--cw-button-primary-bg);
		color: var(--cw-button-primary-text);
		border-color: var(--cw-button-primary-border);
		box-shadow: var(--cw-button-primary-shadow);
		--cw-button-focus-base-shadow: var(--cw-button-primary-shadow);
	}
	.cw-button--primary:hover:not(:disabled) {
		background: var(--cw-button-primary-bg-hover);
		border-color: var(--cw-button-primary-border-hover);
		color: var(--cw-button-primary-text-hover);
	}
	.cw-button--primary:active:not(:disabled) {
		background: var(--cw-button-primary-bg-active);
		border-color: var(--cw-button-primary-border-active);
	}

	.cw-button--secondary {
		background: var(--cw-button-secondary-bg);
		color: var(--cw-button-secondary-text);
		border-color: var(--cw-button-secondary-border);
		box-shadow: var(--cw-button-secondary-shadow);
		--cw-button-focus-base-shadow: var(--cw-button-secondary-shadow);
	}
	.cw-button--secondary:hover:not(:disabled) {
		background: var(--cw-button-secondary-bg-hover);
		border-color: var(--cw-button-secondary-border-hover);
		color: var(--cw-button-secondary-text-hover);
	}
	.cw-button--secondary:active:not(:disabled) {
		background: var(--cw-button-secondary-bg-active);
		border-color: var(--cw-button-secondary-border-active);
	}

	.cw-button--ghost {
		background-color: transparent;
		color: var(--cw-text-primary);
		border-color: transparent;
		--cw-button-focus-base-shadow: none;
	}
	.cw-button--ghost:hover:not(:disabled) {
		background-color: var(--cw-bg-muted);
	}
	.cw-button--ghost:active:not(:disabled) {
		background-color: var(--cw-bg-subtle);
	}

	.cw-button--danger {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
		border-color: var(--cw-tone-danger-solid-bg);
		--cw-button-focus-base-shadow: none;
	}
	.cw-button--danger:hover:not(:disabled) {
		background-color: var(--cw-danger-700);
		border-color: var(--cw-danger-700);
	}
	.cw-button--danger:active:not(:disabled) {
		background-color: var(--cw-danger-800);
	}

	.cw-button--info {
		background-color: var(--cw-tone-info-solid-bg);
		color: var(--cw-tone-info-solid-text);
		border-color: var(--cw-tone-info-solid-bg);
		--cw-button-focus-base-shadow: none;
	}
	.cw-button--info:hover:not(:disabled) {
		background-color: var(--cw-info-700);
		border-color: var(--cw-info-700);
	}
	.cw-button--info:active:not(:disabled) {
		background-color: var(--cw-info-800);
	}

	/* ── States ──────────────────────────── */
	.cw-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cw-button:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 var(--cw-focus-ring-width)
				color-mix(in srgb, var(--cw-focus-ring-color) 34%, transparent),
			0 0 0 calc(var(--cw-focus-ring-width) + 2px) var(--cw-bg-surface),
			var(--cw-button-focus-base-shadow, none);
	}

	.cw-button--full {
		width: 100%;
	}

	/* ── Loading ─────────────────────────── */
	.cw-button__spinner {
		display: inline-flex;
		width: 1em;
		height: 1em;
	}

	.cw-button__content {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-button__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		flex-shrink: 0;
	}

	.cw-button__content--hidden {
		visibility: hidden;
		width: 0;
		overflow: hidden;
	}

	.cw-button__content :global(img),
	.cw-button__content :global(svg) {
		display: block;
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		object-fit: contain;
	}

	.cw-button--loading {
		pointer-events: none;
	}

</style>
