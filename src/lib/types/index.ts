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

/** Shared responsive size buckets derived from component or viewport width */
export type CwViewSize = 'phone' | 'tablet' | 'desktop';

/** Value types supported by radio inputs */
export type CwRadioValue = string | number | boolean;

/** Badge anchor position */
export type CwBadgePosition = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

/** Switch label placement relative to the control */
export type CwSwitchLabelPosition = 'top' | 'bottom' | 'left' | 'right';

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

export type CwLineChartAlertSeverity = 'warning' | 'critical';

export interface CwLineChartAlert {
	id: string;
	message: string;
	severity?: CwLineChartAlertSeverity;
}

export interface CwLineChartDataPoint {
	timestamp: string | Date;
	value: number;
	/** Legacy single-alert shorthand. */
	alert?: CwLineChartAlert;
	/** Optional multiple alerts associated with the same data point. */
	alerts?: CwLineChartAlert[];
}

export interface CwLineChartSecondaryDataPoint {
	timestamp: string | Date;
	value: number;
}

export interface CwLineChartAlertPoint extends CwLineChartAlert {
	timestamp: string | Date;
	value: number;
}

export interface CwLineChartThreshold {
	id: string;
	name: string;
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

export interface CwTimeValue {
	hours: number;
	minutes: number;
}

/* ── Calendar Scroll types ───────────────────────────── */

export interface CwCalendarScrollItem {
	/** Date represented by this row. Prefer local date strings like YYYY-MM-DD when possible. */
	date: CwDateTimeInput;
}

export interface CwCalendarScrollMeta {
	/** Normalized local date key in YYYY-MM-DD format. */
	key: string;
	/** Date represented by the row, normalized to the local start of day. */
	date: Date;
	/** Whether this date counts as having data after the presence check runs. */
	hasData: boolean;
	/** True when the row represents the current local date. */
	isToday: boolean;
	/** True when the row date is before today. */
	isPast: boolean;
	/** True when the row date is after today. */
	isFuture: boolean;
	/** Zero-based row index after filtering and sorting. */
	index: number;
}

export interface CwCalendarScrollEntry<T extends CwCalendarScrollItem = CwCalendarScrollItem>
	extends CwCalendarScrollMeta {
	/** Item from the passed-in array for this date, if one exists. */
	item: T | null;
}

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

/* ── Language switcher types ───────────────────────────── */

export type CwLanguageFlagType = 'emoji' | 'image';

export interface CwLanguageOption {
	/** Locale code passed to Paraglide, for example `en` or `pt-BR`. */
	locale: string;
	/** Human-readable language name. */
	label: string;
	/** Optional flag emoji or image URL. */
	flag?: string;
	/** Whether `flag` should be treated as an emoji or image source. */
	flagType?: CwLanguageFlagType;
	/** Compact label used when no flag is supplied. */
	shortLabel?: string;
	/** Optional supporting text shown under the main language label. */
	description?: string;
	/** Whether this locale is currently unavailable. */
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

export interface CwCardDataRowItemData {
	/** Unique identifier */
	id: string;
	/** Display label */
	label: string;
	/** Display value */
	value?: string | number | null;
	/** Unit suffix */
	unit?: string;
	/** Icon for the row — a Svelte Snippet, a named built-in ('drop' | 'thermo' | 'timer'), or any string rendered as text */
	icon?: string | Snippet;
	/** Device online status */
	status?: 'online' | 'offline' | 'warning' | 'loading';
	/** Preferred freshness timestamp shown through CwDuration. */
	lastSeenAt?: CwDateTimeInput;
	/** Alias for `lastSeenAt`. */
	lastSeen?: CwDateTimeInput;
	/** PascalCase alias for `lastSeenAt`. */
	LastSeen?: CwDateTimeInput;
	/** Preferred freshness timeout threshold in minutes. */
	expireAfterMinutes?: number;
	/** Alias for `expireAfterMinutes`. */
	alarmTimeoutMinutes?: number;
	/** PascalCase alias for `expireAfterMinutes`. */
	AlarmTimeoutMinutes?: number;
	/** Last updated timestamp shown through CwDuration. Kept for backwards compatibility. */
	lastUpdated?: Date | string | number;
	/** Freshness timeout threshold in minutes. Kept for backwards compatibility. */
	expectedUpdateAfter?: number; // in minutes
	/** Optional alarm callback alias used by freshness-driven rows. */
	alarmCallback?: () => void;
	/** PascalCase alias for `alarmCallback`. */
	AlarmCallback?: () => void;
	/** Optional alarm reset callback alias used by freshness-driven rows. */
	alarmResetCallback?: () => void;
	/** PascalCase alias for `alarmResetCallback`. */
	AlarmResetCallback?: () => void;
}

export interface CwDataListRow extends CwCardDataRowItemData {}

export interface CwSensorCardDetailRow extends CwDataListRow {}

export interface CwSensorCardData {
	/** Device name or label */
	label: string;
	/** Primary reading value (e.g. temperature) */
	primaryValue: number;
	/** Unit for primary value */
	primaryUnit?: string;
	/** Optional icon for the primary value, rendered left of the number. Can be plain text or a Svelte snippet. */
	primary_icon?: string | Snippet;
	/** Optional text override for the primary value. When set, replaces the formatted number — useful for state values like ON/OFF. */
	primaryLabel?: string;
	/** Optional icon for the secondary value, rendered left of the number. Can be plain text or a Svelte snippet. */
	secondary_icon?: string | Snippet;
	/** Secondary reading value (e.g. humidity) */
	secondaryValue?: number;
	/** Unit for secondary value */
	secondaryUnit?: string;
	/** Optional text override for the secondary value. When set, replaces the formatted number. */
	secondaryLabel?: string;
	/** Custom detail rows for this device */
	detailRows?: CwSensorCardDetailRow[];
	/** Device online status */
	status?: 'online' | 'offline' | 'warning' | 'loading';
	/** Preferred freshness timestamp for this device. */
	lastSeenAt?: CwDateTimeInput;
	/** Alias for `lastSeenAt`. */
	lastSeen?: CwDateTimeInput;
	/** PascalCase alias for `lastSeenAt`. */
	LastSeen?: CwDateTimeInput;
	/** Preferred freshness timeout threshold in minutes. */
	expireAfterMinutes?: number;
	/** Alias for `expireAfterMinutes`. */
	alarmTimeoutMinutes?: number;
	/** PascalCase alias for `expireAfterMinutes`. */
	AlarmTimeoutMinutes?: number;
	/** Timestamp of the last data update — used for the live elapsed timer. Kept for backwards compatibility. */
	lastUpdated?: Date | string | number;
	/** Expected update interval in minutes. Kept for backwards compatibility. */
	expectedUpdateAfterMinutes?: number;
	/** Alias for the sensor-level expiry callback. */
	alarmCallback?: (label: string) => void;
	/** PascalCase alias for the sensor-level expiry callback. */
	AlarmCallback?: (label: string) => void;
}

export interface CwSensorCardDevice extends CwSensorCardData {}

/* ── Alert Points Editor types ─────────────────────────── */

export type CwAlertPointUnit = 'C' | 'F' | 'K';

export type CwAlertPointCondition =
	| 'equals'
	| 'range'
	| 'lessThan'
	| 'lessThanOrEqual'
	| 'greaterThan'
	| 'greaterThanOrEqual';

export interface CwAlertPointRule {
	/** Stable point identifier. */
	id: string;
	/** Human-readable label shown in the editor and preview. */
	name: string;
	/** Hex colour used for the point or range. */
	color: string;
	/** Alert comparison mode. */
	condition: CwAlertPointCondition;
	/** Single-point comparison input. Kept as a string while editing so partial negatives/decimals remain valid. */
	value: string;
	/** Range lower bound input. */
	min: string;
	/** Range upper bound input. */
	max: string;
	/**
	 * Optional hysteresis reset value used by downstream rules. Stored in Celsius like the other numeric fields.
	 * Ignored by the editor's overlap detection — supplied as a string so partial input stays editable.
	 */
	reset?: string;
}

export interface CwAlertPointsValue {
	/** Visual unit preference for the editor. Bound values are normalized back to Celsius. */
	unit: CwAlertPointUnit;
	/** Number line midpoint. Kept as a string while editing. */
	center: string;
	/** Editable alert point definitions. */
	points: CwAlertPointRule[];
}

export interface CwAlertPointsEditorText {
	/** Unit dropdown label. */
	unitFieldLabel?: string;
	/** Base center label before the current unit is appended. */
	centerFieldLabel?: string;
	/** Rule name input label. */
	nameFieldLabel?: string;
	/** Rule condition dropdown label. */
	conditionFieldLabel?: string;
	/** Single-value input label. */
	valueFieldLabel?: string;
	/** Range minimum input label. */
	minValueFieldLabel?: string;
	/** Range maximum input label. */
	maxValueFieldLabel?: string;
	/** Optional reset (hysteresis) input label. */
	resetFieldLabel?: string;
	/** Colour input label. */
	colorFieldLabel?: string;
	/** Add rule button label. */
	addAlertPointButton?: string;
	/** Remove rule button label. */
	removePointButton?: string;
	/** Empty-state heading. */
	emptyTitle?: string;
	/** Empty-state helper copy. */
	emptyDescription?: string;
	/** Generic invalid number validation message. */
	invalidNumberError?: string;
	/** Validation formatter for required numeric inputs. */
	requiredFieldError?: (label: string) => string;
	/** Formatter for labels that include the current display unit. */
	fieldLabelWithUnit?: (label: string, unit: string) => string;
	/** Preview note shown when one or more rules cannot be drawn yet. */
	invalidPreviewNote?: (count: number) => string;
	/** Preview note shown when rules overlap. */
	overlapPreviewNote?: (count: number) => string;
	/** Preview note shown when reset ranges are fully covered by other alert rules. */
	resetNeverHappensPreviewNote?: (count: number) => string;
	/** Warning shown when a range has the same min and max. */
	minEqualsMaxWarning?: string;
	/** Validation text shown when a reset can never happen. */
	resetNeverHappensError?: string;
	/** Default name assigned to newly added rules. */
	defaultPointName?: (index: number) => string;
	/** Unit option label for Celsius. */
	unitCelsiusLabel?: string;
	/** Unit option label for Fahrenheit. */
	unitFahrenheitLabel?: string;
	/** Unit option label for Kelvin. */
	unitKelvinLabel?: string;
	/** Condition option label for exact-match rules. */
	conditionEqualsLabel?: string;
	/** Condition option label for closed ranges. */
	conditionRangeLabel?: string;
	/** Condition option label for less-than rules. */
	conditionLessThanLabel?: string;
	/** Condition option label for less-than-or-equal rules. */
	conditionLessThanOrEqualLabel?: string;
	/** Condition option label for greater-than rules. */
	conditionGreaterThanLabel?: string;
	/** Condition option label for greater-than-or-equal rules. */
	conditionGreaterThanOrEqualLabel?: string;
	/** Preview copy when an exact-match rule has no value yet. */
	pointDescriptionWaitingForValue?: string;
	/** Preview copy when an open-ended threshold has no value yet. */
	pointDescriptionWaitingForThreshold?: string;
	/** Preview copy when a range is missing one or both bounds. */
	pointDescriptionRangeMissingBounds?: string;
	/** Formatter for exact-match preview copy. */
	pointDescriptionEquals?: (value: string, unit: string) => string;
	/** Formatter for range preview copy. */
	pointDescriptionRange?: (min: string, max: string, unit: string) => string;
	/** Formatter for less-than preview copy. */
	pointDescriptionLessThan?: (value: string, unit: string) => string;
	/** Formatter for less-than-or-equal preview copy. */
	pointDescriptionLessThanOrEqual?: (value: string, unit: string) => string;
	/** Formatter for greater-than preview copy. */
	pointDescriptionGreaterThan?: (value: string, unit: string) => string;
	/** Formatter for greater-than-or-equal preview copy. */
	pointDescriptionGreaterThanOrEqual?: (value: string, unit: string) => string;
	/** Preview copy when a reset cannot be drawn yet. */
	resetDescriptionWaitingForValue?: string;
	/** Formatter for exact-match reset preview copy. */
	resetDescriptionNotEquals?: (value: string, unit: string) => string;
	/** Formatter for less-than reset preview copy. */
	resetDescriptionLessThan?: (value: string, unit: string) => string;
	/** Formatter for less-than-or-equal reset preview copy. */
	resetDescriptionLessThanOrEqual?: (value: string, unit: string) => string;
	/** Formatter for greater-than reset preview copy. */
	resetDescriptionGreaterThan?: (value: string, unit: string) => string;
	/** Formatter for greater-than-or-equal reset preview copy. */
	resetDescriptionGreaterThanOrEqual?: (value: string, unit: string) => string;
	/** Validation formatter for overlapping rules. */
	overlapError?: (labels: string[]) => string;
}

/* ── Stat Card types ────────────────────────────────────── */

export type CwStatCardTrend = 'up' | 'down' | 'stable';

export interface CwStatCardLabels {
	min?: string;
	avg?: string;
	max?: string;
	count?: string;
	median?: string;
	stdDev?: string;
	range?: string;
	aboveAvg?: string;
	belowAvg?: string;
	atAvg?: string;
	clickToExpand?: string;
	clickToCollapse?: string;
}

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
