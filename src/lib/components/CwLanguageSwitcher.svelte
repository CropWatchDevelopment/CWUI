<script lang="ts">
	import type { CwLanguageOption } from '../types/index.js';

	interface Props {
		options: CwLanguageOption[];
		locale?: string;
		setLocale?: (locale: string) => void | Promise<void>;
		onchange?: (locale: string, option: CwLanguageOption) => void | Promise<void>;
		onerror?: (error: unknown, locale: string, option: CwLanguageOption) => void;
		label?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		options,
		locale = $bindable<string | undefined>(undefined),
		setLocale,
		onchange,
		onerror,
		label,
		disabled = false,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const imageSourcePattern =
		/^(https?:|data:|\/|\.{1,2}\/)|\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

	let open = $state(false);
	let isApplying = $state(false);
	let menuRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let activeIndex = $state(-1);
	let menuStyle = $state('');

	const hasSelectableOption = $derived(options.some((option) => !option.disabled));
	const fallbackOption = $derived.by(
		() => options.find((option) => !option.disabled) ?? options[0] ?? null
	);
	const activeLocale = $derived(locale ?? fallbackOption?.locale ?? '');
	const selectedOption = $derived.by(
		() => options.find((option) => option.locale === activeLocale) ?? fallbackOption
	);

	function isFlagImage(option: CwLanguageOption) {
		if (!option.flag) return false;
		if (option.flagType) return option.flagType === 'image';
		return imageSourcePattern.test(option.flag);
	}

	function getFlagFallback(option: CwLanguageOption) {
		return (option.shortLabel ?? option.locale).toUpperCase();
	}

	function getFirstEnabledIndex() {
		return options.findIndex((option) => !option.disabled);
	}

	function getLastEnabledIndex() {
		for (let index = options.length - 1; index >= 0; index -= 1) {
			if (!options[index]?.disabled) return index;
		}

		return -1;
	}

	function findNextEnabledIndex(start: number, direction: 1 | -1) {
		if (!hasSelectableOption || options.length === 0) return -1;

		let index = start;
		for (let count = 0; count < options.length; count += 1) {
			index += direction;
			if (index < 0) index = options.length - 1;
			if (index >= options.length) index = 0;
			if (!options[index]?.disabled) return index;
		}

		return -1;
	}

	function closeMenu() {
		open = false;
		activeIndex = -1;
	}

	function getStartingIndex() {
		const selectedIndex = options.findIndex(
			(option) => option.locale === activeLocale && !option.disabled
		);
		if (selectedIndex >= 0) return selectedIndex;
		return getFirstEnabledIndex();
	}

	function openMenu() {
		if (disabled || isApplying || !hasSelectableOption) return;
		open = true;
		activeIndex = getStartingIndex();
	}

	function toggleMenu() {
		if (open) {
			closeMenu();
			return;
		}

		openMenu();
	}

	async function applySelection(option: CwLanguageOption) {
		if (option.disabled || isApplying) return;

		const nextLocale = option.locale;
		if (locale === nextLocale) {
			closeMenu();
			triggerRef?.focus();
			return;
		}

		const previousLocale = locale;
		locale = nextLocale;
		closeMenu();
		isApplying = true;

		try {
			await setLocale?.(nextLocale);
			await onchange?.(nextLocale, option);
		} catch (error) {
			locale = previousLocale;
			onerror?.(error, nextLocale, option);
		} finally {
			isApplying = false;
			triggerRef?.focus();
		}
	}

	function updateMenuPosition() {
		if (!open || !triggerRef) return;

		const rect = triggerRef.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const menuWidth = Math.max(Math.round(rect.width), 280);
		const menuHeight = menuRef?.offsetHeight ?? 0;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let left = rect.left;
		if (left + menuWidth > viewportWidth - margin) {
			left = Math.max(margin, rect.right - menuWidth);
		}
		if (left < margin) left = margin;

		let top = rect.bottom + spacing;
		if (menuHeight > 0 && top + menuHeight > viewportHeight - margin) {
			const aboveTop = rect.top - spacing - menuHeight;
			if (aboveTop >= margin) {
				top = aboveTop;
			} else {
				top = Math.max(margin, viewportHeight - margin - menuHeight);
			}
		}

		menuStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${menuWidth}px;`;
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
			case 'Enter':
			case ' ': {
				event.preventDefault();
				if (!open) {
					openMenu();
				} else if (event.key === 'ArrowDown') {
					activeIndex = findNextEnabledIndex(activeIndex < 0 ? -1 : activeIndex, 1);
				}
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				if (!open) {
					openMenu();
					activeIndex = getLastEnabledIndex();
				} else {
					activeIndex = findNextEnabledIndex(
						activeIndex < 0 ? options.length : activeIndex,
						-1
					);
				}
				break;
			}
			case 'Escape':
				closeMenu();
				break;
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				activeIndex = findNextEnabledIndex(activeIndex < 0 ? -1 : activeIndex, 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				activeIndex = findNextEnabledIndex(
					activeIndex < 0 ? options.length : activeIndex,
					-1
				);
				break;
			case 'Home':
				event.preventDefault();
				activeIndex = getFirstEnabledIndex();
				break;
			case 'End':
				event.preventDefault();
				activeIndex = getLastEnabledIndex();
				break;
			case 'Enter':
			case ' ': {
				event.preventDefault();
				if (activeIndex >= 0) {
					void applySelection(options[activeIndex]);
				}
				break;
			}
			case 'Escape':
				event.preventDefault();
				closeMenu();
				triggerRef?.focus();
				break;
			case 'Tab':
				closeMenu();
				break;
		}
	}

	$effect(() => {
		if (!open || !menuRef) return;

		const raf = requestAnimationFrame(() => {
			updateMenuPosition();
			menuRef?.focus();
		});

		const handleViewportChange = () => updateMenuPosition();
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
		};
	});

	$effect(() => {
		if (!open || !menuRef || activeIndex < 0) return;

		const items = menuRef.querySelectorAll('[role="option"]');
		const activeItem = items[activeIndex];
		if (activeItem instanceof HTMLElement) {
			activeItem.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-language-switcher__backdrop" onclick={closeMenu} onkeydown={() => {}}></div>
{/if}

<div
	class="cw-language-switcher {className}"
	class:cw-language-switcher--open={open}
	class:cw-language-switcher--busy={isApplying}
	class:cw-language-switcher--disabled={disabled}
>
	{#if label}
		<label class="cw-language-switcher__label" id="{uid}-label" for="{uid}-trigger">
			{label}
		</label>
	{/if}

	<button
		bind:this={triggerRef}
		id="{uid}-trigger"
		type="button"
		class="cw-language-switcher__trigger"
		class:cw-language-switcher__trigger--placeholder={!selectedOption}
		disabled={disabled || isApplying || !hasSelectableOption}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls="{uid}-listbox"
		aria-busy={isApplying}
		aria-labelledby={label ? `${uid}-label ${uid}-current-label` : undefined}
		aria-label={
			label
				? undefined
				: selectedOption
					? `Change language, current ${selectedOption.label}`
					: 'No languages configured'
		}
		onclick={toggleMenu}
		onkeydown={handleTriggerKeydown}
	>
		<span class="cw-language-switcher__selection">
			{#if selectedOption}
				<span class="cw-language-switcher__flag-shell" aria-hidden="true">
					{#if selectedOption.flag}
						{#if isFlagImage(selectedOption)}
							<img
								class="cw-language-switcher__flag-image"
								src={selectedOption.flag}
								alt=""
							/>
						{:else}
							<span class="cw-language-switcher__flag-text">{selectedOption.flag}</span>
						{/if}
					{:else}
						<span class="cw-language-switcher__flag-fallback">
							{getFlagFallback(selectedOption)}
						</span>
					{/if}
				</span>

				<span class="cw-language-switcher__copy">
					<span id="{uid}-current-label" class="cw-language-switcher__name">
						{selectedOption.label}
					</span>
					<span class="cw-language-switcher__meta">{selectedOption.locale}</span>
				</span>
			{:else}
				<span id="{uid}-current-label" class="cw-language-switcher__empty">
					No locales configured
				</span>
			{/if}
		</span>

		<span class="cw-language-switcher__sr-only">
			{isApplying ? 'Applying locale' : 'Open language menu'}
		</span>

		<svg class="cw-language-switcher__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<div
			bind:this={menuRef}
			id="{uid}-listbox"
			class="cw-language-switcher__menu"
			style={menuStyle}
			role="listbox"
			tabindex="-1"
			aria-labelledby={label ? `${uid}-label` : undefined}
			aria-label={label ? undefined : 'Language options'}
			aria-activedescendant={activeIndex >= 0 ? `${uid}-option-${activeIndex}` : undefined}
			onkeydown={handleMenuKeydown}
		>
			{#each options as option, index (option.locale)}
				<button
					id="{uid}-option-{index}"
					type="button"
					class="cw-language-switcher__option"
					class:cw-language-switcher__option--active={index === activeIndex}
					class:cw-language-switcher__option--selected={activeLocale === option.locale}
					role="option"
					tabindex="-1"
					aria-selected={activeLocale === option.locale}
					aria-disabled={option.disabled || undefined}
					disabled={option.disabled || isApplying}
					onclick={() => void applySelection(option)}
					onmouseenter={() => {
						if (!option.disabled) activeIndex = index;
					}}
				>
					<span class="cw-language-switcher__flag-shell" aria-hidden="true">
						{#if option.flag}
							{#if isFlagImage(option)}
								<img class="cw-language-switcher__flag-image" src={option.flag} alt="" />
							{:else}
								<span class="cw-language-switcher__flag-text">{option.flag}</span>
							{/if}
						{:else}
							<span class="cw-language-switcher__flag-fallback">
								{getFlagFallback(option)}
							</span>
						{/if}
					</span>

					<span class="cw-language-switcher__option-copy">
						<span class="cw-language-switcher__name">{option.label}</span>
						{#if option.description}
							<span class="cw-language-switcher__description">{option.description}</span>
						{/if}
					</span>

					<span class="cw-language-switcher__meta">{option.locale}</span>

					{#if activeLocale === option.locale}
						<svg class="cw-language-switcher__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M3.5 8.5l3 3 6-6"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cw-language-switcher {
		position: relative;
		display: inline-grid;
		gap: var(--cw-space-2);
		min-width: 14rem;
	}

	.cw-language-switcher--open {
		isolation: isolate;
		z-index: calc(var(--cw-z-overlay) + 1);
	}

	.cw-language-switcher__label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
	}

	.cw-language-switcher__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-overlay);
	}

	.cw-language-switcher__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		width: 100%;
		padding: 0.7rem 0.85rem;
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 92%, white),
				color-mix(in srgb, var(--cw-bg-muted) 72%, white)
			);
		color: var(--cw-text-primary);
		cursor: pointer;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default),
			transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-language-switcher__trigger:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--cw-accent) 38%, var(--cw-border-default));
		box-shadow: var(--cw-shadow-sm);
	}

	.cw-language-switcher__trigger:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--cw-focus-ring-color) 28%, transparent);
	}

	.cw-language-switcher__trigger:disabled {
		cursor: not-allowed;
		opacity: 0.72;
	}

	.cw-language-switcher__selection {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		min-width: 0;
	}

	.cw-language-switcher__flag-shell {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--cw-bg-base) 70%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cw-border-default) 64%, transparent);
		overflow: hidden;
	}

	.cw-language-switcher__flag-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cw-language-switcher__flag-text {
		font-size: 1rem;
		line-height: 1;
	}

	.cw-language-switcher__flag-fallback {
		font-size: 0.66rem;
		font-weight: var(--cw-font-bold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cw-text-secondary);
	}

	.cw-language-switcher__copy,
	.cw-language-switcher__option-copy {
		display: grid;
		min-width: 0;
	}

	.cw-language-switcher__name {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cw-language-switcher__meta,
	.cw-language-switcher__description {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-language-switcher__empty {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	.cw-language-switcher__chevron {
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
		color: var(--cw-text-muted);
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-language-switcher--open .cw-language-switcher__chevron {
		transform: rotate(180deg);
	}

	.cw-language-switcher__menu {
		position: fixed;
		display: grid;
		gap: 0.2rem;
		max-height: min(22rem, calc(100vh - 1rem));
		padding: 0.35rem;
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 82%, transparent);
		border-radius: var(--cw-radius-xl);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 94%, white),
				color-mix(in srgb, var(--cw-bg-muted) 78%, white)
			);
		box-shadow: var(--cw-shadow-lg);
		overflow-y: auto;
		z-index: calc(var(--cw-z-overlay) + 1);
	}

	.cw-language-switcher__menu:focus-visible {
		outline: none;
	}

	.cw-language-switcher__option {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--cw-space-3);
		width: 100%;
		padding: 0.7rem 0.8rem;
		border: none;
		border-radius: calc(var(--cw-radius-lg) - 0.1rem);
		background: transparent;
		color: var(--cw-text-secondary);
		text-align: left;
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-language-switcher__option:hover:not(:disabled),
	.cw-language-switcher__option--active:not(:disabled) {
		background: color-mix(in srgb, var(--cw-accent) 12%, transparent);
		color: var(--cw-text-primary);
	}

	.cw-language-switcher__option--selected {
		background: color-mix(in srgb, var(--cw-accent) 14%, transparent);
	}

	.cw-language-switcher__option:disabled {
		cursor: not-allowed;
		opacity: 0.58;
	}

	.cw-language-switcher__check {
		width: 0.95rem;
		height: 0.95rem;
		color: var(--cw-accent);
	}

	.cw-language-switcher__sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
