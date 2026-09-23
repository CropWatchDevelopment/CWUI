<script lang="ts">
	import {
		CwButton,
		CwCard,
		CwDataList,
		CwLocationCard,
		CwSensorCard
	} from '$lib/index.js';
	import type { CwSensorCardData, CwStatusDotStatus } from '$lib/index.js';
	import { buildCwSensorCardDetailRows } from '$lib/components/cwSensorCardRows.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';
	import {
		allLoadingDevices,
		allOfflineDevices,
		collapsedStatusCards,
		dataListExample,
		researchLabDevices,
		rowPreviewRows,
		sensorArrayDevices,
		sensorCardCustomRowsExample,
		sensorCardFreshnessExample,
		sensorCardMultiDeviceExample,
		sensorCardSingleDeviceExample,
		waterLevelDevice,
		weatherStationDevice
	} from '../_data/cwSensorCardDemoData';

	let demoStatus = $state<CwStatusDotStatus>('online');
	// Three hours ago — older than the 30-minute expiry used in the stale example.
	const staleLastSeen = new Date(Date.now() - 3 * 60 * 60 * 1000);
	let navigateTarget = $state('');
	let panelEvent = $state('');
	let expireEvent = $state('');
	let sensorWithinTimeout = $state<boolean | null>(null);
	let rowWithinTimeoutMap = $state<Record<string, boolean | null>>({});
	let demoHasError = $state<string | null>('I2C read failed (no ACK from 0x44)');

	const statusSequence: CwStatusDotStatus[] = ['online', 'offline', 'loading', 'warning'];
	const interactiveUpdatedAt = new Date(Date.now() - 120_000);

	const aggregateExamples = [
		{
			label: 'All online',
			title: 'Research Lab',
			fallbackStatus: 'online' as const,
			sensors: researchLabDevices
		},
		{
			label: 'Mixed online and offline',
			title: 'Soil Station Array',
			fallbackStatus: 'online' as const,
			sensors: sensorArrayDevices
		},
		{
			label: 'All offline',
			title: 'Warehouse B (down)',
			fallbackStatus: 'online' as const,
			sensors: allOfflineDevices
		},
		{
			label: 'All loading',
			title: 'Provisioning Bay',
			fallbackStatus: 'loading' as const,
			sensors: allLoadingDevices
		}
	];

	function resolveRows(sensor: CwSensorCardData) {
		return sensor.detailRows ?? buildCwSensorCardDetailRows(sensor);
	}

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
	Sensor cards are built by composition, from three components: <code>CwLocationCard</code> owns the location
	shell, <code>CwSensorCard</code> owns a single expandable sensor panel, and
	<code>CwDataList</code> renders the detail rows. Nested cards stay reactive when the parent
	updates their props, and the location header rolls up the status of every sensor inside it.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Interactive</span>
		<h3>One location shell, one sensor panel, one data list</h3>
		<p class="demo-hint">
			The outer location card reacts to the nested sensor status automatically. The sensor
			panel exposes expand/collapse and freshness callbacks without taking ownership of the
			input data.
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
			Sensor freshness:
			<code>{sensorWithinTimeout === null ? 'no timer' : sensorWithinTimeout ? 'within timeout' : 'expired'}</code>
		</p>
		<p class="demo-event">
			Row freshness map:
			<code>{JSON.stringify(rowWithinTimeoutMap)}</code>
		</p>
	</div>

	<div class="demo-center">
		<CwLocationCard title="Greenhouse A" onNavigate={handleNavigate}>
			<CwSensorCard
				label="CW-SS-TMEPNCO2-18"
				status={demoStatus}
				primaryValue={-22.93}
				primaryUnit="°C"
				primary_icon="thermo"
				secondaryValue={79.61}
				secondaryUnit="%"
				secondary_icon="drop"
				lastSeenAt={interactiveUpdatedAt}
				expireAfterMinutes={10}
				defaultExpanded
				onExpand={(label) => handlePanelEvent('expanded', label)}
				onCollapse={(label) => handlePanelEvent('collapsed', label)}
				onExpire={handleExpire}
				bind:withinTimeout={sensorWithinTimeout}
			>
				<CwDataList
					rows={[
						{
							id: 'interactive-temp',
							label: 'Temperature',
							value: '-22.93',
							unit: '°C',
							icon: 'thermo'
						},
						{
							id: 'interactive-humidity',
							label: 'Humidity',
							value: '79.61',
							unit: '%',
							icon: 'drop'
						},
						{
							id: 'interactive-updated',
							label: 'Last Update',
							icon: 'timer',
							lastSeenAt: interactiveUpdatedAt,
							expireAfterMinutes: 10
						}
					]}
					bind:rowWithinTimeoutMap
				/>

				<CwButton
					variant="secondary"
					size="sm"
					fullWidth
					onclick={() => handleNavigate('device-detail:CW-SS-TMEPNCO2-18')}
				>
					View Device Details
				</CwButton>
			</CwSensorCard>
		</CwLocationCard>
	</div>

	<div class="demo-actions">
		<CwButton size="sm" variant="secondary" onclick={cycleStatus}>
			Cycle sensor status ({demoStatus})
		</CwButton>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Error state</span>
		<h3>Surface a hardware fault with the <code>hasError</code> attribute</h3>
		<p class="demo-hint">
			Setting <code>hasError</code> hides the normal primary/secondary readings and shows a
			pulsing red error badge in their place, so a fault is impossible to miss. The string you
			pass becomes the badge text — pass a localized message (<code>true</code> falls back to a
			generic <strong>SENSOR ERROR</strong>).
		</p>
	</div>

	<div class="demo-center">
		<CwLocationCard title="Greenhouse C">
			<CwSensorCard
				label="CW-Sensor-042"
				status="warning"
				hasError={demoHasError}
				primaryValue={-5.1}
				primaryUnit="°C"
				primary_icon="thermo"
				secondaryValue={88.0}
				secondaryUnit="%"
				secondary_icon="drop"
			>
				<CwDataList
					rows={[
						{ id: 'err-temp', label: 'Temperature', value: '-5.10', unit: '°C', icon: 'thermo' },
						{ id: 'err-humidity', label: 'Humidity', value: '88.00', unit: '%', icon: 'drop' }
					]}
				/>
			</CwSensorCard>
		</CwLocationCard>
	</div>

	<div class="demo-actions">
		<CwButton
			size="sm"
			variant="secondary"
			onclick={() =>
				(demoHasError = demoHasError ? null : 'I2C read failed (no ACK from 0x44)')}
		>
			{demoHasError ? 'Clear error' : 'Trigger error'}
		</CwButton>
	</div>
