<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'onchange' | 'oninput'> {
		checked?: boolean;
		id?: string;
		name?: HTMLInputAttributes['name'];
		label?: string;
		description?: string;
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
		disabled = false,
		onchange,
		oninput,
		class: className = '',
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = $derived(id ?? `${uid}-input`);

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
	class="cw-checkbox {className}"
	class:cw-checkbox--disabled={disabled}
	class:cw-checkbox--checked={checked}
>
	<label class="cw-checkbox__label" for={inputId}>
		<input
			id={inputId}
			class="cw-checkbox__input"
			type="checkbox"
			bind:checked
			{name}
			{disabled}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>

		<span class="cw-checkbox__control" aria-hidden="true">
			<svg class="cw-checkbox__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M3.5 8.5l3 3 6-6"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>

		{#if label || description}
			<span class="cw-checkbox__text">
				{#if label}
					<span class="cw-checkbox__title">{label}</span>
				{/if}
				{#if description}
					<span class="cw-checkbox__description">{description}</span>
				{/if}
			</span>
		{/if}
	</label>
</div>

<style>
	.cw-checkbox {
		display: inline-flex;
		max-width: 100%;
		font-family: var(--cw-font-family);
	}

	.cw-checkbox__label {
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
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.125rem;
		border-radius: calc(var(--cw-radius-md) - 1px);
		border: 1px solid var(--cw-border-default);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface) 82%, var(--cw-bg-elevated)) 0%,
				var(--cw-bg-elevated) 100%
			);
		box-shadow: var(--cw-shadow-sm);
		color: var(--cw-text-inverse);
		flex-shrink: 0;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-checkbox__check {
		width: 0.95rem;
		height: 0.95rem;
		opacity: 0;
		transform: scale(0.7);
		transition:
			transform 180ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 150ms var(--cw-ease-default);
	}

	.cw-checkbox__input:checked + .cw-checkbox__control {
		border-color: var(--cw-accent);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-accent) 88%, white 12%) 0%,
				var(--cw-accent) 100%
			);
	}

	.cw-checkbox__input:checked + .cw-checkbox__control .cw-checkbox__check {
		opacity: 1;
		transform: scale(1);
	}

	.cw-checkbox__input:focus-visible + .cw-checkbox__control {
		box-shadow:
			0 0 0 var(--cw-focus-ring-width)
				color-mix(in srgb, var(--cw-focus-ring-color) 28%, transparent),
			var(--cw-shadow-sm);
	}

	.cw-checkbox__input:disabled + .cw-checkbox__control {
		opacity: 0.64;
	}

	.cw-checkbox__text {
		display: inline-flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.cw-checkbox__title {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		line-height: 1.25;
		color: var(--cw-text-primary);
	}

	.cw-checkbox__description {
		font-size: var(--cw-text-xs);
		line-height: 1.35;
		color: var(--cw-text-muted);
	}

	.cw-checkbox--checked .cw-checkbox__title {
		color: color-mix(in srgb, var(--cw-text-primary) 78%, var(--cw-accent));
	}

	.cw-checkbox--disabled .cw-checkbox__label {
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-checkbox__control,
		.cw-checkbox__check {
			transition-duration: 140ms !important;
		}
	}
</style>
