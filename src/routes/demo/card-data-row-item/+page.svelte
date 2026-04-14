<script lang="ts">
	import { CwCard, CwCardDataRowItem } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';
	import {
		cardDataRowCustomIconExample,
		cardDataRowListExample,
		cardDataRowTimeoutExample,
		rowPreviewRows
	} from '../_data/cwSensorCardDemoData';

	let alarmMessage = $state('');
	let rowWithinTimeout = $state<boolean | null>(null);

	const liveTimerStart = new Date(Date.now() - 4_000);

	function handleAlarm() {
		alarmMessage = 'Alarm callback fired for the live timer row.';
		setTimeout(() => {
			alarmMessage = '';
		}, 2500);
	}
</script>

<h2>CwCardDataRowItem</h2>
<p class="demo-desc">
	Reusable sensor-style key/value row for detail panels, cards, and metadata lists. This is the
	same component used inside <code>CwSensorCard</code>, now with built-in freshness scheduling
	and a bindable timeout state.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Standard list</span>
		<h3>Use it inside a semantic list container</h3>
		<p class="demo-hint">
			The component renders a list item, so wrap it with <code>ul</code> or <code>ol</code>
			when you use it standalone.
		</p>
	</div>

	<div class="demo-center">
		<CwCard title="Device detail rows" subtitle="Standalone CwCardDataRowItem usage">
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
		<span class="demo-label">Live duration</span>
		<h3>Built-in freshness scheduler with bindable state</h3>
		<p class="demo-hint">
			Use <code>lastSeenAt</code> plus <code>expireAfterMinutes</code> to turn the row into a
			freshness monitor. The row now schedules expiry internally and exposes both
			<code>onExpire</code> and <code>bind:withinTimeout</code>.
		</p>
		{#if alarmMessage}
			<p class="demo-event">{alarmMessage}</p>
		{/if}
		<p class="demo-event">
			Current freshness state:
			<code>{rowWithinTimeout === null ? 'no timer' : rowWithinTimeout ? 'within timeout' : 'expired'}</code>
		</p>
	</div>

	<div class="demo-center">
		<CwCard title="Freshness monitor" subtitle="Alarm fires a few seconds after load">
			<ul class="demo-row-list">
				<CwCardDataRowItem
					id="live-last-update"
					label="Last Update"
					icon="timer"
					lastSeenAt={liveTimerStart}
					expireAfterMinutes={0.1}
					onExpire={handleAlarm}
					bind:withinTimeout={rowWithinTimeout}
				/>
			</ul>
		</CwCard>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<span class="demo-label">Flexible icons</span>
		<h3>Built-ins, emoji, or snippets all work</h3>
		<p class="demo-hint">
			Use <code>thermo</code>, <code>drop</code>, or <code>timer</code> for the built-in SVGs,
			or pass a plain string like an emoji for one-off metadata rows.
		</p>
	</div>

	<div class="demo-center">
		<CwCard title="Mixed metadata" subtitle="Custom icon content">
			<ul class="demo-row-list">
				<CwCardDataRowItem
					id="relay-state"
					label="Relay State"
					value="On"
					icon="⚡"
				/>
				<CwCardDataRowItem
					id="lux"
					label="Lux Level"
					value="48500"
					unit="lx"
					icon="☀️"
				/>
			</ul>
		</CwCard>
	</div>
</section>

<DemoCodeExample code={cardDataRowListExample} title="List of built-in sensor rows" />
<DemoCodeExample code={cardDataRowTimeoutExample} title="Freshness row with bindable timeout state" />
<DemoCodeExample code={cardDataRowCustomIconExample} title="Custom icon row" />

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
		max-width: 68ch;
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
		max-width: 70ch;
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

	.demo-hint,
	.demo-event {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		line-height: 1.65;
	}

	.demo-center {
		display: flex;
		justify-content: center;
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
