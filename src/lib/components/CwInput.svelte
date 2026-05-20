<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputType = 'text' | 'numeric' | 'email' | 'password' | 'color' | 'devEui' | 'creditCard' | 'cardExpiry' | 'phone';
	type NumericConstraint = number | string;

	const DEFAULT_COLOR = '#000000';
	const DEFAULT_NUMERIC_STEP = 1;

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
		min?: NumericConstraint;
		max?: NumericConstraint;
		step?: NumericConstraint;
		clearable?: boolean;
		leftSlot?: Snippet;
		rightSlot?: Snippet;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onfocus?: (e: FocusEvent) => void;
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
		min,
		max,
		step,
		clearable = false,
		leftSlot,
		rightSlot,
		oninput,
		onchange,
		onkeydown,
		onblur,
		onfocus,
		class: className = '',
	}: Props = $props();

	const uid = $props.id();
	let inputRef = $state<HTMLInputElement | null>(null);
	let showPassword = $state(false);

	const isNumeric = $derived(type === 'numeric');
	const isPassword = $derived(type === 'password');
	const isColor = $derived(type === 'color');
	const nativeType = $derived.by(() => {
		if (type === 'password') {
			return showPassword ? 'text' : 'password';
		}
		if (type === 'phone') {
			return 'tel';
		}
		return type === 'numeric' || type === 'devEui' || type === 'creditCard' || type === 'cardExpiry'
			? 'text'
			: type;
	});

	const inputMode = $derived<HTMLInputAttributes['inputmode']>(
		type === 'numeric'
			? 'decimal'
			: type === 'creditCard' || type === 'cardExpiry'
				? 'numeric'
				: type === 'phone'
					? 'tel'
					: type === 'email'
						? 'email'
						: type === 'color'
							? undefined
							: 'text'
	);
	const displayValue = $derived.by(() => (type === 'color' ? normalizeColorValue(value) : value));
	const numericMin = $derived.by(() => parseNumericConstraint(min));
	const numericMax = $derived.by(() => parseNumericConstraint(max));
	const numericValueNow = $derived.by(() => {
		if (!isNumeric) return undefined;
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : undefined;
	});

	/** Whether a validation icon is rendered on the right */
	const hasValidationIcon = $derived(!!error || (valid && !error));

	/** Whether the clear button should show */
	const showClear = $derived(clearable && !isColor && value.length > 0 && !disabled);

	/** Whether the password visibility toggle should show */
	const showPasswordToggle = $derived(isPassword);

	/** Whether the numeric stepper should show */
	const showNumericStepper = $derived(isNumeric);

	/** Whether any non-stepper content occupies the right side */
	const hasAuxiliaryRight = $derived(!!rightSlot || hasValidationIcon || showClear || showPasswordToggle);

	/** Whether _anything_ occupies the right side */
	const hasRight = $derived(showNumericStepper || hasAuxiliaryRight);

	$effect(() => {
		if (!isColor) return;

		const normalized = normalizeColorValue(value);
		if (value !== normalized) {
			value = normalized;
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let raw = target.value;

		if (type === 'numeric') {
			raw = normalizeNumericValue(raw);
		} else if (type === 'devEui') {
			raw = normalizeDevEui(raw);
		} else if (type === 'creditCard') {
			raw = formatCreditCard(raw);
		} else if (type === 'cardExpiry') {
			raw = formatCardExpiry(raw);
		} else if (type === 'phone') {
			raw = normalizePhone(raw);
		} else if (type === 'color') {
			raw = normalizeColorValue(raw);
		}

		if (type !== 'color' && maxlength !== undefined && raw.length > maxlength) {
			raw = raw.slice(0, maxlength);
		}

		value = raw;
		target.value = raw;
		oninput?.(e);
	}

	function handleKeydown(e: KeyboardEvent) {
		onkeydown?.(e);
		if (
			e.defaultPrevented ||
			type !== 'numeric' ||
			disabled ||
			e.altKey ||
			e.ctrlKey ||
			e.metaKey
		) {
			return;
		}

		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			e.preventDefault();
			stepNumericValue(e.key === 'ArrowUp' ? 1 : -1);
		}
	}

	function clear() {
		value = '';
		if (inputRef) {
			inputRef.value = '';
			inputRef.dispatchEvent(new Event('input', { bubbles: true }));
			inputRef.focus();
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
		inputRef?.focus();
	}

	function handleStepperMouseDown(event: MouseEvent) {
		event.preventDefault();
		inputRef?.focus();
	}

	function stepNumericValue(direction: 1 | -1) {
		if (!inputRef || type !== 'numeric' || disabled) return;

		const currentValue = inputRef.value;
		const currentNumber = Number(currentValue);
		const baseValue = Number.isFinite(currentNumber) ? currentNumber : 0;
		const stepSize = resolveNumericStep(currentValue);
		const precision = Math.max(getNumericPrecision(currentValue), getDecimalPlaces(stepSize));
		const nextValue = formatNumericValue(
			clampNumericValue(baseValue + direction * stepSize),
			precision
		);

		if (currentValue === nextValue) return;

		inputRef.value = nextValue;
		inputRef.dispatchEvent(new Event('input', { bubbles: true }));
	}

	function normalizeDevEui(input: string): string {
		const hex = input.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 16);
		return hex.match(/.{1,2}/g)?.join(':') ?? hex;
	}

	function normalizeNumericValue(input: string): string {
		const cleaned = input.replace(/[^0-9.\-]/g, '');
		const hasNegative = cleaned.startsWith('-');
		const unsigned = cleaned.replace(/-/g, '');
		const [integerPart = '', ...fractionParts] = unsigned.split('.');

		if (unsigned.includes('.')) {
			return `${hasNegative ? '-' : ''}${integerPart}.${fractionParts.join('')}`;
		}

		return `${hasNegative ? '-' : ''}${integerPart}`;
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

	function normalizePhone(input: string): string {
		// Strip disallowed chars but preserve the user's formatting choice
		// (dashes, spaces, parens common across US/JP/EU formats).
		const cleaned = input.replace(/[^0-9+\-\s()]/g, '');
		// Only a single leading '+' is valid in E.164 — drop any others.
		const hasPlus = cleaned.trimStart().startsWith('+');
		const withoutPluses = cleaned.replace(/\+/g, '');
		return hasPlus ? `+${withoutPluses.trimStart()}` : withoutPluses;
	}

	function normalizeColorValue(input: string): string {
		const trimmed = input.trim();
		if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
			return trimmed.toLowerCase();
		}
		if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
			return `#${trimmed
				.slice(1)
				.split('')
				.map((char) => char + char)
				.join('')
				.toLowerCase()}`;
		}
		return DEFAULT_COLOR;
	}

	function parseNumericConstraint(input: NumericConstraint | undefined): number | undefined {
		if (input === undefined || input === '') return undefined;
		const parsed = Number(input);
		return Number.isFinite(parsed) ? parsed : undefined;
	}

	function resolveNumericStep(currentValue: string): number {
		const configuredStep = parseNumericConstraint(step);
		if (configuredStep !== undefined && configuredStep > 0) {
			return configuredStep;
		}

		const precision = getNumericPrecision(currentValue);
		return precision > 0 ? 1 / 10 ** precision : DEFAULT_NUMERIC_STEP;
	}

	function clampNumericValue(nextValue: number): number {
		let resolved = nextValue;

		if (numericMin !== undefined) {
			resolved = Math.max(resolved, numericMin);
		}

		if (numericMax !== undefined) {
			resolved = Math.min(resolved, numericMax);
		}

		return resolved;
	}

	function getNumericPrecision(input: string): number {
		const trimmed = input.trim();
		if (!trimmed.includes('.')) return 0;
		return trimmed.split('.')[1]?.length ?? 0;
	}

	function getDecimalPlaces(value: number): number {
		const normalized = value.toString().toLowerCase();
		if (normalized.includes('e-')) {
			const [coefficient, exponent] = normalized.split('e-');
			return Number(exponent) + (coefficient.split('.')[1]?.length ?? 0);
		}

		return normalized.split('.')[1]?.length ?? 0;
	}

	function formatNumericValue(nextValue: number, precision: number): string {
		return precision > 0 ? nextValue.toFixed(precision) : String(Number(nextValue.toFixed(0)));
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
			class:cw-input__field--has-right={hasAuxiliaryRight}
			class:cw-input__field--has-stepper={showNumericStepper}
			type={nativeType}
			inputmode={inputMode}
			value={displayValue}
			{name}
			{required}
			{disabled}
			{placeholder}
			autocomplete="off"
			maxlength={maxlength ?? undefined}
			oninput={handleInput}
			onchange={onchange}
			onkeydown={handleKeydown}
			onblur={onblur}
			onfocus={onfocus}
			role={isNumeric ? 'spinbutton' : undefined}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${uid}-error` : undefined}
			aria-valuemin={isNumeric ? numericMin : undefined}
			aria-valuemax={isNumeric ? numericMax : undefined}
			aria-valuenow={isNumeric ? numericValueNow : undefined}
			aria-valuetext={isNumeric && value ? value : undefined}
		/>

		<!-- Right-side content: clear button, user slot, validation icon -->
		{#if hasRight}
			<span class="cw-input__slot cw-input__slot--right">
				{#if showNumericStepper}
					<span class="cw-input__stepper">
						<button
							type="button"
							class="cw-input__stepper-button"
							aria-label="Increase value"
							disabled={disabled}
							tabindex="-1"
							onmousedown={handleStepperMouseDown}
							onclick={() => stepNumericValue(1)}
						>
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M4.5 9.5L8 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
						<button
							type="button"
							class="cw-input__stepper-button"
							aria-label="Decrease value"
							disabled={disabled}
							tabindex="-1"
							onmousedown={handleStepperMouseDown}
							onclick={() => stepNumericValue(-1)}
						>
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
					</span>
				{/if}
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

	.cw-input__field[type='color'] {
		padding: 0.3125rem;
		cursor: pointer;
	}

	.cw-input__field[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.cw-input__field[type='color']::-webkit-color-swatch,
	.cw-input__field[type='color']::-moz-color-swatch {
		border: none;
		border-radius: calc(var(--cw-radius-xl) - 0.3125rem);
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

	.cw-input__field--has-stepper {
		padding-right: 3.75rem;
	}

	.cw-input__field--has-right.cw-input__field--has-stepper {
		padding-right: 5.625rem;
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
		gap: 0.375rem;
	}

	.cw-input__stepper {
		display: grid;
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 0.125rem;
		pointer-events: auto;
	}

	.cw-input__stepper-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 0.8125rem;
		padding: 0;
		border: none;
		background: color-mix(in srgb, var(--cw-bg-elevated) 78%, transparent);
		color: var(--cw-text-muted);
		cursor: pointer;
		border-radius: 0.375rem;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__stepper-button:hover:not(:disabled) {
		color: var(--cw-text-primary);
		background: color-mix(in srgb, var(--cw-bg-elevated) 92%, var(--cw-info-500));
	}

	.cw-input__stepper-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.cw-input__stepper-button svg {
		width: 0.75rem;
		height: 0.75rem;
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
