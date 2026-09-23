<script lang="ts">
	import {
		CwButton,
		CwChip,
		CwDataTable,
		CwDonutChart,
		CwInput,
		CwListBox,
		CwStatusDot,
		formatCwMeasurement
	} from '$lib/index.js';
	import type {
		CwColumnDef,
		CwDonutSegment,
		CwListBoxItem,
		CwStatusDotStatus,
		CwTableQuery,
		CwTableResult
	} from '$lib/index.js';
	import {
		alerts,
		categoryMeta,
		devices,
		groupOptions,
		locationOptions,
		type Category,
		type DeviceRow,
		type DeviceStatus,
		type ScopeSummary,
		type StatusFilter
	} from './data.js';

	const ALL_GROUPS = 'all-groups';
	const ALL_LOCATIONS = 'all-locations';

	const statusMeta: Record<DeviceStatus, { label: string; dot: CwStatusDotStatus }> = {
		online: { label: 'Online', dot: 'online' },
		offline: { label: 'Offline', dot: 'offline' },
		alert: { label: 'Alert', dot: 'warning' }
	};

	const groupLabels: Record<string, string> = Object.fromEntries(
		groupOptions.map((group) => [group.id, group.label])
	);
	const locationLabels: Record<string, string> = Object.fromEntries(
		locationOptions.map((location) => [location.id, location.label])
	);

	const groupItems: CwListBoxItem[] = groupOptions.map((group) => ({
		value: group.id,
		label: group.label,
		badge: group.id === ALL_GROUPS ? undefined : group.code,
		badgeTone: 'secondary',
		endText: String(group.devicesInView)
	}));

	const locationItems: CwListBoxItem[] = locationOptions.map((location) => ({
		value: location.id,
		label: location.label,
		endText: String(location.devicesInView)
	}));

	let activeCategory = $state<Category>('air');
	let selectedGroupId = $state(ALL_GROUPS);
	let selectedLocationId = $state(ALL_LOCATIONS);
	let globalSearch = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let showVirtualOnly = $state(true);
	let refreshing = $state(false);
	let lastRefresh = $state(new Date('2026-03-07T00:18:44'));
	let lastEvent = $state('');

	const query = $derived(globalSearch.trim().toLowerCase());

	function matches(text: string): boolean {
		return !query || text.toLowerCase().includes(query);
	}

	const visibleGroupItems = $derived(
		groupItems.filter((item) => item.value === selectedGroupId || matches(`${item.label} ${item.badge ?? ''}`))
	);
	const visibleLocationItems = $derived(
		locationItems.filter((item) => item.value === selectedLocationId || matches(item.label))
	);

	/** Devices matching every scope filter except the status pills. */
	const scopedDevices = $derived(
		devices.filter(
			(device) =>
				device.category === activeCategory &&
				(selectedGroupId === ALL_GROUPS || device.groupId === selectedGroupId) &&
				(selectedLocationId === ALL_LOCATIONS || device.locationId === selectedLocationId) &&
				(!showVirtualOnly || device.virtual) &&
				matches(
					[
						device.name,
						device.serial,
						device.facility,
						device.floor,
						groupLabels[device.groupId] ?? '',
						locationLabels[device.locationId] ?? ''
					].join(' ')
				)
		)
	);

	const filteredDevices = $derived(
		statusFilter === 'all' ? scopedDevices : scopedDevices.filter((d) => d.status === statusFilter)
	);

	/**
	 * With no narrowing filters the fleet-wide totals from the group/location
	 * lists are shown; otherwise counts come from the devices actually in view.
	 */
	const summary = $derived.by((): ScopeSummary => {
		const narrowed = query.length > 0 || statusFilter !== 'all' || !showVirtualOnly;
		if (!narrowed) {
			if (selectedLocationId !== ALL_LOCATIONS) {
				return locationOptions.find((l) => l.id === selectedLocationId) ?? locationOptions[0];
			}
			return groupOptions.find((g) => g.id === selectedGroupId) ?? groupOptions[0];
		}
		const offline = filteredDevices.filter((d) => d.status === 'offline').length;
		const alertCount = filteredDevices.filter((d) => d.status === 'alert').length;
		return {
			devicesInView: filteredDevices.length,
			fleetTotal: filteredDevices.length,
			online: filteredDevices.length - offline - alertCount,
			offline,
			alerts: alertCount
		};
	});

	const scopeLabel = $derived(
		selectedLocationId !== ALL_LOCATIONS
			? locationLabels[selectedLocationId]
			: selectedGroupId !== ALL_GROUPS
				? groupLabels[selectedGroupId]
				: 'All locations'
	);

	const statusFilters = $derived([
		{ id: 'online' as const, count: summary.online },
		{ id: 'alert' as const, count: summary.alerts },
		{ id: 'offline' as const, count: summary.offline }
	]);

	const donutSegments = $derived<CwDonutSegment[]>([
		{ label: 'Online', value: summary.online, color: 'var(--cw-status-online)' },
		{ label: 'Alert', value: summary.alerts, color: 'var(--cw-status-warning)' },
		{ label: 'Offline', value: summary.offline, color: 'var(--cw-status-offline)' }
	]);

	const topGroups = [...groupOptions]
		.filter((group) => group.id !== ALL_GROUPS)
		.sort((a, b) => b.devicesInView - a.devicesInView)
		.slice(0, 4);
	const topGroupMax = Math.max(...topGroups.map((group) => group.devicesInView), 1);

	const visibleAlerts = $derived(
		alerts
			.filter((alert) => {
				const device = devices.find((entry) => entry.id === alert.deviceId);
				return (
					device?.category === activeCategory &&
					(selectedGroupId === ALL_GROUPS || alert.groupId === selectedGroupId) &&
					(selectedLocationId === ALL_LOCATIONS || alert.locationId === selectedLocationId) &&
					matches(
						[alert.label, groupLabels[alert.groupId] ?? '', locationLabels[alert.locationId] ?? ''].join(' ')
					)
				);
			})
			.slice(0, 6)
	);

	const lastRefreshLabel = $derived(
		lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
	);

	// ── Table ────────────────────────────────────────────
	const columns = $derived.by((): CwColumnDef<DeviceRow>[] => {
		const [c0, c1, c2] = categoryMeta[activeCategory].columns;
		const reading = (index: 0 | 1 | 2, header: string): CwColumnDef<DeviceRow> => ({
			key: `reading${index}`,
			header,
			numeric: true,
			cell: (row) => formatCwMeasurement(row.readings[index], row.units[index], { maximumFractionDigits: 1 })
		});
		return [
			{ key: 'name', header: 'Device', sortable: true },
			reading(0, c0),
			reading(1, c1),
			reading(2, c2),
			{ key: 'status', header: 'Status', sortable: true },
			{ key: 'lastSeenMinutes', header: 'Last seen', sortable: true, hideBelow: 'sm' },
			{ key: 'facility', header: 'Facility / location', hideBelow: 'md', truncate: true }
		];
	});

	// Passing the scope as table filters makes CwDataTable refetch whenever it changes.
	const tableFilters = $derived({
		category: [activeCategory],
		group: [selectedGroupId],
		location: [selectedLocationId],
		status: [statusFilter],
		virtual: [String(showVirtualOnly)],
		q: [query]
	});

	async function loadDevices(q: CwTableQuery): Promise<CwTableResult<DeviceRow>> {
		const search = q.search.trim().toLowerCase();
		let rows = search
			? filteredDevices.filter((d) =>
					[d.name, d.serial, d.facility, d.floor].join(' ').toLowerCase().includes(search)
				)
			: [...filteredDevices];

		if (q.sort) {
			const { column, direction } = q.sort;
			const sign = direction === 'asc' ? 1 : -1;
			rows = rows.sort((a, b) => {
				const left = a[column as keyof DeviceRow];
				const right = b[column as keyof DeviceRow];
				if (typeof left === 'number' && typeof right === 'number') return (left - right) * sign;
				return String(left).localeCompare(String(right), 'ja') * sign;
			});
		}

		const start = (q.page - 1) * q.pageSize;
		return { rows: rows.slice(start, start + q.pageSize), total: rows.length };
	}

	function toggleStatus(next: DeviceStatus) {
		statusFilter = statusFilter === next ? 'all' : next;
	}

	async function refresh() {
		refreshing = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		lastRefresh = new Date();
		refreshing = false;
	}

	function resetFilters() {
		globalSearch = '';
		selectedGroupId = ALL_GROUPS;
		selectedLocationId = ALL_LOCATIONS;
		statusFilter = 'all';
		showVirtualOnly = true;
	}
