<script lang="ts">
	import { CwDataTable, CwButton, CwDuration } from '$lib/index.js';
	import type { CwColumnDef, CwTableQuery, CwTableResult } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const DEVICE_STATUSES = ['online', 'offline', 'warning'] as const;
	type DeviceStatus = (typeof DEVICE_STATUSES)[number];

	interface Device {
		id: string;
		name: string;
		eui: string;
		status: DeviceStatus;
		lastSeen: string;
		textSize: string;
		cwloading?: boolean;
	}

	const mockDevices: Device[] = Array.from({ length: 47 }, (_, i) => ({
		id: `dev-${i + 1}`,
		name: `Sensor ${String(i + 1).padStart(3, '0')}`,
		eui: Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
		status: DEVICE_STATUSES[i % DEVICE_STATUSES.length],
		lastSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
		textSize: i % 3 === 0 ? '0.75rem' : i % 3 === 1 ? '0.875rem' : '1rem'
	}));

	const virtualDevices: Device[] = Array.from({ length: 2500 }, (_, i) => ({
		id: `virtual-dev-${i + 1}`,
		name: `Virtual Sensor ${String(i + 1).padStart(4, '0')}`,
		eui: Array.from({ length: 8 }, (_, segment) =>
			((i * 17 + segment * 31) % 256).toString(16).padStart(2, '0')
		).join(':'),
		status: DEVICE_STATUSES[i % DEVICE_STATUSES.length],
		lastSeen: new Date(Date.now() - i * 600000).toISOString(),
		textSize: '0.875rem'
	}));

	const columns: CwColumnDef<Device>[] = [
		{ key: 'name', header: 'Device Name', sortable: true },
		{ key: 'eui', header: 'DevEUI', width: '12rem', hideBelow: 'sm' },
		{ key: 'status', header: 'Status', sortable: true },
		{ key: 'lastSeen', header: 'Last Seen', sortable: true, hideBelow: 'md', cell: (row) => new Date(row.lastSeen).toLocaleString() }
	];

	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function applyDeviceQuery(items: Device[], query: CwTableQuery): Device[] {
		let nextItems = [...items];

		if (query.search) {
			const s = query.search.toLowerCase();
			nextItems = nextItems.filter((device) =>
				device.name.toLowerCase().includes(s) || device.eui.includes(s)
			);
		}

		const statusFilters = query.filters.status ?? [];
		if (statusFilters.length > 0) {
			nextItems = nextItems.filter((device) => statusFilters.includes(device.status));
		}

		if (query.sort) {
			const k = query.sort.column as keyof Device;
			nextItems.sort((a, b) => {
				const av = a[k];
				const bv = b[k];
				return query.sort!.direction === 'asc'
					? String(av).localeCompare(String(bv))
					: String(bv).localeCompare(String(av));
			});
		}

		return nextItems;
	}

	async function loadData(query: CwTableQuery): Promise<CwTableResult<Device>> {
		await delay(400);
		const items = applyDeviceQuery(mockDevices, query);
		const start = (query.page - 1) * query.pageSize;
		return { rows: items.slice(start, start + query.pageSize), total: items.length };
	}

	function createStatusFilters(status: 'all' | DeviceStatus): Record<string, string[]> {
		return status === 'all' ? {} : { status: [status] };
	}

	let virtualStatusFilter = $state<'all' | DeviceStatus>('all');
	const virtualFilters = $derived(createStatusFilters(virtualStatusFilter));

	async function loadVirtualData(query: CwTableQuery): Promise<CwTableResult<Device>> {
		await delay(160);
		const items = applyDeviceQuery(virtualDevices, query);
		const start = (query.page - 1) * query.pageSize;
		return { rows: items.slice(start, start + query.pageSize), total: items.length };
	}

	let rowLoadingDevices = $state<Device[]>(
		mockDevices.slice(0, 12).map((device) => ({ ...device }))
	);
	const ROW_UPDATE_DELAY_MS = 1800;

	function findDemoDevice(deviceId: string): Device | undefined {
		return rowLoadingDevices.find((device) => device.id === deviceId);
	}

	async function runAsyncRowUpdate(device: Device): Promise<void> {
		if (device.cwloading === true) return;
		device.cwloading = true;
		await new Promise((r) => setTimeout(r, ROW_UPDATE_DELAY_MS));
		device.cwloading = undefined;
	}

	async function triggerRowLoadingById(deviceId: string): Promise<void> {
		const device = findDemoDevice(deviceId);
		if (!device) return;
		await runAsyncRowUpdate(device);
	}

	function clearRowLoading() {
		for (const device of rowLoadingDevices) {
			device.cwloading = undefined;
		}
	}

	async function simulateBatchRowUpdate() {
		const ids = new Set(['dev-1', 'dev-2', 'dev-3']);
		const targets = rowLoadingDevices.filter((device) => ids.has(device.id));
		await Promise.all(targets.map((device) => runAsyncRowUpdate(device)));
	}

	async function loadRowLoadingDemoData(query: CwTableQuery): Promise<CwTableResult<Device>> {
		await delay(250);
		const items = applyDeviceQuery(rowLoadingDevices, query);
		const start = (query.page - 1) * query.pageSize;
		return { rows: items.slice(start, start + query.pageSize), total: items.length };
	}

	function handleEdit(device: Device) {
		alert(`Edit: ${device.name}`);
	}

	function handleDelete(device: Device) {
		alert(`Delete: ${device.name}`);
	}

