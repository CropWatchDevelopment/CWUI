<script lang="ts" generics="T">
	import { onDestroy, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { CwColumnDef, CwTableQuery, CwTableResult } from '../types/index.js';
	import CwButton from './CwButton.svelte';
	import CwDropdown from './CwDropdown.svelte';
	import CwSpinner from './CwSpinner.svelte';
	import CwSearchInput from './CwSearchInput.svelte';

	type CwTableSort = { column: string; direction: 'asc' | 'desc' } | null;
	type CwTableFilters = Record<string, string[]>;

	interface Props {
		columns: CwColumnDef<T>[];
		loadData: (query: CwTableQuery) => Promise<CwTableResult<T>>;
		rowKey: keyof T & string;
		/** When true, hides table content and shows a centered loading badge. */
		loading?: boolean;
		onRowClick?: (row: T) => void;
		/** Fired when the user moves to the next page from the pagination controls. */
		onPageNext?: () => void;
		/** Fired when the user moves to the previous page from the pagination controls. */
		onPagePrevious?: () => void;
		/** Fired when the page size changes. */
		onPageSizeChanged?: (pageSize: number) => void;
		/** Fired when sorting changes. Receives null when sort is cleared. */
		onSort?: (sort: { column: string; direction: 'asc' | 'desc' } | null) => void;
		/** Fired when the search text changes. */
		onSearch?: (query: string) => void;
		/** Optional externally-controlled filters passed through to `loadData`. */
		filters?: CwTableFilters;
		emptyState?: Snippet;
		errorState?: Snippet<[string]>;
		pageSize?: number;
		/** Optional externally-provided total count (e.g. SQL COUNT(*)) used for pagination. */
		totalItems?: number;
		/** Available page-size options shown in the toolbar dropdown */
		pageSizeOptions?: number[];
		searchable?: boolean;
		/** Snippet rendered at the right side of the toolbar for custom action controls. */
		actionsHeader?: Snippet;
		/** Deprecated alias for `actionsHeader`; kept for compatibility. */
		toolbarActions?: Snippet;
		/** Optional custom cell snippet for any table column. Receives row, column, and default string value. */
		cell?: Snippet<[T, CwColumnDef<T>, string]>;
		/** Snippet rendered in the Actions column for each row. Receives the row data. */
		rowActions?: Snippet<[T]>;
		/** Header text for the row actions column (default: empty). */
		rowActionsHeader?: string;
		/** Row object key containing a CSS font-size value (e.g. "0.875rem", "14px"). */
		rowTextSizeKey?: string;
		/** When true, fills parent height and makes the table body region scroll on overflow. */
		fillParent?: boolean;
		/** When true, incrementally loads pages while only rendering the visible row window. */
		virtualScroll?: boolean;
		/** Scroll viewport height used when `virtualScroll` is enabled without `fillParent`. */
		virtualScrollHeight?: string;
		/** Estimated row height in pixels for virtual scrolling calculations. */
		virtualRowHeight?: number;
		/** Number of extra rows rendered above and below the viewport for smoother touch scrolling. */
		virtualOverscan?: number;
		class?: string;
	}

	let {
		columns,
		loadData,
		rowKey,
		loading = false,
		onRowClick,
		onPageNext,
		onPagePrevious,
		onPageSizeChanged,
		onSort,
		onSearch,
		filters = {},
		emptyState,
		errorState,
		pageSize = $bindable(20),
		totalItems,
		pageSizeOptions = [10, 20, 50, 100],
		searchable = true,
		actionsHeader,
		toolbarActions,
		cell,
		rowActions,
		rowActionsHeader = '',
		rowTextSizeKey,
		fillParent = false,
		virtualScroll = false,
		virtualScrollHeight = '28rem',
		virtualRowHeight = 52,
		virtualOverscan = 12,
		class: className = ''
	}: Props = $props();

	/** Total column count including the optional actions column (for colspan) */
	const colCount = $derived(columns.length + (rowActions ? 1 : 0));

	/** Stringified value for the dropdown (CwDropdown uses string values) */
	let pageSizeStr = $derived(String(pageSize));

	let rows = $state<T[]>([]);
	let total = $state(0);
	let totalKnown = $state(false);
	let page = $state(1);
	let search = $state('');
	let appliedSearch = $state('');
	let sort = $state<CwTableSort>(null);
	let loadingState = $state(false);
	let appendingState = $state(false);
	let error = $state<string | null>(null);
	let appendError = $state<string | null>(null);
	let hasMoreRows = $state(false);
	let loadedPageCount = $state(0);
	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	let headerHeight = $state(0);
	let scrollRef = $state<HTMLDivElement | null>(null);

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let requestVersion = 0;
	let lastResetKey = '';
	let lastQueryKey = '';

	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	const normalizedFilters = $derived.by(() => sanitizeFilters(filters));
	const effectiveViewportHeight = $derived(Math.max(0, viewportHeight - headerHeight));
	const bodyScrollTop = $derived(virtualScroll ? scrollTop : 0);
	const visibleRowCapacity = $derived(
		virtualScroll
			? Math.max(1, Math.ceil((effectiveViewportHeight || virtualRowHeight) / Math.max(virtualRowHeight, 1)))
			: rows.length
	);
	const virtualStartIndex = $derived(
		virtualScroll
			? Math.max(0, Math.floor(bodyScrollTop / Math.max(virtualRowHeight, 1)) - virtualOverscan)
			: 0
	);
	const virtualEndIndex = $derived(
		virtualScroll
			? Math.min(
					rows.length,
					Math.max(
						0,
						Math.ceil((bodyScrollTop + effectiveViewportHeight) / Math.max(virtualRowHeight, 1))
					) + virtualOverscan
				)
			: rows.length
	);
	const visibleRows = $derived(virtualScroll ? rows.slice(virtualStartIndex, virtualEndIndex) : rows);
	const topSpacerHeight = $derived(virtualScroll ? virtualStartIndex * Math.max(virtualRowHeight, 1) : 0);
	const bottomSpacerHeight = $derived(
		virtualScroll ? Math.max(0, (rows.length - virtualEndIndex) * Math.max(virtualRowHeight, 1)) : 0
	);
	const virtualPrefetchThreshold = $derived(Math.max(visibleRowCapacity, virtualOverscan * 2));
	const rangeStart = $derived(
		rows.length === 0 ? 0 : virtualScroll ? virtualStartIndex + 1 : (page - 1) * pageSize + 1
	);
	const rangeEnd = $derived(
		rows.length === 0
			? 0
			: virtualScroll
				? Math.min(rows.length, virtualEndIndex)
				: Math.min(page * pageSize, total)
	);
	const toolbarActionsSnippet = $derived(actionsHeader ?? toolbarActions);

	function sanitizeFilters(nextFilters: CwTableFilters | undefined): CwTableFilters {
		if (!nextFilters) return {};
		const entries = Object.entries(nextFilters)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, values]) => [
				key,
				Array.isArray(values)
					? values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
					: []
			] as const)
			.filter(([, values]) => values.length > 0);

		return Object.fromEntries(entries);
	}

	function createQueryState(pageNumber: number, signal: AbortSignal): CwTableQuery {
		return {
			page: pageNumber,
			pageSize,
			search: appliedSearch,
			sort,
			filters: normalizedFilters,
			signal
		};
	}

	function getResolvedTotal(
		result: CwTableResult<T>,
		loadedCount: number
	): { total: number; known: boolean } {
		if (typeof totalItems === 'number' && Number.isFinite(totalItems)) {
			return { total: Math.max(0, totalItems), known: true };
		}

		if (typeof result.total === 'number' && Number.isFinite(result.total)) {
			return { total: Math.max(0, result.total), known: true };
		}

		return { total: Math.max(0, loadedCount), known: false };
	}

	function clearSearchDebounce() {
		if (!debounceTimer) return;
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}

	function cancelPendingRequest() {
		if (!abortController) return;
		abortController.abort();
		abortController = null;
	}

	function resetVirtualViewport() {
		scrollTop = 0;
		if (scrollRef) {
			scrollRef.scrollTop = 0;
		}
	}

	function handlePageSizeChange(val: string) {
		const nextPageSize = Number(val);
		if (!Number.isFinite(nextPageSize) || nextPageSize <= 0 || nextPageSize === pageSize) return;
		pageSize = nextPageSize;
		page = 1;
		if (virtualScroll) resetVirtualViewport();
		onPageSizeChanged?.(nextPageSize);
	}

	function handleSearch(query: string) {
		search = query;
		page = 1;
		appendError = null;
		onSearch?.(query);
		if (virtualScroll) resetVirtualViewport();
		clearSearchDebounce();
		debounceTimer = setTimeout(() => {
			appliedSearch = query;
		}, 250);
	}

	function handleSort(col: CwColumnDef<T>) {
		if (!col.sortable) return;

		if (sort?.column === col.key) {
			sort =
				sort.direction === 'asc'
					? { column: col.key, direction: 'desc' }
					: null;
		} else {
			sort = { column: col.key, direction: 'asc' };
		}

		page = 1;
		appendError = null;
		if (virtualScroll) resetVirtualViewport();
		onSort?.(sort);
	}

	function handlePreviousPage() {
		if (page <= 1) return;
		page -= 1;
		onPagePrevious?.();
	}

	function handleNextPage() {
		if (page >= totalPages) return;
		page += 1;
		onPageNext?.();
	}

	function handleRowClick(row: T) {
		onRowClick?.(row);
	}

	function handleRowKeydown(e: KeyboardEvent, row: T) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onRowClick?.(row);
		}
	}

	function handleScroll() {
		scrollTop = scrollRef?.scrollTop ?? 0;
	}

	function getVirtualAppendAnchor():
		| {
				distanceFromBottom: number;
				shouldRestoreFromBottom: boolean;
		  }
		| null {
		if (!virtualScroll || !scrollRef) return null;

		const maxScrollTop = Math.max(scrollRef.scrollHeight - scrollRef.clientHeight, 0);
		const distanceFromBottom = Math.max(0, maxScrollTop - scrollRef.scrollTop);
		const restoreThreshold = Math.max(virtualRowHeight, 1) * 2;

		return {
			distanceFromBottom,
			shouldRestoreFromBottom: distanceFromBottom <= restoreThreshold
		};
	}

	async function restoreVirtualAppendAnchor(
		anchor:
			| {
					distanceFromBottom: number;
					shouldRestoreFromBottom: boolean;
			  }
			| null
	) {
		if (!anchor?.shouldRestoreFromBottom) return;

		await tick();

		if (!scrollRef) return;

		const maxScrollTop = Math.max(scrollRef.scrollHeight - scrollRef.clientHeight, 0);
		scrollRef.scrollTop = Math.max(0, maxScrollTop - anchor.distanceFromBottom);
		scrollTop = scrollRef.scrollTop;
	}

	function getCellValue(row: T, col: CwColumnDef<T>): string {
		if (col.cell) return col.cell(row);
		const val = (row as Record<string, unknown>)[col.key];
		return val != null ? String(val) : '';
	}

	function getRowTextSize(row: T): string | undefined {
		if (!rowTextSizeKey) return undefined;
		const val = (row as Record<string, unknown>)[rowTextSizeKey];
		if (typeof val === 'number') return `${val}px`;
		return typeof val === 'string' && val.trim() ? val : undefined;
	}

	function isRowLoading(row: T): boolean {
		return (row as Record<string, unknown>).cwloading === true;
	}

	async function fetchPageData(nextPage: number) {
		requestVersion += 1;
		cancelPendingRequest();

		const version = requestVersion;
		const controller = new AbortController();
		const query = createQueryState(nextPage, controller.signal);

		abortController = controller;
		loadingState = true;
		appendingState = false;
		error = null;
		appendError = null;

		try {
			const result = await loadData(query);
			if (version !== requestVersion) return;

			rows = result.rows;
			const resolved = getResolvedTotal(result, result.rows.length);
			total = resolved.total;
			totalKnown = resolved.known;
			hasMoreRows = false;
			loadedPageCount = result.rows.length > 0 ? nextPage : 0;
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			if (version !== requestVersion) return;
			error = err instanceof Error ? err.message : 'An error occurred';
			rows = [];
			total = typeof totalItems === 'number' && Number.isFinite(totalItems) ? Math.max(0, totalItems) : 0;
			totalKnown = typeof totalItems === 'number' && Number.isFinite(totalItems);
			hasMoreRows = false;
			loadedPageCount = 0;
		} finally {
			if (version === requestVersion) {
				loadingState = false;
			}
			if (abortController === controller) {
				abortController = null;
			}
		}
	}

	async function fetchVirtualData() {
		requestVersion += 1;
		cancelPendingRequest();
		resetVirtualViewport();

		const version = requestVersion;
		const controller = new AbortController();
		const query = createQueryState(1, controller.signal);

		abortController = controller;
		rows = [];
		total = 0;
		totalKnown = false;
		loadingState = true;
		appendingState = false;
		error = null;
		appendError = null;
		hasMoreRows = false;
		loadedPageCount = 0;

		try {
			const result = await loadData(query);
			if (version !== requestVersion) return;

			rows = result.rows;
			const resolved = getResolvedTotal(result, result.rows.length);
			total = resolved.total;
			totalKnown = resolved.known;
			hasMoreRows = resolved.known
				? result.rows.length > 0 && result.rows.length < resolved.total
				: result.rows.length === pageSize;
			loadedPageCount = result.rows.length > 0 ? 1 : 0;
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			if (version !== requestVersion) return;
			error = err instanceof Error ? err.message : 'An error occurred';
			rows = [];
			total = 0;
			totalKnown = false;
			hasMoreRows = false;
			loadedPageCount = 0;
		} finally {
			if (version === requestVersion) {
				loadingState = false;
			}
			if (abortController === controller) {
				abortController = null;
			}
		}
	}

	async function fetchNextVirtualPage(pageNumber: number) {
		if (!virtualScroll || loadingState || appendingState || !hasMoreRows) return;

		const version = requestVersion;
		const controller = new AbortController();
		const query = createQueryState(pageNumber, controller.signal);
		const scrollAnchor = getVirtualAppendAnchor();

		abortController = controller;
		appendingState = true;
		appendError = null;

		try {
			const result = await loadData(query);
			if (version !== requestVersion) return;

			const mergedRows = [...rows, ...result.rows];
			rows = mergedRows;
			const resolved = getResolvedTotal(result, mergedRows.length);
			total = resolved.total;
			totalKnown = resolved.known;
			hasMoreRows = resolved.known
				? result.rows.length > 0 && mergedRows.length < resolved.total
				: result.rows.length === pageSize;
			loadedPageCount = pageNumber;
			await restoreVirtualAppendAnchor(scrollAnchor);
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			if (version !== requestVersion) return;
			appendError = err instanceof Error ? err.message : 'Unable to load more rows';
		} finally {
			if (version === requestVersion) {
				appendingState = false;
			}
			if (abortController === controller) {
				abortController = null;
			}
		}
	}

	function retryVirtualAppend() {
		if (!virtualScroll) return;
		appendError = null;
		void fetchNextVirtualPage(loadedPageCount + 1);
	}

	$effect(() => {
		appliedSearch;
		pageSize;
		sort;
		const filterKey = JSON.stringify(normalizedFilters);
		const resetKey = `${virtualScroll}|${pageSize}|${filterKey}`;
		const sortKey = sort ? `${sort.column}:${sort.direction}` : '';
		const queryKey = `${virtualScroll}|${page}|${pageSize}|${appliedSearch}|${sortKey}|${filterKey}`;

		if (resetKey !== lastResetKey) {
			lastResetKey = resetKey;
			if (page !== 1) {
				page = 1;
				return;
			}
		}

		if (queryKey === lastQueryKey) {
			return;
		}

		lastQueryKey = queryKey;

		if (virtualScroll) {
			void fetchVirtualData();
			return;
		}

		const nextPage = page;
		void fetchPageData(nextPage);
	});

	$effect(() => {
		if (!virtualScroll) return;
		if (loadingState || appendingState || error || appendError || !hasMoreRows) return;
		if (rows.length === 0) return;
		if (viewportHeight <= 0) return;
		if (rows.length - virtualEndIndex > virtualPrefetchThreshold) return;

		void fetchNextVirtualPage(loadedPageCount + 1);
	});

	$effect(() => {
		if (typeof totalItems !== 'number' || !Number.isFinite(totalItems)) return;
		total = Math.max(0, totalItems);
		totalKnown = true;
		if (virtualScroll) {
			hasMoreRows = rows.length < total;
		}
	});

	onDestroy(() => {
		clearSearchDebounce();
		cancelPendingRequest();
	});
