<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwButtonVariant, CwSize } from '../types/index.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: CwButtonVariant;
		size?: CwSize;
		loading?: boolean;
		disabled?: boolean;
		fullWidth?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		fullWidth = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
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
			<svg viewBox="0 0 24 24" fill="none" class="cw-spin">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
				<path
					d="M12 2a10 10 0 0 1 10 10"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
				/>
			</svg>
		</span>
	{/if}
	<span class="cw-button__label" class:cw-button__label--hidden={loading}>
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
		background: linear-gradient(
			180deg,
			color-mix(in srgb, #1f293e 86%, #3a4f73) 0%,
			#1f293e 100%
		);
		color: #f2f6ff;
		border-color: #40567a;
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, #ffffff 9%, transparent),
			0 5px 14px color-mix(in srgb, #050a16 42%, transparent);
	}
	.cw-button--primary:hover:not(:disabled) {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, #2f4568 72%, #496695) 0%,
			#2a3f60 100%
		);
		border-color: #5b78a8;
		color: #ffffff;
	}
	.cw-button--primary:active:not(:disabled) {
		background: linear-gradient(180deg, #2a3f60 0%, #233550 100%);
		border-color: #53709e;
	}

	.cw-button--secondary {
		background: linear-gradient(180deg, #314a72 0%, #2c4265 100%);
		color: #f4f8ff;
		border-color: #6282b8;
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, #ffffff 12%, transparent),
			0 5px 14px color-mix(in srgb, #050a16 44%, transparent);
	}
	.cw-button--secondary:hover:not(:disabled) {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, #3e5f92 78%, #5479ad) 0%,
			#35537f 100%
		);
		border-color: #7fa2dc;
		color: #ffffff;
	}
	.cw-button--secondary:active:not(:disabled) {
		background: linear-gradient(180deg, #2e486e 0%, #273d5c 100%);
		border-color: #5775a4;
	}

	.cw-button--ghost {
		background-color: transparent;
		color: var(--cw-text-primary);
		border-color: transparent;
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

	.cw-button--full {
		width: 100%;
	}

	/* ── Loading ─────────────────────────── */
	.cw-button__spinner {
		display: inline-flex;
		width: 1em;
		height: 1em;
	}

	.cw-button__label {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
	}

	.cw-button__label--hidden {
		visibility: hidden;
		width: 0;
		overflow: hidden;
	}

	.cw-button--loading {
		pointer-events: none;
	}

	@keyframes cw-spin {
		to {
			transform: rotate(360deg);
		}
	}

	:global(.cw-spin) {
		animation: cw-spin 0.75s linear infinite;
	}
</style>