const dataTableExample = `<CwDataTable
\tcolumns={columns}
\tloadData={loadData}
\trowKey="id"
\trowTextSizeKey="textSize"
\tsearchable
\tpageSize={10}
>
\t{#snippet cell(row, col, defaultValue)}
\t\t{#if col.key === 'lastSeen'}
\t\t\t<CwDuration from={row.lastSeen} />
\t\t{:else}
\t\t\t{defaultValue}
\t\t{/if}
\t{/snippet}
</CwDataTable>`;

const rowLoadingExample = `interface Device {
\tid: string;
\tname: string;
\tcwloading?: boolean;
}

async function updateRow(row: Device) {
\trow.cwloading = true;
\tawait api.updateDevice(row.id);
\trow.cwloading = undefined;
}

<CwDataTable columns={columns} loadData={loadData} rowKey="id" />`;

const fillParentExample = `<div class="datatable-shell">
\t<div class="datatable-shell__body">
\t\t<CwDataTable
\t\t\tcolumns={columns}
\t\t\tloadData={loadData}
\t\t\trowKey="id"
\t\t\trowTextSizeKey="textSize"
\t\t\tfillParent
\t\t\tsearchable={false}
\t\t\tpageSize={25}
\t\t/>
\t</div>
</div>

<style>
\t.datatable-shell {
\t\tdisplay: flex;
\t\tflex-direction: column;
\t\theight: clamp(18rem, 50vh, 26rem);
\t\tmin-height: 0;
\t}

\t.datatable-shell__body {
\t\tdisplay: flex;
\t\tflex: 1 1 auto;
\t\tmin-height: 0;
\t}
</style>`;

const virtualScrollExample = `<script lang="ts">
\tlet statusFilter = $state<'all' | 'online' | 'offline' | 'warning'>('all');
\tconst filters = $derived(statusFilter === 'all' ? {} : { status: [statusFilter] });

\tasync function loadData(query: CwTableQuery): Promise<CwTableResult<Device>> {
\t\tconst rows = applyServerQuery(query);
\t\treturn {
\t\t\trows: rows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
\t\t\ttotal: rows.length
\t\t};
\t}
<\/script>

<CwDataTable
\tcolumns={columns}
\tloadData={loadData}
\trowKey="id"
\tfilters={filters}
\tvirtualScroll
\tvirtualScrollHeight="24rem"
\tvirtualRowHeight={52}
\tvirtualOverscan={14}
\tpageSize={75}
/>`;
</script>

<h2>CwDataTable</h2>
<p class="demo-desc">Async data loading, search, sort, pagination, virtual scrolling, zebra rows, custom cell rendering (e.g. <code>CwDuration</code>), page-size picker, toolbar actions, and per-row action buttons.</p>

<CwDataTable
	{columns}
	{loadData}
	rowKey="id"
	rowTextSizeKey="textSize"
	searchable
	pageSize={10}
	actionsHeader="Actions"
