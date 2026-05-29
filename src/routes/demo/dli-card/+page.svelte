<script lang="ts">
	import { DliCard } from "$lib/index.js";
	import type { DliHistoryPoint } from "$lib/index.js";
	import DemoCodeExample from "../_components/DemoCodeExample.svelte";

	type CropName = "Tomato" | "Pepper" | "Lettuce" | "Basil";

	interface DliPreset {
		cropName: CropName;
		value: number;
		targetMin: number;
		targetMax: number;
		max: number;
		history: DliHistoryPoint[];
	}

	const tomatoHistory: DliHistoryPoint[] = [
		{ date: "2026-05-23", value: 18.2 },
		{ date: "2026-05-24", value: 21.5 },
		{ date: "2026-05-25", value: 26.1 },
		{ date: "2026-05-26", value: 24.7 },
		{ date: "2026-05-27", value: 15.9 },
		{ date: "2026-05-28", value: 28.4 },
		{ date: "2026-05-29", value: 30.2 },
	];

	const cropPresets: Record<CropName, DliPreset> = {
		Tomato: {
			cropName: "Tomato",
			value: 24.3,
			targetMin: 20,
			targetMax: 30,
			max: 40,
			history: tomatoHistory,
		},
		Pepper: {
			cropName: "Pepper",
			value: 18.4,
			targetMin: 18,
			targetMax: 26,
			max: 36,
			history: [
				{ date: "2026-05-23", value: 14.8 },
				{ date: "2026-05-24", value: 17.2 },
				{ date: "2026-05-25", value: 18.7 },
				{ date: "2026-05-26", value: 20.6 },
				{ date: "2026-05-27", value: 16.9 },
				{ date: "2026-05-28", value: 19.4 },
				{ date: "2026-05-29", value: 18.4 },
			],
		},
		Lettuce: {
			cropName: "Lettuce",
			value: 12.8,
			targetMin: 12,
			targetMax: 17,
			max: 28,
			history: [
				{ date: "2026-05-23", value: 10.2 },
				{ date: "2026-05-24", value: 12.5 },
				{ date: "2026-05-25", value: 13.1 },
				{ date: "2026-05-26", value: 14.3 },
				{ date: "2026-05-27", value: 11.6 },
				{ date: "2026-05-28", value: 12.2 },
				{ date: "2026-05-29", value: 12.8 },
			],
		},
		Basil: {
			cropName: "Basil",
			value: 8.4,
			targetMin: 15,
			targetMax: 22,
			max: 32,
			history: [
				{ date: "2026-05-23", value: 13.8 },
				{ date: "2026-05-24", value: 15.2 },
				{ date: "2026-05-25", value: 16.4 },
				{ date: "2026-05-26", value: 14.7 },
				{ date: "2026-05-27", value: 12.5 },
				{ date: "2026-05-28", value: 10.1 },
				{ date: "2026-05-29", value: 8.4 },
			],
		},
	};

	const statusExamples = [
		{ label: "Very low", value: 8, targetMin: 20, targetMax: 30 },
		{ label: "Low", value: 15, targetMin: 20, targetMax: 30 },
		{ label: "Slightly low", value: 18, targetMin: 20, targetMax: 30 },
		{ label: "Good", value: 24.3, targetMin: 20, targetMax: 30 },
		{ label: "High", value: 34, targetMin: 20, targetMax: 30 },
		{ label: "Very high", value: 39, targetMin: 20, targetMax: 30 },
	];

	const cropOptions = Object.entries(cropPresets) as [CropName, DliPreset][];

	let selectedCrop = $state<CropName>("Tomato");
	let currentDli = $state(cropPresets.Tomato.value);

	const activePreset = $derived(cropPresets[selectedCrop]);

	function selectCrop(crop: CropName) {
		selectedCrop = crop;
		currentDli = cropPresets[crop].value;
	}

	const dliExample = `<script lang="ts">
\timport { DliCard } from '@cropwatchdevelopment/cwui';

\tconst history = [
\t\t{ date: "2026-05-23", value: 18.2 },
\t\t{ date: "2026-05-24", value: 21.5 },
\t\t{ date: "2026-05-25", value: 26.1 },
\t\t{ date: "2026-05-26", value: 24.7 },
\t\t{ date: "2026-05-27", value: 15.9 },
\t\t{ date: "2026-05-28", value: 28.4 },
\t\t{ date: "2026-05-29", value: 30.2 }
\t];
<\/script>

<DliCard
\tvalue={24.3}
\ttargetMin={20}
\ttargetMax={30}
\tmax={40}
\tcropName="Tomato"
\thistory={history}
/>`;
</script>

