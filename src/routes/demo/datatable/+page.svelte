<script lang="ts">
	import { CwDataTable, CwButton, CwDuration } from '$lib/index.js';
	import type { CwColumnDef, CwTableQuery, CwTableResult } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	interface Device {
		id: string;
		name: string;
		eui: string;
		status: string;
		lastSeen: string;
		textSize: string;
		cwloading?: boolean;
	}

	const mockDevices: Device[] = Array.from({ length: 47 }, (_, i) => ({
		id: `dev-${i + 1}`,
		name: `Sensor ${String(i + 1).padStart(3, '0')}`,
		eui: Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
		status: ['online', 'offline', 'warning'][i % 3],
		lastSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
		textSize: i % 3 === 0 ? '0.75rem' : i % 3 === 1 ? '0.875rem' : '1rem'
	}));

	const columns: CwColumnDef<Device>[] = [
		{ key: 'name', header: 'Device Name', sortable: true },
		{ key: 'eui', header: 'DevEUI', width: '12rem', hideBelow: 'sm' },
		{ key: 'status', header: 'Status', sortable: true },
		{ key: 'lastSeen', header: 'Last Seen', sortable: true, hideBelow: 'md', cell: (row) => new Date(row.lastSeen).toLocaleString() }
	];

	async function loadData(query: CwTableQuery): Promise<CwTableResult<Device>> {
		await new Promise((r) => setTimeout(r, 400));
		let items = [...mockDevices];
		if (query.search) {
			const s = query.search.toLowerCase();
			items = items.filter((d) => d.name.toLowerCase().includes(s) || d.eui.includes(s));
		}
		if (query.sort) {
			const k = query.sort.column as keyof Device;
			items.sort((a, b) => {
				const av = a[k], bv = b[k];
				return query.sort!.direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
			});
		}
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
		await new Promise((r) => setTimeout(r, 250));
		let items = [...rowLoadingDevices];
		if (query.search) {
			const s = query.search.toLowerCase();
			items = items.filter((d) => d.name.toLowerCase().includes(s) || d.eui.includes(s));
		}
		if (query.sort) {
			const k = query.sort.column as keyof Device;
			items.sort((a, b) => {
				const av = a[k], bv = b[k];
				return query.sort!.direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
			});
		}
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

const fillParentExample = `<div class="datatable-host">
\t<CwDataTable
\t\tcolumns={columns}
\t\tloadData={loadData}
\t\trowKey="id"
\t\trowTextSizeKey="textSize"
\t\tfillParent
\t\tsearchable={false}
\t\tpageSize={25}
\t/>
</div>

<style>
\t.datatable-host {
\t\theight: clamp(18rem, 50vh, 26rem);
\t\tmin-height: 0;
\t}
</style>`;
</script>

<h2>CwDataTable</h2>
<p class="demo-desc">Async data loading, search, sort, pagination, zebra rows, custom cell rendering (e.g. <code>CwDuration</code>), page-size picker, toolbar actions, and per-row action buttons.</p>

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
		Set a parent height, then pass <code>fillParent</code>. The table fills the container and the body region scrolls when rows exceed available space.
	</p>
	<div class="demo-table-host">
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
	<DemoCodeExample code={fillParentExample} title="Fill-parent datatable" />
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
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-section { margin-top: var(--cw-space-6); }
	.demo-table-host { height: clamp(18rem, 50vh, 26rem); min-height: 0; }
	.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cw-space-2); margin-bottom: var(--cw-space-3); }
	.demo-list { margin: 0; padding-left: var(--cw-space-4); color: var(--cw-text-secondary); font-size: var(--cw-text-sm); display: grid; gap: var(--cw-space-1); }
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); color: var(--cw-accent); }
	.row-actions {
		display: flex;
		gap: var(--cw-space-1);
		justify-content: flex-end;
	}
</style>
