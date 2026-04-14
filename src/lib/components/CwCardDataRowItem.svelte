<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { CwAlarmApi, CwCardDataRowItemData } from '../types/index.js';
	import CwDuration from './CwDuration.svelte';
	import CwDataIcon from './CwDataIcon.svelte';
	import { createCwAlarmScheduler } from './cwAlarmContext.svelte.js';
	import {
		isCwWithinTimeout,
		resolveCwDateTimeMs,
		resolveCwExpireAfterMinutes,
		resolveCwExpireAfterMs,
		resolveCwLastSeenAt
	} from '../utils/cwTimeout.js';

	type IconContent = CwCardDataRowItemData['icon'];

	interface Props extends CwCardDataRowItemData {
		/** Optional extra CSS class for the row root element. */
		class?: string;
		/** Shared alarm scheduler. When omitted, the row creates its own scheduler. */
		alarmScheduler?: CwAlarmApi;
		/** Preferred callback fired when the row crosses its freshness timeout. */
		onExpire?: () => void;
		/** Preferred callback fired when the row returns to a non-expired state. */
		onTimeoutReset?: () => void;
		/** Bindable timeout state for the row. `true` = fresh, `false` = expired, `null` = no timer configured. */
		withinTimeout?: boolean | null;
		/** Optional callback fired whenever the resolved timeout state changes. */
		onWithinTimeoutChange?: (withinTimeout: boolean | null) => void;
		/** Legacy alias for `onExpire`. */
		alarmCallback?: () => void;
		/** Legacy alias for `onTimeoutReset`. */
		alarmResetCallback?: () => void;
	}

	const internalAlarmScheduler = createCwAlarmScheduler();

	let {
		id,
		label,
		value = null,
		unit,
		icon,
		status,
		lastSeenAt,
		expireAfterMinutes,
		lastUpdated,
		expectedUpdateAfter,
		class: className = '',
		alarmScheduler,
		onExpire,
		onTimeoutReset,
		withinTimeout = $bindable<boolean | null>(null),
		onWithinTimeoutChange,
		alarmCallback,
		alarmResetCallback
	}: Props = $props();

	onDestroy(() => {
		internalAlarmScheduler.clear();
	});

	const builtInIconClass = $derived(
		icon === 'drop' || icon === 'thermo' || icon === 'timer'
			? `cw-card-data-row-item__icon--${icon}`
			: ''
	);

	const resolvedLastSeenAt = $derived(resolveCwLastSeenAt(lastSeenAt, lastUpdated));
	const resolvedExpireAfterMinutes = $derived(
		resolveCwExpireAfterMinutes(expireAfterMinutes, expectedUpdateAfter)
	);
	const resolvedLastSeenAtMs = $derived(resolveCwDateTimeMs(resolvedLastSeenAt));
	const resolvedExpireAfterMs = $derived(resolveCwExpireAfterMs(resolvedExpireAfterMinutes));
	const resolvedAlarmScheduler = $derived(alarmScheduler ?? internalAlarmScheduler);
	const freshnessState = $derived(isCwWithinTimeout(resolvedLastSeenAt, resolvedExpireAfterMinutes));
	const mutedValue = $derived(!unit && resolvedLastSeenAt == null);
	const withinTimeoutAttr = $derived(
		withinTimeout == null ? undefined : withinTimeout ? 'true' : 'false'
	);

	let lastReportedTimeoutState: boolean | null = null;

	function updateWithinTimeoutState(nextState: boolean | null) {
		if (withinTimeout !== nextState) {
			withinTimeout = nextState;
		}

		const previousState = lastReportedTimeoutState;
		if (previousState === nextState) {
			return;
		}

		lastReportedTimeoutState = nextState;
		onWithinTimeoutChange?.(nextState);

		if (nextState === false) {
			onExpire?.();
			alarmCallback?.();
			return;
		}

		if (previousState === false) {
			onTimeoutReset?.();
			alarmResetCallback?.();
		}
	}

	$effect(() => {
		updateWithinTimeoutState(freshnessState);
	});

	$effect(() => {
		if (resolvedLastSeenAtMs == null || resolvedExpireAfterMs == null) {
			return;
		}

		const scheduledAlarmId = resolvedAlarmScheduler.schedule({
			id: `cw-card-data-row-item:${id}:${resolvedLastSeenAtMs}:${resolvedExpireAfterMs}`,
			from: resolvedLastSeenAtMs,
			alarmAfterMs: resolvedExpireAfterMs,
			callback: () => {
				updateWithinTimeoutState(false);
			}
		});

		return () => {
			resolvedAlarmScheduler.cancel(scheduledAlarmId);
		};
	});

</script>

<li
	class="cw-card-data-row-item {className}"
	class:cw-card-data-row-item--muted={mutedValue}
	data-row-id={id ?? undefined}
	data-status={status ?? undefined}
	data-within-timeout={withinTimeoutAttr}
>
	<div class="cw-card-data-row-item__info">
		<span class="cw-card-data-row-item__icon {builtInIconClass}" aria-hidden="true">
			<CwDataIcon {icon} />
		</span>
		<span class="cw-card-data-row-item__label">{label}</span>
	</div>

	<div class="cw-card-data-row-item__value">
		{#if resolvedLastSeenAt != null}
			<span class="cw-card-data-row-item__number">
				<CwDuration from={resolvedLastSeenAt} />
			</span>
			<span class="cw-card-data-row-item__unit">ago</span>
		{:else}
			<span class="cw-card-data-row-item__number">{value ?? 'N/A'}</span>
			{#if unit}
				<span class="cw-card-data-row-item__unit">{unit}</span>
			{/if}
		{/if}
	</div>
</li>

<style>
	.cw-card-data-row-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		padding: var(--cw-space-2) 0;
	}

	:global(.cw-card-data-row-item + .cw-card-data-row-item) {
		border-top: 1px solid var(--cw-border-muted);
	}

	.cw-card-data-row-item__info {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-width: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.cw-card-data-row-item__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-text-muted) 15%, transparent);
	}

	:global(.cw-card-data-row-item__icon svg) {
		width: 1rem;
		height: 1rem;
	}

	.cw-card-data-row-item__icon--drop {
		color: var(--cw-info-300);
	}

	.cw-card-data-row-item__icon--thermo {
		color: #f36d5b;
	}

	.cw-card-data-row-item__icon--timer {
		color: var(--cw-warning-300);
	}

	.cw-card-data-row-item__label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-card-data-row-item__value {
		display: flex;
		align-items: baseline;
		justify-content: flex-end;
		gap: var(--cw-space-1);
		min-width: 0;
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
	}

	.cw-card-data-row-item__number {
		font-size: var(--cw-text-base);
		white-space: nowrap;
	}

	.cw-card-data-row-item__unit {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		white-space: nowrap;
	}

	.cw-card-data-row-item--muted .cw-card-data-row-item__value {
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
	}
	
	@media (max-width: 480px) {
		.cw-card-data-row-item {
			align-items: flex-start;
		}
	}
</style>
