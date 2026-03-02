<script lang="ts">
	type Theme = 'dark' | 'light' | 'system';
	const THEME_STORAGE_KEY = 'cwui-theme';

	interface Props {
		/** Current theme. Bind to persist externally. */
		theme?: Theme;
		onchange?: (theme: Theme) => void;
		class?: string;
	}

	let {
		theme = $bindable<Theme>('dark'),
		onchange,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	let hasInitializedTheme = $state(false);
	let menuRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let menuStyle = $state('');

	const options: { value: Theme; label: string; icon: string }[] = [
		{ value: 'light', label: 'Light', icon: 'sun' },
		{ value: 'dark', label: 'Dark', icon: 'moon' },
		{ value: 'system', label: 'System', icon: 'monitor' }
	];

	function isTheme(value: string | null): value is Theme {
		return value === 'light' || value === 'dark' || value === 'system';
	}

	function getStoredTheme(): Theme | null {
		if (typeof window === 'undefined') return null;
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return isTheme(stored) ? stored : null;
	}

	function persistTheme(t: Theme) {
		if (typeof window === 'undefined') return;
		window.localStorage.setItem(THEME_STORAGE_KEY, t);
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
		open = false;
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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
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
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-theme-picker__backdrop" onclick={() => (open = false)} onkeydown={() => {}}></div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="cw-theme-picker {className}" class:cw-theme-picker--open={open} onkeydown={handleKeydown}>
	<button
		bind:this={triggerRef}
		type="button"
		class="cw-theme-picker__trigger"
		class:cw-theme-picker__trigger--open={open}
		onclick={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="Change theme"
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
		<div bind:this={menuRef} class="cw-theme-picker__menu" style={menuStyle} role="listbox" aria-label="Theme">
			{#each options as opt (opt.value)}
				<button
					type="button"
					class="cw-theme-picker__option"
					class:cw-theme-picker__option--active={theme === opt.value}
					role="option"
					aria-selected={theme === opt.value}
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
		z-index: calc(var(--cw-z-overlay) + 1);
	}

	.cw-theme-picker__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-overlay);
	}

	.cw-theme-picker__trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		background-color: var(--cw-bg-elevated);
		color: var(--cw-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-theme-picker__trigger:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-theme-picker__trigger--open {
		border-color: var(--cw-accent);
		color: var(--cw-accent);
	}

	.cw-theme-picker__trigger:focus-visible {
		outline: none;
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 25%, transparent);
	}

	.cw-theme-picker__icon {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Menu ───────────────────────────────── */
	.cw-theme-picker__menu {
		position: fixed;
		z-index: calc(var(--cw-z-overlay) + 1);
		min-width: 9rem;
		padding: var(--cw-space-1);
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		box-shadow: var(--cw-shadow-lg);
	}

	.cw-theme-picker__option {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		width: 100%;
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

	.cw-theme-picker__option:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-theme-picker__option--active {
		color: var(--cw-accent);
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
		color: var(--cw-accent);
	}
</style>
