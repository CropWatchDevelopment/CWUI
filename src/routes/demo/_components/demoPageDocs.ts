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
			'CwButton is the standard action component. Start with a label, then add variant, size, and loading or disabled state only when the workflow needs it.',
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
				name: 'children',
				type: 'Snippet',
				description: 'Button label and optional inline icon content.'
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
				type: "'text' | 'numeric' | 'email' | 'password' | 'devEui' | 'creditCard' | 'cardExpiry'",
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
				title: 'Formatted card and DevEUI inputs',
				description: 'Use the specialized types only when you want the formatting behavior.',
				code: `<script lang="ts">
\tlet devEui = $state('');
\tlet cardNumber = $state('');
\tlet expiry = $state('');
</script>

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
			{ name: 'id', type: 'string', description: 'Optional explicit input id.' },
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
				name: '...native checkbox attrs',
				type: 'HTMLInputAttributes',
				description: 'Pass `name`, `value`, `disabled`, `aria-*`, and native checkbox attributes through to the real input.'
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
					'Including time adds more controls and more value fields, so keep it off for date-only filters.'
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
				description: 'Adds time selection to the returned value.',
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
			'CwDataTable is query-driven. The table owns search, sort, pagination, and virtual windowing, while your `loadData(query)` function stays authoritative for rows, totals, and filters. For real layouts, pair `virtualScroll` with either `virtualScrollHeight` or `fillParent` inside a bounded flex shell.',
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
		apiTitle: 'Core API for pagination and virtual mode',
		apiNote:
			'Pagination is the default behavior. In virtual mode, `pageSize` becomes the number of rows fetched per request rather than the number of rows shown on one discrete page. Pair `virtualScroll` with either `virtualScrollHeight` or `fillParent` so the table has a real scroll viewport.',
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
				name: 'rowTextSizeKey',
				type: 'string',
				description:
					'Optional row property name containing a CSS font-size value when a dataset needs row-level text scaling.'
			},
			{
				name: 'onSearch / onSort / onPageSizeChanged',
				type: 'callbacks',
				description:
					'Optional observers for analytics, syncing external controls, or reacting to table query changes outside the table itself.'
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
\tsearchable
\tpageSize={20}
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
	}
};
