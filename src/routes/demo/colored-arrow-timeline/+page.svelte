<script lang="ts">
	import { CwButton, CwColoredArrowTimeline, CwRadio, CwSwitch } from '$lib/index.js';
	import type {
		CwColoredArrowTimelineItem,
		CwColoredArrowTimelineOrientation
	} from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	// ── Basic ──────────────────────────────────────────────
	const season: CwColoredArrowTimelineItem[] = [
		{
			date: 'Mar 2026',
			datetime: '2026-03',
			title: 'Seeding',
			description: 'Sow tomato trays in the nursery house.'
		},
		{
			date: 'Apr 2026',
			datetime: '2026-04',
			title: 'Transplant',
			description: 'Move seedlings into the main greenhouse.'
		},
		{
			date: 'Jun 2026',
			datetime: '2026-06',
			title: 'First harvest',
			description: 'Pick the first trusses and start tracking yield.'
		},
		{
			date: 'Oct 2026',
			datetime: '2026-10',
			title: 'Season close',
			description: 'Clear the beds and clean the house.'
		}
	];

	const basicExample = `<script lang="ts">
\timport { CwColoredArrowTimeline } from '@cropwatchdevelopment/cwui';
\timport type { CwColoredArrowTimelineItem } from '@cropwatchdevelopment/cwui';

\tconst season: CwColoredArrowTimelineItem[] = [
\t\t{ date: 'Mar 2026', datetime: '2026-03', title: 'Seeding', description: 'Sow tomato trays in the nursery house.' },
\t\t{ date: 'Apr 2026', datetime: '2026-04', title: 'Transplant', description: 'Move seedlings into the main greenhouse.' },
\t\t{ date: 'Jun 2026', datetime: '2026-06', title: 'First harvest', description: 'Pick the first trusses and start tracking yield.' },
\t\t{ date: 'Oct 2026', datetime: '2026-10', title: 'Season close', description: 'Clear the beds and clean the house.' }
\t];
<\/script>

<CwColoredArrowTimeline items={season} ariaLabel="Tomato season 2026" />`;

	// ── Progress: done steps in colour, upcoming steps muted ──
	const rolloutSteps = [
		{ date: 'Q1 2026', title: 'Pilot', description: 'Ten soil sensors on one test field.' },
		{ date: 'Q2 2026', title: 'Gateway', description: 'LoRaWAN gateway covers the whole farm.' },
		{ date: 'Q3 2026', title: 'All fields', description: 'Sensors in every field and greenhouse.' },
		{ date: 'Q4 2026', title: 'Automation', description: 'Irrigation follows the soil moisture alerts.' }
	];

	let completed = $state(2);

	const rollout: CwColoredArrowTimelineItem[] = $derived(
		rolloutSteps.map((step, i) => ({ ...step, muted: i >= completed }))
	);

	const progressExample = `<script lang="ts">
\tlet completed = $state(2);

\t// Steps that haven't happened yet are muted. A muted step keeps its
\t// palette slot, so it comes back in the same colour once it's done.
\tconst rollout = $derived(
\t\tsteps.map((step, i) => ({ ...step, muted: i >= completed }))
\t);
<\/script>

<CwColoredArrowTimeline items={rollout} ariaLabel="Sensor rollout" />`;

	// ── Clickable steps ────────────────────────────────────
	let lastClick = $state<string | null>(null);

	function handleStepClick(item: CwColoredArrowTimelineItem, index: number) {
		lastClick = `onItemClick → index ${index}: ${item.title} (${item.date})`;
	}

	const clickExample = `<script lang="ts">
\timport type { CwColoredArrowTimelineItem } from '@cropwatchdevelopment/cwui';

\tfunction handleStepClick(item: CwColoredArrowTimelineItem, index: number, event: MouseEvent) {
\t\tgoto(\`/season/\${item.id}\`);   // or open a drawer, select a row, …
\t}
<\/script>

<!-- With onItemClick set, every step is a <button>: click, tap, Enter or Space. -->
<CwColoredArrowTimeline items={season} onItemClick={handleStepClick} ariaLabel="Tomato season 2026" />`;

	// ── Your own dates and text ─────────────────────────────
	let japanese = $state(false);

	const milestones = [
		{
			iso: '2026-04-15',
			en: { title: 'Soil test', description: 'Sample every bed for pH and EC.' },
			ja: { title: '土壌検査', description: '全ての畝で pH と EC を測定します。' }
		},
		{
			iso: '2026-05-02',
			en: { title: 'Planting', description: 'Rice seedlings go into the paddies.' },
			ja: { title: '田植え', description: '苗を水田に植え付けます。' }
		},
		{
			iso: '2026-08-20',
			en: { title: 'Heading', description: 'Watch water depth and leaf colour.' },
			ja: { title: '出穂', description: '水深と葉色を確認します。' }
		},
		{
			iso: '2026-09-28',
			en: { title: 'Harvest', description: 'Cut, dry and weigh the crop.' },
			ja: { title: '収穫', description: '刈り取り、乾燥、計量を行います。' }
		}
	];

	const localized: CwColoredArrowTimelineItem[] = $derived.by(() => {
		const locale = japanese ? 'ja-JP' : 'en-US';
		const format = new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		});
		return milestones.map((m) => ({
			id: m.iso,
			date: format.format(new Date(`${m.iso}T00:00:00Z`)),
			datetime: m.iso,
			...(japanese ? m.ja : m.en)
		}));
	});

	const localizedExample = `<script lang="ts">
\t// The timeline never formats anything: pass the date already formatted
\t// for the user's locale, and the ISO date for the <time datetime> attribute.
\tconst format = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });

\tconst items = milestones.map((m) => ({
\t\tid: m.iso,
\t\tdate: format.format(new Date(m.iso)),   // "Apr 15, 2026" or "2026年4月15日"
\t\tdatetime: m.iso,                        // "2026-04-15"
\t\ttitle: t(m.titleKey),
\t\tdescription: t(m.descriptionKey)
\t}));
<\/script>

<CwColoredArrowTimeline {items} ariaLabel={t('timeline.riceSeason')} />`;

	// ── Orientation ────────────────────────────────────────
	let orientation = $state<CwColoredArrowTimelineOrientation>('auto');

	const orientationExample = `<!-- auto (default): vertical once the columns would be narrower than 160px -->
<CwColoredArrowTimeline {items} />

<!-- Turn vertical sooner, when columns drop below 220px -->
<CwColoredArrowTimeline {items} minItemWidth={220} />

<!-- Fixed orientations -->
<CwColoredArrowTimeline {items} orientation="horizontal" />
<CwColoredArrowTimeline {items} orientation="vertical" />`;

	// ── Palette ────────────────────────────────────────────
	const weeks: CwColoredArrowTimelineItem[] = Array.from({ length: 8 }, (_, i) => ({
		date: `Week ${i * 2 + 1}`,
		title: ['Sow', 'Germinate', 'Prick out', 'Pot on', 'Harden off', 'Plant out', 'Flower', 'Fruit'][i]
	}));

	const paletteExample = `<!-- Steps 1–8 use --cw-chart-cat-1 … --cw-chart-cat-8, then the palette repeats.
     Neighbouring steps never share a colour. -->
<CwColoredArrowTimeline items={weeks} minItemWidth={110} />`;

	// ── Custom colours and size ────────────────────────────
	const custom: CwColoredArrowTimelineItem[] = [
		{ date: 'Day 0', title: 'Order placed', color: '#006045' },
		{ date: 'Day 2', title: 'Shipped', color: '#00997a' },
		{ date: 'Day 5', title: 'Installed', color: '#0284c7' }
	];

	const customExample = `<!-- item.color takes any CSS colour. The text is still mixed toward the
     theme's text colour, so check contrast when you pick your own. -->
<CwColoredArrowTimeline
\titems={[
\t\t{ date: 'Day 0', title: 'Order placed', color: '#006045' },
\t\t{ date: 'Day 2', title: 'Shipped', color: '#00997a' },
\t\t{ date: 'Day 5', title: 'Installed', color: '#0284c7' }
\t]}
\t--cw-colored-arrow-timeline-band="1.75rem"
\t--cw-colored-arrow-timeline-tip="0.875rem"
\t--cw-colored-arrow-timeline-gap="3px"
/>`;
</script>

