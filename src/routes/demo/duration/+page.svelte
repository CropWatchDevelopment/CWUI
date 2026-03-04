<script lang="ts">
	import { CwDuration } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const now = new Date();
	const tenSec = new Date(now.getTime() - 10 * 1000);
	const fiveMin = new Date(now.getTime() - 5 * 60 * 1000);
	const threeHr = new Date(now.getTime() - 3 * 60 * 60 * 1000);
	const twoDays = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
	const oneMinCountdown = new Date(now.getTime() + 60 * 1000);
	const alarmStart = new Date();
	let alarmFireCount = $state(0);
	const durationExample = `<CwDuration
\tfrom={new Date(Date.now() + 60 * 1000)}
\tcountDown={true}
/>

let alarmFireCount = $state(0);
<CwDuration
\tfrom={new Date()}
\talarmAfterMinutes={1}
\talarmCallback={() => (alarmFireCount += 1)}
/>
`;
</script>

<h2>CwDuration</h2>
<p class="demo-desc">Live-ticking duration from a timestamp with adaptive formatting and optional countdown mode.</p>

<div class="demo-grid">
	<div class="demo-card">
		<span class="demo-label">&lt; 1 minute</span>
		<CwDuration from={tenSec} />
	</div>
	<div class="demo-card">
		<span class="demo-label">&lt; 1 hour</span>
		<CwDuration from={fiveMin} />
	</div>
	<div class="demo-card">
		<span class="demo-label">&lt; 1 day</span>
		<CwDuration from={threeHr} />
	</div>
	<div class="demo-card">
		<span class="demo-label">&ge; 1 day</span>
		<CwDuration from={twoDays} />
	</div>
	<div class="demo-card">
		<span class="demo-label">Countdown to zero (1 minute)</span>
		<CwDuration from={oneMinCountdown} countDown={true} />
	</div>
	<div class="demo-card demo-card--alarm">
		<div class="demo-card__alarm-head">
			<span class="demo-label">Alarm every 1 minute</span>
			{#if alarmFireCount > 0}
				<span class="demo-alarm-mark" aria-label="Alarm triggered">!</span>
			{/if}
		</div>
		<CwDuration
			from={alarmStart}
			alarmAfterMinutes={1}
			alarmCallback={() => (alarmFireCount += 1)}
		/>
		<span class="demo-label">Fired: {alarmFireCount}</span>
	</div>
</div>

<DemoCodeExample code={durationExample} title="CwDuration example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--cw-space-4); }
	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-2);
		padding: var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}
	.demo-label { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.demo-card__alarm-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.demo-alarm-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-danger-500) 25%, transparent);
		color: var(--cw-danger-500);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-bold);
		line-height: 1;
	}
</style>
