<script lang="ts">
	type Theme = 'dark' | 'light' | 'system';
	const THEME_STORAGE_KEY = 'cwui-theme';

	interface CwThemePickerLabels {
		/** Accessible label for the trigger button. */
		trigger: string;
		/** Accessible label for the menu. */
		menu: string;
		light: string;
		dark: string;
		system: string;
	}

	interface Props {
		/** Current theme. Bind to persist externally. */
		theme?: Theme;
		/** Override built-in English strings. */
		labels?: Partial<CwThemePickerLabels>;
		onchange?: (theme: Theme) => void;
		class?: string;
	}

	let {
		theme = $bindable<Theme>('dark'),
		labels,
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let open = $state(false);
	let hasInitializedTheme = $state(false);
	let rootRef = $state<HTMLDivElement | null>(null);
	let menuRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let menuStyle = $state('');

	const text = $derived({
		trigger: 'Change theme',
		menu: 'Theme',
		light: 'Light',
		dark: 'Dark',
		system: 'System',
		...labels
	});

	const options = $derived<{ value: Theme; label: string; icon: string }[]>([
		{ value: 'light', label: text.light, icon: 'sun' },
		{ value: 'dark', label: text.dark, icon: 'moon' },
		{ value: 'system', label: text.system, icon: 'monitor' }
	]);

	function isTheme(value: string | null): value is Theme {
		return value === 'light' || value === 'dark' || value === 'system';
	}

	function getStoredTheme(): Theme | null {
		if (typeof window === 'undefined') return null;
		try {
			const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
			return isTheme(stored) ? stored : null;
		} catch {
			// Storage can throw in locked-down / private browsing contexts.
			return null;
		}
	}

	function persistTheme(t: Theme) {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, t);
		} catch {
			// Ignore — the theme still applies for this page view.
		}
	}

	function applyTheme(t: Theme) {
		if (typeof document === 'undefined') return;
		if (t === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
		} else {
			document.documentElement.setAttribute('data-theme', t);
		}
	}

	function select(t: Theme) {
		theme = t;
		onchange?.(t);
		close(true);
	}

	function close(returnFocus = false) {
		open = false;
		if (returnFocus) triggerRef?.focus();
	}

	function menuItems() {
		return Array.from(menuRef?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
	}

	function focusItem(index: number) {
		const items = menuItems();
		if (items.length === 0) return;
		items[(index + items.length) % items.length]?.focus();
	}

	// Initialize from localStorage once on client mount.
	$effect(() => {
		if (typeof window === 'undefined' || hasInitializedTheme) return;
		const stored = getStoredTheme();
		if (stored) {
			theme = stored;
		}
		hasInitializedTheme = true;
	});

	// Apply and persist whenever theme changes after initialization.
	$effect(() => {
		if (!hasInitializedTheme) return;
		applyTheme(theme);
		persistTheme(theme);
	});

	// Listen for system preference changes if in system mode
	$effect(() => {
		if (theme !== 'system') return;
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => applyTheme('system');
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			open = true;
		}
	}

	function handleMenuKeydown(e: KeyboardEvent) {
		const items = menuItems();
		const current = items.indexOf(document.activeElement as HTMLButtonElement);
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
				close(true);
				break;
			case 'Tab':
				close();
				break;
		}
	}

	function updateMenuPosition() {
		if (!open || !triggerRef) return;

		const rect = triggerRef.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const menuWidth = menuRef?.offsetWidth ?? 144;
		const menuHeight = menuRef?.offsetHeight ?? 0;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let left = rect.left;
		if (left + menuWidth > viewportWidth - margin) {
			left = Math.max(margin, rect.right - menuWidth);
		}

		let top = rect.bottom + spacing;
		if (menuHeight > 0 && top + menuHeight > viewportHeight - margin) {
			const aboveTop = rect.top - spacing - menuHeight;
			if (aboveTop >= margin) {
				top = aboveTop;
			} else {
				top = Math.max(margin, viewportHeight - margin - menuHeight);
			}
		}

		menuStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;`;
	}

	$effect(() => {
		if (!open) return;

		const raf = requestAnimationFrame(() => {
			updateMenuPosition();
			// Move focus into the menu, onto the current theme.
			focusItem(Math.max(0, options.findIndex((opt) => opt.value === theme)));
		});

		const handleViewportChange = () => updateMenuPosition();
		const handlePointerDown = (event: PointerEvent) => {
			if (rootRef && !rootRef.contains(event.target as Node)) close();
		};
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);
		document.addEventListener('pointerdown', handlePointerDown, true);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
			document.removeEventListener('pointerdown', handlePointerDown, true);
		};
	});
</script>

<div bind:this={rootRef} class="cw-theme-picker {className}" class:cw-theme-picker--open={open}>
	<button
		bind:this={triggerRef}
		type="button"
		class="cw-theme-picker__trigger"
		class:cw-theme-picker__trigger--open={open}
		onclick={() => (open = !open)}
		onkeydown={handleTriggerKeydown}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={open ? `${uid}-menu` : undefined}
		aria-label={text.trigger}
	>
		{#if theme === 'light'}
			<svg class="cw-theme-picker__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<circle cx="10" cy="10" r="4" />
				<path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
			</svg>
		{:else if theme === 'dark'}
			<svg class="cw-theme-picker__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
			</svg>
		{:else}
			<svg class="cw-theme-picker__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
				<rect x="3" y="3" width="14" height="10" rx="2" />
				<path d="M7 16h6" stroke-linecap="round" />
			</svg>
		{/if}
	</button>

	{#if open}
		<div
			bind:this={menuRef}
			id="{uid}-menu"
			class="cw-theme-picker__menu"
			style={menuStyle}
			role="menu"
			tabindex="-1"
			aria-label={text.menu}
			onkeydown={handleMenuKeydown}
		>
			{#each options as opt (opt.value)}
				<button
					type="button"
					class="cw-theme-picker__option"
					class:cw-theme-picker__option--active={theme === opt.value}
					role="menuitemradio"
					aria-checked={theme === opt.value}
					tabindex="-1"
					onclick={() => select(opt.value)}
				>
					{#if opt.icon === 'sun'}
						<svg class="cw-theme-picker__opt-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<circle cx="10" cy="10" r="4" />
							<path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none" />
						</svg>
					{:else if opt.icon === 'moon'}
						<svg class="cw-theme-picker__opt-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{:else}
						<svg class="cw-theme-picker__opt-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
							<rect x="3" y="3" width="14" height="10" rx="2" />
							<path d="M7 16h6" stroke-linecap="round" />
						</svg>
					{/if}
					<span>{opt.label}</span>
					{#if theme === opt.value}
						<svg class="cw-theme-picker__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M3.5 8.5l3 3 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cw-theme-picker {
		position: relative;
		display: inline-block;
	}

	.cw-theme-picker--open {
		isolation: isolate;
		z-index: var(--cw-z-popover);
	}

	.cw-theme-picker__trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--cw-control-h-md);
		height: var(--cw-control-h-md);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		background-color: var(--cw-control-bg);
		color: var(--cw-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-theme-picker__trigger:hover {
		background-color: var(--cw-option-hover-bg);
		border-color: var(--cw-control-border-hover);
		color: var(--cw-text-primary);
	}

	.cw-theme-picker__trigger--open {
		border-color: var(--cw-focus-ring-color);
		color: var(--cw-option-selected-text);
	}

	.cw-theme-picker__icon {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Menu ───────────────────────────────── */
	.cw-theme-picker__menu {
		position: fixed;
		z-index: var(--cw-z-popover);
		min-width: 9rem;
		padding: var(--cw-space-1);
		background-color: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
	}

	.cw-theme-picker__option {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		width: 100%;
		min-height: var(--cw-option-min-h);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-theme-picker__option:hover,
	.cw-theme-picker__option:focus-visible {
		background-color: var(--cw-option-hover-bg);
		color: var(--cw-text-primary);
	}

	.cw-theme-picker__option:focus-visible {
		outline-offset: calc(var(--cw-focus-ring-width) * -1);
	}

	.cw-theme-picker__option--active,
	.cw-theme-picker__option--active:hover {
		color: var(--cw-option-selected-text);
		font-weight: var(--cw-font-medium);
	}

	.cw-theme-picker__opt-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.cw-theme-picker__check {
		width: 1rem;
		height: 1rem;
		margin-left: auto;
		color: var(--cw-option-selected-text);
	}
</style>
