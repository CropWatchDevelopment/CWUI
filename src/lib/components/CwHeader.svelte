<script lang="ts">
    import type { Snippet } from "svelte";
    import type { CwSideNavMode } from "../types/index.js";

    interface Props {
        /** Snippet for the logo (e.g. <img> or <svg>). Always visible on desktop/tablet, visible on mobile. */
        logo?: Snippet;
        /** Application name / text. Visible on desktop only. */
        title?: string;
        /** Bind to the sidenav mode — the header shows/hides the hamburger accordingly */
        sideNavMode?: CwSideNavMode;
        /** Callback to toggle the sidenav open (fired by hamburger click) */
        onToggleNav?: () => void;
        /** Extra content rendered on the right side of the header (e.g. profile menu, theme picker) */
        actions?: Snippet;
        class?: string;
    }

    let {
        logo,
        title = "",
        sideNavMode = $bindable<CwSideNavMode>("open"),
        onToggleNav,
        actions,
        class: className = "",
    }: Props = $props();

    function handleHamburger() {
        if (onToggleNav) {
            onToggleNav();
        } else {
            // Default: cycle hidden → open
            if (sideNavMode === "hidden") {
                sideNavMode = "open";
            } else if (sideNavMode === "mini") {
                sideNavMode = "open";
            } else {
                sideNavMode = "hidden";
            }
        }
    }
</script>

<header class="cw-header {className}">
    <!-- Hamburger button — hidden on desktop when nav is open/mini, shown on tablet/phone -->
    <button
        type="button"
        class="cw-header__hamburger"
        onclick={handleHamburger}
        aria-label="Toggle navigation"
        aria-expanded={sideNavMode !== "hidden"}
    >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
                d="M3 4h10M3 8h10M3 12h10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
            />
        </svg>
    </button>

    <!-- Logo — visible on desktop and tablet, hidden on phone -->

    {#if sideNavMode !== "open"}
    <a href="/" class="cw-header__link">
        {#if logo}
            <div class="cw-header__logo">
                {@render logo()}
            </div>
        {/if}

        <!-- Title text — desktop only -->
        {#if title}
            <span class="cw-header__title">{title}</span>
        {/if}
    </a>
    {/if}

    <!-- Spacer pushes actions to the right -->
    <div class="cw-header__spacer"></div>

    <!-- Actions slot (right side) -->
    {#if actions}
        <div class="cw-header__actions">
            {@render actions()}
        </div>
    {/if}
</header>

<style>
    /* ── Breakpoints ──────────────────────────
	   Phone:  < 640px
	   Tablet: 640px – 1023px
	   Desktop: >= 1024px
	   ──────────────────────────────────────── */

    .cw-header {
        position: relative;
        z-index: var(--cw-z-sticky);
        display: flex;
        align-items: center;
        gap: var(--cw-space-3);
        height: 5rem;
        padding: 0 var(--cw-space-4);
        background-color: var(--cw-header-bg);
        border-bottom: 2px solid var(--cw-border-muted);
        font-family: var(--cw-font-family);
        flex-shrink: 0;
    }

    /* ── Hamburger ─────────────────────────── */
    .cw-header__hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--cw-radius-md);
        color: var(--cw-text-primary);
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color var(--cw-duration-fast)
            var(--cw-ease-default);
    }

    .cw-header__hamburger:hover {
        background-color: color-mix(in srgb, var(--cw-text-inverse) 20%, transparent);
    }

    .cw-header__hamburger:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px
            color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
    }

    .cw-header__hamburger svg {
        width: 1.25rem;
        height: 1.25rem;
    }

    /* Desktop: hide hamburger when sidenav is open or mini */
    @media (min-width: 1024px) {
        .cw-header__hamburger {
            display: none;
        }
    }

    /* ── Logo ──────────────────────────────── */

    .cw-header__link {
        display: flex;
        align-items: center;
        gap: var(--cw-space-3);
        text-decoration: none;
    }

    .cw-header__logo {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    /* Phone: hide logo */
    @media (max-width: 639px) {
        .cw-header__logo {
            display: none;
        }
    }

    /* ── Title ─────────────────────────────── */
    .cw-header__title {
        font-size: var(--cw-text-base);
        font-weight: var(--cw-font-bold);
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Tablet and phone: hide title */
    @media (max-width: 1023px) {
        .cw-header__title {
            display: none;
        }
    }

    /* ── Spacer ───────────────────────────── */
    .cw-header__spacer {
        flex: 1;
    }

    /* ── Actions ──────────────────────────── */
    .cw-header__actions {
        display: flex;
        align-items: center;
        gap: var(--cw-space-2);
        flex-shrink: 0;
    }
</style>
