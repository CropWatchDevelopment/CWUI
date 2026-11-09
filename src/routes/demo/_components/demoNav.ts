import type { CwSideNavItem } from '$lib/index.js';

/**
 * SVG path data for the demo nav's 16×16 viewBox icons, drawn with a 1.5
 * round stroke: keep every shape inside 0.75–15.25 so no stroke is clipped,
 * and lines at least 2.5 apart so they don't merge at 20px.
 */
export const demoIcons = {
	home: "M2.5 6.5 8 2l5.5 4.5V13a1 1 0 01-1 1h-9a1 1 0 01-1-1V6.5zM6.5 14v-4h3v4",
	website:
		"M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zM2 6.5h12M4.5 3v3.5M7 3v3.5",
	api: "M4.5 5l-3 3 3 3M11.5 5l3 3-3 3M9.5 3l-3 10",
	button:
		"M3 4.5h10a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 10V6A1.5 1.5 0 013 4.5zM5.5 8h5",
	chip: "M2 3a1 1 0 011-1h4.6a1 1 0 01.7.3l5.4 5.4a1 1 0 010 1.4l-4.6 4.6a1 1 0 01-1.4 0L2.3 8.3A1 1 0 012 7.6V3zM5 5h.01",
	badge: "M2 5h7a2 2 0 012 2v6H2V5zm8.5-.5a2 2 0 114 0 2 2 0 01-4 0z",
	card: "M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 3h12",
	cardDataRow: "M2 4h3.5M8 4h6M2 8h3.5M8 8h6M2 12h3.5M8 12h6",
	input: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM5 7v2",
	alertPoints: "M2 11h12M5.5 11v2M10.5 11v2M5.5 8.5 4 5.5h3zM10.5 8.5 9 5.5h3z",
	spinner: "M8 2a6 6 0 106 6M8 2a6 6 0 00-3.9 1.44",
	switch: "M6 4h4a4 4 0 010 8H6a4 4 0 010-8zM10 6a2 2 0 110 4 2 2 0 010-4z",
	checkbox:
		"M4 2.5h8A1.5 1.5 0 0113.5 4v8a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V4A1.5 1.5 0 014 2.5zm1.5 5.75 1.75 1.75L10.5 6.5",
	radio: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 4.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z",
	statusdot: "M8 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM4.5 4.5a5 5 0 000 7M11.5 4.5a5 5 0 010 7",
	offline: "M3 7.5a7 7 0 0110 0M5.5 10a3.5 3.5 0 015 0M8 12.5h.01M2.5 2.5l11 11",
	dropdown:
		"M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM6 8l2 2 2-2",
	multiSelect: "M2 4.5l1.5 1.5L6 3.5M2 10.5l1.5 1.5L6 9.5M8.5 4.75h5.5M8.5 10.75h5.5",
	dialog:
		"M2.5 2h11a1 1 0 011 1v10a1 1 0 01-1 1h-11a1 1 0 01-1-1V3a1 1 0 011-1zM4 5h5M10.75 4.25l1.5 1.5m0-1.5-1.5 1.5M4 8h6M9 11h3",
	toast:
		"M3.5 5h9a2 2 0 012 2v2a2 2 0 01-2 2h-9a2 2 0 01-2-2V7a2 2 0 012-2zM4.5 8l1 1 2-2M9.5 8H12",
	clock: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3v3l2 2",
	duration:
		"M3.5 1.5h9M3.5 14.5h9M4.5 1.5v2.8a1.3 1.3 0 00.4.9L8 8l3.1-2.8a1.3 1.3 0 00.4-.9V1.5M4.5 14.5v-2.8a1.3 1.3 0 01.4-.9L8 8l3.1 2.8a1.3 1.3 0 01.4.9v2.8",
	alarm: "M8 3.5a5 5 0 110 10 5 5 0 010-10zM8 6v2.5l1.5 1.5M4 2 2 4m10-2 2 2M4.5 12 3 13.5m8.5-1.5 1.5 1.5",
	search: "M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13",
	language:
		"M8 2a6 6 0 110 12A6 6 0 018 2zM2 8h12M8 2c-1.6 1.6-2.5 3.7-2.5 6s.9 4.4 2.5 6c1.6-1.6 2.5-3.7 2.5-6S9.6 3.6 8 2z",
	textarea:
		"M3 2.5h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9a1 1 0 011-1zM5 5.5h6M5 8h6M5 10.5h3.5",
	table: "M3 2.5h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9a1 1 0 011-1zM2 6h12M2 9.75h12M6.5 2.5v11",
	linechart: "M2 2v12h12M4.5 10.5l2.5-3 2 1.5 4-5",
	deviceChart:
		"M3 2.5h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9a1 1 0 011-1zM2 5.5h12M4.5 11l2-2.5 2 1.5 3-3.5",
	responsiveChart:
		"M2 9l3-3.5 2.5 2 3-4L14 7M2 13h12M2 13l1.5-1.5M2 13l1.5 1.5M14 13l-1.5-1.5M14 13l-1.5 1.5",
	donut: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 2v3.5M13.2 11l-3.03-1.75",
	dli: "M2 11.5h12M4.5 11.5a3.5 3.5 0 017 0M8 4.5v2M4.5 8 3 6.5M11.5 8 13 6.5",
	ppfd: "M8 5.25a2.75 2.75 0 110 5.5 2.75 2.75 0 010-5.5zM8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9",
	vpd: "M8 1.5s4.5 4.8 4.5 8a4.5 4.5 0 01-9 0c0-3.2 4.5-8 4.5-8zM5.75 9.75A2.25 2.25 0 008 12",
	aboveBelow:
		"M1.5 8.5h13M8 8.5V5M8 6.5C6.5 6.5 5 5.5 5 3.5c1.5 0 3 1 3 3zM8 5.5c0-2 1.5-3 3-3 0 2-1.5 3-3 3zM8 8.5v4.5M8 10.5l-2.5 2M8 10.5l2.5 2",
	wind: "M8 2a6 6 0 110 12A6 6 0 018 2zM10.8 5.2l-1.4 4.2-4.2 1.4 1.4-4.2z",
	calendar:
		"M3 4h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2-2v3m6-3v3M2 7h12M5 9.5h.01M8 9.5h.01M11 9.5h.01M5 11.75h.01M8 11.75h.01M11 11.75h.01",
	datePicker:
		"M3 4h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2-2v3m6-3v3M2 7h12M5.75 10.5l1.5 1.5 3-3",
	calendarScroll:
		"M3 4h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2-2v3m6-3v3M2 7h12M6 9.75l2 2 2-2",
	theme: "M8 2a6 6 0 110 12A6 6 0 018 2zM8 11.5a3.5 3.5 0 000-7v7z",
	listbox:
		"M4 2.5h8M4 13.5h8M3 5.5h10a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 9V7A1.5 1.5 0 013 5.5zM4.5 8h7",
	profile:
		"M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 14c0-2.8 2.2-5 5-5s5 2.2 5 5",
	sidenav: "M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM6 2v12",
	drawer: "M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM2 9.5h12M6.5 11.75h3",
	header:
		"M3 2h10a1 1 0 011 1v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zM3 8h10a1 1 0 011 1v4a1 1 0 01-1 1H3a1 1 0 01-1-1V9a1 1 0 011-1z",
	tooltip:
		"M3 2.5h10a1 1 0 011 1V10a1 1 0 01-1 1H9.75L8 13l-1.75-2H3a1 1 0 01-1-1V3.5a1 1 0 011-1zM5 5.5h6M5 8h4",
	copy: "M7 6h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1zM3 10a1 1 0 01-1-1V3a1 1 0 011-1h6a1 1 0 011 1",
	expand: "M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 3h8M6 9l2 2 2-2",
	heatmap:
		"M2.5 3.5a1 1 0 112 0 1 1 0 01-2 0zM8 3.5h.01M12.5 3.5h.01M2.5 8a1 1 0 112 0 1 1 0 01-2 0zM7 8a1 1 0 112 0 1 1 0 01-2 0zM12.5 8h.01M3.5 12.5h.01M7 12.5a1 1 0 112 0 1 1 0 01-2 0zM11.5 12.5a1 1 0 112 0 1 1 0 01-2 0z",
	lock: "M6 6V4a2 2 0 114 0v2h2a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h2zm1 4v2m0-2a1 1 0 110 2 1 1 0 010-2z",
	dataDisplay: "M2 2h4.5v6H2zM9.5 2H14v3H9.5zM9.5 7.5H14V14H9.5zM2 10.5h4.5V14H2z",
	sensorcard:
		"M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm2 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0h2M5 10h6",
	stackedbar: "M3 13V9h2v4H3zm4 0V5h2v8H7zm4 0V7h2v6h-2zM2 13.5h12",
	separator: "M2 8h12M5.5 5.5 8 3l2.5 2.5M10.5 10.5 8 13l-2.5-2.5",
	location: "M8 14s-4.5-4.2-4.5-7.5a4.5 4.5 0 019 0C12.5 9.8 8 14 8 14zm0-6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
	datalist: "M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01",
	statcard:
		"M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zM4.5 10l2.25-2.25 2 2L11.5 6.5",
};

