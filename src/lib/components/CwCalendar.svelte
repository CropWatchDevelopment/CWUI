<script lang="ts">
	import type { Snippet } from 'svelte';

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
		/** Fired when a day cell is clicked */
		onDateClick?: (date: Date) => void;
		/** Fired when month navigation arrows are used */
		onMonthChange?: (year: number, month: number) => void;
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
		onDateClick,
		onMonthChange,
		class: className = ''
	}: Props = $props();

	/* ── Calendar math ───────────────────── */
	const WEEKDAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const WEEKDAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const weekdays = $derived(startOnMonday ? WEEKDAYS_MON : WEEKDAYS_SUN);

	const monthName = $derived(
		new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })
	);

	/** All dates to render in the 6-week grid (prev-month padding, current, next-month padding) */
	const calendarDays = $derived.by(() => {
		const firstOfMonth = new Date(year, month, 1);
		const lastOfMonth = new Date(year, month + 1, 0);

		// Which weekday column does the 1st land on?
		let startDay = firstOfMonth.getDay(); // 0=Sun
		if (startOnMonday) {
			startDay = (startDay + 6) % 7; // shift so Mon=0
		}

		const days: { date: Date; inMonth: boolean }[] = [];

		// Previous month padding
		for (let i = startDay - 1; i >= 0; i--) {
			const d = new Date(year, month, -i);
			days.push({ date: d, inMonth: false });
		}

		// Current month
		for (let d = 1; d <= lastOfMonth.getDate(); d++) {
			days.push({ date: new Date(year, month, d), inMonth: true });
		}

		// Next month padding to fill to 42 slots (6 rows × 7 cols)
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			days.push({ date: new Date(year, month + 1, i), inMonth: false });
		}

		return days;
	});

	const isToday = (date: Date): boolean => {
		const t = new Date();
		return date.getDate() === t.getDate() &&
			date.getMonth() === t.getMonth() &&
			date.getFullYear() === t.getFullYear();
	};

	function prevMonth() {
		if (month === 0) { month = 11; year--; }
		else { month--; }
		onMonthChange?.(year, month);
	}

	function nextMonth() {
		if (month === 11) { month = 0; year++; }
		else { month++; }
		onMonthChange?.(year, month);
	}

	function handleDayClick(date: Date) {
		onDateClick?.(date);
	}
</script>

<div class="cw-calendar {className}">
	<!-- Month header with nav -->
	<div class="cw-calendar__nav">
		<button type="button" class="cw-calendar__nav-btn" onclick={prevMonth} aria-label="Previous month">
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		<span class="cw-calendar__month-label">{monthName}</span>
		<button type="button" class="cw-calendar__nav-btn" onclick={nextMonth} aria-label="Next month">
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
	</div>

	<!-- Weekday headers -->
	<div class="cw-calendar__weekdays">
		{#each weekdays as wd}
			<span class="cw-calendar__weekday">{wd}</span>
		{/each}
	</div>

	<!-- Day grid -->
	<div class="cw-calendar__grid">
		{#each calendarDays as { date, inMonth }}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="cw-calendar__day"
				class:cw-calendar__day--outside={!inMonth}
				onclick={() => handleDayClick(date)}
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
		font-size: var(--cw-text-base);
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

	/* ── Day grid ─────────────────────────── */
	.cw-calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	/* ── Individual day cell ──────────────── */
	.cw-calendar__day {
		min-height: 5.5rem;
		border-right: 1px solid var(--cw-border-muted);
		border-bottom: 1px solid var(--cw-border-muted);
		padding: var(--cw-space-1);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}
	.cw-calendar__day:hover {
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
		opacity: 0.35;
	}

	/* ── Day header row ───────────────────── */
	.cw-calendar__day-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-1);
		min-height: 1.75rem;
	}
	.cw-calendar__day-left {
		display: flex;
		align-items: center;
		gap: var(--cw-space-1);
		min-width: 0;
		overflow: hidden;
	}
	.cw-calendar__day-title {
		font-size: var(--cw-text-xs);
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
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		font-size: var(--cw-text-xs);
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
	}

	/* ── Day content body ─────────────────── */
	.cw-calendar__day-body {
		padding-top: var(--cw-space-1);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
		min-height: 0;
		overflow: hidden;
	}
</style>