</script>

<svelte:head>
	<title>Data display · CropWatch UI</title>
</svelte:head>

<h2>Fleet dashboard</h2>
<p class="demo-desc">
	A full-page composition of library components: scope filters in a sidebar, fleet status
	counts, a category switch, a server-style <code>CwDataTable</code>, and alert analytics. Every
	panel reacts to the same filters and works in both themes and down to phone width.
</p>

<div class="dd">
	<aside class="dd__sidebar" aria-label="Scope filters">
		<CwInput
			label="Search"
			placeholder="Group, location or device…"
			clearable
			bind:value={globalSearch}
		>
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
					<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4" />
					<path d="M10.5 10.5 13.5 13.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
				</svg>
			{/snippet}
		</CwInput>

		<CwListBox
			heading="Groups"
			items={visibleGroupItems}
			value={selectedGroupId}
			emptyText="No matching groups"
			onselect={(item) => (selectedGroupId = item.value)}
		/>

		<CwListBox
			heading="Locations"
			items={visibleLocationItems}
			value={selectedLocationId}
			emptyText="No matching locations"
			onselect={(item) => (selectedLocationId = item.value)}
		/>

		<section class="dd__panel dd__scope" aria-labelledby="dd-scope-title">
			<h3 id="dd-scope-title" class="dd__panel-title">{scopeLabel}</h3>
			<dl class="dd__scope-list">
				<div><dt>Total in view</dt><dd>{summary.devicesInView}</dd></div>
				<div><dt>Alerts</dt><dd class="dd__text--warning">{summary.alerts}</dd></div>
				<div><dt>Offline</dt><dd class="dd__text--danger">{summary.offline}</dd></div>
				<div><dt>Last sync</dt><dd>{lastRefreshLabel}</dd></div>
			</dl>
		</section>
	</aside>

	<div class="dd__main">
		<section class="dd__overview" aria-label="Fleet status">
			<div class="dd__headline">
				<p class="dd__eyebrow">{groupLabels[selectedGroupId]}</p>
				<p class="dd__headline-value">
					<strong>{summary.devicesInView}</strong> devices in view
				</p>
			</div>

			<div class="dd__status-filters" role="group" aria-label="Filter by status">
				{#each statusFilters as pill (pill.id)}
					<button
						type="button"
						class="dd__status-filter"
						aria-pressed={statusFilter === pill.id}
						onclick={() => toggleStatus(pill.id)}
					>
						<CwStatusDot status={statusMeta[pill.id].dot} size="sm" />
						<span>{statusMeta[pill.id].label}</span>
						<strong>{pill.count}</strong>
					</button>
				{/each}
			</div>

			<div class="dd__actions">
				<CwButton variant="secondary" loading={refreshing} onclick={refresh}>Refresh</CwButton>
				<CwButton variant="ghost" onclick={resetFilters}>Reset filters</CwButton>
			</div>
		</section>

		<div class="dd__category-bar">
			<div class="dd__segmented" role="group" aria-label="Telemetry category">
				{#each Object.entries(categoryMeta) as [id, meta] (id)}
					<button
						type="button"
						class="dd__segment"
						aria-pressed={activeCategory === id}
						onclick={() => (activeCategory = id as Category)}
					>
						<svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
							<path
								d={meta.icon}
								stroke="currentColor"
								stroke-width="1.35"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						{meta.label}
					</button>
				{/each}
			</div>

			<label class="dd__toggle">
				<input type="checkbox" bind:checked={showVirtualOnly} />
				Virtual devices only
			</label>
		</div>

		<CwDataTable
			columns={columns}
			loadData={loadDevices}
			rowKey="id"
			filters={tableFilters}
			pageSize={5}
			pageSizeOptions={[5, 10, 20]}
			density="compact"
			columnAlign="left"
			onRowClick={(row) => (lastEvent = `Opened ${row.name} (${row.serial})`)}
		>
			{#snippet cell(row, col, value)}
				{#if col.key === 'name'}
					<span class="dd__device">
						<strong>{row.name}</strong>
						<span>{row.serial}</span>
					</span>
				{:else if col.key === 'status'}
					<CwStatusDot status={statusMeta[row.status].dot} size="sm" label={statusMeta[row.status].label} showLabel />
				{:else if col.key === 'lastSeenMinutes'}
					<span class="dd__device">
						<strong>{row.lastSeenMinutes} min ago</strong>
						<span>{row.seenAt}</span>
					</span>
				{:else if col.key === 'facility'}
					<span class="dd__device">
						<strong>{row.facility}</strong>
						<span>{row.floor}</span>
					</span>
				{:else}
					{value}
				{/if}
			{/snippet}
			{#snippet emptyState()}
				<p class="dd__empty">No devices match this combination of filters.</p>
			{/snippet}
		</CwDataTable>

		{#if lastEvent}
			<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
		{/if}

		<section class="dd__analytics" aria-labelledby="dd-analytics-title">
			<h3 id="dd-analytics-title">Alerts</h3>
			<div class="dd__analytics-grid">
				<article class="dd__panel">
					<header class="dd__panel-head">
						<h4 class="dd__panel-title">Status mix</h4>
						<span>Total {summary.fleetTotal}</span>
					</header>
					<CwDonutChart segments={donutSegments} size={160} thickness={24} decimals={0} />
				</article>

				<article class="dd__panel">
					<header class="dd__panel-head">
						<h4 class="dd__panel-title">Top groups</h4>
						<span>Devices</span>
					</header>
					<ul class="dd__bars">
						{#each topGroups as group (group.id)}
							<li class="dd__bar" class:dd__bar--active={group.id === selectedGroupId}>
								<span class="dd__bar-meta">
									<span>{group.label}</span>
									<strong>{group.devicesInView}</strong>
								</span>
								<span class="dd__bar-track" aria-hidden="true">
									<span style:inline-size="{(group.devicesInView / topGroupMax) * 100}%"></span>
								</span>
							</li>
						{/each}
					</ul>
				</article>

				<article class="dd__panel">
					<header class="dd__panel-head">
						<h4 class="dd__panel-title">Active alerts</h4>
						<span>Reported</span>
					</header>
					{#if visibleAlerts.length}
						<ul class="dd__alerts">
							{#each visibleAlerts as alert (alert.id)}
								<li class="dd__alert">
									<CwChip
										size="sm"
										variant="soft"
										tone={alert.severity === 'critical' ? 'danger' : 'warning'}
										label={alert.severity === 'critical' ? 'Critical' : 'Warning'}
									/>
									<span class="dd__alert-label">{alert.label}</span>
									<time class="dd__alert-time">{alert.reportedAt}</time>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="dd__empty">No active alerts in this scope.</p>
					{/if}
				</article>
			</div>
		</section>
	</div>
</div>

<style>
	.dd {
		container: dd / inline-size;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--cw-space-4);
	}

	.dd__sidebar,
	.dd__main {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
		min-width: 0;
	}

	@container dd (min-width: 56rem) {
		.dd {
			grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
			align-items: start;
		}

		.dd__sidebar {
			position: sticky;
			top: var(--cw-space-4);
		}
	}

	/* ── Panels ─────────────────────────────────────────── */
	.dd__panel {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
		min-width: 0;
	}

	.dd__panel-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--cw-space-2);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
	}

	.dd__panel-title {
		margin: 0;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.dd__scope-list {
		display: grid;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
	}

	.dd__scope-list div {
		display: flex;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.dd__scope-list dt {
		color: var(--cw-text-muted);
	}

	.dd__scope-list dd {
		font-weight: var(--cw-font-semibold);
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-primary);
	}

	.dd__text--warning {
		color: var(--cw-tone-warning-text);
	}

	.dd__text--danger {
		color: var(--cw-tone-danger-text);
	}

	/* ── Overview ───────────────────────────────────────── */
	.dd__overview {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-3) var(--cw-space-4);
	}

	.dd__headline {
		flex: 1 1 12rem;
		min-width: 0;
	}

	.dd__eyebrow {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
	}

	.dd__headline-value {
		color: var(--cw-text-secondary);
	}

	.dd__headline-value strong {
		font-size: var(--cw-text-3xl);
		font-weight: var(--cw-font-bold);
		line-height: 1;
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
	}

	.dd__status-filters,
	.dd__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.dd__status-filter,
	.dd__segment {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-height: var(--cw-control-h-md);
		padding-inline: var(--cw-control-px-md);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		background: var(--cw-control-bg);
		color: var(--cw-text-secondary);
		font: inherit;
		font-size: var(--cw-control-text-md);
		cursor: pointer;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.dd__status-filter:hover,
	.dd__segment:hover {
		border-color: var(--cw-control-border-hover);
	}

	.dd__status-filter[aria-pressed='true'],
	.dd__segment[aria-pressed='true'] {
		background: var(--cw-tone-primary-bg);
		border-color: var(--cw-tone-primary-border);
		color: var(--cw-tone-primary-text);
	}

	.dd__status-filter strong {
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-primary);
	}

	.dd__status-filter[aria-pressed='true'] strong {
		color: inherit;
	}

	/* ── Category bar ───────────────────────────────────── */
	.dd__category-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.dd__segmented {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.dd__toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		cursor: pointer;
	}

	.dd__toggle input {
		inline-size: 1rem;
		block-size: 1rem;
		accent-color: var(--cw-accent);
	}

	/* ── Table cells ────────────────────────────────────── */
	.dd__device {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.dd__device strong {
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
	}

	.dd__device span {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.dd__empty {
		padding: var(--cw-space-4);
		text-align: center;
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
	}

	/* ── Analytics ──────────────────────────────────────── */
	.dd__analytics h3 {
		margin-bottom: var(--cw-space-3);
	}

	.dd__analytics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
		gap: var(--cw-space-4);
	}

	.dd__bars,
	.dd__alerts {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		list-style: none;
	}

	.dd__bar-meta {
		display: flex;
		justify-content: space-between;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.dd__bar-meta strong {
		font-variant-numeric: tabular-nums;
		color: var(--cw-text-primary);
	}

	.dd__bar-track {
		display: block;
		margin-top: var(--cw-space-1);
		block-size: 0.5rem;
		border-radius: var(--cw-radius-full);
		background: var(--cw-bg-muted);
		overflow: hidden;
	}

	.dd__bar-track span {
		display: block;
		block-size: 100%;
		border-radius: inherit;
		background: var(--cw-chart-cat-1);
	}

	.dd__bar--active .dd__bar-track span {
		background: var(--cw-accent);
	}

	.dd__alert {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--cw-space-1) var(--cw-space-2);
		align-items: center;
		font-size: var(--cw-text-sm);
	}

	.dd__alert-label {
		color: var(--cw-text-primary);
		overflow-wrap: anywhere;
	}

	.dd__alert-time {
		grid-column: 2;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
