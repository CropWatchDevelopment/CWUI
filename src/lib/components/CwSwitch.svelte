<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'onchange' | 'oninput'> {
		checked?: boolean;
		id?: string;
		label?: string;
		description?: string;
		onchange?: (checked: boolean, event: Event) => void;
		oninput?: (checked: boolean, event: Event) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
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

<div class="cw-switch {className}" class:cw-switch--disabled={disabled}>
	<label class="cw-switch__label" for={inputId}>
		<input
			id={inputId}
			class="cw-switch__input"
			type="checkbox"
			bind:checked
			{disabled}
			oninput={handleInput}
			onchange={handleChange}
			{...rest}
		/>
		<span class="cw-switch__control" aria-hidden="true">
			<span class="cw-switch__thumb"></span>
		</span>

		{#if label || description}
			<span class="cw-switch__text">
				{#if label}
					<span class="cw-switch__title">{label}</span>
				{/if}
				{#if description}
					<span class="cw-switch__description">{description}</span>
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
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-3);
		cursor: pointer;
		user-select: none;
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
		border: 1px solid var(--cw-border-default);
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
		flex-shrink: 0;
	}

	.cw-switch__thumb {
		width: 1.125rem;
		height: 1.125rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-bg-elevated);
		box-shadow: var(--cw-shadow-sm);
		transform: translateX(0);
		transition:
			transform var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-switch__input:checked + .cw-switch__control {
		background-color: color-mix(in srgb, var(--cw-accent) 75%, var(--cw-bg-elevated));
		border-color: var(--cw-accent);
	}

	.cw-switch__input:checked + .cw-switch__control .cw-switch__thumb {
		transform: translateX(1rem);
		background-color: #fff;
	}

	.cw-switch__input:focus-visible + .cw-switch__control {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--cw-focus-ring-color) 35%, transparent);
	}

	.cw-switch__input:disabled + .cw-switch__control {
		opacity: 0.6;
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
		line-height: 1.2;
	}

	.cw-switch__description {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		line-height: 1.3;
	}

	.cw-switch--disabled .cw-switch__label {
		cursor: not-allowed;
	}
</style>
