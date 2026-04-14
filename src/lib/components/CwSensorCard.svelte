<script lang="ts">
	import { onDestroy } from 'svelte';
	import CwStatusDot from './CwStatusDot.svelte';
	import CwChip from './CwChip.svelte';
	import CwButton from './CwButton.svelte';
	import CwCardDataRowItem from './CwCardDataRowItem.svelte';
	import CwDataIcon from './CwDataIcon.svelte';
	import { createCwAlarmScheduler } from './cwAlarmContext.svelte.js';
	import { buildCwSensorCardDetailRows, getCwSensorReadingIcon } from './cwSensorCardRows.js';
	import {
		isCwWithinTimeout,
		resolveCwExpireAfterMinutes,
		resolveCwLastSeenAt
	} from '../utils/cwTimeout.js';
	import type {
		CwDateTimeInput,
		CwStatusDotStatus,
		CwTone,
		CwSensorCardDetailRow,
		CwSensorCardDevice
	} from '../types/index.js';

	type IconContent = CwSensorCardDevice['primary_icon'];

	interface Props {
		/** Location or site name displayed in the header */
		title?: string;
		/** Current device connection status */
		status?: CwStatusDotStatus;
		/** Initial expanded state for devices when no localStorage entry exists (default: false) */
		defaultExpanded?: boolean;
		/** Storage key for persisting expand states. Defaults to title. */
		storageKey?: string;
		/** Array of devices to display. Overrides single-device props when provided. */
		devices?: CwSensorCardDevice[];
		/** Device name or label displayed in the body (single-device shorthand) */
		deviceLabel?: string;
		/** Primary reading value (single-device shorthand) */
		primaryValue?: number;
		/** Unit for primary value (single-device shorthand) */
		primaryUnit?: string;
		/** Primary Icon for primary value (single-device shorthand) */
		primary_icon?: IconContent;
		/** Secondary reading value (single-device shorthand) */
		secondaryValue?: number;
		/** Unit for secondary value (single-device shorthand) */
		secondaryUnit?: string;
		/** Secondary Icon for secondary value (single-device shorthand) */
		secondary_icon?: IconContent;
		/** Timestamp of the last data update (single-device shorthand) */
		lastUpdated?: Date | string | number;
		/** Preferred freshness timestamp (single-device shorthand). Alias for lastUpdated. */
		lastSeenAt?: CwDateTimeInput;
		/** Expected update interval in minutes (single-device shorthand) */
		expectedUpdateAfterMinutes?: number;
		/** Preferred freshness timeout threshold in minutes (single-device shorthand). Alias for expectedUpdateAfterMinutes. */
		expireAfterMinutes?: number;
		/** Custom detail rows — used only when devices is not provided (single-device shorthand) */
		detailRows?: CwSensorCardDetailRow[];
		/** Called when user clicks a navigation action */
		onNavigate?: (target: string) => void;
		/** Called when a device slot is expanded. Alias for onDeviceExpand. */
		onExpand?: (deviceLabel: string) => void;
		/** Called when a device slot is expanded */
		onDeviceExpand?: (deviceLabel: string) => void;
		/** Called when a device slot is collapsed. Alias for onDeviceCollapse. */
		onCollapse?: (deviceLabel: string) => void;
		/** Called when a device slot is collapsed */
		onDeviceCollapse?: (deviceLabel: string) => void;
		/** Called when a device freshness timer expires. Alias for onTimerExpired. */
		onExpire?: (deviceLabel: string) => void;
		/** Called when a device freshness row expires. */
		onTimerExpired?: (deviceLabel: string) => void;
		/** Bindable per-device freshness map. `true` = fresh, `false` = expired, omitted = no timer configured. */
		deviceWithinTimeoutMap?: Record<string, boolean | null>;
		/** Additional CSS class */
		class?: string;
	}

	let {
		title = 'Location',
		status = 'loading' as CwStatusDotStatus,
		defaultExpanded = false,
		storageKey,
		devices,
		deviceLabel,
		primaryValue = 0,
		primaryUnit = '°C',
		primary_icon = '',
		secondaryValue,
		secondaryUnit = '%',
		secondary_icon = '',
		lastUpdated,
		lastSeenAt,
		expectedUpdateAfterMinutes,
		expireAfterMinutes,
		detailRows,
		onNavigate,
		onExpand,
		onDeviceExpand,
		onCollapse,
		onDeviceCollapse,
		onExpire,
		onTimerExpired,
		deviceWithinTimeoutMap = $bindable<Record<string, boolean | null>>({}),
		class: className = ''
	}: Props = $props();

	const STORAGE_PREFIX = 'cw-sensor-card-expand:';
	const resolvedStorageKey = $derived(storageKey ?? title);
	const rowAlarmScheduler = createCwAlarmScheduler();

	let expandedMap = $state<Record<string, boolean>>({});

	onDestroy(() => {
		rowAlarmScheduler.clear();
	});

	$effect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_PREFIX + resolvedStorageKey);
			if (stored) {
				expandedMap = JSON.parse(stored);
			}
		} catch { /* SSR or storage unavailable */ }
	});

	function notifyDeviceHandler(
		handlers: Array<((deviceLabel: string) => void) | undefined>,
		label: string
	) {
		const calledHandlers = new Set<((deviceLabel: string) => void) | undefined>();

		for (const handler of handlers) {
			if (!handler || calledHandlers.has(handler)) {
				continue;
			}

			calledHandlers.add(handler);
			handler(label);
		}
	}

	function resolveDeviceLastSeenAt(device: CwSensorCardDevice) {
		return resolveCwLastSeenAt(device.lastSeenAt, device.lastUpdated);
	}

	function resolveDeviceExpireAfterMinutes(device: CwSensorCardDevice) {
		return resolveCwExpireAfterMinutes(device.expireAfterMinutes, device.expectedUpdateAfterMinutes);
	}

	function updateDeviceWithinTimeout(label: string, nextState: boolean | null) {
		const currentState = deviceWithinTimeoutMap[label] ?? null;
		if (currentState === nextState) {
			return;
		}

		if (nextState == null) {
			if (!(label in deviceWithinTimeoutMap)) {
				return;
			}

			const nextMap = { ...deviceWithinTimeoutMap };
			delete nextMap[label];
			deviceWithinTimeoutMap = nextMap;
			return;
		}

		deviceWithinTimeoutMap = {
			...deviceWithinTimeoutMap,
			[label]: nextState
		};
	}

	function handleDeviceExpire(device: CwSensorCardDevice) {
		updateDeviceWithinTimeout(device.label, false);
		notifyDeviceHandler([onExpire, onTimerExpired], device.label);
	}

	/**
	 * Returns the effective status for a device, accounting for overdue state.
	 * If the device freshness state is expired, status becomes 'offline'.
	 */
	function effectiveDeviceStatus(dev: CwSensorCardDevice): CwStatusDotStatus {
		if (deviceWithinTimeoutMap[dev.label] === false) return 'offline';

		const freshnessState = isCwWithinTimeout(
			resolveDeviceLastSeenAt(dev),
			resolveDeviceExpireAfterMinutes(dev)
		);
		if (freshnessState === false) {
			return 'offline';
		}

		return dev.status ?? status;
	}

	function isExpanded(label: string): boolean {
		return expandedMap[label] ?? defaultExpanded;
	}

	function toggleDevice(label: string) {
		const nextExpanded = !isExpanded(label);
		expandedMap[label] = nextExpanded;
		if (nextExpanded) {
			notifyDeviceHandler([onExpand, onDeviceExpand], label);
		} else {
			notifyDeviceHandler([onCollapse, onDeviceCollapse], label);
		}
		try {
			localStorage.setItem(STORAGE_PREFIX + resolvedStorageKey, JSON.stringify(expandedMap));
		} catch { /* storage unavailable */ }
	}

	function sensorStatIconClass(icon: IconContent | undefined): string {
		if (icon === 'thermo') return 'cw-sensor-card__stat-icon--temp';
		if (icon === 'drop') return 'cw-sensor-card__stat-icon--humidity';
		return '';
	}

	/** Resolve the device list: explicit array, single-device props, or empty */
	const resolvedDevices = $derived<CwSensorCardDevice[]>(
		devices
			? devices
			: deviceLabel != null
				? [
						{
							label: deviceLabel,
							primaryValue,
							primaryUnit,
							primary_icon,
							secondaryValue,
							secondaryUnit,
							secondary_icon,
							detailRows,
							lastSeenAt,
							expireAfterMinutes,
							lastUpdated,
							expectedUpdateAfterMinutes,
							status
						}
					]
				: []
	);

	$effect(() => {
		const activeLabels = new Set(resolvedDevices.map((device) => device.label));
		const staleLabels = Object.keys(deviceWithinTimeoutMap).filter((label) => !activeLabels.has(label));
		if (staleLabels.length === 0) {
			return;
		}

		const nextMap = { ...deviceWithinTimeoutMap };
		for (const label of staleLabels) {
			delete nextMap[label];
		}
		deviceWithinTimeoutMap = nextMap;
	});

	/** Aggregate status derived from individual device statuses, falls back to card-level prop */
	const aggregateStatus = $derived.by<CwStatusDotStatus>(() => {
		const devStatuses = resolvedDevices
			.map((d) => effectiveDeviceStatus(d))
			.filter((s): s is NonNullable<typeof s> => s != null);

		if (devStatuses.length === 0) return status;

		const allOnline = devStatuses.every((s) => s === 'online');
		if (allOnline) return 'online';

		const allOffline = devStatuses.every((s) => s === 'offline');
		if (allOffline) return 'offline';

		const allLoading = devStatuses.every((s) => s === 'loading');
		if (allLoading) return 'loading';

		const hasOnline = devStatuses.some((s) => s === 'online');
		const hasOffline = devStatuses.some((s) => s === 'offline');
		if (hasOnline && hasOffline) return 'warning';

		return 'warning';
	});

	const statusTone = $derived<CwTone>(
		aggregateStatus === 'online'
			? 'success'
			: aggregateStatus === 'offline'
				? 'danger'
				: aggregateStatus === 'loading'
					? 'info'
					: 'warning'
	);

	const statusLabel = $derived(
		aggregateStatus === 'online'
			? 'Online'
			: aggregateStatus === 'offline'
				? 'Offline'
				: aggregateStatus === 'warning'
					? 'Warning'
					: 'Loading'
	);

	function slotStatusClass(devStatus?: string): string {
		switch (devStatus) {
			case 'online': return 'cw-sensor-card__slot--online';
			case 'offline': return 'cw-sensor-card__slot--offline';
			case 'loading': return 'cw-sensor-card__slot--loading';
			case 'warning': return 'cw-sensor-card__slot--warning';
			default: return '';
		}
	}

	function resolveDetailRows(dev: CwSensorCardDevice): CwSensorCardDetailRow[] {
		return dev.detailRows ?? buildCwSensorCardDetailRows(dev);
	}

