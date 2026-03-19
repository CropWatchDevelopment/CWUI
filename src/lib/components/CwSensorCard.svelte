<script lang="ts">
	import CwStatusDot from './CwStatusDot.svelte';
	import CwChip from './CwChip.svelte';
	import CwButton from './CwButton.svelte';
	import type {
		CwStatusDotStatus,
		CwTone,
		CwSensorCardDetailRow,
		CwSensorCardDevice
	} from '../types/index.js';
    import CwDuration from './CwDuration.svelte';

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
		/** Secondary reading value (single-device shorthand) */
		secondaryValue?: number;
		/** Unit for secondary value (single-device shorthand) */
		secondaryUnit?: string;
		/** Timestamp of the last data update (single-device shorthand) */
		lastUpdated?: Date | string | number;
		/** Expected update interval in minutes (single-device shorthand) */
		expectedUpdateAfterMinutes?: number;
		/** Custom detail rows — used only when devices is not provided (single-device shorthand) */
		detailRows?: CwSensorCardDetailRow[];
		/** Called when user clicks a navigation action */
		onNavigate?: (target: string) => void;
		/** Called when a device's CwDuration alarm fires (update overdue) */
		onTimerExpired?: (deviceLabel: string) => void;
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
		secondaryValue = 0,
		secondaryUnit = '%',
		lastUpdated,
		expectedUpdateAfterMinutes,
		detailRows,
		onNavigate,
		onTimerExpired,
		class: className = ''
	}: Props = $props();

	const STORAGE_PREFIX = 'cw-sensor-card-expand:';
	const resolvedStorageKey = $derived(storageKey ?? title);

	let expandedMap = $state<Record<string, boolean>>({});
	/** Tracks which devices have been flagged overdue by CwDuration alarms */
	let overdueMap = $state<Record<string, boolean>>({});

	$effect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_PREFIX + resolvedStorageKey);
			if (stored) {
				expandedMap = JSON.parse(stored);
			}
		} catch { /* SSR or storage unavailable */ }
	});

	function markDeviceOverdue(label: string) {
		overdueMap[label] = true;
		onTimerExpired?.(label);
	}

	function clearDeviceOverdue(label: string) {
		delete overdueMap[label];
		overdueMap = { ...overdueMap };
	}

	/**
	 * Returns the effective status for a device, accounting for overdue state.
	 * If the device's CwDuration alarm has fired, or the device is already
	 * past its expected update window on first render, status becomes 'offline'.
	 */
	function effectiveDeviceStatus(dev: CwSensorCardDevice): CwStatusDotStatus {
		if (overdueMap[dev.label]) return 'offline';
		// Eagerly detect overdue on first render (before CwDuration ticks)
		if (dev.lastUpdated != null && dev.expectedUpdateAfterMinutes != null) {
			const ts = dev.lastUpdated instanceof Date ? dev.lastUpdated.getTime() : new Date(dev.lastUpdated as string | number).getTime();
			if (Date.now() - ts > dev.expectedUpdateAfterMinutes * 60_000) return 'offline';
		}
		return dev.status ?? status;
	}

	function isExpanded(label: string): boolean {
		return expandedMap[label] ?? defaultExpanded;
	}

	function toggleDevice(label: string) {
		expandedMap[label] = !isExpanded(label);
		try {
			localStorage.setItem(STORAGE_PREFIX + resolvedStorageKey, JSON.stringify(expandedMap));
		} catch { /* storage unavailable */ }
	}

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
							secondaryValue,
							secondaryUnit,
							detailRows,
							lastUpdated,
							expectedUpdateAfterMinutes,
							status
						}
					]
				: []
	);

	function defaultDetailRows(dev: CwSensorCardDevice): CwSensorCardDetailRow[] {
		if (dev.detailRows && dev.detailRows.length > 0) return dev.detailRows;
		const rows: CwSensorCardDetailRow[] = [];
		if (dev.secondaryValue != null) {
			rows.push({
				id: `${dev.label}-humidity`,
				label: 'Humidity',
				value: dev.secondaryValue.toFixed(2),
				unit: dev.secondaryUnit ?? '%',
				icon: 'drop'
			});
		}
		rows.push({
			id: `${dev.label}-temperature`,
			label: 'Temperature',
			value: dev.primaryValue.toFixed(2),
			unit: dev.primaryUnit ?? '°C',
			icon: 'thermo'
		});
		if (dev.lastUpdated != null) {
			rows.push({
				id: `${dev.label}-updated`,
				label: 'Last Update',
				icon: 'timer',
				lastUpdated: dev.lastUpdated instanceof Date ? dev.lastUpdated : new Date(dev.lastUpdated),
				expectedUpdateAfter: dev.expectedUpdateAfterMinutes
			});
		}
		return rows;
	}

	function slotStatusClass(devStatus?: string): string {
		switch (devStatus) {
			case 'online': return 'cw-sensor-card__slot--online';
			case 'offline': return 'cw-sensor-card__slot--offline';
			case 'loading': return 'cw-sensor-card__slot--loading';
			case 'warning': return 'cw-sensor-card__slot--warning';
			default: return '';
		}
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
				{#each resolvedDevices as dev, i (dev.label)}
					{@const rows = defaultDetailRows(dev)}
					{@const devExpanded = isExpanded(dev.label)}
					<div class="cw-sensor-card__slot {slotStatusClass(effectiveDeviceStatus(dev))}" class:cw-sensor-card__slot--expanded={devExpanded}>
						<div class="cw-sensor-card__content">
							<div class="cw-sensor-card__device">
								<span class="cw-sensor-card__label">{dev.label}</span>
								<div class="cw-sensor-card__stats">
									<!-- Primary stat -->
									<div class="cw-sensor-card__stat">
										<span
											class="cw-sensor-card__stat-icon cw-sensor-card__stat-icon--temp"
											aria-hidden="true"
										>
											<svg viewBox="0 0 24 24" aria-hidden="true">
												<path
													fill="currentColor"
													d="M14 14.76V5a2 2 0 0 0-4 0v9.76a3.5 3.5 0 1 0 4 0ZM12 3a2 2 0 0 1 2 2v9.73l.21.12a2.5 2.5 0 1 1-4.42 0l.21-.12V5a2 2 0 0 1 2-2Zm0 9.5a1 1 0 0 0 1-1V7h-2v4.5a1 1 0 0 0 1 1Z"
												/>
											</svg>
										</span>
										<span class="cw-sensor-card__stat-value"
											>{dev.primaryValue.toFixed(2)}</span
										>
										<span class="cw-sensor-card__stat-unit"
											>{dev.primaryUnit ?? '°C'}</span
										>
									</div>
									<!-- Secondary stat -->
									{#if dev.secondaryValue != null}
										<div class="cw-sensor-card__stat">
											<span
												class="cw-sensor-card__stat-icon cw-sensor-card__stat-icon--humidity"
												aria-hidden="true"
											>
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path
														fill="currentColor"
														d="m12 3.1 4.95 6.17a6 6 0 1 1-9.9 0L12 3.1Zm0 1.52-3.9 4.86a5 5 0 1 0 7.8 0L12 4.62Z"
													/>
												</svg>
											</span>
											<span class="cw-sensor-card__stat-value"
												>{dev.secondaryValue.toFixed(2)}</span
											>
											<span class="cw-sensor-card__stat-unit"
												>{dev.secondaryUnit ?? '%'}</span
											>
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
									<ul class="cw-sensor-card__detail-list">
										{#each rows as row (row.id)}
											<li class="cw-sensor-card__detail-item">
												<div class="cw-sensor-card__detail-info">
													<span
														class="cw-sensor-card__detail-icon cw-sensor-card__detail-icon--{row.icon ??
															'timer'}"
														aria-hidden="true"
													>
														{#if row.icon === 'drop'}
															<svg viewBox="0 0 24 24" aria-hidden="true">
																<path
																	fill="currentColor"
																	d="M12 3c-.3 0-.6.1-.8.4l-4 5c-.8 1-1.2 2.3-1.2 3.6C6 15.9 8.7 18.5 12 18.5s6-2.6 6-6c0-1.3-.4-2.6-1.2-3.6l-4-5c-.2-.3-.5-.4-.8-.4Z"
																/>
															</svg>
														{:else if row.icon === 'thermo'}
															<svg viewBox="0 0 24 24" aria-hidden="true">
																<path
																	fill="currentColor"
																	d="M14 14.76V5a2 2 0 1 0-4 0v9.76a3.5 3.5 0 1 0 4 0Z"
																/>
															</svg>
														{:else}
															<svg viewBox="0 0 24 24" aria-hidden="true">
																<path
																	fill="currentColor"
																	d="M12 7v5l4.3 2.6-.8 1.3L11 13V7h1Z"
																/>
															</svg>
														{/if}
													</span>
													<span class="cw-sensor-card__detail-label"
														>{row.label}</span
													>
												</div>
												<div
													class="cw-sensor-card__detail-value"
													class:cw-sensor-card__detail-value--muted={!row.unit && !row.lastUpdated}
												>
													{#if row.lastUpdated}
														<span class="cw-sensor-card__detail-number">
															<CwDuration
																from={row.lastUpdated}
																alarmAfterMinutes={row.expectedUpdateAfter}
															alarmCallback={() => markDeviceOverdue(dev.label)}
															alarmResetCallback={() => clearDeviceOverdue(dev.label)}
															/>
															<span class="cw-sensor-card__detail-unit">ago</span>
														</span>
													{:else}
														<span class="cw-sensor-card__detail-number">{row.value ?? 'N/A'}</span>
														{#if row.unit}
															<span class="cw-sensor-card__detail-unit">{row.unit}</span>
														{/if}
													{/if}
												</div>
											</li>
										{/each}
									</ul>
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
		padding: var(--cw-space-3) var(--cw-space-4);
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
		padding: var(--cw-space-4);
	}

	/* ── Devices container ── */
	.cw-sensor-card__devices {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
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
		padding: var(--cw-space-3) var(--cw-space-3) var(--cw-space-3) var(--cw-space-8);
		border-radius: var(--cw-radius-xl);
		background: var(--cw-bg-elevated);
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
	}

	.cw-sensor-card__device {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		flex: 1;
		min-width: 0;
	}

	.cw-sensor-card__label {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.03em;
	}

	/* ── Stats ── */
	.cw-sensor-card__stats {
		display: flex;
		align-items: center;
		gap: var(--cw-space-4);
		flex-wrap: nowrap;
	}

	.cw-sensor-card__stat {
		display: inline-flex;
		align-items: baseline;
		gap: var(--cw-space-1);
		font-weight: var(--cw-font-bold);
		font-size: var(--cw-text-lg);
		color: var(--cw-text-primary);
	}

	.cw-sensor-card__stat-icon {
		width: 1.625rem;
		height: 1.625rem;
		border-radius: var(--cw-radius-full);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--cw-text-muted) 15%, transparent);
	}

	.cw-sensor-card__stat-icon svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-sensor-card__stat-icon--temp {
		color: #f36d5b;
	}

	.cw-sensor-card__stat-icon--humidity {
		color: var(--cw-info-300);
	}

	.cw-sensor-card__stat-value {
		line-height: 1;
	}

	.cw-sensor-card__stat-unit {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		margin-left: 0.1rem;
		font-weight: var(--cw-font-medium);
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

	.cw-sensor-card__detail-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-2) 0;
	}

	.cw-sensor-card__detail-item + .cw-sensor-card__detail-item {
		border-top: 1px solid var(--cw-border-muted);
	}

	.cw-sensor-card__detail-info {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.cw-sensor-card__detail-icon {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: var(--cw-radius-full);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--cw-text-muted) 15%, transparent);
	}

	.cw-sensor-card__detail-icon svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-sensor-card__detail-icon--drop {
		color: var(--cw-info-300);
	}

	.cw-sensor-card__detail-icon--thermo {
		color: #f36d5b;
	}

	.cw-sensor-card__detail-icon--timer {
		color: var(--cw-warning-300);
	}

	.cw-sensor-card__detail-value {
		display: flex;
		align-items: baseline;
		gap: var(--cw-space-1);
		font-weight: var(--cw-font-bold);
		color: var(--cw-text-primary);
	}

	.cw-sensor-card__detail-number {
		font-size: var(--cw-text-base);
	}

	.cw-sensor-card__detail-unit {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-sensor-card__detail-value--muted {
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
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
