<script lang="ts" module>
	/** Override display labels for i18n. All fields optional; English defaults are used when omitted. */
	export interface CwCalendarScrollLabels {
		/** Accessible label for the scrollable list region. Default: "Calendar scroll". */
		ariaLabel?: string;
		/** Suffix appended to a date's meta line when the row is today. Default: "Today". */
		today?: string;
		/** Status text/pill shown when a row has data. Default: "Data available". */
		dataAvailable?: string;
		/** Status text/pill shown when a row has no data. Default: "No data". */
		noData?: string;
		/** Builds the accessible label for a date row. Receives the date key and its status text. */
		rowAriaLabel?: (key: string, status: string) => string;
		/** Builds the accessible label for a row's actions region. Receives the date key. */
		actionsAriaLabel?: (key: string) => string;
		/** Placeholder shown when an item exists but no `content` snippet was provided. */
		contentPlaceholder?: string;
		/** Placeholder shown when a row has no data. Default: "No data for this date.". */
		noDataForDate?: string;
		/** Title shown in the empty state when there are no rows. Default: "No dated rows to show.". */
		emptyTitle?: string;
		/** Copy shown in the empty state when there are no rows. */
		emptyCopy?: string;
	}

	const DEFAULT_LABELS: Required<CwCalendarScrollLabels> = {
		ariaLabel: 'Calendar scroll',
		today: 'Today',
		dataAvailable: 'Data available',
		noData: 'No data',
		rowAriaLabel: (key, status) => `${key}, ${status}`,
		actionsAriaLabel: (key) => `Actions for ${key}`,
		contentPlaceholder: 'An item exists for this date. Provide a `content` snippet to render it.',
		noDataForDate: 'No data for this date.',
		emptyTitle: 'No dated rows to show.',
		emptyCopy: 'Add dated items or enable `showAllDates` with a range.'
	};
</script>

