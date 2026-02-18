<script lang="ts">
	import '../../lib/styles/base.css';
	import type { Snippet } from 'svelte';
	import { CwSideNav, CwHeader } from '$lib/index.js';
	import type { CwSideNavItem, CwSideNavMode } from '$lib/index.js';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();

	// SVG path data for 16×16 viewBox icons
	const icons = {
		button: 'M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z',
		chip: 'M4 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM2 6.5A3.5 3.5 0 015.5 3h5A3.5 3.5 0 0114 6.5v3A3.5 3.5 0 0110.5 13h-5A3.5 3.5 0 012 9.5v-3z',
		card: 'M2 4a1 1 0 011-1h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 3h12',
		input: 'M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM5 7v2',
		dropdown: 'M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zM6 8l2 2 2-2',
		dialog: 'M2 3h12v10H2V3zm5 4h2m-1-1v2',
		toast: 'M2 4h12v3H2V4zm1 6h10v2H3v-2z',
		duration: 'M8 2a6 6 0 110 12A6 6 0 018 2zm0 3v3l2 2',
		search: 'M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13',
		table: 'M2 3h12v10H2V3zm0 3h12m0 3H2m4-6v6m4-6v6',
		linechart: 'M2 12l3-4 3 2 4-6 2 3',
		donut: 'M8 2a6 6 0 110 12A6 6 0 018 2zm0 3a3 3 0 100 6 3 3 0 000-6z',
		calendar: 'M3 4h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm2-2v3m6-3v3M2 7h12',
		theme: 'M8 2a6 6 0 100 12V2z',
		listbox: 'M3 4h10M3 8h10M3 12h10M2 4h0M2 8h0M2 12h0',
		profile: 'M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 14c0-2.8 2.2-5 5-5s5 2.2 5 5',
		sidenav: 'M2 2h12v12H2V2zm4 0v12',
		drawer: 'M2 2h12v12H2V2zm0 8h12',
		header: 'M2 2h12v3H2V2zm0 7h12v5H2V9z',
		tooltip: 'M8 2a6 6 0 110 12A6 6 0 018 2zm0 7v-3m0 5h.01'
	};

	const navItems: CwSideNavItem[] = [
		{ id: 'buttons', label: 'Button', icon: icons.button, href: '/demo/buttons' },
		{ id: 'chips', label: 'Chip', icon: icons.chip, href: '/demo/chips' },
		{ id: 'cards', label: 'Card', icon: icons.card, href: '/demo/cards' },
		{ id: 'inputs', label: 'Input', icon: icons.input, href: '/demo/inputs' },
		{ id: 'dropdown', label: 'Dropdown', icon: icons.dropdown, href: '/demo/dropdown' },
		{ id: 'dialog', label: 'Dialog', icon: icons.dialog, href: '/demo/dialog' },
		{ id: 'toast', label: 'Toast', icon: icons.toast, href: '/demo/toast' },
		{ id: 'duration', label: 'Duration', icon: icons.duration, href: '/demo/duration' },
		{ id: 'search', label: 'Search Input', icon: icons.search, href: '/demo/search' },
		{ id: 'datatable', label: 'Data Table', icon: icons.table, href: '/demo/datatable', separator: true },
		{ id: 'linechart', label: 'Line Chart', icon: icons.linechart, href: '/demo/linechart' },
		{ id: 'donutchart', label: 'Donut Chart', icon: icons.donut, href: '/demo/donutchart' },
		{ id: 'datepicker', label: 'Date Picker', icon: icons.calendar, href: '/demo/datepicker', separator: true },
		{ id: 'themepicker', label: 'Theme Picker', icon: icons.theme, href: '/demo/themepicker' },
		{ id: 'listbox', label: 'List Box', icon: icons.listbox, href: '/demo/listbox' },
		{ id: 'profilemenu', label: 'Profile Menu', icon: icons.profile, href: '/demo/profilemenu' },
		{ id: 'sidenav', label: 'Side Nav', icon: icons.sidenav, href: '/demo/sidenav' },
		{ id: 'drawer', label: 'Drawer', icon: icons.drawer, href: '/demo/drawer' },
		{ id: 'header', label: 'Header', icon: icons.header, href: '/demo/header' },
		{ id: 'tooltip', label: 'Tooltip', icon: icons.tooltip, href: '/demo/tooltip' }
	];

	let sideNavMode = $state<CwSideNavMode>('open');

	/** Derive active state from current route */
	const itemsWithActive = $derived(
		navItems.map((item) => ({
			...item,
			active: page.url.pathname === item.href
		}))
	);

	function handleToggleNav() {
		if (sideNavMode === 'hidden') {
			sideNavMode = 'open';
		} else {
			sideNavMode = 'hidden';
		}
	}
</script>

<svelte:head>
	<title>CropWatch UI – Component Library</title>
</svelte:head>

<div class="demo-shell">
	<CwSideNav items={itemsWithActive} bind:mode={sideNavMode} side="left" responsive>
		{#snippet header()}
			<div class="demo-shell__logo">
				<img src="/cropwatch_animated.svg" alt="CropWatch Logo" style="width:1.5rem;height:1.5rem" />
				<span class="demo-shell__logo-text">CropWatch UI</span>
			</div>
		{/snippet}
		{#snippet headerMini()}
			<img src="/cropwatch_animated.svg" alt="CropWatch Logo" style="width:1.25rem;height:1.25rem" />
		{/snippet}
	</CwSideNav>

	<div class="demo-shell__right">
		<CwHeader
			title="CropWatch UI"
			bind:sideNavMode
			onToggleNav={handleToggleNav}
		>
			{#snippet logo()}
				<img src="/cropwatch_animated.svg" alt="CropWatch Logo" style="width:1.5rem;height:1.5rem" />
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
		color: var(--cw-accent);
	}
</style>
