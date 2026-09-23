<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		title?: string;
		subtitle?: string;
		titleAlign?: "left" | "center" | "right";
		padded?: boolean;
		elevated?: boolean;
		/** Heading level for `title` (default 3). */
		headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Shows a skeleton in place of the body and marks the card busy. */
		loading?: boolean;
		class?: string;
		children?: Snippet;
		header?: Snippet;
		subtitleSlot?: Snippet;
		actions?: Snippet;
	}

	let {
		title,
		subtitle,
		titleAlign = "left",
		padded = true,
		elevated = false,
		headingLevel = 3,
		loading = false,
		class: className = "",
		children,
		header,
		subtitleSlot,
		actions,
	}: Props = $props();
</script>

<div
	class="cw-card {className}"
	class:cw-card--padded={padded}
	class:cw-card--elevated={elevated}
	aria-busy={loading || undefined}
>
	{#if header || title || actions}
		<div class="cw-card__header">
			{#if header}
				{@render header()}
			{:else}
				<div class="cw-card__titles cw-card__titles--{titleAlign}">
					{#if title}
						<svelte:element this={`h${headingLevel}`} class="cw-card__title">{title}</svelte:element>
					{/if}
					{#if subtitle}
						<p class="cw-card__subtitle">
							{subtitle}
							{#if subtitleSlot}
								{@render subtitleSlot()}
							{/if}
						</p>
					{/if}
				</div>
			{/if}
			{#if actions}
				<div class="cw-card__actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}
	{#if loading}
		<div class="cw-card__body" aria-hidden="true">
			<div class="cw-card__skeleton">
				<span class="cw-card__skeleton-line cw-card__skeleton-line--wide"></span>
				<span class="cw-card__skeleton-line"></span>
				<span class="cw-card__skeleton-line cw-card__skeleton-line--short"></span>
			</div>
		</div>
	{:else if children}
		<div class="cw-card__body">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.cw-card {
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
		overflow: hidden;
	}

	.cw-card--elevated {
		box-shadow: var(--cw-shadow-md);
		border-color: var(--cw-border-muted);
	}

	.cw-card__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-4);
		padding: var(--cw-space-4) var(--cw-space-4) 0;
	}

	.cw-card--padded .cw-card__header {
		padding: var(--cw-space-4) var(--cw-space-6) 0;
	}

	.cw-card__titles {
		flex: 1;
		min-width: 0;
	}

	.cw-card__titles--left {
		text-align: left;
	}

	.cw-card__titles--center {
		text-align: center;
	}

	.cw-card__titles--right {
		text-align: right;
	}

	.cw-card__title {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		line-height: var(--cw-leading-tight);
		margin: 0;
		overflow-wrap: anywhere;
	}

	.cw-card__subtitle {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		margin-top: var(--cw-space-1);
	}

	.cw-card__actions {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		flex-shrink: 0;
	}

	.cw-card__body {
		padding: var(--cw-space-4);
	}

	.cw-card--padded .cw-card__body {
		padding: var(--cw-space-4) var(--cw-space-6) var(--cw-space-6);
	}

	.cw-card__skeleton {
		display: grid;
		gap: var(--cw-space-3);
	}

	.cw-card__skeleton-line {
		display: block;
		height: 0.875rem;
		width: 70%;
		border-radius: var(--cw-radius-sm);
		background: linear-gradient(
			90deg,
			var(--cw-bg-muted) 0%,
			var(--cw-bg-subtle) 50%,
			var(--cw-bg-muted) 100%
		);
		background-size: 200% 100%;
		animation: cw-card-shimmer 1.4s ease-in-out infinite;
	}

	.cw-card__skeleton-line--wide {
		width: 90%;
	}

	.cw-card__skeleton-line--short {
		width: 40%;
	}

	@keyframes cw-card-shimmer {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: -100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-card__skeleton-line {
			animation: none;
		}
	}
</style>
