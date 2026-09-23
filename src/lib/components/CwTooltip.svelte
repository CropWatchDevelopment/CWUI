<script lang="ts" module>
	export type CwTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwTone } from '../types/index.js';

	interface Props {
		/** Tooltip text content */
		value: string;
		/** Placement relative to trigger */
		position?: CwTooltipPosition;
		/** Colour tone */
		tone?: CwTone;
		/** Wrapped trigger content */
		children: Snippet;
		class?: string;
	}

	let {
		value,
		position = 'top',
		tone = 'info',
		children,
		class: className = ''
	}: Props = $props();

	const bubbleId = $props.id();
	const FOCUSABLE =
		'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

	let wrapper = $state<HTMLSpanElement>();
	let visible = $state(false);

	function show() {
		visible = true;
	}
	function hide() {
		visible = false;
	}

	/* Link the trigger to the bubble so screen readers announce the tooltip text
	   as its description (WCAG 1.3.1 / 4.1.2). */
	// bind:this + $effect rather than {@attach}: the peer range is svelte ^5.0.0
	// and attachments need 5.29+.
	$effect(() => {
		const trigger = wrapper?.querySelector<HTMLElement>(FOCUSABLE);
		if (!trigger) return;
		const existing = trigger.getAttribute('aria-describedby') ?? '';
		const ids = existing.split(/\s+/).filter(Boolean);
		if (ids.includes(bubbleId)) return;
		trigger.setAttribute('aria-describedby', [...ids, bubbleId].join(' '));
		return () => {
			const current = (trigger.getAttribute('aria-describedby') ?? '')
				.split(/\s+/)
				.filter((id) => id && id !== bubbleId);
			if (current.length) trigger.setAttribute('aria-describedby', current.join(' '));
			else trigger.removeAttribute('aria-describedby');
		};
	});

	/* WCAG 1.4.13: the tooltip can be dismissed without moving pointer or focus. */
	function handleWindowKeydown(event: KeyboardEvent) {
		if (visible && event.key === 'Escape') hide();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	bind:this={wrapper}
	class="cw-tooltip {className}"
	onpointerenter={show}
	onpointerleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}

	<!-- Always in the DOM so aria-describedby resolves; only shown while visible. -->
	<span
		id={bubbleId}
		class="cw-tooltip__bubble cw-tooltip__bubble--{position} cw-tooltip__bubble--{tone}"
		class:cw-tooltip__bubble--visible={visible}
		role="tooltip"
	>
		{value}
		<span class="cw-tooltip__arrow" aria-hidden="true"></span>
	</span>
</span>

<style>
	.cw-tooltip {
		position: relative;
		display: inline-flex;
	}

	/* ── Bubble ──────────────────────────── */
	.cw-tooltip__bubble {
		--cw-tooltip-offset: var(--cw-space-2);
		--cw-tooltip-arrow: var(--cw-space-2);
		position: absolute;
		z-index: var(--cw-z-tooltip);
		padding: var(--cw-space-1) var(--cw-space-2);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
		white-space: nowrap;
		border-radius: var(--cw-radius-md);
		box-shadow: var(--cw-elevation-popover);
		display: none;
	}

	.cw-tooltip__bubble--visible {
		display: block;
		/* Animate the individual `scale` property so the positioning
		   `translate` below is never overwritten. */
		animation: cw-tooltip-in var(--cw-duration-fast) var(--cw-ease-out);
	}

	/* Invisible bridge across the offset gap so the pointer can move onto the
	   bubble without it closing (WCAG 1.4.13 hoverable). */
	.cw-tooltip__bubble::before {
		content: '';
		position: absolute;
		inset: calc(var(--cw-tooltip-offset) * -1);
		z-index: -1;
	}

	@keyframes cw-tooltip-in {
		from {
			opacity: 0;
			scale: 0.95;
		}
		to {
			opacity: 1;
			scale: 1;
		}
	}

	/* ── Position ────────────────────────── */
	.cw-tooltip__bubble--top {
		bottom: calc(100% + var(--cw-tooltip-offset));
		left: 50%;
		translate: -50% 0;
	}
	.cw-tooltip__bubble--bottom {
		top: calc(100% + var(--cw-tooltip-offset));
		left: 50%;
		translate: -50% 0;
	}
	.cw-tooltip__bubble--left {
		right: calc(100% + var(--cw-tooltip-offset));
		top: 50%;
		translate: 0 -50%;
	}
	.cw-tooltip__bubble--right {
		left: calc(100% + var(--cw-tooltip-offset));
		top: 50%;
		translate: 0 -50%;
	}

	/* ── Arrow ───────────────────────────── */
	.cw-tooltip__arrow {
		position: absolute;
		width: var(--cw-tooltip-arrow);
		height: var(--cw-tooltip-arrow);
		background: inherit;
		transform: rotate(45deg);
	}

	.cw-tooltip__bubble--top .cw-tooltip__arrow {
		bottom: calc(var(--cw-tooltip-arrow) / -2);
		left: 50%;
		margin-left: calc(var(--cw-tooltip-arrow) / -2);
	}
	.cw-tooltip__bubble--bottom .cw-tooltip__arrow {
		top: calc(var(--cw-tooltip-arrow) / -2);
		left: 50%;
		margin-left: calc(var(--cw-tooltip-arrow) / -2);
	}
	.cw-tooltip__bubble--left .cw-tooltip__arrow {
		right: calc(var(--cw-tooltip-arrow) / -2);
		top: 50%;
		margin-top: calc(var(--cw-tooltip-arrow) / -2);
	}
	.cw-tooltip__bubble--right .cw-tooltip__arrow {
		left: calc(var(--cw-tooltip-arrow) / -2);
		top: 50%;
		margin-top: calc(var(--cw-tooltip-arrow) / -2);
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
