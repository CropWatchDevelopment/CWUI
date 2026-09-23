<script lang="ts">
	import { CwStatCard } from '$lib/index.js';
	import type { CwStatCardData, CwStatCardLabels } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const temperatureStats: CwStatCardData = {
		min: 18.2,
		max: 32.7,
		avg: 24.5,
		median: 24.1,
		stdDev: 3.2,
		count: 288,
		lastReading: 25.3
	};

	const humidityStats: CwStatCardData = {
		min: 35,
		max: 92,
		avg: 68.4,
		median: 70,
		stdDev: 12.1,
		count: 288,
		lastReading: 72
	};

	const co2Stats: CwStatCardData = {
		min: 380,
		max: 1200,
		avg: 620,
		median: 580,
		stdDev: 180,
		count: 288,
		lastReading: 4583
	};

	const lightStats: CwStatCardData = {
		min: 0,
		max: 850,
		avg: 420,
		count: 288,
		lastReading: 620
	};

	const minimalStats: CwStatCardData = {
		min: 10,
		max: 50,
		avg: 30
	};

	const basicExample = `<script lang="ts">
\timport { CwStatCard } from '@cropwatchdevelopment/cwui';
\timport type { CwStatCardData } from '@cropwatchdevelopment/cwui';

\tconst stats: CwStatCardData = {
\t\tmin: 18.2,
\t\tmax: 32.7,
\t\tavg: 24.5,
\t\tmedian: 24.1,
\t\tstdDev: 3.2,
\t\tcount: 288,
\t\tlastReading: 25.3
\t};
<\/script>

<CwStatCard title="Temperature" stats={stats} unit="°C" />`;

	const customColorExample = `<CwStatCard
\ttitle="Humidity"
\tstats={humidityStats}
\tunit="%"
\taccentColor="var(--cw-tone-info-text)"
/>`;

	const nonExpandableExample = `<CwStatCard
\ttitle="Light Intensity"
\tstats={lightStats}
\tunit="lux"
\texpandable={false}
/>`;

	const japaneseLabels: CwStatCardLabels = {
		min: '最小',
		avg: '平均',
		max: '最大',
		count: '件数',
		median: '中央値',
		stdDev: '標準偏差',
		range: '範囲',
		aboveAvg: '平均以上',
		belowAvg: '平均以下',
		atAvg: '平均',
		showDetails: '詳細を表示',
		hideDetails: '詳細を隠す',
	};

	const labelsExample = `<script lang="ts">
\timport { CwStatCard } from '@cropwatchdevelopment/cwui';
\timport type { CwStatCardLabels } from '@cropwatchdevelopment/cwui';

\tconst jaLabels: CwStatCardLabels = {
\t\tmin: '最小',
\t\tavg: '平均',
\t\tmax: '最大',
\t\tcount: '件数',
\t\tmedian: '中央値',
\t\tstdDev: '標準偏差',
\t\trange: '範囲',
\t\taboveAvg: '平均以上',
\t\tbelowAvg: '平均以下',
\t\tatAvg: '平均',
\t\tshowDetails: '詳細を表示',
\t\thideDetails: '詳細を隠す',
\t};
<\/script>

<CwStatCard title="温度" stats={stats} unit="°C" labels={jaLabels} />`;
</script>

<h2>CwStatCard</h2>
<p class="demo-desc">
	Displays statistical summaries (min / avg / max) with a visual range bar, current reading, and
	current-vs-average delta. The details toggle is a real button with <code>aria-expanded</code>.
</p>

<section class="demo-section">
	<h3>Default (expandable)</h3>
	<div class="demo-grid">
		<CwStatCard title="Temperature" stats={temperatureStats} unit="°C" />
		<CwStatCard title="Humidity" stats={humidityStats} unit="%" accentColor="var(--cw-tone-info-text)" />
		<CwStatCard title="CO₂" stats={co2Stats} unit="ppm" accentColor="var(--cw-tone-warning-text)" />
	</div>
	<DemoCodeExample code={basicExample} title="Basic usage" />
</section>

<section class="demo-section">
	<h3>Custom accent colour</h3>
	<p class="demo-hint">
		The accent colours text, so use a <code>--cw-tone-*-text</code> token to keep contrast in both
		themes.
	</p>
	<div class="demo-grid">
		<CwStatCard title="Light Intensity" stats={lightStats} unit="lux" accentColor="var(--cw-tone-warning-text)" />
		<CwStatCard title="Soil Moisture" stats={humidityStats} unit="%" accentColor="var(--cw-tone-success-text)" />
		<CwStatCard title="VPD" stats={temperatureStats} unit="kPa" accentColor="var(--cw-tone-danger-text)" />
	</div>
	<DemoCodeExample code={customColorExample} title="Custom accent colour" />
</section>

<section class="demo-section">
	<h3>Non-expandable</h3>
	<div class="demo-grid">
		<CwStatCard title="Quick Glance" stats={minimalStats} unit="%" expandable={false} />
		<CwStatCard title="CO₂ Summary" stats={co2Stats} unit="ppm" expandable={false} accentColor="var(--cw-tone-warning-text)" />
	</div>
	<DemoCodeExample code={nonExpandableExample} title="Non-expandable" />
</section>

<section class="demo-section">
	<h3>Current vs average</h3>
	<div class="demo-grid">
		<CwStatCard title="Above Average" stats={{ ...minimalStats, lastReading: 45 }} unit="°C" />
		<CwStatCard title="Below Average" stats={{ ...minimalStats, lastReading: 15 }} unit="°C" accentColor="var(--cw-tone-danger-text)" />
		<CwStatCard title="Slightly above" stats={{ ...minimalStats, lastReading: 30.4 }} unit="°C" accentColor="var(--cw-tone-info-text)" />
	</div>
</section>

<section class="demo-section">
	<h3>Loading &amp; heading level</h3>
	<p class="demo-hint">
		<code>loading</code> shows a skeleton. <code>headingLevel</code> (default 3) sets the title's
		heading element so cards fit the page outline.
	</p>
	<div class="demo-grid">
		<CwStatCard title="Temperature" stats={temperatureStats} unit="°C" loading />
		<CwStatCard title="Humidity (h4)" stats={humidityStats} unit="%" headingLevel={4} />
	</div>
</section>

<section class="demo-section">
	<h3>Localized labels (i18n)</h3>
	<p class="demo-hint">
		Pass a <code>labels</code> prop to override any or all display strings. Only the provided keys
		are replaced; the rest stay English by default.
	</p>
	<div class="demo-grid">
		<CwStatCard title="温度" stats={temperatureStats} unit="°C" labels={japaneseLabels} locale="ja-JP" />
		<CwStatCard title="湿度" stats={humidityStats} unit="%" accentColor="var(--cw-tone-info-text)" labels={japaneseLabels} locale="ja-JP" />
		<CwStatCard title="CO₂" stats={co2Stats} unit="ppm" accentColor="var(--cw-tone-warning-text)" labels={japaneseLabels} locale="ja-JP" />
	</div>
	<DemoCodeExample code={labelsExample} title="Localized labels" />
</section>
