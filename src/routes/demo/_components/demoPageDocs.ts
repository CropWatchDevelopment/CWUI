export interface DemoGuideStep {
	title: string;
	description: string;
}

export interface DemoApiRow {
	name: string;
	type: string;
	description: string;
	defaultValue?: string;
	required?: boolean;
}

export interface DemoCodeSnippet {
	title: string;
	description?: string;
	code: string;
}

export interface DemoRouteDocs {
	summary: string;
	steps: DemoGuideStep[];
	apiRows: DemoApiRow[];
	examples: DemoCodeSnippet[];
	apiTitle?: string;
	apiNote?: string;
}

export const demoRouteDocs: Record<string, DemoRouteDocs> = {
	'/demo/buttons': {
		summary:
			'CwButton is the standard action component. Use it for labeled actions, icon-and-text buttons, and icon-only controls that still need a proper accessible name.',
		steps: [
			{
				title: 'Choose the role first',
				description:
					'Use `primary` for the main action on the page, `secondary` or `ghost` for supporting actions, and `danger` for destructive work.'
			},
			{
				title: 'Size for layout, not emphasis',
				description:
					'`sm`, `md`, and `lg` only change spacing and font size. They do not change the semantic priority of the action.'
			},
			{
				title: 'Prefer `loading` over manual spinners',
				description:
					'The component automatically disables itself and swaps in the shared spinner while async work is running.'
			},
			{
				title: 'Label icon-only buttons accessibly',
				description:
					'If the button has no visible text, provide `aria-label`. You can render the icon inline as children or pass it through the `icon` prop.'
			}
		],
		apiRows: [
			{
				name: 'variant',
				type: "'primary' | 'secondary' | 'ghost' | 'danger' | 'info'",
				description: 'Visual treatment for the action.',
				defaultValue: 'primary'
			},
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				description: 'Padding and font scale.',
				defaultValue: 'md'
			},
			{
				name: 'loading',
				type: 'boolean',
				description: 'Shows the built-in spinner and disables the button.',
				defaultValue: 'false'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Prevents interaction without showing a loading spinner.',
				defaultValue: 'false'
			},
			{
				name: 'fullWidth',
				type: 'boolean',
				description: 'Expands the button to the width of its container.',
				defaultValue: 'false'
			},
			{
				name: 'icon',
				type: "string | { src: string } | { default: string } | Snippet",
				description: 'Optional leading icon asset or snippet. For icon-only buttons, pair it with `aria-label`.'
			},
			{
				name: 'children',
				type: 'Snippet',
				description: 'Button content. This can be text, icon-only markup, or mixed inline content.'
			},
			{
				name: '...native button attrs',
				type: 'HTMLButtonAttributes',
				description:
					'Pass `type`, `name`, `value`, `aria-*`, `onclick`, and standard button attributes directly to the underlying `<button>`.'
			}
		],
		apiNote: 'The docs table lists the CWUI-specific API. Native button attributes still pass through.',
		examples: [
			{
				title: 'Primary and supporting actions',
				description: 'This is the default pattern for forms, drawers, and dialogs.',
				code: `<CwButton variant="primary">Save changes</CwButton>
<CwButton variant="secondary">Preview</CwButton>
<CwButton variant="ghost">Cancel</CwButton>`
			},
			{
				title: 'Loading submit button',
				description: 'Use `loading` instead of manually wiring your own spinner.',
				code: `<script lang="ts">
\tlet saving = $state(false);

\tasync function submitForm() {
\t\tsaving = true;
\t\tawait new Promise((resolve) => setTimeout(resolve, 900));
\t\tsaving = false;
\t}
</script>

<CwButton
\tvariant="primary"
\tsize="lg"
\tfullWidth
\ttype="submit"
\tloading={saving}
\tonclick={submitForm}
>
\tSave irrigation plan
</CwButton>`
			},
			{
				title: 'Icon-only and icon-prop buttons',
				description: 'Use inline markup when you want full control, or `icon={...}` when you already have an asset import.',
				code: `<script lang="ts">
\timport moreVertIcon from '$lib/icons/more_vert.svg';
</script>

<CwButton variant="secondary" aria-label="Refresh data">
\t<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
\t\t<path
\t\t\td="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
\t\t\tstroke="currentColor"
\t\t\tstroke-width="1.4"
\t\t\tstroke-linecap="round"
\t\t/>
\t\t<path
\t\t\td="M11.7 3.2h2.4v2.4"
\t\t\tstroke="currentColor"
\t\t\tstroke-width="1.4"
\t\t\tstroke-linecap="round"
\t\t\tstroke-linejoin="round"
\t\t/>
\t</svg>
</CwButton>

<CwButton variant="primary" aria-label="More actions" icon={moreVertIcon} />`
			}
		]
	},
	'/demo/badge': {
		summary:
			'CwBadge decorates existing content. The wrapped content is still the thing users interact with; the badge only adds count, dot, or custom status UI around it.',
		steps: [
			{
				title: 'Wrap the real target',
				description:
					'Place the button, icon, or avatar you already have inside `CwBadge` so the badge stays anchored to it.'
			},
			{
				title: 'Pick one display mode',
				description:
					'Use `value` for counts, `dot` for a simple indicator, or the `badge` snippet when you need custom markup.'
			},
			{
				title: 'Clamp noisy counts',
				description:
					'Set `max` so large numbers stay compact, for example showing `99+` instead of overflowing.'
			}
		],
		apiRows: [
			{
				name: 'position',
				type: "'top_left' | 'top_right' | 'bottom_left' | 'bottom_right'",
				description: 'Corner where the badge is anchored.',
				defaultValue: 'top_right'
			},
			{
				name: 'tone',
				type: 'CwTone',
				description: 'Color theme applied to the badge.',
				defaultValue: 'danger'
			},
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				description: 'Badge size preset.',
				defaultValue: 'md'
			},
			{
				name: 'value',
				type: 'string | number',
				description: 'Text or numeric count displayed inside the badge.'
			},
			{
				name: 'max',
				type: 'number',
				description: 'Upper cap before a numeric value is rendered as `max+`.',
				defaultValue: '99'
			},
			{
				name: 'dot',
				type: 'boolean',
				description: 'Renders a dot-only badge with no text.',
				defaultValue: 'false'
			},
			{
				name: 'hidden',
				type: 'boolean',
				description: 'Keeps the wrapped content visible while hiding the badge.',
				defaultValue: 'false'
			},
			{
				name: 'children',
				type: 'Snippet',
				description: 'The wrapped content the badge is attached to.',
				required: true
			},
			{
				name: 'badge',
				type: 'Snippet',
				description: 'Optional custom badge content. Overrides normal text rendering.'
			}
		],
		examples: [
			{
				title: 'Count badge with cap',
				description: 'Good for notifications, queue depth, or unread counts.',
				code: `<CwBadge value={147} max={99} tone="danger" position="top_right">
\t<button type="button">Alerts</button>
</CwBadge>`
			},
			{
				title: 'Dot and custom badge content',
				description: 'Use the `badge` snippet when you need something richer than a number.',
				code: `<script lang="ts">
\tlet online = $state(true);
</script>

<CwBadge dot tone="success" hidden={!online}>
\t<button type="button">Gateway</button>
</CwBadge>

<CwBadge position="bottom_left" tone="info">
\t{#snippet badge()}
\t\t<span style="padding-inline:0.25rem">NEW</span>
\t{/snippet}
\t<button type="button">Firmware</button>
</CwBadge>`
			}
		]
	},
	'/demo/cards': {
		summary:
			'CwCard gives you a consistent container for summaries, forms, charts, and lists. Use the simple title props first, then switch to snippets only when the header needs custom layout.',
		steps: [
			{
				title: 'Start with title and subtitle',
				description:
					'Most cards only need `title`, optional `subtitle`, and body content in the default snippet.'
			},
			{
				title: 'Add actions before replacing the header',
				description:
					'If you only need buttons on the right side, use the `actions` snippet instead of fully overriding the header.'
			},
			{
				title: 'Disable padding only for full-bleed content',
				description:
					'Charts, tables, or media blocks sometimes need edge-to-edge layout. Everything else should usually keep the default padding.'
			}
		],
		apiRows: [
			{ name: 'title', type: 'string', description: 'Header title text.' },
			{ name: 'subtitle', type: 'string', description: 'Secondary text under the title.' },
			{
				name: 'titleAlign',
				type: "'left' | 'center' | 'right'",
				description: 'Alignment for the built-in title/subtitle block.',
				defaultValue: 'left'
			},
			{
				name: 'padded',
				type: 'boolean',
				description: 'Controls the built-in inner padding.',
				defaultValue: 'true'
			},
			{
				name: 'elevated',
				type: 'boolean',
				description: 'Adds stronger shadow treatment for emphasis.',
				defaultValue: 'false'
			},
			{
				name: 'children',
				type: 'Snippet',
				description: 'Main body content rendered in the card.'
			},
			{
				name: 'header',
				type: 'Snippet',
				description: 'Fully custom header markup. Replaces the built-in title block.'
			},
			{
				name: 'subtitleSlot',
				type: 'Snippet',
				description: 'Extra inline content rendered inside the subtitle area.'
			},
			{
				name: 'actions',
				type: 'Snippet',
				description: 'Right-aligned header actions such as buttons or status pills.'
			}
		],
		examples: [
			{
				title: 'Simple summary card',
				description: 'Use this version for most dashboard tiles.',
				code: `<CwCard title="Device summary" subtitle="Greenhouse 7" elevated>
\t{#snippet actions()}
\t\t<CwButton size="sm" variant="ghost">Refresh</CwButton>
\t{/snippet}
\t{#snippet children()}
\t\t<p>All irrigation zones reported in the last 5 minutes.</p>
\t{/snippet}
</CwCard>`
			},
			{
				title: 'Custom header and full-bleed body',
				description: 'Switch to snippets when the header layout needs custom composition.',
				code: `<CwCard padded={false}>
\t{#snippet header()}
\t\t<div style="padding:1rem 1rem 0;display:flex;justify-content:space-between;gap:1rem">
\t\t\t<div>
\t\t\t\t<h3 style="margin:0">Reservoir trend</h3>
\t\t\t\t<p style="margin:0.35rem 0 0">24 hour water level</p>
\t\t\t</div>
\t\t\t<CwBadge value="Live" tone="success">
\t\t\t\t<span />
\t\t\t</CwBadge>
\t\t</div>
\t{/snippet}
\t{#snippet children()}
\t\t<div style="height:14rem;background:var(--cw-bg-muted)"></div>
\t{/snippet}
</CwCard>`
			}
		]
	},
	'/demo/chips': {
		summary:
			'CwChip is for compact labels, filters, and statuses. The API is intentionally small: pick a tone, variant, size, and optionally let the user dismiss it.',
		steps: [
			{
				title: 'Use chips for short labels',
				description:
					'Chips work best for concise status or filter text, not paragraphs or multi-line controls.'
			},
			{
				title: 'Pick the variant by visual weight',
				description:
					'`soft` is the calm default, `solid` is strongest, and `outline` keeps the background clean.'
			},
			{
				title: 'Only make it dismissible when removal matters',
				description:
					'If the user should clear a filter or token, set `dismissible` and handle `ondismiss`.'
			}
		],
		apiRows: [
			{ name: 'label', type: 'string', description: 'Visible chip text.', required: true },
			{
				name: 'tone',
				type: 'CwTone',
				description: 'Color theme for the chip.',
				defaultValue: 'primary'
			},
			{
				name: 'variant',
				type: "'solid' | 'soft' | 'outline'",
				description: 'Visual style preset.',
				defaultValue: 'soft'
			},
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				description: 'Chip scale.',
				defaultValue: 'md'
			},
			{
				name: 'dismissible',
				type: 'boolean',
				description: 'Shows the dismiss button.',
				defaultValue: 'false'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Disables chip dismissal and dims the UI.',
				defaultValue: 'false'
			},
			{
				name: 'ondismiss',
				type: '() => void',
				description: 'Called when the dismiss affordance is activated.'
			}
		],
		examples: [
			{
				title: 'Static status chips',
				description: 'Use tone and variant to control how much the chip stands out.',
				code: `<CwChip tone="success" variant="soft" label="Online" />
<CwChip tone="warning" variant="outline" label="Review needed" />
<CwChip tone="danger" variant="solid" size="sm" label="Alarm" />`
			},
			{
				title: 'Dismissible filter chip',
				description: 'Useful for removable filter tokens or selected facets.',
				code: `<script lang="ts">
\tlet filters = $state(['North greenhouse', 'Offline devices']);
</script>

{#each filters as filter}
\t<CwChip
\t\tlabel={filter}
\t\tdismissible
\t\tondismiss={() => (filters = filters.filter((item) => item !== filter))}
\t/>
{/each}

<CwChip label="Locked filter" dismissible disabled />`
			}
		]
	},
	'/demo/linechart': {
		summary:
			'CwLineChart is the low-level time-series chart for sensor history. Pass a primary series, optionally add a secondary right-axis series, and the component handles responsive sizing, auto-scaled axes, a hover crosshair, standalone alert markers, named thresholds, and legend toggles.',
		steps: [
			{
				title: 'Start with the primary series',
				description:
					'`data` is the only required prop. Each point needs a `timestamp` and `value`, and you can still attach legacy `alert` metadata directly to a point when that is the simplest shape.'
			},
			{
				title: 'Add `secondaryData` only for different units',
				description:
					'When the second series needs its own scale, pass `secondaryData` and the matching `secondaryLabel` / `secondaryUnit`. The chart automatically adds a right Y-axis and dashed line.'
			},
			{
				title: 'Prefer `alertPoints` for explicit markers',
				description:
					'Use `alertPoints` when alerts should be managed separately from the primary data array. The chart still supports the older `data[].alert` shorthand for one-off cases.'
			},
			{
				title: 'Use `thresholds` for named horizontal rules',
				description:
					'`thresholds` is the preferred API for multiple named lines. Hovering near a threshold shows its name and value in the tooltip. The old `threshold` prop remains as a single-line shorthand.'
			},
			{
				title: 'Adjust height to the surface',
				description:
					'Use taller charts for analysis views and shorter ones for cards. Set `showGrid={false}` when the surrounding layout already gives enough visual structure.'
			}
		],
		apiTitle: 'Props and data shape',
		apiNote:
			'CwLineChart has no slots or callbacks. The hover tooltip, crosshair, responsive width observer, and legend toggles are built in.',
		apiRows: [
			{
				name: 'data',
				type: 'CwLineChartDataPoint[]',
				description: 'Primary time-series data rendered against the left Y-axis.',
				required: true
			},
			{
				name: 'data[].timestamp',
				type: 'string | Date',
				description: 'Point timestamp used for X-axis placement and tooltip formatting.'
			},
			{
				name: 'data[].value',
				type: 'number',
				description: 'Numeric reading plotted on the primary line and left Y-axis.'
			},
			{
				name: 'data[].alert',
				type: 'CwLineChartAlert',
				description:
					'Legacy single-alert shorthand attached directly to one primary data point.'
			},
			{
				name: 'data[].alerts',
				type: 'CwLineChartAlert[]',
				description:
					'Optional multiple alerts associated with a single primary data point.'
			},
			{
				name: 'alertPoints',
				type: 'CwLineChartAlertPoint[]',
				description:
					'Optional standalone alert markers. Use this when alerts are managed separately from the main data series.',
				defaultValue: '[]'
			},
			{
				name: 'secondaryData',
				type: 'CwLineChartSecondaryDataPoint[]',
				description:
					'Optional comparison series for the right Y-axis. Each point uses the same `timestamp` + `value` shape without alerts.',
				defaultValue: '[]'
			},
			{
				name: 'threshold',
				type: 'number',
				description:
					'Legacy single-threshold shorthand for the primary axis. Ignored when `thresholds` is provided.'
			},
			{
				name: 'thresholds',
				type: 'CwLineChartThreshold[]',
				description:
					'Named threshold lines drawn on the primary axis. Hovering near a line shows its name and value in the tooltip.',
				defaultValue: '[]'
			},
			{
				name: 'primaryLabel',
				type: 'string',
				description: 'Left-axis label and primary legend label.',
				defaultValue: 'Value'
			},
			{
				name: 'secondaryLabel',
				type: 'string',
				description: 'Right-axis label and secondary legend label.',
				defaultValue: 'Secondary'
			},
			{
				name: 'primaryUnit',
				type: 'string',
				description: 'Unit suffix used in the primary tooltip and threshold label.',
				defaultValue: "''"
			},
			{
				name: 'secondaryUnit',
				type: 'string',
				description: 'Unit suffix used in the secondary tooltip.',
				defaultValue: "''"
			},
			{
				name: 'height',
				type: 'number',
				description: 'Chart height in pixels.',
				defaultValue: '300'
			},
			{
				name: 'showGrid',
				type: 'boolean',
				description: 'Shows or hides the horizontal and vertical guide lines.',
				defaultValue: 'true'
			},
			{
				name: 'class',
				type: 'string',
				description: 'Optional class forwarded to the chart wrapper element.',
				defaultValue: "''"
			}
		],
		examples: [
			{
				title: 'Named thresholds and standalone alert points',
				description: 'This is the preferred setup when alert markers and threshold rules come from separate telemetry or rule data.',
				code: `<script lang="ts">
	import { CwLineChart } from '@cropwatchdevelopment/cwui';
	import type {
		CwLineChartAlertPoint,
		CwLineChartDataPoint,
		CwLineChartThreshold
	} from '@cropwatchdevelopment/cwui';

	const temperatureData: CwLineChartDataPoint[] = [
		{ timestamp: '2026-04-04T00:00:00Z', value: 21.4 },
		{ timestamp: '2026-04-04T06:00:00Z', value: 23.1 },
		{ timestamp: '2026-04-04T12:00:00Z', value: 27.8 },
		{ timestamp: '2026-04-04T18:00:00Z', value: 25.9 }
	];

	const temperatureThresholds: CwLineChartThreshold[] = [
		{ id: 'target-high', name: 'Target high', value: 24 },
		{ id: 'warning-high', name: 'Warning high', value: 27 },
		{ id: 'critical-high', name: 'Critical high', value: 29 }
	];

	const alertPoints: CwLineChartAlertPoint[] = [
		{
			id: 'spike',
			timestamp: '2026-04-04T12:00:00Z',
			value: 27.8,
			message: 'Short spike detected during the irrigation cycle.',
			severity: 'warning'
		},
		{
			id: 'critical',
			timestamp: '2026-04-04T18:00:00Z',
			value: 25.9,
			message: 'Critical thermal alert triggered after a rapid rise.',
			severity: 'critical'
		}
	];
</script>

<CwLineChart
	data={temperatureData}
	alertPoints={alertPoints}
	thresholds={temperatureThresholds}
	primaryLabel="Temperature"
	primaryUnit="°C"
	height={320}
/>`
			},
			{
				title: 'Dual-axis comparison chart',
				description: 'Use a second series when the comparison metric needs its own unit and scale.',
				code: `<script lang="ts">
	import { CwLineChart } from '@cropwatchdevelopment/cwui';
	import type {
		CwLineChartDataPoint,
		CwLineChartSecondaryDataPoint
	} from '@cropwatchdevelopment/cwui';

	const temperatureData: CwLineChartDataPoint[] = [
		{ timestamp: '2026-04-04T00:00:00Z', value: 21.4 },
		{ timestamp: '2026-04-04T06:00:00Z', value: 23.1 },
		{ timestamp: '2026-04-04T12:00:00Z', value: 27.8 },
		{ timestamp: '2026-04-04T18:00:00Z', value: 25.9 }
	];

	const humidityData: CwLineChartSecondaryDataPoint[] = [
		{ timestamp: '2026-04-04T00:00:00Z', value: 61 },
		{ timestamp: '2026-04-04T06:00:00Z', value: 58 },
		{ timestamp: '2026-04-04T12:00:00Z', value: 52 },
		{ timestamp: '2026-04-04T18:00:00Z', value: 56 }
	];
</script>

<CwLineChart
	data={temperatureData}
	secondaryData={humidityData}
	primaryLabel="Temperature"
	secondaryLabel="Humidity"
	primaryUnit="°C"
	secondaryUnit="%"
	height={360}
/>`
			},
			{
				title: 'Compact chart with the legacy shorthand',
				description: 'The older `threshold` and `data[].alert` API still works when you only need a single line and one or two inline point alerts.',
				code: `<script lang="ts">
	import { CwLineChart } from '@cropwatchdevelopment/cwui';
	import type { CwLineChartDataPoint } from '@cropwatchdevelopment/cwui';

	const moistureData: CwLineChartDataPoint[] = [
		{ timestamp: '2026-04-04T00:00:00Z', value: 41 },
		{
			timestamp: '2026-04-04T06:00:00Z',
			value: 37,
			alert: { id: 'dry-1', message: 'Zone A drifted below the target band.' }
		},
		{
			timestamp: '2026-04-04T12:00:00Z',
			value: 29,
			alert: { id: 'dry-2', message: 'Critical dry-back detected.', severity: 'critical' }
		},
		{ timestamp: '2026-04-04T18:00:00Z', value: 34 }
	];
</script>

<CwLineChart
	data={moistureData}
	threshold={35}
	primaryLabel="Soil moisture"
	primaryUnit="%"
	height={220}
	showGrid={false}
/>`
			}
		]
	},
	'/demo/donutchart': {
		summary:
			'CwDonutChart renders proportional segment totals with hover feedback. Build the `segments` array first, then adjust chart size and thickness to fit the layout.',
		steps: [
			{
				title: 'Model your data as labeled totals',
				description:
					'Each segment needs a `label` and `value`, with optional `color` when the defaults are not enough.'
			},
			{
				title: 'Tune size for the container',
				description:
					'Use `size` to fit the available space and `thickness` to control how heavy or airy the ring looks.'
			},
			{
				title: 'Hide the legend only in cramped layouts',
				description:
					'The legend improves readability, so turn it off only when the surrounding UI already labels the segments.'
			}
		],
		apiRows: [
			{ name: 'segments', type: 'CwDonutSegment[]', description: 'Chart segments to render.', required: true },
			{
				name: 'size',
				type: 'number',
				description: 'SVG width and height in pixels.',
				defaultValue: '200'
			},
			{
				name: 'thickness',
				type: 'number',
				description: 'Ring stroke width in pixels.',
				defaultValue: '40'
			},
			{
				name: 'showLegend',
				type: 'boolean',
				description: 'Shows or hides the legend beneath the chart.',
				defaultValue: 'true'
			},
			{
				name: 'segment.color',
				type: 'string',
				description: 'Optional per-segment CSS color override.'
			}
		],
		examples: [
			{
				title: 'Default donut chart',
				description: 'The legend and center total are enabled by default.',
				code: `<script lang="ts">
\tconst segments = [
\t\t{ label: 'Wheat', value: 340 },
\t\t{ label: 'Corn', value: 280 },
\t\t{ label: 'Soybeans', value: 190 }
\t];
</script>

<CwDonutChart {segments} />`
			},
			{
				title: 'Compact chart with custom colors',
				description: 'Useful when you already label the categories elsewhere on the page.',
				code: `<script lang="ts">
\tconst storageSegments = [
\t\t{ label: 'Free', value: 22, color: '#0f766e' },
\t\t{ label: 'Reserved', value: 11, color: '#f59e0b' },
\t\t{ label: 'Used', value: 67, color: '#dc2626' }
\t];
</script>

<CwDonutChart
\tsegments={storageSegments}
\tsize={160}
\tthickness={24}
\tshowLegend={false}
/>`
			}
		]
	},
	'/demo/dropdown': {
		summary:
			'CwDropdown is a custom select/combobox wrapper. Pass the option list, bind the selected value, and let the component handle keyboard navigation and popover positioning.',
		steps: [
			{
				title: 'Build the option list first',
				description:
					'Each option needs a `label` and `value`. Add `disabled` to any item that should be visible but not selectable.'
			},
			{
				title: 'Bind the selected value',
				description:
					'Use `bind:value` if the parent owns the selection state. Use `onchange` when you only need a callback.'
			},
			{
				title: 'Treat errors as field-level validation',
				description:
					'Use the `error` prop when the user must make a selection before continuing.'
			}
		],
		apiRows: [
			{ name: 'options', type: 'Array<{ label: string; value: string; disabled?: boolean }>', description: 'Items shown in the dropdown list.', required: true },
			{
				name: 'value',
				type: 'string',
				description: 'Selected option value. Bind this when the parent owns state.',
				defaultValue: "''"
			},
			{ name: 'label', type: 'string', description: 'Visible field label.' },
			{
				name: 'placeholder',
				type: 'string',
				description: 'Text shown before a value is selected.',
				defaultValue: 'Select...'
			},
			{
				name: 'required',
				type: 'boolean',
				description: 'Marks the hidden native input as required for form validation.',
				defaultValue: 'false'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Prevents opening the list or changing the value.',
				defaultValue: 'false'
			},
			{ name: 'error', type: 'string', description: 'Validation message rendered below the field.' },
			{ name: 'onchange', type: '(value: string) => void', description: 'Called when the selected value changes.' },
			{
				name: 'name / autocomplete',
				type: 'string',
				description: 'Optional native form attributes forwarded to the hidden input.'
			}
		],
		examples: [
			{
				title: 'Controlled dropdown',
				description: 'This is the most common usage in forms and filters.',
				code: `<script lang="ts">
\tconst fruitOptions = [
\t\t{ label: 'Apple', value: 'apple' },
\t\t{ label: 'Banana', value: 'banana' },
\t\t{ label: 'Dragonfruit', value: 'dragonfruit', disabled: true }
\t];
\tlet selectedFruit = $state('');
</script>

<CwDropdown
\toptions={fruitOptions}
\tlabel="Fruit"
\tplaceholder="Choose a fruit..."
\tbind:value={selectedFruit}
/>`
			},
			{
				title: 'Form validation and change callback',
				description: 'Use `required` and `error` when the selection is mandatory.',
				code: `<script lang="ts">
\tconst siteOptions = [
\t\t{ label: 'North greenhouse', value: 'north' },
\t\t{ label: 'South greenhouse', value: 'south' }
\t];
\tlet site = $state('');
\tlet error = $state('');

\tfunction handleChange(value: string) {
\t\tsite = value;
\t\terror = '';
\t}
</script>

<CwDropdown
\toptions={siteOptions}
\tname="site"
\trequired
\tlabel="Deployment site"
\terror={error}
\tvalue={site}
\tonchange={handleChange}
/>`
			}
		]
	},
	'/demo/multi-select': {
		summary:
			'CwMultiSelect mirrors CwDropdown but allows multiple options to be selected at once. The bound `value` is an array of `{ id, label }` entries, ready to send to a backend or render as chips elsewhere in your UI.',
		steps: [
			{
				title: 'Build the option list',
				description:
					'Each option needs a `label` and `value`. Add `disabled` to make an item visible but not selectable.'
			},
			{
				title: 'Bind an array',
				description:
					'`value` is an array of `{ id, label }`. Use `bind:value` if the parent owns the selection state, or `onchange` if you only need a callback.'
			},
			{
				title: 'Toggle to select / deselect',
				description:
					'Clicking an option (or pressing Enter/Space while focused in the listbox) toggles its membership in the array. The list stays open so users can pick more than one.'
			},
			{
				title: 'Clear or remove individual chips',
				description:
					'A "Clear all" action appears in the listbox while items are selected (`clearable` defaults to true). Individual chips can be dismissed by clicking the small × on the trigger.'
			}
		],
		apiRows: [
			{
				name: 'options',
				type: 'Array<{ label: string; value: string; disabled?: boolean }>',
				description: 'Items shown in the listbox.',
				required: true
			},
			{
				name: 'value',
				type: 'Array<{ id: string; label: string }>',
				description: 'Selected entries. Bind this when the parent owns state.',
				defaultValue: '[]'
			},
			{ name: 'label', type: 'string', description: 'Visible field label.' },
			{
				name: 'placeholder',
				type: 'string',
				description: 'Text shown when nothing is selected.',
				defaultValue: 'Select...'
			},
			{
				name: 'maxVisibleChips',
				type: 'number',
				description: 'How many chips to render in the trigger before collapsing into "+N more". Ignored when `showAllSelectedItems` is true.',
				defaultValue: '3'
			},
			{
				name: 'showAllSelectedItems',
				type: 'boolean',
				description: 'Render every selected chip in the trigger and let it wrap. Overrides `maxVisibleChips`.',
				defaultValue: 'false'
			},
			{
				name: 'clearable',
				type: 'boolean',
				description: 'Show a "Clear all" action inside the listbox when at least one item is selected.',
				defaultValue: 'true'
			},
			{
				name: 'clearLabel',
				type: 'string',
				description: 'Label used for the "Clear all" action.',
				defaultValue: "'Clear all'"
			},
			{
				name: 'required',
				type: 'boolean',
				description: 'Marks the hidden native input as required for form validation when nothing is selected.',
				defaultValue: 'false'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Prevents opening the list, removing chips, or changing the value.',
				defaultValue: 'false'
			},
			{ name: 'error', type: 'string', description: 'Validation message rendered below the field.' },
			{
				name: 'onchange',
				type: '(value: Array<{ id: string; label: string }>) => void',
				description: 'Called whenever the selection array changes.'
			},
			{
				name: 'name / autocomplete',
				type: 'string',
				description: 'Optional native form attributes forwarded to the hidden input. The hidden input value is the comma-joined list of ids.'
			}
		],
		examples: [
			{
				title: 'Controlled multi-select',
				description: 'The bound value is an array of `{ id, label }` entries — easy to render or persist.',
				code: `<script lang="ts">
\timport { CwMultiSelect } from '@cropwatchdevelopment/cwui';

\tconst options = [
\t\t{ label: 'Apple', value: 'apple' },
\t\t{ label: 'Banana', value: 'banana' },
\t\t{ label: 'Dragonfruit', value: 'dragonfruit' }
\t];

\tlet selected = $state<{ id: string; label: string }[]>([]);
<\/script>

<CwMultiSelect
\toptions={options}
\tlabel="Fruit"
\tplaceholder="Choose one or more..."
\tbind:value={selected}
/>`
			},
			{
				title: 'Pre-selected values + onchange callback',
				description: 'Seed the array with existing selections and listen for changes.',
				code: `<script lang="ts">
\tconst siteOptions = [
\t\t{ label: 'North greenhouse', value: 'north' },
\t\t{ label: 'South greenhouse', value: 'south' },
\t\t{ label: 'East greenhouse', value: 'east' }
\t];

\tlet sites = $state([
\t\t{ id: 'north', label: 'North greenhouse' }
\t]);

\tfunction handleChange(value: { id: string; label: string }[]) {
\t\tconsole.log('Selected sites:', value.map((v) => v.id));
\t}
<\/script>

<CwMultiSelect
\toptions={siteOptions}
\tname="sites"
\tlabel="Deployment sites"
\tbind:value={sites}
\tonchange={handleChange}
/>`
			}
		]
	},
	'/demo/dialog': {
		summary:
			'CwDialog wraps a native `<dialog>` element with the behavior most apps want by default: open state binding, title, actions, escape handling, and backdrop close.',
		steps: [
			{
				title: 'Control visibility from the parent',
				description:
					'Use `bind:open` so the surrounding page decides when the dialog appears and disappears.'
			},
			{
				title: 'Put body content in `children` and footer buttons in `actions`',
				description:
					'This keeps the markup easy to scan and matches the built-in dialog layout.'
			},
			{
				title: 'Tighten close behavior only when needed',
				description:
					'Leave backdrop and escape close enabled unless the user must complete an explicit step.'
			}
		],
		apiRows: [
			{ name: 'open', type: 'boolean', description: 'Dialog visibility state.', defaultValue: 'false' },
			{ name: 'title', type: 'string', description: 'Title shown in the dialog header.' },
			{
				name: 'closeOnBackdrop',
				type: 'boolean',
				description: 'Allows clicking the backdrop to close the dialog.',
				defaultValue: 'true'
			},
			{
				name: 'closeOnEscape',
				type: 'boolean',
				description: 'Allows the Escape key to close the dialog.',
				defaultValue: 'true'
			},
			{ name: 'children', type: 'Snippet', description: 'Main dialog content.' },
			{ name: 'actions', type: 'Snippet', description: 'Footer actions row.' },
			{ name: 'onclose', type: '() => void', description: 'Runs whenever the dialog closes itself.' }
		],
		examples: [
			{
				title: 'Confirmation dialog',
				description: 'The parent owns the `open` state and the action buttons close the dialog explicitly.',
				code: `<script lang="ts">
\tlet confirmOpen = $state(false);
</script>

<CwButton onclick={() => (confirmOpen = true)}>Delete zone</CwButton>

<CwDialog bind:open={confirmOpen} title="Delete zone">
\t{#snippet children()}
\t\t<p>This removes the zone and its alert rules.</p>
\t{/snippet}
\t{#snippet actions()}
\t\t<CwButton variant="ghost" onclick={() => (confirmOpen = false)}>Cancel</CwButton>
\t\t<CwButton variant="danger" onclick={() => (confirmOpen = false)}>Delete</CwButton>
\t{/snippet}
</CwDialog>`
			},
			{
				title: 'Blocking dialog',
				description: 'Only use this pattern when the user must complete an intentional workflow.',
				code: `<script lang="ts">
\tlet blockingOpen = $state(true);
\tlet closed = $state(false);
</script>

<CwDialog
\tbind:open={blockingOpen}
\ttitle="Required acknowledgement"
\tcloseOnBackdrop={false}
\tcloseOnEscape={false}
\tonclose={() => (closed = true)}
>
\t{#snippet children()}
\t\t<p>Read the maintenance notice before continuing.</p>
\t{/snippet}
\t{#snippet actions()}
\t\t<CwButton onclick={() => (blockingOpen = false)}>I understand</CwButton>
\t{/snippet}
</CwDialog>`
			}
		]
	},
	'/demo/offline': {
		summary:
			'CwOfflineOverlay can either follow the browser network state automatically or be forced into offline mode for testing. It also shows a short reconnected toast when the connection comes back.',
		steps: [
			{
				title: 'Use real browser state in production',
				description:
					'Leave `forceOffline` undefined when you want the component to respond to actual `online` and `offline` browser events.'
			},
			{
				title: 'Force the state in demos or tests',
				description:
					'Pass `true` or `false` to `forceOffline` when you need deterministic UI state.'
			},
			{
				title: 'Decide what Retry should do',
				description:
					'If you do not pass `onRetry`, the component falls back to reloading the page.'
			}
		],
		apiRows: [
			{
				name: 'forceOffline',
				type: 'boolean | undefined',
				description: 'Forces the offline state for demos or tests. Leave undefined to use real browser state.'
			},
			{
				name: 'reconnectedDurationMs',
				type: 'number',
				description: 'How long the "back online" toast stays visible.',
				defaultValue: '3000'
			},
			{
				name: 'onRetry',
				type: '() => void',
				description: 'Retry handler. Falls back to `window.location.reload()` when omitted.'
			},
			{
				name: 'showRetryButton',
				type: 'boolean',
				description: 'Shows or hides the retry button.',
				defaultValue: 'true'
			},
			{
				name: 'retryLabel',
				type: 'string',
				description: 'Text displayed inside the retry button.',
				defaultValue: 'Try Again'
			}
		],
		examples: [
			{
				title: 'Test the overlay with a local toggle',
				description: 'This is the safest way to develop the offline UI.',
				code: `<script lang="ts">
\tlet simulateOffline = $state(false);
</script>

<CwSwitch label="Simulate offline" bind:checked={simulateOffline} />

<CwOfflineOverlay
\tforceOffline={simulateOffline}
\tonRetry={() => (simulateOffline = false)}
/>`
			},
			{
				title: 'Production usage with custom retry behavior',
				description: 'Leave `forceOffline` unset when the browser should drive the state.',
				code: `<CwOfflineOverlay
\treconnectedDurationMs={5000}
\tretryLabel="Reconnect now"
\tonRetry={() => refreshDashboardData()}
/>`
			}
		]
	},
	'/demo/search': {
		summary:
			'CwSearchInput is for async suggestion search. It handles debouncing, cancellation, keyboard navigation, and selected-value binding so you can focus on fetching and mapping results.',
		steps: [
			{
				title: 'Return suggestions from `fetchSuggestions`',
				description:
					'The callback receives both the query string and an `AbortSignal`. Respect the signal so old requests can be cancelled cleanly.'
			},
			{
				title: 'Map objects into labels and values',
				description:
					'For simple string arrays the defaults are enough. For object results, provide `mapSuggestionToLabel` and `mapSuggestionToValue`.'
			},
			{
				title: 'Separate typing from selection',
				description:
					'Use `oninput` to respond to free typing and `onselect` when the user actually chooses a suggestion.'
			}
		],
		apiRows: [
			{
				name: 'value',
				type: 'string',
				description: 'Current text value. Bind this when the parent owns the field state.',
				defaultValue: "''"
			},
			{ name: 'fetchSuggestions', type: '(query: string, signal: AbortSignal) => Promise<unknown[]>', description: 'Async loader for the suggestion list.' },
			{
				name: 'minChars',
				type: 'number',
				description: 'Minimum characters before fetching suggestions.',
				defaultValue: '3'
			},
			{
				name: 'debounceMs',
				type: 'number',
				description: 'Delay before triggering `fetchSuggestions`.',
				defaultValue: '250'
			},
			{
				name: 'mapSuggestionToLabel',
				type: '(item: unknown) => string',
				description: 'Converts a result item into visible list text.'
			},
			{
				name: 'mapSuggestionToValue',
				type: '(item: unknown) => string',
				description: 'Converts a result item into the bound field value.'
			},
			{ name: 'label / placeholder', type: 'string', description: 'Optional field label and empty-state prompt.' },
			{
				name: 'clearable',
				type: 'boolean',
				description: 'Shows a clear button when the field has content.',
				defaultValue: 'true'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Disables typing and selection.',
				defaultValue: 'false'
			},
			{
				name: 'oninput',
				type: '(value: string) => void',
				description: 'Runs whenever the raw text changes.'
			},
			{
				name: 'onselect',
				type: '(value: string, item: unknown) => void',
				description: 'Runs when the user chooses a suggestion.'
			}
		],
		apiNote:
			'Native field props such as `name`, `required`, `autocomplete`, and `class` are also supported.',
		examples: [
			{
				title: 'Search over a simple string list',
				description: 'The default mapping helpers are enough when your suggestions are already strings.',
				code: `<script lang="ts">
\tconst crops = ['Tomato', 'Pepper', 'Lettuce', 'Basil'];
\tlet value = $state('');

\tasync function fetchSuggestions(query: string, signal: AbortSignal) {
\t\tawait new Promise((resolve) => setTimeout(resolve, 250));
\t\tif (signal.aborted) throw new DOMException('Aborted', 'AbortError');
\t\treturn crops.filter((crop) => crop.toLowerCase().includes(query.toLowerCase()));
\t}
</script>

<CwSearchInput
\tlabel="Search crops"
\tminChars={1}
\tfetchSuggestions={fetchSuggestions}
\tbind:value={value}
/>`
			},
			{
				title: 'Search object results with custom mapping',
				description: 'Use this pattern when the API returns structured objects.',
				code: `<script lang="ts">
\tlet selectedId = $state('');

\tasync function fetchDevices(query: string, signal: AbortSignal) {
\t\tconst response = await fetch('/api/devices?q=' + encodeURIComponent(query), { signal });
\t\treturn await response.json();
\t}
</script>

<CwSearchInput
\tlabel="Search devices"
\tname="device"
\tplaceholder="Type device name or serial..."
\tfetchSuggestions={fetchDevices}
\tmapSuggestionToLabel={(item) => \`\${item.name} (\${item.serial})\`}
\tmapSuggestionToValue={(item) => item.id}
\toninput={(value) => console.log('Typing:', value)}
\tonselect={(value, item) => {
\t\tselectedId = value;
\t\tconsole.log('Selected device:', item);
\t}}
/>`
			}
		]
	},
	'/demo/inputs': {
		summary:
			'CwInput is a single component that covers standard text fields plus CropWatch-specific formatting helpers like DevEUI, credit card, and expiry input. The parent still owns the value through normal binding.',
		steps: [
			{
				title: 'Choose the input type deliberately',
				description:
					'Use the specialized types only when you want the built-in formatting behavior. Otherwise stay with plain `text`, `email`, or `password`.'
			},
			{
				title: 'Tune numeric stepping when precision matters',
				description:
					'`numeric` fields render inline up/down controls, respond to `ArrowUp` and `ArrowDown` while focused, and optionally respect `step`, `min`, and `max`.'
			},
			{
				title: 'Use validation props for field-level feedback',
				description:
					'`error` and `valid` control the right-side validation icon and the helper message under the field.'
			},
			{
				title: 'Reach for slots before custom wrappers',
				description:
					'`leftSlot` and `rightSlot` are the intended extension points for icons and inline actions.'
			}
		],
		apiRows: [
			{
				name: 'type',
				type: "'text' | 'numeric' | 'email' | 'password' | 'color' | 'devEui' | 'creditCard' | 'cardExpiry'",
				description: 'Input behavior and optional formatting mode.',
				defaultValue: 'text'
			},
			{
				name: 'value',
				type: 'string',
				description: 'Current field value.',
				defaultValue: "''"
			},
			{ name: 'label', type: 'string', description: 'Field label text.' },
			{ name: 'placeholder', type: 'string', description: 'Prompt shown when the field is empty.' },
			{ name: 'error', type: 'string', description: 'Validation message shown under the field.' },
			{
				name: 'valid',
				type: 'boolean',
				description: 'Shows the success state when there is no error.',
				defaultValue: 'false'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Disables typing and interactive affordances.',
				defaultValue: 'false'
			},
			{
				name: 'maxlength',
				type: 'number',
				description: 'Character cap applied after formatting.'
			},
			{
				name: 'min / max',
				type: 'number | string',
				description: 'Optional numeric bounds used by the inline stepper and keyboard increment/decrement.'
			},
			{
				name: 'step',
				type: 'number | string',
				description: 'Optional numeric increment for `type="numeric"`. When omitted, the field infers precision from the current value.'
			},
			{
				name: 'clearable',
				type: 'boolean',
				description: 'Shows the clear button when the field has a value.',
				defaultValue: 'false'
			},
			{ name: 'leftSlot / rightSlot', type: 'Snippet', description: 'Custom inline icon or action content.' },
			{
				name: 'oninput / onchange / onkeydown / onblur / onfocus',
				type: 'callback',
				description: 'Standard input lifecycle callbacks forwarded from the field.'
			}
		],
		apiNote:
			'Standard input attributes such as `name`, `required`, `autocomplete`, `aria-*`, and `class` pass through to the real `<input>`.',
		examples: [
			{
				title: 'Clearable email field',
				description: 'A standard text field with form-friendly attributes and built-in clear behavior.',
				code: `<script lang="ts">
\tlet email = $state('');
</script>

<CwInput
\tlabel="Email"
\ttype="email"
\tname="email"
\trequired
\tplaceholder="grower@example.com"
\tautocomplete="email"
\tclearable
\tbind:value={email}
/>`
			},
			{
				title: 'Color picker plus formatted inputs',
				description: 'Use the native color control or the specialized formatted types when you need them.',
				code: `<script lang="ts">
\tlet devEui = $state('');
\tlet accentColor = $state('#2f8f5b');
\tlet threshold = $state('18.5');
\tlet cardNumber = $state('');
\tlet expiry = $state('');
</script>

<CwInput
\tlabel="Threshold"
\ttype="numeric"
\tstep={0.5}
\tmin={0}
\tmax={40}
\tbind:value={threshold}
/>

<CwInput
\tlabel="Accent color"
\ttype="color"
\tbind:value={accentColor}
/>

<CwInput
\tlabel="Device EUI"
\ttype="devEui"
\tplaceholder="AA:BB:CC:DD:EE:FF:00:11"
\tbind:value={devEui}
/>

<CwInput
\tlabel="Card number"
\ttype="creditCard"
\tmaxlength={19}
\tclearable
\tbind:value={cardNumber}
/>

<CwInput label="Expiry" type="cardExpiry" bind:value={expiry} />`
			},
			{
				title: 'Icon slots and validation feedback',
				description: 'Slots are the extension point for search icons, units, and inline actions.',
				code: `<CwInput label="Search plots" clearable error="Pick an existing plot">
\t{#snippet leftSlot()}
\t\t<svg viewBox="0 0 16 16" fill="none" style="width:1rem;height:1rem">
\t\t\t<path d="M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
\t\t</svg>
\t{/snippet}
\t{#snippet rightSlot()}
\t\t<span style="font-size:0.75rem;color:var(--cw-text-muted)">Ctrl+K</span>
\t{/snippet}
</CwInput>`
			}
		]
	},
	'/demo/duration': {
		summary:
			'CwDuration is a live-updating relative time display. Give it a starting timestamp, decide whether it counts up or down, and optionally attach an alarm callback for time-based workflows.',
		steps: [
			{
				title: 'Pick the time origin',
				description:
					'`from` accepts a `Date`, ISO string, or timestamp number, so pass whichever form your data already uses.'
			},
			{
				title: 'Choose elapsed or countdown mode',
				description:
					'Leave `countDown` off for age or uptime. Turn it on when you need time remaining until a deadline.'
			},
			{
				title: 'Use alarms for deadline side effects',
				description:
					'`alarmAfterMinutes` runs callbacks relative to `from`, which is useful for quiet-device timeouts and SLA checks.'
			}
		],
		apiRows: [
			{ name: 'from', type: 'Date | string | number', description: 'Base timestamp to measure from.', required: true },
			{
				name: 'countDown',
				type: 'boolean',
				description: 'When true, counts down toward zero instead of counting up from the past.',
				defaultValue: 'false'
			},
			{
				name: 'tickMs',
				type: 'number',
				description: 'Refresh cadence in milliseconds.',
				defaultValue: '1000'
			},
			{
				name: 'alarmAfterMinutes',
				type: 'number',
				description: 'Minutes after `from` when the alarm callbacks should fire.'
			},
			{
				name: 'alarmCallback',
				type: '() => void',
				description: 'Runs once when the alarm threshold is reached.'
			},
			{
				name: 'alarmResetCallback',
				type: '() => void',
				description: 'Runs when the alarm condition is cleared because the source time changes.'
			}
		],
		examples: [
			{
				title: 'Elapsed time since last sync',
				description: 'This is the common dashboard usage for freshness indicators.',
				code: `<CwDuration from={device.lastSeenAt} />`
			},
			{
				title: 'Countdown timer with fast refresh',
				description: 'Use a shorter `tickMs` when the UI should feel more animated.',
				code: `<CwDuration
\tfrom={new Date(Date.now() + 5 * 60 * 1000)}
\tcountDown
\ttickMs={250}
/>`
			},
			{
				title: 'Silence alarm after 30 minutes',
				description: 'Attach callbacks when elapsed time should trigger a workflow.',
				code: `<script lang="ts">
\tlet timedOut = $state(false);
</script>

<CwDuration
\tfrom={lastDeviceMessageAt}
\talarmAfterMinutes={30}
\talarmCallback={() => (timedOut = true)}
\talarmResetCallback={() => (timedOut = false)}
/>`
			}
		]
	},
	'/demo/profilemenu': {
		summary:
			'CwProfileMenu combines a user trigger, optional avatar, and action menu. The menu stays simple: you pass the items and react to whichever item the user picks.',
		steps: [
			{
				title: 'Always provide a name',
				description:
					'The name is used for visible identity and for initials when there is no avatar image.'
			},
			{
				title: 'Model actions as plain data',
				description:
					'Build `menuItems` as an array of ids and labels, then switch on `item.id` inside `onselect`.'
			},
			{
				title: 'Customize the trigger only when necessary',
				description:
					'Most apps only need `avatarUrl` or initials. Use `icon` or `avatar` snippets for more custom branding.'
			}
		],
		apiRows: [
			{ name: 'name', type: 'string', description: 'Visible user name or identifier.', required: true },
			{ name: 'subtitle', type: 'string', description: 'Secondary role or account text.' },
			{ name: 'avatarUrl', type: 'string', description: 'Image URL for the avatar. Falls back to initials when omitted.' },
			{ name: 'menuItems', type: 'CwProfileMenuItem[]', description: 'Menu actions shown when the trigger opens.', defaultValue: '[]' },
			{ name: 'onselect', type: '(item: CwProfileMenuItem) => void', description: 'Called when a menu item is chosen.' },
			{ name: 'icon', type: 'Snippet', description: 'Optional custom icon rendered in the trigger.' },
			{ name: 'avatar', type: 'Snippet', description: 'Custom avatar markup. Overrides initials and `avatarUrl`.' }
		],
		examples: [
			{
				title: 'Standard profile menu',
				description: 'Use `onselect` to branch on the selected item id.',
				code: `<script lang="ts">
\tconst menuItems = [
\t\t{ id: 'profile', label: 'My profile' },
\t\t{ id: 'settings', label: 'Account settings' },
\t\t{ id: 'signout', label: 'Sign out', separator: true, danger: true }
\t];
</script>

<CwProfileMenu
\tname="kevin@cropwatch.io"
\tsubtitle="Administrator"
\tmenuItems={menuItems}
\tonselect={(item) => {
\t\tif (item.id === 'signout') signOut();
\t}}
/>`
			},
			{
				title: 'Custom avatar and trigger icon',
				description: 'Use snippets when the default initials or avatar image are not enough.',
				code: `<CwProfileMenu name="North greenhouse" menuItems={menuItems}>
\t{#snippet avatar()}
\t\t<div style="width:100%;height:100%;display:grid;place-items:center;background:#0f766e;color:white;font-weight:700">
\t\t\tNG
\t\t</div>
\t{/snippet}
\t{#snippet icon()}
\t\t<svg viewBox="0 0 16 16" fill="none" style="width:1rem;height:1rem">
\t\t\t<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
\t\t</svg>
\t{/snippet}
</CwProfileMenu>`
			}
		]
	},
	'/demo/expand': {
		summary:
			'CwExpandPanel is a collapsible section for settings, troubleshooting details, and optional content. Use the built-in title for simple cases and the `header` snippet when the trigger needs richer status UI.',
		steps: [
			{
				title: 'Use the title prop for the common case',
				description:
					'If the header is just text, keep it simple and pass `title`.'
			},
			{
				title: 'Bind `open` when the parent needs control',
				description:
					'`bind:open` lets an external button or saved preference control the panel state.'
			},
			{
				title: 'Use the header snippet for status-rich toggles',
				description:
					'The snippet receives the current `open` boolean so you can render live labels or counts.'
			}
		],
		apiRows: [
			{ name: 'title', type: 'string', description: 'Simple header text.', defaultValue: "''" },
			{ name: 'open', type: 'boolean', description: 'Expanded or collapsed state.', defaultValue: 'false' },
			{ name: 'disabled', type: 'boolean', description: 'Prevents toggling.', defaultValue: 'false' },
			{ name: 'header', type: 'Snippet<[boolean]>', description: 'Custom header snippet receiving the current `open` state.' },
			{ name: 'children', type: 'Snippet', description: 'Panel body content.' },
			{ name: 'onToggle', type: '(open: boolean) => void', description: 'Runs after the panel is toggled.' }
		],
		examples: [
			{
				title: 'Simple expandable section',
				description: 'Use this for FAQs, advanced settings, and details panels.',
				code: `<CwExpandPanel title="Sensor configuration" open>
\t<p>Configure thresholds, calibration offsets, and reporting intervals.</p>
</CwExpandPanel>`
			},
			{
				title: 'Controlled panel with custom header',
				description: 'Bind the state when other controls need to open or close the panel.',
				code: `<script lang="ts">
\tlet expanded = $state(false);
\tlet lastToggle = $state('Never');
</script>

<CwButton variant="secondary" onclick={() => (expanded = !expanded)}>
\tToggle panel externally
</CwButton>

<CwExpandPanel bind:open={expanded} onToggle={(open) => (lastToggle = open ? 'Opened' : 'Closed')}>
\t{#snippet header(open)}
\t\t<div style="display:flex;gap:0.5rem;align-items:center">
\t\t\t<strong>Irrigation controller</strong>
\t\t\t<span>{open ? 'Expanded' : 'Collapsed'}</span>
\t\t</div>
\t{/snippet}
\t<p>Last toggle: {lastToggle}</p>
</CwExpandPanel>`
			}
		]
	},
	'/demo/spinner': {
		summary:
			'CwSpinner is the shared loading indicator used across buttons and async UI. Most screens only need a size choice and, occasionally, an accessible label.',
		steps: [
			{
				title: 'Pick the smallest size that still reads clearly',
				description:
					'`sm` and `md` work inline, while `lg` and `xl` are better for loading states that stand on their own.'
			},
			{
				title: 'Add a label when the spinner stands alone',
				description:
					'If there is no nearby descriptive text, enable `showLabel` so assistive tech and users both get context.'
			},
			{
				title: 'Do not duplicate button loading spinners',
				description:
					'`CwButton` already uses this component internally when `loading` is true.'
			}
		],
		apiRows: [
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg' | 'xl'",
				description: 'Spinner size preset.',
				defaultValue: 'md'
			},
			{
				name: 'showLabel',
				type: 'boolean',
				description: 'Renders an inline status label and enables status ARIA attributes.',
				defaultValue: 'false'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Status text used when `showLabel` is enabled.',
				defaultValue: 'Loading...'
			}
		],
		examples: [
			{
				title: 'Standalone spinner sizes',
				description: 'Use these when the loading state is visible on its own.',
				code: `<CwSpinner size="sm" />
<CwSpinner size="md" />
<CwSpinner size="lg" />
<CwSpinner size="xl" />`
			},
			{
				title: 'Accessible loading message',
				description: 'Enable `showLabel` when the spinner is not next to its own explanatory text.',
				code: `<CwSpinner size="lg" showLabel label="Syncing greenhouse devices..." />`
			}
		]
	},
	'/demo/statusdot': {
		summary:
			'CwStatusDot is the smallest status indicator in the library. Use it when you need a quick semantic state without the weight of a full badge or chip.',
		steps: [
			{
				title: 'Pick the semantic status',
				description:
					'`online`, `offline`, `loading`, and `warning` each have distinct color and animation treatment.'
			},
			{
				title: 'Show the label only when context is missing',
				description:
					'In dense tables you can often keep the dot only. In settings pages or cards, `showLabel` improves clarity.'
			},
			{
				title: 'Use a custom label when domain terms matter',
				description:
					'The status color stays semantic while the text can say things like "Sensor stale" or "Gateway silent".'
			}
		],
		apiRows: [
			{
				name: 'status',
				type: "'online' | 'offline' | 'loading' | 'warning'",
				description: 'Semantic state to display.',
				defaultValue: 'offline'
			},
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				description: 'Dot size preset.',
				defaultValue: 'md'
			},
			{ name: 'label', type: 'string', description: 'Optional custom text label.' },
			{
				name: 'showLabel',
				type: 'boolean',
				description: 'Shows the text label next to the dot.',
				defaultValue: 'false'
			}
		],
		examples: [
			{
				title: 'Common status states',
				description: 'The built-in text labels are enough for most dashboards.',
				code: `<CwStatusDot status="online" showLabel />
<CwStatusDot status="offline" showLabel />
<CwStatusDot status="loading" showLabel />
<CwStatusDot status="warning" showLabel />`
			},
			{
				title: 'Custom label and size',
				description: 'Use a custom label when the domain language matters more than the generic status name.',
				code: `<CwStatusDot
\tstatus="warning"
\tsize="lg"
\tlabel="Sensor stale"
\tshowLabel
/>`
			}
		]
	},
	'/demo/switch': {
		summary:
			'CwSwitch is a checkbox-based on/off control. Treat it as a boolean field with optional helper text, then use `oninput` or `onchange` only when the parent needs side effects.',
		steps: [
			{
				title: 'Bind `checked` for state ownership',
				description:
					'If the page needs to read or update the value, `bind:checked` is the simplest pattern.'
			},
			{
				title: 'Use label and description to explain the effect',
				description:
					'Good switch labels describe the setting itself; the optional description explains the consequence.'
			},
			{
				title: 'Pick the callback based on timing',
				description:
					'`oninput` fires as the control changes, while `onchange` matches the more familiar committed change event.'
			}
		],
		apiRows: [
			{
				name: 'checked',
				type: 'boolean',
				description: 'Current on or off state.',
				defaultValue: 'false'
			},
			{ name: 'label', type: 'string', description: 'Primary switch text.' },
			{ name: 'description', type: 'string', description: 'Secondary explanatory text.' },
			{
				name: 'labelPosition',
				type: "'top' | 'bottom' | 'left' | 'right'",
				description: 'Places the label block on a specific side of the switch control.',
				defaultValue: "'right'"
			},
			{ name: 'id', type: 'string', description: 'Optional explicit input id.' },
			{
				name: 'name',
				type: 'string',
				description: 'Form field name forwarded to the real checkbox input.'
			},
			{
				name: 'oninput',
				type: '(checked: boolean, event: Event) => void',
				description: 'Runs whenever the checkbox input event fires.'
			},
			{
				name: 'onchange',
				type: '(checked: boolean, event: Event) => void',
				description: 'Runs when the checkbox change event fires.'
			},
			{
				name: '...other native checkbox attrs',
				type: 'HTMLInputAttributes',
				description: 'Pass `value`, `disabled`, `aria-*`, and standard checkbox attributes through to the real input.'
			}
		],
		apiNote:
			'This component wraps a real checkbox input, so standard form attributes are still available.',
		examples: [
			{
				title: 'Bound settings switch',
				description: 'This is the normal settings-page usage.',
				code: `<script lang="ts">
\tlet onlineOnly = $state(true);
</script>

<CwSwitch
\tlabel="Show only online devices"
\tdescription="Hide offline sensors from the dashboard"
\tname="onlineOnly"
\tbind:checked={onlineOnly}
/>`
			},
			{
				title: 'Input and change callbacks',
				description: 'Use callbacks when turning the switch should trigger side effects immediately.',
				code: `<CwSwitch
\tid="sms-alerts"
\tlabel="SMS alerts"
\toninput={(checked) => console.log('input', checked)}
\tonchange={(checked) => savePreference('smsAlerts', checked)}
/>`
			},
			{
				title: 'Move the label around the control',
				description: 'Use `labelPosition` when the surrounding layout needs the text above, below, or to the left of the switch.',
				code: `<CwSwitch label="Top label" labelPosition="top" />
<CwSwitch label="Bottom label" labelPosition="bottom" />
<CwSwitch label="Left label" labelPosition="left" />
<CwSwitch label="Right label" labelPosition="right" />`
			}
		]
	},
	'/demo/checkbox': {
		summary:
			'CwCheckbox is the library checkbox for independent yes or no selections. Use one checkbox per independent option, and rely on `name`, `value`, and `checked` when the control needs to participate in native form submission.',
		steps: [
			{
				title: 'Bind `checked` when the page owns the state',
				description:
					'For interactive settings and filters, `bind:checked` is the simplest way to keep checkbox state in sync with the page.'
			},
			{
				title: 'Set `name` explicitly for form submission',
				description:
					'When the checkbox is part of a real form, give it a `name` so the browser includes it in the submitted fields.'
			},
			{
				title: 'Use helper text for consequences, not labels',
				description:
					'The label should name the option itself. Use `description` only when users need extra context about what checking it will do.'
			}
		],
		apiRows: [
			{
				name: 'checked',
				type: 'boolean',
				description: 'Current checked state.',
				defaultValue: 'false'
			},
			{ name: 'label', type: 'string', description: 'Primary checkbox text.' },
			{ name: 'description', type: 'string', description: 'Secondary explanatory text.' },
			{ name: 'id', type: 'string', description: 'Optional explicit input id.' },
			{
				name: 'name',
				type: 'string',
				description: 'Form field name forwarded to the real checkbox input.'
			},
			{
				name: 'oninput',
				type: '(checked: boolean, event: Event) => void',
				description: 'Runs whenever the checkbox input event fires.'
			},
			{
				name: 'onchange',
				type: '(checked: boolean, event: Event) => void',
				description: 'Runs when the checkbox change event fires.'
			},
			{
				name: '...other native checkbox attrs',
				type: 'HTMLInputAttributes',
				description: 'Pass `value`, `disabled`, `required`, `aria-*`, and standard checkbox attributes through to the real input.'
			}
		],
		apiNote:
			'This component wraps a real checkbox input, so native form behavior and browser validation still apply.',
		examples: [
			{
				title: 'Bound checkbox field',
				description: 'This is the normal pattern for filters, export toggles, and settings forms.',
				code: `<script lang="ts">
\tlet includeOffline = $state(true);
</script>

<CwCheckbox
\tname="includeOffline"
\tlabel="Include offline devices"
\tdescription="Keep stale or disconnected devices in the table."
\tbind:checked={includeOffline}
/>`
			},
			{
				title: 'Immediate side effects on selection',
				description: 'Use callbacks when checking the box should trigger follow-up work immediately.',
				code: `<CwCheckbox
\tname="emailDigest"
\tlabel="Email digest"
\toninput={(checked) => console.log('input', checked)}
\tonchange={(checked) => savePreference('emailDigest', checked)}
/>`
			}
		]
	},
	'/demo/radio': {
		summary:
			'CwRadio is the library radio input for single-choice selections. Group radios by sharing the same `name` and `bind:group`, then keep the labels specific enough that each option stands on its own.',
		steps: [
			{
				title: 'Bind one shared group value',
				description:
					'Each radio gets its own `value`, but the whole group points at one shared `bind:group` selection.'
			},
			{
				title: 'Use a common `name` for real form grouping',
				description:
					'Matching `name` attributes keep the radios behaving like one native radio set during form submission and validation.'
			},
			{
				title: 'Add descriptions only when the options need explanation',
				description:
					'Simple choices can use label-only radios. Turn on `description` when users need help understanding the impact of each option.'
			}
		],
		apiRows: [
			{
				name: 'group',
				type: 'CwRadioValue | null',
				description: 'Shared selected value for the radio group.'
			},
			{
				name: 'value',
				type: 'CwRadioValue',
				description: 'Value emitted when this radio becomes selected.',
				defaultValue: 'on'
			},
			{ name: 'label', type: 'string', description: 'Primary radio label.' },
			{ name: 'description', type: 'string', description: 'Optional supporting text under the label.' },
			{ name: 'id', type: 'string', description: 'Optional explicit input id.' },
			{
				name: 'oninput',
				type: '(value: CwRadioValue, event: Event) => void',
				description: 'Runs when this radio receives the input event and becomes selected.'
			},
			{
				name: 'onchange',
				type: '(value: CwRadioValue, event: Event) => void',
				description: 'Runs when this radio receives the change event and becomes selected.'
			},
			{
				name: '...native radio attrs',
				type: 'HTMLInputAttributes',
				description: 'Pass `name`, `required`, `disabled`, `aria-*`, and standard radio attributes through to the real input.'
			}
		],
		apiNote:
			'For a real radio group, every option should share the same `name` and `bind:group` target.',
		examples: [
			{
				title: 'Single-choice settings group',
				description: 'This is the normal form pattern for mutually exclusive options.',
				code: `<script lang="ts">
\tlet irrigationMode = $state('automatic');
</script>

<CwRadio
\tname="irrigation-mode"
\tvalue="automatic"
\tlabel="Automatic"
\tdescription="Follow the scheduled automation rules."
\tbind:group={irrigationMode}
/>
<CwRadio
\tname="irrigation-mode"
\tvalue="manual"
\tlabel="Manual"
\tdescription="Only run when an operator starts a cycle."
\tbind:group={irrigationMode}
/>`
			},
			{
				title: 'Immediate side effects on selection',
				description: 'Use callbacks when changing the selected option should trigger follow-up work.',
				code: `<CwRadio
\tname="notification-channel"
\tvalue="sms"
\tlabel="SMS"
\toninput={(value) => console.log('input', value)}
\tonchange={(value) => savePreference('notificationChannel', value)}
/>`
			}
		]
	},
	'/demo/themepicker': {
		summary:
			'CwThemePicker controls the library theme and persists the chosen mode. It can manage itself, or you can bind the current theme if the parent also wants to react to it.',
		steps: [
			{
				title: 'Mount it once where users expect it',
				description:
					'Headers, toolbars, and account menus are typical places for a theme picker.'
			},
			{
				title: 'Let the component persist the choice',
				description:
					'The picker already stores the selected mode in local storage and updates `data-theme` on the root element.'
			},
			{
				title: 'Bind `theme` only when other UI depends on it',
				description:
					'Use `bind:theme` or `onchange` when the rest of the page also wants to know the chosen theme.'
			}
		],
		apiRows: [
			{
				name: 'theme',
				type: "'dark' | 'light' | 'system'",
				description: 'Current theme mode.',
				defaultValue: 'dark'
			},
			{
				name: 'onchange',
				type: "(theme: 'dark' | 'light' | 'system') => void",
				description: 'Runs after the user selects a theme.'
			}
		],
		examples: [
			{
				title: 'Drop-in theme picker',
				description: 'This is enough for most apps because persistence and root theme updates are built in.',
				code: `<CwThemePicker />`
			},
			{
				title: 'Bound theme with analytics or logging',
				description: 'Bind the state when the parent also wants the selected theme.',
				code: `<script lang="ts">
\tlet theme = $state<'dark' | 'light' | 'system'>('system');
</script>

<CwThemePicker
\tbind:theme={theme}
\tonchange={(nextTheme) => console.log('Theme changed:', nextTheme)}
/>`
			}
		]
	},
	'/demo/language-switcher': {
		summary:
			"CwLanguageSwitcher is a Paraglide-ready locale picker. Pass an `options` array, bind the current locale when the parent cares about it, and hand in Paraglide's `setLocale` function so the app actually swaps translations.",
		steps: [
			{
				title: 'Use exact locale codes',
				description:
					"Each option's `locale` value should match the locale codes your Paraglide runtime expects, such as `en`, `fr`, or `pt-BR`."
			},
			{
				title: 'Wire the runtime setter once',
				description:
					"Pass Paraglide's `setLocale` function directly so the component updates the actual app locale instead of only changing local UI state."
			},
			{
				title: 'Keep unavailable languages visible',
				description:
					'Use `description` and `disabled` together when a locale is planned but not released yet, so users understand the roadmap without being able to select it.'
			}
		],
		apiTitle: 'Props and option shape',
		apiRows: [
			{
				name: 'options',
				type: 'CwLanguageOption[]',
				description: 'Language rows shown in the menu. Each option needs a `locale` and `label`.',
				required: true
			},
			{
				name: 'locale',
				type: 'string',
				description: 'Current locale. Bind this when parent UI also needs to react to locale changes.'
			},
			{
				name: 'setLocale',
				type: '(locale: string) => void | Promise<void>',
				description: "Consumer callback, typically Paraglide's runtime `setLocale` function."
			},
			{
				name: 'onchange',
				type: '(locale: string, option: CwLanguageOption) => void | Promise<void>',
				description: 'Runs after a locale has been applied successfully.'
			},
			{
				name: 'onerror',
				type: '(error: unknown, locale: string, option: CwLanguageOption) => void',
				description: 'Runs if `setLocale` fails so the parent can log or surface an error.'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Optional field label rendered above the trigger.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Disables the trigger and prevents opening the menu.',
				defaultValue: 'false'
			}
		],
		apiNote:
			'Each `CwLanguageOption` accepts `locale`, `label`, and optional `flag`, `flagType`, `shortLabel`, `description`, and `disabled`.',
		examples: [
			{
				title: 'Paraglide runtime wiring',
				description:
					"Use Paraglide's `getLocale` and `setLocale` runtime helpers as the source of truth.",
				code: `<script lang="ts">
\timport {
\t\tCwLanguageSwitcher,
\t\ttype CwLanguageOption
\t} from '@cropwatchdevelopment/cwui';
\timport { getLocale, setLocale } from '$lib/paraglide/runtime.js';

\tconst locales: CwLanguageOption[] = [
\t\t{ locale: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
\t\t{ locale: 'es', label: 'Español', shortLabel: 'ES', flag: '🇪🇸' },
\t\t{ locale: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷' }
\t];

\tlet locale = $state(getLocale());
</script>

<CwLanguageSwitcher
\tlabel="Language"
\toptions={locales}
\tbind:locale={locale}
\tsetLocale={setLocale}
/>`
			},
			{
				title: 'Rich option metadata',
				description:
					'Descriptions make regional variants and staged launches clearer without custom rendering.',
				code: `<script lang="ts">
\tconst locales = [
\t\t{
\t\t\tlocale: 'en',
\t\t\tlabel: 'English',
\t\t\tshortLabel: 'EN',
\t\t\tflag: '🇺🇸',
\t\t\tdescription: 'Default product copy'
\t\t},
\t\t{
\t\t\tlocale: 'es-MX',
\t\t\tlabel: 'Español (México)',
\t\t\tshortLabel: 'ES',
\t\t\tflag: '🇲🇽',
\t\t\tdescription: 'Regional content and billing copy'
\t\t},
\t\t{
\t\t\tlocale: 'de',
\t\t\tlabel: 'Deutsch',
\t\t\tshortLabel: 'DE',
\t\t\tflag: '🇩🇪',
\t\t\tdescription: 'Coming soon',
\t\t\tdisabled: true
\t\t}
\t];
</script>

<CwLanguageSwitcher options={locales} />`
			}
		]
	},
	'/demo/toast': {
		summary:
			'The toast system is a small context-based API rather than a single component. Create the context once, mount a container once, and then call `toast.add(...)` anywhere below that tree.',
		steps: [
			{
				title: 'Create the context high in the tree',
				description:
					'Call `createCwToastContext()` in a layout or root component so all child routes can access the toast API.'
			},
			{
				title: 'Render one container',
				description:
					'Mount `CwToastContainer` once, usually near the root layout, so notifications have a consistent stack location.'
			},
			{
				title: 'Trigger toasts from feature code',
				description:
					'Use `useCwToast()` in child components and call `toast.add(...)` after save, error, or background events.'
			}
		],
		apiTitle: 'System API',
		apiRows: [
			{
				name: 'createCwToastContext(maxItems?)',
				type: '(maxItems?: number) => CwToastApi',
				description: 'Creates and stores the toast context. Call this once near the app root.'
			},
			{
				name: 'useCwToast()',
				type: '() => CwToastApi',
				description: 'Reads the toast API from context inside child components.'
			},
			{
				name: '<CwToastContainer />',
				type: 'component',
				description: 'Renders the visible toast stack for the current context.'
			},
			{
				name: 'toast.add({ tone, message, duration, dismissible })',
				type: '(options) => string',
				description: 'Pushes a toast and returns its generated id.'
			},
			{
				name: 'toast.dismiss(id)',
				type: '(id: string) => void',
				description: 'Removes a toast explicitly.'
			},
			{
				name: 'toast.items',
				type: 'readonly CwToastItem[]',
				description: 'Current visible toast items in the context.'
			}
		],
		examples: [
			{
				title: 'Create the toast system in a layout',
				description: 'Mount the context and container once at the top of the route tree.',
				code: `// src/routes/+layout.svelte
<script lang="ts">
\timport { createCwToastContext, CwToastContainer } from '@cropwatchdevelopment/cwui';

\tcreateCwToastContext(5);
</script>

<slot />
<CwToastContainer />`
			},
			{
				title: 'Trigger success, warning, and sticky toasts',
				description: 'Use the toast API anywhere below the provider.',
				code: `<script lang="ts">
\timport { CwButton, useCwToast } from '@cropwatchdevelopment/cwui';

\tconst toast = useCwToast();
</script>

<CwButton onclick={() => toast.add({ tone: 'success', message: 'Saved!' })}>
\tShow success
</CwButton>

<CwButton
\tvariant="secondary"
\tonclick={() =>
\t\ttoast.add({
\t\t\ttone: 'warning',
\t\t\tmessage: 'Gateway has not checked in for 15 minutes.',
\t\t\tduration: 10000,
\t\t\tdismissible: true
\t\t})
\t}
>
\tShow warning
</CwButton>`
			}
		]
	},
	'/demo/tooltip': {
		summary:
			'CwTooltip wraps an existing trigger element and shows short, contextual guidance on hover or focus. Keep the copy concise and use it for hints, not large descriptions.',
		steps: [
			{
				title: 'Wrap the trigger element',
				description:
					'The child content can be a button, icon, link, or inline text span.'
			},
			{
				title: 'Keep the value short',
				description:
					'Tooltips should clarify or name something quickly. If the content needs paragraphs or interactions, use a dialog or popover pattern instead.'
			},
			{
				title: 'Choose position and tone only when they add clarity',
				description:
					'`top` and `info` are the defaults, so only override them when the surrounding layout or message calls for it.'
			}
		],
		apiRows: [
			{ name: 'value', type: 'string', description: 'Tooltip text content.', required: true },
			{
				name: 'position',
				type: "'top' | 'bottom' | 'left' | 'right'",
				description: 'Placement relative to the trigger.',
				defaultValue: 'top'
			},
			{
				name: 'tone',
				type: 'CwTone',
				description: 'Tooltip color theme.',
				defaultValue: 'info'
			},
			{ name: 'children', type: 'Snippet', description: 'Wrapped trigger content.', required: true }
		],
		examples: [
			{
				title: 'Default button tooltip',
				description: 'The default position is `top` and the default tone is `info`.',
				code: `<CwTooltip value="Refresh the dashboard data">
\t<CwButton variant="secondary">Refresh</CwButton>
</CwTooltip>`
			},
			{
				title: 'Inline warning tooltip',
				description: 'Tooltips can also wrap inline text, not just buttons.',
				code: `<p>
\tSensor status:
\t<CwTooltip value="No device data has arrived in the last 30 minutes." tone="warning" position="right">
\t\t<span style="text-decoration:underline dotted;cursor:help">stale</span>
\t</CwTooltip>
</p>`
			}
		]
	},
	'/demo/copy': {
		summary:
			'CwCopy handles the clipboard action and temporary copied feedback. You choose the string to copy, and optionally render visible content next to the button.',
		steps: [
			{
				title: 'Pass the raw value you want copied',
				description:
					'The visual content can be truncated or formatted, but the `value` prop should contain the exact text you want on the clipboard.'
			},
			{
				title: 'Render children when the value should stay visible',
				description:
					'For API keys, invite codes, or token strings, put the visible text inside the default snippet.'
			},
			{
				title: 'Use `onCopy` for analytics or confirmations',
				description:
					'The callback only runs after a successful copy operation.'
			}
		],
		apiRows: [
			{ name: 'value', type: 'string', description: 'Text written to the clipboard.', required: true },
			{
				name: 'size',
				type: "'sm' | 'md' | 'lg'",
				description: 'Size preset for the copy affordance.',
				defaultValue: 'md'
			},
			{
				name: 'feedbackDuration',
				type: 'number',
				description: 'How long the copied feedback state stays visible.',
				defaultValue: '1500'
			},
			{ name: 'children', type: 'Snippet', description: 'Optional visible content rendered before the copy button.' },
			{ name: 'onCopy', type: '(value: string) => void', description: 'Runs after a successful copy operation.' }
		],
		examples: [
			{
				title: 'Icon-only copy button',
				description: 'Useful when the surrounding layout already shows the full value.',
				code: `<CwCopy value={device.serialNumber} />`
			},
			{
				title: 'Visible value and copy callback',
				description: 'Use this when the user should see exactly what will be copied.',
				code: `<script lang="ts">
\tlet copiedCount = $state(0);
</script>

<CwCopy
\tvalue="sk-proj-abc123def456ghi789"
\tsize="lg"
\tfeedbackDuration={2500}
\tonCopy={() => (copiedCount += 1)}
>
\t<code>sk-proj-abc123def456ghi789</code>
</CwCopy>`
			}
		]
	},
	'/demo/calendar': {
		summary:
			'CwCalendar is a month grid shell. Use it as a simple calendar first, then layer in `dayHeader`, `dayTrailing`, and `dayContent` snippets only when each day needs richer content.',
		steps: [
			{
				title: 'Decide if the month should be controlled',
				description:
					'Leave `year` and `month` alone for an internal calendar, or bind them when the rest of the page needs to know which month is on screen.'
			},
			{
				title: 'Constrain with real dates, not custom guards',
				description:
					'Use `minDate` and `maxDate` to disable both navigation and day clicks outside the allowed window instead of wrapping the callbacks yourself.'
			},
			{
				title: 'Treat snippets as layers',
				description:
					'`dayHeader` is for the compact label next to the day number, `dayTrailing` is for lightweight metadata like weather, and `dayContent` is the larger body area.'
			}
		],
		apiRows: [
			{
				name: 'year',
				type: 'number',
				description: 'Displayed year. Bind this when parent state should track the visible month.',
				defaultValue: 'current year'
			},
			{
				name: 'month',
				type: 'number',
				description: 'Displayed month, zero-based like `Date#getMonth()`.',
				defaultValue: 'current month'
			},
			{
				name: 'startOnMonday',
				type: 'boolean',
				description: 'Switches weekday headers between Monday-first and Sunday-first layout.',
				defaultValue: 'true'
			},
			{
				name: 'minDate',
				type: 'Date',
				description: 'Earliest selectable date and earliest month the user can navigate to.'
			},
			{
				name: 'maxDate',
				type: 'Date',
				description: 'Latest selectable date and latest month the user can navigate to.'
			},
			{
				name: 'onDateClick',
				type: '(date: Date) => void',
				description: 'Runs when the user clicks an enabled day cell.'
			},
			{
				name: 'onMonthChange',
				type: '(year: number, month: number, displayedMonth: Date) => void',
				description:
					'Runs after the previous or next month buttons change the visible month. `month` is zero-based and `displayedMonth` is the first day of that month.'
			},
			{
				name: 'dayHeader',
				type: 'Snippet<[Date]>',
				description: 'Optional compact label rendered beside the day number.'
			},
			{
				name: 'dayTrailing',
				type: 'Snippet<[Date]>',
				description: 'Optional metadata rendered on the right side of the day header.'
			},
			{
				name: 'dayContent',
				type: 'Snippet<[Date]>',
				description: 'Optional main content block rendered under the header inside each day cell.'
			}
		],
		examples: [
			{
				title: 'Minimal calendar shell',
				description: 'Start here when the page only needs the standard month grid.',
				code: `<CwCalendar
\tonDateClick={(date) => console.log(date)}
/>`
			},
			{
				title: 'Controlled month with min/max bounds',
				description: 'Use this when sibling UI needs to react to visible month changes.',
				code: `<script lang="ts">
\tlet visibleYear = $state(new Date().getFullYear());
\tlet visibleMonth = $state(new Date().getMonth());
\tlet lastMonth = $state(new Date(visibleYear, visibleMonth, 1));

\tconst minDate = new Date(2026, 2, 10);
\tconst maxDate = new Date(2026, 4, 22);

\tfunction handleMonthChange(_year: number, _month: number, displayedMonth: Date) {
\t\tlastMonth = displayedMonth;
\t}
</script>

<CwCalendar
\tbind:year={visibleYear}
\tbind:month={visibleMonth}
\t{minDate}
\t{maxDate}
\tonMonthChange={handleMonthChange}
\tonDateClick={(date) => console.log(date)}
/>

<p>
\tShowing
\t{lastMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
</p>`
			},
			{
				title: 'Weather and schedule snippets',
				description: 'This pattern keeps the calendar shell reusable while the page owns the per-day content.',
				code: `<script lang="ts">
\tfunction weatherFor(date: Date) {
\t\tconst icons = ['☀️', '🌤️', '⛅', '🌧️', '🌦️', '☁️', '🌤️'];
\t\treturn { icon: icons[date.getDay()], high: 70 + (date.getDay() % 4) };
\t}

\tfunction jobsFor(date: Date) {
\t\treturn date.getDay() === 2
\t\t\t? ['Irrigation schedule', 'Nutrient audit']
\t\t\t: [];
\t}
</script>

<CwCalendar onDateClick={(date) => console.log(date)}>
\t{#snippet dayHeader(date)}
\t\t<span>{jobsFor(date)[0] ?? 'Open day'}</span>
\t{/snippet}

\t{#snippet dayTrailing(date)}
\t\t{@const weather = weatherFor(date)}
\t\t<div style="display:grid;justify-items:end;gap:0.1rem">
\t\t\t<span style="font-size:1.2rem">{weather.icon}</span>
\t\t\t<span>{weather.high}°</span>
\t\t</div>
\t{/snippet}

\t{#snippet dayContent(date)}
\t\t{#each jobsFor(date) as job}
\t\t\t<div>{job}</div>
\t\t{/each}
\t{/snippet}
</CwCalendar>`
			}
		]
	},
	'/demo/calendar-scroll': {
		summary:
			'CwCalendarScroll renders a vertically scrollable list of day rows. Each row keeps the date header, a large content region, and an optional actions rail while staying inside its own bounded scroll viewport.',
		steps: [
			{
				title: 'Pick the visibility mode first',
				description:
					'Set `showAllDates={false}` when sparse data should collapse to only populated dates, or turn it on when blank days must remain visible inside a contiguous range.'
			},
			{
				title: 'Give each item a local date',
				description:
					'Prefer `YYYY-MM-DD` values in each item’s `date` field so the component can normalize rows without timezone drift.'
			},
			{
				title: 'Keep rendering in snippets',
				description:
					'Pass an item array and let the page own the `content` and `actions` snippets. That keeps the list shell reusable while each screen decides what belongs in a row.'
			}
		],
		apiRows: [
			{
				name: 'items',
				type: 'T[]',
				description: 'Array of dated items that supply the row payload for each day.'
			},
			{
				name: 'showAllDates',
				type: 'boolean',
				description: 'Shows all dates in the computed range when true. Otherwise only dates whose values count as present are shown.',
				defaultValue: 'false'
			},
			{
				name: 'startDate',
				type: 'Date | string | number',
				description: 'Inclusive first day used when `showAllDates` is enabled.'
			},
			{
				name: 'endDate',
				type: 'Date | string | number',
				description: 'Inclusive last day used when `showAllDates` is enabled.'
			},
			{
				name: 'maxHeight',
				type: 'string',
				description: 'CSS size for the internal scroll viewport height cap.',
				defaultValue: '`min(70dvh, 40rem)`'
			},
			{
				name: 'hasData',
				type: '(item: T, key: string) => boolean',
				description: 'Optional custom presence check for deciding whether an item should count as populated.'
			},
			{
				name: 'content',
				type: 'Snippet<[T | null, CwCalendarScrollMeta]>',
				description: 'Main body content for each row. The first argument is the original item.'
			},
			{
				name: 'actions',
				type: 'Snippet<[T | null, CwCalendarScrollMeta]>',
				description: 'Optional actions column or action row for each day. The first argument is the original item.'
			}
		],
		examples: [
			{
				title: 'Contiguous date range with empty days',
				description: 'Use this when gaps in the schedule still need to remain visible.',
				code: `<CwCalendarScroll
\titems={plans}
\tstartDate={new Date(2026, 2, 1)}
\tendDate={new Date(2026, 2, 9)}
\tshowAllDates={true}
>
\t{#snippet content(item)}
\t\t{#if item}
\t\t\t<h4>{item.title}</h4>
\t\t\t<p>{item.note}</p>
\t\t{:else}
\t\t\t<p>No work scheduled.</p>
\t\t{/if}
\t{/snippet}

\t{#snippet actions(item)}
\t\t{#if item}
\t\t\t<CwButton size="sm" variant="secondary">Open Day</CwButton>
\t\t{/if}
\t{/snippet}
</CwCalendarScroll>`
			},
			{
				title: 'Only dates with data',
				description: 'Use this mode for compact activity logs or historical day summaries.',
				code: `<CwCalendarScroll
\titems={plans}
\tshowAllDates={false}
\tmaxHeight="28rem"
>
\t{#snippet content(item)}
\t\t<h4>{item?.title}</h4>
\t\t<p>{item?.note}</p>
\t{/snippet}
</CwCalendarScroll>`
			}
		]
	},
	'/demo/datepicker': {
		summary:
			'CwDateTimeRangePicker covers single dates, ranges, month and year picking, and optional time entry. The returned value shape changes with `mode`, so decide that up front.',
		steps: [
			{
				title: 'Choose single or range mode first',
				description:
					'Single mode returns `{ date }`, while range mode returns `{ start, end }`. That choice drives the value shape for the rest of the form.'
			},
			{
				title: 'Pick the granularity that matches the report',
				description:
					'Use `day` for exact dates, `month` for monthly rollups, and `year` for broad reporting periods.'
			},
			{
				title: 'Enable time only when the workflow needs it',
				description:
					'Including time adds more controls, more value fields, and explicit Set/Cancel confirmation, so keep it off for date-only filters.'
			}
		],
		apiRows: [
			{
				name: 'mode',
				type: "'single' | 'range'",
				description: 'Controls whether the component returns one date or a date range.',
				defaultValue: 'single'
			},
			{
				name: 'granularity',
				type: "'year' | 'month' | 'day'",
				description: 'Controls the picker depth.',
				defaultValue: 'day'
			},
			{
				name: 'includeTime',
				type: 'boolean',
				description: 'Adds time selection, along with Set/Cancel controls, to the returned value.',
				defaultValue: 'false'
			},
			{
				name: 'value',
				type: 'CwDateValue | undefined',
				description: 'Current selected date or range.'
			},
			{ name: 'maxDate', type: 'Date', description: 'Latest selectable date.', defaultValue: 'new Date()' },
			{ name: 'onchange', type: '(value: CwDateValue) => void', description: 'Runs whenever a valid selection is emitted.' },
			{
				name: 'name / required / placeholder / autocomplete',
				type: 'native attrs',
				description: 'Optional form integration attributes for the visible trigger input.'
			}
		],
		examples: [
			{
				title: 'Single month picker',
				description: 'Good for monthly reports or billing cycles.',
				code: `<script lang="ts">
\tlet monthValue = $state<CwDateValue | undefined>();
</script>

<CwDateTimeRangePicker
\tmode="single"
\tgranularity="month"
\tbind:value={monthValue}
/>`
			},
			{
				title: 'Range picker with time',
				description: 'Use this for precise reporting windows or scheduled operations.',
				code: `<script lang="ts">
\tlet rangeValue = $state<CwDateValue | undefined>();
</script>

<CwDateTimeRangePicker
\tmode="range"
\tgranularity="day"
\tincludeTime
\tname="report-window"
\trequired
\tplaceholder="Select report window..."
\tmaxDate={new Date()}
\tbind:value={rangeValue}
\tonchange={(value) => console.log(value)}
/>`
			}
		]
	},
	'/demo/time': {
		summary:
			'CwTimePicker keeps time-of-day editing separate from calendar workflows. It always edits in 24-hour format and shows the same value in 12-hour format below for quick AM/PM confirmation.',
		steps: [
			{
				title: 'Use it when the user already knows the date',
				description:
					'This control is for time-only workflows such as quiet hours, irrigation starts, and maintenance windows.'
			},
			{
				title: 'Keep the source of truth in 24-hour time',
				description:
					'The returned value is `{ hours, minutes }`, so the rest of the app can store or combine it with any date it needs.'
			},
			{
				title: 'Use `minuteStep` to fit the schedule precision',
				description:
					'Leave the default step at `1` for exact times, or raise it for routine schedules such as 5-minute or 15-minute increments.'
			}
		],
		apiRows: [
			{
				name: 'value',
				type: 'CwTimeValue',
				description: 'Current selected time with `{ hours, minutes }`.'
			},
			{
				name: 'minuteStep',
				type: 'number',
				description: 'Step size used by the minute steppers and minute sanitization.',
				defaultValue: '1'
			},
			{
				name: 'label',
				type: 'string',
				description: 'Optional field label shown above the control.'
			},
			{
				name: 'disabled',
				type: 'boolean',
				description: 'Locks the picker and dims the UI.',
				defaultValue: 'false'
			},
			{
				name: 'error',
				type: 'string',
				description: 'Optional validation message rendered below the picker.'
			},
			{
				name: 'name / required',
				type: 'native attrs',
				description: 'Form integration for the hidden `HH:MM` field value.'
			},
			{
				name: 'onchange',
				type: '(value: CwTimeValue) => void',
				description: 'Runs after the user commits a changed time.'
			}
		],
		examples: [
			{
				title: 'Basic time-only picker',
				description: 'Good for shift starts, alarms, and single schedule points.',
				code: `<script lang="ts">
\timport { CwTimePicker } from '@cropwatchdevelopment/cwui';
\timport type { CwTimeValue } from '@cropwatchdevelopment/cwui';

\tlet startTime = $state<CwTimeValue>({ hours: 6, minutes: 30 });
<\/script>

<CwTimePicker
\tlabel="Start time"
\tbind:value={startTime}
/>`
			},
			{
				title: 'Stepped scheduling',
				description: 'Raise the minute step when operators only need preset intervals.',
				code: `<script lang="ts">
\timport { CwTimePicker } from '@cropwatchdevelopment/cwui';
\timport type { CwTimeValue } from '@cropwatchdevelopment/cwui';

\tlet quietHours = $state<CwTimeValue>({ hours: 22, minutes: 0 });
<\/script>

<CwTimePicker
\tlabel="Quiet hours begin"
\tminuteStep={15}
\tname="quiet-hours"
\tbind:value={quietHours}
\tonchange={(value) => console.log(value)}
/>`
			}
		]
	},
	'/demo/heatmap': {
		summary:
			'CwHeatmap turns timestamped numeric readings into a day-by-hour grid. Feed it normalized points, then choose whether the scale should auto-fit the data or stay fixed across screens.',
		steps: [
			{
				title: 'Normalize the data to timestamp + value',
				description:
					'The component expects a flat array of points. You do not need to group by day or hour yourself.'
			},
			{
				title: 'Decide between auto and fixed scale',
				description:
					'Auto scale makes one chart read well by itself. Fixed `min` and `max` make multiple charts easier to compare directly.'
			},
			{
				title: 'Use `onCellClick` for drill-downs',
				description:
					'The callback gives you the resolved day, hour, and value so you can open a detail view or filter another widget.'
			}
		],
		apiRows: [
			{ name: 'data', type: 'CwHeatmapDataPoint[]', description: 'Timestamped numeric readings.', required: true },
			{ name: 'days', type: 'number', description: 'How many days to render.', defaultValue: '7' },
			{ name: 'min', type: 'number', description: 'Optional fixed low end of the scale.' },
			{ name: 'max', type: 'number', description: 'Optional fixed high end of the scale.' },
			{ name: 'unit', type: 'string', description: 'Unit label shown in tooltips and headings.', defaultValue: 'degC' },
			{ name: 'title', type: 'string', description: 'Heading shown above the chart.', defaultValue: 'Temperature Heatmap' },
			{ name: 'rowHeight', type: 'number', description: 'Height of each day row in pixels.', defaultValue: '24' },
			{ name: 'colors', type: '[string, string, string]', description: 'Low, mid, and high scale colors.' },
			{
				name: 'onCellClick',
				type: '(point: { date: string; hour: number; value: number | null }) => void',
				description: 'Runs when a heatmap cell is clicked.'
			}
		],
		examples: [
			{
				title: 'Auto-scaled temperature heatmap',
				description: 'Use this when the chart only needs to read well on its own.',
				code: `<CwHeatmap
\tdata={weekData}
\ttitle="Field temperature - last 7 days"
\tunit="degC"
\tonCellClick={(point) => console.log(point)}
/>`
			},
			{
				title: 'Fixed range comparison heatmap',
				description: 'Use fixed ranges when multiple heatmaps should be compared directly.',
				code: `<CwHeatmap
\tdata={twoWeekData}
\tdays={14}
\ttitle="Soil temperature"
\tunit="degF"
\tmin={50}
\tmax={90}
\trowHeight={20}
\tcolors={['#06b6d4', '#a3e635', '#f97316']}
/>`
			}
		]
	},
	'/demo/ppfdchart': {
		summary:
			'CwPPFDChart is a focused range gauge for lighting targets. Give it the current PPFD reading plus a target band, and then optionally lock the domain and tick marks for cross-crop comparisons.',
		steps: [
			{
				title: 'Start with current, targetMin, and targetMax',
				description:
					'Those three values are the minimum set needed to render the gauge and current status.'
			},
			{
				title: 'Add DLI and timestamp when available',
				description:
					'These fields make the summary more useful, but the chart still works without them.'
			},
			{
				title: 'Lock the domain for side-by-side comparisons',
				description:
					'When different crops or rooms need direct comparison, provide `domainMin`, `domainMax`, and explicit `ticks`.'
			}
		],
		apiRows: [
			{ name: 'current', type: 'number', description: 'Current PPFD reading.', required: true },
			{ name: 'targetMin', type: 'number', description: 'Lower edge of the target band.', required: true },
			{ name: 'targetMax', type: 'number', description: 'Upper edge of the target band.', required: true },
			{ name: 'plant', type: 'string', description: 'Optional crop or cultivar label.', defaultValue: "''" },
			{ name: 'unit', type: 'string', description: 'Reading unit label.', defaultValue: 'umol/m2/s' },
			{ name: 'domainMin', type: 'number', description: 'Lower chart domain.', defaultValue: '0' },
			{ name: 'domainMax', type: 'number', description: 'Upper chart domain. Auto-expands when omitted.' },
			{ name: 'ticks', type: 'Array<number | CwPPFDTick>', description: 'Optional explicit tick labels.' },
			{ name: 'dliToday', type: 'number', description: 'Optional daily light integral value.' },
			{ name: 'updatedAt', type: 'string | Date | number', description: 'Optional timestamp displayed in the summary.' },
			{ name: 'showSummary', type: 'boolean', description: 'Shows the summary block above the gauge.', defaultValue: 'true' },
			{ name: 'showDelta', type: 'boolean', description: 'Shows the delta from the target band.', defaultValue: 'true' },
			{ name: 'lowLabel / optimalLabel / highLabel', type: 'string', description: 'Custom text for the three status ranges.' }
		],
		examples: [
			{
				title: 'Basic crop lighting target',
				description: 'This is the smallest useful configuration.',
				code: `<CwPPFDChart
\tplant="Pepper"
\tcurrent={740}
\ttargetMin={600}
\ttargetMax={1000}
\tdliToday={18.4}
\tupdatedAt={Date.now()}
/>`
			},
			{
				title: 'Fixed production scale',
				description: 'Lock the domain when users compare multiple crops or rooms side by side.',
				code: `<CwPPFDChart
\tplant="Tomato"
\tcurrent={1380}
\ttargetMin={700}
\ttargetMax={1200}
\tdomainMin={0}
\tdomainMax={1600}
\tticks={[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600]}
\tdliToday={26.9}
/>`
			},
			{
				title: 'Compact chart with custom labels',
				description: 'Useful when the surrounding card already provides most of the context.',
				code: `<CwPPFDChart
\tcurrent={180}
\ttargetMin={250}
\ttargetMax={400}
\tshowSummary={false}
\tshowDelta={false}
\tlowLabel="Too dim"
\toptimalLabel="Target zone"
\thighLabel="Too bright"
/>`
			}
		]
	},
	'/demo/datatable': {
		summary:
			'CwDataTable is query-driven. The table owns search, sort, pagination, refresh, column visibility, optional grouped rows, and virtual windowing, while your `loadData(query)` function stays authoritative for rows, totals, and filters. Built-in column settings persist visible columns per grid ID in local storage.',
		steps: [
			{
				title: 'Start from the query contract',
				description:
					'Every interaction funnels back through `loadData(query)`. Search text, sort state, `page`, `pageSize`, and `filters` are all part of the same request shape.'
			},
			{
				title: 'Use pagination by default',
				description:
					'Keep the default mode when the dataset is moderate or when you want explicit page navigation. Turn on `virtualScroll` when the main goal is continuous browsing through large result sets.'
			},
			{
				title: 'Group rows only in paginated mode',
				description:
					'Use `groupBy` when you want visual category headers inside the default paginated table. Group headers are intentionally skipped in `virtualScroll` mode so row windowing stays predictable.'
			},
			{
				title: 'Use fillParent inside a bounded flex shell',
				description:
					'If a dashboard card or split pane already owns height, make the table a direct flex child with `fillParent` and keep shrinking ancestors at `min-height: 0` so the internal viewport can resolve.'
			},
			{
				title: 'Use virtualScrollHeight when the table owns height',
				description:
					'When you do not control the parent layout, set `virtualScrollHeight` and let the table manage its own viewport. This is the simplest standalone pattern.'
			},
			{
				title: 'Treat filters as external state',
				description:
					'Search and sort UI are built in. Filters are intentionally passed in as `Record<string, string[]>` so your page owns filter controls while the table still preserves them in every request.'
			},
			{
				title: 'Fix layout before debugging data loading',
				description:
					'Virtual mode only prefetches once the viewport has a real height. If the table renders but does not continue loading on scroll, inspect the layout chain first.'
			},
			{
				title: 'Tune for touch, not just desktop',
				description:
					'`virtualRowHeight` and `virtualOverscan` matter most on iPad and other touch devices. Keep row height estimates honest and overscan high enough to avoid blank gaps during momentum scrolling.'
			}
		],
		apiTitle: 'Core API for pagination, grouping, and virtual mode',
		apiNote:
			'Pagination is the default behavior. Use `groupBy` there when you want section headers between rows. In virtual mode, `pageSize` becomes the number of rows fetched per request rather than the number of rows shown on one discrete page, and grouped headers are disabled to keep the virtual window stable. Every table also includes a built-in overflow menu for refresh and persisted column settings. Pair `virtualScroll` with either `virtualScrollHeight` or `fillParent` so the table has a real scroll viewport.',
		apiRows: [
			{
				name: 'columns',
				type: 'CwColumnDef<T>[]',
				description: 'Column definitions for headers, alignment, sortability, and optional string cell formatters.',
				required: true
			},
			{
				name: 'loadData',
				type: '(query: CwTableQuery) => Promise<CwTableResult<T>>',
				description:
					'Async row loader. Receives `page`, `pageSize`, `search`, `sort`, `filters`, and `signal`, and should return the matching `rows` plus `total` when known.',
				required: true
			},
			{
				name: 'rowKey',
				type: 'keyof T & string',
				description: 'Stable unique key used for keyed row rendering and row actions.',
				required: true
			},
			{
				name: 'searchable',
				type: 'boolean',
				description: 'Shows the built-in search input in the toolbar.',
				defaultValue: 'true'
			},
			{
				name: 'filters',
				type: 'Record<string, string[]>',
				description:
					'Externally-controlled filters preserved in every request. Use this when your page owns dropdowns, chips, tabs, or other filter controls.',
				defaultValue: '{}'
			},
			{
				name: 'pageSize',
				type: 'number',
				description:
					'Rows per page in pagination mode. In virtual mode, this becomes the batch size requested each time the table fetches more rows.',
				defaultValue: '20'
			},
			{
				name: 'pageSizeOptions',
				type: 'number[]',
				description: 'Toolbar choices shown in the rows-per-page or rows-per-batch dropdown.',
				defaultValue: '[10, 20, 50, 100]'
			},
			{
				name: 'groupBy',
				type: "keyof T & string | ((row: T) => string | number | boolean | null | undefined)",
				description:
					'Optional grouping key or callback for the default paginated renderer. The table inserts group headers for each resolved label and ignores this prop in `virtualScroll` mode.'
			},
			{
				name: 'ungroupedLabel',
				type: 'string',
				description:
					'Fallback group header label used when `groupBy` resolves to `null`, `undefined`, or an empty string.',
				defaultValue: "'Ungrouped'"
			},
			{
				name: 'gridId',
				type: 'string',
				description:
					'Storage key for persisted column visibility. Defaults to the current page path plus `_grid`; pass an explicit value when multiple tables share one route.',
				defaultValue: 'derived from route'
			},
			{
				name: 'virtualScroll',
				type: 'boolean',
				description:
					'Enables continuous scrolling. The table incrementally loads pages, renders only the visible row window plus overscan, and waits for a real viewport before prefetching more rows.',
				defaultValue: 'false'
			},
			{
				name: 'virtualScrollHeight',
				type: 'string',
				description:
					'Viewport height used when `virtualScroll` is enabled without `fillParent`. Choose this when the table should manage its own standalone scroll area. Accepts any CSS size such as `24rem`, `50vh`, or `480px`.',
				defaultValue: "'28rem'"
			},
			{
				name: 'virtualRowHeight',
				type: 'number',
				description:
					'Estimated row height in pixels for virtual windowing. Keep this close to the real rendered row height for the smoothest touch scrolling.',
				defaultValue: '52'
			},
			{
				name: 'virtualOverscan',
				type: 'number',
				description:
					'Extra rows rendered above and below the viewport. Higher values reduce visible pop-in during fast scrolls and iPad momentum scrolling.',
				defaultValue: '12'
			},
			{
				name: 'fillParent',
				type: 'boolean',
				description:
					'Makes the table flex to fill a bounded parent and turns the body region into the scroll container. Best for dashboard cards, split panes, and other flex layouts that already define height. Any shrinking ancestor should also allow it with `min-height: 0`.',
				defaultValue: 'false'
			},
			{
				name: 'actionsHeader',
				type: 'Snippet',
				description:
					'Snippet rendered in the toolbar before the built-in overflow menu. Use this for add, export, filter, or other table-level actions.'
			},
			{
				name: 'toolbarActions',
				type: 'Snippet',
				description:
					'Deprecated alias for `actionsHeader`, kept so existing toolbar content keeps rendering during migration.'
			},
			{
				name: 'cell',
				type: 'Snippet<[T, CwColumnDef<T>, string]>',
				description:
					'Optional custom cell renderer. Useful for badges, durations, links, and richer markup while still falling back to the table’s default string value.'
			},
			{
				name: 'rowActions',
				type: 'Snippet<[T]>',
				description: 'Optional per-row actions column rendered on the far right.'
			},
			{
				name: 'rowActionsHeader',
				type: 'string',
				description:
					'Optional text label for the row actions column header. If omitted, the header stays blank.'
			},
			{
				name: 'rowTextSizeKey',
				type: 'string',
				description:
					'Optional row property name containing a CSS font-size value when a dataset needs row-level text scaling.'
			},
			{
				name: 'onSearch / onSort / onPageSizeChanged / onRefresh',
				type: 'callbacks',
				description:
					'Optional observers for analytics, syncing external controls, or reacting to table query changes outside the table itself. `onRefresh` fires when the built-in Refresh menu action is selected.'
			}
		],
		examples: [
			{
				title: 'Basic paginated table',
				description:
					'Use this first. Search and sort are built in, while your loader stays responsible for filtering, slicing, and total counts.',
				code: `<CwDataTable
\tcolumns={columns}
\tloadData={loadData}
\trowKey="id"
\tgridId="devices_grid"
\tsearchable
\tpageSize={20}
/>`
			},
			{
				title: 'Grouped paginated table',
				description:
					'Use `groupBy` when operators need category headers like greenhouse, zone, or device family while keeping normal pagination.',
				code: `<CwDataTable
\tcolumns={columns}
\tloadData={loadData}
\trowKey="id"
\tgridId="devices_grouped_grid"
\tgroupBy="group"
\tpageSize={12}
\tsearchable
/>`
			},
			{
				title: 'Virtual scrolling with external filters',
				description:
					'Use this when the table owns the viewport height with `virtualScrollHeight`, while the page still owns filter state across search, sort, and scrolling.',
				code: `<script lang="ts">
\tlet status = $state<'all' | 'online' | 'offline' | 'warning'>('all');
\tconst filters = $derived(status === 'all' ? {} : { status: [status] });
</script>

<CwDataTable
\tcolumns={columns}
\tloadData={loadData}
\trowKey="id"
\tgridId="devices_virtual_grid"
\tfilters={filters}
\tvirtualScroll
\tvirtualScrollHeight="24rem"
\tvirtualRowHeight={52}
\tvirtualOverscan={14}
\tpageSize={75}
/>`
			},
			{
				title: 'Fill-parent virtual table inside a flex dashboard shell',
				description:
					'Prefer this layout when the surrounding shell already defines height. The key is making the table a flex child and keeping each shrinking wrapper at `min-height: 0`.',
				code: `<div class="table-shell">
\t<div class="table-shell__body">
\t\t<CwDataTable
\t\t\tcolumns={columns}
\t\t\tloadData={loadData}
\t\t\trowKey="id"
\t\t\tgridId="devices_fill_parent_grid"
\t\t\tfillParent
\t\t\tvirtualScroll
\t\t\tpageSize={100}
\t\t/>
\t</div>
</div>

<style>
\t.table-shell {
\t\tdisplay: flex;
\t\tflex-direction: column;
\t\theight: clamp(22rem, 58vh, 32rem);
\t\tmin-height: 0;
\t}

\t.table-shell__body {
\t\tdisplay: flex;
\t\tflex: 1 1 auto;
\t\tmin-height: 0;
\t}
</style>`
			}
		]
	},
	'/demo/vpdchart': {
		summary:
			'CwVPDChart is a matrix view of climate strategy rather than a single-value gauge. You can drive it from an explicit `current` VPD reading, or let it derive room VPD from temperature and humidity.',
		steps: [
			{
				title: 'Define the target band first',
				description:
					'`targetMin` and `targetMax` define the desired VPD window and are required regardless of how you supply the live reading.'
			},
			{
				title: 'Choose live reading or derived room state',
				description:
					'Pass `current` when you already have VPD from upstream data. Otherwise provide temperature and RH so the chart can derive the room VPD.'
			},
			{
				title: 'Customize the matrix only for advanced climate programs',
				description:
					'Most screens can use the defaults. Reach for `stageBands`, `temperatureValuesC`, `humidityValues`, or `useF` only when the climate program requires them.'
			}
		],
		apiRows: [
			{ name: 'targetMin', type: 'number', description: 'Lower edge of the target band.', required: true },
			{ name: 'targetMax', type: 'number', description: 'Upper edge of the target band.', required: true },
			{ name: 'current', type: 'number', description: 'Optional direct VPD reading.' },
			{ name: 'plant', type: 'string', description: 'Optional crop label.', defaultValue: "''" },
			{ name: 'growthStage', type: 'string', description: 'Optional growth-stage label.', defaultValue: "''" },
			{ name: 'unit', type: 'string', description: 'VPD unit label.', defaultValue: 'kPa' },
			{ name: 'useF', type: 'boolean', description: 'Displays temperature headers in Fahrenheit.', defaultValue: 'false' },
			{ name: 'airTemperatureC', type: 'number', description: 'Room air temperature in Celsius.' },
			{ name: 'leafTemperatureC', type: 'number', description: 'Optional leaf temperature in Celsius.' },
			{ name: 'relativeHumidity', type: 'number', description: 'Relative humidity percentage.' },
			{ name: 'updatedAt', type: 'string | Date | number', description: 'Optional timestamp shown in the summary.' },
			{ name: 'showSummary', type: 'boolean', description: 'Shows the summary header block.', defaultValue: 'true' },
			{ name: 'showLegend', type: 'boolean', description: 'Shows the stage-band legend.', defaultValue: 'true' },
			{ name: 'temperatureValuesC', type: 'number[]', description: 'Custom temperature axis values in Celsius.' },
			{ name: 'humidityValues', type: 'number[]', description: 'Custom relative humidity axis values.' },
			{ name: 'stageBands', type: 'CwVPDStageBand[]', description: 'Optional custom climate-stage band definitions.' }
		],
		examples: [
			{
				title: 'Derived room VPD from temperature and RH',
				description: 'This is the easiest way to use the chart when upstream data is raw room climate data.',
				code: `<CwVPDChart
\tplant="Tomato"
\tgrowthStage="Flower set"
\ttargetMin={1.0}
\ttargetMax={1.3}
\tairTemperatureC={27}
\tleafTemperatureC={26.1}
\trelativeHumidity={60}
\tupdatedAt={Date.now()}
/>`
			},
			{
				title: 'Direct VPD reading with Fahrenheit labels',
				description: 'Use `current` when VPD is already calculated elsewhere and you only want the matrix as context.',
				code: `<CwVPDChart
\tplant="Pepper"
\tgrowthStage="Late fruiting"
\tcurrent={1.18}
\ttargetMin={1.1}
\ttargetMax={1.4}
\tuseF
\tshowLegend={false}
\tshowSummary={false}
\ttemperatureValuesC={[18, 20, 22, 24, 26, 28, 30]}
\thumidityValues={[40, 50, 60, 70, 80, 90]}
/>`
			},
			{
				title: 'Custom climate stage bands',
				description: 'This pattern is useful when your crop strategy does not match the default stage groupings.',
				code: `<script lang="ts">
\tconst stageBands = [
\t\t{ label: 'Clone / Rooting', min: 0, max: 0.75, tone: 'humid' },
\t\t{ label: 'Vegetative', min: 0.75, max: 1.15, tone: 'balanced' },
\t\t{ label: 'Generative', min: 1.15, max: 1.6, tone: 'flower' }
\t];
</script>

<CwVPDChart
\tplant="Cannabis"
\tgrowthStage="Generative push"
\ttargetMin={1.15}
\ttargetMax={1.45}
\tairTemperatureC={29}
\trelativeHumidity={56}
\tstageBands={stageBands}
/>`
			}
		]
	},
		'/demo/alert-points': {
			summary:
				'CwAlertPointsEditor is a number-line editor for threshold rules. It keeps the center point anchored, lets users add exact points, open-ended thresholds, and ranges, and keeps the bound values normalized in Celsius while the selected unit stays visual-only.',
		steps: [
			{
				title: 'Treat the bound value as editable form state',
				description:
					'Numeric fields stay as strings while the user types so partial negatives and decimals do not get wiped out mid-edit.'
			},
			{
				title: 'Route built-in copy through the `text` prop',
				description:
					'Pass labels, validation messages, preview sentences, and empty-state copy into `text` so your translation library controls every built-in string.'
			},
			{
				title: 'Use the condition dropdown to decide the shape',
				description:
					'`equals` draws a single point, `range` requires both `min` and `max`, and the less-than/greater-than variants render one-sided ranges.'
			},
				{
					title: 'Normalize before you submit',
					description:
						'When you need a payload for storage or an API, convert the Celsius-backed `center`, `value`, `min`, and `max` fields into numbers or `null`.'
				},
			{
				title: 'Let the scale breathe around the center',
				description:
					'The number line expands symmetrically around the configured center point so negative values always stay left and positive values stay right.'
			}
		],
		apiTitle: 'Props and bound value shape',
		apiNote:
			'The component is intentionally optimized for editing. Numeric inputs are stored as strings inside the bound object.',
		apiRows: [
				{
					name: 'value',
					type: 'CwAlertPointsValue',
					description:
						'Bindable editor state containing the visual `unit`, the Celsius-backed `center`, and the editable `points[]` collection.'
				},
				{
					name: 'text',
					type: 'CwAlertPointsEditorText',
					description:
						'Optional copy overrides for labels, validation text, preview sentences, empty states, and condition labels. Dynamic fields accept formatter functions so an external translation library can interpolate counts, units, and lists.'
				},
				{
					name: 'value.unit',
					type: "'C' | 'F' | 'K'",
					description: 'Visual-only unit rendered beside the center control and used in helper copy. The bound numeric fields remain in Celsius.'
				},
				{
					name: 'value.center',
					type: 'string',
					description:
						'Midpoint of the number line. Kept as a string while editing, stored in Celsius, and typically normalized to a number before saving.'
			},
			{
				name: 'value.points',
				type: 'CwAlertPointRule[]',
				description:
					'Editable list of alert rules. Each rule includes `id`, `name`, `color`, `condition`, `value`, `min`, and `max`.'
			},
			{
				name: 'point.condition',
				type: "'equals' | 'range' | 'lessThan' | 'lessThanOrEqual' | 'greaterThan' | 'greaterThanOrEqual'",
				description: 'Controls whether the preview draws a point, a closed range, or a one-sided threshold.'
			},
			{
				name: 'point.color',
				type: 'string',
				description: 'Hex colour used for the point or range and preserved in the bound output object.'
			},
			{
				name: 'onchange',
				type: '(value: CwAlertPointsValue) => void',
				description: 'Optional callback fired whenever the bound editor state changes.'
			},
			{
				name: 'class',
				type: 'string',
				description: 'Optional class hook applied to the outer wrapper.'
			}
		],
		examples: [
			{
				title: 'Bind the editor state',
				description: 'This is the minimal setup for interactive editing inside your own page or drawer.',
				code: `<script lang="ts">
\timport { CwAlertPointsEditor } from '@cropwatchdevelopment/cwui';
\timport type { CwAlertPointsValue } from '@cropwatchdevelopment/cwui';

\tlet alertPoints = $state<CwAlertPointsValue>({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: []
\t});
</script>

<CwAlertPointsEditor bind:value={alertPoints} />`
			},
			{
				title: 'Translate the editor copy',
				description: 'Use the `text` prop for built-in UI strings and keep translated point names in your bound value.',
				code: `<script lang="ts">
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
\t\t\t\tid: 'alert-1',
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
\t\toverlapError: (labels) =>
\t\t\tt('alerts.validation.overlap', { labels: labels.join(', ') })
\t};
</script>

<CwAlertPointsEditor bind:value={alertPoints} text={alertPointsText} />`
			},
				{
					title: 'Normalize before API submit',
					description: 'Convert the Celsius-backed string fields into numbers once the user is done building the rule set.',
					code: `<script lang="ts">
\tlet alertPoints = $state({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: [
\t\t\t{
\t\t\t\tid: 'alert-1',
\t\t\t\tname: 'Cold edge',
\t\t\t\tcolor: '#f7903b',
\t\t\t\tcondition: 'lessThanOrEqual',
\t\t\t\tvalue: '-2',
\t\t\t\tmin: '',
\t\t\t\tmax: ''
\t\t\t}
\t\t]
\t});

\tfunction toNumber(raw: string) {
\t\tconst trimmed = raw.trim();
\t\tif (!trimmed) return null;
\t\tconst parsed = Number(trimmed);
\t\treturn Number.isFinite(parsed) ? parsed : null;
\t}

\tconst normalized = $derived({
\t\tcenter: toNumber(alertPoints.center) ?? 0,
\t\tpoints: alertPoints.points.map((point) =>
\t\t\tpoint.condition === 'range'
\t\t\t\t? { ...point, min: toNumber(point.min), max: toNumber(point.max) }
\t\t\t\t: { ...point, value: toNumber(point.value) }
\t\t)
\t});
</script>`
			}
		]
	},
	'/demo/card-data-row-item': {
		summary:
			'CwCardDataRowItem is the reusable detail-row primitive behind CwDataList and the expanded CwSensorCard panel. Use it anywhere you need a compact sensor-style label/value row with optional built-in icons and freshness timers.',
		steps: [
			{
				title: 'Wrap it in a real list',
				description:
					'The component renders an `<li>`, so use it inside `ul` or `ol` when you render it directly.'
			},
			{
				title: 'Use built-ins first',
				description:
					'Set `icon` to `thermo`, `drop`, or `timer` for the shared SVG icons. Plain strings and snippets still work for custom metadata.'
			},
			{
				title: 'Switch to timer mode with `lastSeenAt`',
				description:
					'When `lastSeenAt` is present, the value side renders `CwDuration` automatically and appends the `ago` suffix. `lastUpdated` still works as a backwards-compatible alias.'
			},
			{
				title: 'Use expiry callbacks or bind freshness state',
				description:
					'Use `onExpire`, `onTimeoutReset`, and `bind:withinTimeout` when a parent needs to react to stale data. You can still pass the legacy `alarmCallback` names if needed.'
			}
		],
		apiRows: [
			{
				name: 'id',
				type: 'string',
				description: 'Stable identifier for keyed rendering, telemetry hooks, or debug attributes.',
				required: true
			},
			{
				name: 'label',
				type: 'string',
				description: 'Row label shown on the left side.',
				required: true
			},
			{
				name: 'value',
				type: 'string | number | null',
				description: 'Static value shown on the right side when `lastUpdated` is not supplied.'
			},
			{
				name: 'unit',
				type: 'string',
				description: 'Optional suffix rendered after `value`, for example `%`, `°C`, or `km/h`.'
			},
			{
				name: 'icon',
				type: "'drop' | 'thermo' | 'timer' | string | Snippet",
				description: 'Built-in icon keyword, plain string content such as emoji, or a custom snippet.'
			},
			{
				name: 'lastSeenAt / lastSeen / LastSeen / lastUpdated',
				type: 'Date | string | number',
				description: 'Switches the row into live timer mode via `CwDuration`. Prefer `lastSeenAt`; `lastUpdated` remains supported for compatibility.'
			},
			{
				name: 'expireAfterMinutes / alarmTimeoutMinutes / AlarmTimeoutMinutes / expectedUpdateAfter',
				type: 'number',
				description: 'Minutes until the freshness alarm is considered overdue. Prefer `expireAfterMinutes`; `expectedUpdateAfter` remains supported for compatibility.'
			},
			{
				name: 'onExpire',
				type: '() => void',
				description: 'Called once when the row crosses its freshness timeout.'
			},
			{
				name: 'onTimeoutReset',
				type: '() => void',
				description: 'Called when the row returns to a non-expired state after previously being overdue.'
			},
			{
				name: 'bind:withinTimeout',
				type: 'boolean | null',
				description: 'Bindable freshness state. `true` means fresh, `false` means expired, and `null` means no timer inputs were supplied.'
			},
			{
				name: 'alarmScheduler',
				type: 'CwAlarmApi',
				description: 'Optional shared scheduler. Omit it to let the row create and manage its own alarm scheduler internally.'
			},
			{
				name: 'alarmCallback / AlarmCallback / alarmResetCallback / AlarmResetCallback',
				type: '() => void',
				description: 'Legacy callback aliases preserved for existing integrations.'
			},
			{
				name: 'status',
				type: "'online' | 'offline' | 'warning' | 'loading'",
				description: 'Optional metadata hook preserved on the row so parent components can round-trip row state.'
			},
			{
				name: 'class',
				type: 'string',
				description: 'Extra class applied to the root row element.'
			}
		],
		apiTitle: 'Row props',
		apiNote: 'Because the component renders `<li>`, the surrounding list container stays your responsibility.',
		examples: [
			{
				title: 'Built-in sensor rows',
				description: 'The default pairing for temperature, humidity, and freshness data.',
				code: `<ul>
\t<CwCardDataRowItem id="temperature" label="Temperature" value="22.40" unit="°C" icon="thermo" />
\t<CwCardDataRowItem id="humidity" label="Humidity" value="67.30" unit="%" icon="drop" />
\t<CwCardDataRowItem id="updated" label="Last Update" icon="timer" lastSeenAt={new Date(Date.now() - 120_000)} expireAfterMinutes={10} />
</ul>`
			},
			{
				title: 'Bindable freshness state',
				description: 'Use this when a parent needs the timeout state without parsing timer text.',
				code: `<script lang="ts">
\tlet withinTimeout = $state<boolean | null>(null);
\tlet expired = $state(false);
</script>

<ul>
\t<CwCardDataRowItem
\t\tid="updated"
\t\tlabel="Last Update"
\t\ticon="timer"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t\tonExpire={() => (expired = true)}
\t\tbind:withinTimeout
\t/>
</ul>`
			},
			{
				title: 'Custom metadata row',
				description: 'Plain strings work when you need a one-off icon like an emoji or text token.',
				code: `<ul>
\t<CwCardDataRowItem id="relay-state" label="Relay State" value="On" icon="⚡" />
</ul>`
			}
		]
	},
	'/demo/sensorcard': {
		summary:
			'CwLocationCard, CwSensorCard, and CwDataList now split the old monolithic sensor-card API into three focused pieces. Compose them in markup so location state, sensor state, and detail rows stay reactive without pushing a devices array into one component.',
		steps: [
			{
				title: 'Start with the location shell',
				description:
					'Wrap each sensor stack in `CwLocationCard`. The location header derives aggregate status from nested `CwSensorCard` children, but you can still pass a fallback `status` for empty locations.'
			},
			{
				title: 'Render one sensor per CwSensorCard',
				description:
					'Each expandable panel now owns exactly one sensor. Pass the readings and freshness props directly to that card, and use `defaultExpanded`, `storageKey`, or `bind:open` when you need expand-state control.'
			},
			{
				title: 'Feed the expanded body with CwDataList',
				description:
					'Pass `rows` into `CwDataList` for the standard detail layout. Use explicit row arrays when the sensor needs custom metadata, or fall back to `buildCwSensorCardDetailRows(sensor)` for common temperature and humidity cases.'
			},
			{
				title: 'Bind freshness where you need it',
				description:
					'Use `onNavigate` on the location shell, `onExpand`, `onCollapse`, `onExpire`, and `bind:withinTimeout` on the sensor card, and `bind:rowWithinTimeoutMap` on the data list when the host app needs row-level freshness state.'
			}
		],
		apiRows: [
			{
				name: 'CwLocationCard.title',
				type: 'string',
				description: 'Location or site label shown in the outer shell header.',
				defaultValue: 'Location'
			},
			{
				name: 'CwLocationCard.status',
				type: 'CwStatusDotStatus',
				description: 'Fallback location status used when no nested sensor cards are registered.',
				defaultValue: 'loading'
			},
			{
				name: 'CwLocationCard.onNavigate',
				type: '(target: string) => void',
				description: 'Called from the location header action button.'
			},
			{
				name: 'CwSensorCard.label',
				type: 'string',
				description: 'Sensor or device label shown in the expandable panel header.'
			},
			{
				name: 'CwSensorCard.status',
				type: 'CwStatusDotStatus',
				description: 'Base sensor status before freshness overrides are applied.',
				defaultValue: 'loading'
			},
			{
				name: 'CwSensorCard.primaryValue / primaryUnit / primary_icon',
				type: 'number / string / string | Snippet',
				description: 'Main reading shown in the sensor panel header. If the icon is omitted, the card infers a sensible built-in icon from the unit.'
			},
			{
				name: 'CwSensorCard.secondaryValue / secondaryUnit / secondary_icon',
				type: 'number / string / string | Snippet',
				description: 'Optional supporting reading rendered next to the primary reading.'
			},
			{
				name: 'CwSensorCard.lastSeenAt / lastSeen / LastSeen / lastUpdated',
				type: 'Date | string | number',
				description: 'Freshness timestamp used for overdue detection on the sensor card. Prefer `lastSeenAt`; `lastUpdated` remains supported for compatibility.'
			},
			{
				name: 'CwSensorCard.expireAfterMinutes / alarmTimeoutMinutes / AlarmTimeoutMinutes / expectedUpdateAfterMinutes',
				type: 'number',
				description: 'Threshold used by the sensor-card freshness timer. Prefer `expireAfterMinutes`; `expectedUpdateAfterMinutes` remains supported for compatibility.'
			},
			{
				name: 'CwSensorCard.open / defaultExpanded / storageKey',
				type: 'boolean / boolean / string',
				description: 'Use these to control or persist the expanded state for an individual sensor panel.'
			},
			{
				name: 'CwSensorCard.onExpand / onCollapse / onExpire / alarmCallback / AlarmCallback',
				type: '(label: string) => void',
				description: 'Lifecycle callbacks for panel toggles and freshness expiry. `alarmCallback` and `AlarmCallback` are accepted as aliases for expiry handling.'
			},
			{
				name: 'bind:CwSensorCard.withinTimeout',
				type: 'boolean | null',
				description: 'Bindable freshness state for the sensor card itself. `true` means fresh, `false` means expired, and `null` means no timer inputs were supplied.'
			},
			{
				name: 'CwDataList.rows',
				type: 'CwDataListRow[]',
				description: 'Detail rows rendered inside the expanded sensor body.'
			},
			{
				name: 'bind:CwDataList.rowWithinTimeoutMap',
				type: 'Record<string, boolean | null>',
				description: 'Bindable row freshness state keyed by row id. Rows without timer inputs are omitted from the map.'
			},
			{
				name: 'class',
				type: 'string',
				description: 'Each component also accepts an extra `class` prop on its own root element.'
			}
		],
		apiTitle: 'Composition props',
		apiNote:
			'The intended structure is `CwLocationCard` -> `CwSensorCard` -> `CwDataList`. Use `CwCardDataRowItem` directly only when you need row-level control outside the shared list wrapper.',
		examples: [
			{
				title: 'Single sensor inside a location shell',
				description: 'The default composed structure for one sensor per location.',
				code: `<CwLocationCard title="Greenhouse A">
\t<CwSensorCard
\t\tlabel="CW-SS-TMEPNCO2-18"
\t\tstatus="online"
\t\tprimaryValue={-22.93}
\t\tprimaryUnit="°C"
\t\tsecondaryValue={79.61}
\t\tsecondaryUnit="%"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t>
\t\t<CwDataList rows={rows} />
\t</CwSensorCard>
</CwLocationCard>`
			},
			{
				title: 'Bindable sensor freshness',
				description: 'Use this when the host application needs sensor-level expiry state.',
				code: `<script lang="ts">
\tlet sensorWithinTimeout = $state<boolean | null>(null);
</script>

<CwSensorCard
\tlabel="CW-SS-TMEPNCO2-18"
\tstatus="online"
\tprimaryValue={22.93}
\tprimaryUnit="°C"
\tsecondaryValue={79.61}
\tsecondaryUnit="%"
\tlastSeenAt={new Date(Date.now() - 120_000)}
\texpireAfterMinutes={10}
\tonExpire={(label) => console.log('expired:', label)}
\tbind:withinTimeout={sensorWithinTimeout}
/>`
			},
			{
				title: 'Multiple sensors under one location',
				description: 'Render one `CwSensorCard` per sensor and let the location shell aggregate the status.',
				code: `<CwLocationCard title="Research Lab">
\t{#each sensors as sensor (sensor.label)}
\t\t<CwSensorCard label={sensor.label} status={sensor.status ?? 'online'} primaryValue={sensor.primaryValue}>
\t\t\t<CwDataList rows={buildCwSensorCardDetailRows(sensor)} />
\t\t</CwSensorCard>
\t{/each}
</CwLocationCard>`
			},
			{
				title: 'Custom detail rows',
				description: 'Pass explicit rows into `CwDataList` when the sensor needs custom metadata.',
				code: `<script lang="ts">
\tconst weatherDevice = {
\t\tlabel: 'CW-Weather-01',
\t\tprimaryValue: 22.4,
\t\tprimaryUnit: '°C',
\t\tsecondaryValue: 67.3,
\t\tsecondaryUnit: '%',
\t\tlastUpdated: new Date(Date.now() - 60_000),
\t\texpectedUpdateAfterMinutes: 10,
\t\tdetailRows: [
\t\t\t{ id: 'wind', label: 'Wind Speed', value: '12.50', unit: 'km/h', icon: '💨' },
\t\t\t{ id: 'lux', label: 'Lux Level', value: '48500', unit: 'lx', icon: '☀️' },
\t\t\t{ id: 'updated', label: 'Last Update', icon: 'timer', lastUpdated: new Date(Date.now() - 60_000), expectedUpdateAfter: 10 }
\t\t]
\t};
</script>

<CwSensorCard label={weatherDevice.label} defaultExpanded>
\t<CwDataList rows={weatherDevice.detailRows} />
</CwSensorCard>`
			}
		]
	}
};
