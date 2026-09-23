<script lang="ts" module>
	/** Override display labels for i18n. All fields are optional; English defaults are used when omitted. */
	export interface CwDateTimeRangePickerLabels {
		/** Placeholder shown in the trigger when no date is selected. Default: "Select date…" */
		placeholder?: string;
		/** Accessible label for the dropdown dialog. Default: "Date picker" */
		dialog?: string;
		/** Accessible label for the previous (month/year) navigation button. Default: "Previous" */
		previous?: string;
		/** Accessible label for the next (month/year) navigation button. Default: "Next" */
		next?: string;
		/** Label for the single time field (single mode). Default: "Time" */
		time?: string;
		/** Label for the start time field (range mode). Default: "Start time" */
		startTime?: string;
		/** Label for the end time field (range mode). Default: "End time" */
		endTime?: string;
		/** Label for the cancel button. Default: "Cancel" */
		cancel?: string;
		/** Label for the confirm/set button. Default: "Set" */
		set?: string;
		/** Accessible label for an hour field. Default: "Hours" */
		hours?: string;
		/** Accessible label for a minute field. Default: "Minutes" */
		minutes?: string;
	}

	const DEFAULT_LABELS: Required<CwDateTimeRangePickerLabels> = {
		placeholder: 'Select date…',
		dialog: 'Date picker',
		previous: 'Previous',
		next: 'Next',
		time: 'Time',
		startTime: 'Start time',
		endTime: 'End time',
		cancel: 'Cancel',
		set: 'Set',
		hours: 'Hours',
		minutes: 'Minutes'
	};
</script>