</script>

<div
	class="cw-sensor-card cw-sensor-card--{aggregateStatus} {className}"
>
	<!-- Header -->
	<header class="cw-sensor-card__header">
		<div class="cw-sensor-card__status-indicator">
			{#if resolvedDevices.length > 0}
				<CwStatusDot status={aggregateStatus} size="lg" />
			{/if}
		</div>
		<div class="cw-sensor-card__title-group">
			<div class="cw-sensor-card__title">{title}</div>
			<CwChip label={statusLabel} tone={statusTone} variant="soft" size="sm" />
		</div>
		<button
			class="cw-sensor-card__nav-action"
			type="button"
			aria-label="View location"
			onclick={() => onNavigate?.('location')}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path fill="currentColor" d="M10 6v12l6-6-6-6Z" />
			</svg>
		</button>
	</header>

	<!-- Body -->
	<section class="cw-sensor-card__body">
		{#if resolvedDevices.length === 0}
			<div class="cw-sensor-card__empty">
				<svg class="cw-sensor-card__empty-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="currentColor"
						d="M13 13h-2V7h2m0 10h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"
					/>
				</svg>
				<span class="cw-sensor-card__empty-text">No devices assigned</span>
			</div>
		{:else}
			<div class="cw-sensor-card__devices">
				{#each resolvedDevices as dev (dev.label)}
					{@const rows = resolveDetailRows(dev)}
					{@const devExpanded = isExpanded(dev.label)}
					{@const primaryIcon = getCwSensorReadingIcon('primary', dev)}
					{@const secondaryIcon = getCwSensorReadingIcon('secondary', dev)}
					<div class="cw-sensor-card__slot {slotStatusClass(effectiveDeviceStatus(dev))}" class:cw-sensor-card__slot--expanded={devExpanded}>
						<div class="cw-sensor-card__content">
							<div class="cw-sensor-card__device">
								<span class="cw-sensor-card__label">{dev.label}</span>
								<div class="cw-sensor-card__stats">
									<!-- Primary stat -->
									<div class="cw-sensor-card__stat">
										<span
											class="cw-sensor-card__stat-icon {sensorStatIconClass(primaryIcon)}"
											aria-hidden="true"
										>
											<CwDataIcon icon={primaryIcon} />
										</span>
										<span class="cw-sensor-card__stat-reading">
											<span class="cw-sensor-card__stat-value"
												>{dev.primaryValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span
											>
											<span class="cw-sensor-card__stat-unit"
												>{dev.primaryUnit ?? '°C'}</span
											>
										</span>
									</div>
									<!-- Secondary stat -->
									{#if dev.secondaryValue != null}
										<div class="cw-sensor-card__stat">
											<span
												class="cw-sensor-card__stat-icon {sensorStatIconClass(secondaryIcon)}"
												aria-hidden="true"
											>
												<CwDataIcon icon={secondaryIcon} />
											</span>
											<span class="cw-sensor-card__stat-reading">
												<span class="cw-sensor-card__stat-value">{dev.secondaryValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
												<span class="cw-sensor-card__stat-unit">{dev.secondaryUnit ?? '%'}</span>
											</span>
										</div>
									{/if}
								</div>
							</div>
							<button
								class="cw-sensor-card__collapse"
								type="button"
								aria-label={devExpanded ? 'Collapse details' : 'Expand details'}
								onclick={() => toggleDevice(dev.label)}
							>
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										fill="currentColor"
										d={devExpanded ? 'M7 14l5-5 5 5H7Z' : 'M7 10l5 5 5-5H7Z'}
									/>
								</svg>
							</button>
						</div>

						<!-- Expandable details -->
						<div class="cw-sensor-card__details-wrapper" aria-hidden={!devExpanded}>
							<div class="cw-sensor-card__details">
								<div class="cw-sensor-card__details-inner">
									<h4 class="cw-sensor-card__details-heading">Details</h4>
									{#if rows.length > 0}
										<ul class="cw-sensor-card__detail-list">
											{#each rows as row (row.id)}
												{@const rowHasFreshness = row.lastSeenAt != null || row.lastUpdated != null}
												<CwCardDataRowItem
													{...row}
													alarmScheduler={rowAlarmScheduler}
													onExpire={rowHasFreshness ? () => handleDeviceExpire(dev) : undefined}
													onWithinTimeoutChange={rowHasFreshness
														? (nextState) => updateDeviceWithinTimeout(dev.label, nextState)
														: undefined}
												/>
											{/each}
										</ul>
									{:else}
										<p class="cw-sensor-card__details-empty">No detailed readings available yet.</p>
									{/if}
									<div class="cw-sensor-card__cta">
										<CwButton
											variant="secondary"
											size="sm"
											fullWidth
											onclick={() => onNavigate?.(`device-detail:${dev.label}`)}
										>
											<span class="cw-sensor-card__cta-content">
												View Device Details
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path fill="currentColor" d="M10 6v12l6-6-6-6Z" />
												</svg>
											</span>
										</CwButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.cw-sensor-card {
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

	/* ── Status-dependent custom properties ── */
	.cw-sensor-card--online {
		--_sensor-color: var(--cw-success-500);
		--_sensor-glow: color-mix(in srgb, var(--cw-success-500) 50%, transparent);
	}
	.cw-sensor-card--offline {
		--_sensor-color: var(--cw-danger-500);
		--_sensor-glow: color-mix(in srgb, var(--cw-danger-500) 45%, transparent);
	}
	.cw-sensor-card--loading {
		--_sensor-color: var(--cw-warning-500);
		--_sensor-glow: color-mix(in srgb, var(--cw-warning-500) 50%, transparent);
	}
	.cw-sensor-card--warning {
		--_sensor-color: var(--cw-warning-400);
		--_sensor-glow: color-mix(in srgb, var(--cw-warning-400) 45%, transparent);
	}

	/* ── Header ── */
	.cw-sensor-card__header {
		display: flex;
		align-items: center;
		padding: var(--cw-space-2) var(--cw-space-4);
		gap: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-sensor-card__status-indicator {
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

	.cw-sensor-card__title-group {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		flex: 1;
		min-width: 0;
	}

	.cw-sensor-card__title {
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		font-size: var(--cw-text-base);
		line-height: var(--cw-leading-tight);
	}

	.cw-sensor-card__nav-action {
		width: 2.125rem;
		height: 2.125rem;
		border-radius: var(--cw-radius-full);
		background: var(--cw-bg-muted);
		border: 1px solid var(--cw-border-default);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--cw-accent-text);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			transform var(--cw-duration-fast) var(--cw-ease-default),
			background var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-sensor-card__nav-action:hover {
		transform: translateX(1px);
		background: var(--cw-bg-subtle);
	}

	.cw-sensor-card__nav-action:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
	}

	.cw-sensor-card__nav-action svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Body ── */
	.cw-sensor-card__body {
		background: var(--cw-bg-muted);
		padding: var(--cw-space-1);
	}

	/* ── Devices container ── */
	.cw-sensor-card__devices {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
	}

	/* ── Empty state ── */
	.cw-sensor-card__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-6) var(--cw-space-4);
		border-radius: var(--cw-radius-xl);
		background: var(--cw-bg-elevated);
		border: 1px dashed var(--cw-border-default);
	}

	.cw-sensor-card__empty-icon {
		width: 2rem;
		height: 2rem;
		color: var(--cw-text-muted);
		opacity: 0.6;
	}

	.cw-sensor-card__empty-text {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		font-weight: var(--cw-font-medium);
	}

	/* ── Slot (content area with side status indicator bar) ── */
	.cw-sensor-card__slot {
		position: relative;
		padding: var(--cw-space-1) var(--cw-space-3) var(--cw-space-1) var(--cw-space-8);
		border-radius: var(--cw-radius-xl);
		background: var(--cw-bg-elevated2);
		border: 1px solid var(--cw-border-muted);
	}

	.cw-sensor-card__slot::before {
		content: '';
		position: absolute;
		left: 0.75rem;
		top: 0.75rem;
		bottom: 0.75rem;
		width: 5px;
		border-radius: var(--cw-radius-full);
		/* background: linear-gradient(
			180deg,
			var(--_slot-color, var(--_sensor-color, var(--cw-success-500))),
			var(--cw-bg-surface)
		); */
		background: var(--_slot-color, var(--_sensor-color, var(--cw-success-500)));
		box-shadow: 0 0 10px var(--_slot-glow, var(--_sensor-glow, color-mix(in srgb, var(--cw-success-500) 50%, transparent)));
	}

	/* Per-slot status colors */
	.cw-sensor-card__slot--online {
		--_slot-color: var(--cw-success-500);
		--_slot-glow: color-mix(in srgb, var(--cw-success-500) 50%, transparent);
	}
	.cw-sensor-card__slot--offline {
		--_slot-color: var(--cw-danger-500);
		--_slot-glow: color-mix(in srgb, var(--cw-danger-500) 45%, transparent);
	}
	.cw-sensor-card__slot--loading {
		--_slot-color: var(--cw-info-500);
		--_slot-glow: color-mix(in srgb, var(--cw-info-500) 50%, transparent);
	}
	.cw-sensor-card__slot--warning {
		--_slot-color: var(--cw-warning-400);
		--_slot-glow: color-mix(in srgb, var(--cw-warning-400) 45%, transparent);
	}

	/* ── Content row ── */
	.cw-sensor-card__content {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--cw-space-2);
		min-width: 0;
	}

	.cw-sensor-card__device {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		border-right: 1px solid var(--cw-border-muted);
		container-type: inline-size;
	}

	.cw-sensor-card__label {
		font-size: var(--cw-text-sm);
		font-size: clamp(var(--cw-text-xs), 7cqi, var(--cw-text-sm));
		color: var(--cw-text-secondary);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.03em;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Stats ── */
	.cw-sensor-card__stats {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		gap: clamp(var(--cw-space-2), 3cqi, var(--cw-space-4));
		flex-wrap: nowrap;
		min-width: 0;
	}

	.cw-sensor-card__stat {
		display: flex;
		align-items: center;
		gap: var(--cw-space-1);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
		flex: 1 1 0;
		min-width: 0;
		container-type: inline-size;
	}

	.cw-sensor-card__stat-icon {
		width: 1.625rem;
		height: 1.625rem;
		min-width: 1.625rem;
		width: clamp(1rem, 24cqi, 1.625rem);
		height: clamp(1rem, 24cqi, 1.625rem);
		min-width: clamp(1rem, 24cqi, 1.625rem);
		border-radius: var(--cw-radius-full);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--cw-text-muted) 15%, transparent);
		overflow: hidden;
	}

	.cw-sensor-card__stat-reading {
		display: inline-flex;
		align-items: baseline;
		gap: 0.1rem;
		min-width: 0;
		flex: 1 1 auto;
		white-space: nowrap;
	}

	.cw-sensor-card__stat-icon svg {
		width: 1rem;
		height: 1rem;
		width: clamp(0.75rem, 15cqi, 1rem);
		height: clamp(0.75rem, 15cqi, 1rem);
	}

	.cw-sensor-card__stat-icon--temp {
		color: #f36d5b;
	}

	.cw-sensor-card__stat-icon--humidity {
		color: var(--cw-info-300);
	}

	.cw-sensor-card__stat-value {
		line-height: 1;
		min-width: 0;
		font-size: var(--cw-text-lg);
		font-size: clamp(var(--cw-text-xs), 21cqi, var(--cw-text-lg));
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: clip;
	}

	.cw-sensor-card__stat-unit {
		font-size: var(--cw-text-xs);
		font-size: clamp(0.625rem, 10cqi, var(--cw-text-xs));
		color: var(--cw-text-muted);
		line-height: 1;
		font-weight: var(--cw-font-medium);
		white-space: nowrap;
	}

	/* ── Collapse toggle ── */
	.cw-sensor-card__collapse {
		border: 0;
		background: transparent;
		color: var(--cw-text-muted);
		cursor: pointer;
		padding: var(--cw-space-1);
		flex-shrink: 0;
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-sensor-card__collapse:hover {
		transform: translateY(1px);
		color: var(--cw-text-secondary);
	}

	.cw-sensor-card__collapse:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: var(--cw-focus-ring-offset);
		border-radius: var(--cw-radius-sm);
	}

	.cw-sensor-card__collapse svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Details (expandable via grid-template-rows) ── */
	.cw-sensor-card__details-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--cw-duration-normal) var(--cw-ease-default);
	}

	.cw-sensor-card__slot--expanded .cw-sensor-card__details-wrapper {
		grid-template-rows: 1fr;
	}

	.cw-sensor-card__details {
		overflow: hidden;
	}

	.cw-sensor-card__details-inner {
		padding-top: var(--cw-space-3);
		margin-top: var(--cw-space-3);
		border-top: 1px solid var(--cw-border-muted);
	}

	.cw-sensor-card__details-heading {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-accent-text);
	}

	.cw-sensor-card__detail-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cw-sensor-card__details-empty {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	/* ── CTA button wrapper ── */
	.cw-sensor-card__cta {
		margin-top: var(--cw-space-3);
	}

	.cw-sensor-card__cta-content {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		justify-content: center;
		width: 100%;
	}

	.cw-sensor-card__cta-content svg {
		width: 1rem;
		height: 1rem;
		color: var(--cw-accent);
	}
</style>
