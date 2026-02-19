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
	}

	const mockDevices: Device[] = Array.from({ length: 47 }, (_, i) => ({
		id: `dev-${i + 1}`,
		name: `Sensor ${String(i + 1).padStart(3, '0')}`,
		eui: Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
		status: ['online', 'offline', 'warning'][i % 3],
		lastSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
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
</script>

<h2>CwDataTable</h2>
<p class="demo-desc">Async data loading, search, sort, pagination, zebra rows, custom cell rendering (e.g. <code>CwDuration</code>), page-size picker, toolbar actions, and per-row action buttons.</p>

<CwDataTable
	{columns}
	{loadData}
	rowKey="id"
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

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.row-actions {
		display: flex;
		gap: var(--cw-space-1);
		justify-content: flex-end;
	}
</style>
