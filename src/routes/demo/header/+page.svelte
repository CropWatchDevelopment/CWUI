<script lang="ts">
    import { CwHeader, CwSideNav, CwButton, CwChip, CwProfileMenu } from "$lib/index.js";
    import type { CwSideNavItem, CwSideNavMode, CwProfileMenuItem } from "$lib/index.js";

    let sideNavMode = $state<CwSideNavMode>("open");

    const demoItems: CwSideNavItem[] = [
        {
            id: "home",
            label: "Home",
            icon: "M8 1.5L1 7h2v6h4V9h2v4h4V7h2L8 1.5z",
        },
        { id: "devices", label: "Devices", icon: "M3 3h10v8H3V3zm2 10h6" },
        {
            id: "alerts",
            label: "Alerts",
            icon: "M8 2L2 13h12L8 2zm0 4v3m0 1.5h0",
        },
        {
            id: "settings",
            label: "Settings",
            icon: "M8 10a2 2 0 100-4 2 2 0 000 4zM13.5 8l-1-1.7.7-.7-1-1-.7.7L10 4.5V3H6v1.5L4.5 5.3l-.7-.7-1 1 .7.7L2.5 8l1 1.7-.7.7 1 1 .7-.7L6 11.5V13h4v-1.5l1.5-.8.7.7 1-1-.7-.7L13.5 8z",
        },
    ];

    const menuItems: CwProfileMenuItem[] = [
		{ id: 'profile', label: 'My Profile' },
		{ id: 'settings', label: 'Account Settings' },
		{ id: 'api-keys', label: 'API Keys' },
		{ id: 'signout', label: 'Sign Out', separator: true, danger: true }
	];

    let activeId = $state("home");
    const itemsWithActive = $derived(
        demoItems.map((item) => ({ ...item, active: item.id === activeId })),
    );
</script>

<h2>CwHeader</h2>
<p class="demo-desc">
    Responsive app header with logo, title, hamburger menu, and action slots.
    Resize the demo frame or your browser to see breakpoint behaviour.
</p>

<h3>Breakpoint behaviour</h3>
<div class="bp-table">
    <div class="bp-row">
        <CwChip
            label="Desktop >= 1024px"
            tone="success"
            variant="soft"
            size="sm"
        />
        <span>Logo + Title visible, hamburger hidden</span>
    </div>
    <div class="bp-row">
        <CwChip
            label="Tablet 640-1023px"
            tone="info"
            variant="soft"
            size="sm"
        />
        <span>Logo + Hamburger visible, title hidden</span>
    </div>
    <div class="bp-row">
        <CwChip label="Phone < 640px" tone="warning" variant="soft" size="sm" />
        <span>Hamburger only</span>
    </div>
</div>

<h3>Live demo</h3>
<p class="demo-desc">
    SideNav mode: <strong>{sideNavMode}</strong> — resize your browser to see sidenav
    auto-adapt (responsive mode).
</p>

<div class="demo-frame">
    <CwSideNav
        items={itemsWithActive}
        bind:mode={sideNavMode}
        responsive
        onselect={(item) => (activeId = item.id)}
    >
        {#snippet header()}
            <span
                style="font-weight:var(--cw-font-bold); color:var(--cw-accent);"
                >MyApp</span
            >
        {/snippet}
        {#snippet headerMini()}
            <span
                style="font-weight:var(--cw-font-bold); color:var(--cw-accent); font-size:var(--cw-text-xs);"
                >M</span
            >
        {/snippet}
    </CwSideNav>

    <div class="demo-right">
        <CwHeader title="My Application" bind:sideNavMode>
            {#snippet logo()}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    style="width:1.5rem;height:1.5rem;color:var(--cw-accent)"
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
            {#snippet actions()}
                <CwButton size="sm" variant="ghost">Help</CwButton>
                <CwProfileMenu
                    name="kevin@cropwatch.io"
                    subtitle="Administrator"
                    {menuItems}
                    onselect={(item) => console.log("Menu:", item.id)}
                />
            {/snippet}
        </CwHeader>

        <div class="demo-content">
            <p style="color: var(--cw-text-muted);">
                Page content goes here. Active: <strong>{activeId}</strong>
            </p>
        </div>
    </div>
</div>

<h3>Manual mode control</h3>
<div class="mode-controls">
    <CwButton
        size="sm"
        variant={sideNavMode === "open" ? "primary" : "secondary"}
        onclick={() => (sideNavMode = "open")}>Open</CwButton
    >
    <CwButton
        size="sm"
        variant={sideNavMode === "mini" ? "primary" : "secondary"}
        onclick={() => (sideNavMode = "mini")}>Mini</CwButton
    >
    <CwButton
        size="sm"
        variant={sideNavMode === "hidden" ? "primary" : "secondary"}
        onclick={() => (sideNavMode = "hidden")}>Hidden</CwButton
    >
</div>

<style>
    h2 {
        font-size: var(--cw-text-xl);
        font-weight: var(--cw-font-bold);
        margin-bottom: var(--cw-space-2);
    }
    h3 {
        font-size: var(--cw-text-base);
        font-weight: var(--cw-font-semibold);
        margin-top: var(--cw-space-5);
        margin-bottom: var(--cw-space-2);
        color: var(--cw-text-primary);
    }
    .demo-desc {
        color: var(--cw-text-muted);
        font-size: var(--cw-text-sm);
        margin-bottom: var(--cw-space-4);
    }

    .bp-table {
        display: flex;
        flex-direction: column;
        gap: var(--cw-space-2);
        margin-bottom: var(--cw-space-4);
    }
    .bp-row {
        display: flex;
        align-items: center;
        gap: var(--cw-space-3);
        font-size: var(--cw-text-sm);
        color: var(--cw-text-secondary);
    }

    .demo-frame {
        display: flex;
        border: 1px solid var(--cw-border-muted);
        border-radius: var(--cw-radius-lg);
        overflow: hidden;
        height: 20rem;
        background-color: var(--cw-bg-base);
    }

    .demo-right {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
    }

    .demo-content {
        flex: 1;
        padding: var(--cw-space-4);
        overflow-y: auto;
    }

    .mode-controls {
        display: flex;
        gap: var(--cw-space-2);
        margin-top: var(--cw-space-2);
    }
</style>
