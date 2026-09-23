<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import type { CwSize } from '../types/index.js';

	type InputType = 'text' | 'numeric' | 'email' | 'password' | 'color' | 'devEui' | 'creditCard' | 'cardExpiry' | 'phone';
	type NumericConstraint = number | string;

	interface CwInputLabels {
		clear: string;
		showPassword: string;
		hidePassword: string;
		increase: string;
		decrease: string;
	}

	const DEFAULT_LABELS: CwInputLabels = {
		clear: 'Clear',
		showPassword: 'Show password',
		hidePassword: 'Hide password',
		increase: 'Increase value',
		decrease: 'Decrease value'
	};

	const DEFAULT_COLOR = '#000000';
	const DEFAULT_NUMERIC_STEP = 1;

	interface Props {
		type?: InputType;
		value?: string;
		name?: string;
		/** Native id placed on the `<input>` (and the label's `for`). Falls back to an auto-generated id. */
		id?: string;
		required?: boolean;
		label?: string;
		/** Helper text shown below the field. Replaced by `error` when set. */
		hint?: string;
		error?: string;
		valid?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		/** Control size. Matches CwButton / CwDropdown heights. */
		size?: CwSize;
		/** Override built-in English strings (button labels). */
		labels?: Partial<CwInputLabels>;
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
		/** Overrides the input's role (e.g. `combobox` for autocomplete wrappers). */
		role?: HTMLInputAttributes['role'];
		'aria-expanded'?: HTMLInputAttributes['aria-expanded'];
		'aria-controls'?: HTMLInputAttributes['aria-controls'];
		'aria-activedescendant'?: HTMLInputAttributes['aria-activedescendant'];
		'aria-autocomplete'?: HTMLInputAttributes['aria-autocomplete'];
		'aria-haspopup'?: HTMLInputAttributes['aria-haspopup'];
		'aria-busy'?: HTMLInputAttributes['aria-busy'];
		/** Accessible name when no visible `label` is rendered. */
		'aria-label'?: HTMLInputAttributes['aria-label'];
		/** Extra ids appended to the input's aria-describedby. */
		'aria-describedby'?: string;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		name,
		id,
		required = false,
		label,
		hint,
		error,
		valid = false,
		disabled = false,
		readonly = false,
		size = 'md',
		labels,
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
		role,
		'aria-expanded': ariaExpanded,
		'aria-controls': ariaControls,
		'aria-activedescendant': ariaActiveDescendant,
		'aria-autocomplete': ariaAutocomplete,
		'aria-haspopup': ariaHasPopup,
		'aria-busy': ariaBusy,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedBy,
		class: className = '',
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const text = $derived({ ...DEFAULT_LABELS, ...labels });
	const describedBy = $derived(
		[ariaDescribedBy, error ? `${uid}-error` : hint ? `${uid}-hint` : undefined]
			.filter(Boolean)
			.join(' ') || undefined
	);
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
	const showClear = $derived(clearable && !isColor && value.length > 0 && !disabled && !readonly);

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
			readonly ||
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
		if (!inputRef || type !== 'numeric' || disabled || readonly) return;

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
	class="cw-input cw-input--{size} {className}"
	class:cw-input--error={!!error}
	class:cw-input--valid={valid && !error}
	class:cw-input--disabled={disabled}
	class:cw-input--readonly={readonly}
>
	{#if label}
		<label class="cw-input__label" for={inputId}>
			{label}{#if required}<span class="cw-input__required" aria-hidden="true">&nbsp;*</span>{/if}
		</label>
	{/if}

	<div class="cw-input__wrapper">
		{#if leftSlot}
			<span class="cw-input__slot cw-input__slot--left">
				{@render leftSlot()}
			</span>
		{/if}

		<input
			bind:this={inputRef}
			id={inputId}
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
			{readonly}
			{placeholder}
			autocomplete={autocomplete ?? 'off'}
			maxlength={maxlength ?? undefined}
			oninput={handleInput}
			onchange={onchange}
			onkeydown={handleKeydown}
			onblur={onblur}
			onfocus={onfocus}
			role={role ?? (isNumeric ? 'spinbutton' : undefined)}
			aria-expanded={ariaExpanded}
			aria-controls={ariaControls}
			aria-activedescendant={ariaActiveDescendant}
			aria-autocomplete={ariaAutocomplete}
			aria-haspopup={ariaHasPopup}
			aria-busy={ariaBusy}
			aria-label={label ? undefined : ariaLabel}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
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
							aria-label={text.increase}
							disabled={disabled || readonly}
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
							aria-label={text.decrease}
							disabled={disabled || readonly}
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
					<button
						type="button"
						class="cw-input__icon-button"
						aria-label={text.clear}
						onclick={clear}
					>
						<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				{/if}
				{#if showPasswordToggle}
					<button
						type="button"
						class="cw-input__icon-button"
						aria-label={showPassword ? text.hidePassword : text.showPassword}
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
		<p class="cw-input__message cw-input__message--error" id="{uid}-error">{error}</p>
	{:else if hint}
		<p class="cw-input__message" id="{uid}-hint">{hint}</p>
	{/if}
</div>

<style>
	.cw-input {
		--_h: var(--cw-control-h-md);
		--_px: var(--cw-control-px-md);
		--_fs: var(--cw-control-text-md);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-input--sm {
		--_h: var(--cw-control-h-sm);
		--_px: var(--cw-control-px-sm);
		--_fs: var(--cw-control-text-sm);
	}

	.cw-input--lg {
		--_h: var(--cw-control-h-lg);
		--_px: var(--cw-control-px-lg);
		--_fs: var(--cw-control-text-lg);
	}

	.cw-input__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-input__required {
		color: var(--cw-tone-danger-text);
	}

	.cw-input__wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.cw-input__field {
		width: 100%;
		min-height: var(--_h);
		padding: 0 var(--_px);
		font-family: var(--cw-font-family);
		font-size: var(--_fs);
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__field::placeholder {
		color: var(--cw-control-placeholder);
	}

	.cw-input__field[type='color'] {
		padding: var(--cw-space-1);
		cursor: pointer;
	}

	.cw-input__field[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.cw-input__field[type='color']::-webkit-color-swatch,
	.cw-input__field[type='color']::-moz-color-swatch {
		border: none;
		border-radius: var(--cw-radius-md);
	}

	.cw-input__field:hover:not(:disabled):not(:read-only) {
		border-color: var(--cw-control-border-hover);
	}

	.cw-input__field:focus-visible {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-input__field--has-left {
		padding-left: var(--cw-space-10);
	}

	.cw-input__field--has-right {
		padding-right: var(--cw-space-12);
	}

	.cw-input__field--has-stepper {
		padding-right: 3.75rem;
	}

	.cw-input__field--has-right.cw-input__field--has-stepper {
		padding-right: 6.5rem;
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
		right: var(--cw-space-2);
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
		width: 1.5rem;
		height: 0.875rem;
		padding: 0;
		border: none;
		background: var(--cw-bg-muted);
		color: var(--cw-text-muted);
		cursor: pointer;
		border-radius: var(--cw-radius-sm);
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__stepper-button:hover:not(:disabled) {
		color: var(--cw-text-primary);
		background: var(--cw-bg-subtle);
	}

	.cw-input__stepper-button:disabled {
		cursor: not-allowed;
		opacity: var(--cw-opacity-disabled);
	}

	.cw-input__stepper-button svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	/* ── Clear / password buttons ────────── */
	.cw-input__icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: var(--cw-hit-target-min);
		min-height: var(--cw-hit-target-min);
		padding: 0;
		border: none;
		background: none;
		color: var(--cw-text-muted);
		cursor: pointer;
		pointer-events: auto;
		border-radius: var(--cw-radius-full);
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-input__icon-button:hover:not(:disabled) {
		color: var(--cw-text-primary);
		background: var(--cw-option-hover-bg);
	}

	.cw-input__icon-button:disabled {
		cursor: not-allowed;
		opacity: var(--cw-opacity-disabled);
	}

	.cw-input__icon-button svg {
		width: 1rem;
		height: 1rem;
	}

	/* ── Validation icons ────────────────── */
	.cw-input__icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.cw-input__icon--error {
		color: var(--cw-tone-danger-text);
	}

	.cw-input__icon--valid {
		color: var(--cw-tone-success-text);
	}

	/* ── States ──────────────────────────── */
	.cw-input--error .cw-input__field,
	.cw-input--error .cw-input__field:hover:not(:disabled) {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-input--valid .cw-input__field,
	.cw-input--valid .cw-input__field:hover:not(:disabled) {
		border-color: var(--cw-tone-success-border);
	}

	.cw-input--readonly .cw-input__field {
		background-color: var(--cw-control-bg-readonly);
	}

	.cw-input--disabled .cw-input__field {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
		background-color: var(--cw-control-bg-readonly);
		border-color: var(--cw-border-muted);
	}

	.cw-input--disabled .cw-input__label {
		color: var(--cw-text-disabled);
	}

	.cw-input__message {
		margin: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-input__message--error {
		color: var(--cw-tone-danger-text);
	}
</style>