<h2>DliCard</h2>
<p class="demo-desc">
	Daily Light Integral card for agricultural dashboards. It presents DLI as a daily total
	against a crop target band, with optional daily bars for recent history.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Crop target range</h3>
		<p class="demo-copy">
			Choose a crop program and adjust today's accumulated DLI. The marker clamps to the scale,
			while the numeric value remains the true reading.
		</p>
	</div>

	<div class="demo-controls">
		<div class="demo-crop-list">
			{#each cropOptions as [crop, preset] (crop)}
				<button
					type="button"
					class="demo-crop-button"
					class:demo-crop-button--active={selectedCrop === crop}
					onclick={() => selectCrop(crop)}
				>
					<span>{crop}</span>
					<small>{preset.targetMin}-{preset.targetMax} mol/m²/day</small>
				</button>
			{/each}
		</div>

		<label class="demo-slider">
			<span class="demo-slider__label">Today's DLI</span>
			<input type="range" min="0" max="46" step="0.1" bind:value={currentDli} />
			<strong>{currentDli.toFixed(1)} mol/m²/day</strong>
		</label>
	</div>

	<DliCard
		value={currentDli}
		targetMin={activePreset.targetMin}
		targetMax={activePreset.targetMax}
		max={activePreset.max}
		cropName={activePreset.cropName}
		history={activePreset.history}
	/>

	<DemoCodeExample code={dliExample} title="DliCard example" />
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Compact status cards</h3>
		<p class="demo-copy">
			Compact mode keeps the same target-range visualization for dense dashboard grids.
		</p>
	</div>

	<div class="demo-status-grid">
		{#each statusExamples as example (example.label)}
			<DliCard
				title={example.label}
				value={example.value}
				targetMin={example.targetMin}
				targetMax={example.targetMax}
				cropName="Tomato"
				compact
			/>
		{/each}
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Without history</h3>
		<p class="demo-copy">
			Omit <code>history</code> when the dashboard tile only needs today's accumulated DLI.
		</p>
	</div>

	<div class="demo-single-card">
		<DliCard
			value={42.6}
			targetMin={20}
			targetMax={30}
			max={40}
			cropName="Tomato"
			title="DLI Today"
		/>
	</div>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Unavailable sensor state</h3>
		<p class="demo-copy">
			Pass localized copy to <code>noData</code> when a sensor or reading is not available.
		</p>
	</div>

	<div class="demo-single-card">
		<DliCard
			value={0}
			noData="The current sensor is not available on your device"
			targetMin={20}
			targetMax={30}
			max={40}
			cropName="Tomato"
			history={tomatoHistory}
		/>
	</div>
</section>

<style>
	h2 {
		margin-bottom: var(--cw-space-2);
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
	}

	h3 {
		margin: 0;
		color: var(--cw-text-primary);
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
	}

	.demo-desc {
		max-width: 68ch;
		margin: 0 0 var(--cw-space-6);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-copy {
		max-width: 64ch;
		margin: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-section {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-8);
	}

	.demo-section__copy {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-controls {
		display: grid;
		gap: var(--cw-space-4);
	}

	.demo-crop-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--cw-space-3);
	}

	.demo-crop-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		padding: 0.9rem 1rem;
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 76%, transparent);
		border-radius: var(--cw-radius-lg);
		background-color: color-mix(in srgb, var(--cw-bg-muted) 58%, var(--cw-bg-surface));
		color: var(--cw-text-primary);
		cursor: pointer;
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
		border-color: color-mix(in srgb, var(--cw-accent) 62%, transparent);
		background-color: color-mix(in srgb, var(--cw-accent) 14%, var(--cw-bg-surface));
		box-shadow: 0 10px 20px color-mix(in srgb, var(--cw-accent) 14%, transparent);
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
		display: grid;
		gap: var(--cw-space-2);
		padding: var(--cw-space-4);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 76%, transparent);
		border-radius: var(--cw-radius-lg);
		background-color: color-mix(in srgb, var(--cw-bg-muted) 45%, var(--cw-bg-surface));
	}

	.demo-slider__label {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
	}

	.demo-slider input {
		width: 100%;
		accent-color: var(--cw-accent);
	}

	.demo-slider strong {
		font-size: var(--cw-text-sm);
		font-variant-numeric: tabular-nums;
	}

	.demo-status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--cw-space-4);
	}

	.demo-single-card {
		max-width: 34rem;
	}

	@media (max-width: 640px) {
		.demo-status-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
