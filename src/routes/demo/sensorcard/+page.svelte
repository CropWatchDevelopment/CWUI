<script lang="ts">
	import {
		CwButton,
		CwCard,
		CwCardDataRowItem,
		CwSensorCard
	} from '$lib/index.js';
	import type { CwStatusDotStatus } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';
	import {
		allLoadingDevices,
		allOfflineDevices,
		cardDataRowListExample,
		collapsedStatusCards,
		researchLabDevices,
		rowPreviewRows,
		sensorArrayDevices,
		sensorCardFreshnessExample,
		sensorCardCustomRowsExample,
		sensorCardMultiDeviceExample,
		sensorCardSingleDeviceExample,
		waterLevelDevice,
		weatherStationDevice
	} from '../_data/cwSensorCardDemoData';

	let demoStatus = $state<CwStatusDotStatus>('online');
	let navigateTarget = $state('');
	let panelEvent = $state('');
	let expireEvent = $state('');
	let deviceWithinTimeoutMap = $state<Record<string, boolean | null>>({});

	const statusSequence: CwStatusDotStatus[] = ['online', 'offline', 'loading', 'warning'];

	const interactiveUpdatedAt = new Date(Date.now() - 120_000);

	const aggregateExamples = [
		{
			label: 'All online',
			title: 'Research Lab',
			status: 'online' as const,
			devices: researchLabDevices
		},
		{
			label: 'Mixed online and offline',
			title: 'Soil Station Array',
			status: 'online' as const,
			devices: sensorArrayDevices
		},
		{
			label: 'All offline',
			title: 'Warehouse B (down)',
			status: 'online' as const,
			devices: allOfflineDevices
		},
		{
			label: 'All loading',
			title: 'Provisioning Bay',
			status: 'loading' as const,
			devices: allLoadingDevices
		}
	];

	function handleNavigate(target: string) {
		navigateTarget = target;
		setTimeout(() => {
			navigateTarget = '';
		}, 2500);
	}

	function handlePanelEvent(action: 'expanded' | 'collapsed', label: string) {
		panelEvent = `${action}: ${label}`;
	}

	function handleExpire(label: string) {
		expireEvent = `expired: ${label}`;
	}

	function cycleStatus() {
		const currentIndex = statusSequence.indexOf(demoStatus);
		demoStatus = statusSequence[(currentIndex + 1) % statusSequence.length];
	}
</script>

