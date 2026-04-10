import type {
	CwCalendarScrollItem,
	CwCalendarScrollEntry,
	CwDateTimeInput
} from '../types/index.js';

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const INTEGER_PATTERN = /^-?\d+$/;
const MS_PER_DAY = 86_400_000;

type PresenceCheck<T extends CwCalendarScrollItem> = (item: T, key: string) => boolean;

interface BuildCalendarScrollEntriesOptions<T extends CwCalendarScrollItem> {
	items?: T[];
	showAllDates: boolean;
	startDate?: CwDateTimeInput;
	endDate?: CwDateTimeInput;
	hasData?: PresenceCheck<T>;
}

interface ParsedCalendarScrollRow<T extends CwCalendarScrollItem> {
	key: string;
	date: Date;
	item: T | null;
	hasData: boolean;
}

function isValidDate(value: Date): boolean {
	return Number.isFinite(value.getTime());
}

export function startOfLocalDay(input: CwDateTimeInput | null | undefined): Date | null {
	if (input == null) return null;

	if (input instanceof Date) {
		if (!isValidDate(input)) return null;
		return new Date(input.getFullYear(), input.getMonth(), input.getDate());
	}

	if (typeof input === 'number') {
		const parsed = new Date(input);
		if (!isValidDate(parsed)) return null;
		return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
	}

	const trimmed = input.trim();
	if (!trimmed) return null;

	const localMatch = trimmed.match(LOCAL_DATE_PATTERN);
	if (localMatch) {
		const [, year, month, day] = localMatch;
		const parsed = new Date(Number(year), Number(month) - 1, Number(day));
		return isValidDate(parsed) ? parsed : null;
	}

	if (INTEGER_PATTERN.test(trimmed)) {
		const parsed = new Date(Number(trimmed));
		if (!isValidDate(parsed)) return null;
		return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
	}

	const parsed = new Date(trimmed);
	if (!isValidDate(parsed)) return null;
	return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function toCalendarDateKey(date: Date): string {
	const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	return [
		local.getFullYear(),
		String(local.getMonth() + 1).padStart(2, '0'),
		String(local.getDate()).padStart(2, '0')
	].join('-');
}

function defaultHasData<T extends CwCalendarScrollItem>(item: T): boolean {
	return item != null;
}

function compareDates(a: Date, b: Date): number {
	return a.getTime() - b.getTime();
}

function normalizeRange(
	startDate: CwDateTimeInput | undefined,
	endDate: CwDateTimeInput | undefined,
	parsedRows: ParsedCalendarScrollRow<CwCalendarScrollItem>[]
): { start: Date; end: Date } {
	const sortedDataDates = parsedRows
		.map((row) => row.date)
		.sort(compareDates);

	const firstDataDate = sortedDataDates[0];
	const lastDataDate = sortedDataDates.at(-1);

	const requestedStart = startOfLocalDay(startDate);
	const requestedEnd = startOfLocalDay(endDate);

	let start = requestedStart ?? firstDataDate ?? startOfLocalDay(new Date())!;
	let end = requestedEnd ?? lastDataDate ?? start;

	if (compareDates(start, end) > 0) {
		[start, end] = [end, start];
	}

	return { start, end };
}

export function buildCalendarScrollEntries<T extends CwCalendarScrollItem>({
	items = [],
	showAllDates,
	startDate,
	endDate,
	hasData
}: BuildCalendarScrollEntriesOptions<T>): CwCalendarScrollEntry<T>[] {
	const presenceCheck = hasData ?? defaultHasData<T>;
	const parsedByKey = new Map<string, ParsedCalendarScrollRow<T>>();

	for (const item of items) {
		const parsedDate = startOfLocalDay(item.date);
		if (!parsedDate) continue;

		const key = toCalendarDateKey(parsedDate);
		parsedByKey.set(key, {
			key,
			date: parsedDate,
			item,
			hasData: presenceCheck(item, key)
		});
	}

	const parsedRows = [...parsedByKey.values()].sort((a, b) => compareDates(a.date, b.date));

	let visibleRows: ParsedCalendarScrollRow<T>[];

	if (showAllDates) {
		const { start, end } = normalizeRange(startDate, endDate, parsedRows);
		const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY));

		visibleRows = Array.from({ length: totalDays + 1 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			const key = toCalendarDateKey(date);
			const existing = parsedByKey.get(key);

			return (
					existing ?? {
						key,
						date,
						item: null,
						hasData: false
					}
			);
		});
	} else {
		visibleRows = parsedRows.filter((row) => row.hasData);
	}

	const today = startOfLocalDay(new Date())!;
	const todayKey = toCalendarDateKey(today);

	return visibleRows.map((row, index) => ({
		...row,
		isToday: row.key === todayKey,
		isPast: compareDates(row.date, today) < 0,
		isFuture: compareDates(row.date, today) > 0,
		index
	}));
}
