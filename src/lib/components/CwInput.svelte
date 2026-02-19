<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputType = 'text' | 'numeric' | 'email' | 'password' | 'devEui' | 'creditCard' | 'cardExpiry';

	interface Props {
		type?: InputType;
		value?: string;
		name?: string;
		required?: boolean;
		label?: string;
		error?: string;
		valid?: boolean;
		disabled?: boolean;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		maxlength?: number;
		clearable?: boolean;
		leftSlot?: Snippet;
		rightSlot?: Snippet;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		name,
		required = false,
		label,
		error,
		valid = false,
		disabled = false,
		placeholder,
		autocomplete,
		maxlength,
		clearable = false,
		leftSlot,
		rightSlot,
		oninput,
		onchange,
		class: className = '',
	}: Props = $props();

	const uid = $props.id();
	let inputRef = $state<HTMLInputElement | null>(null);
	let showPassword = $state(false);

	const isPassword = $derived(type === 'password');
	const nativeType = $derived.by(() => {
		if (type === 'password') {
			return showPassword ? 'text' : 'password';
		}
		return type === 'numeric' || type === 'devEui' || type === 'creditCard' || type === 'cardExpiry'
			? 'text'
			: type;
	});

	const inputMode = $derived<'text' | 'numeric' | 'email'>(
		type === 'numeric' || type === 'creditCard' || type === 'cardExpiry'
			? 'numeric'
			: type === 'email'
				? 'email'
				: 'text'
	);

	/** Whether a validation icon is rendered on the right */
	const hasValidationIcon = $derived(!!error || (valid && !error));

	/** Whether the clear button should show */
	const showClear = $derived(clearable && value.length > 0 && !disabled);

	/** Whether the password visibility toggle should show */
	const showPasswordToggle = $derived(isPassword);

	/** Whether _anything_ occupies the right side (slot, clear btn, or validation icon) */
	const hasRight = $derived(!!rightSlot || hasValidationIcon || showClear || showPasswordToggle);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let raw = target.value;

		if (type === 'numeric') {
			raw = raw.replace(/[^0-9.\-]/g, '');
		} else if (type === 'devEui') {
			raw = normalizeDevEui(raw);
		} else if (type === 'creditCard') {
			raw = formatCreditCard(raw);
		} else if (type === 'cardExpiry') {
			raw = formatCardExpiry(raw);
		}

		if (maxlength !== undefined && raw.length > maxlength) {
			raw = raw.slice(0, maxlength);
		}

		value = raw;
		target.value = raw;
		oninput?.(e);
	}

	function clear() {
		value = '';
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
		inputRef?.focus();
	}

	function normalizeDevEui(input: string): string {
		const hex = input.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 16);
		return hex.match(/.{1,2}/g)?.join(':') ?? hex;
	}

	function formatCreditCard(input: string): string {
		const digits = input.replace(/\D/g, '').slice(0, 16);
		return digits.match(/.{1,4}/g)?.join(' ') ?? digits;
	}

	function formatCardExpiry(input: string): string {
		const digits = input.replace(/\D/g, '').slice(0, 4);
		if (digits.length >= 3) {
			return digits.slice(0, 2) + '/' + digits.slice(2);
		}
		return digits;
	}
</script>

<div
	class="cw-input {className}"
	class:cw-input--error={!!error}
	class:cw-input--valid={valid && !error}
	class:cw-input--disabled={disabled}
