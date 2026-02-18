/* ============================================================
   CropWatch UI — Shared Types
   ============================================================ */

/** Standard tone palette used across chips, toasts, buttons, etc. */
export type CwTone = 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success';

/** Button-specific variants */
export type CwButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';

/** Component size scale */
export type CwSize = 'sm' | 'md' | 'lg';

/** Chip visual variant */
export type CwChipVariant = 'solid' | 'soft' | 'outline';

/* ── DataTable types ───────────────────────────────────── */

export interface CwTableQuery {
	page: number;
	pageSize: number;
	search: string;
	sort: { column: string; direction: 'asc' | 'desc' } | null;
	filters: Record<string, string[]>;
	signal: AbortSignal;
}

export interface CwTableResult<T> {
	rows: T[];
	total: number;
	facets?: Record<string, string[]>;
}

export interface CwColumnDef<T> {
	/** Unique key matching a property on T, or a custom key for rendered-only columns */
	key: string;
	/** Display header text */
	header: string;
	/** Whether this column is sortable */
	sortable?: boolean;
	/** Custom cell renderer — receives the row and returns a string */
	cell?: (row: T) => string;
	/** Column width (CSS value) */
	width?: string;
	/** Text alignment */
	align?: 'left' | 'center' | 'right';
	/** Whether this column should be hidden at small breakpoints */
	hideBelow?: 'sm' | 'md' | 'lg';
}

/* ── Chart types ───────────────────────────────────────── */

/** @deprecated Use CwLineChartDataPoint instead */
export interface CwLineSeries {
	label: string;
	data: { x: number | string; y: number }[];
	color?: string;
}

export interface CwLineChartDataPoint {
	timestamp: string | Date;
	value: number;
	alert?: {
		id: string;
		message: string;
		severity?: 'warning' | 'critical';
	};
}

export interface CwLineChartSecondaryDataPoint {
	timestamp: string | Date;
	value: number;
}

export interface CwDonutSegment {
	label: string;
	value: number;
	color?: string;
}

/* ── Toast types ───────────────────────────────────────── */

export interface CwToastItem {
	id: string;
	tone: CwTone;
	message: string;
	duration: number;
	dismissible: boolean;
}

/* ── DateTimeRange types ───────────────────────────────── */

export type CwDatePickerMode = 'single' | 'range';
export type CwDateGranularity = 'year' | 'month' | 'day';

export interface CwSingleDateValue {
	date: Date;
	time?: { hours: number; minutes: number };
}

export interface CwRangeDateValue {
	start: Date;
	end: Date;
	startTime?: { hours: number; minutes: number };
	endTime?: { hours: number; minutes: number };
}

export type CwDateValue = CwSingleDateValue | CwRangeDateValue;

/* ── ListBox types ─────────────────────────────────────── */

export interface CwListBoxItem<T = string> {
	/** Unique value for this item */
	value: T;
	/** Display label */
	label: string;
	/** Optional short badge text shown left of label (e.g. "SEA", "SA") */
	badge?: string;
	/** Tone for the badge chip (uses CwChip solid variant) */
	badgeTone?: CwTone;
	/** Right-aligned secondary text (e.g. a count like "196") */
	endText?: string;
	/** Whether the item is disabled */
	disabled?: boolean;
}

/* ── ProfileMenu types ─────────────────────────────────── */

export interface CwProfileMenuItem {
	/** Unique identifier */
	id: string;
	/** Display label */
	label: string;
	/** Optional icon key */
	icon?: string;
	/** Visual separator before this item */
	separator?: boolean;
	/** Danger-styled item (e.g. sign-out) */
	danger?: boolean;
}

/* ── Drawer types ──────────────────────────────────────── */

export interface CwDrawerItem {
	/** Unique identifier */
	id: string;
	/** Display label shown in the collapsed bar */
	label: string;
	/** SVG path data for a 16×16 icon (optional) */
	icon?: string;
	/** Tone colour for the icon dot / indicator */
	tone?: CwTone;
}

/* ── SideNav types ─────────────────────────────────────── */

export type CwSideNavMode = 'open' | 'mini' | 'hidden';
export type CwSideNavSide = 'left' | 'right';

export interface CwSideNavItem {
	/** Unique identifier / route href */
	id: string;
	/** Display label (shown in open mode) */
	label: string;
	/** SVG path data for a 16×16 viewBox icon, or raw SVG string */
	icon?: string;
	/** Link href — if provided the item renders as an <a> */
	href?: string;
	/** Whether this item is currently active */
	active?: boolean;
	/** Whether the item is disabled */
	disabled?: boolean;
	/** Visual separator before this item */
	separator?: boolean;
}
