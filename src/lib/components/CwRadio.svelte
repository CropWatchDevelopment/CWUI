<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CwRadioValue } from '../types/index.js';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'checked' | 'value' | 'onchange' | 'oninput'> {
		group?: CwRadioValue | null;
		value?: CwRadioValue;
		id?: string;
		label?: string;
		/** Helper text, announced as the radio's description (not part of its name). */
		description?: string;
		/** Error message; marks the radio invalid. For groups, prefer one error on the group container. */
		error?: string;
		onchange?: (value: CwRadioValue, event: Event) => void;
		oninput?: (value: CwRadioValue, event: Event) => void;
		class?: string;
	}

	let {
		group = $bindable<CwRadioValue | null>(null),
		value = 'on' as CwRadioValue,
		id,
		label,
		description,
		error,
		disabled = false,
		required = false,
		onchange,
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const isSelected = $derived(group === value);
	const titleId = $derived(`${inputId}-label`);
	const descriptionId = $derived(`${inputId}-description`);
	const errorId = $derived(`${inputId}-error`);
	const describedBy = $derived(
		[description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') ||
			undefined
	);

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		if (!target.checked) return;
		group = value;
		oninput?.(value, event);
	}

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		if (!target.checked) return;
		group = value;
		onchange?.(value, event);
	}
</script>

<div
	class="cw-radio {className}"
	class:cw-radio--disabled={disabled}
	class:cw-radio--selected={isSelected}
	class:cw-radio--invalid={!!error}
>
	<label class="cw-radio__label" for={inputId}>
		<input
			id={inputId}
			class="cw-radio__input"
			type="radio"
			bind:group
			{value}
			{disabled}
			{required}
			aria-labelledby={label ? titleId : undefined}
			aria-describedby={describedBy}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>

		<span class="cw-radio__control" aria-hidden="true">
			<span class="cw-radio__dot"></span>
		</span>

		{#if label || description || error}
			<span class="cw-radio__text">
				{#if label}
					<span id={titleId} class="cw-radio__title">{label}</span>
				{/if}
				{#if description}
					<span id={descriptionId} class="cw-radio__description">{description}</span>
				{/if}
				{#if error}
					<span id={errorId} class="cw-radio__error">{error}</span>
				{/if}
			</span>
		{/if}
	</label>
</div>

<style>
	.cw-radio {
		display: inline-flex;
		max-width: 100%;
		font-family: var(--cw-font-family);
	}

	.cw-radio__label {
		/* Positioned ancestor for the visually-hidden absolute input: without it
		   the input's containing block is <html>, escaping scroll-container
		   clipping and stretching the document (same fix as CwCheckbox/CwSwitch). */
		position: relative;
		display: inline-flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		cursor: pointer;
		user-select: none;
	}

	.cw-radio__input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}

	.cw-radio__control {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.125rem;
		border-radius: var(--cw-radius-full);
		border: 1px solid var(--cw-control-border);
		background: var(--cw-control-bg);
		box-shadow: var(--cw-shadow-sm);
		flex-shrink: 0;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-radio__dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-accent);
		opacity: 0;
		transform: scale(0.2);
		transition:
			transform var(--cw-duration-normal) var(--cw-ease-out),
			opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-radio__label:hover .cw-radio__input:not(:disabled) + .cw-radio__control {
		border-color: var(--cw-control-border-hover);
	}

	.cw-radio__input:checked + .cw-radio__control {
		border-color: var(--cw-accent);
		background: color-mix(in srgb, var(--cw-accent-bg) 64%, var(--cw-control-bg));
	}

	.cw-radio__input:checked + .cw-radio__control .cw-radio__dot {
		opacity: 1;
		transform: scale(1);
	}

	/* The native input is visually hidden, so draw the global focus ring on the control. */
	.cw-radio__input:focus-visible + .cw-radio__control {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-radio--invalid .cw-radio__control {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-radio__input:disabled + .cw-radio__control {
		opacity: var(--cw-opacity-disabled);
		box-shadow: none;
	}

	.cw-radio__text {
		display: inline-flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.cw-radio__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
		padding-top: 0.1875rem;
	}

	.cw-radio__description,
	.cw-radio__error {
		font-size: var(--cw-text-xs);
		line-height: var(--cw-leading-normal);
		color: var(--cw-text-muted);
	}

	.cw-radio__error {
		color: var(--cw-tone-danger-text);
	}

	.cw-radio--disabled .cw-radio__label {
		cursor: not-allowed;
	}

	.cw-radio--disabled .cw-radio__title {
		color: var(--cw-text-disabled);
	}
</style>