>
	{#snippet toolbarActions()}
		<CwButton size="sm" variant="primary">+ Add Device</CwButton>
		<CwButton size="sm" variant="secondary">Export</CwButton>
	{/snippet}
	{#snippet rowActions(row: Device)}
		<div class="row-actions">
			<CwButton size="sm" variant="ghost" onclick={() => handleEdit(row)}>Edit</CwButton>
			<CwButton size="sm" variant="danger" onclick={() => handleDelete(row)}>Delete</CwButton>
		</div>
	{/snippet}
	{#snippet cell(row: Device, col: CwColumnDef<Device>, defaultValue: string)}
		{#if col.key === 'lastSeen'}
			<CwDuration from={row.lastSeen} />
		{:else}
			{defaultValue}
		{/if}
	{/snippet}
</CwDataTable>

<DemoCodeExample code={dataTableExample} title="CwDataTable example" />

<section class="demo-section">
	<h3>Fill Parent Height + Internal Scroll</h3>
	<p class="demo-hint">
		Use <code>fillParent</code> when the surrounding shell already owns height. In flex layouts, make the table a direct flex child and keep shrinking wrappers at <code>min-height: 0</code> so the internal scroll viewport can resolve correctly.
	</p>
	<div class="demo-table-shell">
		<div class="demo-table-shell__body">
			<CwDataTable
				columns={columns}
				loadData={loadData}
				rowKey="id"
				rowTextSizeKey="textSize"
				fillParent
				searchable={false}
				pageSize={25}
			/>
		</div>
	</div>
	<DemoCodeExample code={fillParentExample} title="Fill-parent datatable" />
</section>

<section class="demo-section">
	<h3>Virtual Scroll + Preserved Query State</h3>
	<p class="demo-hint">
		Virtual mode keeps native scrolling for touch devices, incrementally fetches matching pages, and preserves search, sort, and external <code>filters</code> in every request. Use <code>virtualScrollHeight</code> when the table owns its own viewport, or combine <code>virtualScroll</code> with <code>fillParent</code> inside a bounded flex shell.
	</p>
	<div class="demo-row">
		<CwButton
			size="sm"
			variant={virtualStatusFilter === 'all' ? 'primary' : 'secondary'}
			onclick={() => (virtualStatusFilter = 'all')}
		>
			All statuses
		</CwButton>
		<CwButton
			size="sm"
			variant={virtualStatusFilter === 'online' ? 'primary' : 'secondary'}
			onclick={() => (virtualStatusFilter = 'online')}
		>
			Online only
		</CwButton>
		<CwButton
			size="sm"
			variant={virtualStatusFilter === 'offline' ? 'primary' : 'secondary'}
			onclick={() => (virtualStatusFilter = 'offline')}
		>
			Offline only
		</CwButton>
		<CwButton
			size="sm"
			variant={virtualStatusFilter === 'warning' ? 'primary' : 'secondary'}
			onclick={() => (virtualStatusFilter = 'warning')}
		>
			Warnings only
		</CwButton>
	</div>
	<CwDataTable
		columns={columns}
		loadData={loadVirtualData}
		rowKey="id"
		rowTextSizeKey="textSize"
		filters={virtualFilters}
		searchable
		pageSize={75}
		virtualScroll
		virtualScrollHeight="24rem"
		virtualRowHeight={52}
		virtualOverscan={14}
	/>
	<DemoCodeExample code={virtualScrollExample} title="Virtual-scroll datatable" />
</section>

<section class="demo-section">
	<h3>Virtual Scrolling Documentation</h3>
	<p class="demo-hint">
		Use this checklist before enabling <code>virtualScroll</code> in production. The feature is intentionally query-driven so the same <code>loadData</code> contract works for both pagination and continuous scrolling.
	</p>
	<div class="demo-doc-grid">
		<article class="demo-doc-card">
			<h4>What virtual mode changes</h4>
			<ul class="demo-list">
				<li>Pagination stays the default. Nothing changes until you pass <code>virtualScroll</code>.</li>
				<li>The table still calls <code>loadData(query)</code> with <code>page</code>, <code>pageSize</code>, <code>search</code>, <code>sort</code>, and <code>filters</code>.</li>
				<li>In virtual mode, <code>pageSize</code> becomes the fetch batch size rather than a single visible page.</li>
				<li>The DOM only renders the visible row window plus overscan, so large datasets stay responsive.</li>
			</ul>
		</article>

		<article class="demo-doc-card">
			<h4>What stays preserved</h4>
			<ul class="demo-list">
				<li>Search remains built in and still debounces before refetching.</li>
				<li>Sorting still resets to the top of the result set and refetches with the new order.</li>
				<li>External filters continue to flow through <code>query.filters</code> on every request, even while the table is fetching additional pages during scroll.</li>
				<li>Custom cells, row actions, row click handlers, and row-level loading styles still work the same way.</li>
			</ul>
		</article>

		<article class="demo-doc-card">
			<h4>Layout and iPad guidance</h4>
			<ul class="demo-list">
				<li>Give the table a bounded viewport with <code>fillParent</code> or <code>virtualScrollHeight</code>. Virtual mode needs an actual scroll container.</li>
				<li>If you use <code>fillParent</code> in a flex dashboard, keep each shrinking ancestor at <code>min-height: 0</code> so the table can resolve a non-zero viewport height.</li>
				<li>The scroll container uses native overflow scrolling with momentum, which is what you want on iPad instead of a custom gesture layer.</li>
				<li>Keep <code>virtualRowHeight</code> close to the real rendered row height. If the estimate is too small or too large, the scroll window will feel less accurate.</li>
				<li>Increase <code>virtualOverscan</code> when touch users scroll quickly and you want more rows pre-rendered ahead of the viewport.</li>
			</ul>
		</article>

		<article class="demo-doc-card">
			<h4>Recommended implementation checklist</h4>
			<ul class="demo-list">
				<li>Return a stable <code>total</code> from <code>loadData</code> whenever possible so the footer and load-more logic stay accurate.</li>
				<li>Apply filtering and sorting on the same query path the table already uses for pagination. Do not create a second code path just for virtual mode.</li>
				<li>If the table renders but never scrolls or keeps loading, inspect the layout chain first. Virtual prefetch only starts once the viewport has a real height.</li>
				<li>Use a batch size that matches the density of the screen. Dense admin tables can often use <code>75</code> or <code>100</code>; taller mobile cards may prefer smaller batches.</li>
				<li>Test on a real touch device before shipping. Fast momentum scrolling is where overscan and row-height estimates matter most.</li>
			</ul>
		</article>
	</div>
</section>

<section class="demo-section">
	<h3>Row-Level Update Indicator Demo</h3>
	<p class="demo-hint">
		Rows where <code>cwloading === true</code> are highlighted and blurred, while the rest of the table stays visible.
	</p>
	<div class="demo-row">
		<CwButton size="sm" variant="secondary" onclick={() => triggerRowLoadingById('dev-1')}>Async Update Sensor 001</CwButton>
		<CwButton size="sm" variant="secondary" onclick={() => triggerRowLoadingById('dev-2')}>Async Update Sensor 002</CwButton>
		<CwButton size="sm" variant="secondary" onclick={() => triggerRowLoadingById('dev-3')}>Async Update Sensor 003</CwButton>
		<CwButton size="sm" onclick={simulateBatchRowUpdate}>Simulate Batch Update</CwButton>
		<CwButton size="sm" variant="ghost" onclick={clearRowLoading}>Clear</CwButton>
	</div>
	<CwDataTable
		columns={columns}
		loadData={loadRowLoadingDemoData}
		rowKey="id"
		rowTextSizeKey="textSize"
		searchable={false}
		pageSize={6}
		actionsHeader="Update"
	>
		{#snippet rowActions(row: Device)}
			<CwButton
				size="sm"
				variant="ghost"
				disabled={row.cwloading === true}
				onclick={() => runAsyncRowUpdate(row)}
			>
				{row.cwloading === true ? 'Updating…' : 'Update Row'}
			</CwButton>
		{/snippet}
	</CwDataTable>
	<DemoCodeExample code={rowLoadingExample} title="Row-level loading convention" />
</section>

<section class="demo-section">
	<h3>Row-Level Loading Documentation</h3>
	<p class="demo-hint">
		Use a row convention to trigger update state styling. The datatable checks each row with a strict boolean comparison.
	</p>
	<ul class="demo-list">
		<li>Set <code>cwloading: true</code> on a row object to show the yellow background + blur indicator.</li>
		<li>Set <code>cwloading</code> to <code>false</code>, <code>null</code>, <code>undefined</code>, or remove it to restore normal row styles.</li>
		<li>For async row updates, set <code>cwloading</code> before the request and clear it after the request resolves.</li>
		<li>Only the affected rows change state; the table dataset remains visible during the async update.</li>
	</ul>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	h4 { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); margin: 0; color: var(--cw-text-primary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-section { margin-top: var(--cw-space-6); }
	.demo-table-shell {
		display: flex;
		flex-direction: column;
		height: clamp(18rem, 50vh, 26rem);
		min-height: 0;
	}
	.demo-table-shell__body {
		display: flex;
		flex: 1 1 auto;
		min-height: 0;
	}
	.demo-doc-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--cw-space-3);
	}
	.demo-doc-card {
		display: grid;
		gap: var(--cw-space-2);
		padding: var(--cw-space-4);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 80%, transparent);
		border-radius: var(--cw-radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 92%, white),
				color-mix(in srgb, var(--cw-bg-muted) 60%, white)
			);
		box-shadow: var(--cw-shadow-sm);
	}
	.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cw-space-2); margin-bottom: var(--cw-space-3); }
	.demo-list { margin: 0; padding-left: var(--cw-space-4); color: var(--cw-text-secondary); font-size: var(--cw-text-sm); display: grid; gap: var(--cw-space-1); }
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); color: var(--cw-accent); }
	.row-actions {
		display: flex;
		gap: var(--cw-space-1);
		justify-content: flex-end;
	}
</style>
