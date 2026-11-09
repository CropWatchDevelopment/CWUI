<script lang="ts">
	import { CwAboveBelowChart, CwSwitch } from '$lib/index.js';
	import type {
		CwAboveBelowChartLabels,
		CwAboveBelowLight,
		CwAboveBelowMetric,
		CwAboveBelowPoint
	} from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	type Language = 'en' | 'ja';
	type Width = 'full' | 'tablet' | 'phone';

	// ── Demo readings: a soil board's last 24 hours, 84 readings, newest at 13:52 JST ──
	const END = Date.parse('2026-11-08T04:52:00Z');
	const STEP = (24 * 60 * 60 * 1000) / 84;
	const times = Array.from({ length: 84 }, (_, index) => END - (83 - index) * STEP);
	const japanHour = (time: number) => (((time / 3_600_000 + 9) % 24) + 24) % 24;

	/** A smooth daily curve from `low` to `high`, highest at `peakHour` (Japan time). */
	function daily(low: number, high: number, peakHour: number, decimals = 1): CwAboveBelowPoint[] {
		const factor = 10 ** decimals;
		return times.map((t) => {
			const phase = Math.cos(((japanHour(t) - peakHour) / 24) * 2 * Math.PI);
			return { t, v: Math.round((low + ((high - low) * (phase + 1)) / 2) * factor) / factor };
		});
	}

	const ppfd: CwAboveBelowPoint[] = times.map((t) => {
		const hour = japanHour(t);
		const daylight = hour > 6.5 && hour < 16.5 ? Math.sin(((hour - 6.5) / 10) * Math.PI) : 0;
		return { t, v: Math.round(1223 * daylight) };
	});

	const readings = {
		airTemperature: daily(5.7, 26, 12),
		airHumidity: daily(62, 92, 2, 0),
		co2: daily(380, 915, 5, 0),
		soilTemperature: daily(14, 22.7, 15),
		soilMoisture: daily(46.2, 51.3, 6),
		soilEc: daily(0.22, 0.26, 14, 2)
	};

	// ── Copy: English defaults live in the component; Japanese comes in through `labels` ──
	const japaneseLabels: CwAboveBelowChartLabels = {
		title: '地上と地中',
		light: '光',
		air: '空気',
		ground: '土壌',
		skyLevel: '上空',
		airLevel: '地上',
		groundLevel: '地表',
		ppfdNow: '現在のPPFD',
		ppfdPeak: 'ピーク',
		dliToday: '本日のDLI',
		dliGoal: (targetName) => (targetName ? `${targetName}の目標` : '目標'),
		low: '最小',
		average: '平均',
		high: '最大',
		target: (range) => `目標 ${range}`,
		legend: '凡例',
		legendNow: '現在',
		legendAverage: '平均',
		legendRange: '最小〜最大',
		legendTarget: (targetName) => (targetName ? `${targetName}の目標` : '目標'),
		tooltip: (name, value) => `${name}：${value}`,
		statusTooLow: '低すぎ',
		statusLow: '低め',
		statusOptimal: '適正',
		statusHigh: '高め',
		statusTooHigh: '高すぎ'
	};

	const copy = {
		en: {
			subtitle: 'Last 24 Hours · 84 readings · latest 13:52',
			crop: 'Tomato',
			airTemperature: 'Air temperature',
			airHumidity: 'Air humidity',
			soilTemperature: 'Soil temperature',
			soilMoisture: 'Soil moisture',
			ecLabTest: '0.2–0.5 mS/cm (lab test, 1:5)'
		},
		ja: {
			subtitle: '直近24時間 · 84件 · 最新 13:52',
			crop: 'トマト',
			airTemperature: '気温',
			airHumidity: '空気湿度',
			soilTemperature: '土壌温度',
			soilMoisture: '土壌水分',
			ecLabTest: '0.2–0.5 mS/cm(土壌診断・1:5抽出)'
		}
	} as const;

	let language = $state<Language>('en');
	let withCrop = $state(true);
	let tinted = $state(true);
	let width = $state<Width>('full');

	const text = $derived(copy[language]);

	function airReadings(withTargets: boolean): CwAboveBelowMetric[] {
		return [
			{
				key: 'air_temperature',
				label: text.airTemperature,
				unit: '°C',
				data: readings.airTemperature,
				target: withTargets ? { min: 12, optimalMin: 20, optimalMax: 25, max: 35 } : null
			},
			{
				key: 'air_humidity',
				label: text.airHumidity,
				unit: '%',
				decimals: 0,
				data: readings.airHumidity,
				target: withTargets ? { optimalMin: 60, optimalMax: 80 } : null
			},
			{
				key: 'co2',
				label: 'CO₂',
				unit: 'ppm',
				decimals: 0,
				data: readings.co2,
				target: withTargets ? { optimalMin: 600, optimalMax: 900 } : null
			}
		];
	}

	function groundReadings(withTargets: boolean): CwAboveBelowMetric[] {
		return [
			{
				key: 'soil_temperature',
				label: text.soilTemperature,
				unit: '°C',
				data: readings.soilTemperature,
				target: withTargets ? { min: 14, optimalMin: 15, optimalMax: 20 } : null
			},
			{
				key: 'soil_moisture',
				label: text.soilMoisture,
				unit: '%',
				data: readings.soilMoisture,
				target: withTargets ? { min: 12.5, optimalMin: 19.3, optimalMax: 24.2 } : null
			},
			{
				key: 'soil_ec',
				label: 'EC',
				unit: 'mS/cm',
				decimals: 2,
				data: readings.soilEc,
				// A lab-test (1:5) reference is not comparable with an in-soil probe: shown, never judged.
				note: withTargets ? text.ecLabTest : null
			},
			// This probe has no pH sensor: with `hideEmpty` (the default) the reading is left out.
			{ key: 'soil_ph', label: 'pH', data: [] }
		];
	}

	const air = $derived(airReadings(withCrop));
	const ground = $derived(groundReadings(withCrop));
	const light = $derived<CwAboveBelowLight>({
		data: ppfd,
		dli: 14,
		dliTarget: withCrop ? { min: 20, max: 30 } : null
	});
	const labels = $derived(language === 'ja' ? japaneseLabels : {});
	const locale = $derived(language === 'ja' ? 'ja-JP' : 'en-US');

	const widthOptions: { value: Width; label: string }[] = [
		{ value: 'full', label: 'Full width' },
		{ value: 'tablet', label: 'Tablet (834px)' },
		{ value: 'phone', label: 'Phone (390px)' }
	];
	const languageOptions: { value: Language; label: string }[] = [
		{ value: 'en', label: 'English' },
		{ value: 'ja', label: '日本語' }
	];

	const usageExample = `<script lang="ts">
\timport { CwAboveBelowChart, type CwAboveBelowMetric } from '@cropwatchdevelopment/cwui';

\t// Readings straight from telemetry: { t, v } points in any order, or bare numbers.
\t// Now / Low / Avg / High, the bar and the status chip are worked out for you.
\tconst air: CwAboveBelowMetric[] = [
\t\t{ key: 'air_temperature', label: 'Air temperature', unit: '°C', data: airTemperature,
\t\t\ttarget: { min: 12, optimalMin: 20, optimalMax: 25, max: 35 } },
\t\t{ key: 'air_humidity', label: 'Air humidity', unit: '%', decimals: 0, data: airHumidity,
\t\t\ttarget: { optimalMin: 60, optimalMax: 80 } },
\t\t{ key: 'co2', label: 'CO₂', unit: 'ppm', decimals: 0, data: co2,
\t\t\ttarget: { optimalMin: 600, optimalMax: 900 } }
\t];

\tconst ground: CwAboveBelowMetric[] = [
\t\t{ key: 'soil_temperature', label: 'Soil temperature', unit: '°C', data: soilTemperature,
\t\t\ttarget: { min: 14, optimalMin: 15, optimalMax: 20 } },
\t\t{ key: 'soil_moisture', label: 'Soil moisture', unit: '%', data: soilMoisture,
\t\t\ttarget: { min: 12.5, optimalMin: 19.3, optimalMax: 24.2 } },
\t\t{ key: 'soil_ec', label: 'EC', unit: 'mS/cm', decimals: 2, data: soilEc,
\t\t\tnote: '0.2–0.5 mS/cm (lab test, 1:5)' }
\t];
<\/script>

<CwAboveBelowChart
\tsubtitle="Last 24 Hours · 84 readings · latest 13:52"
\ttargetName="Tomato"
\tlight={{ data: ppfd, dli: 14, dliTarget: { min: 20, max: 30 } }}
\t{air}
\t{ground}
/>`;

	const japaneseExample = `<script lang="ts">
\timport type { CwAboveBelowChartLabels } from '@cropwatchdevelopment/cwui';

\tconst labels: CwAboveBelowChartLabels = {
\t\ttitle: '地上と地中',
\t\tlight: '光',
\t\tair: '空気',
\t\tground: '土壌',
\t\tskyLevel: '上空',
\t\tairLevel: '地上',
\t\tgroundLevel: '地表',
\t\tppfdNow: '現在のPPFD',
\t\tppfdPeak: 'ピーク',
\t\tdliToday: '本日のDLI',
\t\tdliGoal: (name) => (name ? \`\${name}の目標\` : '目標'),
\t\tlow: '最小',
\t\taverage: '平均',
\t\thigh: '最大',
\t\ttarget: (range) => \`目標 \${range}\`,
\t\tlegend: '凡例',
\t\tlegendNow: '現在',
\t\tlegendAverage: '平均',
\t\tlegendRange: '最小〜最大',
\t\tlegendTarget: (name) => (name ? \`\${name}の目標\` : '目標'),
\t\ttooltip: (name, value) => \`\${name}：\${value}\`,
\t\tstatusTooLow: '低すぎ',
\t\tstatusLow: '低め',
\t\tstatusOptimal: '適正',
\t\tstatusHigh: '高め',
\t\tstatusTooHigh: '高すぎ'
\t};
<\/script>

<CwAboveBelowChart locale="ja-JP" {labels} targetName="トマト" {air} {ground} {light} />`;
</script>

