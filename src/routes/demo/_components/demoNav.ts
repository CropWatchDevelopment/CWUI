import type { CwSideNavItem } from '$lib/index.js';

/** SVG path data for 16×16 viewBox icons. */
export const demoIcons = {
	home: "M3 4l5-3 5 3v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4z",
	website:
		"M2 8a6 6 0 1112 0 6 6 0 01-12 0zm6-4a4 4 0 00-3.87 3h7.74A4 4 0 008 4zm0 8a4 4 0 003.87-3H4.13A4 4 0 008 12z",
	api: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2 2v2m4-2v2m-6-4h10",
	button: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z",
	chip: "M4 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM2 6.5A3.5 3.5 0 015.5 3h5A3.5 3.5 0 0114 6.5v3A3.5 3.5 0 0110.5 13h-5A3.5 3.5 0 012 9.5v-3z",
	badge: "M2 4h8a2 2 0 012 2v6H2V4zm10 1.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z",
	card: "M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 3h12",
	cardDataRow:
		"M2.5 4h11M2.5 8h11M2.5 12h11M4 4a.5.5 0 100 1 .5.5 0 000-1zm0 4a.5.5 0 100 1 .5.5 0 000-1zm0 4a.5.5 0 100 1 .5.5 0 000-1z",
	input: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM5 7v2",
	alertPoints:
		"M2 8h12M4.5 6.5v3M8 4v8M11.5 6.5v3M9.5 8a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0",
	spinner: "M8 2a6 6 0 106 6M8 2a6 6 0 00-3.9 1.44",
	switch: "M2 8a4 4 0 014-4h4a4 4 0 010 8H6a4 4 0 01-4-4zm8 0a2 2 0 110-4 2 2 0 010 4z",
	checkbox: "M3 3h10v10H3V3zm2.2 5.1l1.7 1.7L10.8 6",
	radio: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3a3 3 0 100 6 3 3 0 000-6z",
	statusdot:
		"M4 8a2 2 0 114 0 2 2 0 01-4 0zm4 0a2 2 0 114 0 2 2 0 01-4 0zm4 0a2 2 0 114 0 2 2 0 01-4 0z",
	offline:
		"M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0M3 3l18 18",
	dropdown:
		"M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM6 8l2 2 2-2",
	multiSelect:
		"M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM5 6.5h2v2H5v-2zm0 3h2v2H5v-2zM8.5 7h3M8.5 10h3",
	dialog: "M2 3h12v10H2V3zm5 4h2m-1-1v2",
	toast: "M2 4h12v3H2V4zm1 6h10v2H3v-2z",
	duration: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3v3l2 2",
	alarm: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 2v4m0 4h.01M3 3l10 10",
	search: "M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13",
	language:
		"M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5c.9 0 1.9 1.4 2.3 3.5H5.7C6.1 4.9 7.1 3.5 8 3.5zM5.7 9h4.6c-.4 2.1-1.4 3.5-2.3 3.5-.9 0-1.9-1.4-2.3-3.5zM3.6 7A4.5 4.5 0 017 3.6 8.2 8.2 0 005.9 7H3.6zm0 2h2.3A8.2 8.2 0 007 12.4 4.5 4.5 0 013.6 9zm8.8 0h2.3A4.5 4.5 0 019 12.4 8.2 8.2 0 0010.1 9h2.3zm0-2A8.2 8.2 0 009 3.6 4.5 4.5 0 0112.4 7h-2.3z",
	textarea: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2 2h6M5 8h6M5 10h4",
	table: "M2 3h12v10H2V3zm0 3h12m0 3H2m4-6v6m4-6v6",
	linechart: "M2 12l3-4 3 2 4-6 2 3",
	donut: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3a3 3 0 100 6 3 3 0 000-6z",
	dli: "M2 8h12M4 6v4m6-4v4M9 5.5h3v5H9v-5zM6.5 3v10",
	ppfd: "M2 11a6 6 0 1112 0H2zm6-3 2.75-2.25M8 6.5v.01",
	vpd: "M2.5 11a5.5 5.5 0 1111 0h-11zm5.5-4.2v2.7m0 0L6.4 8.1M8 9.5l1.6-1.4",
	aboveBelow: "M1.5 8h13M4 6V3.5M8 6V2.5M12 6V4.5M4 10v2M8 10v3.5M12 10v1.5",
	wind: "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 8L11 4M8 8L4 11M8 8a1 1 0 100-2 1 1 0 000 2z",
	calendar:
		"M3 4h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2-2v3m6-3v3M2 7h12",
	theme: "M8 2a6 6 0 100 12V2z",
	listbox: "M3 4h10M3 8h10M3 12h10M2 4h0M2 8h0M2 12h0",
	profile:
		"M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 14c0-2.8 2.2-5 5-5s5 2.2 5 5",
	sidenav: "M2 2h12v12H2V2zm4 0v12",
	drawer: "M2 2h12v12H2V2zm0 8h12",
	header: "M2 2h12v3H2V2zm0 7h12v5H2V9z",
	tooltip: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 7v-3m0 5h.01",
	copy: "M5 3h8a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1zM3 5v8a1 1 0 001 1h6",
	expand: "M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 3h8M6 9l2 2 2-2",
	heatmap:
		"M2 2h3v3H2V2zm4 0h3v3H6V2zm4 0h3v3h-3V2zM2 6h3v3H2V6zm4 0h3v3H6V6zm4 0h3v3h-3V6zM2 10h3v3H2v-3zm4 0h3v3H6v-3zm4 0h3v3h-3v-3z",
	lock: "M6 6V4a2 2 0 114 0v2h2a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h2zm1 4v2m0-2a1 1 0 110 2 1 1 0 010-2z",
	dataDisplay:
		"M2.5 3.5h11a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-7a1 1 0 011-1zm1.5 2h7m-7 2.5h5m3 0h.01M4 10.5h3.5m4-4 1.5 1.5L14 6",
	sensorcard:
		"M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm2 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0h2M5 10h6",
	stackedbar: "M3 13V9h2v4H3zm4 0V5h2v8H7zm4 0V7h2v6h-2zM2 13.5h12",
	separator: "M2 8h12M4 4h8M4 12h8",
	location: "M8 14s-4.5-4.2-4.5-7.5a4.5 4.5 0 019 0C12.5 9.8 8 14 8 14zm0-6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
	datalist: "M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01",
	statcard: "M2 3h12v10H2V3zm2 7l2.5-2.5 2 2L12 6",
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
	{ id: 'datepicker', label: 'Date Picker', icon: demoIcons.calendar, href: '/demo/datepicker', group: 'Form Controls' },
	{ id: 'time', label: 'Time Picker', icon: demoIcons.duration, href: '/demo/time', group: 'Form Controls' },
	{ id: 'calendar', label: 'Calendar', icon: demoIcons.calendar, href: '/demo/calendar', group: 'Form Controls' },
	{ id: 'calendar-scroll', label: 'Calendar Scroll', icon: demoIcons.calendar, href: '/demo/calendar-scroll', group: 'Form Controls' },
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
	{ id: 'device-line-chart-section', label: 'Device Chart Section', icon: demoIcons.linechart, href: '/demo/linechart#device-line-chart-section', group: 'Charts' },
	{ id: 'responsive-linechart', label: 'Responsive Line Chart', icon: demoIcons.linechart, href: '/demo/responsive-linechart', group: 'Charts' },
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
