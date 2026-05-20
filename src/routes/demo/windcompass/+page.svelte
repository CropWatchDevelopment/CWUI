<script lang="ts">
	import { CwWindCompass } from "$lib/index.js";
	import type { CwWindSpeedUnit } from "$lib/index.js";
	import DemoCodeExample from "../_components/DemoCodeExample.svelte";

	type ScenarioName =
		| "Light Breeze"
		| "Greenhouse Roof"
		| "Port Buoy";

	interface WindScenario {
		location: string;
		direction: number;
		speed: number;
		unit: CwWindSpeedUnit;
		convention?: "from" | "to";
		note: string;
	}

	const scenarios: Record<ScenarioName, WindScenario> = {
		"Light Breeze": {
			location: "Field Station 12",
			direction: 220,
			speed: 3.4,
			unit: "m/s",
			note: "Calm afternoon. Light SW breeze.",
		},
		"Greenhouse Roof": {
			location: "Greenhouse Roof",
			direction: 45,
			speed: 28,
			unit: "mph",
			note: "Pre-frontal NE flow. Useful for vent and curtain logic.",
		},
		"Port Buoy": {
			location: "Buoy 4-A",
			direction: 90,
			speed: 11,
			unit: "knots",
			convention: "to",
			note: "Surface drift report — direction is where the wind is going TO.",
		},
	};

	const scenarioOptions = Object.entries(scenarios) as [
		ScenarioName,
		WindScenario,
	][];

	let selectedScenario = $state<ScenarioName>("Greenhouse Roof");
	let direction = $state(scenarios["Greenhouse Roof"].direction);
	let speed = $state(scenarios["Greenhouse Roof"].speed);
	let unit = $state<CwWindSpeedUnit>(scenarios["Greenhouse Roof"].unit);
	let updatedAt = $state(Date.now());
	let liveCardinal = $state("");

	const activeScenario = $derived(scenarios[selectedScenario]);

	function selectScenario(name: ScenarioName) {
		selectedScenario = name;
		const s = scenarios[name];
		direction = s.direction;
		speed = s.speed;
		unit = s.unit;
		updatedAt = Date.now();
	}

	const directionExample = `<CwWindCompass
\tlocation="Field Station 12"
\tdirection={220}
\tspeed={6.4}
\ttimestamp={Date.now()}
/>`;

	const compactExample = `<CwWindCompass
\tdirection={310}
\tspeed={3.1}
\tsize={220}
\tshowSummary={false}
\tshowLegend={false}
/>`;

	const oceanographicExample = `<CwWindCompass
\tlocation="Buoy 4-A"
\tdirection={90}
\tspeed={11}
\tunit="knots"
\tconvention="to"
/>`;

	const dualUnitExample = `<CwWindCompass
\tlocation="Highway Sensor"
\tdirection={140}
\tspeed={28}
\tunit="mph"
\tsecondaryUnit="km/h"
/>`;

	const cardinalBindExample = `<script lang="ts">
\tlet windCardinal = $state('');
</` + `script>

<CwWindCompass
\tdirection={direction}
\tspeed={speed}
\tbind:cardinal={windCardinal}
/>

<p>Wind from: {windCardinal}</p>`;
</script>

