<script lang="ts">
	import "../../lib/styles/base.css";
	import type { Snippet } from "svelte";
	import { CwSideNav, CwHeader, CwButton, CwStatusDot } from "$lib/index.js";
	import type { CwSideNavItem, CwSideNavMode } from "$lib/index.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import CwSearchInput from "$lib/components/CwSearchInput.svelte";
	import CwThemePicker from "$lib/components/CwThemePicker.svelte";

	let { children }: { children: Snippet } = $props();

	// SVG path data for 16×16 viewBox icons
	const icons = {
		home: "M3 4l5-3 5 3v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4z",
		website:
			"M2 8a6 6 0 1112 0 6 6 0 01-12 0zm6-4a4 4 0 00-3.87 3h7.74A4 4 0 008 4zm0 8a4 4 0 003.87-3H4.13A4 4 0 008 12z",
		api: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2 2v2m4-2v2m-6-4h10",
		button: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z",
		chip: "M4 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM2 6.5A3.5 3.5 0 015.5 3h5A3.5 3.5 0 0114 6.5v3A3.5 3.5 0 0110.5 13h-5A3.5 3.5 0 012 9.5v-3z",
		badge: "M2 4h8a2 2 0 012 2v6H2V4zm10 1.5a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z",
		card: "M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 3h12",
		input: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM5 7v2",
		spinner: "M8 2a6 6 0 106 6M8 2a6 6 0 00-3.9 1.44",
		switch: "M2 8a4 4 0 014-4h4a4 4 0 010 8H6a4 4 0 01-4-4zm8 0a2 2 0 110-4 2 2 0 010 4z",
		statusdot:
			"M4 8a2 2 0 114 0 2 2 0 01-4 0zm4 0a2 2 0 114 0 2 2 0 01-4 0zm4 0a2 2 0 114 0 2 2 0 01-4 0z",
		offline:
			"M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0M3 3l18 18",
		dropdown:
			"M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM6 8l2 2 2-2",
		dialog: "M2 3h12v10H2V3zm5 4h2m-1-1v2",
		toast: "M2 4h12v3H2V4zm1 6h10v2H3v-2z",
		duration: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3v3l2 2",
		alarm: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 2v4m0 4h.01M3 3l10 10",
		search: "M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13",
		table: "M2 3h12v10H2V3zm0 3h12m0 3H2m4-6v6m4-6v6",
		linechart: "M2 12l3-4 3 2 4-6 2 3",
		donut: "M8 2a6 6 0 110 12A6 6 0 018 2zm0 3a3 3 0 100 6 3 3 0 000-6z",
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
		sensorcard:
			"M3 3h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm2 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0h2M5 10h6",
	};

	const navItems: CwSideNavItem[] = [
		{
			id: "main-home",
			label: "Home",
			icon: icons.home,
			href: "/demo/",
			group: "General",
		},
		{
			id: "website",
			label: "Website",
			icon: icons.website,
			href: "https://CropWatch.io",
			openExternalTab: true,
			group: "General",
		},
		{
			id: "api-docs",
			label: "API Docs",
			icon: icons.api,
			href: "https://api.CropWatch.io",
			openExternalTab: true,
			group: "General",
		},
		// ── Structure ──
		{
			id: "header",
			label: "Header",
			icon: icons.header,
			href: "/demo/header",
			group: "Structure",
		},
		{
			id: "sidenav",
			label: "Side Nav",
			icon: icons.sidenav,
			href: "/demo/sidenav",
			group: "Structure",
		},
		{
			id: "drawer",
			label: "Drawer",
			icon: icons.drawer,
			href: "/demo/drawer",
			group: "Structure",
		},
		{
			id: "expand",
			label: "Expand Panel",
			icon: icons.expand,
			href: "/demo/expand",
			group: "Structure",
		},

		// ── Charts ──
		{
			id: "linechart",
			label: "Line Chart",
			icon: icons.linechart,
			href: "/demo/linechart",
			group: "Charts",
			trailing: 2,
		},
		{
			id: "donutchart",
			label: "Donut Chart",
			icon: icons.donut,
			href: "/demo/donutchart",
			group: "Charts",
			trailing: 1,
		},
		{
			id: "heatmap",
			label: "Heatmap",
			icon: icons.heatmap,
			href: "/demo/heatmap",
			group: "Charts",
		},

		// ── Components ──
		{
			id: "buttons",
			label: "Button",
			icon: icons.button,
			href: "/demo/buttons",
			group: "Components",
		},
		{
			id: "chips",
			label: "Chip",
			icon: icons.chip,
			href: "/demo/chips",
			group: "Components",
		},
		{
			id: "badge",
			label: "Badge",
			icon: icons.badge,
			href: "/demo/badge",
			group: "Components",
		},
		{
			id: "cards",
			label: "Card",
			icon: icons.card,
			href: "/demo/cards",
			group: "Components",
		},
		{
			id: "inputs",
			label: "Input",
			icon: icons.input,
			href: "/demo/inputs",
			group: "Components",
		},
		{
			id: "switch",
			label: "Switch",
			icon: icons.switch,
			href: "/demo/switch",
			group: "Components",
		},
		{
			id: "spinner",
			label: "Spinner",
			icon: icons.spinner,
			href: "/demo/spinner",
			group: "Components",
		},
		{
			id: "statusdot",
			label: "Status Dot",
			icon: icons.statusdot,
			href: "/demo/statusdot",
			group: "Components",
		},
		{
			id: "offline",
			label: "Offline Overlay",
			icon: icons.offline,
			href: "/demo/offline",
			group: "Components",
			separator: true,
		},
		{
			id: "dropdown",
			label: "Dropdown",
			icon: icons.dropdown,
			href: "/demo/dropdown",
			group: "Components",
		},
		{
			id: "dialog",
			label: "Dialog",
			icon: icons.dialog,
			href: "/demo/dialog",
			group: "Components",
		},
		{
			id: "toast",
			label: "Toast",
			icon: icons.toast,
			href: "/demo/toast",
			group: "Components",
			trailing: 3,
		},
		{
			id: "datatable",
			label: "Data Table",
			icon: icons.table,
			href: "/demo/datatable",
			group: "Components",
			trailing: 12,
		},
		{
			id: "datepicker",
			label: "Date Picker",
			icon: icons.calendar,
			href: "/demo/datepicker",
			group: "Components",
		},
		{
			id: "calendar",
			label: "Calendar",
			icon: icons.calendar,
			href: "/demo/calendar",
			group: "Components",
		},
		{
			id: "listbox",
			label: "List Box",
			icon: icons.listbox,
			href: "/demo/listbox",
			group: "Components",
		},
		{
			id: "profilemenu",
			label: "Profile Menu",
			icon: icons.profile,
			href: "/demo/profilemenu",
			group: "Components",
		},
		{
			id: "search",
			label: "Search Input",
			icon: icons.search,
			href: "/demo/search",
			group: "Components",
			separator: true,
		},

		// ── Helpers ──
		{
			id: "tooltip",
			label: "Tooltip",
			icon: icons.tooltip,
			href: "/demo/tooltip",
			group: "Helpers",
		},
		{
			id: "copy",
			label: "Copy",
			icon: icons.copy,
			href: "/demo/copy",
			group: "Helpers",
		},
		{
			id: "duration",
			label: "Duration",
			icon: icons.duration,
			href: "/demo/duration",
			group: "Helpers",
			trailing: "new",
		},
		{
			id: "alarm",
			label: "Alarm Scheduler",
			icon: icons.alarm,
			href: "/demo/alarm",
			group: "Helpers",
			trailing: "new",
		},
		{
			id: "themepicker",
			label: "Theme Picker",
			icon: icons.theme,
			href: "/demo/themepicker",
			group: "Helpers",
		},
		{
			id: "login",
			label: "Login Screen",
			icon: icons.lock,
			href: "/demo/login-screen",
			group: "Full Page Demos",
			separator: true,
		},
		{
			id: "sensorcard",
			label: "Sensor Card",
			icon: icons.sensorcard,
			href: "/demo/sensorcard",
			group: "Full Page Demos",
		},
		];

	interface SideNavSearchSuggestion {
		id: string;
		label: string;
		href: string;
		group?: string;
		openExternalTab?: boolean;
	}

	let sideNavMode = $state<CwSideNavMode>("open");

	const sideNavSearchIndex: SideNavSearchSuggestion[] = navItems.flatMap((item) => {
		const href =
			item.href ??
			(typeof item.goto === "string" ? item.goto : undefined);

		if (!href || item.disabled) return [];

		return [
			{
				id: item.id,
				label: item.title ?? item.label,
				href,
				group: item.group,
				openExternalTab: item.openExternalTab,
			},
		];
	});

	function mapSideNavSuggestionToLabel(item: unknown) {
		const suggestion = item as SideNavSearchSuggestion;
		if (suggestion.group) {
			return `${suggestion.label} (${suggestion.group})`;
		}
		return suggestion.label;
	}

	function mapSideNavSuggestionToValue(item: unknown) {
		const suggestion = item as SideNavSearchSuggestion;
		return suggestion.href;
	}

	async function fetchSideNavSuggestions(
		query: string,
		signal: AbortSignal,
	): Promise<SideNavSearchSuggestion[]> {
		if (signal.aborted) {
			throw new DOMException("Aborted", "AbortError");
		}

		const normalized = query.trim().toLowerCase();
		if (!normalized) {
			return [];
		}

		return sideNavSearchIndex
			.filter((item) =>
				`${item.label} ${item.group ?? ""}`.toLowerCase().includes(normalized),
			)
			.slice(0, 12);
	}

	async function handleSideNavSearchSelect(_value: string, item: unknown) {
		const suggestion = item as SideNavSearchSuggestion;
		if (!suggestion?.href) return;

		if (suggestion.openExternalTab) {
			window.open(suggestion.href, "_blank", "noopener,noreferrer");
			return;
		}

		await goto(suggestion.href);
	}

	/** Derive active state from current route */
	const itemsWithActive = $derived(
		navItems.map((item) => ({
			...item,
			active:
				page.url.pathname ===
				(item.href ??
					(typeof item.goto === "string" ? item.goto : undefined)),
		})),
	);

	function handleToggleNav() {
		if (sideNavMode === "hidden") {
			sideNavMode = "open";
		} else {
			sideNavMode = "hidden";
		}
	}
