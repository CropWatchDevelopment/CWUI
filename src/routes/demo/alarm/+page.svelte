<script lang="ts">
	import { onDestroy } from 'svelte';
	import { CwButton, createCwAlarmScheduler } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const alarm = createCwAlarmScheduler();

	let activeAlarms = $state(0);
	let firedCount = $state(0);
	let lastEvent = $state('No alarms fired yet.');
	let events = $state<string[]>([]);

	function syncActiveCount() {
		activeAlarms = alarm.size;
	}

	function addEvent(message: string) {
		const stamp = new Date().toLocaleTimeString();
		events = [`${stamp} - ${message}`, ...events].slice(0, 10);
	}

	function scheduleInSeconds(seconds: number, label: string) {
		const dueAt = new Date(Date.now() + seconds * 1000);

		alarm.schedule({
			from: Date.now(),
			alarmAfterMs: seconds * 1000,
			callback: () => {
				firedCount += 1;
				lastEvent = `${label} fired at ${new Date().toLocaleTimeString()}`;
				addEvent(`${label} fired.`);
				syncActiveCount();
			}
		});

		addEvent(`Scheduled "${label}" for ${dueAt.toLocaleTimeString()}.`);
		syncActiveCount();
	}

	function scheduleUsingMinutes() {
		const start = new Date();
		const offsetMinutes = 0.25;

		alarm.schedule({
			from: start,
			alarmAfterMinutes: offsetMinutes,
			callback: () => {
				firedCount += 1;
				lastEvent = `Minutes-based alarm fired at ${new Date().toLocaleTimeString()}`;
				addEvent('Minutes-based alarm fired.');
				syncActiveCount();
			}
		});

		addEvent(`Scheduled minutes-based alarm from ${start.toLocaleTimeString()} (+${offsetMinutes}m).`);
		syncActiveCount();
	}

	function scheduleBulk(total = 1000) {
		const base = Date.now();

		for (let i = 0; i < total; i++) {
			alarm.schedule({
				id: `demo-bulk-${i}`,
				from: base,
				alarmAfterMs: 1000 + (i % 40) * 250,
				callback: () => {
					firedCount += 1;
					if (firedCount % 100 === 0 || alarm.size === 0) {
						addEvent(`Bulk progress: ${firedCount} total callbacks fired.`);
					}
					syncActiveCount();
					if (alarm.size === 0) {
						lastEvent = `Bulk run completed at ${new Date().toLocaleTimeString()}`;
					}
				}
			});
		}

		addEvent(`Scheduled ${total} alarms across ~11 seconds.`);
		syncActiveCount();
	}

	function clearAll() {
		alarm.clear();
		syncActiveCount();
		addEvent('Cleared all active alarms.');
	}

	onDestroy(() => {
		alarm.clear();
	});

	const SCRIPT_CLOSE = '</' + 'script>';

	const starterExample = `<script lang="ts">
	import { onDestroy } from 'svelte';
	import { CwButton, createCwAlarmScheduler } from '@cropwatchdevelopment/cwui';

	// 1) Create one scheduler instance for this component/module.
	//    It can efficiently manage many alarms with one internal timer.
	const alarms = createCwAlarmScheduler();

	// 2) Local state for UI feedback.
	let activeCount = $state(0);
	let status = $state('No alarm fired yet.');

	function scheduleInSeconds(seconds: number, label: string) {
		// 3) Schedule an alarm from "now" + offset.
		//    "from" accepts Date | ISO string | epoch milliseconds.
		alarms.schedule({
			from: Date.now(),
			alarmAfterMs: seconds * 1000,
			callback: () => {
				status = label + ' fired at ' + new Date().toLocaleTimeString();
				activeCount = alarms.size;
			}
		});

		activeCount = alarms.size;
	}

	function scheduleFromTimestamp() {
		// Optional "duration style" usage like CwDuration:
		// alarm = from + alarmAfterMinutes
		alarms.schedule({
			from: new Date('2026-02-23T12:00:00Z'),
			alarmAfterMinutes: 15,
			callback: () => {
				status = '15-minute alarm fired';
				activeCount = alarms.size;
			}
		});

		activeCount = alarms.size;
	}

	function clearAlarms() {
		alarms.clear();
		activeCount = alarms.size;
	}

	// 4) Always clean up on destroy so no timers remain active.
	onDestroy(() => {
		alarms.clear();
	});
${SCRIPT_CLOSE}

<CwButton onclick={() => scheduleInSeconds(10, 'Irrigation check')}>
	Alarm in 10s
</CwButton>
<CwButton variant="secondary" onclick={scheduleFromTimestamp}>
	From timestamp (+15m)
</CwButton>
<CwButton variant="danger" onclick={clearAlarms}>
	Clear alarms
</CwButton>

<p>{status}</p>
<p>Active alarms: {activeCount}</p>`;

	const contextExample = `// src/routes/+layout.svelte
<script lang="ts">
	import { createCwAlarmContext } from '@cropwatchdevelopment/cwui';

	// Create once at the root so all child routes/components can share it.
	createCwAlarmContext();
${SCRIPT_CLOSE}

<slot />

// src/routes/devices/+page.svelte
<script lang="ts">
	import { CwButton, useCwAlarm } from '@cropwatchdevelopment/cwui';

	const alarms = useCwAlarm();

	function watchDevice(deviceId: string) {
		// Stable id means re-scheduling replaces the previous alarm for this device.
		alarms.schedule({
			id: 'device-' + deviceId,
			from: Date.now(),
			alarmAfterMinutes: 30,
			callback: () => {
				console.log('Device ' + deviceId + ' has been silent for 30 minutes.');
			}
		});
	}
${SCRIPT_CLOSE}

<CwButton onclick={() => watchDevice('sensor-12')}>
	Start 30-minute watchdog
</CwButton>`;
</script>

