<script lang="ts">
	import type { CwTone, CwSize, CwChipVariant } from '../types/index.js';

	interface Props {
		tone?: CwTone;
		size?: CwSize;
		variant?: CwChipVariant;
		dismissible?: boolean;
		disabled?: boolean;
		ondismiss?: () => void;
		label: string;
		class?: string;
	}

	let {
		tone = 'primary',
		size = 'md',
		variant = 'soft',
		dismissible = false,
		disabled = false,
		ondismiss,
		label,
		class: className = ''
	}: Props = $props();

	function handleDismiss() {
		if (!disabled && ondismiss) ondismiss();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleDismiss();
		}
	}
</script>

<span
	class="cw-chip cw-chip--{tone} cw-chip--{variant} cw-chip--{size} {className}"
	class:cw-chip--disabled={disabled}
	class:cw-chip--interactive={dismissible}
	role={dismissible ? 'group' : undefined}
	aria-disabled={disabled || undefined}
>
	<span class="cw-chip__label">{label}</span>
	{#if dismissible}
		<button
			type="button"
			class="cw-chip__dismiss"
			onclick={handleDismiss}
			onkeydown={handleKeydown}
			{disabled}
			aria-label="Dismiss {label}"
		>
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M4.5 4.5l7 7M11.5 4.5l-7 7"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	{/if}
</span>

<style>
	.cw-chip {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		border-radius: var(--cw-radius-full);
		font-family: var(--cw-font-family);
		font-weight: var(--cw-font-medium);
		line-height: 1;
		white-space: nowrap;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	/* ── Sizes ───────────────────────────── */
	.cw-chip--sm {
		padding: 0.125rem var(--cw-space-2);
		font-size: var(--cw-text-xs);
	}
	.cw-chip--md {
		padding: var(--cw-space-1) var(--cw-space-3);
		font-size: var(--cw-text-xs);
	}
	.cw-chip--lg {
		padding: var(--cw-space-2) var(--cw-space-4);
		font-size: var(--cw-text-sm);
	}

	/* ── Variant × Tone (soft) ───────────── */
	.cw-chip--soft.cw-chip--primary {
		background-color: var(--cw-tone-primary-bg-subtle);
		color: var(--cw-tone-primary-text);
	}
	.cw-chip--soft.cw-chip--secondary {
		background-color: var(--cw-tone-secondary-bg-subtle);
		color: var(--cw-tone-secondary-text);
	}
	.cw-chip--soft.cw-chip--info {
		background-color: var(--cw-tone-info-bg-subtle);
		color: var(--cw-tone-info-text);
	}
	.cw-chip--soft.cw-chip--warning {
		background-color: var(--cw-tone-warning-bg-subtle);
		color: var(--cw-tone-warning-text);
	}
	.cw-chip--soft.cw-chip--danger {
		background-color: var(--cw-tone-danger-bg-subtle);
		color: var(--cw-tone-danger-text);
	}
	.cw-chip--soft.cw-chip--success {
		background-color: var(--cw-tone-success-bg-subtle);
		color: var(--cw-tone-success-text);
	}

	/* ── Variant × Tone (solid) ──────────── */
	.cw-chip--solid.cw-chip--primary {
		background-color: var(--cw-tone-primary-solid-bg);
		color: var(--cw-tone-primary-solid-text);
	}
	.cw-chip--solid.cw-chip--secondary {
		background-color: var(--cw-tone-secondary-solid-bg);
		color: var(--cw-tone-secondary-solid-text);
	}
	.cw-chip--solid.cw-chip--info {
		background-color: var(--cw-tone-info-solid-bg);
		color: var(--cw-tone-info-solid-text);
	}
	.cw-chip--solid.cw-chip--warning {
		background-color: var(--cw-tone-warning-solid-bg);
		color: var(--cw-tone-warning-solid-text);
	}
	.cw-chip--solid.cw-chip--danger {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
	}
	.cw-chip--solid.cw-chip--success {
		background-color: var(--cw-tone-success-solid-bg);
		color: var(--cw-tone-success-solid-text);
	}

	/* ── Variant × Tone (outline) ────────── */
	.cw-chip--outline.cw-chip--primary {
		background-color: transparent;
		color: var(--cw-tone-primary-text);
		border: 1px solid var(--cw-tone-primary-border);
	}
	.cw-chip--outline.cw-chip--secondary {
		background-color: transparent;
		color: var(--cw-tone-secondary-text);
		border: 1px solid var(--cw-tone-secondary-border);
	}
	.cw-chip--outline.cw-chip--info {
		background-color: transparent;
		color: var(--cw-tone-info-text);
		border: 1px solid var(--cw-tone-info-border);
	}
	.cw-chip--outline.cw-chip--warning {
		background-color: transparent;
		color: var(--cw-tone-warning-text);
		border: 1px solid var(--cw-tone-warning-border);
	}
	.cw-chip--outline.cw-chip--danger {
		background-color: transparent;
		color: var(--cw-tone-danger-text);
		border: 1px solid var(--cw-tone-danger-border);
	}
	.cw-chip--outline.cw-chip--success {
		background-color: transparent;
		color: var(--cw-tone-success-text);
		border: 1px solid var(--cw-tone-success-border);
	}

	/* ── Disabled ─────────────────────────── */
	.cw-chip--disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	/* ── Dismiss button ──────────────────── */
	.cw-chip__dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: currentColor;
		cursor: pointer;
		padding: 0;
		width: 1em;
		height: 1em;
		border-radius: var(--cw-radius-full);
		opacity: 0.7;
		transition: opacity var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-chip__dismiss:hover {
		opacity: 1;
	}

	.cw-chip__dismiss svg {
		width: 100%;
		height: 100%;
	}
</style>