<script lang="ts" generics="T extends CwCalendarScrollItem = CwCalendarScrollItem">
	import type { Snippet } from 'svelte';
	import type {
		CwCalendarScrollItem,
		CwCalendarScrollMeta,
		CwDateTimeInput
	} from '../types/index.js';
	import { buildCalendarScrollEntries } from './cwCalendarScrollUtils.js';

	interface Props {
		/** Dated items rendered as rows. Item dates should prefer local values like YYYY-MM-DD when possible. */
		items?: T[];
		/** When true, shows every date in the computed range. When false, only rows with data are shown. */
		showAllDates?: boolean;
		/** Inclusive first date shown when `showAllDates` is true. */
		startDate?: CwDateTimeInput;
		/** Inclusive last date shown when `showAllDates` is true. */
		endDate?: CwDateTimeInput;
		/** Max height of the internal scroll area. */
		maxHeight?: string;
		/** Custom presence check for deciding whether an item counts as populated. */
		hasData?: (item: T, key: string) => boolean;
		/** Main content region for each date row. */
		content?: Snippet<[T | null, CwCalendarScrollMeta]>;
		/** Optional actions region for each date row. */
		actions?: Snippet<[T | null, CwCalendarScrollMeta]>;
		/** Optional empty-state content rendered when no rows are visible. */
		emptyState?: Snippet;
		/** Accessible label for the scrollable list. Takes precedence over `labels.ariaLabel` when set. */
		ariaLabel?: string;
		/** Override display labels for i18n. */
		labels?: CwCalendarScrollLabels;
		class?: string;
	}

	let {
		items = [],
		showAllDates = false,
		startDate,
		endDate,
		maxHeight = 'min(70dvh, 40rem)',
		hasData,
		content,
		actions,
		emptyState,
		ariaLabel,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const rows = $derived.by(() =>
		buildCalendarScrollEntries({
			items,
			showAllDates,
			startDate,
			endDate,
			hasData
		})
	);

	const viewportStyle = $derived(`--cw-calendar-scroll-max-height: ${maxHeight};`);

	const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
	const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	function formatDateMeta(meta: CwCalendarScrollMeta): string {
		const parts = [weekdayFormatter.format(meta.date), fullDateFormatter.format(meta.date)];
		if (meta.isToday) parts.push(l.today);
		return parts.join(' • ');
	}

	function getRowStatus(meta: CwCalendarScrollMeta): string {
		return meta.hasData ? l.dataAvailable : l.noData;
	}
</script>

<div class="cw-calendar-scroll {className}" style={viewportStyle}>
	<div class="cw-calendar-scroll__viewport" role="list" aria-label={ariaLabel ?? l.ariaLabel}>
		{#if rows.length > 0}
			{#each rows as row (row.key)}
				<article
					class="cw-calendar-scroll__item"
					class:cw-calendar-scroll__item--today={row.isToday}
					class:cw-calendar-scroll__item--has-data={row.hasData}
					role="listitem"
					aria-label={l.rowAriaLabel(row.key, getRowStatus(row))}
				>
					<header class="cw-calendar-scroll__header">
						<div class="cw-calendar-scroll__date-block">
							<span class="cw-calendar-scroll__date-key">{row.key}</span>
							<span class="cw-calendar-scroll__date-meta">{formatDateMeta(row)}</span>
						</div>
						<span
							class="cw-calendar-scroll__status"
							class:cw-calendar-scroll__status--empty={!row.hasData}
						>
							{getRowStatus(row)}
						</span>
					</header>

					<div
						class="cw-calendar-scroll__body"
						class:cw-calendar-scroll__body--with-actions={!!actions}
					>
						<div
							class="cw-calendar-scroll__content"
							class:cw-calendar-scroll__content--empty={!row.hasData}
						>
							{#if content}
								{@render content(row.item, row)}
							{:else if row.hasData}
								<p class="cw-calendar-scroll__placeholder">
									{l.contentPlaceholder}
								</p>
							{:else}
								<p class="cw-calendar-scroll__placeholder">{l.noDataForDate}</p>
							{/if}
						</div>

						{#if actions}
							<aside class="cw-calendar-scroll__actions" aria-label={l.actionsAriaLabel(row.key)}>
								{@render actions(row.item, row)}
							</aside>
						{/if}
					</div>
				</article>
			{/each}
		{:else if emptyState}
			<div class="cw-calendar-scroll__empty">
				{@render emptyState()}
			</div>
		{:else}
			<div class="cw-calendar-scroll__empty">
				<p class="cw-calendar-scroll__empty-title">{l.emptyTitle}</p>
				<p class="cw-calendar-scroll__empty-copy">
					{l.emptyCopy}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.cw-calendar-scroll {
		container-type: inline-size;
		min-width: 0;
		min-height: 0;
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		background: var(--cw-bg-surface);
		box-shadow: var(--cw-shadow-sm);
		overflow: hidden;
	}

	.cw-calendar-scroll__viewport {
		display: grid;
		gap: var(--cw-space-3);
		max-block-size: var(--cw-calendar-scroll-max-height);
		overflow-y: auto;
		overscroll-behavior-y: contain;
		-webkit-overflow-scrolling: touch;
		scrollbar-gutter: stable both-edges;
		padding: var(--cw-space-3);
		background:
			color-mix(in srgb, var(--cw-bg-base) 18%, var(--cw-bg-surface));
	}

	.cw-calendar-scroll__item {
		display: grid;
		gap: var(--cw-space-3);
		padding: clamp(var(--cw-space-3), 1.2vw + 0.55rem, var(--cw-space-5));
		background: var(--cw-bg-surface-elevated);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 76%, transparent);
		border-radius: var(--cw-radius-lg);
		box-shadow: var(--cw-shadow-sm);
	}

	.cw-calendar-scroll__item--today {
		border-color: color-mix(in srgb, var(--cw-accent) 56%, var(--cw-border-default));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--cw-accent) 20%, transparent),
			var(--cw-shadow-sm);
	}

	.cw-calendar-scroll__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.cw-calendar-scroll__date-block {
		min-width: 0;
		display: grid;
		gap: var(--cw-space-1);
	}

	.cw-calendar-scroll__date-key {
		font-size: clamp(var(--cw-text-sm), 0.35vw + 0.82rem, var(--cw-text-base));
		font-weight: var(--cw-font-semibold);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.cw-calendar-scroll__date-meta {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		line-height: var(--cw-leading-normal);
	}

	.cw-calendar-scroll__status {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.38rem 0.7rem;
		border-radius: var(--cw-radius-pill);
		background: color-mix(in srgb, var(--cw-accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-accent) 30%, transparent);
		color: var(--cw-text-primary);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		white-space: nowrap;
	}

	.cw-calendar-scroll__status--empty {
		background: color-mix(in srgb, var(--cw-bg-muted) 78%, transparent);
		border-color: color-mix(in srgb, var(--cw-border-muted) 80%, transparent);
		color: var(--cw-text-muted);
	}

	.cw-calendar-scroll__body {
		display: grid;
		gap: var(--cw-space-3);
	}

	.cw-calendar-scroll__body--with-actions {
		grid-template-columns: minmax(0, 1fr) minmax(10rem, 12rem);
		align-items: stretch;
	}

	.cw-calendar-scroll__content {
		min-width: 0;
		min-height: clamp(5.5rem, 10vw, 7.5rem);
		padding: clamp(var(--cw-space-3), 0.8vw + 0.6rem, var(--cw-space-4));
		border-radius: var(--cw-radius-md);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 68%, transparent);
		background:
			color-mix(in srgb, var(--cw-bg-surface) 82%, var(--cw-bg-base));
		display: grid;
		align-content: start;
		gap: var(--cw-space-3);
	}

	.cw-calendar-scroll__content--empty {
		background: color-mix(in srgb, var(--cw-bg-muted) 40%, var(--cw-bg-surface));
		border-style: dashed;
	}

	.cw-calendar-scroll__placeholder {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		line-height: var(--cw-leading-relaxed);
	}

	.cw-calendar-scroll__actions {
		display: grid;
		align-content: start;
		gap: var(--cw-space-2);
		min-width: 0;
		padding-inline-start: var(--cw-space-1);
	}

	.cw-calendar-scroll__actions :global(*) {
		min-width: 0;
	}

	.cw-calendar-scroll__actions :global(.cw-button) {
		width: 100%;
	}

	.cw-calendar-scroll__empty {
		display: grid;
		place-items: center;
		gap: var(--cw-space-2);
		min-height: 14rem;
		padding: var(--cw-space-6);
		text-align: center;
		background: var(--cw-bg-surface-elevated);
		border: 1px dashed color-mix(in srgb, var(--cw-border-muted) 82%, transparent);
		border-radius: var(--cw-radius-lg);
	}

	.cw-calendar-scroll__empty-title {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-calendar-scroll__empty-copy {
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
		color: var(--cw-text-muted);
		max-width: 28rem;
	}

	@container (max-width: 44rem) {
		.cw-calendar-scroll__header {
			flex-direction: column;
			align-items: flex-start;
		}

		.cw-calendar-scroll__body--with-actions {
			grid-template-columns: minmax(0, 1fr);
		}

		.cw-calendar-scroll__actions {
			padding-inline-start: 0;
			padding-top: var(--cw-space-3);
			border-top: 1px solid color-mix(in srgb, var(--cw-border-muted) 76%, transparent);
			grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		}
	}
</style>
