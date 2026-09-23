<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'onchange' | 'oninput'> {
		checked?: boolean;
		/** Mixed state (e.g. "some children selected"). Cleared when the user toggles. */
		indeterminate?: boolean;
		id?: string;
		name?: HTMLInputAttributes['name'];
		label?: string;
		/** Helper text shown under the label, announced as the checkbox description. */
		description?: string;
		/** Error message; marks the checkbox invalid and replaces nothing — shown under the description. */
		error?: string;
		onchange?: (checked: boolean, event: Event) => void;
		oninput?: (checked: boolean, event: Event) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		id,
		name,
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
	const descriptionId = $derived(`${inputId}-description`);
	const errorId = $derived(`${inputId}-error`);
	const describedBy = $derived(
		[description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') ||
			undefined
	);

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		checked = target.checked;
		indeterminate = false;
		oninput?.(checked, event);
	}

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		checked = target.checked;
		indeterminate = false;
		onchange?.(checked, event);
	}
</script>

<div
	class="cw-checkbox {className}"
	class:cw-checkbox--disabled={disabled}
	class:cw-checkbox--checked={checked || indeterminate}
	class:cw-checkbox--invalid={!!error}
>
	<label class="cw-checkbox__label" for={inputId}>
		<input
			id={inputId}
			class="cw-checkbox__input"
			type="checkbox"
			bind:checked
			bind:indeterminate
			{name}
			{disabled}
			{required}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>

		<span class="cw-checkbox__control" aria-hidden="true">
			{#if indeterminate}
				<svg class="cw-checkbox__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M4 8h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
			{:else}
				<svg class="cw-checkbox__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M3.5 8.5l3 3 6-6"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</span>

		{#if label}
			<span class="cw-checkbox__title">
				{label}
				{#if required}<span class="cw-checkbox__required" aria-hidden="true">*</span>{/if}
			</span>
		{/if}
	</label>

	{#if description}
		<span id={descriptionId} class="cw-checkbox__description">{description}</span>
	{/if}
	{#if error}
		<span id={errorId} class="cw-checkbox__error">{error}</span>
	{/if}
</div>

<style>
	.cw-checkbox {
		--cw-checkbox-size: 1.25rem;
		display: inline-grid;
		grid-template-columns: var(--cw-checkbox-size) minmax(0, 1fr);
		column-gap: var(--cw-space-3);
		row-gap: 0.125rem;
		max-width: 100%;
		font-family: var(--cw-font-family);
	}

	.cw-checkbox__label {
		/* Contain the visually-hidden position:absolute input so its containing block
		   is this label, not <html>. Otherwise it escapes scroll-container clipping
		   and stretches the document (empty scrollable space below the app). */
		position: relative;
		grid-column: 1 / -1;
		display: inline-flex;
		align-items: flex-start;
		gap: var(--cw-space-3);
		cursor: pointer;
		user-select: none;
	}

	.cw-checkbox__input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}

	.cw-checkbox__control {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--cw-checkbox-size);
		height: var(--cw-checkbox-size);
		margin-top: 0.125rem;
		border-radius: var(--cw-radius-sm);
		border: 1px solid var(--cw-control-border);
		background: var(--cw-control-bg);
		box-shadow: var(--cw-shadow-sm);
		color: var(--cw-text-inverse);
		flex-shrink: 0;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-checkbox__check {
		width: 0.95rem;
		height: 0.95rem;
		opacity: 0;
		transform: scale(0.7);
		transition:
			transform var(--cw-duration-normal) var(--cw-ease-out),
			opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-checkbox__label:hover .cw-checkbox__input:not(:disabled) + .cw-checkbox__control {
		border-color: var(--cw-control-border-hover);
	}

	.cw-checkbox__input:checked + .cw-checkbox__control,
	.cw-checkbox__input:indeterminate + .cw-checkbox__control {
		border-color: var(--cw-accent);
		background: var(--cw-accent);
	}

	.cw-checkbox__input:checked + .cw-checkbox__control .cw-checkbox__check,
	.cw-checkbox__input:indeterminate + .cw-checkbox__control .cw-checkbox__check {
		opacity: 1;
		transform: scale(1);
	}

	/* The native input is visually hidden, so draw the global focus ring on the box. */
	.cw-checkbox__input:focus-visible + .cw-checkbox__control {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-checkbox--invalid .cw-checkbox__control {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-checkbox__input:disabled + .cw-checkbox__control {
		opacity: var(--cw-opacity-disabled);
		box-shadow: none;
	}

	.cw-checkbox__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		line-height: var(--cw-leading-tight);
		color: var(--cw-text-primary);
		padding-top: 0.1875rem;
	}

	.cw-checkbox__required {
		margin-inline-start: 0.125rem;
		color: var(--cw-tone-danger-text);
	}

	.cw-checkbox__description,
	.cw-checkbox__error {
		grid-column: 2;
		font-size: var(--cw-text-xs);
		line-height: var(--cw-leading-normal);
	}

	.cw-checkbox__description {
		color: var(--cw-text-muted);
	}

	.cw-checkbox__error {
		color: var(--cw-tone-danger-text);
	}

	.cw-checkbox--disabled .cw-checkbox__label {
		cursor: not-allowed;
	}

	.cw-checkbox--disabled .cw-checkbox__title {
		color: var(--cw-text-disabled);
	}
</style>
