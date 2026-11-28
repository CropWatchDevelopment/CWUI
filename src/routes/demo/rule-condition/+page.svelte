<script lang="ts">
	import { CwCard, CwDropdown, CwRuleCondition, isRuleConditionValid } from '$lib/index.js';
	import type { CwAlertPointsValue } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const resetGuide = 'https://kb.cropwatch.io/en/software/setting-up-alert-rules#trigger-and-reset';
	const resetGuideJa = 'https://kb.cropwatch.io/ja/software/setting-up-alert-rules#trigger-and-reset';

	const readings = [
		{ label: 'Temperature', value: 'temperature_c', unit: '' },
		{ label: 'Humidity', value: 'humidity', unit: '%' },
		{ label: 'CO₂', value: 'co2', unit: 'ppm' },
		{ label: 'Water depth', value: 'depth_cm', unit: 'cm' }
	];

	const blank = (): CwAlertPointsValue => ({
		unit: 'C',
		center: '0',
		points: [
			{ id: 'limit-1', name: '', color: '#3987e5', condition: 'lessThan', value: '', min: '', max: '', reset: '' }
		]
	});

	let subject = $state('temperature_c');
	let fresh = $state<CwAlertPointsValue>(blank());
	const chosen = $derived(readings.find((reading) => reading.value === subject) ?? readings[0]);

	let saved = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{ id: 'criterion-12', name: '', color: '#3987e5', condition: 'greaterThan', value: '30', min: '', max: '', reset: '28' }
		]
	});

	let twoLimits = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{ id: 'criterion-20', name: '', color: '#3987e5', condition: 'lessThan', value: '5', min: '', max: '', reset: '7' },
			{ id: 'criterion-21', name: '', color: '#3987e5', condition: 'greaterThan', value: '35', min: '', max: '', reset: '33' }
		]
	});

	let japanese = $state<CwAlertPointsValue>({
		unit: 'C',
		center: '0',
		points: [
			{ id: 'criterion-30', name: '', color: '#3987e5', condition: 'lessThan', value: '-20', min: '', max: '', reset: '-18' }
		]
	});

	const example = `<script lang="ts">
\timport { CwDropdown, CwRuleCondition, isRuleConditionValid } from '@cropwatchdevelopment/cwui';

\tlet reading = $state('temperature_c');
\tlet condition = $state({
\t\tunit: 'C',
\t\tcenter: '0',
\t\tpoints: [{ id: 'limit-1', name: '', color: '#3987e5', condition: 'lessThan', value: '', min: '', max: '', reset: '' }]
\t});
<\/script>

<CwRuleCondition
\tbind:value={condition}
\treadingName="Temperature"
\thelpHref="https://kb.cropwatch.io/en/software/setting-up-alert-rules#trigger-and-reset"
>
\t{#snippet reading()}
\t\t<CwDropdown label="Reading" options={readings} bind:value={reading} />
\t{/snippet}
</CwRuleCondition>

<!-- A reading that is not a temperature shows its own unit and is stored as typed. -->
<CwRuleCondition bind:value={humidity} readingName="Humidity" temperature={false} unit="%" />

<button disabled={!isRuleConditionValid(condition)}>Save</button>`;
</script>

<h2>CwRuleCondition</h2>
<p class="demo-desc">
	One condition of an alert rule: when a reading should set off the alert, and the reset value it
	has to come back past before the rule can alert again. It says in a sentence what the rule will
	do, draws an example, suggests a reset on the safe side and refuses one on the wrong side.
</p>

<section class="demo-section">
	<h3>A new condition</h3>
	<p class="demo-hint">
		Type an alert value: the reset is filled in. Change the reading to see a unit that is not a
		temperature, where nothing is suggested.
	</p>
	<CwCard>
		<div class="demo-pad">
			<CwRuleCondition
				id="demo-new"
				bind:value={fresh}
				readingName={chosen.label}
				temperature={chosen.value === 'temperature_c'}
				unit={chosen.unit}
				helpHref={resetGuide}
			>
				{#snippet reading()}
					<CwDropdown
						id="demo-new-reading"
						label="Reading"
						options={readings}
						value={subject}
						onchange={(next) => {
							subject = next;
							fresh = blank();
						}}
					/>
				{/snippet}
			</CwRuleCondition>
		</div>
	</CwCard>
	<div class="demo-output">
		<h3>Bound value (valid: {isRuleConditionValid(fresh)})</h3>
		<pre>{JSON.stringify(fresh.points.map(({ condition, value, reset }) => ({ condition, value, reset })))}</pre>
	</div>
	<DemoCodeExample code={example} title="CwRuleCondition example" />
</section>

<section class="demo-section">
	<h3>A saved rule: too hot</h3>
	<CwCard>
		<div class="demo-pad">
			<CwRuleCondition id="demo-saved" bind:value={saved} readingName="Temperature" helpHref={resetGuide} />
		</div>
	</CwCard>
</section>

<section class="demo-section">
	<h3>Two limits on one reading: too cold or too hot</h3>
	<p class="demo-hint">Either limit sends the alert. The rule resets once the reading is past both reset values.</p>
	<CwCard>
		<div class="demo-pad">
			<CwRuleCondition
				id="demo-two"
				bind:value={twoLimits}
				readingName="Temperature"
				helpHref={resetGuide}
			/>
		</div>
	</CwCard>
</section>

<section class="demo-section">
	<h3>Japanese</h3>
	<p class="demo-hint">
		The text is built in: <code>locale="ja"</code> is all it takes. <code>labels</code> overrides any
		string.
	</p>
	<CwCard>
		<div class="demo-pad">
			<CwRuleCondition
				id="demo-ja"
				bind:value={japanese}
				locale="ja"
				readingName="温度"
				helpHref={resetGuideJa}
			/>
		</div>
	</CwCard>
</section>

<style>
	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}

	.demo-pad {
		padding: var(--cw-space-5);
	}

	.demo-output {
		margin-top: var(--cw-space-4);
		padding: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
	}

	.demo-output h3 {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
		margin: 0 0 var(--cw-space-2) 0;
	}

	.demo-output pre {
		margin: 0;
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
</style>
