/* ============================================================
   CropWatch UI — Shared Types
   ============================================================ */

import type { Snippet } from 'svelte';

/** Standard tone palette used across chips, toasts, buttons, etc. */
export type CwTone = 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success';

/** Button-specific variants */
export type CwButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';

/** Component size scale */
export type CwSize = 'sm' | 'md' | 'lg';

/** Badge anchor position */
export type CwBadgePosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

/** Status dot semantic state */
export type CwStatusDotStatus = 'online' | 'offline' | 'loading' | 'warning';

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
	/** Optional total row count. Can be omitted when the table receives `totalItems` prop externally. */
	total?: number;
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

export type CwPPFDStatus = 'low' | 'optimal' | 'high';

export interface CwPPFDTick {
	value: number;
	label?: string;
}

export interface CwPPFDReading {
	/** Optional crop or cultivar label shown in the chart header. */
	plant?: string;
	/** Instantaneous PPFD reading in µmol/m²/s. */
	current: number;
	/** Lower bound of the target PPFD band. */
	targetMin: number;
	/** Upper bound of the target PPFD band. */
	targetMax: number;
	/** Optional timestamp as Date, ISO string, or Unix time in seconds/milliseconds. */
	timestamp?: string | Date | number;
	/** Optional DLI value for the current day. */
	dliToday?: number;
}

export type CwVPDStatus = 'low' | 'optimal' | 'high';
export type CwVPDStageBandTone = 'humid' | 'balanced' | 'flower';

export interface CwVPDTick {
	value: number;
	label?: string;
}

export interface CwVPDStageBand {
	label: string;
	min: number;
	max?: number;
	tone?: CwVPDStageBandTone;
}

export interface CwVPDReading {
	/** Optional crop label shown in the chart header. */
	plant?: string;
	/** Optional crop phase or growth stage. */
	growthStage?: string;
	/** Optional live VPD reading in kPa. If omitted, the chart can derive room VPD from temperature and RH. */
	current?: number;
	/** Lower bound of the target VPD band. */
	targetMin: number;
	/** Upper bound of the target VPD band. */
	targetMax: number;
	/** Optional timestamp as Date, ISO string, or Unix time in seconds/milliseconds. */
	timestamp?: string | Date | number;
	/** Optional air temperature in Celsius. */
	airTemperatureC?: number;
	/** Optional leaf temperature in Celsius. */
	leafTemperatureC?: number;
	/** Optional relative humidity percentage. */
	relativeHumidity?: number;
}

export interface CwHeatmapDataPoint {
	/** ISO string or Date. */
	timestamp: string | Date;
	/** Numeric value (e.g. temperature). */
	value: number;
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
export type CwSideNavIconModule = Record<string, string | { default: string }>;
export type CwSideNavIcon =
	| string
	| { src: string }
	| { path: string }
	| CwSideNavIconModule;

export interface CwSideNavItem {
	/** Unique identifier */
	id: string;
	/** Display label (shown in open mode). Kept for backwards compatibility. */
	label: string;
	/** Optional title alias for label */
	title?: string;
	/** Icon source: path-data string, imported SVG URL string, `{ src }`, `{ path }`, or icon module object (e.g. `{ DASHBOARD_ICON }`) */
	icon?: CwSideNavIcon;
	/** Link href — if provided the item renders as an <a> */
	href?: string;
	/** Open href/string-goto links in a new browser tab */
	openExternalTab?: boolean;
	/** Alternative navigation target. String values behave like href, function values run on click. */
	goto?: string | (() => void | Promise<void>);
	/** Whether this item is currently active */
	active?: boolean;
	/** Whether the item is disabled */
	disabled?: boolean;
	/** Visual separator before this item */
	separator?: boolean;
	/** Group label — items with the same group are grouped together with a heading */
	group?: string;
	/** Optional lightweight trailing content (number/text badge) */
	trailing?: string | number;
	/** Optional per-item trailing snippet rendered at the right side in open mode */
	trailingSnippet?: Snippet;
}

/* ── Alarm Scheduler types ─────────────────────────────── */

/** Date/time input accepted by alarm APIs. */
export type CwDateTimeInput = Date | string | number;

export interface CwAlarmRegistration {
	/** Base timestamp used for duration-style alarms. */
	from: CwDateTimeInput;
	/** Offset from `from` in minutes before alarm fires. */
	alarmAfterMinutes?: number;
	/** Offset from `from` in milliseconds before alarm fires. Takes precedence over `alarmAfterMinutes`. */
	alarmAfterMs?: number;
	/** Callback fired when the alarm triggers. */
	callback: () => void;
	/** Optional stable id. If reused, the existing alarm is replaced. */
	id?: string;
}

/* ── Sensor Card types ──────────────────────────────────── */

export interface CwSensorCardDetailRow {
	/** Unique identifier */
	id: string;
	/** Display label */
	label: string;
	/** Display value */
	value?: string | number | null;
	/** Unit suffix */
	unit?: string;
	/** Icon type for the row */
	icon?: 'drop' | 'thermo' | 'timer';
	/** Device online status */
	status?: 'online' | 'offline' | 'warning' | 'loading';
	/** Last Updated **/
	lastUpdated?: Date;
	/** Duration since last update */
	expectedUpdateAfter?: number; // in minutes
}

export interface CwSensorCardDevice {
	/** Device name or label */
	label: string;
	/** Primary reading value (e.g. temperature) */
	primaryValue: number;
	/** Unit for primary value */
	primaryUnit?: string;
	/** Secondary reading value (e.g. humidity) */
	secondaryValue?: number;
	/** Unit for secondary value */
	secondaryUnit?: string;
	/** Custom detail rows for this device */
	detailRows?: CwSensorCardDetailRow[];
	/** Device online status */
	status?: 'online' | 'offline' | 'warning' | 'loading';
	/** Timestamp of the last data update — used for the live elapsed timer */
	lastUpdated?: Date | string | number;
	/** Expected update interval in minutes. CwDuration alarm fires when exceeded. */
	expectedUpdateAfterMinutes?: number;
}

/* ── Stat Card types ────────────────────────────────────── */

export type CwStatCardTrend = 'up' | 'down' | 'stable';

export interface CwStatCardData {
	/** Minimum recorded value */
	min?: number;
	/** Maximum recorded value */
	max?: number;
	/** Mean / average value */
	avg?: number;
	/** Median value */
	median?: number;
	/** Standard deviation */
	stdDev?: number;
	/** Number of readings */
	count?: number;
	/** Most recent reading */
	lastReading?: number;
	/** Trend direction */
	trend?: CwStatCardTrend;
}

/* ── Alarm Scheduler types ─────────────────────────────── */

export interface CwAlarmApi {
	/** Schedule a single alarm and return its id. */
	schedule(options: CwAlarmRegistration): string;
	/** Cancel a scheduled alarm by id. */
	cancel(id: string): void;
	/** Remove all scheduled alarms. */
	clear(): void;
	/** Number of active alarms currently scheduled. */
	readonly size: number;
}