/**
 * Demo site navigation. Shared by the side nav, the nav search and the
 * home page overview. Entries with a  point at a component that is
 * demonstrated as a section of another page.
 */
export const demoNavItems: CwSideNavItem[] = [
	// ── General ──
	{ id: 'main-home', label: 'Home', icon: demoIcons.home, href: '/demo', group: 'General' },
	{ id: 'website', label: 'Website', icon: demoIcons.website, href: 'https://CropWatch.io', group: 'General', openExternalTab: true },
	{ id: 'api-docs', label: 'API Docs', icon: demoIcons.api, href: 'https://api.CropWatch.io', group: 'General', openExternalTab: true },
	// ── Layout ──
	{ id: 'header', label: 'Header', icon: demoIcons.header, href: '/demo/header', group: 'Layout' },
	{ id: 'sidenav', label: 'Side Nav', icon: demoIcons.sidenav, href: '/demo/sidenav', group: 'Layout' },
	{ id: 'drawer', label: 'Drawer', icon: demoIcons.drawer, href: '/demo/drawer', group: 'Layout' },
	{ id: 'expand', label: 'Expand Panel', icon: demoIcons.expand, href: '/demo/expand', group: 'Layout' },
	{ id: 'cards', label: 'Card', icon: demoIcons.card, href: '/demo/cards', group: 'Layout' },
	{ id: 'separator', label: 'Separator', icon: demoIcons.separator, href: '/demo/cards#separator', group: 'Layout' },
	// ── Form Controls ──
	{ id: 'buttons', label: 'Button', icon: demoIcons.button, href: '/demo/buttons', group: 'Form Controls' },
	{ id: 'inputs', label: 'Input', icon: demoIcons.input, href: '/demo/inputs', group: 'Form Controls' },
	{ id: 'textarea', label: 'Text Area', icon: demoIcons.textarea, href: '/demo/textarea', group: 'Form Controls' },
	{ id: 'search', label: 'Search Input', icon: demoIcons.search, href: '/demo/search', group: 'Form Controls' },
	{ id: 'dropdown', label: 'Dropdown', icon: demoIcons.dropdown, href: '/demo/dropdown', group: 'Form Controls' },
	{ id: 'multi-select', label: 'Multi Select', icon: demoIcons.multiSelect, href: '/demo/multi-select', group: 'Form Controls' },
	{ id: 'listbox', label: 'List Box', icon: demoIcons.listbox, href: '/demo/listbox', group: 'Form Controls' },
	{ id: 'checkbox', label: 'Checkbox', icon: demoIcons.checkbox, href: '/demo/checkbox', group: 'Form Controls' },
	{ id: 'radio', label: 'Radio', icon: demoIcons.radio, href: '/demo/radio', group: 'Form Controls' },
	{ id: 'switch', label: 'Switch', icon: demoIcons.switch, href: '/demo/switch', group: 'Form Controls' },
	{ id: 'datepicker', label: 'Date Picker', icon: demoIcons.datePicker, href: '/demo/datepicker', group: 'Form Controls' },
	{ id: 'time', label: 'Time Picker', icon: demoIcons.clock, href: '/demo/time', group: 'Form Controls' },
	{ id: 'calendar', label: 'Calendar', icon: demoIcons.calendar, href: '/demo/calendar', group: 'Form Controls' },
	{ id: 'calendar-scroll', label: 'Calendar Scroll', icon: demoIcons.calendarScroll, href: '/demo/calendar-scroll', group: 'Form Controls' },
	{ id: 'alert-points', label: 'Alert Points', icon: demoIcons.alertPoints, href: '/demo/alert-points', group: 'Form Controls' },
	// ── Data Display ──
	{ id: 'chips', label: 'Chip', icon: demoIcons.chip, href: '/demo/chips', group: 'Data Display' },
	{ id: 'badge', label: 'Badge', icon: demoIcons.badge, href: '/demo/badge', group: 'Data Display' },
	{ id: 'statusdot', label: 'Status Dot', icon: demoIcons.statusdot, href: '/demo/statusdot', group: 'Data Display' },
	{ id: 'card-data-row-item', label: 'Card Data Row', icon: demoIcons.cardDataRow, href: '/demo/card-data-row-item', group: 'Data Display' },
	{ id: 'data-list', label: 'Data List', icon: demoIcons.datalist, href: '/demo/sensorcard#data-list', group: 'Data Display' },
	{ id: 'sensorcard', label: 'Sensor Card', icon: demoIcons.sensorcard, href: '/demo/sensorcard', group: 'Data Display' },
	{ id: 'location-card', label: 'Location Card', icon: demoIcons.location, href: '/demo/sensorcard#location-card', group: 'Data Display' },
	{ id: 'statcard', label: 'Stat Card', icon: demoIcons.statcard, href: '/demo/statcard', group: 'Data Display' },
	{ id: 'datatable', label: 'Data Table', icon: demoIcons.table, href: '/demo/datatable', group: 'Data Display' },
	// ── Feedback & Overlays ──
	{ id: 'dialog', label: 'Dialog', icon: demoIcons.dialog, href: '/demo/dialog', group: 'Feedback & Overlays' },
	{ id: 'toast', label: 'Toast', icon: demoIcons.toast, href: '/demo/toast', group: 'Feedback & Overlays' },
	{ id: 'tooltip', label: 'Tooltip', icon: demoIcons.tooltip, href: '/demo/tooltip', group: 'Feedback & Overlays' },
	{ id: 'spinner', label: 'Spinner', icon: demoIcons.spinner, href: '/demo/spinner', group: 'Feedback & Overlays' },
	{ id: 'offline', label: 'Offline Overlay', icon: demoIcons.offline, href: '/demo/offline', group: 'Feedback & Overlays' },
	{ id: 'profilemenu', label: 'Profile Menu', icon: demoIcons.profile, href: '/demo/profilemenu', group: 'Feedback & Overlays' },
	// ── Charts ──
	{ id: 'linechart', label: 'Line Chart', icon: demoIcons.linechart, href: '/demo/linechart', group: 'Charts' },
	{ id: 'device-line-chart-section', label: 'Device Chart Section', icon: demoIcons.deviceChart, href: '/demo/linechart#device-line-chart-section', group: 'Charts' },
	{ id: 'responsive-linechart', label: 'Responsive Line Chart', icon: demoIcons.responsiveChart, href: '/demo/responsive-linechart', group: 'Charts' },
	{ id: 'stackedbarchart', label: 'Stacked Bar Chart', icon: demoIcons.stackedbar, href: '/demo/stackedbarchart', group: 'Charts' },
	{ id: 'donutchart', label: 'Donut Chart', icon: demoIcons.donut, href: '/demo/donutchart', group: 'Charts' },
	{ id: 'heatmap', label: 'Heatmap', icon: demoIcons.heatmap, href: '/demo/heatmap', group: 'Charts' },
	{ id: 'dli-card', label: 'DLI Card', icon: demoIcons.dli, href: '/demo/dli-card', group: 'Charts' },
	{ id: 'ppfdchart', label: 'PPFD Chart', icon: demoIcons.ppfd, href: '/demo/ppfdchart', group: 'Charts' },
	{ id: 'vpdchart', label: 'VPD Chart', icon: demoIcons.vpd, href: '/demo/vpdchart', group: 'Charts' },
	{ id: 'abovebelowchart', label: 'Above & Below Chart', icon: demoIcons.aboveBelow, href: '/demo/abovebelowchart', group: 'Charts' },
	{ id: 'windcompass', label: 'Wind Compass', icon: demoIcons.wind, href: '/demo/windcompass', group: 'Charts' },
	// ── Helpers ──
	{ id: 'copy', label: 'Copy', icon: demoIcons.copy, href: '/demo/copy', group: 'Helpers' },
	{ id: 'duration', label: 'Duration', icon: demoIcons.duration, href: '/demo/duration', group: 'Helpers' },
	{ id: 'alarm', label: 'Alarm Scheduler', icon: demoIcons.alarm, href: '/demo/alarm', group: 'Helpers' },
	{ id: 'themepicker', label: 'Theme Picker', icon: demoIcons.theme, href: '/demo/themepicker', group: 'Helpers' },
	{ id: 'language-switcher', label: 'Language Switcher', icon: demoIcons.language, href: '/demo/language-switcher', group: 'Helpers' },
	// ── Full Page Demos ──
	{ id: 'data-display', label: 'Data Display', icon: demoIcons.dataDisplay, href: '/demo/data-display', group: 'Full Page Demos' },
];

/** Component entries (internal pages only), grouped for overviews. */
export function getDemoNavGroups(): Array<{ group: string; items: CwSideNavItem[] }> {
	const groups = new Map<string, CwSideNavItem[]>();
	for (const item of demoNavItems) {
		if (!item.group || item.group === 'General' || item.openExternalTab) continue;
		const list = groups.get(item.group) ?? [];
		list.push(item);
		groups.set(item.group, list);
	}
	return [...groups].map(([group, items]) => ({ group, items }));
}

/** Nav label for a route path, used for the document title. */
export function getDemoNavLabel(pathname: string): string | undefined {
	const normalized = pathname.replace(/\/+$/, '') || '/';
	return demoNavItems.find((item) => item.href === normalized)?.label;
}