<h2>CwAlarm Scheduler</h2>
<p class="demo-desc">
	Non-visual alarm control for TypeScript app logic. Pass a datetime plus an alarm offset, then run a callback when due.
</p>

<div class="demo-grid">
	<section class="demo-card">
		<h3>Live demo</h3>
		<p class="demo-card__desc">
			These buttons use the same API you will call in your app context or TypeScript modules.
		</p>

		<div class="demo-row">
			<CwButton onclick={() => scheduleInSeconds(5, '5-second alarm')}>
				Alarm in 5s
			</CwButton>
			<CwButton variant="secondary" onclick={() => scheduleInSeconds(12, '12-second alarm')}>
				Alarm in 12s
			</CwButton>
			<CwButton variant="ghost" onclick={scheduleUsingMinutes}>
				Alarm in 0.25m
			</CwButton>
		</div>

		<div class="demo-row">
			<CwButton variant="secondary" onclick={() => scheduleBulk(1000)}>
				Schedule 1000 alarms
			</CwButton>
			<CwButton variant="danger" onclick={clearAll}>
				Clear active alarms
			</CwButton>
		</div>
	</section>

	<section class="demo-card demo-card--stats">
		<h3>Runtime state</h3>
		<p><strong>Active alarms:</strong> {activeAlarms}</p>
		<p><strong>Total fired callbacks:</strong> {firedCount}</p>
		<p><strong>Last event:</strong> {lastEvent}</p>

		<ul class="demo-log">
			{#if events.length === 0}
				<li>No events yet.</li>
			{:else}
				{#each events as event (event)}
					<li>{event}</li>
				{/each}
			{/if}
		</ul>
	</section>
</div>

<section class="demo-section">
	<h3>Copy-paste starter (single file)</h3>
	<p class="demo-desc">Start here if your alarms live inside one component or one TypeScript module.</p>
	<DemoCodeExample code={starterExample} title="CwAlarm starter example" />
</section>

<section class="demo-section">
	<h3>App context setup (recommended for apps)</h3>
	<p class="demo-desc">Use this pattern when many screens/components need one shared scheduler instance.</p>
	<DemoCodeExample code={contextExample} title="CwAlarm app-context example" />
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin-bottom: var(--cw-space-2);
		color: var(--cw-text-secondary);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--cw-space-4);
	}

	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}

	.demo-card__desc {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
	}

	.demo-card--stats p {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.demo-log {
		margin: var(--cw-space-1) 0 0;
		padding-left: var(--cw-space-4);
		display: grid;
		gap: var(--cw-space-1);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.demo-section {
		margin-top: var(--cw-space-6);
	}
</style>