</section>

<section class="demo-section" id="data-list">
	<div class="demo-section__copy">
		<span class="demo-label">CwDataList</span>
		<h3>The extracted detail-list component</h3>
		<p class="demo-hint">
			Use <code>CwDataList</code> for the standard sensor detail rows inside an expanded
			panel, or anywhere else you need the same metadata layout.
		</p>
	</div>

	<div class="demo-center">
		<CwCard title="Sensor detail rows" subtitle="Rendered with CwDataList">
			<CwDataList rows={rowPreviewRows} />
		</CwCard>
	</div>
</section>

<section class="demo-section" id="location-card">
	<div class="demo-section__copy">
		<span class="demo-label">CwLocationCard · aggregate status</span>
		<h3>Nested sensor panels roll up to the location header</h3>
		<p class="demo-hint">
			The location shell now derives its own header status from the sensor cards rendered
			inside it. Mixed sensor states resolve to <code>warning</code>.
		</p>
	</div>

	<div class="demo-grid">
		{#each aggregateExamples as example (example.title)}
			<div class="demo-card-stack">
				<span class="demo-card-label">{example.label}</span>
				<CwLocationCard title={example.title} status={example.fallbackStatus}>
					{#each example.sensors as sensor (sensor.label)}
						<CwSensorCard
							label={sensor.label}
							status={sensor.status ?? example.fallbackStatus}
							primaryValue={sensor.primaryValue}
							primaryUnit={sensor.primaryUnit ?? '°C'}
							primary_icon={sensor.primary_icon}
							secondaryValue={sensor.secondaryValue}
							secondaryUnit={sensor.secondaryUnit ?? '%'}
							secondary_icon={sensor.secondary_icon}
							lastSeenAt={sensor.lastSeenAt}
							expireAfterMinutes={sensor.expireAfterMinutes}
						>
							<CwDataList rows={resolveRows(sensor)} />
						</CwSensorCard>
					{/each}
				</CwLocationCard>
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
			the default temperature and humidity assumptions. That is where passing explicit
			<code>detailRows</code> into <code>CwDataList</code> pays off.
		</p>
	</div>

	<div class="demo-grid">
		<CwLocationCard title="Weather Station Alpha">
			<CwSensorCard
				label={weatherStationDevice.label}
				status={weatherStationDevice.status ?? 'online'}
				primaryValue={weatherStationDevice.primaryValue}
				primaryUnit={weatherStationDevice.primaryUnit ?? '°C'}
				primary_icon={weatherStationDevice.primary_icon}
				secondaryValue={weatherStationDevice.secondaryValue}
				secondaryUnit={weatherStationDevice.secondaryUnit ?? '%'}
				secondary_icon={weatherStationDevice.secondary_icon}
				lastSeenAt={weatherStationDevice.lastSeenAt}
				expireAfterMinutes={weatherStationDevice.expireAfterMinutes}
				defaultExpanded
			>
				<CwDataList rows={weatherStationDevice.detailRows} />
			</CwSensorCard>
		</CwLocationCard>

		<CwLocationCard title="Tank Monitor">
			<CwSensorCard
				label={waterLevelDevice.label}
				status={waterLevelDevice.status ?? 'online'}
				primaryValue={waterLevelDevice.primaryValue}
				primaryUnit={waterLevelDevice.primaryUnit ?? '%'}
				primary_icon={waterLevelDevice.primary_icon}
				secondaryValue={waterLevelDevice.secondaryValue}
				secondaryUnit={waterLevelDevice.secondaryUnit}
				secondary_icon={waterLevelDevice.secondary_icon}
				lastSeenAt={waterLevelDevice.lastSeenAt}
				expireAfterMinutes={waterLevelDevice.expireAfterMinutes}
				defaultExpanded
			>
				<CwDataList rows={waterLevelDevice.detailRows} />
			</CwSensorCard>
		</CwLocationCard>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Collapsed matrix</span>
		<h3>Compact cards and the empty state</h3>
		<p class="demo-hint">
			Short sensor panels stay compact by default, and an empty location card now stands on
			its own without pretending to be a sensor panel.
		</p>
	</div>

	<div class="demo-grid">
		{#each collapsedStatusCards as card (card.title)}
			<CwLocationCard title={card.title}>
				<CwSensorCard
					label={card.deviceLabel}
					status={card.status}
					primaryValue={card.primaryValue}
					primaryUnit={card.primaryUnit ?? '°C'}
					secondaryValue={card.secondaryValue}
					secondaryUnit={card.secondaryUnit ?? '%'}
					lastSeenAt={card.lastSeenAt}
					expireAfterMinutes={card.expireAfterMinutes}
				>
					<CwDataList
						rows={resolveRows({
							label: card.deviceLabel,
							primaryValue: card.primaryValue,
							primaryUnit: card.primaryUnit ?? '°C',
							secondaryValue: card.secondaryValue,
							secondaryUnit: card.secondaryUnit ?? '%',
							status: card.status,
							lastSeenAt: card.lastSeenAt,
							expireAfterMinutes: card.expireAfterMinutes
						})}
					/>
				</CwSensorCard>
			</CwLocationCard>
		{/each}

		<CwLocationCard title="New Location (unassigned)" status="loading" />
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">States &amp; localisation</span>
		<h3>Loading, stale readings and translated labels</h3>
		<p class="demo-hint">
			<code>loading</code> shows skeleton readings. When <code>lastSeenAt</code> is older than
			<code>expireAfterMinutes</code>, the readings dim and a “Last seen … ago” line appears.
			Every visible string can be replaced through <code>labels</code>.
		</p>
	</div>

	<div class="demo-grid">
		<CwLocationCard title="Loading">
			<CwSensorCard label="CW-AIR-001" loading primaryUnit="°C" secondaryUnit="%" />
		</CwLocationCard>

		<CwLocationCard title="Stale reading">
			<CwSensorCard
				label="CW-AIR-002"
				status="online"
				primaryValue={21.4}
				primaryUnit="°C"
				secondaryValue={63}
				secondaryUnit="%"
				lastSeenAt={staleLastSeen}
				expireAfterMinutes={30}
			/>
		</CwLocationCard>

		<CwLocationCard
			title="温室 B"
			status="warning"
			labels={{ online: 'オンライン', offline: 'オフライン', warning: '警告', loading: '読み込み中', viewLocation: '場所を表示' }}
		>
			<CwSensorCard
				label="CW-AIR-003"
				status="warning"
				primaryValue={null}
				primaryUnit="°C"
				secondaryValue={71}
				secondaryUnit="%"
				labels={{ details: '詳細', noDetails: '詳細データはまだありません。', noValue: '—', lastSeen: '最終受信', ago: '前' }}
			/>
		</CwLocationCard>
	</div>
</section>

<DemoCodeExample code={sensorCardSingleDeviceExample} title="Single sensor inside a location card" />
<DemoCodeExample
	code={sensorCardFreshnessExample}
	title="Callbacks and bindable sensor freshness"
/>
<DemoCodeExample code={sensorCardMultiDeviceExample} title="Composed location with multiple sensors" />
<DemoCodeExample code={dataListExample} title="Sensor details with CwDataList" />
<DemoCodeExample code={sensorCardCustomRowsExample} title="Custom rows for specialized sensors" />

<style>

	.demo-section__copy {
		display: grid;
		gap: var(--cw-space-2);
		max-width: 72ch;
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
		width: 100%;
	}

	.demo-card-label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