>
	{#if label}
		<label class="cw-input__label" for="{uid}-input">{label}</label>
	{/if}

	<div class="cw-input__wrapper">
		{#if leftSlot}
			<span class="cw-input__slot cw-input__slot--left">
				{@render leftSlot()}
			</span>
		{/if}

		<input
			bind:this={inputRef}
			id="{uid}-input"
			class="cw-input__field"
			class:cw-input__field--has-left={!!leftSlot}
			class:cw-input__field--has-right={hasRight}
			type={nativeType}
			inputmode={inputMode}
			{value}
			{name}
			{required}
			{disabled}
			{placeholder}
			{autocomplete}
			maxlength={maxlength ?? undefined}
			oninput={handleInput}
			onchange={onchange}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${uid}-error` : undefined}
		/>

		<!-- Right-side content: clear button, user slot, validation icon -->
		{#if hasRight}
			<span class="cw-input__slot cw-input__slot--right">
				{#if showClear}
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						class="cw-input__clear"
						aria-label="Clear"
						onclick={clear}
						tabindex="-1"
					>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				{/if}
				{#if showPasswordToggle}
					<button
						type="button"
						class="cw-input__password-toggle"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						aria-pressed={showPassword}
						disabled={disabled}
						onclick={togglePasswordVisibility}
					>
						{#if showPassword}
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M2 2l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
								<path d="M6 6.5A2.2 2.2 0 018 6c1.2 0 2.2 1 2.2 2.2 0 .3-.1.7-.3 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
								<path d="M1.8 8s2.2-3.5 6.2-3.5c4 0 6.2 3.5 6.2 3.5-.4.6-1.1 1.5-2.1 2.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M1.8 8s2.2-3.5 6.2-3.5 6.2 3.5 6.2 3.5-2.2 3.5-6.2 3.5S1.8 8 1.8 8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
								<circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.5" />
							</svg>
						{/if}
					</button>
				{/if}
				{#if rightSlot}
					{@render rightSlot()}
				{/if}
				{#if error}
					<svg class="cw-input__icon cw-input__icon--error" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
						<path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				{:else if valid}
					<svg class="cw-input__icon cw-input__icon--valid" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
						<path d="M5.5 8l2 2 3.5-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				{/if}
			</span>
		{/if}
	</div>

	{#if error}
		<p class="cw-input__error" id="{uid}-error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.cw-input {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-input__label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
	}

	.cw-input__wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.cw-input__field {
		width: 100%;
		padding: 0.625rem var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: color-mix(in srgb, var(--cw-bg-elevated) 60%, transparent);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		outline: none;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
		min-height: 2.625rem;
	}

	.cw-input__field::placeholder {
		color: var(--cw-text-muted);
	}

	.cw-input__field:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--cw-border-default) 75%, var(--cw-info-500));
	}

	.cw-input__field:focus,
	.cw-input__field:focus-visible {
		border-color: var(--cw-info-500);
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--cw-info-500) 40%, transparent),
			0 0 10px color-mix(in srgb, var(--cw-info-500) 18%, transparent);
	}

	.cw-input__field--has-left {
		padding-left: var(--cw-space-10);
	}

	.cw-input__field--has-right {
		padding-right: var(--cw-space-10);
	}

	/* ── Slots ───────────────────────────── */
	.cw-input__slot {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-1);
		color: var(--cw-text-muted);
		pointer-events: none;
	}

	.cw-input__slot--left {
		left: var(--cw-space-3);
	}

	.cw-input__slot--right {
		right: var(--cw-space-3);
	}

	/* ── Clear button ────────────────────── */
	.cw-input__clear {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		padding: 0;
		border: none;
		background: none;
		color: var(--cw-text-muted);
		cursor: pointer;
		pointer-events: auto;
		border-radius: var(--cw-radius-full);
		transition: color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__clear:hover {
		color: var(--cw-text-primary);
	}

	.cw-input__clear svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	.cw-input__password-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		padding: 0;
		border: none;
		background: none;
		color: var(--cw-text-muted);
		cursor: pointer;
		pointer-events: auto;
		border-radius: var(--cw-radius-full);
		transition: color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__password-toggle:hover:not(:disabled) {
		color: var(--cw-text-primary);
	}

	.cw-input__password-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.65;
	}

	.cw-input__password-toggle svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	/* ── Validation icons ────────────────── */
	.cw-input__icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.cw-input__icon--error {
		color: var(--cw-danger-500);
	}

	.cw-input__icon--valid {
		color: var(--cw-success-500);
	}

	/* ── States ──────────────────────────── */
	.cw-input--error .cw-input__field {
		border-color: var(--cw-tone-danger-border);
	}
	.cw-input--error .cw-input__field:focus {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-danger-500) 30%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-danger-500) 12%, transparent);
	}

	.cw-input--valid .cw-input__field {
		border-color: var(--cw-tone-success-border);
	}
	.cw-input--valid .cw-input__field:focus {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-success-500) 30%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-success-500) 12%, transparent);
	}

	.cw-input--disabled .cw-input__field {
		opacity: 0.55;
		cursor: not-allowed;
		background-color: color-mix(in srgb, var(--cw-bg-muted) 80%, transparent);
	}

	.cw-input--disabled .cw-input__label {
		opacity: 0.5;
	}

	.cw-input__error {
		font-size: var(--cw-text-xs);
		color: var(--cw-tone-danger-text);
		margin: 0;
	}
</style>
