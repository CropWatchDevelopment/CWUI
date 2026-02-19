<script lang="ts">
	import { CwSideNav, CwButton } from "$lib/index.js";
	import type { CwSideNavItem, CwSideNavMode } from "$lib/index.js";
	import DemoCodeExample from "../_components/DemoCodeExample.svelte";

	// SVG path data for demo icons (16×16 viewBox, stroke-based)
	const icons = {
		home: "M2 8.5l6-5.5 6 5.5M4 7.5V13a1 1 0 001 1h2v-3h2v3h2a1 1 0 001-1V7.5",
		chart: "M3 13V7m3.5 6V5M10 13V3m3.5 10V8",
		settings:
			"M8 10a2 2 0 100-4 2 2 0 000 4zM12.5 8a4.5 4.5 0 01-.3 1.6l1.3 1.3-1.1 1.1-1.3-1.3A4.5 4.5 0 018 12.5a4.5 4.5 0 01-3.1-1.8L3.5 12l-1-1.1 1.3-1.3A4.5 4.5 0 013.5 8c0-.6.1-1.1.3-1.6L2.5 5.1l1.1-1.1 1.3 1.3A4.5 4.5 0 018 3.5c1.2 0 2.3.5 3.1 1.3l1.3-1.3 1.1 1.1-1.3 1.3c.2.5.3 1 .3 1.6z",
		users: "M5.5 7.5a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zM2 13c0-2 1.5-3.5 3.5-3.5S9 11 9 13m-2-3.5c.5-.3 1.2-.5 2-.5 2 0 3.5 1.5 3.5 3.5",
		bell: "M4 10V7a4 4 0 118 0v3l1.5 2H2.5L4 10zm3 4h2",
		folder: "M2 4.5A1.5 1.5 0 013.5 3H6l1.5 1.5h5A1.5 1.5 0 0114 6v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12V4.5z",
	};

	const demoItems: CwSideNavItem[] = [
		{
			id: "home",
			label: "Dashboard",
			icon: icons.home,
			href: "#",
			active: true,
		},
		{ id: "analytics", label: "Analytics", icon: icons.chart, href: "#" },
		{ id: "users", label: "Users", icon: icons.users, href: "#" },
		{
			id: "notifications",
			label: "Notifications",
			icon: icons.bell,
			href: "#",
			separator: true,
		},
		{ id: "files", label: "Files", icon: icons.folder, href: "#" },
		{
			id: "settings",
			label: "Settings",
			icon: icons.settings,
			href: "#",
			separator: true,
		},
		{
			id: "disabled",
			label: "Archived",
			icon: icons.folder,
			disabled: true,
		},
	];

	let mode = $state<CwSideNavMode>("open");
	let side = $state<"left" | "right">("left");

	let activeId = $state("home");

	$effect(() => {
		demoItems.forEach((item) => (item.active = item.id === activeId));
	});

	function handleSelect(item: CwSideNavItem) {
		activeId = item.id;
	}

	const sideNavExample = `<CwSideNav
\titems={items}
\tbind:mode={mode}
\tside="left"
\tonselect={(item) => (activeId = item.id)}
/>`;
</script>

<h2>CwSideNav</h2>
<p class="demo-desc">
	Collapsible side navigation with open, mini, and hidden modes. Supports
	left/right positioning, header, footer, and icon-only mini mode.
</p>

<div class="demo-controls">
	<div class="demo-controls__group">
		<span class="demo-controls__label">Mode</span>
		<CwButton
			size="sm"
			variant={mode === "open" ? "primary" : "secondary"}
			onclick={() => (mode = "open")}>Open</CwButton
		>
		<CwButton
			size="sm"
			variant={mode === "mini" ? "primary" : "secondary"}
			onclick={() => (mode = "mini")}>Mini</CwButton
		>
		<CwButton
			size="sm"
			variant={mode === "hidden" ? "primary" : "secondary"}
			onclick={() => (mode = "hidden")}>Hidden</CwButton
		>
	</div>
	<div class="demo-controls__group">
		<span class="demo-controls__label">Side</span>
		<CwButton
			size="sm"
			variant={side === "left" ? "primary" : "secondary"}
			onclick={() => (side = "left")}>Left</CwButton
		>
		<CwButton
			size="sm"
			variant={side === "right" ? "primary" : "secondary"}
			onclick={() => (side = "right")}>Right</CwButton
		>
	</div>
</div>

<div class="demo-frame" class:demo-frame--reversed={side === "right"}>
	<CwSideNav items={demoItems} bind:mode {side} onselect={handleSelect}>
		{#snippet header()}
			<div class="demo-logo">
				<img
					src="/cropwatch_animated.svg"
					alt="CropWatch Logo"
					style="width:1.5rem;height:1.5rem"
				/>
				<span class="demo-logo__text">CropWatch</span>
			</div>
		{/snippet}
		{#snippet headerMini()}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				style="width:1.25rem;height:1.25rem;color:var(--cw-accent)"
			>
				<path
					d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/snippet}
		{#snippet footer()}
			<span class="demo-version">v0.1.0</span>
		{/snippet}
		{#snippet footerMini()}
			<span class="demo-version" title="v0.1.0">v</span>
		{/snippet}
	</CwSideNav>

	<div class="demo-content">
		<p>Active: <strong>{activeId}</strong></p>
		<p>Mode: <strong>{mode}</strong></p>
		<p>Side: <strong>{side}</strong></p>
	</div>
</div>

<DemoCodeExample code={sideNavExample} title="CwSideNav example" />

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}
	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-controls {
		display: flex;
		gap: var(--cw-space-4);
		flex-wrap: wrap;
		margin-bottom: var(--cw-space-4);
	}

	.demo-controls__group {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.demo-controls__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
	}

	.demo-frame {
		display: flex;
		height: 28rem;
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		overflow: hidden;
		background-color: var(--cw-bg-base);
	}

	.demo-frame--reversed {
		flex-direction: row-reverse;
	}

	.demo-content {
		flex: 1;
		padding: var(--cw-space-6);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-content strong {
		color: var(--cw-accent);
	}

	.demo-logo {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.demo-logo__text {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		color: var(--cw-accent);
	}

	.demo-version {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}
</style>
