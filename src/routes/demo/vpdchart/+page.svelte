<script lang="ts">
	import { CwVPDChart } from '$lib/index.js';
	import type { CwVPDReading, CwVPDStageBand } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	type ScenarioName =
		| 'Clone Dome'
		| 'Leafy Greens'
		| 'Basil Push'
		| 'Tomato Flower'
		| 'Pepper Finish';

	interface VpdScenario extends CwVPDReading {
		airTemperatureC: number;
		relativeHumidity: number;
		leafTemperatureC?: number;
		note: string;
	}

	const scenarios: Record<ScenarioName, VpdScenario> = {
		'Clone Dome': {
			plant: 'Propagation tray',
			growthStage: 'Clone dome',
			targetMin: 0.5,
			targetMax: 0.7,
			airTemperatureC: 23,
			relativeHumidity: 78,
			leafTemperatureC: 22.4,
			note: 'High humidity keeps fresh cuts from crashing while roots establish.'
		},
		'Leafy Greens': {
			plant: 'Lettuce',
			growthStage: 'Early veg',
			targetMin: 0.6,
			targetMax: 0.9,
			airTemperatureC: 22,
			relativeHumidity: 70,
			leafTemperatureC: 21.5,
			note: 'Keep transpiration moving without forcing young leaves too hard.'
		},
		'Basil Push': {
			plant: 'Basil',
			growthStage: 'Late veg',
			targetMin: 0.8,
			targetMax: 1.1,
			airTemperatureC: 25,
			relativeHumidity: 66,
			leafTemperatureC: 24.3,
			note: 'A slightly drier room speeds nutrient pull and stack density.'
		},
		'Tomato Flower': {
			plant: 'Tomato',
			growthStage: 'Flower set',
			targetMin: 1.0,
			targetMax: 1.3,
			airTemperatureC: 27,
			relativeHumidity: 60,
			leafTemperatureC: 26.1,
			note: 'Generative steering favors a firmer VPD window during flower set.'
		},
		'Pepper Finish': {
			plant: 'Pepper',
			growthStage: 'Late fruiting',
			targetMin: 1.1,
			targetMax: 1.4,
			airTemperatureC: 28,
			relativeHumidity: 58,
			leafTemperatureC: 27.2,
			note: 'Finishing rooms often run drier to protect fruit quality and disease pressure.'
		}
	};

	const customBands: CwVPDStageBand[] = [
		{ label: 'Clone / Rooting', min: 0, max: 0.75, tone: 'humid' },
		{ label: 'Vegetative', min: 0.75, max: 1.15, tone: 'balanced' },
		{ label: 'Generative', min: 1.15, max: 1.6, tone: 'flower' }
	];

	const temperatureValuesC = Array.from({ length: 19 }, (_, index) => index + 17);
	const humidityValues = Array.from({ length: 13 }, (_, index) => 35 + index * 5);

	function calculateRoomVpd(tempC: number, humidity: number): number {
		const saturationVaporPressure = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
		return saturationVaporPressure * (1 - humidity / 100);
	}

	function toFahrenheit(tempC: number): number {
		return Math.round(tempC * (9 / 5) + 32);
	}

	const scenarioOptions = Object.entries(scenarios) as [ScenarioName, VpdScenario][];

	let selectedScenario = $state<ScenarioName>('Tomato Flower');
	let roomTemperatureC = $state(scenarios['Tomato Flower'].airTemperatureC);
	let humidity = $state(scenarios['Tomato Flower'].relativeHumidity);
	let updatedAt = $state(Date.now());

	const activeScenario = $derived(scenarios[selectedScenario]);
	const currentRoomVpd = $derived.by(() => calculateRoomVpd(roomTemperatureC, humidity));

	function selectScenario(name: ScenarioName) {
		selectedScenario = name;
		roomTemperatureC = scenarios[name].airTemperatureC;
		humidity = scenarios[name].relativeHumidity;
		updatedAt = Date.now();
	}

	const vpdExample = `<CwVPDChart
\tplant="Tomato"
\tgrowthStage="Flower set"
\ttargetMin={1.0}
\ttargetMax={1.3}
\tairTemperatureC={27}
\trelativeHumidity={60}
\tupdatedAt={Date.now()}
/>`;
</script>

