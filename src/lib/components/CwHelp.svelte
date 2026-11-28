<script lang="ts" module>
	/** Overridable text of {@link CwHelp} (i18n). English is used for what is left out. */
	export interface CwHelpLabels {
		/** Starts the link's accessible name. Default "Help". */
		help?: string;
		/** Ends the link's accessible name: the link leaves the page. Default "opens in a new tab". */
		newTab?: string;
	}

	const DEFAULT_LABELS: Required<CwHelpLabels> = {
		help: 'Help',
		newTab: 'opens in a new tab'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwSize } from '../types/index.js';
	import CwTooltip from './CwTooltip.svelte';

	interface Props {
		/**
		 * The page that explains it. Give the full address, with its `#section`
		 * when the answer is one part of an article: the browser opens the page
		 * and scrolls there.
		 */
		href: string;
		/** What the page explains, in a few words ("Why a reset is needed"). Shown as the tooltip and read to screen readers. */
		label: string;
		/**
		 * The thing being explained (a label, a title, a word). The mark sits
		 * raised at its top right, like a footnote number. Without it the mark is
		 * raised on its own, to follow any text.
		 */
		children?: Snippet;
		size?: CwSize;
		/** Where the tooltip opens. */
		tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
		/** Override built-in English strings. */
		labels?: CwHelpLabels;
		class?: string;
	}

	let {
		href,
		label,
		children,
		size = 'md',
		tooltipPosition = 'top',
		labels = {},
		class: className = ''
	}: Props = $props();

	const text = $derived({ ...DEFAULT_LABELS, ...labels });
</script>

<span class="cw-help cw-help--{size} {className}" class:cw-help--alone={!children}>
	{@render children?.()}
	<CwTooltip value={label} position={tooltipPosition} class="cw-help__tooltip">
		<!-- A new tab, so a half-filled form behind it is not lost. -->
		<a
			class="cw-help__mark"
			{href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="{text.help}: {label} ({text.newTab})"
		>
			<span aria-hidden="true">?</span>
		</a>
	</CwTooltip>
</span>

<style>
	.cw-help {
		--_size: 0.875rem;
		display: inline-flex;
		align-items: flex-start;
		gap: 0.1875rem;
		max-width: 100%;
	}

	/* On its own it follows text, raised like the <sup> it stands for. */
	.cw-help--alone {
		vertical-align: super;
		margin-inline-start: 0.125rem;
		line-height: 0;
	}

	.cw-help--sm {
		--_size: 0.75rem;
	}

	.cw-help--lg {
		--_size: 1rem;
	}

	.cw-help :global(.cw-help__tooltip) {
		display: inline-flex;
		flex-shrink: 0;
		/* Raised above the top of what it explains. */
		margin-top: -0.1875rem;
	}

	.cw-help--alone :global(.cw-help__tooltip) {
		margin-top: 0;
	}

	.cw-help__mark {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: var(--_size);
		height: var(--_size);
		font-family: var(--cw-font-family);
		font-size: calc(var(--_size) * 0.64);
		font-weight: var(--cw-font-bold);
		line-height: 1;
		color: var(--cw-text-secondary);
		text-decoration: none;
		background-color: transparent;
		border: max(1px, calc(var(--_size) * 0.09)) solid var(--cw-text-muted);
		border-radius: var(--cw-radius-full);
		cursor: pointer;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	/* The mark is small; the area that takes a tap is not. */
	.cw-help__mark::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 2rem;
		height: 2rem;
		transform: translate(-50%, -50%);
	}

	.cw-help__mark:hover {
		color: var(--cw-accent-text);
		background-color: var(--cw-accent-bg);
		border-color: var(--cw-accent);
	}

	.cw-help__mark:focus-visible {
		outline: 2px solid var(--cw-focus-ring-color);
		outline-offset: 2px;
	}
</style>
