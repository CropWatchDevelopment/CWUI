<script lang="ts">
	import { onDestroy } from 'svelte';
	import CwCardDataRowItem from './CwCardDataRowItem.svelte';
	import { createCwAlarmScheduler } from './cwAlarmContext.svelte.js';
	import type { CwAlarmApi, CwCardDataRowItemData } from '../types/index.js';

	interface Props {
		/** Detail rows to render. */
		rows?: CwCardDataRowItemData[];
		/** Optional shared alarm scheduler for row freshness timers. */
		alarmScheduler?: CwAlarmApi;
		/** Optional callback fired when a row crosses its freshness timeout. */
		onRowExpire?: (row: CwCardDataRowItemData) => void;
		/** Optional callback fired when an expired row becomes fresh again. */
		onRowTimeoutReset?: (row: CwCardDataRowItemData) => void;
		/** Optional callback fired whenever a row freshness state changes. */
		onRowWithinTimeoutChange?: (
			row: CwCardDataRowItemData,
			withinTimeout: boolean | null
		) => void;
		/** Bindable per-row freshness state keyed by row id. */
		rowWithinTimeoutMap?: Record<string, boolean | null>;
		/** Empty-state label shown when no rows are provided. */
		emptyLabel?: string;
		/** Additional CSS class applied to the list root. */
		class?: string;
	}

	const internalAlarmScheduler = createCwAlarmScheduler();

	let {
		rows = [],
		alarmScheduler,
		onRowExpire,
		onRowTimeoutReset,
		onRowWithinTimeoutChange,
		rowWithinTimeoutMap = $bindable<Record<string, boolean | null>>({}),
		emptyLabel = 'No detailed readings available yet.',
		class: className = ''
	}: Props = $props();

	onDestroy(() => {
		internalAlarmScheduler.clear();
	});

	const resolvedAlarmScheduler = $derived(alarmScheduler ?? internalAlarmScheduler);

	function updateRowWithinTimeout(rowId: string, nextState: boolean | null) {
		const currentState = rowWithinTimeoutMap[rowId] ?? null;
		if (currentState === nextState) {
			return;
		}

		if (nextState == null) {
			if (!(rowId in rowWithinTimeoutMap)) {
				return;
			}

			const nextMap = { ...rowWithinTimeoutMap };
			delete nextMap[rowId];
			rowWithinTimeoutMap = nextMap;
			return;
		}

		rowWithinTimeoutMap = {
			...rowWithinTimeoutMap,
			[rowId]: nextState
		};
	}

	$effect(() => {
		const activeRowIds = new Set(rows.map((row) => row.id));
		const staleRowIds = Object.keys(rowWithinTimeoutMap).filter((rowId) => !activeRowIds.has(rowId));

		if (staleRowIds.length === 0) {
			return;
		}

		const nextMap = { ...rowWithinTimeoutMap };
		for (const rowId of staleRowIds) {
			delete nextMap[rowId];
		}
		rowWithinTimeoutMap = nextMap;
	});
</script>

{#if rows.length > 0}
	<ul class={['cw-data-list', className]}>
		{#each rows as row (row.id)}
			{@const rowHasFreshness = row.lastSeenAt != null || row.lastUpdated != null}
			<CwCardDataRowItem
				{...row}
				alarmScheduler={resolvedAlarmScheduler}
				onExpire={rowHasFreshness ? () => onRowExpire?.(row) : undefined}
				onTimeoutReset={rowHasFreshness ? () => onRowTimeoutReset?.(row) : undefined}
				onWithinTimeoutChange={
					rowHasFreshness
						? (nextState) => {
								updateRowWithinTimeout(row.id, nextState);
								onRowWithinTimeoutChange?.(row, nextState);
							}
						: undefined
				}
			/>
		{/each}
	</ul>
{:else}
	<p class={['cw-data-list__empty', className]}>{emptyLabel}</p>
{/if}

<style>
	.cw-data-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0;
	}

	.cw-data-list__empty {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		line-height: 1.6;
	}
</style>