</script>

<div
	class="cw-data-table {className}"
	class:cw-data-table--fill-parent={fillParent}
	class:cw-data-table--virtual={virtualScroll}
>
	{#if loading}
		<div class="cw-data-table__loading-container" role="status" aria-live="polite">
			<div class="cw-data-table__loading-badge">
				<CwSpinner size="md" />
				Loading...
			</div>
		</div>
	{:else}
		<div class="cw-data-table__toolbar">
			{#if searchable}
				<div class="cw-data-table__search-wrapper">
					<CwSearchInput
						value={search}
						placeholder="Search..."
						oninput={handleSearch}
						debounceMs={0}
					/>
				</div>
			{/if}

			<span class="cw-data-table__toolbar-spacer"></span>

			<div class="cw-data-table__toolbar-end">
				<div class="cw-data-table__page-size">
					<CwDropdown
						options={pageSizeOptions.map((n) => ({
							label: virtualScroll ? `${n} rows/batch` : `${n} rows`,
							value: String(n)
						}))}
						value={pageSizeStr}
						onchange={handlePageSizeChange}
					/>
				</div>

				{#if toolbarActionsSnippet}
					<div class="cw-data-table__toolbar-actions">
						{@render toolbarActionsSnippet()}
					</div>
				{/if}
			</div>
		</div>

		<div
			bind:this={scrollRef}
			bind:clientHeight={viewportHeight}
			class="cw-data-table__scroll"
			class:cw-data-table__scroll--virtual={virtualScroll}
			onscroll={handleScroll}
			style:max-height={virtualScroll && !fillParent ? virtualScrollHeight : undefined}
		>
			<table class="cw-data-table__table" role="grid">
				<thead bind:offsetHeight={headerHeight}>
					<tr>
						{#each columns as col (col.key)}
							<th
								class="cw-data-table__th"
								class:cw-data-table__th--sortable={col.sortable}
								class:cw-data-table__th--hide-sm={col.hideBelow === 'sm'}
								class:cw-data-table__th--hide-md={col.hideBelow === 'md'}
								class:cw-data-table__th--hide-lg={col.hideBelow === 'lg'}
								style:width={col.width}
								style:text-align={col.align ?? 'left'}
								aria-sort={sort?.column === col.key
									? sort.direction === 'asc'
										? 'ascending'
										: 'descending'
									: undefined}
							>
								{#if col.sortable}
									<button
										type="button"
										class="cw-data-table__sort-btn"
										onclick={() => handleSort(col)}
									>
										{col.header}
										<span class="cw-data-table__sort-icon" aria-hidden="true">
											{#if sort?.column === col.key}
												{sort.direction === 'asc' ? '↑' : '↓'}
											{:else}
												↕
											{/if}
										</span>
									</button>
								{:else}
									{col.header}
								{/if}
							</th>
						{/each}
						{#if rowActions}
							<th class="cw-data-table__th cw-data-table__th--actions" style:text-align="right">
								{rowActionsHeader}
							</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#if loadingState && rows.length === 0}
						<tr>
							<td colspan={colCount} class="cw-data-table__status">
								<div class="cw-data-table__loading">
									<CwSpinner size="lg" />
									Loading...
								</div>
							</td>
						</tr>
					{:else if error}
						<tr>
							<td colspan={colCount} class="cw-data-table__status">
								{#if errorState}
									{@render errorState(error)}
								{:else}
									<div class="cw-data-table__error">
										<p>Error: {error}</p>
										<CwButton
											variant="secondary"
											size="sm"
											onclick={() => (virtualScroll ? fetchVirtualData() : fetchPageData(page))}
										>
											Retry
										</CwButton>
									</div>
								{/if}
							</td>
						</tr>
					{:else if rows.length === 0}
						<tr>
							<td colspan={colCount} class="cw-data-table__status">
								{#if emptyState}
									{@render emptyState()}
								{:else}
									<p class="cw-data-table__empty">No data available</p>
								{/if}
							</td>
						</tr>
					{:else}
						{#if virtualScroll && topSpacerHeight > 0}
							<tr aria-hidden="true" class="cw-data-table__spacer-row">
								<td
									colspan={colCount}
									class="cw-data-table__spacer-cell"
									style:height={`${topSpacerHeight}px`}
								></td>
							</tr>
						{/if}

						{#each visibleRows as row, visibleIndex (row[rowKey])}
							{@const rowIndex = virtualScroll ? virtualStartIndex + visibleIndex : visibleIndex}
							<tr
								class="cw-data-table__row"
								class:cw-data-table__row--even={rowIndex % 2 === 1}
								class:cw-data-table__row--clickable={!!onRowClick}
								class:cw-data-table__row--loading={isRowLoading(row)}
								onclick={() => handleRowClick(row)}
								onkeydown={(e) => handleRowKeydown(e, row)}
								tabindex={onRowClick ? 0 : undefined}
								role={onRowClick ? 'button' : undefined}
								style:font-size={getRowTextSize(row)}
							>
								{#each columns as col (col.key)}
									<td
										class="cw-data-table__td"
										class:cw-data-table__td--hide-sm={col.hideBelow === 'sm'}
										class:cw-data-table__td--hide-md={col.hideBelow === 'md'}
										class:cw-data-table__td--hide-lg={col.hideBelow === 'lg'}
										style:text-align={col.align ?? 'left'}
									>
										{#if cell}
											{@render cell(row, col, getCellValue(row, col))}
										{:else}
											{getCellValue(row, col)}
										{/if}
									</td>
								{/each}
								{#if rowActions}
									<td class="cw-data-table__td cw-data-table__td--actions" style:text-align="right">
										{@render rowActions(row)}
									</td>
								{/if}
							</tr>
						{/each}

						{#if virtualScroll && appendingState}
							<tr class="cw-data-table__append-row" aria-live="polite">
								<td colspan={colCount} class="cw-data-table__append-cell">
									<div class="cw-data-table__append-status">
										<CwSpinner size="md" />
										Loading more rows...
									</div>
								</td>
							</tr>
						{/if}

						{#if virtualScroll && appendError}
							<tr class="cw-data-table__append-row">
								<td colspan={colCount} class="cw-data-table__append-cell">
									<div class="cw-data-table__append-error">
										<span>{appendError}</span>
										<CwButton variant="secondary" size="sm" onclick={retryVirtualAppend}>
											Retry
										</CwButton>
									</div>
								</td>
							</tr>
						{/if}

						{#if virtualScroll && bottomSpacerHeight > 0}
							<tr aria-hidden="true" class="cw-data-table__spacer-row">
								<td
									colspan={colCount}
									class="cw-data-table__spacer-cell"
									style:height={`${bottomSpacerHeight}px`}
								></td>
							</tr>
						{/if}
					{/if}
				</tbody>
			</table>
		</div>

		{#if virtualScroll && rows.length > 0}
			<div class="cw-data-table__pagination cw-data-table__pagination--virtual">
				<span class="cw-data-table__page-info">
					{rangeStart}–{rangeEnd}
					{#if totalKnown}
						of {total}
					{:else}
						loaded
					{/if}
				</span>
				<span class="cw-data-table__virtual-meta">
					{#if appendError}
						Load interrupted
					{:else if hasMoreRows}
						Scroll to load more
					{:else if totalKnown}
						All {total} rows loaded
					{:else}
						All loaded rows visible
					{/if}
				</span>
			</div>
		{:else if !virtualScroll && totalPages > 1}
			<div class="cw-data-table__pagination">
				<span class="cw-data-table__page-info">
					{rangeStart}–{rangeEnd} of {total}
				</span>
				<div class="cw-data-table__page-controls">
					<CwButton
						variant="secondary"
						size="sm"
						disabled={page <= 1}
						onclick={handlePreviousPage}
						aria-label="Previous page"
					>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style="width:1rem;height:1rem">
							<path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</CwButton>
					<span class="cw-data-table__page-num">Page {page} of {totalPages}</span>
					<CwButton
						variant="secondary"
						size="sm"
						disabled={page >= totalPages}
						onclick={handleNextPage}
						aria-label="Next page"
					>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style="width:1rem;height:1rem">
							<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</CwButton>
				</div>
			</div>
		{/if}

		{#if !virtualScroll && loadingState && rows.length > 0}
			<div class="cw-data-table__overlay" aria-hidden="true"></div>
		{/if}
	{/if}
</div>

<style>
	.cw-data-table {
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		overflow: visible;
	}

	.cw-data-table--fill-parent {
		flex: 1 1 0%;
		height: 100%;
		min-height: 0;
	}

	.cw-data-table__loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-10) var(--cw-space-4);
		min-height: 14rem;
	}

	.cw-data-table--fill-parent .cw-data-table__loading-container {
		flex: 1 1 auto;
		min-height: 0;
	}

	.cw-data-table__loading-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-4);
		border-radius: var(--cw-radius-pill);
		border: 1px solid var(--cw-border-default);
		background: var(--cw-bg-muted);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
	}

	.cw-data-table__loading-badge svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-data-table__toolbar {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-data-table__search-wrapper {
		flex: 1;
		max-width: 20rem;
		min-width: 10rem;
	}

	.cw-data-table__toolbar-spacer {
		flex: 1;
	}

	.cw-data-table__toolbar-end {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		flex-shrink: 0;
	}

	.cw-data-table__page-size {
		min-width: 7rem;
	}

	.cw-data-table__toolbar-actions {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-data-table__scroll {
		border-radius: 0 0 var(--cw-radius-lg) var(--cw-radius-lg);
		overflow-x: auto;
		overflow-y: hidden;
	}

	.cw-data-table__scroll--virtual,
	.cw-data-table--fill-parent .cw-data-table__scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}

	.cw-data-table__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--cw-text-sm);
	}

	.cw-data-table--virtual .cw-data-table__th {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.cw-data-table__th {
		padding: var(--cw-space-3) var(--cw-space-4);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		background-color: var(--cw-bg-muted);
		border-bottom: 1px solid var(--cw-border-default);
		text-align: left;
		white-space: nowrap;
		font-size: var(--cw-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.cw-data-table__th--sortable {
		cursor: pointer;
		user-select: none;
	}

	.cw-data-table__sort-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		text-transform: inherit;
		letter-spacing: inherit;
		cursor: pointer;
		padding: 0;
	}

	.cw-data-table__sort-icon {
		font-size: 0.75em;
		opacity: 0.5;
	}

	.cw-data-table__td {
		padding: var(--cw-space-3) var(--cw-space-4);
		color: var(--cw-datatable-row-text);
		border-bottom: 1px solid var(--cw-border-muted);
		vertical-align: middle;
		filter: none;
		transition: filter var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__row {
		background-color: var(--cw-datatable-row-bg);
		color: var(--cw-datatable-row-text);
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__row--even {
		background-color: var(--cw-datatable-row-bg-alt);
	}

	.cw-data-table__row:hover {
		background-color: var(--cw-datatable-row-bg-hover);
	}

	.cw-data-table__row--even:hover {
		background-color: var(--cw-datatable-row-bg-alt-hover);
	}

	.cw-data-table__row--loading,
	.cw-data-table__row--loading.cw-data-table__row--even,
	.cw-data-table__row--loading:hover,
	.cw-data-table__row--loading.cw-data-table__row--even:hover {
		background-color: var(--cw-warning-700);
	}

	.cw-data-table__row--loading .cw-data-table__td {
		filter: blur(1.75px);
		opacity: 0.75;
		color: black;
	}

	.cw-data-table__row:last-child .cw-data-table__td {
		border-bottom: none;
	}

	.cw-data-table__row--clickable {
		cursor: pointer;
	}

	.cw-data-table__th--actions,
	.cw-data-table__td--actions {
		width: 1%;
		white-space: nowrap;
	}

	.cw-data-table__status {
		padding: var(--cw-space-12) var(--cw-space-4);
		text-align: center;
		color: var(--cw-text-muted);
	}

	.cw-data-table__loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
	}

	.cw-data-table__loading svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.cw-data-table__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--cw-space-3);
		color: var(--cw-tone-danger-text);
	}

	.cw-data-table__empty {
		margin: 0;
	}

	.cw-data-table__spacer-row {
		pointer-events: none;
	}

	.cw-data-table__spacer-cell {
		padding: 0;
		border: 0;
		background: transparent;
	}

	.cw-data-table__append-row {
		background: transparent;
	}

	.cw-data-table__append-cell {
		padding: var(--cw-space-3) var(--cw-space-4);
		border-bottom: 0;
	}

	.cw-data-table__append-status,
	.cw-data-table__append-error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		color: var(--cw-text-secondary);
	}

	.cw-data-table__append-error {
		color: var(--cw-tone-danger-text);
	}

	.cw-data-table__pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-3) var(--cw-space-4);
		border-top: 1px solid var(--cw-border-muted);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		gap: var(--cw-space-3);
	}

	.cw-data-table__pagination--virtual {
		flex-wrap: wrap;
	}

	.cw-data-table__virtual-meta {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-data-table__page-controls {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-data-table__page-num {
		font-variant-numeric: tabular-nums;
	}

	.cw-data-table__overlay {
		position: absolute;
		inset: 0;
		background-color: color-mix(in srgb, var(--cw-bg-surface) 60%, transparent);
		z-index: 1;
	}

	@media (max-width: 640px) {
		.cw-data-table__th--hide-sm,
		.cw-data-table__td--hide-sm {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.cw-data-table__th--hide-md,
		.cw-data-table__td--hide-md {
			display: none;
		}
	}

	@media (max-width: 1024px) {
		.cw-data-table__th--hide-lg,
		.cw-data-table__td--hide-lg {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.cw-data-table__toolbar {
			flex-wrap: wrap;
		}

		.cw-data-table__toolbar-spacer {
			display: none;
		}

		.cw-data-table__toolbar-end,
		.cw-data-table__pagination {
			width: 100%;
		}

		.cw-data-table__toolbar-end,
		.cw-data-table__pagination {
			flex-direction: column;
			align-items: stretch;
		}

		.cw-data-table__page-controls {
			justify-content: center;
		}
	}
</style>
