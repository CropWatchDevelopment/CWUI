<script lang="ts">
	import { CwAlertPointsEditor, CwCard } from '$lib/index.js';
	import type { CwAlertPointsValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	interface NormalizedAlertPoint {
		id: string;
		name: string;
		color: string;
		condition: string;
		value?: number | null;
		min?: number | null;
		max?: number | null;
	}

	function parseNumericInput(raw: string): number | null {
		const trimmed = raw.trim();
		if (!trimmed) return null;

		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}

	function normalizeAlertPoints(value: CwAlertPointsValue): {
		center: number;
		points: NormalizedAlertPoint[];
	} {
		return {
			center: parseNumericInput(value.center) ?? 0,
			points: value.points.map((point) => {
				const base = {
					id: point.id,
					name: point.name,
					color: point.color,
					condition: point.condition
				};

				if (point.condition === 'range') {
					return {
						...base,
						min: parseNumericInput(point.min),
						max: parseNumericInput(point.max)
					};
				}

				return {
					...base,
					value: parseNumericInput(point.value)
				};
			})
		};
	}

	let alertPoints = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{
				id: 'alert-demo-1',
				name: 'Alert Point 1',
				color: '#f7903b',
				condition: 'equals',
				value: '1.12',
				min: '',
				max: ''
			},
			{
				id: 'alert-demo-2',
				name: 'Alert Point 2',
				color: '#42edf0',
				condition: 'range',
				value: '',
				min: '5',
				max: '10'
			}
		]
	});

	const normalizedOutput = $derived.by(() => normalizeAlertPoints(alertPoints));
	const outputJson = $derived.by(() => JSON.stringify(normalizedOutput, null, 2));
	const SCRIPT_CLOSE = '</' + 'script>';

	const componentExample = `<script lang="ts">
\timport { CwAlertPointsEditor } from '@cropwatchdevelopment/cwui';
\timport type { CwAlertPointsValue } from '@cropwatchdevelopment/cwui';

\tlet alertPoints = $state<CwAlertPointsValue>({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: []
\t});
${SCRIPT_CLOSE}

<CwAlertPointsEditor bind:value={alertPoints} />`;

	const translationExample = `<script lang="ts">
\timport { CwAlertPointsEditor } from '@cropwatchdevelopment/cwui';
\timport type {
\t\tCwAlertPointsEditorText,
\t\tCwAlertPointsValue
\t} from '@cropwatchdevelopment/cwui';
\timport { t } from '$lib/i18n';

\tlet alertPoints = $state<CwAlertPointsValue>({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: [
\t\t\t{
\t\t\t\tid: 'alert-demo-1',
\t\t\t\tname: t('alerts.points.coldEdge'),
\t\t\t\tcolor: '#f7903b',
\t\t\t\tcondition: 'lessThanOrEqual',
\t\t\t\tvalue: '-2',
\t\t\t\tmin: '',
\t\t\t\tmax: ''
\t\t\t}
\t\t]
\t});

\tconst alertPointsText: CwAlertPointsEditorText = {
\t\tunitFieldLabel: t('alerts.labels.unit'),
\t\tcenterFieldLabel: t('alerts.labels.center'),
\t\tnameFieldLabel: t('alerts.labels.name'),
\t\tconditionFieldLabel: t('alerts.labels.condition'),
\t\tvalueFieldLabel: t('alerts.labels.value'),
\t\tminValueFieldLabel: t('alerts.labels.min'),
\t\tmaxValueFieldLabel: t('alerts.labels.max'),
\t\tcolorFieldLabel: t('alerts.labels.color'),
\t\taddAlertPointButton: t('alerts.actions.add'),
\t\tremovePointButton: t('alerts.actions.remove'),
\t\temptyTitle: t('alerts.empty.title'),
\t\temptyDescription: t('alerts.empty.description'),
\t\tfieldLabelWithUnit: (label, unit) =>
\t\t\tt('alerts.format.fieldWithUnit', { label, unit }),
\t\trequiredFieldError: (label) =>
\t\t\tt('alerts.validation.required', { label }),
\t\tinvalidPreviewNote: (count) =>
\t\t\tt('alerts.preview.invalidCount', { count }),
\t\toverlapPreviewNote: (count) =>
\t\t\tt('alerts.preview.overlapCount', { count }),
\t\tpointDescriptionEquals: (value, unit) =>
\t\t\tt('alerts.preview.equals', { value, unit }),
\t\tpointDescriptionRange: (min, max, unit) =>
\t\t\tt('alerts.preview.range', { min, max, unit }),
\t\tpointDescriptionLessThan: (value, unit) =>
\t\t\tt('alerts.preview.lessThan', { value, unit }),
\t\tpointDescriptionLessThanOrEqual: (value, unit) =>
\t\t\tt('alerts.preview.lessThanOrEqual', { value, unit }),
\t\tpointDescriptionGreaterThan: (value, unit) =>
\t\t\tt('alerts.preview.greaterThan', { value, unit }),
\t\tpointDescriptionGreaterThanOrEqual: (value, unit) =>
\t\t\tt('alerts.preview.greaterThanOrEqual', { value, unit }),
\t\toverlapError: (labels) =>
\t\t\tt('alerts.validation.overlap', { labels: labels.join(', ') })
\t};
${SCRIPT_CLOSE}

<CwAlertPointsEditor bind:value={alertPoints} text={alertPointsText} />`;
</script>

