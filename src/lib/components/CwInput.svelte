<script lang="ts">
	import type { Snippet } from 'svelte';

	type InputType = 'text' | 'numeric' | 'email' | 'password' | 'devEui';

	interface Props {
		type?: InputType;
		value?: string;
		label?: string;
		error?: string;
		valid?: boolean;
		disabled?: boolean;
		placeholder?: string;
		leftSlot?: Snippet;
		rightSlot?: Snippet;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
	}

	let {
		type = 'text',
		value = $bindable(''),
		label,
		error,
		valid = false,
		disabled = false,
		placeholder,
		leftSlot,
		rightSlot,
		oninput,
		onchange,
	}: Props = $props();

	const uid = $props.id();

	const nativeType = $derived(
		type === 'numeric' ? 'text' : type === 'devEui' ? 'text' : type
	);

	const inputMode = $derived<'text' | 'numeric' | 'email'>(
		type === 'numeric' ? 'numeric' : type === 'email' ? 'email' : 'text'
	);

	/** Whether a validation icon is rendered on the right */
	const hasValidationIcon = $derived(!!error || (valid && !error));

	/** Whether _anything_ occupies the right side (slot or validation icon) */
	const hasRight = $derived(!!rightSlot || hasValidationIcon);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let raw = target.value;

		if (type === 'numeric') {
			raw = raw.replace(/[^0-9.\-]/g, '');
		} else if (type === 'devEui') {
			raw = normalizeDevEui(raw);
		}

		value = raw;
		target.value = raw;
		oninput?.(e);
	}

	function normalizeDevEui(input: string): string {
		const hex = input.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 16);
		return hex.match(/.{1,2}/g)?.join(':') ?? hex;
	}
</script>

<div
	class="cw-input"
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
			id="{uid}-input"
			class="cw-input__field"
			class:cw-input__field--has-left={!!leftSlot}
			class:cw-input__field--has-right={hasRight}
			type={nativeType}
			inputmode={inputMode}
			{value}
			{disabled}
			{placeholder}
			oninput={handleInput}
			onchange={onchange}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${uid}-error` : undefined}
		/>

		<!-- Right-side content: user slot + validation icon -->
		{#if hasRight}
			<span class="cw-input__slot cw-input__slot--right">
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
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-input__wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.cw-input__field {
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-strong);
		border-radius: var(--cw-radius-md);
		outline: none;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
		min-height: 2.375rem;
	}

	.cw-input__field::placeholder {
		color: var(--cw-text-muted);
	}

	.cw-input__field:focus {
		border-color: var(--cw-focus-ring-color);
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-focus-ring-color) 35%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-focus-ring-color) 15%, transparent);
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
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--cw-bg-muted);
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
