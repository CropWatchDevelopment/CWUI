<script lang="ts">
	import { tick } from 'svelte';
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
		/** Accessible name for the menu (defaults to the user's name) */
		menuLabel?: string;
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
		menuLabel,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let open = $state(false);
	let rootEl = $state<HTMLElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let menuEl = $state<HTMLElement | null>(null);

	const hasMenu = $derived(menuItems.length > 0);

	const initials = $derived(
		name
			.split(/[\s@]+/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	function getItems(): HTMLElement[] {
		return menuEl ? Array.from(menuEl.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
	}

	function focusItem(index: number) {
		const items = getItems();
		if (items.length === 0) return;
		const next = (index + items.length) % items.length;
		items.forEach((el, i) => (el.tabIndex = i === next ? 0 : -1));
		items[next].focus();
	}

	async function openMenu(focus: 'first' | 'last' = 'first') {
		if (!hasMenu) return;
		open = true;
		await tick();
		focusItem(focus === 'first' ? 0 : -1);
	}

	function closeMenu(returnFocus = true) {
		if (!open) return;
		open = false;
		if (returnFocus) triggerEl?.focus();
	}

	function toggle() {
		if (open) closeMenu();
		else void openMenu();
	}

	function selectItem(item: CwProfileMenuItem) {
		onselect?.(item);
		closeMenu();
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			void openMenu('first');
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			void openMenu('last');
		}
	}

	function handleMenuKeydown(e: KeyboardEvent) {
		const items = getItems();
		const current = items.indexOf(document.activeElement as HTMLElement);
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusItem(current + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusItem(current - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusItem(0);
				break;
			case 'End':
				e.preventDefault();
				focusItem(items.length - 1);
				break;
			case 'Escape':
				e.preventDefault();
				closeMenu();
				break;
			case 'Tab':
				// Let focus move on naturally, but close the menu behind it.
				closeMenu(false);
				break;
		}
	}

	/** Close on any pointer press outside the component, without swallowing the click. */
	$effect(() => {
		if (!open) return;
		function onPointerDown(event: PointerEvent) {
			if (rootEl && !rootEl.contains(event.target as Node)) closeMenu(false);
		}
		document.addEventListener('pointerdown', onPointerDown, true);
		return () => document.removeEventListener('pointerdown', onPointerDown, true);
	});
</script>

<div class={['cw-profile-menu', className]} bind:this={rootEl}>
	<button
		bind:this={triggerEl}
		type="button"
		id="{uid}-trigger"
		class={['cw-profile-menu__trigger', open && 'cw-profile-menu__trigger--open']}
		onclick={toggle}
		onkeydown={handleTriggerKeydown}
		aria-haspopup={hasMenu ? 'menu' : undefined}
		aria-expanded={hasMenu ? open : undefined}
		aria-controls={hasMenu && open ? `${uid}-menu` : undefined}
	>
		<!-- Avatar (decorative: the name is rendered as text beside it) -->
		<span class="cw-profile-menu__avatar">
			{#if avatar}
				{@render avatar()}
			{:else if avatarUrl}
				<img class="cw-profile-menu__avatar-img" src={avatarUrl} alt="" />
			{:else}
				<span class="cw-profile-menu__avatar-initials" aria-hidden="true">{initials}</span>
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

		{#if hasMenu}
			<svg class="cw-profile-menu__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M4 6l4 4 4-4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</button>

	{#if open && hasMenu}
		<div class="cw-profile-menu__dropdown">
			<!-- Identity header sits outside role="menu" so it isn't announced as an item -->
			<div class="cw-profile-menu__dropdown-header">
				<span class="cw-profile-menu__dropdown-name">{name}</span>
				{#if subtitle}
					<span class="cw-profile-menu__dropdown-subtitle">{subtitle}</span>
				{/if}
			</div>

			<CwSeparator spacing="0" />

			<div
				bind:this={menuEl}
				id="{uid}-menu"
				class="cw-profile-menu__menu"
				role="menu"
				tabindex="-1"
				aria-label={menuLabel ?? name}
				onkeydown={handleMenuKeydown}
			>
				{#each menuItems as item (item.id)}
					{#if item.separator}
						<div role="separator" class="cw-profile-menu__separator"></div>
					{/if}
					<button
						type="button"
						class={[
							'cw-profile-menu__menu-item',
							item.danger && 'cw-profile-menu__menu-item--danger'
						]}
						role="menuitem"
						tabindex="-1"
						onclick={() => selectItem(item)}
					>
						{item.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.cw-profile-menu {
		position: relative;
		display: inline-block;
		min-width: 0;
		max-width: 100%;
	}

	/* ── Trigger ──────────────────────────── */
	.cw-profile-menu__trigger {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		max-width: min(16rem, 100%);
		min-height: 2.75rem;
		padding: var(--cw-space-1) var(--cw-space-3) var(--cw-space-1) var(--cw-space-1);
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
		color: var(--cw-profile-trigger-subtitle);
		line-height: var(--cw-leading-tight);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Phones: show just the avatar so the trigger never crowds the header. */
	@media (max-width: 639px) {
		.cw-profile-menu__info {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}

		.cw-profile-menu__trigger {
			padding-inline-end: var(--cw-space-2);
		}
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
		z-index: var(--cw-z-popover);
		margin-top: var(--cw-space-1);
		min-width: 12rem;
		max-width: calc(100vw - 2 * var(--cw-space-4));
		padding: var(--cw-space-1);
		background-color: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
		animation: cw-profile-menu-in var(--cw-duration-normal) var(--cw-ease-out);
	}

	@keyframes cw-profile-menu-in {
		from {
			opacity: 0;
			transform: translateY(-0.25rem);
		}
	}

	.cw-profile-menu__menu {
		display: flex;
		flex-direction: column;
		padding-top: var(--cw-space-1);
	}

	.cw-profile-menu__menu:focus {
		outline: none;
	}

	.cw-profile-menu__separator {
		height: 1px;
		margin: var(--cw-space-1) 0;
		background: var(--cw-border-muted);
	}

	.cw-profile-menu__dropdown-header {
		display: flex;
		flex-direction: column;
		padding: var(--cw-space-2) var(--cw-space-3);
	}

	.cw-profile-menu__dropdown-name {
		overflow-wrap: anywhere;
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
		min-height: var(--cw-option-min-h);
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

	.cw-profile-menu__menu-item:hover,
	.cw-profile-menu__menu-item:focus {
		background-color: var(--cw-option-hover-bg);
		color: var(--cw-text-primary);
	}

	.cw-profile-menu__menu-item:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: calc(-1 * var(--cw-focus-ring-width));
	}

	.cw-profile-menu__menu-item--danger {
		color: var(--cw-tone-danger-text);
	}

	.cw-profile-menu__menu-item--danger:hover,
	.cw-profile-menu__menu-item--danger:focus {
		background-color: var(--cw-tone-danger-bg-subtle);
		color: var(--cw-tone-danger-text);
	}
</style>
