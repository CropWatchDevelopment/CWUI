<!--
	@component
	Colored Arrow Timeline: a row of thick chevron arrows, one per step, with
	the step's date above (joined to the arrow by a thin leader line) and its
	title and description below. Each step gets its own colour from the shared
	categorical chart palette; text is mixed toward the theme's text colour so
	it stays readable in light and dark themes.

	All text, dates included, comes from the caller already formatted and
	translated.

	Pass `onItemClick` to make every step a button; it receives the step, its
	position and the click event.

	```svelte
	<CwColoredArrowTimeline
		ariaLabel="Growing season"
		items={[
			{ date: 'Apr 2026', datetime: '2026-04', title: 'Seeding', description: 'Sow trays in the nursery.' },
			{ date: 'May 2026', datetime: '2026-05', title: 'Transplant' },
			{ date: 'Sep 2026', datetime: '2026-09', title: 'Harvest', muted: true }
		]}
		onItemClick={(item, index) => openStep(index)}
	/>
	```
-->
<script lang="ts">
	import {
		CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH,
		cwColoredArrowTimelineColor,
		resolveCwColoredArrowTimelineOrientation,
		type CwColoredArrowTimelineItem,
		type CwColoredArrowTimelineOrientation
	} from './cwColoredArrowTimeline.js';

	interface Props {
		/** The steps, left to right (top to bottom when vertical). */
		items?: readonly CwColoredArrowTimelineItem[] | null;
		/**
		 * `horizontal` draws arrows pointing right, `vertical` draws them pointing
		 * down with the text beside them, `auto` picks vertical when the columns
		 * would be narrower than `minItemWidth`. Default: `auto`
		 */
		orientation?: CwColoredArrowTimelineOrientation;
		/** Narrowest column (px) an `auto` timeline keeps before turning vertical. Default: 160 */
		minItemWidth?: number;
		/** Accessible name for the list, already translated (e.g. "Growing season"). */
		ariaLabel?: string;
		/**
		 * Makes every step a button. Called with the clicked step, its position
		 * and the click event (keyboard presses arrive as clicks too).
		 */
		onItemClick?: (item: CwColoredArrowTimelineItem, index: number, event: MouseEvent) => void;
		class?: string;
	}

	let {
		items = [],
		orientation = 'auto',
		minItemWidth = CW_COLORED_ARROW_TIMELINE_MIN_ITEM_WIDTH,
		ariaLabel,
		onItemClick,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let width = $state(0);

	const steps = $derived(items ?? []);
	const clickable = $derived(typeof onItemClick === 'function');
	const layout = $derived(
		resolveCwColoredArrowTimelineOrientation(orientation, width, steps.length, minItemWidth)
	);
</script>

{#snippet stepContent(item: CwColoredArrowTimelineItem, i: number)}
	<span class="cw-colored-arrow-timeline__when">
		{#if item.datetime}
			<time id="{uid}-{i}-date" class="cw-colored-arrow-timeline__date" datetime={item.datetime}
				>{item.date}</time
			>
		{:else}
			<span id="{uid}-{i}-date" class="cw-colored-arrow-timeline__date">{item.date}</span>
		{/if}
		<span class="cw-colored-arrow-timeline__leader" aria-hidden="true">
			<svg viewBox="0 0 10 10" preserveAspectRatio="none" focusable="false">
				<line x1="0" y1="0" x2="10" y2="10" vector-effect="non-scaling-stroke" />
			</svg>
		</span>
	</span>
	<span class="cw-colored-arrow-timeline__arrow" aria-hidden="true"></span>
	<span id="{uid}-{i}-title" class="cw-colored-arrow-timeline__title">{item.title}</span>
	{#if item.description}
		<span id="{uid}-{i}-desc" class="cw-colored-arrow-timeline__description">{item.description}</span>
	{/if}
{/snippet}

<div
	class="cw-colored-arrow-timeline cw-colored-arrow-timeline--{layout} {className}"
	class:cw-colored-arrow-timeline--clickable={clickable}
	style:--cw-colored-arrow-timeline-count={steps.length}
	bind:clientWidth={width}
>
	{#if steps.length > 0}
		<ol class="cw-colored-arrow-timeline__list" aria-label={ariaLabel}>
			{#each steps as item, i (item.id ?? i)}
				<li
					class="cw-colored-arrow-timeline__item"
					class:cw-colored-arrow-timeline__item--muted={item.muted}
					style:--cw-colored-arrow-timeline-item-color={cwColoredArrowTimelineColor(item, i)}
					style:--cw-colored-arrow-timeline-layer={steps.length - i}
				>
					{#if clickable}
						<!-- Named by date + title; the description is read as extra detail. -->
						<button
							type="button"
							class="cw-colored-arrow-timeline__step"
							aria-labelledby="{uid}-{i}-date {uid}-{i}-title"
							aria-describedby={item.description ? `${uid}-${i}-desc` : undefined}
							onclick={(event) => onItemClick?.(item, i, event)}
						>
							{@render stepContent(item, i)}
						</button>
					{:else}
						<div class="cw-colored-arrow-timeline__step">
							{@render stepContent(item, i)}
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.cw-colored-arrow-timeline {
		/* Public knobs (set them on the component or any ancestor). */
		--_band: var(--cw-colored-arrow-timeline-band, 2.5rem);
		--_tip: var(--cw-colored-arrow-timeline-tip, 1.25rem);
		--_gap: var(--cw-colored-arrow-timeline-gap, 4px);
		--_leader: var(--cw-colored-arrow-timeline-leader, 2.5rem);
		/* How much of the step colour stays in its text; the rest is the theme
		   text colour. 55% keeps the default palette at 4.5:1 or better on
		   every CWUI background in both themes. */
		--_text-mix: var(--cw-colored-arrow-timeline-text-mix, 55%);
		--_muted: var(--cw-colored-arrow-timeline-muted, var(--cw-gray-400));

		min-width: 0;
		font-family: var(--cw-font-family);
	}

	.cw-colored-arrow-timeline__list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cw-colored-arrow-timeline__item {
		--_fill: var(--cw-colored-arrow-timeline-item-color);
		--_shade: color-mix(in oklab, var(--_fill) 72%, #000);
		--_ink: color-mix(in oklab, var(--_fill) var(--_text-mix), var(--cw-text-primary));

		min-width: 0;
		color: var(--_ink);
	}

	.cw-colored-arrow-timeline__item--muted {
		--_fill: var(--_muted);
	}

	.cw-colored-arrow-timeline__step {
		min-width: 0;
	}

	/* ── Clickable steps (`onItemClick`) ───────────────────────── */
	button.cw-colored-arrow-timeline__step {
		width: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--cw-radius-md);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	button.cw-colored-arrow-timeline__step:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	button.cw-colored-arrow-timeline__step:hover .cw-colored-arrow-timeline__arrow {
		filter: brightness(1.12);
	}

	button.cw-colored-arrow-timeline__step:active .cw-colored-arrow-timeline__arrow {
		filter: brightness(0.92);
	}

	button.cw-colored-arrow-timeline__step:hover .cw-colored-arrow-timeline__title {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	/* Each arrow's tip pokes into the next step. Stack earlier steps above
	   later ones so a click on a tip goes to the tip's own step, and lift the
	   focused step so its focus ring isn't hidden behind a neighbour's arrow. */
	.cw-colored-arrow-timeline--clickable .cw-colored-arrow-timeline__item {
		position: relative;
		z-index: var(--cw-colored-arrow-timeline-layer);
	}

	.cw-colored-arrow-timeline--clickable .cw-colored-arrow-timeline__item:focus-within {
		z-index: calc(var(--cw-colored-arrow-timeline-count) + 1);
	}

	.cw-colored-arrow-timeline__when {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-1);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-normal);
	}

	.cw-colored-arrow-timeline__date {
		min-width: 0;
		font-weight: var(--cw-font-medium);
		font-variant-numeric: tabular-nums;
		overflow-wrap: break-word;
	}

	.cw-colored-arrow-timeline__leader {
		position: relative;
		flex: none;
		align-self: stretch;
		width: var(--_leader);
		/* Start level with the middle of the date's first line. */
		margin-top: calc(var(--cw-leading-normal) * 0.5em);
	}

	.cw-colored-arrow-timeline__leader svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.cw-colored-arrow-timeline__leader line {
		stroke: currentColor;
		stroke-width: 1.25;
	}

	.cw-colored-arrow-timeline__arrow {
		display: block;
		background: linear-gradient(to bottom, var(--_fill) 50%, var(--_shade) 50%);
		transition: filter var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-colored-arrow-timeline__title {
		display: block;
		margin: var(--cw-space-4) 0 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-bold);
		line-height: var(--cw-leading-tight);
		overflow-wrap: break-word;
	}

	.cw-colored-arrow-timeline__description {
		display: block;
		margin: var(--cw-space-2) 0 0;
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
		overflow-wrap: break-word;
	}

	/* ── Horizontal: arrows point right, text in columns ─────────
	   Every arrow is one column wide plus the tip, which pokes into the next
	   column's notch. The list keeps one tip of room on the right for the
	   last arrow. Subgrid lines up dates, arrows and titles across columns. */
	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__list {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		grid-template-rows: auto var(--_band) auto auto;
		padding-right: var(--_tip);
	}

	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__item,
	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__step {
		display: grid;
		grid-row: 1 / span 4;
		grid-template-rows: subgrid;
	}

	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__when {
		justify-content: flex-end;
		/* The leader ends on the arrow's top corner, just before the tip. */
		padding-right: var(--_gap);
		min-height: calc(var(--_leader) + var(--cw-leading-normal) * 0.5em);
	}

	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__date {
		text-align: right;
	}

	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__arrow {
		width: calc(100% + var(--_tip));
		height: var(--_band);
		clip-path: polygon(
			0 0,
			calc(100% - var(--_tip) - var(--_gap)) 0,
			calc(100% - var(--_gap)) 50%,
			calc(100% - var(--_tip) - var(--_gap)) 100%,
			0 100%,
			var(--_tip) 50%
		);
	}

	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__title,
	.cw-colored-arrow-timeline--horizontal .cw-colored-arrow-timeline__description {
		padding-inline: calc(var(--_tip) + var(--cw-space-1)) var(--cw-space-4);
	}

	/* ── Vertical: arrows point down, text beside them ────────── */
	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__list {
		display: flex;
		flex-direction: column;
		padding-bottom: var(--_tip);
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__step {
		display: grid;
		grid-template-columns: var(--_band) minmax(0, 1fr);
		grid-template-rows: auto auto minmax(var(--cw-space-6), auto);
		column-gap: var(--cw-space-4);
		min-height: calc(var(--_tip) * 2 + var(--cw-space-8));
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__when {
		grid-column: 2;
		grid-row: 1;
		padding-top: calc(var(--_tip) * 0.5);
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__leader {
		display: none;
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__arrow {
		grid-column: 1;
		grid-row: 1 / -1;
		align-self: stretch;
		/* Reach into the next step's notch. */
		margin-bottom: calc(var(--_tip) * -1);
		background: linear-gradient(to right, var(--_fill) 50%, var(--_shade) 50%);
		clip-path: polygon(
			0 0,
			50% var(--_tip),
			100% 0,
			100% calc(100% - var(--_tip) - var(--_gap)),
			50% calc(100% - var(--_gap)),
			0 calc(100% - var(--_tip) - var(--_gap))
		);
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__title {
		grid-column: 2;
		grid-row: 2;
		margin-top: var(--cw-space-1);
	}

	.cw-colored-arrow-timeline--vertical .cw-colored-arrow-timeline__description {
		grid-column: 2;
		grid-row: 3;
		padding-bottom: var(--cw-space-6);
	}

	/* Forced colours drop background images, which would hide the arrows. */
	@media (forced-colors: active) {
		.cw-colored-arrow-timeline__arrow {
			forced-color-adjust: none;
			background: CanvasText;
		}

		.cw-colored-arrow-timeline__leader line {
			stroke: CanvasText;
		}
	}
</style>
