<script lang="ts">
	import { CwDrawer, CwCard, CwChip, CwDonutChart } from '$lib/index.js';
	import type { CwDrawerItem, CwDonutSegment } from '$lib/index.js';

	let drawerOpen = $state(false);

	const barItems: CwDrawerItem[] = [
		{ id: 'online', label: 'Online 169', tone: 'success' },
		{ id: 'offline', label: 'Offline 27', tone: 'danger' },
		{ id: 'alerts', label: 'Alerts 10', tone: 'warning' },
		{ id: 'loading', label: 'Loading 0', tone: 'secondary' }
	];

	const statusSegments: CwDonutSegment[] = [
		{ label: 'Online', value: 169, color: 'var(--cw-success-500)' },
		{ label: 'Offline', value: 27, color: 'var(--cw-danger-500)' },
		{ label: 'Alerts', value: 10, color: 'var(--cw-warning-500)' }
	];

	const topGroups = [
		{ name: 'Ungrouped', count: 91 },
		{ name: 'TK-Ebisu', count: 49 },
		{ name: 'Seagaia', count: 41 },
		{ name: 'SA', count: 11 }
	];
	const maxGroupCount = Math.max(...topGroups.map((g) => g.count));

	interface AlertRow {
		id: string;
		icon: string;
		name: string;
		reported: string;
	}

	const alerts: AlertRow[] = [
		{ id: 'a1', icon: '🔔', name: 'Test for development!', reported: '9/17/2024, 5:09:49 PM' },
		{ id: 'a2', icon: '🔔', name: 'test', reported: '9/21/2025, 10:58:16 PM' },
		{ id: 'a3', icon: '🔔', name: 'test', reported: '9/28/2025, 9:00:49 PM' },
		{ id: 'a4', icon: '🔔', name: '冷蔵', reported: '10/16/2025, 11:42:40 PM' },
		{ id: 'a5', icon: '🔔', name: '冷蔵', reported: '10/16/2025, 11:46:16 PM' },
		{ id: 'a6', icon: '🔔', name: 'TEST RULE', reported: '1/28/2026, 5:32:35 PM' }
	];
</script>

<h2>CwDrawer</h2>
<p class="demo-desc">Bottom drawer that collapses into a summary bar with item chips, and expands to reveal full content.</p>

<section class="demo-frame">
	<div class="demo-frame__body">
		<p style="color: var(--cw-text-muted); font-size: var(--cw-text-sm);">Main page content sits here. The drawer lives at the bottom.</p>
	</div>

	<CwDrawer
		bind:open={drawerOpen}
		label="Alerts"
		items={barItems}
		height="18rem"
	>
		<div class="drawer-grid">
			<!-- Status Mix card -->
			<CwCard>
				<div class="status-card">
					<div class="status-card__header">
						<span class="status-card__title">Status mix</span>
						<span class="status-card__total">Total {statusSegments.reduce((s, x) => s + x.value, 0)}</span>
					</div>
					<div class="status-card__body">
						<div class="status-card__chart">
							<CwDonutChart segments={statusSegments} size={120} thickness={14} />
						</div>
						<div class="status-card__legend">
							{#each statusSegments as seg}
								<div class="legend-row">
									<CwChip label="{seg.label}  {seg.value}" tone={seg.label === 'Online' ? 'success' : seg.label === 'Offline' ? 'danger' : 'warning'} size="sm" variant="soft" />
								</div>
							{/each}
						</div>
					</div>
				</div>
			</CwCard>

			<!-- Top Groups card -->
			<CwCard>
				<div class="groups-card">
					<div class="groups-card__header">
						<span class="groups-card__title">Top groups</span>
						<span class="groups-card__subtitle">In view</span>
					</div>
					{#each topGroups as group}
						<div class="groups-card__row">
							<span class="groups-card__name">{group.name}</span>
							<span class="groups-card__count">{group.count}</span>
						</div>
						<div class="groups-card__bar-track">
							<div
								class="groups-card__bar-fill"
								style:width="{(group.count / maxGroupCount) * 100}%"
							></div>
						</div>
					{/each}
				</div>
			</CwCard>

			<!-- Active Alert List card -->
			<CwCard>
				<div class="alerts-card">
					<div class="alerts-card__header">
						<span class="alerts-card__title">Active Alert List</span>
						<span class="alerts-card__subtitle">Reported Time</span>
					</div>
					<div class="alerts-card__list">
						{#each alerts as alert (alert.id)}
							<div class="alerts-card__row">
								<span class="alerts-card__icon">🔔</span>
								<span class="alerts-card__name">{alert.name}</span>
								<span class="alerts-card__time">{alert.reported}</span>
							</div>
						{/each}
					</div>
				</div>
			</CwCard>
		</div>
	</CwDrawer>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }

	.demo-frame {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		overflow: hidden;
		height: 28rem;
	}

	.demo-frame__body {
		flex: 1;
		padding: var(--cw-space-6);
	}

	/* ── Drawer content grid ──────────────── */
	.drawer-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--cw-space-4);
		height: 100%;
	}

	/* ── Status Mix ────────────────────────── */
	.status-card { display: flex; flex-direction: column; gap: var(--cw-space-2); }
	.status-card__header { display: flex; justify-content: space-between; align-items: baseline; }
	.status-card__title { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); color: var(--cw-text-primary); }
	.status-card__total { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.status-card__body { display: flex; align-items: center; gap: var(--cw-space-4); flex: 1; }
	.status-card__chart { flex-shrink: 0; }
	.status-card__legend { display: flex; flex-direction: column; gap: var(--cw-space-1); }
	.legend-row { display: flex; align-items: center; }

	/* ── Top Groups ────────────────────────── */
	.groups-card { display: flex; flex-direction: column; gap: var(--cw-space-1); }
	.groups-card__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--cw-space-1); }
	.groups-card__title { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); color: var(--cw-text-primary); }
	.groups-card__subtitle { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.groups-card__row { display: flex; justify-content: space-between; align-items: baseline; font-size: var(--cw-text-sm); color: var(--cw-text-secondary); }
	.groups-card__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.groups-card__count { font-weight: var(--cw-font-semibold); color: var(--cw-text-primary); flex-shrink: 0; }
	.groups-card__bar-track {
		height: 0.375rem;
		border-radius: var(--cw-radius-full);
		background-color: var(--cw-bg-muted);
		margin-bottom: var(--cw-space-1);
	}
	.groups-card__bar-fill {
		height: 100%;
		border-radius: var(--cw-radius-full);
		background: linear-gradient(90deg, var(--cw-primary-600), var(--cw-primary-400));
		transition: width var(--cw-duration-slow) var(--cw-ease-default);
	}

	/* ── Active Alert List ─────────────────── */
	.alerts-card { display: flex; flex-direction: column; gap: var(--cw-space-1); }
	.alerts-card__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--cw-space-1); }
	.alerts-card__title { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); color: var(--cw-text-primary); }
	.alerts-card__subtitle { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.alerts-card__list { display: flex; flex-direction: column; gap: var(--cw-space-1); overflow-y: auto; }
	.alerts-card__row {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}
	.alerts-card__icon { font-size: var(--cw-text-sm); flex-shrink: 0; }
	.alerts-card__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.alerts-card__time { flex-shrink: 0; font-size: var(--cw-text-xs); color: var(--cw-text-muted); font-family: monospace; }
</style>
