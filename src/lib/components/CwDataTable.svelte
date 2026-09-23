<script lang="ts" module>
	/**
	 * Overridable display labels for `CwDataTable` (i18n).
	 * Every field is optional; omitted fields fall back to the English defaults.
	 * Function fields build interpolated strings from runtime values.
	 */
	export interface CwDataTableLabels {
		/** Search input placeholder. Default: "Search..." */
		searchPlaceholder?: string;
		/** Loading text shown in the centered loading badge and body spinner. Default: "Loading..." */
		loading?: string;
		/** Text shown while appending more rows in virtual-scroll mode. Default: "Loading more rows..." */
		loadingMore?: string;
		/** First option in the mobile sort dropdown (clears sorting). Default: "No sort" */
		noSort?: string;
		/** Builds the ascending mobile-sort option label for a column. Default: `${header} (A-Z)` */
		sortAscOption?: (header: string) => string;
		/** Builds the descending mobile-sort option label for a column. Default: `${header} (Z-A)` */
		sortDescOption?: (header: string) => string;
		/** Builds the page-size option label in paged mode. Default: `${n} rows` */
		pageSizeOption?: (n: number) => string;
		/** Builds the page-size option label in virtual-scroll mode. Default: `${n} rows/batch` */
		pageSizeBatchOption?: (n: number) => string;
		/** Aria-label for the toolbar overflow menu button. Default: "Open table options" */
		toolbarMenu?: string;
		/** Toolbar menu item and column-settings dialog title. Default: "Column settings" */
		columnsSettings?: string;
		/** Toolbar menu item that refreshes the table. Default: "Refresh" */
		refresh?: string;
		/** Fallback header for the row actions column. Default: "Actions" */
		actions?: string;
		/** Builds the error detail text shown under the error title. Default: the raw message. */
		errorPrefix?: (message: string) => string;
		/** Heading of the error state. Default: "Couldn't load data" */
		errorTitle?: string;
		/** Retry button label for error and append-error states. Default: "Retry" */
		retry?: string;
		/** Empty-state heading when there are no rows. Default: "No data available" */
		empty?: string;
		/** Optional supporting text under the empty-state heading. Default: "" */
		emptyDescription?: string;
		/** Empty-state text when a search returns no rows. Default: `No results for "${query}"` */
		noResults?: (query: string) => string;
		/** Group heading used when `groupBy` resolves to an empty value. Default: "Ungrouped" */
		ungrouped?: string;
		/** Fallback message when an initial data load fails. Default: "An error occurred" */
		genericError?: string;
		/** Fallback message when loading additional virtual-scroll rows fails. Default: "Unable to load more rows" */
		loadMoreError?: string;
		/** Builds the group-row count label. Default: count === 1 ? "1 item" : `${count} items` */
		groupCount?: (count: number) => string;
		/** Builds the paged pagination range label. Default: `${from}–${to} of ${total}` */
		paginationRange?: (from: number, to: number, total: number) => string;
		/** Builds the virtual-scroll range label when the total is known. Default: `${from}–${to} of ${total}` */
		virtualRange?: (from: number, to: number, total: number) => string;
		/** Builds the virtual-scroll range label when the total is unknown. Default: `${from}–${to} loaded` */
		virtualRangeLoaded?: (from: number, to: number) => string;
		/** Virtual-scroll meta text when a load was interrupted by an error. Default: "Load interrupted" */
		loadInterrupted?: string;
		/** Virtual-scroll meta text when more rows can be loaded. Default: "Scroll to load more" */
		scrollToLoadMore?: string;
		/** Builds the virtual-scroll meta text when all rows are loaded and total is known. Default: `All ${total} rows loaded` */
		allRowsLoaded?: (total: number) => string;
		/** Virtual-scroll meta text when all loaded rows are visible and total is unknown. Default: "All loaded rows visible" */
		allLoadedVisible?: string;
		/** Aria-label for the previous-page button. Default: "Previous page" */
		previousPage?: string;
		/** Aria-label for the next-page button. Default: "Next page" */
		nextPage?: string;
		/** Builds the "Page X of Y" indicator. Default: `Page ${page} of ${totalPages}` */
		pageOf?: (page: number, totalPages: number) => string;
		/** Explanatory copy at the top of the column-settings dialog. Default: "Choose which columns are visible for this grid." */
		columnSettingsCopy?: string;
		/** Aria-label for the column-settings checkbox group. Default: "Visible columns" */
		visibleColumns?: string;
		/** Warning shown when no columns are selected in the dialog. Default: "Select at least one column before saving." */
		selectAtLeastOne?: string;
		/** Column-settings dialog close button. Default: "Close" */
		close?: string;
		/** Column-settings dialog reset button. Default: "Reset to default" */
		resetToDefault?: string;
		/** Column-settings dialog save button. Default: "Save" */
		save?: string;
	}

	const DEFAULT_LABELS: Required<CwDataTableLabels> = {
		searchPlaceholder: "Search…",
		loading: "Loading…",
		loadingMore: "Loading more rows…",
		noSort: "No sort",
		sortAscOption: (header: string) => `${header} (A-Z)`,
		sortDescOption: (header: string) => `${header} (Z-A)`,
		pageSizeOption: (n: number) => `${n} rows`,
		pageSizeBatchOption: (n: number) => `${n} rows/batch`,
		toolbarMenu: "Open table options",
		columnsSettings: "Column settings",
		refresh: "Refresh",
		actions: "Actions",
		errorPrefix: (message: string) => message,
		errorTitle: "Couldn't load data",
		retry: "Retry",
		empty: "No data available",
		emptyDescription: "",
		noResults: (query: string) => `No results for “${query}”`,
		ungrouped: "Ungrouped",
		genericError: "An error occurred",
		loadMoreError: "Unable to load more rows",
		groupCount: (count: number) =>
			count === 1 ? "1 item" : `${count} items`,
		paginationRange: (from: number, to: number, total: number) =>
			`${from}–${to} of ${total}`,
		virtualRange: (from: number, to: number, total: number) =>
			`${from}–${to} of ${total}`,
		virtualRangeLoaded: (from: number, to: number) =>
			`${from}–${to} loaded`,
		loadInterrupted: "Load interrupted",
		scrollToLoadMore: "Scroll to load more",
		allRowsLoaded: (total: number) => `All ${total} rows loaded`,
		allLoadedVisible: "All loaded rows visible",
		previousPage: "Previous page",
		nextPage: "Next page",
		pageOf: (page: number, totalPages: number) =>
			`Page ${page} of ${totalPages}`,
		columnSettingsCopy: "Choose which columns are visible for this grid.",
		visibleColumns: "Visible columns",
		selectAtLeastOne: "Select at least one column before saving.",
		close: "Close",
		resetToDefault: "Reset to default",
		save: "Save",
	};
</script>