<script lang="ts">
	import type { CwDatePickerMode, CwDateGranularity, CwDateValue, CwSingleDateValue, CwRangeDateValue } from '../types/index.js';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { tick } from 'svelte';
	import CwButton from './CwButton.svelte';

	interface Props {
		mode?: CwDatePickerMode;
		granularity?: CwDateGranularity;
		includeTime?: boolean;
		value?: CwDateValue;
		name?: string;
		required?: boolean;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		/**
		 * Latest selectable date. Defaults to today (dates after today are disabled) for
		 * backwards compatibility; pass `null` to allow any future date.
		 */
		maxDate?: Date | null;
		/** Earliest selectable date. */
		minDate?: Date | null;
		/** Visible label above the trigger. */
		label?: string;
		/** id for the trigger button (defaults to a generated id). */
		id?: string;
		/** Error message shown under the trigger; marks the field invalid. */
		error?: string;
		/** Helper text shown under the trigger when there is no error. */
		hint?: string;
		disabled?: boolean;
		/** BCP 47 locale for month/weekday names and date formatting. */
		locale?: string;
		onchange?: (value: CwDateValue) => void;
		/** Override display labels for i18n */
		labels?: CwDateTimeRangePickerLabels;
		class?: string;
	}

	let {
		mode = 'single',
		granularity = 'day',
		includeTime = false,
		value = $bindable<CwDateValue | undefined>(undefined),
		name,
		required = false,
		placeholder,
		autocomplete,
		maxDate = new Date(),
		minDate = null,
		label,
		id,
		error,
		hint,
		disabled = false,
		locale,
		onchange,
		labels = {},
		class: className = ''
	}: Props = $props();

	const l = $derived({ ...DEFAULT_LABELS, ...labels });
	// Existing `placeholder` prop wins over the labels default when provided.
	const effectivePlaceholder = $derived(placeholder ?? l.placeholder);

	const uid = $props.id();
	const triggerId = $derived(id ?? `${uid}-trigger`);
	const labelId = `${uid}-label`;
	const messageId = `${uid}-message`;
	const defaultStartTime = { hours: 0, minutes: 0 };
	const defaultEndTime = { hours: 23, minutes: 59 };

	// View state
	let viewYear = $state(new Date().getFullYear());
	let viewMonth = $state(new Date().getMonth());
	let open = $state(false);
	let hoverDate = $state<Date | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let dropdownStyle = $state('');

	// Range selection state
	let rangeStart = $state<Date | null>(null);
	let rangeEnd = $state<Date | null>(null);

	// Time fields
	let startHours = $state(0);
	let startMinutes = $state(0);
	let endHours = $state(23);
	let endMinutes = $state(59);

	// Initialize from value
	$effect(() => {
		syncSelectionFromValue(value);
	});

	let focusedDate = $state<Date | null>(null);

	const maxDateCeiled = $derived.by(() => {
		if (!maxDate) return null;
		const d = new Date(maxDate);
		d.setHours(23, 59, 59, 999);
		return d;
	});

	const minDateFloored = $derived.by(() => {
		if (!minDate) return null;
		const d = new Date(minDate);
		d.setHours(0, 0, 0, 0);
		return d;
	});

	/** Locale weekday names, Monday first. 2024-01-01 is a Monday. */
	const daysOfWeek = $derived.by(() => {
		const shortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
		return Array.from({ length: 7 }, (_, i) => {
			const date = new Date(2024, 0, 1 + i);
			return { short: shortFmt.format(date), long: longFmt.format(date) };
		});
	});

	const monthNames = $derived.by(() => {
		const fmt = new Intl.DateTimeFormat(locale, { month: 'long' });
		return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2024, i, 1)));
	});

	const shortMonthNames = $derived.by(() => {
		const fmt = new Intl.DateTimeFormat(locale, { month: 'short' });
		return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2024, i, 1)));
	});

	const navTitleFormatter = $derived(
		new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
	);

	const dayLabelFormatter = $derived(
		new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	const calendarDays = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		// Monday = 0
		let startDay = firstDay.getDay() - 1;
		if (startDay < 0) startDay = 6;

		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

		const days: { date: Date; inMonth: boolean }[] = [];

		// Previous month days
		for (let i = startDay - 1; i >= 0; i--) {
			days.push({
				date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
				inMonth: false
			});
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				date: new Date(viewYear, viewMonth, i),
				inMonth: true
			});
		}

		// Next month fill (up to 42 total = 6 weeks)
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			days.push({
				date: new Date(viewYear, viewMonth + 1, i),
				inMonth: false
			});
		}

		return days;
	});

	// Month grid for month granularity
	const monthGrid = $derived.by(() => {
		return shortMonthNames.map((name, i) => ({
			month: i,
			name,
			label: monthNames[i],
			date: new Date(viewYear, i, 1)
		}));
	});

	// Year range for year granularity
	const yearGrid = $derived.by(() => {
		const startDecade = Math.floor(viewYear / 12) * 12;
		return Array.from({ length: 12 }, (_, i) => ({
			year: startDecade + i,
			date: new Date(startDecade + i, 0, 1)
		}));
	});

	const hasCompleteSelection = $derived(
		mode === 'single' ? rangeStart != null : rangeStart != null && rangeEnd != null
	);

	function isSameDay(a: Date, b: Date): boolean {
		return a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();
	}

	/** True when the date falls outside [minDate, maxDate]. Name kept for history. */
	function isFuture(d: Date): boolean {
		if (maxDateCeiled && d > maxDateCeiled) return true;
		if (minDateFloored) {
			// Compare whole periods so a month/year that overlaps minDate stays selectable.
			const periodEnd =
				granularity === 'year'
					? new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
					: granularity === 'month'
						? new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
						: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
			if (periodEnd < minDateFloored) return true;
		}
		return false;
	}

	const calendarWeeks = $derived(
		Array.from({ length: 6 }, (_, i) => calendarDays.slice(i * 7, i * 7 + 7))
	);

	/** Day that owns tabindex=0 in the grid (roving tabindex). */
	const activeDayTime = $derived.by(() => {
		const candidates = calendarDays.filter((day) => day.inMonth && !isFuture(day.date));
		const preferred = [focusedDate, rangeStart, new Date()].find(
			(date): date is Date =>
				!!date && candidates.some((day) => isSameDay(day.date, date))
		);
		const match = preferred
			? candidates.find((day) => isSameDay(day.date, preferred))
			: candidates[0];
		return (match ?? calendarDays.find((day) => day.inMonth))?.date.getTime() ?? null;
	});

	async function focusActiveDay() {
		await tick();
		if (granularity === 'day' && activeDayTime != null) {
			dropdownRef?.querySelector<HTMLElement>(`[data-day-time="${activeDayTime}"]`)?.focus();
			return;
		}
		dropdownRef
			?.querySelector<HTMLElement>(
				'[aria-pressed="true"]:not(:disabled), .cw-date-picker__month-cell:not(:disabled), .cw-date-picker__year-cell:not(:disabled)'
			)
			?.focus();
	}

	function moveDayFocus(target: Date) {
		if (isFuture(target)) return;
		focusedDate = target;
		viewYear = target.getFullYear();
		viewMonth = target.getMonth();
		if (mode === 'range' && rangeStart && !rangeEnd) hoverDate = target;
		void focusActiveDay();
	}

	function handleDayKeydown(event: KeyboardEvent, date: Date) {
		const offsets: Record<string, number> = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -7,
			ArrowDown: 7
		};
		let target: Date | null = null;

		if (event.key in offsets) {
			target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offsets[event.key]);
		} else if (event.key === 'Home' || event.key === 'End') {
			const column = (date.getDay() + 6) % 7; // Monday first
			const delta = event.key === 'Home' ? -column : 6 - column;
			target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
		} else if (event.key === 'PageUp' || event.key === 'PageDown') {
			const step = (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1);
			const lastDay = new Date(date.getFullYear(), date.getMonth() + step + 1, 0).getDate();
			target = new Date(
				date.getFullYear(),
				date.getMonth() + step,
				Math.min(date.getDate(), lastDay)
			);
		}

		if (!target) return;
		event.preventDefault();
		moveDayFocus(target);
	}

	function isInRange(d: Date): boolean {
		if (mode !== 'range') return false;
		const start = rangeStart;
		const end = rangeEnd ?? hoverDate;
		if (!start || !end) return false;
		const [lo, hi] = start < end ? [start, end] : [end, start];
		return d >= lo && d <= hi;
	}

	function isRangeStart(d: Date): boolean {
		if (!rangeStart) return false;
		return isSameDay(d, rangeStart);
	}

	function isRangeEnd(d: Date): boolean {
		const end = rangeEnd ?? hoverDate;
		if (!end) return false;
		return isSameDay(d, end);
	}

	function isSelected(d: Date): boolean {
		if (mode === 'single' && rangeStart) {
			return isSameDay(d, rangeStart);
		}
		return isRangeStart(d) || isRangeEnd(d);
	}

	function clampTimePart(value: number, min: number, max: number, fallback: number): number {
		if (!Number.isFinite(value)) return fallback;
		return Math.min(max, Math.max(min, Math.trunc(value)));
	}

	function getNormalizedStartTime() {
		return {
			hours: clampTimePart(startHours, 0, 23, defaultStartTime.hours),
			minutes: clampTimePart(startMinutes, 0, 59, defaultStartTime.minutes)
		};
	}

	function getNormalizedEndTime() {
		return {
			hours: clampTimePart(endHours, 0, 23, defaultEndTime.hours),
			minutes: clampTimePart(endMinutes, 0, 59, defaultEndTime.minutes)
		};
	}

	function normalizeDraftTime() {
		const nextStart = getNormalizedStartTime();
		const nextEnd = getNormalizedEndTime();
		startHours = nextStart.hours;
		startMinutes = nextStart.minutes;
		endHours = nextEnd.hours;
		endMinutes = nextEnd.minutes;
	}

	function syncSelectionFromValue(nextValue: CwDateValue | undefined = value) {
		hoverDate = null;

		if (!nextValue) {
			rangeStart = null;
			rangeEnd = null;
			startHours = defaultStartTime.hours;
			startMinutes = defaultStartTime.minutes;
			endHours = defaultEndTime.hours;
			endMinutes = defaultEndTime.minutes;
			return;
		}

		if ('start' in nextValue) {
			const rv = nextValue as CwRangeDateValue;
			const nextStart = rv.startTime ?? defaultStartTime;
			const nextEnd = rv.endTime ?? defaultEndTime;
			rangeStart = rv.start;
			rangeEnd = rv.end;
			viewYear = rv.start.getFullYear();
			viewMonth = rv.start.getMonth();
			startHours = clampTimePart(nextStart.hours, 0, 23, defaultStartTime.hours);
			startMinutes = clampTimePart(nextStart.minutes, 0, 59, defaultStartTime.minutes);
			endHours = clampTimePart(nextEnd.hours, 0, 23, defaultEndTime.hours);
			endMinutes = clampTimePart(nextEnd.minutes, 0, 59, defaultEndTime.minutes);
			return;
		}

		const sv = nextValue as CwSingleDateValue;
		const nextTime = sv.time ?? defaultStartTime;
		rangeStart = sv.date;
		rangeEnd = null;
		viewYear = sv.date.getFullYear();
		viewMonth = sv.date.getMonth();
		startHours = clampTimePart(nextTime.hours, 0, 23, defaultStartTime.hours);
		startMinutes = clampTimePart(nextTime.minutes, 0, 59, defaultStartTime.minutes);
		endHours = defaultEndTime.hours;
		endMinutes = defaultEndTime.minutes;
	}

	function buildValue(): CwDateValue | undefined {
		const nextStartTime = getNormalizedStartTime();
		const nextEndTime = getNormalizedEndTime();

		if (mode === 'single' && rangeStart) {
			return {
				date: rangeStart,
				...(includeTime ? { time: nextStartTime } : {})
			};
		}

		if (mode === 'range' && rangeStart && rangeEnd) {
			return {
				start: rangeStart,
				end: rangeEnd,
				...(includeTime
					? {
							startTime: nextStartTime,
							endTime: nextEndTime
						}
					: {})
			};
		}
	}

	function selectDay(d: Date) {
		if (isFuture(d)) return;

		if (mode === 'single') {
			rangeStart = d;
			rangeEnd = null;
			if (!includeTime) {
				commitSelection({ closeAfterCommit: true });
			}
		} else {
			// Range mode
			if (!rangeStart || rangeEnd) {
				// Start new range
				rangeStart = d;
				rangeEnd = null;
			} else {
				// Complete range
				if (d < rangeStart) {
					rangeEnd = rangeStart;
					rangeStart = d;
				} else {
					rangeEnd = d;
				}
				if (!includeTime) {
					commitSelection({ closeAfterCommit: true });
				}
			}
		}
	}

	function selectMonth(m: number) {
		if (granularity === 'month') {
			const d = new Date(viewYear, m, 1);
			if (isFuture(d)) return;
			selectDay(d);
		} else {
			viewMonth = m;
		}
	}

	function selectYear(y: number) {
		if (granularity === 'year') {
			const d = new Date(y, 0, 1);
			if (isFuture(d)) return;
			selectDay(d);
		} else {
			viewYear = y;
		}
	}

	function emit(): boolean {
		const nextValue = buildValue();
		if (!nextValue) return false;

		value = nextValue;
		onchange?.(nextValue);
		return true;
	}

	function openPicker() {
		if (disabled) return;
		if (includeTime) {
			syncSelectionFromValue(value);
		}
		focusedDate = null;
		open = true;
		void focusActiveDay();
	}

	function closePicker({
		restoreCommittedValue = false,
		focusTrigger = false
	}: {
		restoreCommittedValue?: boolean;
		focusTrigger?: boolean;
	} = {}) {
		if (restoreCommittedValue) {
			syncSelectionFromValue(value);
		} else {
			hoverDate = null;
		}

		open = false;
		if (focusTrigger) {
			triggerRef?.focus();
		}
	}

	function togglePicker() {
		if (open) {
			closePicker({ restoreCommittedValue: includeTime });
			return;
		}

		openPicker();
	}

	function commitSelection({ closeAfterCommit = false }: { closeAfterCommit?: boolean } = {}) {
		normalizeDraftTime();
		const emitted = emit();
		if (emitted && closeAfterCommit) {
			closePicker({ focusTrigger: true });
		}
		return emitted;
	}

	function handleSet() {
		commitSelection({ closeAfterCommit: true });
	}

	function handleCancel() {
		closePicker({ restoreCommittedValue: true, focusTrigger: true });
	}

	function stepView(step: 1 | -1) {
		if (granularity === 'day') {
			if (step < 0) prevMonth();
			else nextMonth();
			return;
		}
		// Year grid pages by 12 years; month grid by 1 year.
		viewYear += granularity === 'year' ? step * 12 : step;
	}

	function prevMonth() {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else {
			viewMonth--;
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else {
			viewMonth++;
		}
	}

	function prevYear() { viewYear--; }
	function nextYear() { viewYear++; }

	const displayValue = $derived.by(() => {
		if (!value) return effectivePlaceholder;
		if ('start' in value) {
			const rv = value as CwRangeDateValue;
			return `${formatDate(rv.start)} – ${formatDate(rv.end)}`;
		}
		const sv = value as CwSingleDateValue;
		return formatDate(sv.date);
	});

	function pad2(n: number): string {
		return String(n).padStart(2, '0');
	}

	function encodeValueForForm(date: Date, time?: { hours: number; minutes: number }): string {
		if (includeTime && time) {
			const d = new Date(date);
			d.setHours(time.hours, time.minutes, 0, 0);
			return d.toISOString();
		}
		if (granularity === 'year') {
			return String(date.getFullYear());
		}
		if (granularity === 'month') {
			return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
		}
		return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
	}

	const formValue = $derived.by(() => {
		if (!value) return '';
		if ('start' in value) {
			const rv = value as CwRangeDateValue;
			return `${encodeValueForForm(rv.start, rv.startTime)}|${encodeValueForForm(rv.end, rv.endTime)}`;
		}
		const sv = value as CwSingleDateValue;
		return encodeValueForForm(sv.date, sv.time);
	});

	function formatDate(d: Date): string {
		if (granularity === 'year') return d.getFullYear().toString();
		if (granularity === 'month') {
			return d.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
		}
		return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ' || (e.key === 'ArrowDown' && !open)) {
			e.preventDefault();
			togglePicker();
		} else if (e.key === 'Escape') {
			closePicker({ restoreCommittedValue: includeTime });
		}
	}

	// Close on outside pointerdown without swallowing the click, so the next field still gets it.
	$effect(() => {
		if (!open) return;
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			if (dropdownRef?.contains(target) || triggerRef?.contains(target)) return;
			closePicker({ restoreCommittedValue: includeTime });
		};
		document.addEventListener('pointerdown', handlePointerDown, true);
		return () => document.removeEventListener('pointerdown', handlePointerDown, true);
	});

	function handleDropdownKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			closePicker({ restoreCommittedValue: includeTime, focusTrigger: true });
		}
	}

	function handleTimeChange() {
		normalizeDraftTime();
	}

	function updateDropdownPosition() {
		if (!open || !triggerRef) return;

		const rect = triggerRef.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const fallbackWidth = 288;
		const measuredWidth = dropdownRef?.offsetWidth ?? fallbackWidth;
		const measuredHeight = dropdownRef?.offsetHeight ?? 0;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const maxPanelWidth = Math.max(0, viewportWidth - margin * 2);
		const panelWidth = Math.min(Math.max(rect.width, measuredWidth), maxPanelWidth);

		let left = rect.left;
		if (left + panelWidth > viewportWidth - margin) {
			left = viewportWidth - margin - panelWidth;
		}
		if (left < margin) {
			left = margin;
		}

		const belowTop = rect.bottom + spacing;
		const belowSpace = Math.max(0, viewportHeight - margin - belowTop);
		const aboveSpace = Math.max(0, rect.top - spacing - margin);
		const placeAbove = measuredHeight > belowSpace && aboveSpace > belowSpace;

		let top = belowTop;
		let maxHeight = belowSpace;

		if (placeAbove) {
			maxHeight = aboveSpace;
			const renderedHeight = measuredHeight > 0 ? Math.min(measuredHeight, maxHeight) : maxHeight;
			top = Math.max(margin, rect.top - spacing - renderedHeight);
		}

		if (maxHeight <= 0) {
			top = margin;
			maxHeight = Math.max(0, viewportHeight - margin * 2);
		}

		dropdownStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${Math.round(panelWidth)}px;max-height:${Math.round(maxHeight)}px;`;
	}

	$effect(() => {
		if (!open || !triggerRef || !dropdownRef) return;

		updateDropdownPosition();
		const raf = requestAnimationFrame(() => updateDropdownPosition());
		const resizeObserver = new ResizeObserver(() => updateDropdownPosition());
		resizeObserver.observe(triggerRef);
		resizeObserver.observe(dropdownRef);

		const handleViewportChange = () => updateDropdownPosition();
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);

		return () => {
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
		};
	});
</script>

<div
	class="cw-date-picker {className}"
	class:cw-date-picker--invalid={!!error}
	class:cw-date-picker--disabled={disabled}
>
	{#if label}
		<label class="cw-date-picker__label" id={labelId} for={triggerId}>
			{label}
			{#if required}<span class="cw-date-picker__required" aria-hidden="true">*</span>{/if}
		</label>
	{/if}

	<button
		bind:this={triggerRef}
		id={triggerId}
		type="button"
		class="cw-date-picker__trigger"
		class:cw-date-picker__trigger--open={open}
		class:cw-date-picker__trigger--placeholder={!value}
		onclick={togglePicker}
		onkeydown={handleTriggerKeydown}
		{disabled}
		role="combobox"
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-controls={open ? `${uid}-dialog` : undefined}
		aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
		aria-invalid={error ? 'true' : undefined}
		aria-required={required ? 'true' : undefined}
		aria-describedby={error || hint ? messageId : undefined}
	>
		<svg class="cw-date-picker__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" />
			<path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
		<span class="cw-date-picker__value">{displayValue}</span>
		<svg class="cw-date-picker__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if error}
		<p id={messageId} class="cw-date-picker__message cw-date-picker__message--error">{error}</p>
	{:else if hint}
		<p id={messageId} class="cw-date-picker__message">{hint}</p>
	{/if}

	{#if name || required}
		<input
			class="cw-date-picker__native-input"
			type="text"
			{name}
			value={formValue}
			{required}
			{disabled}
			{autocomplete}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}

	{#if open}
		<div
			bind:this={dropdownRef}
			id="{uid}-dialog"
			class="cw-date-picker__dropdown"
			style={dropdownStyle}
			role="dialog"
			tabindex="-1"
			aria-label={l.dialog}
			onkeydown={handleDropdownKeydown}
			onfocusout={(event) => {
				const next = event.relatedTarget as Node | null;
				if (next && !dropdownRef?.contains(next) && !triggerRef?.contains(next)) {
					closePicker({ restoreCommittedValue: includeTime });
				}
			}}
		>
			<!-- Navigation -->
			<div class="cw-date-picker__nav">
				<button type="button" class="cw-date-picker__nav-btn" onclick={() => stepView(-1)} aria-label={l.previous}>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</button>
				<span class="cw-date-picker__nav-title" id="{uid}-title" aria-live="polite">
					{#if granularity === 'day'}
						{navTitleFormatter.format(new Date(viewYear, viewMonth, 1))}
					{:else if granularity === 'month'}
						{viewYear}
					{:else}
						{Math.floor(viewYear / 12) * 12}–{Math.floor(viewYear / 12) * 12 + 11}
					{/if}
				</span>
				<button type="button" class="cw-date-picker__nav-btn" onclick={() => stepView(1)} aria-label={l.next}>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</button>
			</div>

			<!-- Day grid -->
			{#if granularity === 'day'}
				{@const today = new Date()}
				<div class="cw-date-picker__grid cw-date-picker__grid--day" role="grid" aria-labelledby="{uid}-title">
					<div class="cw-date-picker__row" role="row">
						{#each daysOfWeek as dow (dow.long)}
							<div class="cw-date-picker__dow" role="columnheader">
								<abbr title={dow.long}>{dow.short}</abbr>
							</div>
						{/each}
					</div>
					{#each calendarWeeks as week, weekIndex (weekIndex)}
						<div class="cw-date-picker__row" role="row">
							{#each week as day (day.date.getTime())}
								{@const selected = isSelected(day.date)}
								{@const outOfBounds = isFuture(day.date)}
								<div class="cw-date-picker__cell" role="gridcell" aria-selected={selected}>
									<button
										type="button"
										class="cw-date-picker__day"
										class:cw-date-picker__day--outside={!day.inMonth}
										class:cw-date-picker__day--today={isSameDay(day.date, today)}
										class:cw-date-picker__day--selected={selected}
										class:cw-date-picker__day--in-range={isInRange(day.date)}
										class:cw-date-picker__day--range-start={isRangeStart(day.date)}
										class:cw-date-picker__day--range-end={isRangeEnd(day.date)}
										class:cw-date-picker__day--disabled={outOfBounds}
										data-day-time={day.date.getTime()}
										tabindex={day.date.getTime() === activeDayTime ? 0 : -1}
										disabled={outOfBounds}
										aria-label={dayLabelFormatter.format(day.date)}
										aria-current={isSameDay(day.date, today) ? 'date' : undefined}
										onclick={() => selectDay(day.date)}
										onkeydown={(event) => handleDayKeydown(event, day.date)}
										onfocus={() => {
											focusedDate = day.date;
											if (mode === 'range' && rangeStart && !rangeEnd) hoverDate = day.date;
										}}
										onmouseenter={() => { if (mode === 'range' && rangeStart && !rangeEnd) hoverDate = day.date; }}
										onmouseleave={() => (hoverDate = null)}
									>
										{day.date.getDate()}
									</button>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Month grid -->
			{#if granularity === 'month'}
				<div class="cw-date-picker__grid cw-date-picker__grid--month" role="group" aria-labelledby="{uid}-title">
					{#each monthGrid as m (m.month)}
						{@const selected = !!rangeStart && rangeStart.getMonth() === m.month && rangeStart.getFullYear() === viewYear}
						<button
							type="button"
							class="cw-date-picker__month-cell"
							class:cw-date-picker__month-cell--selected={selected}
							class:cw-date-picker__month-cell--disabled={isFuture(m.date)}
							disabled={isFuture(m.date)}
							aria-pressed={selected}
							aria-label="{m.label} {viewYear}"
							onclick={() => selectMonth(m.month)}
						>
							{m.name}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Year grid -->
			{#if granularity === 'year'}
				<div class="cw-date-picker__grid cw-date-picker__grid--year" role="group" aria-labelledby="{uid}-title">
					{#each yearGrid as y (y.year)}
						{@const selected = !!rangeStart && rangeStart.getFullYear() === y.year}
						<button
							type="button"
							class="cw-date-picker__year-cell"
							class:cw-date-picker__year-cell--selected={selected}
							class:cw-date-picker__year-cell--disabled={isFuture(y.date)}
							disabled={isFuture(y.date)}
							aria-pressed={selected}
							onclick={() => selectYear(y.year)}
						>
							{y.year}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Time inputs -->
			{#if includeTime}
				<div class="cw-date-picker__time">
					<div class="cw-date-picker__time-group" role="group" aria-labelledby="{uid}-st-label">
						<span class="cw-date-picker__time-label" id="{uid}-st-label">
							{mode === 'range' ? l.startTime : l.time}
						</span>
						<div class="cw-date-picker__time-fields">
							<input
								id="{uid}-sh"
								type="number"
								class="cw-date-picker__time-input"
								min="0" max="23"
								aria-label={l.hours}
								bind:value={startHours}
								onchange={handleTimeChange}
							/>
							<span aria-hidden="true">:</span>
							<input
								id="{uid}-sm"
								type="number"
								class="cw-date-picker__time-input"
								min="0" max="59"
								aria-label={l.minutes}
								bind:value={startMinutes}
								onchange={handleTimeChange}
							/>
						</div>
					</div>
					{#if mode === 'range'}
						<div class="cw-date-picker__time-group" role="group" aria-labelledby="{uid}-et-label">
							<span class="cw-date-picker__time-label" id="{uid}-et-label">{l.endTime}</span>
							<div class="cw-date-picker__time-fields">
								<input
									id="{uid}-eh"
									type="number"
									class="cw-date-picker__time-input"
									min="0" max="23"
									aria-label={l.hours}
									bind:value={endHours}
									onchange={handleTimeChange}
								/>
								<span aria-hidden="true">:</span>
								<input
									id="{uid}-em"
									type="number"
									class="cw-date-picker__time-input"
									min="0" max="59"
									aria-label={l.minutes}
									bind:value={endMinutes}
									onchange={handleTimeChange}
								/>
							</div>
						</div>
					{/if}
					<div class="cw-date-picker__time-actions">
						<CwButton type="button" variant="ghost" size="sm" onclick={handleCancel}>
							{l.cancel}
						</CwButton>
						<CwButton type="button" size="sm" onclick={handleSet} disabled={!hasCompleteSelection}>
							{l.set}
						</CwButton>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cw-date-picker {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
		font-family: var(--cw-font-family);
	}

	.cw-date-picker__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-date-picker__required {
		margin-inline-start: 0.125rem;
		color: var(--cw-tone-danger-text);
	}

	.cw-date-picker__trigger {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		width: 100%;
		min-height: var(--cw-control-h-md);
		padding: 0 var(--cw-control-px-md);
		font-family: var(--cw-font-family);
		font-size: var(--cw-control-text-md);
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		cursor: pointer;
		text-align: left;
		transition: border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__trigger:hover:not(:disabled) {
		border-color: var(--cw-control-border-hover);
	}

	.cw-date-picker__trigger--open {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-date-picker__trigger--placeholder {
		color: var(--cw-control-placeholder);
	}

	.cw-date-picker__trigger:disabled {
		cursor: not-allowed;
		color: var(--cw-text-disabled);
		opacity: var(--cw-opacity-disabled);
	}

	.cw-date-picker--invalid .cw-date-picker__trigger {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-date-picker__value {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-date-picker__icon,
	.cw-date-picker__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-text-muted);
	}

	.cw-date-picker__chevron {
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__trigger--open .cw-date-picker__chevron {
		transform: rotate(180deg);
	}

	.cw-date-picker__message {
		font-size: var(--cw-text-xs);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-muted);
	}

	.cw-date-picker__message--error {
		color: var(--cw-tone-danger-text);
	}

	.cw-date-picker__native-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		padding: 0;
		border: 0;
	}

	/* ── Dropdown panel ──────────────────── */
	.cw-date-picker__dropdown {
		position: fixed;
		z-index: var(--cw-z-popover);
		padding: var(--cw-space-3);
		background-color: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
		box-sizing: border-box;
		min-width: min(18rem, calc(100vw - 1rem));
		max-width: calc(100vw - 1rem);
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
	}

	/* ── Navigation ──────────────────────── */
	.cw-date-picker__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--cw-space-2);
	}

	.cw-date-picker__nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--cw-control-h-sm);
		height: var(--cw-control-h-sm);
		padding: 0;
		border: none;
		background: none;
		color: var(--cw-text-secondary);
		cursor: pointer;
		border-radius: var(--cw-radius-md);
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__nav-btn:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-date-picker__nav-btn svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-date-picker__nav-title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	/* ── Day grid ────────────────────────── */
	.cw-date-picker__grid--day {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		row-gap: 1px;
	}

	/* Rows exist for grid semantics only; cells lay out on the parent grid. */
	.cw-date-picker__row,
	.cw-date-picker__cell {
		display: contents;
	}

	.cw-date-picker__dow abbr {
		text-decoration: none;
	}

	.cw-date-picker__dow {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		text-align: center;
		padding: var(--cw-space-1);
	}

	.cw-date-picker__day {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		margin: 0 auto;
		padding: 0;
		font-family: inherit;
		font-size: var(--cw-text-sm);
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-primary);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__day:hover:not(:disabled) {
		background-color: var(--cw-bg-muted);
	}

	.cw-date-picker__day--outside {
		color: var(--cw-text-disabled);
	}

	.cw-date-picker__day--today {
		font-weight: var(--cw-font-bold);
		color: var(--cw-accent-text);
		box-shadow: inset 0 0 0 1px var(--cw-accent);
	}

	.cw-date-picker__day--selected {
		background-color: var(--cw-accent) !important;
		color: var(--cw-text-inverse) !important;
		font-weight: var(--cw-font-semibold);
	}

	.cw-date-picker__day--in-range {
		background-color: var(--cw-accent-bg);
		border-radius: 0;
	}

	.cw-date-picker__day--range-start {
		border-radius: var(--cw-radius-md) 0 0 var(--cw-radius-md);
	}

	.cw-date-picker__day--range-end {
		border-radius: 0 var(--cw-radius-md) var(--cw-radius-md) 0;
	}

	.cw-date-picker__day--disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
		text-decoration: line-through;
	}

	/* ── Month grid ──────────────────────── */
	.cw-date-picker__grid--month {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--cw-space-2);
	}

	.cw-date-picker__month-cell,
	.cw-date-picker__year-cell {
		min-height: var(--cw-option-min-h);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: inherit;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background: none;
		border: 1px solid transparent;
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		text-align: center;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__month-cell:hover:not(:disabled),
	.cw-date-picker__year-cell:hover:not(:disabled) {
		background-color: var(--cw-bg-muted);
		border-color: var(--cw-border-default);
	}

	.cw-date-picker__month-cell--selected,
	.cw-date-picker__year-cell--selected {
		background-color: var(--cw-accent) !important;
		color: var(--cw-text-inverse) !important;
	}

	.cw-date-picker__month-cell--disabled,
	.cw-date-picker__year-cell--disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
	}

	/* ── Year grid ───────────────────────── */
	.cw-date-picker__grid--year {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--cw-space-2);
	}

	/* ── Time inputs ─────────────────────── */
	.cw-date-picker__time {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
		margin-top: var(--cw-space-3);
		padding-top: var(--cw-space-3);
		border-top: 1px solid var(--cw-border-muted);
	}

	.cw-date-picker__time-group {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
	}

	.cw-date-picker__time-label {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		font-weight: var(--cw-font-medium);
	}

	.cw-date-picker__time-fields {
		display: flex;
		align-items: center;
		gap: var(--cw-space-1);
		color: var(--cw-text-secondary);
	}

	.cw-date-picker__time-input {
		width: 3rem;
		min-height: var(--cw-control-h-sm);
		padding: var(--cw-space-1);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-sm);
		font-variant-numeric: tabular-nums;
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-radius-md);
		text-align: center;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.cw-date-picker__time-input::-webkit-inner-spin-button,
	.cw-date-picker__time-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.cw-date-picker__time-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--cw-space-2);
		width: 100%;
	}
</style>
