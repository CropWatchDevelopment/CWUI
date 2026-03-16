<script lang="ts">
	import type { Snippet } from 'svelte';

	type CalendarDay = { date: Date; inMonth: boolean; disabled: boolean };
	type CalendarMonthView = { year: number; month: number; date: Date };

	interface Props {
		/** Year to display (default: current year) */
		year?: number;
		/** Month to display, 0-indexed (default: current month) */
		month?: number;
		/** Start week on Monday instead of Sunday */
		startOnMonday?: boolean;
		/** Snippet rendered next to the day number circle (receives the date) */
		dayHeader?: Snippet<[Date]>;
		/** Snippet rendered at the far right of the day header row (receives the date) */
		dayTrailing?: Snippet<[Date]>;
		/** Snippet rendered in the main body area of each day cell (receives the date) */
		dayContent?: Snippet<[Date]>;
		/** Earliest date that can be shown or selected */
		minDate?: Date;
		/** Latest date that can be shown or selected */
		maxDate?: Date;
		/** Fired when a day cell is clicked */
		onDateClick?: (date: Date) => void;
		/** Fired when month navigation arrows are used. Receives the new year, zero-based month, and first day of that month */
		onMonthChange?: (year: number, month: number, displayedMonth: Date) => void;
		class?: string;
	}

	const now = new Date();

	let {
		year = $bindable(now.getFullYear()),
		month = $bindable(now.getMonth()),
		startOnMonday = true,
		dayHeader,
		dayTrailing,
		dayContent,
		minDate,
		maxDate,
		onDateClick,
		onMonthChange,
		class: className = ''
	}: Props = $props();

	function startOfDay(date: Date): Date {
		const normalized = new Date(date);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	}

	function endOfDay(date: Date): Date {
		const normalized = new Date(date);
		normalized.setHours(23, 59, 59, 999);
		return normalized;
	}

	function normalizeMonthView(targetYear: number, targetMonth: number): CalendarMonthView {
		const date = new Date(targetYear, targetMonth, 1);
		return {
			year: date.getFullYear(),
			month: date.getMonth(),
			date
		};
	}

	function compareMonthViews(a: CalendarMonthView, b: CalendarMonthView): number {
		return a.year * 12 + a.month - (b.year * 12 + b.month);
	}

	function shiftMonth(targetYear: number, targetMonth: number, offset: number): CalendarMonthView {
		return normalizeMonthView(targetYear, targetMonth + offset);
	}

	/* ── Calendar math ───────────────────── */
	const WEEKDAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const WEEKDAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const weekdays = $derived(startOnMonday ? WEEKDAYS_MON : WEEKDAYS_SUN);

	const normalizedBounds = $derived.by(() => {
		const normalizedMin = minDate ? startOfDay(minDate) : null;
		const normalizedMax = maxDate ? endOfDay(maxDate) : null;

		if (normalizedMin && normalizedMax && normalizedMin.getTime() > normalizedMax.getTime()) {
			return {
				min: startOfDay(maxDate!),
				max: endOfDay(minDate!)
			};
		}

		return {
			min: normalizedMin,
			max: normalizedMax
		};
	});

	const minBound = $derived(normalizedBounds.min);
	const maxBound = $derived(normalizedBounds.max);

	const minMonthView = $derived(
		minBound ? normalizeMonthView(minBound.getFullYear(), minBound.getMonth()) : null
	);
	const maxMonthView = $derived(
		maxBound ? normalizeMonthView(maxBound.getFullYear(), maxBound.getMonth()) : null
	);

	function clampMonthView(targetYear: number, targetMonth: number): CalendarMonthView {
		const normalized = normalizeMonthView(targetYear, targetMonth);

		if (minMonthView && compareMonthViews(normalized, minMonthView) < 0) {
			return minMonthView;
		}

		if (maxMonthView && compareMonthViews(normalized, maxMonthView) > 0) {
			return maxMonthView;
		}

		return normalized;
	}

	const displayedMonthView = $derived(clampMonthView(year, month));
	const previousMonthView = $derived(
		shiftMonth(displayedMonthView.year, displayedMonthView.month, -1)
	);
	const nextMonthView = $derived(
		shiftMonth(displayedMonthView.year, displayedMonthView.month, 1)
	);

	const canGoPrev = $derived(
		!minMonthView || compareMonthViews(previousMonthView, minMonthView) >= 0
	);
	const canGoNext = $derived(
		!maxMonthView || compareMonthViews(nextMonthView, maxMonthView) <= 0
	);

	const monthName = $derived(
		displayedMonthView.date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
	);

	$effect(() => {
		if (year !== displayedMonthView.year) {
			year = displayedMonthView.year;
		}

		if (month !== displayedMonthView.month) {
			month = displayedMonthView.month;
		}
	});

	function isDateDisabled(date: Date): boolean {
		const timestamp = date.getTime();
		return (minBound ? timestamp < minBound.getTime() : false) ||
			(maxBound ? timestamp > maxBound.getTime() : false);
	}

	/** All dates to render in the 6-week grid (prev-month padding, current, next-month padding) */
	const calendarDays = $derived.by(() => {
		const firstOfMonth = displayedMonthView.date;
		const lastOfMonth = new Date(displayedMonthView.year, displayedMonthView.month + 1, 0);

		// Which weekday column does the 1st land on?
		let startDay = firstOfMonth.getDay(); // 0=Sun
		if (startOnMonday) {
			startDay = (startDay + 6) % 7; // shift so Mon=0
		}

		const days: CalendarDay[] = [];

		const pushDay = (date: Date, inMonth: boolean) => {
			days.push({ date, inMonth, disabled: isDateDisabled(date) });
		};

		// Previous month padding
		for (let i = startDay - 1; i >= 0; i--) {
			const d = new Date(displayedMonthView.year, displayedMonthView.month, -i);
			pushDay(d, false);
		}

		// Current month
		for (let d = 1; d <= lastOfMonth.getDate(); d++) {
			pushDay(new Date(displayedMonthView.year, displayedMonthView.month, d), true);
		}

		// Next month padding to fill to 42 slots (6 rows × 7 cols)
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			pushDay(new Date(displayedMonthView.year, displayedMonthView.month + 1, i), false);
		}

		return days;
	});

	const isToday = (date: Date): boolean => {
		const t = new Date();
		return date.getDate() === t.getDate() &&
			date.getMonth() === t.getMonth() &&
			date.getFullYear() === t.getFullYear();
	};

	function emitMonthChange(view: CalendarMonthView) {
		onMonthChange?.(view.year, view.month, new Date(view.date));
	}

	function showMonth(view: CalendarMonthView) {
		year = view.year;
		month = view.month;
		emitMonthChange(view);
	}

	function prevMonth() {
		if (!canGoPrev) return;
		showMonth(previousMonthView);
	}

	function nextMonth() {
		if (!canGoNext) return;
		showMonth(nextMonthView);
	}

	function handleDayClick(event: MouseEvent, date: Date, disabled: boolean) {
		if (disabled) return;

		if (event.target instanceof Element && event.currentTarget instanceof Element) {
			const interactiveTarget = event.target.closest(
				'button, a, input, select, textarea, [role="button"]'
			);
			if (interactiveTarget && interactiveTarget !== event.currentTarget) {
				return;
			}
		}

		onDateClick?.(date);
	}