<h2>CwWindCompass</h2>
<p class="demo-desc">
	An aviation-style heading dial for wind direction and wind speed. Cardinal
	letters and ten-degree markers ring the bezel, an arrow with a shaft and
	fletching rotates to the direction of flow, and the live speed reads out as
	a digital display in the centre of the instrument. Adapts to the current
	theme through CSS variables.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Live, interactive instrument</h3>
		<p class="demo-copy">
			Pick a scenario or scrub the controls below. The arrow always points
			toward the direction the wind is moving. The dial layout, fonts, and
			colors automatically follow the active light or dark theme.
		</p>
	</div>

	<div class="demo-scenario-list">
		{#each scenarioOptions as [name, scenario] (name)}
			<button
				type="button"
				class={[
					"demo-scenario-button",
					selectedScenario === name &&
						"demo-scenario-button--active",
				]}
				onclick={() => selectScenario(name)}
			>
				<span>{name}</span>
				<small>
					{scenario.direction}° · {scenario.speed}
					{scenario.unit}
				</small>
			</button>
		{/each}
	</div>

	<div class="demo-controls">
		<label class="demo-slider">
			<span class="demo-slider__label">Direction</span>
			<input
				type="range"
				min="0"
				max="359"
				step="1"
				bind:value={direction}
				oninput={() => (updatedAt = Date.now())}
			/>
			<strong>{direction}°</strong>
		</label>

		<label class="demo-slider">
			<span class="demo-slider__label">Speed ({unit})</span>
			<input
				type="range"
				min="0"
				max={unit === "mph" ? 80 : unit === "km/h" ? 110 : unit === "knots" ? 60 : 30}
				step="0.5"
				bind:value={speed}
				oninput={() => (updatedAt = Date.now())}
			/>
			<strong>{speed.toFixed(1)} {unit}</strong>
		</label>

		<div class="demo-live-card">
			<span class="demo-live-card__label">Notes</span>
			<strong>{selectedScenario}</strong>
			<p>{activeScenario.note}</p>
		</div>

		<div class="demo-live-card">
			<span class="demo-live-card__label">Bound cardinal</span>
			<strong>{liveCardinal || "—"}</strong>
			<p>
				The component pushes the current cardinal abbreviation back via
				<code>bind:cardinal</code>.
			</p>
		</div>
	</div>

	<div class="demo-stage">
		<CwWindCompass
			location={activeScenario.location}
			{direction}
			{speed}
			{unit}
			convention={activeScenario.convention ?? "from"}
			timestamp={updatedAt}
			bind:cardinal={liveCardinal}
		/>
	</div>
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Dual-unit readout (MPH and KPH)</h3>
		<p class="demo-copy">
			Pass <code>secondaryUnit</code> to display the same speed in a
			second unit on the readout panel. The conversion runs through the
			internal m/s normalization so any pair of supported units works.
		</p>
	</div>

	<div class="demo-compact-row">
		<CwWindCompass
			location="Highway Sensor"
			direction={140}
			speed={28}
			unit="mph"
			secondaryUnit="km/h"
			showLegend={false}
		/>
		<CwWindCompass
			location="Marina Mast"
			direction={300}
			speed={18}
			unit="knots"
			secondaryUnit="m/s"
			showLegend={false}
		/>
	</div>

	<DemoCodeExample code={dualUnitExample} title="Dual-unit display" />
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Bindable cardinal abbreviation</h3>
		<p class="demo-copy">
			Use <code>bind:cardinal</code> to receive the current cardinal
			abbreviation (N, NNE, NE, …) of the wind&rsquo;s FROM bearing.
			Useful for status banners and announcer-style copy that should not
			recompute the abbreviation locally.
		</p>
	</div>

	<DemoCodeExample code={cardinalBindExample} title="Cardinal binding" />
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Compact placement</h3>
		<p class="demo-copy">
			Drop the summary and legend for dashboards where the dial sits next
			to other tiles. The instrument stays legible at smaller sizes thanks
			to the high-contrast tick layout.
		</p>
	</div>

	<div class="demo-compact-row">
		<CwWindCompass
			direction={310}
			speed={3.1}
			size={220}
			showSummary={false}
			showLegend={false}
		/>
		<CwWindCompass
			direction={120}
			speed={18}
			unit="mph"
			size={220}
			showSummary={false}
			showLegend={false}
		/>
		<CwWindCompass
			direction={355}
			speed={42}
			unit="km/h"
			size={220}
			showSummary={false}
			showLegend={false}
		/>
	</div>

	<DemoCodeExample code={compactExample} title="Compact dial" />
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Conventions and units</h3>
		<p class="demo-copy">
			Most weather data uses the meteorological "from" convention — the
			direction the wind is blowing FROM. Drift and oceanographic data
			often invert this. Use <code>convention="to"</code> to flip the dial
			labels and the cardinal readout.
		</p>
	</div>

	<div class="demo-compact-row">
		<CwWindCompass
			location="Met (from)"
			direction={90}
			speed={6.4}
			unit="m/s"
			convention="from"
		/>
		<CwWindCompass
			location="Drift (to)"
			direction={90}
			speed={11}
			unit="knots"
			convention="to"
		/>
	</div>

	<DemoCodeExample code={oceanographicExample} title="Oceanographic example" />
</section>

<section class="demo-section demo-section--stack">
	<div class="demo-section__copy">
		<h3>Standard reading</h3>
		<p class="demo-copy">
			This is the most common shape — wire it to a sensor and pass the
			reading straight through.
		</p>
	</div>
	<DemoCodeExample code={directionExample} title="Standard reading" />
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

	code {
		font-family: var(--cw-font-mono, ui-monospace, monospace);
		font-size: 0.85em;
		padding: 0 0.25em;
		border-radius: 0.25rem;
		background: color-mix(
			in srgb,
			var(--cw-bg-muted) 70%,
			transparent
		);
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

	.demo-stage {
		display: flex;
		justify-content: center;
	}

	.demo-compact-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-4);
		justify-content: center;
	}

	.demo-scenario-list {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
	}

	.demo-scenario-button {
		align-items: flex-start;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--cw-bg-elevated) 94%, white),
			color-mix(in srgb, var(--cw-bg-muted) 56%, white)
		);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 74%, transparent);
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
		background: linear-gradient(
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

	.demo-scenario-button small {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-xs);
	}

	.demo-controls {
		display: grid;
		gap: var(--cw-space-3);
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}

	.demo-slider,
	.demo-live-card {
		background: color-mix(in srgb, var(--cw-bg-muted) 44%, white);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 74%, transparent);
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
