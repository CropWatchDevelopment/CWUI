<script lang="ts">
	import { CwPPFDChart } from '$lib/index.js';
	import type { CwPPFDReading } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	type CropName = 'Lettuce' | 'Strawberry' | 'Basil' | 'Pepper' | 'Tomato';

	interface CropPreset extends CwPPFDReading {
		dliToday: number;
		suggestedCurrent: number;
	}

	const cropPresets: Record<CropName, CropPreset> = {
		Lettuce: {
			plant: 'Lettuce',
			current: 320,
			targetMin: 200,
			targetMax: 400,
			dliToday: 13.8,
			suggestedCurrent: 320
		},
		Strawberry: {
			plant: 'Strawberry',
			current: 520,
			targetMin: 400,
			targetMax: 600,
			dliToday: 18.1,
			suggestedCurrent: 520
		},
		Basil: {
			plant: 'Basil',
			current: 460,
			targetMin: 300,
			targetMax: 600,
			dliToday: 16.5,
			suggestedCurrent: 460
		},
		Pepper: {
			plant: 'Pepper',
			current: 740,
			targetMin: 600,
			targetMax: 1000,
			dliToday: 18.4,
			suggestedCurrent: 740
		},
		Tomato: {
			plant: 'Tomato',
			current: 980,
			targetMin: 700,
			targetMax: 1200,
			dliToday: 24.2,
			suggestedCurrent: 980
		}
	};

	const cropOptions = Object.entries(cropPresets) as [CropName, CropPreset][];
	const fixedScaleTicks = Array.from({ length: 9 }, (_, index) => index * 200);

	let selectedCrop = $state<CropName>('Pepper');
	let currentPpfd = $state(cropPresets.Pepper.suggestedCurrent);
	let updatedAt = $state(Date.now());

	const activePreset = $derived(cropPresets[selectedCrop]);

	function selectCrop(crop: CropName) {
		selectedCrop = crop;
		currentPpfd = cropPresets[crop].suggestedCurrent;
		updatedAt = Date.now();
	}

	const ppfdExample = `<CwPPFDChart
\tplant="Pepper"
\tcurrent={740}
\ttargetMin={600}
\ttargetMax={1000}
\tdliToday={18.4}
/>`;
</script>

<h2>CwPPFDChart</h2>
<p class="demo-desc">
	Horizontal PPFD range gauge for crop lighting targets. It highlights the optimal band and
	shows whether the current reading is low, optimal, or high at a glance.
</p>

<section class="demo-section">
	<h3>Interactive Crop Selection</h3>
	<p class="demo-copy">
		Pick a crop and drag the simulated sensor reading to see the target range, live marker, and
		status update in real time.
	</p>

	<div class="demo-controls">
		<div class="demo-crop-list">
			{#each cropOptions as [crop, preset] (crop)}
				<button
					class="demo-crop-button"
					class:demo-crop-button--active={selectedCrop === crop}
					onclick={() => selectCrop(crop)}
				>
					<span>{crop}</span>
					<small>{preset.targetMin}-{preset.targetMax} µmol/m²/s</small>
				</button>
			{/each}
		</div>

		<label class="demo-slider">
			<span class="demo-slider__label">Sensor PPFD</span>
			<input
				type="range"
				min="0"
				max="1600"
				step="20"
				bind:value={currentPpfd}
				oninput={() => (updatedAt = Date.now())}
			/>
			<strong>{currentPpfd} µmol/m²/s</strong>
		</label>
	</div>

	<CwPPFDChart
		plant={activePreset.plant}
		current={currentPpfd}
		targetMin={activePreset.targetMin}
		targetMax={activePreset.targetMax}
		dliToday={activePreset.dliToday}
		updatedAt={updatedAt}
	/>

	<DemoCodeExample code={ppfdExample} title="CwPPFDChart example" />
</section>

<section class="demo-section">
	<h3>Fixed 0-1600 Scale</h3>
	<p class="demo-copy">
		Use a fixed horticulture scale when you want direct comparison across crops or facilities.
	</p>

	<CwPPFDChart
		plant="Tomato"
		current={1380}
		targetMin={700}
		targetMax={1200}
		dliToday={26.9}
		domainMax={1600}
		ticks={fixedScaleTicks}
		updatedAt={1_710_000_000}
	/>
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin-bottom: var(--cw-space-2);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-6);
	}

	.demo-copy {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		margin: 0 0 var(--cw-space-4);
	}

	.demo-section {
		margin-bottom: var(--cw-space-8);
	}

	.demo-controls {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-5);
	}

	.demo-crop-list {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
	}

	.demo-crop-button {
		align-items: flex-start;
		background: color-mix(in srgb, var(--cw-bg-muted) 56%, var(--cw-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 75%, transparent);
		border-radius: var(--cw-radius-xl);
		color: var(--cw-text-primary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.9rem 1rem;
		text-align: left;
		transition:
			transform var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.demo-crop-button:hover {
		transform: translateY(-1px);
	}

	.demo-crop-button--active {
		background: color-mix(in srgb, var(--cw-accent) 16%, var(--cw-bg-elevated));
		border-color: color-mix(in srgb, var(--cw-accent) 60%, transparent);
		box-shadow: 0 12px 22px color-mix(in srgb, var(--cw-accent) 16%, transparent);
	}

	.demo-crop-button span {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
	}

	.demo-crop-button small {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
	}

	.demo-slider {
		background: color-mix(in srgb, var(--cw-bg-muted) 44%, var(--cw-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 75%, transparent);
		border-radius: var(--cw-radius-xl);
		display: grid;
		gap: var(--cw-space-2);
		padding: var(--cw-space-4);
	}

	.demo-slider__label {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.demo-slider input {
		accent-color: var(--cw-accent);
		width: 100%;
	}

	.demo-slider strong {
		font-size: var(--cw-text-sm);
		font-variant-numeric: tabular-nums;
	}
</style>