<h2>CwSensorCard</h2>
<p class="demo-desc">
	Location card for one or more sensor devices. The expanded details now render with
	<code>CwCardDataRowItem</code>, the card derives default detail rows for you when
	<code>detailRows</code> is omitted, and freshness state can now be observed through
	callbacks or <code>bind:deviceWithinTimeoutMap</code>.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Interactive</span>
		<h3>Single device with derived detail rows</h3>
		<p class="demo-hint">
			This card does not pass <code>detailRows</code>. The detail panel is built from the
			primary reading, secondary reading, and freshness props. The card also exposes panel
			callbacks plus a bindable per-device freshness map.
		</p>
		{#if navigateTarget}
			<p class="demo-event">Last navigation callback: <code>{navigateTarget}</code></p>
		{/if}
		{#if panelEvent}
			<p class="demo-event">Last panel callback: <code>{panelEvent}</code></p>
		{/if}
		{#if expireEvent}
			<p class="demo-event">Last expiry callback: <code>{expireEvent}</code></p>
		{/if}
		<p class="demo-event">
			Freshness map:
			<code>{JSON.stringify(deviceWithinTimeoutMap)}</code>
		</p>
	</div>

	<div class="demo-center">
		<CwSensorCard
			title="Greenhouse A"
			deviceLabel="CW-SS-TMEPNCO2-18"
			status={demoStatus}
			primaryValue={-22.93}
			primaryUnit="°C"
			secondaryValue={79.61}
			secondaryUnit="%"
			lastSeenAt={interactiveUpdatedAt}
			expireAfterMinutes={10}
			onNavigate={handleNavigate}
			onExpand={(label) => handlePanelEvent('expanded', label)}
			onCollapse={(label) => handlePanelEvent('collapsed', label)}
			onExpire={handleExpire}
			bind:deviceWithinTimeoutMap
		/>
	</div>

	<div class="demo-actions">
		<CwButton size="sm" variant="secondary" onclick={cycleStatus}>
			Cycle status ({demoStatus})
		</CwButton>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Shared rows</span>
		<h3>The extracted detail row component</h3>
		<p class="demo-hint">
			These are the same row items <code>CwSensorCard</code> renders internally. Use them
			directly anywhere you want sensor-style key/value rows without the full card shell.
		</p>
	</div>

	<div class="demo-center">
		<CwCard title="Sensor detail rows" subtitle="Rendered with CwCardDataRowItem">
			<ul class="demo-row-list">
				{#each rowPreviewRows as row (row.id)}
					<CwCardDataRowItem {...row} />
				{/each}
			</ul>
		</CwCard>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Aggregate status</span>
		<h3>How device state rolls up</h3>
		<p class="demo-hint">
			The header status is derived from the individual devices. Mixed device states resolve
			to <code>warning</code>, while uniform states stay consistent.
		</p>
	</div>

	<div class="demo-grid">
		{#each aggregateExamples as example (example.title)}
			<div class="demo-card-stack">
				<span class="demo-card-label">{example.label}</span>
				<CwSensorCard title={example.title} status={example.status} devices={example.devices} />
			</div>
		{/each}
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Custom rows</span>
		<h3>Override the default rows when the sensor needs richer metadata</h3>
		<p class="demo-hint">
			Weather stations and tank monitors often need row labels that do not map cleanly to
			the default temperature and humidity assumptions. Pass <code>detailRows</code> only
			for those cases.
		</p>
	</div>

	<div class="demo-grid">
		<CwSensorCard
			title="Weather Station Alpha"
			status="online"
			devices={[weatherStationDevice]}
			defaultExpanded
		/>
		<CwSensorCard
			title="Tank Monitor"
			status="online"
			devices={[waterLevelDevice]}
			defaultExpanded
		/>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Collapsed matrix</span>
		<h3>Compact cards and the empty state</h3>
		<p class="demo-hint">
			Use the shorthand props for single-device cards, or pass no devices at all to show the
			unassigned empty state.
		</p>
	</div>

	<div class="demo-grid">
		{#each collapsedStatusCards as card (card.title)}
			<CwSensorCard
				title={card.title}
				deviceLabel={card.deviceLabel}
				status={card.status}
				primaryValue={card.primaryValue}
				primaryUnit={card.primaryUnit ?? '°C'}
				secondaryValue={card.secondaryValue}
				secondaryUnit={card.secondaryUnit ?? '%'}
				lastSeenAt={card.lastSeenAt}
				expireAfterMinutes={card.expireAfterMinutes}
				defaultExpanded={false}
			/>
		{/each}
		<CwSensorCard title="New Location (unassigned)" status="loading" />
	</div>
</section>

<DemoCodeExample code={sensorCardSingleDeviceExample} title="Single device shorthand" />
<DemoCodeExample code={sensorCardFreshnessExample} title="Callbacks and bindable freshness map" />
<DemoCodeExample code={sensorCardMultiDeviceExample} title="Multiple devices array" />
<DemoCodeExample code={cardDataRowListExample} title="The same detail rows outside the card" />
<DemoCodeExample code={sensorCardCustomRowsExample} title="Custom detailRows for specialized sensors" />

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		margin: 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-desc {
		margin-bottom: var(--cw-space-5);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		line-height: 1.65;
		max-width: 70ch;
	}

	.demo-section {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-6);
		padding: var(--cw-space-4);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-elevated);
	}

	.demo-section__copy {
		display: grid;
		gap: var(--cw-space-2);
		max-width: 72ch;
	}

	.demo-label {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		padding: 0.15rem 0.5rem;
		border-radius: var(--cw-radius-full);
		background: var(--cw-bg-muted);
		color: var(--cw-text-muted);
		font-size: 0.72rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.demo-hint {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		line-height: 1.65;
	}

	.demo-event {
		margin: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-secondary);
	}

	.demo-center {
		display: flex;
		justify-content: center;
	}

	.demo-actions {
		display: flex;
		justify-content: center;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(21rem, 100%), 1fr));
		gap: var(--cw-space-4);
		justify-items: center;
	}

	.demo-card-stack {
		display: grid;
		gap: var(--cw-space-2);
		justify-items: center;
	}

	.demo-card-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.demo-row-list {
		list-style: none;
		margin: 0;
		padding: 0;
		width: min(26rem, 100%);
	}

	:global(.demo-row-list .cw-card-data-row-item:first-child) {
		padding-top: 0;
	}
</style>
