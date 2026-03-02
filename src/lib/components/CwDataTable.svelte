<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { CwColumnDef, CwTableQuery, CwTableResult } from '../types/index.js';
	import CwButton from './CwButton.svelte';
	import CwDropdown from './CwDropdown.svelte';
	import CwSpinner from './CwSpinner.svelte';
	import CwSearchInput from './CwSearchInput.svelte';

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
		emptyState?: Snippet;
		errorState?: Snippet<[string]>;
		pageSize?: number;
		/** Optional externally-provided total count (e.g. SQL COUNT(*)) used for pagination. */
		totalItems?: number;
		/** Available page-size options shown in the toolbar dropdown */
		pageSizeOptions?: number[];
		searchable?: boolean;
		/** Snippet rendered at the right side of the toolbar for custom action buttons */
		toolbarActions?: Snippet;
		/** Optional custom cell snippet for any table column. Receives row, column, and default string value. */
		cell?: Snippet<[T, CwColumnDef<T>, string]>;
		/** Snippet rendered in the Actions column for each row. Receives the row data. */
		rowActions?: Snippet<[T]>;
		/** Header text for the actions column (default: empty) */
		actionsHeader?: string;
		/** Row object key containing a CSS font-size value (e.g. "0.875rem", "14px"). */
		rowTextSizeKey?: string;
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
		emptyState,
		errorState,
		pageSize = $bindable(20),
		totalItems,
		pageSizeOptions = [10, 20, 50, 100],
		searchable = true,
		toolbarActions,
		cell,
		rowActions,
		actionsHeader = '',
		rowTextSizeKey,
		class: className = ''
	}: Props = $props();

	/** Total column count including the optional actions column (for colspan) */
	const colCount = $derived(columns.length + (rowActions ? 1 : 0));

	/** Stringified value for the dropdown (CwDropdown uses string values) */
	let pageSizeStr = $derived(String(pageSize));

	function handlePageSizeChange(val: string) {
		const nextPageSize = Number(val);
		pageSize = nextPageSize;
		page = 1;
		onPageSizeChanged?.(nextPageSize);
		fetchData();
	}

	let rows = $state<T[]>([]);
	let total = $state(0);
	let page = $state(1);
	let search = $state('');
	let sort = $state<{ column: string; direction: 'asc' | 'desc' } | null>(null);
	let loadingState = $state(false);
	let error = $state<string | null>(null);

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	async function fetchData() {
		if (abortController) abortController.abort();
		abortController = new AbortController();

		loadingState = true;
		error = null;

		try {
			const result = await loadData({
				page,
				pageSize,
				search,
				sort,
				filters: {},
				signal: abortController.signal
			});
			rows = result.rows;
			const nextTotal = typeof totalItems === 'number' ? totalItems : result.total;
			total = typeof nextTotal === 'number' && Number.isFinite(nextTotal)
				? Math.max(0, nextTotal)
				: rows.length;
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			error = err instanceof Error ? err.message : 'An error occurred';
			rows = [];
			total = typeof totalItems === 'number' ? Math.max(0, totalItems) : 0;
		} finally {
			loadingState = false;
		}
	}

	function handleSearch(query: string) {
		search = query;
		page = 1;
		onSearch?.(search);
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(fetchData, 250);
	}

	function handleSort(col: CwColumnDef<T>) {
		if (!col.sortable) return;
		if (sort?.column === col.key) {
			sort = sort.direction === 'asc'
				? { column: col.key, direction: 'desc' }
				: null;
		} else {
			sort = { column: col.key, direction: 'asc' };
		}
		page = 1;
		onSort?.(sort);
		fetchData();
	}

	function handlePreviousPage() {
		if (page <= 1) return;
		page -= 1;
		onPagePrevious?.();
		fetchData();
	}

	function handleNextPage() {
		if (page >= totalPages) return;
		page += 1;
		onPageNext?.();
		fetchData();
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

	// Initial load
	$effect(() => {
		fetchData();
	});

	$effect(() => {
		if (typeof totalItems === 'number' && Number.isFinite(totalItems)) {
			total = Math.max(0, totalItems);
		}
	});
</script>

<div class="cw-data-table {className}">
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
						options={pageSizeOptions.map((n) => ({ label: `${n} rows`, value: String(n) }))}
						value={pageSizeStr}
						onchange={handlePageSizeChange}
					/>
				</div>

				{#if toolbarActions}
					<div class="cw-data-table__toolbar-actions">
						{@render toolbarActions()}
					</div>
				{/if}
			</div>
		</div>

		<div class="cw-data-table__scroll">
			<table class="cw-data-table__table" role="grid">
				<thead>
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
								{actionsHeader}
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
										<CwButton variant="secondary" size="sm" onclick={fetchData}>Retry</CwButton>
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
						{#each rows as row (row[rowKey])}
							<tr
								class="cw-data-table__row"
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
					{/if}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<div class="cw-data-table__pagination">
				<span class="cw-data-table__page-info">
					{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
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

		{#if loadingState && rows.length > 0}
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
		overflow: hidden;
	}

	/* ── Toolbar ─────────────────────────── */
	.cw-data-table__loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-10) var(--cw-space-4);
		min-height: 14rem;
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

	/* ── Scroll wrapper ──────────────────── */
	.cw-data-table__scroll {
		overflow-x: auto;
	}

	/* ── Table ───────────────────────────── */
	.cw-data-table__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--cw-text-sm);
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

	.cw-data-table__row:nth-child(even) {
		background-color: var(--cw-datatable-row-bg-alt);
	}

	.cw-data-table__row:hover {
		background-color: var(--cw-datatable-row-bg-hover);
	}

	.cw-data-table__row:nth-child(even):hover {
		background-color: var(--cw-datatable-row-bg-alt-hover);
	}

	.cw-data-table__row--loading,
	.cw-data-table__row--loading:nth-child(even),
	.cw-data-table__row--loading:hover,
	.cw-data-table__row--loading:nth-child(even):hover {
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

	/* ── Actions column ───────────────────── */
	.cw-data-table__th--actions,
	.cw-data-table__td--actions {
		width: 1%;
		white-space: nowrap;
	}

	/* ── Status cells ────────────────────── */
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

	/* ── Pagination ──────────────────────── */
	.cw-data-table__pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-3) var(--cw-space-4);
		border-top: 1px solid var(--cw-border-muted);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.cw-data-table__page-controls {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-data-table__page-num {
		font-variant-numeric: tabular-nums;
	}

	/* ── Loading overlay ─────────────────── */
	.cw-data-table__overlay {
		position: absolute;
		inset: 0;
		background-color: color-mix(in srgb, var(--cw-bg-surface) 60%, transparent);
		z-index: 1;
	}

	/* ── Responsive column hiding ────────── */
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
		.cw-data-table__pagination {
			flex-direction: column;
			gap: var(--cw-space-2);
		}
	}
</style>