<script lang="ts" generics="T">
	import { onDestroy, tick } from "svelte";
	import type { Snippet } from "svelte";
	import type {
		CwColumnDef,
		CwTableQuery,
		CwTableResult,
	} from "../types/index.js";
	import CwButton from "./CwButton.svelte";
	import CwDialog from "./CwDialog.svelte";
	import CwDropdown from "./CwDropdown.svelte";
	import CwSpinner from "./CwSpinner.svelte";
	import CwSearchInput from "./CwSearchInput.svelte";
	import moreVertIcon from "../icons/more_vert.svg?raw";
	import { getCwViewSize, isCwPhoneView } from "../utils/cwViewSize.js";
	import { formatCwNumber, isCwFiniteNumber } from "../utils/cwFormat.js";

	type CwTableSort = { column: string; direction: "asc" | "desc" } | null;
	type CwTableFilters = Record<string, string[]>;
	type CwTableGroupValue = string | number | boolean | null | undefined;
	type CwTableGroupBy<T> =
		| (keyof T & string)
		| ((row: T) => CwTableGroupValue);
	type CwTableGroupedRow<T> = { row: T; rowIndex: number };
	type CwTableGroup<T> = {
		key: string;
		label: string;
		rows: CwTableGroupedRow<T>[];
	};

	interface Props {
		columns: CwColumnDef<T>[];
		loadData: (query: CwTableQuery) => Promise<CwTableResult<T>>;
		rowKey: keyof T & string;
		/** Native id placed on the table's root container element. */
		id?: string;
		/** When true, shows skeleton rows in the table body (the toolbar stays mounted). */
		loading?: boolean;
		onRowClick?: (row: T) => void;
		/** Fired when the user moves to the next page from the pagination controls. */
		onPageNext?: () => void;
		/** Fired when the user moves to the previous page from the pagination controls. */
		onPagePrevious?: () => void;
		/** Fired when the page size changes. */
		onPageSizeChanged?: (pageSize: number) => void;
		/** Fired when sorting changes. Receives null when sort is cleared. */
		onSort?: (
			sort: { column: string; direction: "asc" | "desc" } | null,
		) => void;
		/** Fired when the search text changes. */
		onSearch?: (query: string) => void;
		/** Fired when the built-in Refresh menu action is selected. */
		onRefresh?: () => void | Promise<void>;
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
		/** Groups rows by a row key or callback. Group headers only render in non-virtual mode. */
		groupBy?: CwTableGroupBy<T>;
		/** Label shown when `groupBy` resolves to an empty value. */
		ungroupedLabel?: string;
		/** Storage key used for persisted column visibility. Defaults to the current page path plus `_grid`. */
		gridId?: string;
		/** When true, fills parent height and makes the table body region scroll on overflow. */
		fillParent?: boolean;
		/**
		 * Caps the table body height (CSS length) and scrolls inside it. The column header
		 * only sticks while scrolling inside the table — i.e. with `maxHeight`, `fillParent`
		 * or `virtualScroll`; it cannot stick to the page scroll because the table scrolls
		 * horizontally.
		 */
		maxHeight?: string;
		/** Row density. `compact` reduces cell padding. Default: "default" */
		density?: "default" | "compact";
		/**
		 * Default alignment for columns without `align` (numeric columns default to right).
		 * Default: "center" (kept for backwards compatibility).
		 */
		columnAlign?: "left" | "center" | "right";
		/** When true, incrementally loads pages while only rendering the visible row window. */
		virtualScroll?: boolean;
		/** Scroll viewport height used when `virtualScroll` is enabled without `fillParent`. */
		virtualScrollHeight?: string;
		/** Estimated row height in pixels for virtual scrolling calculations. */
		virtualRowHeight?: number;
		/** Number of extra rows rendered above and below the viewport for smoother touch scrolling. */
		virtualOverscan?: number;
		/** Override display labels for i18n. Individual text props (e.g. `ungroupedLabel`, `rowActionsHeader`) take precedence. */
		labels?: CwDataTableLabels;
		class?: string;
	}

	let {
		columns,
		loadData,
		rowKey,
		id,
		loading = false,
		onRowClick,
		onPageNext,
		onPagePrevious,
		onPageSizeChanged,
		onSort,
		onSearch,
		onRefresh,
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
		rowActionsHeader = "",
		rowTextSizeKey,
		groupBy,
		ungroupedLabel,
		gridId,
		fillParent = false,
		maxHeight,
		density = "default",
		columnAlign = "center",
		virtualScroll = false,
		virtualScrollHeight = "28rem",
		virtualRowHeight = 52,
		virtualOverscan = 12,
		labels = {},
		class: className = "",
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });

	const uid = $props.id();

	/** Stringified value for the dropdown (CwDropdown uses string values) */
	let pageSizeStr = $derived(String(pageSize));

	let rows = $state.raw<T[]>([]);
	let total = $state(0);
	let totalKnown = $state(false);
	let page = $state(1);
	let search = $state("");
	let appliedSearch = $state("");
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
	let containerWidth = $state(0);
	let scrollRef = $state<HTMLDivElement | null>(null);
	let toolbarMenuOpen = $state(false);
	let toolbarMenuRef = $state<HTMLDivElement | null>(null);
	let toolbarMenuListRef = $state<HTMLDivElement | null>(null);
	let columnSettingsOpen = $state(false);
	let resolvedGridId = $state("datatable_grid");
	let appliedVisibleColumnKeys = $state<string[] | null>(null);
	let draftVisibleColumnKeys = $state<string[] | null>(null);

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let requestVersion = 0;
	let lastResetKey = "";
	let lastQueryKey = "";
	let lastColumnSettingsLoadKey = "";

	/** Total column count including the optional actions column (for colspan) */
	const defaultVisibleColumnKeys = $derived(columns.map((col) => col.key));
	const resolvedVisibleColumnKeys = $derived(
		appliedVisibleColumnKeys ?? defaultVisibleColumnKeys,
	);
	const visibleColumnKeys = $derived(new Set(resolvedVisibleColumnKeys));
	const visibleColumns = $derived(
		columns.filter((col) => visibleColumnKeys.has(col.key)),
	);
	const colCount = $derived(visibleColumns.length + (rowActions ? 1 : 0));
	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	const normalizedFilters = $derived.by(() => sanitizeFilters(filters));
	const sortableColumns = $derived(
		visibleColumns.filter((col) => col.sortable),
	);
	const mobileSortOptions = $derived([
		{ label: l.noSort, value: "" },
		...sortableColumns.flatMap((col) => [
			{ label: l.sortAscOption(col.header), value: `${col.key}:asc` },
			{ label: l.sortDescOption(col.header), value: `${col.key}:desc` },
		]),
	]);
	const mobileSortValue = $derived(
		sort ? `${sort.column}:${sort.direction}` : "",
	);
	const viewSize = $derived.by(() =>
		containerWidth > 0 ? getCwViewSize(containerWidth) : null,
	);
	const isPhoneView = $derived(
		containerWidth > 0 && isCwPhoneView(containerWidth),
	);
	const effectiveVirtualRowHeight = $derived(
		isPhoneView
			? Math.max(virtualRowHeight, 112)
			: Math.max(virtualRowHeight, 1),
	);
	const effectiveViewportHeight = $derived(
		Math.max(0, viewportHeight - headerHeight),
	);
	const bodyScrollTop = $derived(virtualScroll ? scrollTop : 0);
	const visibleRowCapacity = $derived(
		virtualScroll
			? Math.max(
					1,
					Math.ceil(
						(effectiveViewportHeight || effectiveVirtualRowHeight) /
							effectiveVirtualRowHeight,
					),
				)
			: rows.length,
	);
	const virtualStartIndex = $derived(
		virtualScroll
			? Math.max(
					0,
					Math.floor(bodyScrollTop / effectiveVirtualRowHeight) -
						virtualOverscan,
				)
			: 0,
	);
	const virtualEndIndex = $derived(
		virtualScroll
			? Math.min(
					rows.length,
					Math.max(
						0,
						Math.ceil(
							(bodyScrollTop + effectiveViewportHeight) /
								effectiveVirtualRowHeight,
						),
					) + virtualOverscan,
				)
			: rows.length,
	);
	const visibleRows = $derived(
		virtualScroll ? rows.slice(virtualStartIndex, virtualEndIndex) : rows,
	);
	const groupingEnabled = $derived(!virtualScroll && groupBy != null);
	const groupedRows = $derived.by(() => {
		if (!groupBy || virtualScroll) return [] as CwTableGroup<T>[];

		const groups = new Map<string, CwTableGroup<T>>();

		rows.forEach((row, rowIndex) => {
			const rawGroup =
				typeof groupBy === "function"
					? groupBy(row)
					: ((row as Record<string, unknown>)[
							groupBy
						] as CwTableGroupValue);
			const normalizedGroup =
				typeof rawGroup === "string"
					? rawGroup.trim()
					: rawGroup == null
						? ""
						: String(rawGroup);
			const label = normalizedGroup || (ungroupedLabel ?? l.ungrouped);
			const existingGroup = groups.get(label);

			if (existingGroup) {
				existingGroup.rows.push({ row, rowIndex });
				return;
			}

			groups.set(label, {
				key: label,
				label,
				rows: [{ row, rowIndex }],
			});
		});

		return Array.from(groups.values());
	});
	const topSpacerHeight = $derived(
		virtualScroll ? virtualStartIndex * effectiveVirtualRowHeight : 0,
	);
	const bottomSpacerHeight = $derived(
		virtualScroll
			? Math.max(
					0,
					(rows.length - virtualEndIndex) * effectiveVirtualRowHeight,
				)
			: 0,
	);
	const virtualPrefetchThreshold = $derived(
		Math.max(visibleRowCapacity, virtualOverscan * 2),
	);
	const rangeStart = $derived(
		rows.length === 0
			? 0
			: virtualScroll
				? virtualStartIndex + 1
				: (page - 1) * pageSize + 1,
	);
	const rangeEnd = $derived(
		rows.length === 0
			? 0
			: virtualScroll
				? Math.min(rows.length, virtualEndIndex)
				: Math.min(page * pageSize, total),
	);
	const toolbarActionsSnippet = $derived(actionsHeader ?? toolbarActions);
	const isBusy = $derived(loading || loadingState);
	const showSkeleton = $derived(
		loading || (loadingState && rows.length === 0 && !error),
	);
	const skeletonRowCount = $derived(
		Math.max(1, Math.min(pageSize, 6)),
	);
	const canSaveColumnSettings = $derived(
		(draftVisibleColumnKeys ?? defaultVisibleColumnKeys).length > 0,
	);

	function sanitizeFilters(
		nextFilters: CwTableFilters | undefined,
	): CwTableFilters {
		if (!nextFilters) return {};
		const entries = Object.entries(nextFilters)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(
				([key, values]) =>
					[
						key,
						Array.isArray(values)
							? values.filter(
									(value): value is string =>
										typeof value === "string" &&
										value.trim().length > 0,
								)
							: [],
					] as const,
			)
			.filter(([, values]) => values.length > 0);

		return Object.fromEntries(entries);
	}

	function arraysEqual(left: string[], right: string[]): boolean {
		return (
			left.length === right.length &&
			left.every((value, index) => value === right[index])
		);
	}

	function resolveGridStorageKey(nextGridId?: string): string {
		const explicit = nextGridId?.trim();
		if (explicit) return explicit;
		if (typeof window === "undefined") return "datatable_grid";

		const normalizedPath = window.location.pathname
			.split("/")
			.filter(Boolean)
			.map((segment) =>
				segment
					.trim()
					.toLowerCase()
					.replace(/[^a-z0-9_-]+/g, "_")
					.replace(/^_+|_+$/g, ""),
			)
			.filter(Boolean)
			.join("_");

		return `${normalizedPath || "home"}_grid`;
	}

	function orderVisibleColumnKeys(
		keys: string[] | null | undefined,
		options: { fallbackToDefault?: boolean } = {},
	): string[] {
		const fallbackToDefault = options.fallbackToDefault ?? true;
		const requestedKeys = new Set(
			Array.isArray(keys)
				? keys.filter(
						(value): value is string => typeof value === "string",
					)
				: [],
		);
		const orderedKeys = defaultVisibleColumnKeys.filter((key) =>
			requestedKeys.has(key),
		);

		if (orderedKeys.length === 0 && fallbackToDefault) {
			return [...defaultVisibleColumnKeys];
		}

		return orderedKeys;
	}

	function readStoredVisibleColumnKeys(storageKey: string): string[] | null {
		if (typeof window === "undefined") return null;

		try {
			const stored = window.localStorage.getItem(storageKey);
			if (!stored) return null;
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed)
				? parsed.filter(
						(value): value is string => typeof value === "string",
					)
				: null;
		} catch {
			return null;
		}
	}

	function persistVisibleColumnKeys(storageKey: string, keys: string[]) {
		if (typeof window === "undefined") return;

		try {
			if (arraysEqual(keys, defaultVisibleColumnKeys)) {
				window.localStorage.removeItem(storageKey);
				return;
			}

			window.localStorage.setItem(storageKey, JSON.stringify(keys));
		} catch {
			// Ignore storage failures so the table still works in private or restricted contexts.
		}
	}

	function createQueryState(
		pageNumber: number,
		signal: AbortSignal,
	): CwTableQuery {
		return {
			page: pageNumber,
			pageSize,
			search: appliedSearch,
			sort,
			filters: normalizedFilters,
			signal,
		};
	}

	function getResolvedTotal(
		result: CwTableResult<T>,
		loadedCount: number,
	): { total: number; known: boolean } {
		if (typeof totalItems === "number" && Number.isFinite(totalItems)) {
			return { total: Math.max(0, totalItems), known: true };
		}

		if (typeof result.total === "number" && Number.isFinite(result.total)) {
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
		if (
			!Number.isFinite(nextPageSize) ||
			nextPageSize <= 0 ||
			nextPageSize === pageSize
		)
			return;
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

	function getToolbarMenuItems(): HTMLButtonElement[] {
		return toolbarMenuListRef
			? Array.from(
					toolbarMenuListRef.querySelectorAll<HTMLButtonElement>(
						'[role="menuitem"]',
					),
				)
			: [];
	}

	function focusToolbarTrigger() {
		toolbarMenuRef
			?.querySelector<HTMLButtonElement>(".cw-data-table__toolbar-menu-button")
			?.focus();
	}

	function closeToolbarMenu(returnFocus = false) {
		toolbarMenuOpen = false;
		if (returnFocus) focusToolbarTrigger();
	}

	function handleToolbarMenuKeydown(e: KeyboardEvent) {
		const items = getToolbarMenuItems();
		if (items.length === 0) return;
		const index = items.indexOf(document.activeElement as HTMLButtonElement);

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				items[(index + 1) % items.length].focus();
				break;
			case "ArrowUp":
				e.preventDefault();
				items[(index - 1 + items.length) % items.length].focus();
				break;
			case "Home":
				e.preventDefault();
				items[0].focus();
				break;
			case "End":
				e.preventDefault();
				items[items.length - 1].focus();
				break;
			case "Escape":
				e.preventDefault();
				closeToolbarMenu(true);
				break;
			case "Tab":
				closeToolbarMenu();
				break;
		}
	}

	function applySort(nextSort: CwTableSort) {
		sort = nextSort;
		page = 1;
		appendError = null;
		if (virtualScroll) resetVirtualViewport();
		onSort?.(sort);
	}

	function handleSort(col: CwColumnDef<T>) {
		if (!col.sortable) return;

		const nextSort: CwTableSort =
			sort?.column === col.key
				? sort.direction === "asc"
					? { column: col.key, direction: "desc" }
					: null
				: { column: col.key, direction: "asc" };

		applySort(nextSort);
	}

	function handleMobileSortChange(value: string) {
		if (value === mobileSortValue) return;
		if (!value) {
			applySort(null);
			return;
		}

		const [column, direction] = value.split(":");
		if (
			(direction !== "asc" && direction !== "desc") ||
			!sortableColumns.some((col) => col.key === column)
		) {
			return;
		}

		applySort({ column, direction });
	}

	async function toggleToolbarMenu() {
		toolbarMenuOpen = !toolbarMenuOpen;
		if (!toolbarMenuOpen) return;
		await tick();
		getToolbarMenuItems()[0]?.focus();
	}

	function handleDocumentPointerDown(e: PointerEvent) {
		if (toolbarMenuRef && !toolbarMenuRef.contains(e.target as Node)) {
			closeToolbarMenu();
		}
	}

	function openColumnSettings() {
		toolbarMenuOpen = false;
		draftVisibleColumnKeys = [...resolvedVisibleColumnKeys];
		columnSettingsOpen = true;
	}

	function handleColumnSettingsClose() {
		columnSettingsOpen = false;
		draftVisibleColumnKeys = [...resolvedVisibleColumnKeys];
	}

	function toggleDraftColumnVisibility(columnKey: string) {
		const currentDraftVisibleColumnKeys =
			draftVisibleColumnKeys ?? defaultVisibleColumnKeys;

		if (currentDraftVisibleColumnKeys.includes(columnKey)) {
			draftVisibleColumnKeys = orderVisibleColumnKeys(
				currentDraftVisibleColumnKeys.filter(
					(key) => key !== columnKey,
				),
				{ fallbackToDefault: false },
			);
			return;
		}

		draftVisibleColumnKeys = orderVisibleColumnKeys(
			[...currentDraftVisibleColumnKeys, columnKey],
			{
				fallbackToDefault: false,
			},
		);
	}

	function resetColumnSettingsDraft() {
		draftVisibleColumnKeys = [...defaultVisibleColumnKeys];
	}

	function saveColumnSettings() {
		const nextVisibleColumnKeys = orderVisibleColumnKeys(
			draftVisibleColumnKeys ?? defaultVisibleColumnKeys,
		);
		appliedVisibleColumnKeys = [...nextVisibleColumnKeys];
		draftVisibleColumnKeys = [...nextVisibleColumnKeys];
		persistVisibleColumnKeys(resolvedGridId, nextVisibleColumnKeys);
		columnSettingsOpen = false;

		if (sort && !nextVisibleColumnKeys.includes(sort.column)) {
			applySort(null);
		}
	}

	async function refreshTable() {
		toolbarMenuOpen = false;

		try {
			await onRefresh?.();
		} catch {
			// Ignore external callback failures so the built-in refresh still runs.
		}

		if (virtualScroll) {
			await fetchVirtualData();
			return;
		}

		await fetchPageData(page);
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
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onRowClick?.(row);
		}
	}

	function handleScroll() {
		scrollTop = scrollRef?.scrollTop ?? 0;
	}

	function getVirtualAppendAnchor(): {
		distanceFromBottom: number;
		shouldRestoreFromBottom: boolean;
	} | null {
		if (!virtualScroll || !scrollRef) return null;

		const maxScrollTop = Math.max(
			scrollRef.scrollHeight - scrollRef.clientHeight,
			0,
		);
		const distanceFromBottom = Math.max(
			0,
			maxScrollTop - scrollRef.scrollTop,
		);
		const restoreThreshold = effectiveVirtualRowHeight * 2;

		return {
			distanceFromBottom,
			shouldRestoreFromBottom: distanceFromBottom <= restoreThreshold,
		};
	}

	async function restoreVirtualAppendAnchor(
		anchor: {
			distanceFromBottom: number;
			shouldRestoreFromBottom: boolean;
		} | null,
	) {
		if (!anchor?.shouldRestoreFromBottom) return;

		await tick();

		if (!scrollRef) return;

		const maxScrollTop = Math.max(
			scrollRef.scrollHeight - scrollRef.clientHeight,
			0,
		);
		scrollRef.scrollTop = Math.max(
			0,
			maxScrollTop - anchor.distanceFromBottom,
		);
		scrollTop = scrollRef.scrollTop;
	}

	function getCellValue(row: T, col: CwColumnDef<T>): string {
		if (col.cell) return col.cell(row);
		const val = (row as Record<string, unknown>)[col.key];
		if (col.numeric && isCwFiniteNumber(val)) {
			return formatCwNumber(val, { decimals: col.decimals });
		}
		return val != null ? String(val) : "";
	}

	function getColumnAlign(col: CwColumnDef<T>): "left" | "center" | "right" {
		return col.align ?? (col.numeric ? "right" : columnAlign);
	}

	function getRowTextSize(row: T): string | undefined {
		if (!rowTextSizeKey) return undefined;
		const val = (row as Record<string, unknown>)[rowTextSizeKey];
		if (typeof val === "number") return `${val}px`;
		return typeof val === "string" && val.trim() ? val : undefined;
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
			if (err instanceof DOMException && err.name === "AbortError")
				return;
			if (version !== requestVersion) return;
			error = err instanceof Error ? err.message : l.genericError;
			rows = [];
			total =
				typeof totalItems === "number" && Number.isFinite(totalItems)
					? Math.max(0, totalItems)
					: 0;
			totalKnown =
				typeof totalItems === "number" && Number.isFinite(totalItems);
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
			if (err instanceof DOMException && err.name === "AbortError")
				return;
			if (version !== requestVersion) return;
			error = err instanceof Error ? err.message : l.genericError;
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
		if (!virtualScroll || loadingState || appendingState || !hasMoreRows)
			return;

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
			if (err instanceof DOMException && err.name === "AbortError")
				return;
			if (version !== requestVersion) return;
			appendError =
				err instanceof Error ? err.message : l.loadMoreError;
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
		gridId;
		defaultVisibleColumnKeys;
		const nextResolvedGridId = resolveGridStorageKey(gridId);
		const loadKey = `${nextResolvedGridId}|${defaultVisibleColumnKeys.join("|")}`;

		if (loadKey === lastColumnSettingsLoadKey) return;
		lastColumnSettingsLoadKey = loadKey;
		resolvedGridId = nextResolvedGridId;

		const storedVisibleColumns =
			readStoredVisibleColumnKeys(nextResolvedGridId);
		const nextVisibleColumnKeys =
			orderVisibleColumnKeys(storedVisibleColumns);

		appliedVisibleColumnKeys = [...nextVisibleColumnKeys];
		draftVisibleColumnKeys = [...nextVisibleColumnKeys];
	});

	$effect(() => {
		const currentSort = sort;
		if (!currentSort) return;
		if (sortableColumns.some((col) => col.key === currentSort.column))
			return;
		applySort(null);
	});

	$effect(() => {
		appliedSearch;
		pageSize;
		sort;
		const filterKey = JSON.stringify(normalizedFilters);
		const resetKey = `${virtualScroll}|${pageSize}|${filterKey}`;
		const sortKey = sort ? `${sort.column}:${sort.direction}` : "";
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
		if (
			loadingState ||
			appendingState ||
			error ||
			appendError ||
			!hasMoreRows
		)
			return;
		if (rows.length === 0) return;
		if (viewportHeight <= 0) return;
		if (rows.length - virtualEndIndex > virtualPrefetchThreshold) return;

		void fetchNextVirtualPage(loadedPageCount + 1);
	});

	$effect(() => {
		if (!toolbarMenuOpen) return;
		document.addEventListener("pointerdown", handleDocumentPointerDown);
		return () =>
			document.removeEventListener(
				"pointerdown",
				handleDocumentPointerDown,
			);
	});

	$effect(() => {
		if (typeof totalItems !== "number" || !Number.isFinite(totalItems))
			return;
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
	{id}
	class="cw-data-table {className}"
	class:cw-data-table--fill-parent={fillParent}
	class:cw-data-table--virtual={virtualScroll}
	class:cw-data-table--compact={density === "compact"}
	data-view-size={viewSize ?? undefined}
	bind:clientWidth={containerWidth}
>
	{#snippet renderDataRow(row: T, rowIndex: number)}
		{@const rowLoading = isRowLoading(row)}
		<!--
			Clickable rows keep native row semantics (no role override) so screen
			readers still announce cells; they are focusable and activate with
			Enter/Space.
		-->
		<tr
			class="cw-data-table__row"
			class:cw-data-table__row--even={rowIndex % 2 === 1}
			class:cw-data-table__row--clickable={!!onRowClick}
			class:cw-data-table__row--loading={rowLoading}
			aria-busy={rowLoading || undefined}
			onclick={onRowClick ? () => handleRowClick(row) : undefined}
			onkeydown={onRowClick ? (e) => handleRowKeydown(e, row) : undefined}
			tabindex={onRowClick ? 0 : undefined}
			style:font-size={getRowTextSize(row)}
		>
			{#each visibleColumns as col (col.key)}
				{@const value = getCellValue(row, col)}
				<td
					class="cw-data-table__td"
					class:cw-data-table__td--hide-sm={col.hideBelow === "sm"}
					class:cw-data-table__td--hide-md={col.hideBelow === "md"}
					class:cw-data-table__td--hide-lg={col.hideBelow === "lg"}
					class:cw-data-table__td--sorted={sort?.column === col.key}
					class:cw-data-table__td--numeric={col.numeric}
					class:cw-data-table__td--truncate={col.truncate}
					data-label={col.header}
					style:text-align={getColumnAlign(col)}
					style:max-width={col.truncate ? (col.width ?? "16rem") : undefined}
					title={col.truncate && !cell ? value : undefined}
				>
					{#if cell}
						{@render cell(row, col, value)}
					{:else if col.truncate}
						<span class="cw-data-table__truncate">{value}</span>
					{:else}
						{value}
					{/if}
				</td>
			{/each}
			{#if rowActions}
				<td
					class="cw-data-table__td cw-data-table__td--actions"
					data-label={rowActionsHeader || l.actions}
					style:text-align="right"
				>
					<div class="cw-data-table__action-slot">
						{@render rowActions(row)}
					</div>
				</td>
			{/if}
		</tr>
	{/snippet}

	{#snippet sortIcon(direction: "asc" | "desc" | null)}
		<svg
			class="cw-data-table__sort-icon"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M5 6.5 8 3.5l3 3"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				opacity={direction === "desc" ? 0.3 : 1}
			/>
			<path
				d="M5 9.5 8 12.5l3-3"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				opacity={direction === "asc" ? 0.3 : 1}
			/>
		</svg>
	{/snippet}

	<div class="cw-data-table__toolbar">
		{#if searchable}
			<div class="cw-data-table__search-wrapper">
				<CwSearchInput
					value={search}
					placeholder={l.searchPlaceholder}
					oninput={handleSearch}
					debounceMs={0}
				/>
			</div>
		{/if}

		<span class="cw-data-table__toolbar-spacer"></span>

		<div class="cw-data-table__toolbar-end">
			{#if sortableColumns.length > 0}
				<div class="cw-data-table__mobile-sort">
					<CwDropdown
						options={mobileSortOptions}
						value={mobileSortValue}
						onchange={handleMobileSortChange}
					/>
				</div>
			{/if}

			<div class="cw-data-table__page-size">
				<CwDropdown
					options={pageSizeOptions.map((n) => ({
						label: virtualScroll
							? l.pageSizeBatchOption(n)
							: l.pageSizeOption(n),
						value: String(n),
					}))}
					value={pageSizeStr}
					onchange={handlePageSizeChange}
				/>
			</div>

			<div class="cw-data-table__toolbar-actions">
				{#if toolbarActionsSnippet}
					{@render toolbarActionsSnippet()}
				{/if}
			</div>
			<div class="cw-data-table__toolbar-menu" bind:this={toolbarMenuRef}>
				<CwButton
					variant="ghost"
					size="sm"
					type="button"
					aria-label={l.toolbarMenu}
					aria-expanded={toolbarMenuOpen}
					aria-haspopup="menu"
					aria-controls={`${uid}-toolbar-menu`}
					class="cw-data-table__toolbar-menu-button"
					onclick={toggleToolbarMenu}
				>
					<span
						class="cw-data-table__toolbar-menu-icon"
						aria-hidden="true"
					>
						{@html moreVertIcon}
					</span>
				</CwButton>

				{#if toolbarMenuOpen}
					<div
						bind:this={toolbarMenuListRef}
						class="cw-data-table__toolbar-menu-dropdown"
						id={`${uid}-toolbar-menu`}
						role="menu"
						tabindex="-1"
						aria-label={l.toolbarMenu}
						onkeydown={handleToolbarMenuKeydown}
					>
						<button
							type="button"
							class="cw-data-table__toolbar-menu-item"
							role="menuitem"
							tabindex="-1"
							onclick={openColumnSettings}
						>
							{l.columnsSettings}
						</button>
						<button
							type="button"
							class="cw-data-table__toolbar-menu-item"
							role="menuitem"
							tabindex="-1"
							onclick={refreshTable}
						>
							{l.refresh}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div
		bind:this={scrollRef}
		bind:clientHeight={viewportHeight}
		class="cw-data-table__scroll"
		class:cw-data-table__scroll--virtual={virtualScroll}
		class:cw-data-table__scroll--capped={!!maxHeight && !virtualScroll}
		onscroll={handleScroll}
		style:max-height={virtualScroll && !fillParent
			? virtualScrollHeight
			: !fillParent
				? maxHeight
				: undefined}
	>
		<table class="cw-data-table__table" aria-busy={isBusy || undefined}>
			<thead bind:offsetHeight={headerHeight}>
				<tr>
					{#each visibleColumns as col (col.key)}
						{@const colAlign = getColumnAlign(col)}
						<th
							scope="col"
							class="cw-data-table__th"
							class:cw-data-table__th--sortable={col.sortable}
							class:cw-data-table__th--hide-sm={col.hideBelow === "sm"}
							class:cw-data-table__th--hide-md={col.hideBelow === "md"}
							class:cw-data-table__th--hide-lg={col.hideBelow === "lg"}
							class:cw-data-table__th--sorted={sort?.column === col.key}
							style:width={col.width}
							style:text-align={colAlign}
							aria-sort={col.sortable
								? sort?.column === col.key
									? sort.direction === "asc"
										? "ascending"
										: "descending"
									: "none"
								: undefined}
						>
							{#if col.sortable}
								<button
									type="button"
									class="cw-data-table__sort-btn"
									class:cw-data-table__sort-btn--left={colAlign === "left"}
									class:cw-data-table__sort-btn--right={colAlign === "right"}
									onclick={() => handleSort(col)}
								>
									{col.header}
									{@render sortIcon(
										sort?.column === col.key ? sort.direction : null,
									)}
								</button>
							{:else}
								{col.header}
							{/if}
						</th>
					{/each}
					{#if rowActions}
						<th
							scope="col"
							class="cw-data-table__th cw-data-table__th--actions"
							style:text-align="right"
						>
							{rowActionsHeader}
						</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if showSkeleton}
					{#each { length: skeletonRowCount }, index (index)}
						<tr class="cw-data-table__row cw-data-table__row--skeleton" aria-hidden="true">
							{#each visibleColumns as col (col.key)}
								<td
									class="cw-data-table__td"
									class:cw-data-table__td--hide-sm={col.hideBelow === "sm"}
									class:cw-data-table__td--hide-md={col.hideBelow === "md"}
									class:cw-data-table__td--hide-lg={col.hideBelow === "lg"}
									style:text-align={getColumnAlign(col)}
								>
									<span
										class="cw-data-table__skeleton"
										style:width={`${55 + ((index * 17 + col.key.length * 7) % 40)}%`}
									></span>
								</td>
							{/each}
							{#if rowActions}
								<td class="cw-data-table__td cw-data-table__td--actions">
									<span class="cw-data-table__skeleton cw-data-table__skeleton--action"></span>
								</td>
							{/if}
						</tr>
					{/each}
				{:else if error}
					<tr>
						<td colspan={colCount} class="cw-data-table__status">
							{#if errorState}
								{@render errorState(error)}
							{:else}
								<div class="cw-data-table__state cw-data-table__state--error" role="alert">
									<svg class="cw-data-table__state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
										<path d="M12 7.5v5.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
										<circle cx="12" cy="16.25" r="1.1" fill="currentColor" />
									</svg>
									<p class="cw-data-table__state-title">{l.errorTitle}</p>
									<p class="cw-data-table__state-body">{l.errorPrefix(error)}</p>
									<CwButton
										variant="secondary"
										size="sm"
										onclick={() =>
											virtualScroll
												? fetchVirtualData()
												: fetchPageData(page)}
									>
										{l.retry}
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
								<div class="cw-data-table__state">
									<svg class="cw-data-table__state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
										<path d="M3.5 9.5h17M9 9.5V19" stroke="currentColor" stroke-width="1.5" />
									</svg>
									<p class="cw-data-table__state-title">
										{appliedSearch.trim() ? l.noResults(appliedSearch.trim()) : l.empty}
									</p>
									{#if l.emptyDescription && !appliedSearch.trim()}
										<p class="cw-data-table__state-body">{l.emptyDescription}</p>
									{/if}
								</div>
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

					{#if groupingEnabled}
						{#each groupedRows as group (group.key)}
							<tr class="cw-data-table__group-row">
								<th
									colspan={colCount}
									scope="colgroup"
									class="cw-data-table__group-cell"
								>
									<div class="cw-data-table__group-heading">
										<span class="cw-data-table__group-label">
											{group.label}
										</span>
										<span class="cw-data-table__group-count">
											{l.groupCount(group.rows.length)}
										</span>
									</div>
								</th>
							</tr>

							{#each group.rows as entry (entry.row[rowKey])}
								{@render renderDataRow(entry.row, entry.rowIndex)}
							{/each}
						{/each}
					{:else}
						{#each visibleRows as row, visibleIndex (row[rowKey])}
							{@const rowIndex = virtualScroll
								? virtualStartIndex + visibleIndex
								: visibleIndex}
							{@render renderDataRow(row, rowIndex)}
						{/each}
					{/if}

					{#if virtualScroll && appendingState}
						<tr class="cw-data-table__append-row">
							<td colspan={colCount} class="cw-data-table__append-cell">
								<div class="cw-data-table__append-status" role="status">
									<CwSpinner size="sm" />
									{l.loadingMore}
								</div>
							</td>
						</tr>
					{/if}

					{#if virtualScroll && appendError}
						<tr class="cw-data-table__append-row">
							<td colspan={colCount} class="cw-data-table__append-cell">
								<div class="cw-data-table__append-error" role="alert">
									<span>{appendError}</span>
									<CwButton
										variant="secondary"
										size="sm"
										onclick={retryVirtualAppend}
									>
										{l.retry}
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

	{#if isBusy}
		<span class="cw-data-table__sr-status" role="status">{l.loading}</span>
	{/if}

	{#if !loading && virtualScroll && rows.length > 0}
		<div class="cw-data-table__pagination cw-data-table__pagination--virtual">
			<span class="cw-data-table__page-info">
				{#if totalKnown}
					{l.virtualRange(rangeStart, rangeEnd, total)}
				{:else}
					{l.virtualRangeLoaded(rangeStart, rangeEnd)}
				{/if}
			</span>
			<span class="cw-data-table__virtual-meta">
				{#if appendError}
					{l.loadInterrupted}
				{:else if hasMoreRows}
					{l.scrollToLoadMore}
				{:else if totalKnown}
					{l.allRowsLoaded(total)}
				{:else}
					{l.allLoadedVisible}
				{/if}
			</span>
		</div>
	{:else if !loading && !virtualScroll && totalPages > 1}
		<div class="cw-data-table__pagination">
			<span class="cw-data-table__page-info">
				{l.paginationRange(rangeStart, rangeEnd, total)}
			</span>
			<div class="cw-data-table__page-controls">
				<CwButton
					variant="secondary"
					size="sm"
					disabled={page <= 1}
					onclick={handlePreviousPage}
					aria-label={l.previousPage}
				>
					<svg class="cw-data-table__page-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M10 4l-4 4 4 4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</CwButton>
				<span class="cw-data-table__page-num">{l.pageOf(page, totalPages)}</span>
				<CwButton
					variant="secondary"
					size="sm"
					disabled={page >= totalPages}
					onclick={handleNextPage}
					aria-label={l.nextPage}
				>
					<svg class="cw-data-table__page-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M6 4l4 4-4 4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</CwButton>
			</div>
		</div>
	{/if}

	{#if !loading && !virtualScroll && loadingState && rows.length > 0}
		<div class="cw-data-table__overlay" aria-hidden="true"></div>
	{/if}

	<CwDialog
		bind:open={columnSettingsOpen}
		title={l.columnsSettings}
		onclose={handleColumnSettingsClose}
	>
		{#snippet children()}
			<div class="cw-data-table__column-settings-dialog">
				<p class="cw-data-table__column-settings-copy">
					{l.columnSettingsCopy}
				</p>

				<div
					class="cw-data-table__column-settings-list"
					role="group"
					aria-label={l.visibleColumns}
				>
					{#each columns as col (col.key)}
						<label
							class="cw-data-table__column-settings-item"
							for={`${uid}-column-${col.key}`}
						>
							<input
								id={`${uid}-column-${col.key}`}
								type="checkbox"
								class="cw-data-table__column-settings-checkbox"
								checked={(
									draftVisibleColumnKeys ??
									defaultVisibleColumnKeys
								).includes(col.key)}
								onchange={() =>
									toggleDraftColumnVisibility(col.key)}
							/>
							<span class="cw-data-table__column-settings-name"
								>{col.header}</span
							>
						</label>
					{/each}
				</div>

				{#if !canSaveColumnSettings}
					<p class="cw-data-table__column-settings-warning" role="status">
						{l.selectAtLeastOne}
					</p>
				{/if}
			</div>
		{/snippet}

		{#snippet actions()}
			<CwButton
				variant="ghost"
				size="sm"
				type="button"
				onclick={handleColumnSettingsClose}
			>
				{l.close}
			</CwButton>
			<CwButton
				variant="secondary"
				size="sm"
				type="button"
				onclick={resetColumnSettingsDraft}
			>
				{l.resetToDefault}
			</CwButton>
			<CwButton
				size="sm"
				type="button"
				disabled={!canSaveColumnSettings}
				onclick={saveColumnSettings}
			>
				{l.save}
			</CwButton>
		{/snippet}
	</CwDialog>
</div>

<style>
	.cw-data-table {
		--cw-datatable-mobile-label-width: 5.5rem;
		--cw-datatable-cell-py: var(--cw-space-3);
		--cw-datatable-cell-px: var(--cw-space-4);
		container-type: inline-size;
		position: relative;
		display: flex;
		flex-direction: column;
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
		overflow: visible;
	}

	.cw-data-table--compact {
		--cw-datatable-cell-py: var(--cw-space-2);
		--cw-datatable-cell-px: var(--cw-space-3);
	}

	.cw-data-table--fill-parent {
		flex: 1 1 0%;
		height: 100%;
		min-height: 0;
	}

	.cw-data-table__sr-status {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/* ── Toolbar ─────────────────────────────────────────── */

	.cw-data-table__toolbar {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		background-color: var(--cw-bg-surface);
		border-bottom: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-card-radius) var(--cw-card-radius) 0 0;
	}

	.cw-data-table__search-wrapper {
		flex: 1;
		max-width: 24rem;
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

	.cw-data-table__mobile-sort {
		display: none;
		min-width: 8.5rem;
	}

	.cw-data-table__page-size {
		min-width: 7rem;
	}

	.cw-data-table__toolbar-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-data-table__toolbar-menu {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.cw-data-table__toolbar-menu :global(.cw-data-table__toolbar-menu-button) {
		min-width: var(--cw-control-h-sm);
		padding-inline: 0;
	}

	.cw-data-table__toolbar-menu-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
	}

	.cw-data-table__toolbar-menu-icon :global(svg) {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}

	.cw-data-table__toolbar-menu-dropdown {
		position: absolute;
		top: calc(100% + var(--cw-space-1));
		right: 0;
		z-index: var(--cw-z-popover);
		min-width: 12rem;
		padding: var(--cw-space-1);
		background: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
	}

	.cw-data-table__toolbar-menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: var(--cw-option-min-h);
		padding: var(--cw-space-2) var(--cw-space-3);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		cursor: pointer;
		text-align: left;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__toolbar-menu-item:hover,
	.cw-data-table__toolbar-menu-item:focus-visible {
		background-color: var(--cw-option-hover-bg);
	}

	.cw-data-table__toolbar-menu-item:focus-visible {
		outline-offset: -2px;
	}

	/* ── Column settings dialog ─────────────────────────── */

	.cw-data-table__column-settings-dialog {
		display: grid;
		gap: var(--cw-space-4);
	}

	.cw-data-table__column-settings-copy {
		margin: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.cw-data-table__column-settings-list {
		display: grid;
		gap: var(--cw-space-2);
		max-height: min(24rem, 48dvh);
		overflow-y: auto;
		padding-right: var(--cw-space-1);
	}

	.cw-data-table__column-settings-item {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		min-height: var(--cw-control-h-md);
		padding: var(--cw-space-2) var(--cw-space-3);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-control-bg);
		cursor: pointer;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__column-settings-item:hover {
		border-color: var(--cw-control-border-hover);
		background: var(--cw-option-hover-bg);
	}

	.cw-data-table__column-settings-checkbox {
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
		accent-color: var(--cw-accent);
	}

	.cw-data-table__column-settings-name {
		min-width: 0;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
	}

	.cw-data-table__column-settings-warning {
		margin: 0;
		color: var(--cw-tone-danger-text);
		font-size: var(--cw-text-xs);
	}

	/* ── Scroll region / table ───────────────────────────── */

	.cw-data-table__scroll {
		border-radius: 0 0 var(--cw-card-radius) var(--cw-card-radius);
		overflow-x: auto;
		overflow-y: hidden;
	}

	.cw-data-table__scroll--virtual,
	.cw-data-table__scroll--capped,
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
		background-color: transparent;
	}

	.cw-data-table__th {
		position: sticky;
		top: 0;
		z-index: 2;
		padding: var(--cw-datatable-cell-py) var(--cw-datatable-cell-px);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--cw-text-secondary);
		background-color: var(--cw-bg-surface);
		border-bottom: 1px solid var(--cw-border-default);
	}

	.cw-data-table__th--sorted {
		color: var(--cw-text-primary);
	}

	.cw-data-table__sort-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1);
		width: 100%;
		min-height: var(--cw-hit-target-min);
		padding: var(--cw-space-1) var(--cw-space-2);
		margin: calc(var(--cw-space-1) * -1) calc(var(--cw-space-2) * -1);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		color: inherit;
		font: inherit;
		text-transform: inherit;
		letter-spacing: inherit;
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__sort-btn--left {
		justify-content: flex-start;
	}

	.cw-data-table__sort-btn--right {
		justify-content: flex-end;
	}

	.cw-data-table__sort-btn:hover {
		background-color: var(--cw-option-hover-bg);
	}

	.cw-data-table__sort-icon {
		flex-shrink: 0;
		width: 0.875rem;
		height: 0.875rem;
		color: var(--cw-text-muted);
	}

	.cw-data-table__th--sorted .cw-data-table__sort-icon {
		color: var(--cw-accent-text);
	}

	.cw-data-table__td {
		padding: var(--cw-datatable-cell-py) var(--cw-datatable-cell-px);
		color: var(--cw-datatable-row-text);
		border-bottom: 1px solid var(--cw-border-muted);
		vertical-align: middle;
		background-color: transparent;
		font-variant-numeric: tabular-nums;
	}

	.cw-data-table__td--numeric {
		white-space: nowrap;
	}

	.cw-data-table__td--truncate {
		overflow: hidden;
	}

	.cw-data-table__truncate {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-data-table__td--sorted {
		background-color: color-mix(in srgb, var(--cw-accent) 6%, transparent);
	}

	/* ── Rows ────────────────────────────────────────────── */

	.cw-data-table__row {
		color: var(--cw-datatable-row-text);
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-data-table__row--even {
		background-color: color-mix(
			in srgb,
			var(--cw-bg-surface) 80%,
			var(--cw-datatable-row-bg-alt) 20%
		);
	}

	.cw-data-table__row--clickable {
		cursor: pointer;
	}

	.cw-data-table__row--clickable:focus-visible {
		outline-offset: calc(var(--cw-focus-ring-width) * -1);
	}

	.cw-data-table__row--clickable:hover > .cw-data-table__td,
	.cw-data-table__row--clickable:focus-visible > .cw-data-table__td {
		background-color: var(--cw-datatable-row-bg-hover);
	}

	.cw-data-table__row--clickable.cw-data-table__row--even:hover > .cw-data-table__td,
	.cw-data-table__row--clickable.cw-data-table__row--even:focus-visible > .cw-data-table__td {
		background-color: var(--cw-datatable-row-bg-alt-hover);
	}

	.cw-data-table__row--clickable:hover > .cw-data-table__td:first-child {
		box-shadow: inset 3px 0 0 var(--cw-accent);
	}

	.cw-data-table__row:last-child .cw-data-table__td {
		border-bottom: none;
	}

	/* Row being refreshed (row.cwloading === true): dim contents + shimmer. */
	.cw-data-table__row--loading > .cw-data-table__td {
		position: relative;
		color: var(--cw-text-muted);
		background-color: var(--cw-bg-muted);
	}

	.cw-data-table__row--loading > .cw-data-table__td::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in srgb, var(--cw-text-primary) 7%, transparent) 50%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: cw-data-table-shimmer 1.4s linear infinite;
	}

	/* ── Skeleton (initial / `loading`) ─────────────────── */

	.cw-data-table__row--skeleton > .cw-data-table__td {
		border-bottom-color: var(--cw-border-muted);
	}

	.cw-data-table__skeleton {
		display: inline-block;
		height: 0.75rem;
		max-width: 100%;
		border-radius: var(--cw-radius-sm);
		vertical-align: middle;
		background: linear-gradient(
			90deg,
			var(--cw-bg-muted) 0%,
			color-mix(in srgb, var(--cw-bg-muted) 70%, var(--cw-text-muted)) 50%,
			var(--cw-bg-muted) 100%
		);
		background-size: 200% 100%;
		animation: cw-data-table-shimmer 1.4s linear infinite;
	}

	.cw-data-table__skeleton--action {
		width: 4rem;
	}

	@keyframes cw-data-table-shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-data-table__skeleton,
		.cw-data-table__row--loading > .cw-data-table__td::after {
			animation: none;
		}
	}

	/* ── Groups ──────────────────────────────────────────── */

	.cw-data-table__group-cell {
		position: relative;
		padding: var(--cw-space-2) var(--cw-datatable-cell-px);
		background-color: var(--cw-header-bg);
		border-bottom: 1px solid var(--cw-border-default);
		text-align: center;
	}

	.cw-data-table__group-heading {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: var(--cw-space-3);
		flex-wrap: wrap;
	}

	.cw-data-table__group-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cw-header-fg);
	}

	.cw-data-table__group-count {
		position: absolute;
		right: var(--cw-datatable-cell-px);
		padding: var(--cw-space-1) var(--cw-space-2);
		border-radius: var(--cw-radius-full);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		line-height: 1;
		color: var(--cw-header-fg);
		background: color-mix(in srgb, var(--cw-header-fg) 16%, transparent);
	}

	/* ── Actions column ─────────────────────────────────── */

	.cw-data-table__th--actions,
	.cw-data-table__td--actions {
		width: 1%;
		white-space: nowrap;
	}

	.cw-data-table__action-slot {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--cw-space-1);
		width: 100%;
		min-width: 0;
		flex-wrap: wrap;
	}

	/* ── Empty / error states ───────────────────────────── */

	.cw-data-table__status {
		padding: var(--cw-space-12) var(--cw-space-4);
		text-align: center;
		color: var(--cw-text-muted);
	}

	.cw-data-table__state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--cw-space-2);
		max-width: 28rem;
		margin-inline: auto;
	}

	.cw-data-table__state-icon {
		width: 2rem;
		height: 2rem;
		margin-bottom: var(--cw-space-1);
		color: var(--cw-text-muted);
	}

	.cw-data-table__state--error .cw-data-table__state-icon {
		color: var(--cw-tone-danger-text);
	}

	.cw-data-table__state-title {
		margin: 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-data-table__state-body {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		overflow-wrap: anywhere;
	}

	/* ── Virtual scroll helpers ─────────────────────────── */

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
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.cw-data-table__append-error {
		color: var(--cw-tone-danger-text);
	}

	/* ── Pagination ─────────────────────────────────────── */

	.cw-data-table__pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		background-color: var(--cw-bg-surface);
		border-top: 1px solid var(--cw-border-muted);
		border-radius: 0 0 var(--cw-card-radius) var(--cw-card-radius);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		font-variant-numeric: tabular-nums;
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

	.cw-data-table__page-icon {
		width: 1rem;
		height: 1rem;
	}

	.cw-data-table__page-num {
		font-variant-numeric: tabular-nums;
	}

	.cw-data-table__overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: inherit;
		background-color: color-mix(in srgb, var(--cw-bg-surface) 60%, transparent);
	}

	/* ── Responsive ─────────────────────────────────────── */

	@container (max-width: 640px) {
		.cw-data-table__th--hide-sm,
		.cw-data-table__td--hide-sm {
			display: none;
		}
	}

	@container (max-width: 768px) {
		.cw-data-table__th--hide-md,
		.cw-data-table__td--hide-md {
			display: none;
		}
	}

	@container (max-width: 1024px) {
		.cw-data-table__th--hide-lg,
		.cw-data-table__td--hide-lg {
			display: none;
		}
	}

	@container (max-width: 640px) {
		.cw-data-table__table {
			--cw-datatable-mobile-label-width: 5rem;
			table-layout: fixed;
		}

		.cw-data-table__toolbar {
			gap: var(--cw-space-2);
			padding: var(--cw-space-2) var(--cw-space-3);
			flex-wrap: wrap;
		}

		.cw-data-table__search-wrapper,
		.cw-data-table__mobile-sort,
		.cw-data-table__page-size,
		.cw-data-table__toolbar-actions {
			max-width: none;
			min-width: 0;
			width: 100%;
		}

		.cw-data-table__toolbar-spacer {
			display: none;
		}

		.cw-data-table__toolbar-end,
		.cw-data-table__pagination {
			width: 100%;
			flex-direction: column;
			align-items: stretch;
		}

		.cw-data-table__toolbar-actions {
			flex-wrap: wrap;
			justify-content: stretch;
		}

		.cw-data-table__page-size {
			display: none;
		}

		.cw-data-table__toolbar-menu {
			margin-left: auto;
		}

		.cw-data-table__toolbar-menu-dropdown {
			left: auto;
			right: 0;
			min-width: min(100%, 12rem);
		}

		.cw-data-table__mobile-sort {
			display: block;
		}

		.cw-data-table__scroll {
			overflow-x: hidden;
			padding-top: var(--cw-space-2);
		}

		.cw-data-table__table thead {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			clip-path: inset(50%);
			white-space: nowrap;
			border: 0;
		}

		.cw-data-table__row {
			display: block;
			margin: 0 var(--cw-space-2) var(--cw-space-2);
			border: 1px solid var(--cw-border-default);
			border-radius: var(--cw-radius-lg);
			overflow: hidden;
			box-shadow: var(--cw-shadow-sm);
		}

		.cw-data-table__row:last-child .cw-data-table__td {
			border-bottom: 1px solid var(--cw-border-muted);
		}

		.cw-data-table__row > .cw-data-table__td:last-child {
			border-bottom: none;
		}

		.cw-data-table__group-row {
			display: block;
			margin: 0 var(--cw-space-2) var(--cw-space-2);
			border-radius: var(--cw-radius-lg);
			overflow: hidden;
		}

		.cw-data-table__group-cell {
			display: block;
			padding: var(--cw-space-2) var(--cw-space-3);
		}

		.cw-data-table__group-heading {
			justify-content: space-between;
		}

		.cw-data-table__group-count {
			position: static;
		}

		.cw-data-table__row > .cw-data-table__td {
			display: grid;
			grid-template-columns:
				minmax(0, var(--cw-datatable-mobile-label-width))
				minmax(0, 1fr);
			gap: var(--cw-space-2);
			align-items: start;
			max-width: none;
			padding: var(--cw-space-2) var(--cw-space-3);
			text-align: left !important;
			white-space: normal;
			word-break: break-word;
			overflow-wrap: anywhere;
		}

		.cw-data-table__row--skeleton > .cw-data-table__td {
			grid-template-columns: minmax(0, 1fr);
		}

		.cw-data-table__row > .cw-data-table__td:first-child {
			box-shadow: none;
		}

		.cw-data-table__row > .cw-data-table__td::before {
			content: attr(data-label);
			color: var(--cw-text-muted);
			font-size: var(--cw-text-xs);
			font-weight: var(--cw-font-semibold);
			line-height: 1.3;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.cw-data-table__row--skeleton > .cw-data-table__td::before {
			content: none;
		}

		.cw-data-table__row > .cw-data-table__td--actions {
			width: auto;
			grid-template-columns: minmax(0, 1fr);
			gap: var(--cw-space-1);
			align-items: start;
			white-space: normal;
			word-break: normal;
			overflow-wrap: normal;
		}

		.cw-data-table__row
			> .cw-data-table__td--actions
			.cw-data-table__action-slot {
			justify-content: flex-start;
		}

		.cw-data-table__status,
		.cw-data-table__append-cell {
			padding: var(--cw-space-8) var(--cw-space-3);
		}

		.cw-data-table__page-controls {
			gap: var(--cw-space-1);
			justify-content: center;
		}

		.cw-data-table__page-info,
		.cw-data-table__page-num,
		.cw-data-table__virtual-meta,
		.cw-data-table__pagination {
			font-size: var(--cw-text-xs);
		}
	}
</style>
