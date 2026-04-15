<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import CwDataIcon from './CwDataIcon.svelte';
	import CwExpandPanel from './CwExpandPanel.svelte';
	import { createCwAlarmScheduler } from './cwAlarmContext.svelte.js';
	import { useCwLocationCard } from './cwLocationCardContext.svelte.js';
	import { formatCwSensorValue, getCwSensorReadingIcon } from './cwSensorCardRows.js';
	import { getCwSensorStatusLabel } from './cwSensorCardStatus.js';
	import {
		isCwWithinTimeout,
		resolveCwDateTimeMs,
		resolveCwExpireAfterMinutes,
		resolveCwExpireAfterMs,
		resolveCwLastSeenAt
	} from '../utils/cwTimeout.js';
	import type { CwDateTimeInput, CwStatusDotStatus } from '../types/index.js';

	type IconContent = string | Snippet;

	interface Props {
		/** Sensor or device label shown in the panel header. */
		label?: string;
		/** Current sensor status before freshness overrides are applied. */
		status?: CwStatusDotStatus;
		/** Bindable expanded state. */
		open?: boolean;
		/** Initial expanded state when no `open` prop has been set yet. */
		defaultExpanded?: boolean;
		/** Optional storage key used to persist the expanded state. */
		storageKey?: string;
		/** Primary reading value. */
		primaryValue?: number | null;
		/** Unit for the primary reading. */
		primaryUnit?: string;
		/** Optional icon for the primary reading. */
		primary_icon?: IconContent;
		/** Secondary reading value. */
		secondaryValue?: number | null;
		/** Unit for the secondary reading. */
		secondaryUnit?: string;
		/** Optional icon for the secondary reading. */
		secondary_icon?: IconContent;
		/** Preferred freshness timestamp. */
		lastSeenAt?: CwDateTimeInput;
		/** Alias for `lastSeenAt`. */
		lastSeen?: CwDateTimeInput;
		/** PascalCase alias for `lastSeenAt`. */
		LastSeen?: CwDateTimeInput;
		/** Preferred freshness threshold in minutes. */
		expireAfterMinutes?: number;
		/** Alias for `expireAfterMinutes`. */
		alarmTimeoutMinutes?: number;
		/** PascalCase alias for `expireAfterMinutes`. */
		AlarmTimeoutMinutes?: number;
		/** Backwards-compatible freshness timestamp alias. */
		lastUpdated?: Date | string | number;
		/** Backwards-compatible freshness threshold alias. */
		expectedUpdateAfterMinutes?: number;
		/** Bindable freshness state for this sensor. */
		withinTimeout?: boolean | null;
		/** Details heading shown above the child content. */
		detailsHeading?: string;
		/** Optional content rendered in the expanded area. */
		children?: Snippet;
		/** Called when the sensor is expanded. */
		onExpand?: (label: string) => void;
		/** Called when the sensor is collapsed. */
		onCollapse?: (label: string) => void;
		/** Called when freshness crosses into the expired state. */
		onExpire?: (label: string) => void;
		/** Alias for `onExpire`. */
		alarmCallback?: (label: string) => void;
		/** PascalCase alias for `onExpire`. */
		AlarmCallback?: (label: string) => void;
		/** Called when freshness returns from expired to non-expired. */
		onTimeoutReset?: (label: string) => void;
		/** Called whenever the freshness state changes. */
		onWithinTimeoutChange?: (withinTimeout: boolean | null) => void;
		/** Extra CSS class for the sensor panel root. */
		class?: string;
	}

	const STORAGE_PREFIX = 'cw-sensor-card-expand:';
	const locationCardContext = useCwLocationCard();
	const alarmScheduler = createCwAlarmScheduler();
	const sensorId = $props.id();

	let {
		label = 'Sensor',
		status = 'loading' as CwStatusDotStatus,
		open = $bindable<boolean | undefined>(undefined),
		defaultExpanded = false,
		storageKey,
		primaryValue = null,
		primaryUnit = '°C',
		primary_icon = '',
		secondaryValue = null,
		secondaryUnit = '%',
		secondary_icon = '',
		lastSeenAt,
		lastSeen,
		LastSeen,
		expireAfterMinutes,
		alarmTimeoutMinutes,
		AlarmTimeoutMinutes,
		lastUpdated,
		expectedUpdateAfterMinutes,
		withinTimeout = $bindable<boolean | null>(null),
		detailsHeading = 'Details',
		children,
		onExpand,
		onCollapse,
		onExpire,
		alarmCallback,
		AlarmCallback,
		onTimeoutReset,
		onWithinTimeoutChange,
		class: className = ''
	}: Props = $props();

	let hasResolvedInitialOpen = false;
	let lastReportedTimeoutState: boolean | null = null;
	let panelOpen = $state(false);

	onDestroy(() => {
		alarmScheduler.clear();
		locationCardContext.removeSensor(sensorId);
	});

	const resolvedStorageKey = $derived(storageKey ?? label);
	const isOpenControlled = $derived(open !== undefined);
	const resolvedLastSeenAt = $derived(
		resolveCwLastSeenAt(lastSeenAt, lastSeen, LastSeen, lastUpdated)
	);
	const resolvedExpireAfterMinutes = $derived(
		resolveCwExpireAfterMinutes(
			expireAfterMinutes,
			alarmTimeoutMinutes,
			AlarmTimeoutMinutes,
			expectedUpdateAfterMinutes
		)
	);
	const resolvedLastSeenAtMs = $derived(resolveCwDateTimeMs(resolvedLastSeenAt));
	const resolvedExpireAfterMs = $derived(resolveCwExpireAfterMs(resolvedExpireAfterMinutes));
	const freshnessState = $derived(isCwWithinTimeout(resolvedLastSeenAt, resolvedExpireAfterMinutes));
	const effectiveStatus = $derived(freshnessState === false ? 'offline' : status);
	const statusLabel = $derived(getCwSensorStatusLabel(effectiveStatus));
	const primaryIcon = $derived(
		getCwSensorReadingIcon('primary', {
			label,
			primaryValue: primaryValue ?? 0,
			primaryUnit,
			primary_icon,
			secondaryValue: secondaryValue ?? undefined,
			secondaryUnit,
			secondary_icon
		})
	);
	const secondaryIcon = $derived(
		getCwSensorReadingIcon('secondary', {
			label,
			primaryValue: primaryValue ?? 0,
			primaryUnit,
			primary_icon,
			secondaryValue: secondaryValue ?? undefined,
			secondaryUnit,
			secondary_icon
		})
	);
	const expandClassName = $derived(
		['cw-sensor-card', className, slotStatusClass(effectiveStatus)].filter(Boolean).join(' ')
	);

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
			onExpire?.(label);
			alarmCallback?.(label);
			AlarmCallback?.(label);
			return;
		}

		if (previousState === false) {
			onTimeoutReset?.(label);
		}
	}

	function persistOpen(nextOpen: boolean) {
		try {
			localStorage.setItem(STORAGE_PREFIX + resolvedStorageKey, JSON.stringify(nextOpen));
		} catch {
			/* storage unavailable */
		}
	}

	function handleToggle(nextOpen: boolean) {
		if (open !== nextOpen) {
			open = nextOpen;
		}

		persistOpen(nextOpen);

		if (nextOpen) {
			onExpand?.(label);
			return;
		}

		onCollapse?.(label);
	}

	function sensorStatIconClass(icon: IconContent | undefined): string {
		if (icon === 'thermo') return 'cw-sensor-card__stat-icon--temp';
		if (icon === 'drop') return 'cw-sensor-card__stat-icon--humidity';
		return '';
	}

	function formatReading(value: number | null | undefined): string {
		return value == null ? 'N/A' : formatCwSensorValue(value);
	}

	function slotStatusClass(devStatus?: string): string {
		if (devStatus === 'online') return 'cw-sensor-card__slot--online';
		if (devStatus === 'offline') return 'cw-sensor-card__slot--offline';
		if (devStatus === 'loading') return 'cw-sensor-card__slot--loading';
		if (devStatus === 'warning') return 'cw-sensor-card__slot--warning';
		return '';
	}

	$effect(() => {
		const controlledOpen = open;
		if (!isOpenControlled || controlledOpen === undefined || controlledOpen === panelOpen) {
			return;
		}

		panelOpen = controlledOpen;
	});

	$effect(() => {
		if (hasResolvedInitialOpen || isOpenControlled) {
			hasResolvedInitialOpen = true;
			return;
		}

		let nextOpen = defaultExpanded;

		try {
			const stored = localStorage.getItem(STORAGE_PREFIX + resolvedStorageKey);
			if (stored != null) {
				nextOpen = JSON.parse(stored);
			}
		} catch {
			/* SSR or storage unavailable */
		}

		if (panelOpen !== nextOpen) {
			panelOpen = nextOpen;
		}

		hasResolvedInitialOpen = true;
	});

	$effect(() => {
		updateWithinTimeoutState(freshnessState);
	});

	$effect(() => {
		if (resolvedLastSeenAtMs == null || resolvedExpireAfterMs == null) {
			return;
		}

		const scheduledAlarmId = alarmScheduler.schedule({
			id: `cw-sensor-card:${sensorId}:${resolvedLastSeenAtMs}:${resolvedExpireAfterMs}`,
			from: resolvedLastSeenAtMs,
			alarmAfterMs: resolvedExpireAfterMs,
			callback: () => {
				updateWithinTimeoutState(false);
			}
		});

		return () => {
			alarmScheduler.cancel(scheduledAlarmId);
		};
	});

	$effect(() => {
		const sensor = {
			id: sensorId,
			label,
			status: effectiveStatus
		};

		untrack(() => {
			locationCardContext.setSensor(sensor);
		});
	});
