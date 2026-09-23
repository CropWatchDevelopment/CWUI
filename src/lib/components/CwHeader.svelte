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
        /** Destination of the logo/title link. Pass `null` to render it without a link. */
        href?: string | null;
        /** Accessible name for the home link (defaults to `title`, then "Home"). */
        homeLabel?: string;
        /** Accessible label for the hamburger button. */
        toggleNavLabel?: string;
        class?: string;
    }

    let {
        logo,
        title = "",
        sideNavMode = $bindable<CwSideNavMode>("open"),
        onToggleNav,
        actions,
        href = "/",
        homeLabel,
        toggleNavLabel = "Toggle navigation",
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

<header class={["cw-header", className]}>
    <!-- Hamburger — always shown on tablet/phone; on desktop only while the nav is hidden
         (otherwise the nav's own collapse control is used). -->
    <button
        type="button"
        class={[
            "cw-header__hamburger",
            sideNavMode === "hidden" && "cw-header__hamburger--always",
        ]}
        onclick={handleHamburger}
        aria-label={toggleNavLabel}
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

    {#if sideNavMode !== "open" && (logo || title)}
        {#if href}
            <a {href} class="cw-header__link" aria-label={homeLabel ?? (title || "Home")}>
                {#if logo}
                    <div class="cw-header__logo">
                        {@render logo()}
                    </div>
                {/if}
                {#if title}
                    <span class="cw-header__title" aria-hidden="true">{title}</span>
                {/if}
            </a>
        {:else}
            <div class="cw-header__link">
                {#if logo}
                    <div class="cw-header__logo">
                        {@render logo()}
                    </div>
                {/if}
                {#if title}
                    <span class="cw-header__title">{title}</span>
                {/if}
            </div>
        {/if}
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
        height: calc(5rem + env(safe-area-inset-top, 0px));
        padding: env(safe-area-inset-top, 0px)
            max(var(--cw-space-4), env(safe-area-inset-right, 0px)) 0
            max(var(--cw-space-4), env(safe-area-inset-left, 0px));
        background-color: var(--cw-header-bg);
        color: var(--cw-header-fg);
        border-bottom: 2px solid var(--cw-border-muted);
        font-family: var(--cw-font-family);
        flex-shrink: 0;
        min-width: 0;
    }

    /* ── Hamburger ─────────────────────────── */
    .cw-header__hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        margin-inline-start: calc(-1 * var(--cw-space-2));
        padding: 0;
        background: none;
        border: none;
        border-radius: var(--cw-radius-md);
        color: var(--cw-header-fg);
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color var(--cw-duration-fast)
            var(--cw-ease-default);
    }

    .cw-header__hamburger:hover {
        background-color: color-mix(in srgb, var(--cw-header-fg) 16%, transparent);
    }

    .cw-header__hamburger svg {
        width: 1.25rem;
        height: 1.25rem;
    }

    /* Desktop: the nav has its own collapse control, so only show the hamburger
       when the nav is fully hidden (otherwise there'd be no way to reopen it). */
    @media (min-width: 1024px) {
        .cw-header__hamburger:not(.cw-header__hamburger--always) {
            display: none;
        }
    }

    /* ── Logo / home link ──────────────────── */
    .cw-header__link {
        display: flex;
        align-items: center;
        gap: var(--cw-space-3);
        min-width: 0;
        color: inherit;
        text-decoration: none;
        border-radius: var(--cw-radius-md);
    }

    .cw-header__logo {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    /* ── Title ─────────────────────────────── */
    .cw-header__title {
        min-width: 0;
        font-size: var(--cw-text-base);
        font-weight: var(--cw-font-bold);
        color: var(--cw-header-fg);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Phone: the title is dropped for space; the logo stays so the app is still branded. */
    @media (max-width: 639px) {
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
        flex-shrink: 1;
        min-width: 0;
    }
</style>
