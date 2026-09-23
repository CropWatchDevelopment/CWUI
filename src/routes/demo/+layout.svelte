<script lang="ts">
	import "../../lib/styles/base.css";
	import "./_components/demo.css";
	import type { Snippet } from "svelte";
	import { CwSideNav, CwHeader, CwButton } from "$lib/index.js";
	import type { CwSideNavMode } from "$lib/index.js";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import CwSearchInput from "$lib/components/CwSearchInput.svelte";
	import CwThemePicker from "$lib/components/CwThemePicker.svelte";
	import DemoPageDocs from "./_components/DemoPageDocs.svelte";
	import { demoRouteDocs } from "./_components/demoPageDocs";
	import { demoNavItems, getDemoNavLabel } from "./_components/demoNav";

	let { children }: { children: Snippet } = $props();

	const navItems = demoNavItems;
	const normalizedPath = $derived(page.url.pathname.replace(/\/+$/, "") || "/");

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
				normalizedPath ===
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

	const activeDemoDocs = $derived(demoRouteDocs[normalizedPath]);
	const pageLabel = $derived(
		normalizedPath === "/demo" ? undefined : getDemoNavLabel(normalizedPath),
	);
	const documentTitle = $derived(
		pageLabel ? `${pageLabel} · CropWatch UI` : "CropWatch UI · Component Library",
	);
</script>

<svelte:head>
	<title>{documentTitle}</title>
</svelte:head>

<div class="demo-shell">
	<CwSideNav
		items={itemsWithActive}
		bind:mode={sideNavMode}
		side="left"
		responsive
	>
		{#snippet header()}
			<a href="/demo" class="demo-shell__logo">
				<img
					class="demo-shell__logo-img"
					src="/cropwatch_animated.svg"
					alt=""
				/>
				<span class="demo-shell__logo-text">CropWatch<sup>®</sup> UI</span>
			</a>
		{/snippet}
		{#snippet aboveContent()}
			<CwSearchInput
				ariaLabel="Search components"
				placeholder="Search components…"
				minChars={1}
				fetchSuggestions={fetchSideNavSuggestions}
				mapSuggestionToLabel={mapSideNavSuggestionToLabel}
				mapSuggestionToValue={mapSideNavSuggestionToValue}
				onselect={handleSideNavSearchSelect}
			/>
		{/snippet}
		{#snippet headerMini()}
			<img
				class="demo-shell__logo-img demo-shell__logo-img--mini"
				src="/cropwatch_animated.svg"
				alt="CropWatch UI"
			/>
		{/snippet}
	</CwSideNav>

	<div class="demo-shell__right">
		<CwHeader
			title="CropWatch® UI"
			href="/demo"
			homeLabel="CropWatch UI home"
			bind:sideNavMode
			onToggleNav={handleToggleNav}
		>
			{#snippet logo()}
				<img
					class="demo-shell__logo-img"
					src="/cropwatch_animated.svg"
					alt=""
				/>
			{/snippet}
			{#snippet actions()}
				<CwThemePicker />
				<CwButton
					variant="info"
					onclick={() =>
						window.open(
							"https://github.com/CropWatchDevelopment/CWUI",
							"_blank",
							"noopener,noreferrer",
						)}
				>
					GitHub
				</CwButton>
			{/snippet}
		</CwHeader>

		<main class="demo-shell__main">
			<div class="demo-shell__page">
				{#if activeDemoDocs}
					<nav class="demo-shell__jump" aria-label="On this page">
						<a href="#api-reference">API reference</a>
					</nav>
				{/if}
				{@render children()}
				{#if activeDemoDocs}
					<DemoPageDocs docs={activeDemoDocs} />
				{/if}
			</div>
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
		min-width: 0;
		padding: var(--cw-space-6);
		overflow-x: hidden;
		overflow-y: auto;
		background-color: var(--cw-bg-base);
	}

	@media (max-width: 600px) {
		.demo-shell__main {
			padding: var(--cw-space-2);
		}
	}

	.demo-shell__page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--cw-space-1);
	}

	.demo-shell__logo {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-width: 0;
		color: var(--cw-header-fg);
		text-decoration: none;
	}

	.demo-shell__logo-img {
		display: block;
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
	}

	.demo-shell__logo-img--mini {
		width: 1.25rem;
		height: 1.25rem;
	}

	.demo-shell__logo-text {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		font-style: italic;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--cw-header-fg);
	}

	.demo-shell__logo-text sup {
		font-size: 0.6em;
		font-style: normal;
	}

	.demo-shell__jump {
		display: flex;
		justify-content: flex-end;
		font-size: var(--cw-text-sm);
	}

	.demo-shell__jump a {
		color: var(--cw-accent-text);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
