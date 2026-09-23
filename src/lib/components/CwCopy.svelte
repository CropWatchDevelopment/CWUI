<script lang="ts" module>
	/** Overridable user-facing labels for {@link CwCopy} (i18n). All fields optional; English defaults are used when omitted. */
	export interface CwCopyLabels {
		/** aria-label for the copy button in its default (not-yet-copied) state. Default "Copy to clipboard". */
		copy?: string;
		/** aria-label for the copy button while in the copied state. Default "Copied". */
		copied?: string;
		/** Transient feedback tooltip text shown after a successful copy. Default "Copied!". */
		copiedFeedback?: string;
		/** Feedback shown when the browser refuses clipboard access. Default "Copy failed". */
		failedFeedback?: string;
	}

	const DEFAULT_LABELS: Required<CwCopyLabels> = {
		copy: 'Copy to clipboard',
		copied: 'Copied',
		copiedFeedback: 'Copied!',
		failedFeedback: 'Copy failed'
	};
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
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
		/** Override display labels for i18n. */
		labels?: CwCopyLabels;
		class?: string;
	}

	let {
		value,
		size = 'md',
		feedbackDuration = 1500,
		children,
		onCopy,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	let result = $state<'idle' | 'copied' | 'failed'>('idle');
	const copied = $derived(result === 'copied');
	let timer: ReturnType<typeof setTimeout> | undefined;

	onDestroy(() => clearTimeout(timer));

	/** Fallback for insecure contexts / browsers without the async clipboard API. */
	function legacyCopy(text: string): boolean {
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {
			ok = false;
		}
		document.body.removeChild(ta);
		return ok;
	}

	async function handleCopy() {
		let ok: boolean;
		try {
			await navigator.clipboard.writeText(value);
			ok = true;
		} catch {
			ok = legacyCopy(value);
		}

		result = ok ? 'copied' : 'failed';
		if (ok) onCopy?.(value);
		clearTimeout(timer);
		timer = setTimeout(() => (result = 'idle'), feedbackDuration);
	}
</script>

<span
	class="cw-copy cw-copy--{size} {className}"
	class:cw-copy--copied={copied}
	class:cw-copy--failed={result === 'failed'}
>
	{#if children}
		<span class="cw-copy__content">{@render children()}</span>
	{/if}

	<button
		type="button"
		class="cw-copy__button"
		aria-label={copied ? l.copied : l.copy}
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

	{#if result !== 'idle'}
		<span class="cw-copy__feedback" aria-hidden="true">
			{copied ? l.copiedFeedback : l.failedFeedback}
		</span>
	{/if}
	<!-- Persistent live region: regions inserted together with their text are
	     often not announced. -->
	<span class="cw-copy__sr" role="status">
		{result === 'copied' ? l.copiedFeedback : result === 'failed' ? l.failedFeedback : ''}
	</span>
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
		min-width: var(--cw-hit-target-min);
		min-height: var(--cw-hit-target-min);
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
		color: var(--cw-tone-success-text);
		background-color: var(--cw-tone-success-bg-subtle);
		border-color: var(--cw-tone-success-border);
	}

	.cw-copy--failed .cw-copy__button {
		color: var(--cw-tone-danger-text);
		background-color: var(--cw-tone-danger-bg-subtle);
		border-color: var(--cw-tone-danger-border);
	}

	.cw-copy__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	/* ── Icon ────────────────────────────── */
	.cw-copy__icon {
		display: block;
	}

	.cw-copy__icon--check {
		animation: cw-copy-pop var(--cw-duration-slow) var(--cw-ease-default);
	}

	/* ── Sizes ───────────────────────────── */
	.cw-copy--sm .cw-copy__content { font-size: var(--cw-text-xs); }
	.cw-copy--sm .cw-copy__icon    { width: 0.875rem; height: 0.875rem; }
	.cw-copy--sm .cw-copy__button  { padding: var(--cw-space-1); }

	.cw-copy--md .cw-copy__content { font-size: var(--cw-text-sm); }
	.cw-copy--md .cw-copy__icon    { width: 1rem; height: 1rem; }

	.cw-copy--lg .cw-copy__content { font-size: var(--cw-text-base); }
	.cw-copy--lg .cw-copy__icon    { width: 1.25rem; height: 1.25rem; }
	.cw-copy--lg .cw-copy__button  { padding: var(--cw-space-2); }

	/* ── Feedback tooltip ────────────────── */
	.cw-copy__feedback {
		position: absolute;
		z-index: var(--cw-z-tooltip);
		bottom: calc(100% + var(--cw-space-2));
		left: 50%;
		transform: translateX(-50%);
		padding: var(--cw-space-1) var(--cw-space-2);
		border-radius: var(--cw-radius-md);
		background-color: var(--cw-tone-success-solid-bg);
		color: var(--cw-tone-success-solid-text);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		white-space: nowrap;
		pointer-events: none;
		animation: cw-copy-fade var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-copy--failed .cw-copy__feedback {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
	}

	.cw-copy--failed .cw-copy__feedback::after {
		border-top-color: var(--cw-tone-danger-solid-bg);
	}

	.cw-copy__feedback::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: var(--cw-tone-success-solid-bg);
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
