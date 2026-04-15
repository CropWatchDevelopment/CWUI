<script lang="ts">
	import type { Snippet } from 'svelte';
	import CwChip from './CwChip.svelte';
	import CwStatusDot from './CwStatusDot.svelte';
	import { createCwLocationCardContext } from './cwLocationCardContext.svelte.js';
	import {
		aggregateCwSensorStatuses,
		getCwSensorStatusLabel,
		getCwSensorTone
	} from './cwSensorCardStatus.js';
	import type { CwStatusDotStatus } from '../types/index.js';

	interface Props {
		/** Location or site name displayed in the header. */
		title?: string;
		/** Fallback status used when no nested sensor cards are registered. */
		status?: CwStatusDotStatus;
		/** Optional body content, typically one or more nested `CwSensorCard`s. */
		children?: Snippet;
		/** Called when the header action is clicked. */
		onNavigate?: (target: string) => void;
		/** Empty-state label shown when no child snippet is provided. */
		emptyMessage?: string;
		/** Additional CSS class for the card root. */
		class?: string;
	}

	let {
		title = 'Location',
		status = 'loading' as CwStatusDotStatus,
		children,
		onNavigate,
		emptyMessage = 'No sensors assigned',
		class: className = ''
	}: Props = $props();

	const locationCardContext = createCwLocationCardContext();
	const registeredSensors = $derived.by(() => locationCardContext.readSensors());
	const aggregateStatus = $derived.by(() =>
		registeredSensors.length > 0
			? aggregateCwSensorStatuses(
					registeredSensors.map((sensor) => sensor.status),
					status
				)
			: status
	);
	const statusTone = $derived(getCwSensorTone(aggregateStatus));
	const statusLabel = $derived(getCwSensorStatusLabel(aggregateStatus));
</script>

<div class={['cw-location-card', className, `cw-location-card--${aggregateStatus}`]}>
	<header class="cw-location-card__header">
		<div class="cw-location-card__status-indicator">
			{#if registeredSensors.length > 0}
				<CwStatusDot status={aggregateStatus} size="lg" />
			{/if}
		</div>

		<div class="cw-location-card__title-group">
			<div class="cw-location-card__title">{title}</div>
			<CwChip label={statusLabel} tone={statusTone} variant="soft" size="sm" />
		</div>

		<button
			class="cw-location-card__nav-action"
			type="button"
			aria-label="View location"
			onclick={() => onNavigate?.('location')}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path fill="currentColor" d="M10 6v12l6-6-6-6Z" />
			</svg>
		</button>
	</header>

	<section class="cw-location-card__body">
		{#if children}
			{@render children()}
		{:else}
			<div class="cw-location-card__empty">
				<svg class="cw-location-card__empty-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M13 13h-2V7h2m0 10h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
					/>
				</svg>
				<span class="cw-location-card__empty-text">{emptyMessage}</span>
			</div>
		{/if}
	</section>
</div>

<style>
	.cw-location-card {
		position: relative;
		width: min(390px, 100%);
		border-radius: var(--cw-radius-2xl);
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		box-shadow: var(--cw-shadow-lg);
		color: var(--cw-text-primary);
		overflow: hidden;
		font-family: var(--cw-font-family);
	}

	.cw-location-card__header {
		display: flex;
		align-items: center;
		padding: var(--cw-space-2) var(--cw-space-4);
		gap: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-location-card__status-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--cw-radius-full);
		border: 1px solid var(--cw-border-default);
		background: var(--cw-bg-surface);
		flex-shrink: 0;
	}

	.cw-location-card__title-group {
		display: grid;
		gap: 0.15rem;
		flex: 1;
		min-width: 0;
	}

	.cw-location-card__title {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		line-height: 1.2;
		color: var(--cw-text-primary);
	}

	.cw-location-card__nav-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--cw-radius-full);
		border: 1px solid var(--cw-border-default);
		background: transparent;
		color: var(--cw-text-secondary);
		flex-shrink: 0;
		cursor: pointer;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-location-card__nav-action:hover {
		border-color: var(--cw-accent);
		color: var(--cw-accent);
		background: color-mix(in srgb, var(--cw-accent) 12%, transparent);
	}

	.cw-location-card__nav-action:focus-visible {
		outline: 2px solid var(--cw-accent);
		outline-offset: 2px;
	}

	.cw-location-card__nav-action svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-location-card__body {
		display: grid;
		gap: var(--cw-space-2);
		padding: var(--cw-space-3);
	}

	.cw-location-card__empty {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-5) var(--cw-space-3);
		border: 1px dashed var(--cw-border-muted);
		border-radius: var(--cw-radius-xl);
		color: var(--cw-text-muted);
		background: var(--cw-bg-elevated);
	}

	.cw-location-card__empty-icon {
		width: 1.2rem;
		height: 1.2rem;
		flex-shrink: 0;
	}

	.cw-location-card__empty-text {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
	}
</style>
