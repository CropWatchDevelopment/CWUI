<script lang="ts">
	import type { CwDatePickerMode, CwDateGranularity, CwDateValue, CwSingleDateValue, CwRangeDateValue } from '../types/index.js';
	import type { HTMLInputAttributes } from 'svelte/elements';
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
		maxDate?: Date;
		onchange?: (value: CwDateValue) => void;
		class?: string;
	}

	let {
		mode = 'single',
		granularity = 'day',
		includeTime = false,
		value = $bindable<CwDateValue | undefined>(undefined),
		name,
		required = false,
		placeholder = 'Select date…',
		autocomplete,
		maxDate = new Date(),
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
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

	const maxDateCeiled = $derived((() => {
		const d = new Date(maxDate);
		d.setHours(23, 59, 59, 999);
		return d;
	})());

	const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

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
		return monthNames.map((name, i) => ({
			month: i,
			name: name.slice(0, 3),
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

	function isFuture(d: Date): boolean {
		return d > maxDateCeiled;
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
		if (includeTime) {
			syncSelectionFromValue(value);
		}
		open = true;
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
			closePicker();
		}
		return emitted;
	}

	function handleSet() {
		commitSelection({ closeAfterCommit: true });
	}

	function handleCancel() {
		closePicker({ restoreCommittedValue: true, focusTrigger: true });
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
		if (!value) return placeholder;
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
		if (granularity === 'month') return `${monthNames[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			togglePicker();
		} else if (e.key === 'Escape') {
			closePicker({ restoreCommittedValue: includeTime });
		}
	}

	function handleOutsideClick() {
		closePicker({ restoreCommittedValue: includeTime });
	}

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
		const fallbackWidth = 272;
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

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-date-picker__backdrop" onclick={handleOutsideClick} onkeydown={() => {}}></div>
{/if}

<div class="cw-date-picker {className}">
	<button
		bind:this={triggerRef}
		type="button"
		class="cw-date-picker__trigger"
		class:cw-date-picker__trigger--open={open}
		class:cw-date-picker__trigger--placeholder={!value}
		onclick={togglePicker}
		onkeydown={handleTriggerKeydown}
		aria-haspopup="dialog"
		aria-expanded={open}
	>
		<svg class="cw-date-picker__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5" />
			<path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
		<span>{displayValue}</span>
	</button>

	{#if name || required}
		<input
			class="cw-date-picker__native-input"
			type="text"
			{name}
			value={formValue}
			{required}
			{autocomplete}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}

	{#if open}
		<div
			bind:this={dropdownRef}
			class="cw-date-picker__dropdown"
			style={dropdownStyle}
			role="dialog"
			tabindex="-1"
			aria-label="Date picker"
			onkeydown={handleDropdownKeydown}
		>
			<!-- Navigation -->
			<div class="cw-date-picker__nav">
				<button type="button" class="cw-date-picker__nav-btn" onclick={granularity === 'day' ? prevMonth : prevYear} aria-label="Previous">
					<svg viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</button>
				<span class="cw-date-picker__nav-title">
					{#if granularity === 'day'}
						{monthNames[viewMonth]} {viewYear}
					{:else if granularity === 'month'}
						{viewYear}
					{:else}
						{Math.floor(viewYear / 12) * 12}–{Math.floor(viewYear / 12) * 12 + 11}
					{/if}
				</span>
				<button type="button" class="cw-date-picker__nav-btn" onclick={granularity === 'day' ? nextMonth : nextYear} aria-label="Next">
					<svg viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
				</button>
			</div>

			<!-- Day grid -->
			{#if granularity === 'day'}
				<div class="cw-date-picker__grid cw-date-picker__grid--day" role="grid">
					{#each daysOfWeek as dow (dow)}
						<div class="cw-date-picker__dow">{dow}</div>
					{/each}
					{#each calendarDays as day (day.date.getTime())}
						<button
							type="button"
							class="cw-date-picker__day"
							class:cw-date-picker__day--outside={!day.inMonth}
							class:cw-date-picker__day--today={isSameDay(day.date, new Date())}
							class:cw-date-picker__day--selected={isSelected(day.date)}
							class:cw-date-picker__day--in-range={isInRange(day.date)}
							class:cw-date-picker__day--range-start={isRangeStart(day.date)}
							class:cw-date-picker__day--range-end={isRangeEnd(day.date)}
							class:cw-date-picker__day--disabled={isFuture(day.date)}
							disabled={isFuture(day.date)}
							onclick={() => selectDay(day.date)}
							onmouseenter={() => { if (mode === 'range' && rangeStart && !rangeEnd) hoverDate = day.date; }}
							onmouseleave={() => (hoverDate = null)}
						>
							{day.date.getDate()}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Month grid -->
			{#if granularity === 'month'}
				<div class="cw-date-picker__grid cw-date-picker__grid--month" role="grid">
					{#each monthGrid as m (m.month)}
						<button
							type="button"
							class="cw-date-picker__month-cell"
							class:cw-date-picker__month-cell--selected={rangeStart && rangeStart.getMonth() === m.month && rangeStart.getFullYear() === viewYear}
							class:cw-date-picker__month-cell--disabled={isFuture(m.date)}
							disabled={isFuture(m.date)}
							onclick={() => selectMonth(m.month)}
						>
							{m.name}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Year grid -->
			{#if granularity === 'year'}
				<div class="cw-date-picker__grid cw-date-picker__grid--year" role="grid">
					{#each yearGrid as y (y.year)}
						<button
							type="button"
							class="cw-date-picker__year-cell"
							class:cw-date-picker__year-cell--selected={rangeStart && rangeStart.getFullYear() === y.year}
							class:cw-date-picker__year-cell--disabled={isFuture(y.date)}
							disabled={isFuture(y.date)}
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
					<div class="cw-date-picker__time-group">
						<label class="cw-date-picker__time-label" for="{uid}-sh">
							{mode === 'range' ? 'Start time' : 'Time'}
						</label>
						<div class="cw-date-picker__time-fields">
							<input
								id="{uid}-sh"
								type="number"
								class="cw-date-picker__time-input"
								min="0" max="23"
								bind:value={startHours}
								onchange={handleTimeChange}
							/>
							<span>:</span>
							<input
								type="number"
								class="cw-date-picker__time-input"
								min="0" max="59"
								bind:value={startMinutes}
								onchange={handleTimeChange}
							/>
						</div>
					</div>
					{#if mode === 'range'}
						<div class="cw-date-picker__time-group">
							<label class="cw-date-picker__time-label" for="{uid}-eh">End time</label>
							<div class="cw-date-picker__time-fields">
								<input
									id="{uid}-eh"
									type="number"
									class="cw-date-picker__time-input"
									min="0" max="23"
									bind:value={endHours}
									onchange={handleTimeChange}
								/>
								<span>:</span>
								<input
									type="number"
									class="cw-date-picker__time-input"
									min="0" max="59"
									bind:value={endMinutes}
									onchange={handleTimeChange}
								/>
							</div>
						</div>
					{/if}
					<div class="cw-date-picker__time-actions">
						<CwButton type="button" variant="ghost" size="sm" onclick={handleCancel}>
							Cancel
						</CwButton>
						<CwButton type="button" size="sm" onclick={handleSet} disabled={!hasCompleteSelection}>
							Set
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
		display: inline-block;
		width: 100%;
	}

	.cw-date-picker__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-overlay);
	}

	.cw-date-picker__trigger {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		min-height: 2.25rem;
		text-align: left;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-date-picker__trigger:focus-visible {
		border-color: var(--cw-focus-ring-color);
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 25%, transparent);
	}

	.cw-date-picker__trigger--open {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-date-picker__trigger--placeholder {
		color: var(--cw-text-muted);
	}

	.cw-date-picker__icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-text-muted);
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
		z-index: calc(var(--cw-z-overlay) + 1);
		padding: var(--cw-space-3);
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		box-shadow: var(--cw-shadow-xl);
		box-sizing: border-box;
		min-width: min(17rem, calc(100vw - 1rem));
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
		width: 1.75rem;
		height: 1.75rem;
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
		gap: 1px;
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
		width: 2rem;
		height: 2rem;
		margin: 0 auto;
		font-size: var(--cw-text-sm);
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
		color: var(--cw-accent);
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
		opacity: 0.4;
	}

	/* ── Month grid ──────────────────────── */
	.cw-date-picker__grid--month {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--cw-space-2);
	}

	.cw-date-picker__month-cell,
	.cw-date-picker__year-cell {
		padding: var(--cw-space-2) var(--cw-space-3);
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
		opacity: 0.4;
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
		width: 2.5rem;
		padding: var(--cw-space-1);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-sm);
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