<h2>CwColoredArrowTimeline</h2>
<p class="demo-desc">
	A slide-style timeline: thick chevron arrows that run into each other, with each step's date above
	its arrow and a title and description below. Every step gets its own colour from the shared chart
	palette, and the text is darkened in the light theme and lightened in the dark theme so it stays
	readable on any CWUI background. You pass every piece of text, dates included, already formatted
	and translated.
</p>

<section class="demo-section">
	<h3>Basic timeline</h3>
	<div class="demo-panel">
		<CwColoredArrowTimeline items={season} ariaLabel="Tomato season 2026" />
	</div>
	<p class="demo-hint">
		Switch the theme in the header: the arrows keep their colours and the text stays readable.
	</p>
	<DemoCodeExample code={basicExample} title="Basic timeline" />
</section>

<section class="demo-section">
	<h3>Done and upcoming steps</h3>
	<p class="demo-desc">
		Set <code>muted</code> on steps that haven't happened yet to grey them out, as in a project plan.
		The grey is visual only, so say "planned" or similar in the text if it matters to screen reader
		users.
	</p>
	<div class="demo-row progress-controls">
		<CwButton
			variant="secondary"
			size="sm"
			disabled={completed === 0}
			onclick={() => (completed = Math.max(0, completed - 1))}
		>
			Previous step
		</CwButton>
		<CwButton
			variant="secondary"
			size="sm"
			disabled={completed === rolloutSteps.length}
			onclick={() => (completed = Math.min(rolloutSteps.length, completed + 1))}
		>
			Next step
		</CwButton>
		<span class="demo-hint progress-status" aria-live="polite">
			{completed} of {rolloutSteps.length} steps done
		</span>
	</div>
	<div class="demo-panel">
		<CwColoredArrowTimeline items={rollout} ariaLabel="Sensor rollout" />
	</div>
	<DemoCodeExample code={progressExample} title="Muted upcoming steps" />