</script>

<svelte:head>
	<title>CropWatch UI – Component Library</title>
</svelte:head>

<div class="demo-shell">
	<CwSideNav
		items={itemsWithActive}
		bind:mode={sideNavMode}
		side="left"
		responsive
	>
		{#snippet header()}
			<div class="demo-shell__logo">
				<img
					src="/cropwatch_animated.svg"
					alt="CropWatch Logo"
					style="width:1.5rem;height:1.5rem"
				/>
				<span class="demo-shell__logo-text">CropWatch UI</span>
			</div>
		{/snippet}
			{#snippet aboveContent()}
				<div>
					<CwSearchInput
						placeholder="Search components..."
						minChars={1}
						fetchSuggestions={fetchSideNavSuggestions}
						mapSuggestionToLabel={mapSideNavSuggestionToLabel}
						mapSuggestionToValue={mapSideNavSuggestionToValue}
						onselect={handleSideNavSearchSelect}
					/>
				</div>
			{/snippet}
		{#snippet itemTrailing(item)}
			{#if item.id === "offline"}
				<CwStatusDot status="loading" size="sm" />
			{:else if item.id === "search"}
				<CwButton
					size="sm"
					variant="ghost"
					class="demo-shell__quick-btn"
					onclick={(event) => {
						event.preventDefault();
						event.stopPropagation();
					}}
				>
					Go
				</CwButton>
			{/if}
		{/snippet}
		{#snippet headerMini()}
			<img
				src="/cropwatch_animated.svg"
				alt="CropWatch Logo"
				style="width:1.25rem;height:1.25rem"
			/>
		{/snippet}
	</CwSideNav>

	<div class="demo-shell__right">
		<CwHeader
			title="CropWatch UI"
			bind:sideNavMode
			onToggleNav={handleToggleNav}
		>
			{#snippet logo()}
				<a href="/" class="cw-header__logo">
					<img
						src="/cropwatch_animated.svg"
						alt="CropWatch Logo"
						style="width:1.5rem;height:1.5rem"
					/>
				</a>
			{/snippet}
			{#snippet actions()}
				<CwThemePicker onchange={(theme) => console.log(theme)} />
				<CwButton
					variant="info"
					onclick={() =>
						window.open(
							"https://github.com/CropWatchDevelopment/CWUI",
							"_blank",
						)}
				>
					Github
				</CwButton>
			{/snippet}
		</CwHeader>

		<main class="demo-shell__main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.demo-shell {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background-color: var(--cw-bg-base);
		color: var(--cw-text-primary);
		font-family: var(--cw-font-family);
	}

	.demo-shell__right {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.demo-shell__main {
		flex: 1;
		padding: var(--cw-space-6);
		overflow-y: auto;
		background-color: var(--cw-bg-base);
	}

	.demo-shell__logo {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.demo-shell__logo-text {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		color: #8eb0e6;
	}

	:global(.demo-shell__quick-btn) {
		padding: 0.2rem 0.45rem;
		min-height: 1.35rem;
		font-size: 0.6875rem;
	}
</style>