</script>

<CwExpandPanel
	bind:open={panelOpen}
	class={expandClassName}
	onToggle={handleToggle}
>
	{#snippet header()}
		<div class="cw-sensor-card__content">
			<div class="cw-sensor-card__device">
				<div class="cw-sensor-card__header-copy">
					<span class="cw-sensor-card__label">{label}</span>
				</div>

				<div class="cw-sensor-card__stats">
					<div class="cw-sensor-card__stat">
						<span
							class={[
								'cw-sensor-card__stat-icon',
								sensorStatIconClass(primaryIcon)
							]}
							aria-hidden="true"
						>
							<CwDataIcon icon={primaryIcon} />
						</span>
						<span class="cw-sensor-card__stat-reading">
							<span class="cw-sensor-card__stat-value">{formatReading(primaryValue)}</span>
							{#if primaryValue != null}
								<span class="cw-sensor-card__stat-unit">{primaryUnit}</span>
							{/if}
						</span>
					</div>

					{#if secondaryValue != null}
						<div class="cw-sensor-card__stat">
							<span
								class={[
									'cw-sensor-card__stat-icon',
									sensorStatIconClass(secondaryIcon)
								]}
								aria-hidden="true"
							>
								<CwDataIcon icon={secondaryIcon} />
							</span>
							<span class="cw-sensor-card__stat-reading">
								<span class="cw-sensor-card__stat-value">{formatReading(secondaryValue)}</span>
								<span class="cw-sensor-card__stat-unit">{secondaryUnit}</span>
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#if children}
		<div class="cw-sensor-card__details-inner">
			<h4 class="cw-sensor-card__details-heading">{detailsHeading}</h4>
			{@render children()}
		</div>
	{:else}
		<p class="cw-sensor-card__details-empty">No detailed readings available yet.</p>
	{/if}
</CwExpandPanel>

<style>
	:global(.cw-sensor-card.cw-expand) {
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-xl);
		background: var(--cw-bg-elevated);
		box-shadow: var(--cw-shadow-sm);
		overflow: hidden;
	}

	:global(.cw-sensor-card.cw-expand.cw-sensor-card__slot--online) {
		--_sensor-color: var(--cw-success-500);
	}

	:global(.cw-sensor-card.cw-expand.cw-sensor-card__slot--offline) {
		--_sensor-color: var(--cw-danger-500);
	}

	:global(.cw-sensor-card.cw-expand.cw-sensor-card__slot--loading) {
		--_sensor-color: var(--cw-status-loading);
	}

	:global(.cw-sensor-card.cw-expand.cw-sensor-card__slot--warning) {
		--_sensor-color: var(--cw-warning-400);
	}

	:global(.cw-sensor-card .cw-expand__header) {
		padding: 0;
		gap: var(--cw-space-2);
		background: transparent;
		border-left: 3px solid var(--_sensor-color, var(--cw-border-default));
	}

	:global(.cw-sensor-card .cw-expand__header-content) {
		min-width: 0;
	}

	:global(.cw-sensor-card .cw-expand__chevron) {
		margin-right: var(--cw-space-4);
		color: var(--cw-text-secondary);
	}

	:global(.cw-sensor-card .cw-expand__body) {
		padding: 0;
	}

	:global(.cw-sensor-card.cw-expand--open .cw-expand__body) {
		padding: 0;
	}

	.cw-sensor-card__content {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		width: 100%;
	}

	.cw-sensor-card__device {
		display: grid;
		gap: 0.3rem;
		min-width: 0;
	}

	.cw-sensor-card__header-copy {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		min-width: 0;
	}

	.cw-sensor-card__label {
		min-width: 0;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-sensor-card__status {
		flex-shrink: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.cw-sensor-card__stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-3);
	}

	.cw-sensor-card__stat {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-1);
		min-width: 0;
	}

	.cw-sensor-card__stat-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-text-muted) 15%, transparent);
		color: var(--cw-text-muted);
		flex-shrink: 0;
	}

	.cw-sensor-card__stat-icon--temp {
		color: #f36d5b;
	}

	.cw-sensor-card__stat-icon--humidity {
		color: var(--cw-info-300);
	}

	:global(.cw-sensor-card__stat-icon svg) {
		width: 0.85rem;
		height: 0.85rem;
	}

	.cw-sensor-card__stat-reading {
		display: inline-flex;
		align-items: baseline;
		gap: 0.2rem;
		min-width: 0;
	}

	.cw-sensor-card__stat-value {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		line-height: 1;
		color: var(--cw-text-primary);
		white-space: nowrap;
	}

	.cw-sensor-card__stat-unit {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		white-space: nowrap;
	}

	.cw-sensor-card__details-inner {
		display: grid;
		gap: var(--cw-space-3);
		padding: 0 var(--cw-space-4) var(--cw-space-4);
	}

	.cw-sensor-card__details-heading {
		margin: 0;
		padding-top: var(--cw-space-1);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-accent);
	}

	.cw-sensor-card__details-empty {
		margin: 0;
		padding: 0 var(--cw-space-4) var(--cw-space-4);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		line-height: 1.6;
	}
</style>
