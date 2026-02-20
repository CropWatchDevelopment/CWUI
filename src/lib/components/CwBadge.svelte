<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwBadgePosition, CwSize, CwTone } from '../types/index.js';

	interface Props {
		/** Anchor location of the badge around wrapped content */
		position?: CwBadgePosition;
		/** Badge color theme */
		tone?: CwTone;
		/** Badge size */
		size?: CwSize;
		/** Optional numeric/string value displayed in the badge */
		value?: string | number;
		/** Numeric cap before showing "max+" */
		max?: number;
		/** Render a dot-only badge with no text */
		dot?: boolean;
		/** Hide badge entirely */
		hidden?: boolean;
		/** Wrapped content */
		children: Snippet;
		/** Custom badge content snippet (overrides value/dot text rendering) */
		badge?: Snippet;
		class?: string;
	}

	let {
		position = 'top_right',
		tone = 'danger',
		size = 'md',
		value,
		max = 99,
		dot = false,
		hidden = false,
		children,
		badge,
		class: className = ''
	}: Props = $props();

	const badgeValue = $derived.by(() => {
		if (value == null) return '';

		if (typeof value === 'number' && Number.isFinite(value)) {
			const normalized = Math.max(0, Math.trunc(value));
			return normalized > max ? `${max}+` : String(normalized);
		}

		return String(value);
	});

	const showBadge = $derived(!hidden && (dot || !!badge || badgeValue.length > 0));
</script>

<span class="cw-badge-wrap {className}">
	{@render children()}
	{#if showBadge}
		<span
			class="cw-badge cw-badge--{tone} cw-badge--{size} cw-badge--{position}"
			class:cw-badge--dot={dot}
			aria-label={dot ? 'badge' : `badge ${badgeValue}`}
		>
			{#if badge}
				{@render badge()}
			{:else if !dot}
				{badgeValue}
			{/if}
		</span>
	{/if}
</span>

<style>
	.cw-badge-wrap {
		position: relative;
		display: inline-flex;
		width: fit-content;
	}

	.cw-badge {
		position: absolute;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 var(--cw-space-1);
		border-radius: var(--cw-radius-full);
		border: 1px solid var(--cw-bg-surface);
		font-family: var(--cw-font-family);
		font-weight: var(--cw-font-semibold);
		font-size: 0.625rem;
		line-height: 1;
		white-space: nowrap;
		pointer-events: none;
		box-shadow: var(--cw-shadow-sm);
	}

	.cw-badge--sm {
		min-width: 1rem;
		height: 1rem;
		font-size: 0.55rem;
		padding: 0 0.25rem;
	}

	.cw-badge--md {
		min-width: 1.125rem;
		height: 1.125rem;
		font-size: 0.625rem;
		padding: 0 var(--cw-space-1);
	}

	.cw-badge--lg {
		min-width: 1.25rem;
		height: 1.25rem;
		font-size: 0.7rem;
		padding: 0 0.35rem;
	}

	.cw-badge--dot.cw-badge--sm {
		width: 0.625rem;
		min-width: 0.625rem;
		height: 0.625rem;
		padding: 0;
	}

	.cw-badge--dot.cw-badge--md {
		width: 0.75rem;
		min-width: 0.75rem;
		height: 0.75rem;
		padding: 0;
	}

	.cw-badge--dot.cw-badge--lg {
		width: 0.875rem;
		min-width: 0.875rem;
		height: 0.875rem;
		padding: 0;
	}

	.cw-badge--top_right {
		top: 0;
		right: 0;
		transform: translate(50%, -50%);
	}

	.cw-badge--top_left {
		top: 0;
		left: 0;
		transform: translate(-50%, -50%);
	}

	.cw-badge--bottom_right {
		right: 0;
		bottom: 0;
		transform: translate(50%, 50%);
	}

	.cw-badge--bottom_left {
		left: 0;
		bottom: 0;
		transform: translate(-50%, 50%);
	}

	.cw-badge--primary {
		background-color: var(--cw-tone-primary-solid-bg);
		color: var(--cw-tone-primary-solid-text);
	}

	.cw-badge--secondary {
		background-color: var(--cw-tone-secondary-solid-bg);
		color: var(--cw-tone-secondary-solid-text);
	}

	.cw-badge--info {
		background-color: var(--cw-tone-info-solid-bg);
		color: var(--cw-tone-info-solid-text);
	}

	.cw-badge--warning {
		background-color: var(--cw-tone-warning-solid-bg);
		color: var(--cw-tone-warning-solid-text);
	}

	.cw-badge--danger {
		background-color: var(--cw-tone-danger-solid-bg);
		color: var(--cw-tone-danger-solid-text);
	}

	.cw-badge--success {
		background-color: var(--cw-tone-success-solid-bg);
		color: var(--cw-tone-success-solid-text);
	}
</style>
