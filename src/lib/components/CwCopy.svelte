<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwSize } from '../types/index.js';

	interface Props {
		/** The text value to copy to the clipboard. */
		value: string;
		/** Optional size variant. */
		size?: CwSize;
		/** Duration in ms that the "copied" feedback is shown. Default 1500. */
		feedbackDuration?: number;
		/** Optional child content rendered before the copy button (e.g. display the value). */
		children?: Snippet;
		/** Callback fired after a successful copy. */
		onCopy?: (value: string) => void;
	}

	let {
		value,
		size = 'md',
		feedbackDuration = 1500,
		children,
		onCopy
	}: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			onCopy?.(value);
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), feedbackDuration);
		} catch {
			// Fallback for insecure contexts
			const ta = document.createElement('textarea');
			ta.value = value;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			copied = true;
			onCopy?.(value);
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), feedbackDuration);
		}
	}
</script>

<span class="cw-copy cw-copy--{size}" class:cw-copy--copied={copied}>
	{#if children}
		<span class="cw-copy__content">{@render children()}</span>
	{/if}

	<button
		type="button"
		class="cw-copy__button"
		aria-label={copied ? 'Copied' : 'Copy to clipboard'}
		onclick={handleCopy}
	>
		{#if copied}
			<!-- Checkmark icon -->
			<svg class="cw-copy__icon cw-copy__icon--check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		{:else}
			<!-- Clipboard icon -->
			<svg class="cw-copy__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<rect x="5" y="3" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
				<path d="M3 5v7a1 1 0 001 1h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
		{/if}
	</button>

	{#if copied}
		<span class="cw-copy__feedback" role="status">Copied!</span>
	{/if}
</span>

<style>
	.cw-copy {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		position: relative;
		font-family: var(--cw-font-family);
	}

	/* ── Content ─────────────────────────── */
	.cw-copy__content {
		color: var(--cw-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── Button ──────────────────────────── */
	.cw-copy__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-1);
		border: 1px solid transparent;
		border-radius: var(--cw-radius-sm);
		background: transparent;
		color: var(--cw-text-muted);
		cursor: pointer;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-copy__button:hover {
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-muted);
		border-color: var(--cw-border-default);
	}
	.cw-copy__button:active {
		background-color: var(--cw-bg-subtle);
	}

	.cw-copy--copied .cw-copy__button {
		color: var(--cw-success-500);
		background-color: color-mix(in srgb, var(--cw-success-500) 12%, transparent);
		border-color: color-mix(in srgb, var(--cw-success-500) 25%, transparent);
	}

	/* ── Icon ────────────────────────────── */
	.cw-copy__icon {
		display: block;
	}

	.cw-copy__icon--check {
		animation: cw-copy-pop 0.3s var(--cw-ease-default);
	}

	/* ── Sizes ───────────────────────────── */
	.cw-copy--sm .cw-copy__content { font-size: var(--cw-text-xs); }
	.cw-copy--sm .cw-copy__icon    { width: 0.875rem; height: 0.875rem; }
	.cw-copy--sm .cw-copy__button  { padding: 0.125rem; }

	.cw-copy--md .cw-copy__content { font-size: var(--cw-text-sm); }
	.cw-copy--md .cw-copy__icon    { width: 1rem; height: 1rem; }

	.cw-copy--lg .cw-copy__content { font-size: var(--cw-text-base); }
	.cw-copy--lg .cw-copy__icon    { width: 1.25rem; height: 1.25rem; }
	.cw-copy--lg .cw-copy__button  { padding: var(--cw-space-2); }

	/* ── Feedback tooltip ────────────────── */
	.cw-copy__feedback {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		padding: 0.125rem 0.5rem;
		border-radius: var(--cw-radius-sm);
		background-color: var(--cw-success-500);
		color: #fff;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		white-space: nowrap;
		pointer-events: none;
		animation: cw-copy-fade 0.25s var(--cw-ease-default);
	}

	.cw-copy__feedback::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: var(--cw-success-500);
	}

	/* ── Animations ──────────────────────── */
	@keyframes cw-copy-pop {
		0%   { transform: scale(0.5); opacity: 0; }
		60%  { transform: scale(1.2); }
		100% { transform: scale(1);   opacity: 1; }
	}

	@keyframes cw-copy-fade {
		0%   { opacity: 0; transform: translateX(-50%) translateY(4px); }
		100% { opacity: 1; transform: translateX(-50%) translateY(0); }
	}
</style>
