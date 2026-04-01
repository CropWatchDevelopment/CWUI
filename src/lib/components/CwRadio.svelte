<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CwRadioValue } from '../types/index.js';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'checked' | 'value' | 'onchange' | 'oninput'> {
		group?: CwRadioValue | null;
		value?: CwRadioValue;
		id?: string;
		label?: string;
		description?: string;
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
		disabled = false,
		onchange,
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);
	const isSelected = $derived(group === value);

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
>
	<label class="cw-radio__label" for={inputId}>
		<input
			id={inputId}
			class="cw-radio__input"
			type="radio"
			bind:group
			{value}
			{disabled}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>

		<span class="cw-radio__control" aria-hidden="true">
			<span class="cw-radio__dot"></span>
		</span>

		{#if label || description}
			<span class="cw-radio__text">
				{#if label}
					<span class="cw-radio__title">{label}</span>
				{/if}
				{#if description}
					<span class="cw-radio__description">{description}</span>
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
		border: 1px solid var(--cw-border-default);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface) 82%, var(--cw-bg-elevated)) 0%,
				var(--cw-bg-elevated) 100%
			);
		box-shadow: var(--cw-shadow-sm);
		flex-shrink: 0;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-radio__dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-accent);
		opacity: 0;
		transform: scale(0.2);
		transition:
			transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 150ms var(--cw-ease-default);
	}

	.cw-radio__input:checked + .cw-radio__control {
		border-color: var(--cw-accent);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-accent-bg) 56%, var(--cw-bg-surface)) 0%,
				color-mix(in srgb, var(--cw-accent-bg) 72%, var(--cw-bg-elevated)) 100%
			);
	}

	.cw-radio__input:checked + .cw-radio__control .cw-radio__dot {
		opacity: 1;
		transform: scale(1);
	}

	.cw-radio__input:focus-visible + .cw-radio__control {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width)
				color-mix(in srgb, var(--cw-focus-ring-color) 28%, transparent),
			var(--cw-shadow-sm);
	}

	.cw-radio__input:disabled + .cw-radio__control {
		opacity: 0.64;
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
		line-height: 1.25;
		color: var(--cw-text-primary);
	}

	.cw-radio__description {
		font-size: var(--cw-text-xs);
		line-height: 1.35;
		color: var(--cw-text-muted);
	}

	.cw-radio--selected .cw-radio__title {
		color: color-mix(in srgb, var(--cw-text-primary) 78%, var(--cw-accent));
	}

	.cw-radio--disabled .cw-radio__label {
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-radio__control,
		.cw-radio__dot {
			transition-duration: 140ms !important;
		}
	}
</style>
