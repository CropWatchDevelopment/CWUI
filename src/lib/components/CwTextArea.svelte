<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { CwSize } from '../types/index.js';

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
		/** Control size (padding + font size). Matches CwInput. */
		size?: CwSize;
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
		id,
		label,
		hint,
		error,
		valid = false,
		rows = 5,
		resize = 'vertical',
		showCount = false,
		size = 'md',
		required = false,
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
	const textareaId = $derived(id ?? `${uid}-textarea`);
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
	class="cw-textarea cw-textarea--{size} {className}"
	class:cw-textarea--error={!!error}
	class:cw-textarea--valid={valid && !error}
	class:cw-textarea--disabled={disabled}
	class:cw-textarea--readonly={readOnly}
>
	{#if label}
		<label class="cw-textarea__label" for={textareaId}>
			{label}{#if required}<span class="cw-textarea__required" aria-hidden="true">&nbsp;*</span>{/if}
		</label>
	{/if}

	<div class="cw-textarea__wrapper">
		<textarea
			bind:this={textareaRef}
			id={textareaId}
			class="cw-textarea__field"
			class:cw-textarea__field--has-validation={hasValidationIcon}
			{rows}
			{required}
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
					<p class="cw-textarea__error" id="{uid}-error">{error}</p>
				{:else if hint}
					<p class="cw-textarea__hint" id="{uid}-hint">{hint}</p>
				{/if}
			</div>

			{#if showCount}
				<p class="cw-textarea__count">{counterText}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.cw-textarea {
		--_px: var(--cw-control-px-md);
		--_py: var(--cw-space-3);
		--_fs: var(--cw-control-text-md);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
		min-width: 0;
	}

	.cw-textarea--sm {
		--_px: var(--cw-control-px-sm);
		--_py: var(--cw-space-2);
		--_fs: var(--cw-control-text-sm);
	}

	.cw-textarea--lg {
		--_px: var(--cw-control-px-lg);
		--_py: var(--cw-space-4);
		--_fs: var(--cw-control-text-lg);
	}

	.cw-textarea__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-textarea__required {
		color: var(--cw-tone-danger-text);
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
		padding: var(--_py) var(--_px);
		font-family: var(--cw-font-family);
		font-size: var(--_fs);
		line-height: var(--cw-leading-relaxed);
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-textarea__field::placeholder {
		color: var(--cw-control-placeholder);
	}

	.cw-textarea__field:hover:not(:disabled):not(:read-only) {
		border-color: var(--cw-control-border-hover);
	}

	.cw-textarea__field:focus-visible {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-textarea__field--has-validation {
		padding-right: calc(var(--cw-space-10) + var(--cw-space-1));
	}

	.cw-textarea__icon-wrap {
		position: absolute;
		top: var(--_py);
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
		color: var(--cw-tone-danger-text);
	}

	.cw-textarea__icon--valid {
		color: var(--cw-tone-success-text);
	}

	.cw-textarea--error .cw-textarea__field,
	.cw-textarea--error .cw-textarea__field:hover:not(:disabled):not(:read-only) {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-textarea--valid .cw-textarea__field,
	.cw-textarea--valid .cw-textarea__field:hover:not(:disabled):not(:read-only) {
		border-color: var(--cw-tone-success-border);
	}

	.cw-textarea--disabled .cw-textarea__field {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
		background-color: var(--cw-control-bg-readonly);
		border-color: var(--cw-border-muted);
	}

	.cw-textarea--disabled .cw-textarea__label {
		color: var(--cw-text-disabled);
	}

	.cw-textarea--readonly .cw-textarea__field {
		background-color: var(--cw-control-bg-readonly);
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
		}

		.cw-textarea__meta {
			flex-wrap: wrap;
		}

		.cw-textarea__count {
			text-align: left;
		}
	}
</style>
