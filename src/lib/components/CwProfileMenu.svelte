<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwProfileMenuItem } from '../types/index.js';
	import CwSeparator from './CwSeparator.svelte';

	interface Props {
		/** User display name */
		name: string;
		/** User role or subtitle */
		subtitle?: string;
		/** Avatar image URL. Falls back to initials. */
		avatarUrl?: string;
		/** Menu items shown in the dropdown */
		menuItems?: CwProfileMenuItem[];
		/** Called when a menu item is clicked */
		onselect?: (item: CwProfileMenuItem) => void;
		/** Optional custom icon rendered in the trigger button */
		icon?: Snippet;
		/** Custom avatar snippet */
		avatar?: Snippet;
		class?: string;
	}

	let {
		name,
		subtitle,
		avatarUrl,
		menuItems = [],
		onselect,
		icon,
		avatar,
		class: className = ''
	}: Props = $props();

	let open = $state(false);

	const initials = $derived(
		name
			.split(/[\s@]+/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	function selectItem(item: CwProfileMenuItem) {
		onselect?.(item);
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-profile-menu__backdrop" onclick={() => (open = false)} onkeydown={() => {}}></div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="cw-profile-menu {className}" onkeydown={handleKeydown}>
	<button
		type="button"
		class="cw-profile-menu__trigger"
		class:cw-profile-menu__trigger--open={open}
		onclick={() => (open = !open)}
		aria-haspopup="menu"
		aria-expanded={open}
	>
		<!-- Avatar -->
		<span class="cw-profile-menu__avatar">
			{#if avatar}
				{@render avatar()}
			{:else if avatarUrl}
				<img class="cw-profile-menu__avatar-img" src={avatarUrl} alt={name} />
			{:else}
				<span class="cw-profile-menu__avatar-initials">{initials}</span>
			{/if}
		</span>

		<!-- Name & subtitle -->
		<span class="cw-profile-menu__info">
			<span class="cw-profile-menu__name">{name}</span>
			{#if subtitle}
				<span class="cw-profile-menu__subtitle">{subtitle}</span>
			{/if}
		</span>

		{#if icon}
			<span class="cw-profile-menu__icon" aria-hidden="true">
				{@render icon()}
			</span>
		{/if}

		<!-- Chevron -->
		<svg class="cw-profile-menu__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if open && menuItems.length > 0}
		<div class="cw-profile-menu__dropdown" role="menu">
			<!-- Header in dropdown -->
			<div class="cw-profile-menu__dropdown-header">
				<span class="cw-profile-menu__dropdown-name">{name}</span>
				{#if subtitle}
					<span class="cw-profile-menu__dropdown-subtitle">{subtitle}</span>
				{/if}
			</div>

			<CwSeparator spacing="0" />

			{#each menuItems as item (item.id)}
				{#if item.separator}
					<CwSeparator spacing="0" />
				{/if}
				<button
					type="button"
					class="cw-profile-menu__menu-item"
					class:cw-profile-menu__menu-item--danger={item.danger}
					role="menuitem"
					onclick={() => selectItem(item)}
				>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cw-profile-menu {
		position: relative;
		display: inline-block;
	}

	.cw-profile-menu__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-dropdown);
	}

	/* ── Trigger ──────────────────────────── */
	.cw-profile-menu__trigger {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3) var(--cw-space-2) var(--cw-space-2);
		background: var(--cw-profile-trigger-bg);
		border: 1px solid var(--cw-profile-trigger-border);
		border-radius: var(--cw-radius-xl);
		cursor: pointer;
		color: var(--cw-profile-trigger-text);
		font-family: var(--cw-font-family);
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default),
			transform var(--cw-duration-fast) var(--cw-ease-default);
		box-shadow: var(--cw-profile-trigger-shadow);
	}

	.cw-profile-menu__trigger:hover {
		background: var(--cw-profile-trigger-bg-hover);
		border-color: var(--cw-profile-trigger-border-hover);
		color: var(--cw-profile-trigger-text-hover);
	}

	.cw-profile-menu__trigger--open {
		background: var(--cw-profile-trigger-bg-open);
		border-color: var(--cw-profile-trigger-border-open);
		color: var(--cw-profile-trigger-text-hover);
		box-shadow: var(--cw-profile-trigger-shadow-open);
	}

	.cw-profile-menu__trigger:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 var(--cw-focus-ring-width)
				color-mix(in srgb, var(--cw-focus-ring-color) 36%, transparent),
			0 0 0 calc(var(--cw-focus-ring-width) + 2px) var(--cw-bg-surface);
	}

	/* ── Avatar ───────────────────────────── */
	.cw-profile-menu__avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--cw-radius-full);
		overflow: hidden;
		background: var(--cw-profile-avatar-bg);
		border: 1px solid var(--cw-profile-avatar-border);
		flex-shrink: 0;
	}

	.cw-profile-menu__avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cw-profile-menu__avatar-initials {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		line-height: 1;
	}

	/* ── Info text ────────────────────────── */
	.cw-profile-menu__info {
		display: flex;
		flex-direction: column;
		text-align: left;
		min-width: 0;
	}

	.cw-profile-menu__name {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: currentColor;
		line-height: var(--cw-leading-tight);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cw-profile-menu__subtitle {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		line-height: var(--cw-leading-tight);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Chevron ──────────────────────────── */
	.cw-profile-menu__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		color: currentColor;
		opacity: 0.9;
		flex-shrink: 0;
	}

	.cw-profile-menu__icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.cw-profile-menu__chevron {
		width: 1rem;
		height: 1rem;
		color: currentColor;
		opacity: 0.72;
		flex-shrink: 0;
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-profile-menu__trigger--open .cw-profile-menu__chevron {
		transform: rotate(180deg);
	}

	/* ── Dropdown ─────────────────────────── */
	.cw-profile-menu__dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: calc(var(--cw-z-dropdown) + 1);
		margin-top: var(--cw-space-1);
		min-width: 12rem;
		padding: var(--cw-space-1);
		background-color: var(--cw-bg-surface-elevated);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 82%, transparent);
		border-radius: var(--cw-radius-lg);
		box-shadow: var(--cw-shadow-lg);
	}

	.cw-profile-menu__dropdown-header {
		display: flex;
		flex-direction: column;
		padding: var(--cw-space-2) var(--cw-space-3);
	}

	.cw-profile-menu__dropdown-name {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-profile-menu__dropdown-subtitle {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-profile-menu__menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		text-align: left;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-profile-menu__menu-item:hover {
		background-color: color-mix(in srgb, var(--cw-bg-muted) 78%, var(--cw-bg-surface));
		color: var(--cw-text-primary);
	}

	.cw-profile-menu__menu-item:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px
			color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
	}

	.cw-profile-menu__menu-item--danger {
		color: var(--cw-tone-danger-text);
	}

	.cw-profile-menu__menu-item--danger:hover {
		background-color: color-mix(in srgb, var(--cw-tone-danger-bg) 22%, transparent);
		color: var(--cw-tone-danger-text);
	}
</style>