<h2>CwAlertPointsEditor</h2>
<p class="demo-desc">
	Interactive number-line builder for alert points, thresholds, and ranges. The unit switch is visual-only, while the bound value and normalized output stay in Celsius.
</p>
<p class="demo-desc">
	All built-in labels, validation messages, empty states, and preview sentences can now be passed through the <code>text</code> prop. Rule names are still part of the bound <code>value.points[]</code> data, so translate those in your own state as well.
</p>

<section class="demo-section">
	<CwAlertPointsEditor bind:value={alertPoints} tickCount={1} />
</section>

<section class="demo-grid">
	<CwCard class="demo-panel" padded={false}>
		<article class="demo-panel__content">
			<div class="demo-panel__head">
				<div>
					<p class="demo-panel__eyebrow">Reactive output</p>
					<h3>Normalized object preview</h3>
				</div>
				<p>Numeric fields are converted from the editable strings into Celsius numbers or <code>null</code>.</p>
			</div>

			<pre class="demo-code"><code>{outputJson}</code></pre>
		</article>
	</CwCard>

	<CwCard class="demo-panel" padded={false}>
		<article class="demo-panel__content">
			<div class="demo-panel__head">
				<div>
					<p class="demo-panel__eyebrow">Copy-paste starter</p>
					<h3>Basic usage</h3>
				</div>
				<p>Bind the full editor state, then normalize the Celsius-backed strings before sending them to an API.</p>
			</div>

			<DemoCodeExample code={componentExample} title="CwAlertPointsEditor example" />
		</article>
	</CwCard>

	<CwCard class="demo-panel" padded={false}>
		<article class="demo-panel__content">
			<div class="demo-panel__head">
				<div>
					<p class="demo-panel__eyebrow">Translation-ready</p>
					<h3>Pass every UI string through your i18n layer</h3>
				</div>
				<p>Use the <code>text</code> prop for the component copy, and keep translated rule names in <code>value.points[].name</code>.</p>
			</div>

			<DemoCodeExample code={translationExample} title="CwAlertPointsEditor i18n example" />
		</article>
	</CwCard>
</section>

<style>
	h2 {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
	}

	h3 {
		margin: 0;
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.demo-desc {
		margin: 0 0 var(--cw-space-5);
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		line-height: 1.7;
		max-width: 72ch;
	}

	.demo-section {
		margin-bottom: var(--cw-space-6);
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(21rem, 1fr));
		gap: var(--cw-space-4);
		align-items: start;
	}

	:global(.demo-panel) {
		height: 100%;
	}

	:global(.demo-panel .cw-card__body) {
		padding: 0;
	}

	.demo-panel__content {
		display: grid;
		gap: var(--cw-space-4);
		padding: clamp(1rem, 2vw, 1.35rem);
	}

	.demo-panel__head {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-panel__eyebrow {
		margin: 0 0 var(--cw-space-1);
		font-size: 0.72rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cw-accent);
	}

	.demo-panel__head p {
		margin: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
	}

	.demo-panel__head code {
		font-family: var(--cw-font-mono);
		font-size: 0.78rem;
	}

	.demo-code {
		margin: 0;
		padding: var(--cw-space-4);
		overflow-x: auto;
		border-radius: var(--cw-radius-md);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 74%, transparent);
		background: color-mix(in srgb, var(--cw-bg-base) 84%, black);
	}

	.demo-code code {
		font-family: var(--cw-font-mono);
		font-size: 0.8rem;
		line-height: 1.7;
		color: var(--cw-text-primary);
	}
</style>
