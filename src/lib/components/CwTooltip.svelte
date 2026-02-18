<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwTone } from '../types/index.js';

	type CwTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

	interface Props {
		/** Tooltip text content */
		value: string;
		/** Placement relative to trigger */
		position?: CwTooltipPosition;
		/** Colour tone */
		tone?: CwTone;
		/** Wrapped trigger content */
		children: Snippet;
	}

	let {
		value,
		position = 'top',
		tone = 'info',
		children
	}: Props = $props();

	let visible = $state(false);

	function show() {
		visible = true;
	}
	function hide() {
		visible = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	class="cw-tooltip"
	onpointerenter={show}
	onpointerleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}

	{#if visible}
		<span
			class="cw-tooltip__bubble cw-tooltip__bubble--{position} cw-tooltip__bubble--{tone}"
			role="tooltip"
		>
			{value}
			<span class="cw-tooltip__arrow"></span>
		</span>
	{/if}
</span>

<style>
	.cw-tooltip {
		position: relative;
		display: inline-flex;
	}

	/* ── Bubble ──────────────────────────── */
	.cw-tooltip__bubble {
		position: absolute;
		z-index: var(--cw-z-toast);
		padding: var(--cw-space-1) var(--cw-space-2);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
		white-space: nowrap;
		border-radius: var(--cw-radius-md);
		pointer-events: none;
		box-shadow: var(--cw-shadow-md);
		animation: cw-tooltip-in var(--cw-duration-fast) var(--cw-ease-out);
	}

	@keyframes cw-tooltip-in {
		from { opacity: 0; transform: scale(0.95); }
		to   { opacity: 1; transform: scale(1); }
	}

	/* ── Position ────────────────────────── */
	.cw-tooltip__bubble--top {
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
	}
	.cw-tooltip__bubble--bottom {
		top: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
	}
	.cw-tooltip__bubble--left {
		right: calc(100% + 6px);
		top: 50%;
		transform: translateY(-50%);
	}
	.cw-tooltip__bubble--right {
		left: calc(100% + 6px);
		top: 50%;
		transform: translateY(-50%);
	}

	/* ── Arrow ───────────────────────────── */
	.cw-tooltip__arrow {
		position: absolute;
		width: 6px;
		height: 6px;
		background: inherit;
		transform: rotate(45deg);
	}

	.cw-tooltip__bubble--top .cw-tooltip__arrow {
		bottom: -3px;
		left: 50%;
		margin-left: -3px;
	}
	.cw-tooltip__bubble--bottom .cw-tooltip__arrow {
		top: -3px;
		left: 50%;
		margin-left: -3px;
	}
	.cw-tooltip__bubble--left .cw-tooltip__arrow {
		right: -3px;
		top: 50%;
		margin-top: -3px;
	}
	.cw-tooltip__bubble--right .cw-tooltip__arrow {
		left: -3px;
		top: 50%;
		margin-top: -3px;
	}

	/* ── Tone colours ────────────────────── */
	.cw-tooltip__bubble--primary {
		background-color: var(--cw-tone-primary-solid-bg);
		color: var(--cw-tone-primary-solid-text);
	}
	.cw-tooltip__bubble--secondary {
		background-color: var(--cw-tone-secondary-solid-bg);
		color: var(--cw-tone-secondary-solid-text);
	}
	.cw-tooltip__bubble--info {
		background-color: var(--cw-tone-info-solid-bg);
		color: var(--cw-tone-info-solid-text);
	}
	.cw-tooltip__bubble--warning {
		background-color: var(--cw-tone-warning-solid-bg);
		color: var(--cw-tone-warning-solid-text);
	}
	.cw-tooltip__bubble--danger {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
	}
	.cw-tooltip__bubble--success {
		background-color: var(--cw-tone-success-solid-bg);
		color: var(--cw-tone-success-solid-text);
	}
</style>