<h2>CwAboveBelowChart</h2>
<p class="demo-desc">
	One panel for an all-in-one soil board: a thin light strip, the air readings above a ground
	line and the soil readings below it. Each reading shows its current value, a range bar (the
	low–high span, the average, the current value and the target band) and its low, average and
	high for the selected range. It sizes itself to its container, not the window: three columns
	with the layer names beside them when wide, the names above the readings at tablet width, and
	one row per reading at phone width.
</p>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Soil board with a crop</h3>
		<p class="demo-copy">
			Push the readings in as they come from telemetry; the chart works out the current value,
			the low, average and high, the bar and the status. Switch the language, the crop's targets
			and the width to see how it adapts.
		</p>
	</div>

	<div class="demo-ab-controls">
		<div class="demo-ab-choice" role="group" aria-label="Language">
			{#each languageOptions as option (option.value)}
				<button
					type="button"
					class="demo-ab-choice__button"
					class:demo-ab-choice__button--active={language === option.value}
					aria-pressed={language === option.value}
					onclick={() => (language = option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<div class="demo-ab-choice" role="group" aria-label="Width">
			{#each widthOptions as option (option.value)}
				<button
					type="button"
					class="demo-ab-choice__button"
					class:demo-ab-choice__button--active={width === option.value}
					aria-pressed={width === option.value}
					onclick={() => (width = option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<CwSwitch bind:checked={withCrop} label="Crop targets" />
		<CwSwitch bind:checked={tinted} label="Tinted layers" />
	</div>

	<div class="demo-ab-frame demo-ab-frame--{width}">
		<CwAboveBelowChart
			{locale}
			{labels}
			{tinted}
			subtitle={text.subtitle}
			targetName={withCrop ? text.crop : ''}
			{light}
			{air}
			{ground}
		/>
	</div>

	<DemoCodeExample code={usageExample} title="CwAboveBelowChart example" />
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Japanese and other languages</h3>
		<p class="demo-copy">
			English is built in. Pass every other language through <code>labels</code> (from your app's
			translations) and the matching <code>locale</code> for the numbers; reading names, units and
			notes are your data, so they arrive translated already.
		</p>
	</div>

	<DemoCodeExample code={japaneseExample} title="Japanese labels" />
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>No crop and no light sensor</h3>
		<p class="demo-copy">
			Without targets there are no bands or status chips; without <code>light</code> the light
			strip is left out.
		</p>
	</div>

	<CwAboveBelowChart
		subtitle="Last 24 Hours · 84 readings · latest 13:52"
		air={airReadings(false)}
		ground={groundReadings(false)}
	/>
</section>

<section class="demo-section">
	<div class="demo-section__copy">
		<h3>Loading and unavailable</h3>
		<p class="demo-copy">
			<code>loading</code> shows a placeholder; <code>noData</code> blurs the panel behind a message.
		</p>
	</div>

	<div class="demo-ab-pair">
		<CwAboveBelowChart loading />
		<CwAboveBelowChart
			noData="Awaiting sensor data"
			air={airReadings(false)}
			ground={groundReadings(false)}
		/>
	</div>
</section>

<style>
	.demo-section__copy {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-section__copy h3,
	.demo-copy {
		margin: 0;
	}

	.demo-copy {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		line-height: var(--cw-leading-relaxed);
	}

	.demo-ab-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-3) var(--cw-space-6);
	}

	.demo-ab-choice {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--cw-space-1);
		padding: var(--cw-space-1);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-muted);
	}

	.demo-ab-choice__button {
		min-height: 2rem;
		padding: 0 var(--cw-space-3);
		border: 0;
		border-radius: var(--cw-radius-md);
		background: transparent;
		color: var(--cw-text-secondary);
		font: inherit;
		font-size: var(--cw-text-sm);
		cursor: pointer;
	}

	.demo-ab-choice__button--active {
		background: var(--cw-bg-surface);
		color: var(--cw-text-primary);
		font-weight: var(--cw-font-semibold);
		box-shadow: var(--cw-shadow-sm);
	}

	.demo-ab-frame {
		width: 100%;
		margin-inline: auto;
		transition: max-width var(--cw-duration-medium) var(--cw-ease-default);
	}

	.demo-ab-frame--tablet {
		max-width: 834px;
	}

	.demo-ab-frame--phone {
		max-width: 390px;
	}

	.demo-ab-pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
		gap: var(--cw-space-4);
	}
</style>