</section>

<section class="demo-section">
	<h3>Clickable steps</h3>
	<p class="demo-desc">
		Pass <code>onItemClick</code> and every step becomes its own button, covering its date, arrow,
		title and description. The callback gets the step, its index and the click event. Steps work with
		the keyboard too: Tab to a step, then press Enter or Space. Screen readers announce each one by
		its date and title.
	</p>
	<div class="demo-panel">
		<CwColoredArrowTimeline
			items={season}
			onItemClick={handleStepClick}
			ariaLabel="Tomato season 2026"
		/>
	</div>
	<p class="demo-event" aria-live="polite">{lastClick ?? 'Click a step…'}</p>
	<DemoCodeExample code={clickExample} title="Clickable steps" />
</section>

<section class="demo-section">
	<h3>Your own dates and text</h3>
	<p class="demo-desc">
		The component doesn't format or translate anything. Format dates in your app (for example with
		<code>Intl.DateTimeFormat</code>) and pass the result as <code>date</code>. Add
		<code>datetime</code> with the ISO date and the date is rendered in a
		<code>&lt;time&gt;</code> element.
	</p>
	<div class="demo-row progress-controls">
		<CwSwitch bind:checked={japanese} label="Japanese" />
	</div>
	<div class="demo-panel" lang={japanese ? 'ja' : 'en'}>
		<CwColoredArrowTimeline
			items={localized}
			ariaLabel={japanese ? '2026年 稲作の予定' : 'Rice season 2026'}
		/>
	</div>
	<DemoCodeExample code={localizedExample} title="Dates formatted by your app" />
</section>

<section class="demo-section">
	<h3>Orientation</h3>
	<p class="demo-desc">
		By default (<code>orientation="auto"</code>) the timeline measures its own width and turns
		vertical, with the arrows pointing down, once its columns would be narrower than
		<code>minItemWidth</code> (160px). Drag the handle at the bottom-right of the box to resize it.
	</p>
	<fieldset class="orientation-picker">
		<legend class="demo-label">orientation</legend>
		<div class="demo-row">
			<CwRadio name="arrow-timeline-orientation" value="auto" label="auto" bind:group={orientation} />
			<CwRadio
				name="arrow-timeline-orientation"
				value="horizontal"
				label="horizontal"
				bind:group={orientation}
			/>
			<CwRadio
				name="arrow-timeline-orientation"
				value="vertical"
				label="vertical"
				bind:group={orientation}
			/>
		</div>
	</fieldset>
	<div class="demo-panel resizable-stage">
		<CwColoredArrowTimeline items={season} {orientation} ariaLabel="Tomato season 2026" />
	</div>
	<DemoCodeExample code={orientationExample} title="Orientation" />
</section>

<section class="demo-section">
	<h3>Eight steps, eight colours</h3>
	<p class="demo-desc">
		Steps take <code>--cw-chart-cat-1</code> to <code>--cw-chart-cat-8</code> in order, the same
		palette as the donut and stacked bar charts. After eight steps the palette starts again;
		neighbouring steps never share a colour.
	</p>
	<div class="demo-panel">
		<CwColoredArrowTimeline items={weeks} minItemWidth={110} ariaLabel="Seedling schedule" />
	</div>
	<DemoCodeExample code={paletteExample} title="Default palette" />
</section>

<section class="demo-section">
	<h3>Custom colours and size</h3>
	<p class="demo-desc">
		Give a step its own <code>color</code>, and change the arrow thickness, tip depth and gap with
		CSS custom properties on the component or any parent element.
	</p>
	<div class="demo-panel">
		<CwColoredArrowTimeline
			items={custom}
			ariaLabel="Order status"
			--cw-colored-arrow-timeline-band="1.75rem"
			--cw-colored-arrow-timeline-tip="0.875rem"
			--cw-colored-arrow-timeline-gap="3px"
		/>
	</div>
	<DemoCodeExample code={customExample} title="Custom colours and size" />
</section>

<style>
	.progress-controls {
		margin-bottom: var(--cw-space-3);
	}

	.progress-status {
		margin-top: 0;
	}

	.orientation-picker {
		margin: 0 0 var(--cw-space-3);
		padding: 0;
		border: 0;
	}

	.resizable-stage {
		width: 100%;
		min-width: 14rem;
		max-width: 100%;
		overflow: auto;
		resize: horizontal;
	}
</style>
