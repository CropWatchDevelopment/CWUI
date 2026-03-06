<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type ResizeMode = 'none' | 'vertical' | 'horizontal' | 'both';

	interface Props
		extends Omit<
			HTMLTextareaAttributes,
			| 'value'
			| 'class'
			| 'children'
			| 'oninput'
			| 'onchange'
			| 'onkeydown'
			| 'onblur'
			| 'onfocus'
			| 'oninvalid'
		> {
		value?: string;
		label?: string;
		hint?: string;
		error?: string;
		valid?: boolean;
		rows?: number;
		resize?: ResizeMode;
		showCount?: boolean;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onfocus?: (e: FocusEvent) => void;
		oninvalid?: (e: Event) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		label,
		hint,
		error,
		valid = false,
		rows = 5,
		resize = 'vertical',
		showCount = false,
		disabled = false,
		readonly: readOnly = false,
		maxlength,
		oninput,
		onchange,
		onkeydown,
		onblur,
		onfocus,
		oninvalid,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		class: className = '',
		...rest
	}: Props = $props();

	const uid = $props.id();
	let textareaRef = $state<HTMLTextAreaElement | null>(null);

	const hasValidationIcon = $derived(!!error || (valid && !error));
	const metaDescriptionId = $derived.by(() => {
		if (error) {
			return `${uid}-error`;
		}

		if (hint) {
			return `${uid}-hint`;
		}

		return undefined;
	});
	const describedBy = $derived.by(() => {
		const ids = [ariaDescribedBy, metaDescriptionId].filter(Boolean);
		return ids.length > 0 ? ids.join(' ') : undefined;
	});
	const counterText = $derived.by(() => {
		if (!showCount) {
			return '';
		}

		if (maxlength !== undefined) {
			return `${value.length}/${maxlength}`;
		}

		return `${value.length}`;
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		oninput?.(event);
	}

	export function focus(options?: FocusOptions) {
		textareaRef?.focus(options);
	}

	export function blur() {
		textareaRef?.blur();
	}

	export function select() {
		textareaRef?.select();
	}

	export function checkValidity() {
		return textareaRef?.checkValidity() ?? true;
	}

	export function reportValidity() {
		return textareaRef?.reportValidity() ?? true;
	}

	export function setCustomValidity(message: string) {
		textareaRef?.setCustomValidity(message);
	}

	export function getValidity() {
		return textareaRef?.validity ?? null;
	}

	export function getElement() {
		return textareaRef;
	}
</script>

<div
	class="cw-textarea {className}"
	class:cw-textarea--error={!!error}
	class:cw-textarea--valid={valid && !error}
	class:cw-textarea--disabled={disabled}
	class:cw-textarea--readonly={readOnly}
>
	{#if label}
		<label class="cw-textarea__label" for="{uid}-textarea">{label}</label>
	{/if}

	<div class="cw-textarea__wrapper">
		<textarea
			bind:this={textareaRef}
			id="{uid}-textarea"
			class="cw-textarea__field"
			class:cw-textarea__field--has-validation={hasValidationIcon}
			{rows}
			{disabled}
			readonly={readOnly}
			maxlength={maxlength ?? undefined}
			value={value}
			oninput={handleInput}
			onchange={onchange}
			onkeydown={onkeydown}
			onblur={onblur}
			onfocus={onfocus}
			oninvalid={oninvalid}
			aria-invalid={error ? 'true' : ariaInvalid}
			aria-describedby={describedBy}
			style:resize={resize}
			{...rest}
		></textarea>

		{#if hasValidationIcon}
			<span class="cw-textarea__icon-wrap" aria-hidden="true">
				{#if error}
					<svg class="cw-textarea__icon cw-textarea__icon--error" viewBox="0 0 16 16" fill="none">
						<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
						<path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				{:else if valid}
					<svg class="cw-textarea__icon cw-textarea__icon--valid" viewBox="0 0 16 16" fill="none">
						<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
						<path d="M5.5 8l2 2 3.5-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				{/if}
			</span>
		{/if}
	</div>

	{#if error || hint || showCount}
		<div class="cw-textarea__meta">
			<div class="cw-textarea__meta-copy">
				{#if error}
					<p class="cw-textarea__error" id="{uid}-error" role="alert">{error}</p>
				{:else if hint}
					<p class="cw-textarea__hint" id="{uid}-hint">{hint}</p>
				{/if}
			</div>

			{#if showCount}
				<p class="cw-textarea__count" aria-live="polite">{counterText}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cw-textarea {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
		min-width: 0;
	}

	.cw-textarea__label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
	}

	.cw-textarea__wrapper {
		position: relative;
		width: 100%;
	}

	.cw-textarea__field {
		width: 100%;
		max-width: 100%;
		min-width: 0;
		min-height: 7.5rem;
		padding: 0.875rem var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
		color: var(--cw-text-primary);
		background-color: color-mix(in srgb, var(--cw-bg-elevated) 60%, transparent);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		outline: none;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-textarea__field::placeholder {
		color: var(--cw-text-muted);
	}

	.cw-textarea__field:hover:not(:disabled):not(:read-only) {
		border-color: color-mix(in srgb, var(--cw-border-default) 75%, var(--cw-info-500));
	}

	.cw-textarea__field:focus,
	.cw-textarea__field:focus-visible {
		border-color: var(--cw-info-500);
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--cw-info-500) 40%, transparent),
			0 0 10px color-mix(in srgb, var(--cw-info-500) 18%, transparent);
	}

	.cw-textarea__field--has-validation {
		padding-right: calc(var(--cw-space-10) + var(--cw-space-1));
	}

	.cw-textarea__icon-wrap {
		position: absolute;
		top: 0.875rem;
		right: var(--cw-space-3);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--cw-text-muted);
		pointer-events: none;
	}

	.cw-textarea__icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.cw-textarea__icon--error {
		color: var(--cw-danger-500);
	}

	.cw-textarea__icon--valid {
		color: var(--cw-success-500);
	}

	.cw-textarea--error .cw-textarea__field {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-textarea--error .cw-textarea__field:focus,
	.cw-textarea--error .cw-textarea__field:focus-visible {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-danger-500) 30%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-danger-500) 12%, transparent);
	}

	.cw-textarea--valid .cw-textarea__field {
		border-color: var(--cw-tone-success-border);
	}

	.cw-textarea--valid .cw-textarea__field:focus,
	.cw-textarea--valid .cw-textarea__field:focus-visible {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-success-500) 30%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-success-500) 12%, transparent);
	}

	.cw-textarea--disabled .cw-textarea__field {
		opacity: 0.55;
		cursor: not-allowed;
		background-color: color-mix(in srgb, var(--cw-bg-muted) 80%, transparent);
	}

	.cw-textarea--disabled .cw-textarea__label {
		opacity: 0.5;
	}

	.cw-textarea--readonly .cw-textarea__field {
		background-color: color-mix(in srgb, var(--cw-bg-muted) 55%, var(--cw-bg-elevated));
	}

	.cw-textarea__meta {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-2);
	}

	.cw-textarea__meta-copy {
		flex: 1;
		min-width: 0;
	}

	.cw-textarea__error,
	.cw-textarea__hint,
	.cw-textarea__count {
		margin: 0;
		font-size: var(--cw-text-xs);
	}

	.cw-textarea__error {
		color: var(--cw-tone-danger-text);
	}

	.cw-textarea__hint {
		color: var(--cw-text-muted);
	}

	.cw-textarea__count {
		flex-shrink: 0;
		color: var(--cw-text-muted);
		text-align: right;
	}

	@media (max-width: 40rem) {
		.cw-textarea__field {
			min-height: 6.75rem;
			padding: 0.8125rem var(--cw-space-3);
		}

		.cw-textarea__icon-wrap {
			top: 0.8125rem;
		}

		.cw-textarea__meta {
			flex-wrap: wrap;
		}

		.cw-textarea__count {
			text-align: left;
		}
	}
</style>
