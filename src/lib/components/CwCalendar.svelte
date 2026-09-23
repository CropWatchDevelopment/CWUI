<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import CwSpinner from './CwSpinner.svelte';

	type CalendarDay = { date: Date; inMonth: boolean; disabled: boolean; isToday: boolean };
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
		/** While true, both month-nav buttons are disabled and the one that was clicked shows a spinner */
		loading?: boolean;
		/** BCP 47 locale for month/weekday names and day labels (default: runtime locale) */
		locale?: string;
		/** Accessible name for the date grid (default: the displayed month) */
		ariaLabel?: string;
		/** Accessible names for the month navigation buttons */
		labels?: { previousMonth?: string; nextMonth?: string };
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
		loading = false,
		locale,
		ariaLabel,
		labels = {},
		class: className = ''
	}: Props = $props();

	let rootEl = $state<HTMLDivElement>();
	/** Roving-tabindex target: only this day's button is in the tab order. */
	let focusedKey = $state<string | null>(null);

	const rootId = $props.id();

	/** Which nav button triggered the in-flight load, so only it shows a spinner. */
	let pendingNav = $state<'prev' | 'next' | null>(null);

	$effect(() => {
		if (!loading) {
			pendingNav = null;
		}
	});

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
	function dayKey(date: Date): string {
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	}

	/** Locale weekday names; 2024-01-07 is a Sunday. */
	const weekdays = $derived.by(() => {
		const shortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
		const names = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(2024, 0, 7 + i);
			return { short: shortFmt.format(date), long: longFmt.format(date) };
		});
		return startOnMonday ? [...names.slice(1), names[0]] : names;
	});

	const dayLabelFormatter = $derived(
		new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

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
		displayedMonthView.date.toLocaleString(locale, { month: 'long', year: 'numeric' })
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

		// Single "today" reference for the whole grid — avoids 42 Date
		// allocations per render and staleness skew within one render.
		const today = new Date();

		const pushDay = (date: Date, inMonth: boolean) => {
			days.push({
				date,
				inMonth,
				disabled: isDateDisabled(date),
				isToday:
					date.getDate() === today.getDate() &&
					date.getMonth() === today.getMonth() &&
					date.getFullYear() === today.getFullYear()
			});
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

	const calendarWeeks = $derived(
		Array.from({ length: 6 }, (_, i) => calendarDays.slice(i * 7, i * 7 + 7))
	);

	/** Falls back to today (if shown) or the 1st when the focused day isn't in this month. */
	const activeKey = $derived.by(() => {
		const inMonthDays = calendarDays.filter((day) => day.inMonth);
		if (focusedKey && inMonthDays.some((day) => dayKey(day.date) === focusedKey)) {
			return focusedKey;
		}
		const today = inMonthDays.find((day) => day.isToday && !day.disabled);
		const firstEnabled = inMonthDays.find((day) => !day.disabled);
		return dayKey((today ?? firstEnabled ?? inMonthDays[0]).date);
	});

	async function focusDate(target: Date) {
		if (isDateDisabled(target)) return;
		const targetView = normalizeMonthView(target.getFullYear(), target.getMonth());
		if (compareMonthViews(targetView, displayedMonthView) !== 0) {
			if (loading) return;
			const clamped = clampMonthView(targetView.year, targetView.month);
			if (compareMonthViews(clamped, targetView) !== 0) return;
			showMonth(targetView);
		}
		focusedKey = dayKey(target);
		await tick();
		rootEl?.querySelector<HTMLElement>(`[data-day-key="${focusedKey}"]`)?.focus();
	}

	function handleGridKeydown(event: KeyboardEvent, date: Date) {
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
			const column = (date.getDay() + (startOnMonday ? 6 : 0)) % 7;
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
		void focusDate(target);
	}

	function emitMonthChange(view: CalendarMonthView) {
		onMonthChange?.(view.year, view.month, new Date(view.date));
	}

	function showMonth(view: CalendarMonthView) {
		year = view.year;
		month = view.month;
		emitMonthChange(view);
	}

	function prevMonth() {
		if (!canGoPrev || loading) return;
		pendingNav = 'prev';
		showMonth(previousMonthView);
	}

	function nextMonth() {
		if (!canGoNext || loading) return;
		pendingNav = 'next';
		showMonth(nextMonthView);
	}

	function handleDayClick(event: MouseEvent, date: Date, disabled: boolean) {
		if (disabled) return;

		if (event.target instanceof Element && event.currentTarget instanceof Element) {
			const interactiveTarget = event.target.closest(
				'button, a, input, select, textarea, [role="button"]'
			);
			// The day-number button is the cell's own keyboard target, so it still selects the date.
			if (
				interactiveTarget &&
				interactiveTarget !== event.currentTarget &&
				!interactiveTarget.classList.contains('cw-calendar__day-number')
			) {
				return;
			}
		}

		onDateClick?.(date);
	}
</script>

<div class="cw-calendar {className}" bind:this={rootEl}>
	<!-- Month header with nav -->
	<div class="cw-calendar__nav">
		<button
			type="button"
			class="cw-calendar__nav-btn"
			onclick={prevMonth}
			aria-label={labels.previousMonth ?? 'Previous month'}
			aria-busy={loading && pendingNav === 'prev'}
			disabled={!canGoPrev || loading}
		>
			{#if loading && pendingNav === 'prev'}
				<CwSpinner size="md" />
			{:else}
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{/if}
		</button>
		<span class="cw-calendar__month-label" id="{rootId}-month" aria-live="polite">{monthName}</span>
		<button
			type="button"
			class="cw-calendar__nav-btn"
			onclick={nextMonth}
			aria-label={labels.nextMonth ?? 'Next month'}
			aria-busy={loading && pendingNav === 'next'}
			disabled={!canGoNext || loading}
		>
			{#if loading && pendingNav === 'next'}
				<CwSpinner size="md" />
			{:else}
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{/if}
		</button>
	</div>

	<div
		class="cw-calendar__table"
		role="grid"
		aria-labelledby={ariaLabel ? undefined : `${rootId}-month`}
		aria-label={ariaLabel}
	>
		<!-- Weekday headers -->
		<div class="cw-calendar__weekdays" role="row">
			{#each weekdays as wd (wd.long)}
				<span class="cw-calendar__weekday" role="columnheader">
					<abbr title={wd.long}>{wd.short}</abbr>
				</span>
			{/each}
		</div>

		<!-- Day grid -->
		<div class="cw-calendar__grid">
			{#each calendarWeeks as week, weekIndex (weekIndex)}
				<div class="cw-calendar__week" role="row">
					{#each week as { date, inMonth, disabled, isToday } (date.toISOString())}
						{@const key = dayKey(date)}
						<!-- Mouse users can click anywhere in the cell; keyboard users use the day button. -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							class="cw-calendar__day"
							class:cw-calendar__day--outside={!inMonth}
							class:cw-calendar__day--disabled={disabled}
							role="gridcell"
							tabindex="-1"
							aria-disabled={disabled || undefined}
							onclick={(event) => handleDayClick(event, date, disabled)}
						>
							<!-- Day header row -->
							<div class="cw-calendar__day-header">
								<div class="cw-calendar__day-left">
									<button
										type="button"
										class="cw-calendar__day-number"
										class:cw-calendar__day-number--today={isToday}
										data-day-key={key}
										tabindex={key === activeKey ? 0 : -1}
										aria-label={dayLabelFormatter.format(date)}
										aria-current={isToday ? 'date' : undefined}
										aria-disabled={disabled || undefined}
										onfocus={() => {
											if (inMonth) focusedKey = key;
										}}
										onkeydown={(event) => handleGridKeydown(event, date)}
									>
										{date.getDate()}
									</button>
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
			{/each}
		</div>
	</div>
</div>

<style>
	/* ── Container ────────────────────────── */
	.cw-calendar {
		width: 100%;
		font-family: var(--cw-font-family);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
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
		width: var(--cw-control-h-sm);
		height: var(--cw-control-h-sm);
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
	.cw-calendar__nav-btn:hover:not(:disabled) {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}
	.cw-calendar__nav-btn:disabled {
		cursor: not-allowed;
		color: var(--cw-text-disabled);
	}
	/* The button whose click started the load keeps full colour for its spinner. */
	.cw-calendar__nav-btn[aria-busy='true'] {
		cursor: wait;
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
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.cw-calendar__weekday abbr {
		text-decoration: none;
	}

	/* ── Day grid ─────────────────────────── */
	.cw-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	/* Rows exist for grid semantics only; cells lay out on the parent grid. */
	.cw-calendar__week {
		display: contents;
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
	/* Remove right border on the last column */
	.cw-calendar__day:last-child {
		border-right: none;
	}
	/* Remove bottom border on last row */
	.cw-calendar__week:last-child .cw-calendar__day {
		border-bottom: none;
	}
	.cw-calendar__day--outside {
		color: var(--cw-text-disabled);
		background-color: color-mix(in srgb, var(--cw-bg-muted) 22%, transparent);
	}
	.cw-calendar__day--outside .cw-calendar__day-number,
	.cw-calendar__day--outside .cw-calendar__day-title,
	.cw-calendar__day--outside .cw-calendar__day-body {
		color: var(--cw-text-disabled);
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
		padding: 0;
		border: 0;
		border-radius: var(--cw-radius-full);
		background: none;
		font: inherit;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-secondary);
		cursor: pointer;
		flex-shrink: 0;
	}
	.cw-calendar__day-number[aria-disabled='true'] {
		cursor: not-allowed;
		color: var(--cw-text-disabled);
	}
	.cw-calendar__day-number--today {
		background-color: var(--cw-accent);
		color: var(--cw-text-inverse);
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