<h2>CwVPDChart</h2>
<p class="demo-desc">
	A real VPD chart is a room-climate matrix. It plots temperature against relative humidity,
	uses agriculture-style low-to-high VPD coloring, and overlays the active grow-program target
	inside that grid.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Interactive room-climate control</h3>
		<p class="demo-copy">
			Pick a crop program, then change room temperature and RH. The chart recalculates the full
			matrix, keeps the familiar blue-to-green-to-red VPD palette intact, and shows whether the
			selected target band is being hit.
		</p>
	</div>

	<div class="demo-scenario-list">
		{#each scenarioOptions as [name, scenario] (name)}
			<button
				type="button"
				class={[
					'demo-scenario-button',
					selectedScenario === name && 'demo-scenario-button--active'
				]}
				onclick={() => selectScenario(name)}
			>
				<span>{name}</span>
				<small>{scenario.targetMin.toFixed(1)}-{scenario.targetMax.toFixed(1)} kPa</small>
			</button>
		{/each}
	</div>

	<div class="demo-controls">
		<label class="demo-slider">
			<span class="demo-slider__label">Room temperature</span>
			<input
				type="range"
				min="17"
				max="35"
				step="0.5"
				bind:value={roomTemperatureC}
				oninput={() => (updatedAt = Date.now())}
			/>
			<strong>{roomTemperatureC.toFixed(1)}°C / {toFahrenheit(roomTemperatureC)}°F</strong>
		</label>

		<label class="demo-slider">
			<span class="demo-slider__label">Relative humidity</span>
			<input
				type="range"
				min="35"
				max="95"
				step="1"
				bind:value={humidity}
				oninput={() => (updatedAt = Date.now())}
			/>
			<strong>{humidity.toFixed(0)}% RH</strong>
		</label>

		<div class="demo-live-card">
			<span class="demo-live-card__label">Derived room VPD</span>
			<strong>{currentRoomVpd.toFixed(2)} kPa</strong>
			<p>{activeScenario.note}</p>
		</div>
	</div>

	<CwVPDChart
		plant={activeScenario.plant}
		growthStage={activeScenario.growthStage}
		targetMin={activeScenario.targetMin}
		targetMax={activeScenario.targetMax}
		airTemperatureC={roomTemperatureC}
		leafTemperatureC={activeScenario.leafTemperatureC}
		relativeHumidity={humidity}
		temperatureValuesC={temperatureValuesC}
		humidityValues={humidityValues}
		updatedAt={updatedAt}
	/>
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Custom grow-program bands</h3>
		<p class="demo-copy">
			Override the default program references when your crop strategy uses different steering
			bands, while keeping the same production-style heatmap colors underneath.
		</p>
	</div>

	<CwVPDChart
		plant="Cannabis"
		growthStage="Generative push"
		targetMin={1.15}
		targetMax={1.45}
		airTemperatureC={29}
		relativeHumidity={56}
		stageBands={customBands}
		temperatureValuesC={Array.from({ length: 17 }, (_, index) => index + 19)}
		humidityValues={Array.from({ length: 11 }, (_, index) => 40 + index * 5)}
		updatedAt={1_710_000_000}
	/>

	<DemoCodeExample code={vpdExample} title="CwVPDChart example" />
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		color: var(--cw-text-primary);
		font-size: clamp(1.2rem, 2vw, 1.45rem);
		font-weight: var(--cw-font-semibold);
		margin: 0;
	}

	.demo-desc {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
		margin: 0 0 var(--cw-space-6);
		max-width: 66ch;
	}

	.demo-copy {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
		margin: 0;
		max-width: 64ch;
	}

	.demo-section {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-8);
	}

	.demo-section--stack {
		align-items: start;
	}

	.demo-section__copy {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-scenario-list {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
	}

	.demo-scenario-button {
		align-items: flex-start;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 94%, white),
				color-mix(in srgb, var(--cw-bg-muted) 56%, white)
			);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 74%, transparent);
		border-radius: var(--cw-radius-xl);
		color: var(--cw-text-primary);
		cursor: pointer;
		display: grid;
		gap: 0.32rem;
		padding: 0.95rem 1rem;
		text-align: left;
		transition:
			transform var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default),
			border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.demo-scenario-button:hover {
		transform: translateY(-1px);
	}

	.demo-scenario-button--active {
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, #1a5662 18%, var(--cw-bg-surface)),
				color-mix(in srgb, #1a5662 9%, var(--cw-bg-muted))
			);
		border-color: color-mix(in srgb, #1a5662 72%, transparent);
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, white 18%, transparent),
			0 16px 24px color-mix(in srgb, #1a5662 18%, transparent);
		transform: translateY(-1px);
	}

	.demo-scenario-button span {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
	}

	.demo-scenario-button--active span {
		color: var(--cw-text-primary);
	}

	.demo-scenario-button small {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
	}

	.demo-scenario-button--active small {
		color: var(--cw-text-secondary);
	}

	.demo-controls {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}

	.demo-slider,
	.demo-live-card {
		background: color-mix(in srgb, var(--cw-bg-muted) 44%, white);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 74%, transparent);
		border-radius: 1.1rem;
		display: grid;
		gap: 0.55rem;
		padding: 1rem;
	}

	.demo-slider__label,
	.demo-live-card__label {
		color: var(--cw-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.demo-slider input {
		accent-color: #1a5662;
		width: 100%;
	}

	.demo-slider strong,
	.demo-live-card strong {
		font-size: var(--cw-text-lg);
		font-variant-numeric: tabular-nums;
	}

	.demo-live-card p {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.55;
		margin: 0;
	}
</style>
