<script lang="ts">
	interface Option {
		label: string;
		value: string;
		disabled?: boolean;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: string;
		label?: string;
		onchange?: (value: string) => void;
	}

	let {
		options,
		value = $bindable(''),
		placeholder = 'Select…',
		disabled = false,
		error,
		label,
		onchange
	}: Props = $props();

	const uid = $props.id();

	let open = $state(false);
	let listboxRef = $state<HTMLUListElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let activeIndex = $state(-1);

	const selectedOption = $derived(options.find((o) => o.value === value));
	const displayText = $derived(selectedOption?.label ?? placeholder);

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			activeIndex = options.findIndex((o) => o.value === value);
			if (activeIndex < 0) activeIndex = 0;
		}
	}

	function select(opt: Option) {
		if (opt.disabled) return;
		value = opt.value;
		open = false;
		onchange?.(opt.value);
		triggerRef?.focus();
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
			case ' ':
			case 'ArrowDown':
				e.preventDefault();
				if (!open) {
					open = true;
					activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
				}
				break;
			case 'Escape':
				open = false;
				break;
		}
	}

	function handleListKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = Math.min(activeIndex + 1, options.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = Math.max(activeIndex - 1, 0);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (activeIndex >= 0 && !options[activeIndex].disabled) {
					select(options[activeIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				triggerRef?.focus();
				break;
			case 'Tab':
				open = false;
				break;
		}
	}

	function handleBackdropClick() {
		open = false;
	}

	$effect(() => {
		if (open && listboxRef) {
			listboxRef.focus();
		}
	});

	// Scroll active option into view
	$effect(() => {
		if (open && listboxRef && activeIndex >= 0) {
			const items = listboxRef.querySelectorAll('[role="option"]');
			items[activeIndex]?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-dropdown__backdrop" onclick={handleBackdropClick} onkeydown={() => {}}></div>
{/if}

<div class="cw-dropdown" class:cw-dropdown--error={!!error} class:cw-dropdown--disabled={disabled}>
	{#if label}
		<label class="cw-dropdown__label" id="{uid}-label">{label}</label>
	{/if}

	<button
		bind:this={triggerRef}
		type="button"
		class="cw-dropdown__trigger"
		class:cw-dropdown__trigger--open={open}
		class:cw-dropdown__trigger--placeholder={!selectedOption}
		{disabled}
		role="combobox"
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-controls="{uid}-listbox"
		aria-labelledby={label ? `${uid}-label` : undefined}
		onclick={toggle}
		onkeydown={handleTriggerKeydown}
	>
		<span class="cw-dropdown__text">{displayText}</span>
		<svg class="cw-dropdown__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	{#if open}
		<ul
			bind:this={listboxRef}
			id="{uid}-listbox"
			class="cw-dropdown__listbox"
			role="listbox"
			tabindex="-1"
			aria-labelledby={label ? `${uid}-label` : undefined}
			onkeydown={handleListKeydown}
		>
			{#each options as opt, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					role="option"
					class="cw-dropdown__option"
					class:cw-dropdown__option--active={i === activeIndex}
					class:cw-dropdown__option--selected={opt.value === value}
					class:cw-dropdown__option--disabled={opt.disabled}
					aria-selected={opt.value === value}
					aria-disabled={opt.disabled || undefined}
					onclick={() => select(opt)}
				>
					{opt.label}
					{#if opt.value === value}
						<svg class="cw-dropdown__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if error}
		<p class="cw-dropdown__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.cw-dropdown {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-dropdown__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-dropdown__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-strong);
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		min-height: 2.375rem;
		text-align: left;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__trigger:focus-visible {
		border-color: var(--cw-focus-ring-color);
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-focus-ring-color) 35%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-focus-ring-color) 15%, transparent);
	}

	.cw-dropdown__trigger--placeholder {
		color: var(--cw-text-muted);
	}

	.cw-dropdown__trigger--open {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-dropdown__text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-dropdown__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__trigger--open .cw-dropdown__chevron {
		transform: rotate(180deg);
	}

	/* ── Listbox ─────────────────────────── */
	.cw-dropdown__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-dropdown);
	}

	.cw-dropdown__listbox {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: calc(var(--cw-z-dropdown) + 1);
		margin-top: var(--cw-space-1);
		padding: var(--cw-space-1);
		list-style: none;
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		box-shadow: var(--cw-shadow-lg);
		max-height: 15rem;
		overflow-y: auto;
		outline: none;
	}

	.cw-dropdown__option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__option:hover,
	.cw-dropdown__option--active {
		background-color: var(--cw-bg-muted);
	}

	.cw-dropdown__option--selected {
		color: var(--cw-accent-text);
	}

	.cw-dropdown__option--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cw-dropdown__check {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-accent);
	}

	/* ── Error state ─────────────────────── */
	.cw-dropdown--error .cw-dropdown__trigger {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-dropdown--disabled .cw-dropdown__trigger {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cw-dropdown__error {
		font-size: var(--cw-text-xs);
		color: var(--cw-tone-danger-text);
		margin: 0;
	}
</style>