</script>

<div class="cw-calendar {className}">
	<!-- Month header with nav -->
	<div class="cw-calendar__nav">
		<button
			type="button"
			class="cw-calendar__nav-btn"
			onclick={prevMonth}
			aria-label="Previous month"
			disabled={!canGoPrev}
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<span class="cw-calendar__month-label">{monthName}</span>
		<button
			type="button"
			class="cw-calendar__nav-btn"
			onclick={nextMonth}
			aria-label="Next month"
			disabled={!canGoNext}
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
	</div>

	<!-- Weekday headers -->
	<div class="cw-calendar__weekdays">
		{#each weekdays as wd (wd)}
			<span class="cw-calendar__weekday">{wd}</span>
		{/each}
	</div>

	<!-- Day grid -->
	<div class="cw-calendar__grid">
		{#each calendarDays as { date, inMonth, disabled } (date.toISOString())}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="cw-calendar__day"
				class:cw-calendar__day--outside={!inMonth}
				class:cw-calendar__day--disabled={disabled}
				aria-disabled={disabled}
				onclick={(event) => handleDayClick(event, date, disabled)}
			>
				<!-- Day header row -->
				<div class="cw-calendar__day-header">
					<div class="cw-calendar__day-left">
						<span
							class="cw-calendar__day-number"
							class:cw-calendar__day-number--today={isToday(date)}
						>
							{date.getDate()}
						</span>
						{#if dayHeader}
							<span class="cw-calendar__day-title">
								{@render dayHeader(date)}
							</span>
						{/if}
					</div>
					{#if dayTrailing}
						<div class="cw-calendar__day-trailing">
							{@render dayTrailing(date)}
						</div>
					{/if}
				</div>

				<!-- Day content area -->
				{#if dayContent}
					<div class="cw-calendar__day-body">
						{@render dayContent(date)}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	/* ── Container ────────────────────────── */
	.cw-calendar {
		width: 100%;
		font-family: var(--cw-font-family);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		overflow: hidden;
	}

	/* ── Month navigation ─────────────────── */
	.cw-calendar__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-3) var(--cw-space-4);
		border-bottom: 1px solid var(--cw-border-muted);
	}
	.cw-calendar__month-label {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}
	.cw-calendar__nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		color: var(--cw-text-muted);
		cursor: pointer;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}
	.cw-calendar__nav-btn:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}
	.cw-calendar__nav-btn:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
	.cw-calendar__nav-btn:disabled:hover {
		background: none;
		color: var(--cw-text-muted);
	}
	.cw-calendar__nav-btn svg {
		width: 1rem;
		height: 1rem;
	}

	/* ── Weekday header row ───────────────── */
	.cw-calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		border-bottom: 1px solid var(--cw-border-muted);
	}
	.cw-calendar__weekday {
		padding: var(--cw-space-2) 0;
		text-align: center;
		font-size: 0.7rem;
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* ── Day grid ─────────────────────────── */
	.cw-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	/* ── Individual day cell ──────────────── */
	.cw-calendar__day {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		min-height: 7rem;
		border-right: 1px solid var(--cw-border-muted);
		border-bottom: 1px solid var(--cw-border-muted);
		padding: var(--cw-space-2);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}
	.cw-calendar__day:not(.cw-calendar__day--disabled):hover {
		background-color: var(--cw-bg-muted);
	}
	/* Remove right border on every 7th column */
	.cw-calendar__day:nth-child(7n) {
		border-right: none;
	}
	/* Remove bottom border on last row */
	.cw-calendar__day:nth-last-child(-n+7) {
		border-bottom: none;
	}
	.cw-calendar__day--outside {
		opacity: 0.42;
	}
	.cw-calendar__day--disabled {
		cursor: not-allowed;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface) 94%, transparent),
				color-mix(in srgb, var(--cw-bg-muted) 28%, transparent)
			);
	}

	/* ── Day header row ───────────────────── */
	.cw-calendar__day-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-1);
		min-height: 2.1rem;
	}
	.cw-calendar__day-left {
		display: flex;
		align-items: flex-start;
		gap: var(--cw-space-1);
		min-width: 0;
		overflow: hidden;
	}
	.cw-calendar__day-title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Day number circle ────────────────── */
	.cw-calendar__day-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 9999px;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		flex-shrink: 0;
	}
	.cw-calendar__day-number--today {
		background-color: var(--cw-accent);
		color: var(--cw-bg-base);
	}

	/* ── Day trailing slot ────────────────── */
	.cw-calendar__day-trailing {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		line-height: 1;
	}

	/* ── Day content body ─────────────────── */
	.cw-calendar__day-body {
		display: grid;
		gap: 0.3rem;
		padding-top: var(--cw-space-1);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		min-height: 0;
		overflow: hidden;
	}

	@media (max-width: 48rem) {
		.cw-calendar__month-label {
			font-size: var(--cw-text-base);
		}

		.cw-calendar__day {
			min-height: 6rem;
			padding: var(--cw-space-1);
		}

		.cw-calendar__day-title,
		.cw-calendar__day-body {
			font-size: var(--cw-text-xs);
		}
	}
</style>
