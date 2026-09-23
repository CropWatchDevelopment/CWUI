<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CwSwitchLabelPosition } from '../types/index.js';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'onchange' | 'oninput'> {
		checked?: boolean;
		id?: string;
		name?: HTMLInputAttributes['name'];
		label?: string;
		/** Helper text, announced as the switch's description (not part of its name). */
		description?: string;
		/** Error message; marks the switch invalid. */
		error?: string;
		labelPosition?: CwSwitchLabelPosition;
		onchange?: (checked: boolean, event: Event) => void;
		oninput?: (checked: boolean, event: Event) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		id,
		name,
		label,
		description,
		error,
		labelPosition = 'right' as CwSwitchLabelPosition,
		disabled = false,
		onchange,
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const resolvedLabelPosition = $derived(normalizeLabelPosition(labelPosition));
	const titleId = $derived(`${inputId}-label`);
	const descriptionId = $derived(`${inputId}-description`);
	const errorId = $derived(`${inputId}-error`);
	const describedBy = $derived(
		[description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') ||
			undefined
	);

	function normalizeLabelPosition(value: CwSwitchLabelPosition | undefined): CwSwitchLabelPosition {
		switch (value) {
			case 'top':
			case 'bottom':
			case 'left':
			case 'right':
				return value;
			default:
				return 'right';
		}
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		checked = target.checked;
		oninput?.(checked, event);
	}

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		checked = target.checked;
		onchange?.(checked, event);
	}
</script>

<div
	class="cw-switch {className}"
	class:cw-switch--disabled={disabled}
	class:cw-switch--invalid={!!error}
	class:cw-switch--label-top={resolvedLabelPosition === 'top'}
	class:cw-switch--label-bottom={resolvedLabelPosition === 'bottom'}
	class:cw-switch--label-left={resolvedLabelPosition === 'left'}
	class:cw-switch--label-right={resolvedLabelPosition === 'right'}
>
	<label class="cw-switch__label" for={inputId}>
		<input
			id={inputId}
			class="cw-switch__input"
			type="checkbox"
			role="switch"
			bind:checked
			{name}
			{disabled}
			aria-labelledby={label ? titleId : undefined}
			aria-describedby={describedBy}
			aria-invalid={error ? 'true' : undefined}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>
		<span class="cw-switch__control" aria-hidden="true">
			<span class="cw-switch__thumb"></span>
		</span>

		{#if label || description || error}
			<span class="cw-switch__text">
				{#if label}
					<span id={titleId} class="cw-switch__title">{label}</span>
				{/if}
				{#if description}
					<span id={descriptionId} class="cw-switch__description">{description}</span>
				{/if}
				{#if error}
					<span id={errorId} class="cw-switch__error">{error}</span>
				{/if}
			</span>
		{/if}
	</label>
</div>

<style>
	.cw-switch {
		display: inline-flex;
		max-width: 100%;
		font-family: var(--cw-font-family);
	}

	.cw-switch__label {
		/* Contain the visually-hidden position:absolute input. Without a positioned
		   ancestor its containing block is <html>, so it renders at its in-flow
		   position but escapes scroll-container clipping and stretches the document
		   (extra scrollable empty space below the app). */
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-3);
		cursor: pointer;
		user-select: none;
	}

	.cw-switch--label-left .cw-switch__label {
		flex-direction: row-reverse;
	}

	.cw-switch--label-top .cw-switch__label,
	.cw-switch--label-bottom .cw-switch__label {
		align-items: flex-start;
	}

	.cw-switch--label-top .cw-switch__label {
		flex-direction: column-reverse;
	}

	.cw-switch--label-bottom .cw-switch__label {
		flex-direction: column;
	}

	.cw-switch__input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}

	.cw-switch__control {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 2.5rem;
		height: 1.5rem;
		padding: 0.125rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-bg-muted);
		border: 1px solid var(--cw-control-border);
		transition:
			background-color var(--cw-duration-normal) var(--cw-ease-default),
			border-color var(--cw-duration-normal) var(--cw-ease-default);
		flex-shrink: 0;
	}

	.cw-switch__thumb {
		display: block;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-bg-elevated);
		box-shadow: var(--cw-shadow-sm);
		/* 2D translate (no translate3d/will-change) to avoid pinning the thumb to a
		   permanent GPU compositing layer. On pages with several switches that layer
		   triggers a Chromium repaint bug where toggling one leaves sibling regions
		   unpainted until a scroll/resize. The slide still animates via the transition. */
		transform: translateX(0);
		transition:
			transform var(--cw-duration-normal) var(--cw-ease-out),
			background-color var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-switch__label:hover .cw-switch__input:not(:disabled) + .cw-switch__control {
		border-color: var(--cw-control-border-hover);
	}

	.cw-switch__input:checked + .cw-switch__control {
		background-color: color-mix(in srgb, var(--cw-accent) 75%, var(--cw-bg-elevated));
		border-color: var(--cw-accent);
	}

	.cw-switch__input:checked + .cw-switch__control .cw-switch__thumb {
		transform: translateX(1rem);
		background-color: var(--cw-text-inverse);
	}

	/* The native input is visually hidden, so draw the global focus ring on the track. */
	.cw-switch__input:focus-visible + .cw-switch__control {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-switch--invalid .cw-switch__control {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-switch__input:disabled + .cw-switch__control {
		opacity: var(--cw-opacity-disabled);
	}

	.cw-switch__text {
		display: inline-flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.cw-switch__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
		line-height: var(--cw-leading-tight);
	}

	.cw-switch__description,
	.cw-switch__error {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		line-height: var(--cw-leading-normal);
	}

	.cw-switch__error {
		color: var(--cw-tone-danger-text);
	}

	.cw-switch--disabled .cw-switch__label {
		cursor: not-allowed;
	}

	.cw-switch--disabled .cw-switch__title {
		color: var(--cw-text-disabled);
	}
</style>
