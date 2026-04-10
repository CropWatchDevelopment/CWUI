<script lang="ts">
	import { CwButton, CwCalendarScroll, CwChip, CwSwitch } from '$lib/index.js';
	import type { CwCalendarScrollItem } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	interface DemoTask {
		id: string;
		label: string;
		done?: boolean;
	}

	interface DemoDayData extends CwCalendarScrollItem {
		title: string;
		window: string;
		note: string;
		tasks: DemoTask[];
		status: 'planned' | 'active' | 'complete';
	}

	const startDate = new Date(2026, 2, 1);
	const endDate = new Date(2026, 2, 9);

	const calendarItems: DemoDayData[] = [
		{
			date: '2026-03-01',
			title: 'Propagation zone inspection',
			window: '06:00 - 08:30',
			note: 'Verify mist cadence, record tray temperatures, and confirm the overnight alarm cleared.',
			status: 'active',
			tasks: [
				{ id: 'misters', label: 'Confirm misting intervals' },
				{ id: 'trays', label: 'Spot-check tray temperatures' }
			]
		},
		{
			date: '2026-03-02',
			title: 'Irrigation review',
			window: '09:00 - 11:00',
			note: 'Compare yesterday’s EC swing against the fertigation recipe before the afternoon feed.',
			status: 'planned',
			tasks: [
				{ id: 'ec', label: 'Review EC drift' },
				{ id: 'recipe', label: 'Approve next feed recipe' },
				{ id: 'lineflush', label: 'Flush line 3' }
			]
		},
		{
			date: '2026-03-04',
			title: 'Labor planning',
			window: '13:00 - 15:00',
			note: 'Finalize tomorrow’s canopy work and prep the west house handoff.',
			status: 'planned',
			tasks: [
				{ id: 'crew', label: 'Assign pruning crew' },
				{ id: 'handoff', label: 'Post west-house notes' }
			]
		},
		{
			date: '2026-03-07',
			title: 'Nutrient tank reset',
			window: '07:30 - 09:00',
			note: 'Drain tank B, verify fresh stock, then sign off the mixing checklist.',
			status: 'complete',
			tasks: [
				{ id: 'tank', label: 'Drain tank B', done: true },
				{ id: 'stock', label: 'Verify stock concentrate', done: true }
			]
		},
		{
			date: '2026-03-09',
			title: 'Harvest prep',
			window: '10:30 - 12:00',
			note: 'Stage carts, re-check cooler capacity, and confirm the outbound pickup window.',
			status: 'active',
			tasks: [
				{ id: 'carts', label: 'Stage harvest carts' },
				{ id: 'cooler', label: 'Confirm cooler space' }
			]
		}
	];

	let showAllDates = $state(true);

	function toneFor(status: DemoDayData['status']) {
		switch (status) {
			case 'active':
				return 'info';
			case 'complete':
				return 'success';
			default:
				return 'secondary';
		}
	}

	const basicExample = `<script lang="ts">
\timport { CwCalendarScroll } from '@cropwatchdevelopment/cwui';
\timport type { CwCalendarScrollItem } from '@cropwatchdevelopment/cwui';

\tinterface DayPlan extends CwCalendarScrollItem {
\t\ttitle: string;
\t\tnote: string;
\t}

\tconst plans: DayPlan[] = [
\t\t{ date: '2026-03-01', title: 'Propagation zone inspection', note: 'Check tray temperatures.' },
\t\t{ date: '2026-03-04', title: 'Labor planning', note: 'Finalize tomorrow\\'s canopy work.' }
\t];
<\/script>

<CwCalendarScroll
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
\t\t\t<button type="button">Open day</button>
\t\t{/if}
\t{/snippet}
</CwCalendarScroll>`;

	const filteredExample = `<CwCalendarScroll
\titems={plans}
\tshowAllDates={false}
\tmaxHeight="28rem"
>
\t{#snippet content(item)}
\t\t<h4>{item?.title}</h4>
\t\t<p>{item?.note}</p>
\t{/snippet}
</CwCalendarScroll>`;
</script>

<h2>CwCalendarScroll</h2>
<p class="demo-desc">
	A vertically scrollable date list with a large content region and an optional actions rail.
	Use <code>showAllDates</code> when blank days matter, or turn it off to show only populated dates.
</p>

<section class="demo-section">
	<div class="demo-section__head">
		<div>
			<h3>Scrollable day agenda</h3>
			<p class="demo-hint">
				The list owns its own vertical scroll with <code>overscroll-behavior</code>, so wheel and touch input stay inside the control instead of pulling the page around.
			</p>
		</div>
		<label class="demo-toggle">
			<span>Show all dates</span>
			<CwSwitch bind:checked={showAllDates} />
		</label>
	</div>

	<div class="demo-feature-grid">
		<div class="demo-feature-main">
			<CwCalendarScroll
				items={calendarItems}
				{startDate}
				{endDate}
				{showAllDates}
				maxHeight="min(68dvh, 38rem)"
			>
				{#snippet content(item)}
					{#if item}
						<div class="demo-entry">
							<div class="demo-entry__topline">
								<strong>{item.title}</strong>
								<CwChip
									label={item.status}
									tone={toneFor(item.status)}
									variant="soft"
									size="sm"
								/>
							</div>
							<div class="demo-entry__window">{item.window}</div>
							<p class="demo-entry__note">{item.note}</p>
							<ul class="demo-entry__tasks">
								{#each item.tasks as task (task.id)}
									<li class:demo-entry__task--done={task.done}>
										{task.label}
									</li>
								{/each}
							</ul>
						</div>
					{:else}
						<div class="demo-empty-day">
							<strong>Open day</strong>
							<p>No scheduled work for this date.</p>
						</div>
					{/if}
				{/snippet}

				{#snippet actions(item)}
					{#if item}
						<CwButton variant="secondary" size="sm">
							Open Day
						</CwButton>
						<CwButton variant="ghost" size="sm">
							Notes
						</CwButton>
					{:else}
						<CwButton variant="ghost" size="sm">
							Add Plan
						</CwButton>
					{/if}
				{/snippet}
			</CwCalendarScroll>
		</div>

		<aside class="demo-sidebar" aria-label="Calendar scroll demo summary">
			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Current filter</span>
				<strong>{showAllDates ? 'All dates in range' : 'Only dates with data'}</strong>
				<p>
					When enabled, rows from {startDate.toLocaleDateString()} through
					{endDate.toLocaleDateString()} stay visible even if the item array has no row for a date.
				</p>
			</div>

			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Data model</span>
				<strong>Array of dated items</strong>
				<p>
					Each item carries its own <code>date</code>, preferably as a local string like <code>YYYY-MM-DD</code>.
				</p>
			</div>

			<div class="demo-summary-card">
				<span class="demo-summary-card__eyebrow">Scroll behavior</span>
				<strong>Bounded internal viewport</strong>
				<p>
					Set <code>maxHeight</code> to fit a card, panel, or phone viewport without affecting the page scroll.
				</p>
			</div>
		</aside>
	</div>
</section>

<section class="demo-section">
	<h3>Examples</h3>
	<div class="demo-code-grid">
		<DemoCodeExample
			title="Full range with empty days"
			code={basicExample}
		/>
		<DemoCodeExample
			title="Only populated dates"
			code={filteredExample}
		/>
	</div>
</section>

<style>
	h2 {
		font-size: var(--cw-text-xl);
		font-weight: var(--cw-font-bold);
		margin-bottom: var(--cw-space-2);
	}

	h3 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
		margin: 0 0 var(--cw-space-2);
		color: var(--cw-text-secondary);
	}

	.demo-desc {
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		margin-bottom: var(--cw-space-4);
	}

	.demo-hint {
		margin: 0;
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-section {
		display: grid;
		gap: var(--cw-space-4);
		margin-bottom: var(--cw-space-8);
	}

	.demo-section__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.demo-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-2) var(--cw-space-3);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-surface-elevated);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.demo-feature-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 0.9fr);
		gap: var(--cw-space-5);
		align-items: start;
	}

	.demo-feature-main {
		min-width: 0;
	}

	.demo-sidebar {
		display: grid;
		gap: var(--cw-space-3);
	}

	.demo-summary-card {
		display: grid;
		gap: var(--cw-space-2);
		padding: var(--cw-space-4);
		border-radius: var(--cw-radius-lg);
		background: var(--cw-bg-surface-elevated);
		border: 1px solid var(--cw-border-muted);
	}

	.demo-summary-card__eyebrow {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
	}

	.demo-summary-card strong {
		color: var(--cw-text-primary);
		font-size: var(--cw-text-base);
	}

	.demo-summary-card p {
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-entry {
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-entry__topline {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-3);
	}

	.demo-entry__topline strong {
		font-size: var(--cw-text-base);
		color: var(--cw-text-primary);
	}

	.demo-entry__window {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cw-accent);
	}

	.demo-entry__note,
	.demo-empty-day p {
		font-size: var(--cw-text-sm);
		line-height: 1.65;
		color: var(--cw-text-secondary);
	}

	.demo-entry__tasks {
		list-style: none;
		display: grid;
		gap: var(--cw-space-2);
	}

	.demo-entry__tasks li {
		padding-inline-start: var(--cw-space-4);
		position: relative;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-entry__tasks li::before {
		content: '';
		position: absolute;
		inset-block-start: 0.45rem;
		inset-inline-start: 0;
		inline-size: 0.45rem;
		block-size: 0.45rem;
		border-radius: var(--cw-radius-full);
		background: var(--cw-accent);
	}

	.demo-entry__task--done {
		color: var(--cw-text-muted);
		text-decoration: line-through;
	}

	.demo-entry__task--done::before {
		background: var(--cw-success-500);
	}

	.demo-empty-day {
		display: grid;
		gap: var(--cw-space-2);
		align-content: center;
		min-height: 100%;
	}

	.demo-empty-day strong {
		font-size: var(--cw-text-base);
		color: var(--cw-text-primary);
	}

	.demo-code-grid {
		display: grid;
		gap: var(--cw-space-4);
	}

	@media (min-width: 70rem) {
		.demo-code-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 60rem) {
		.demo-feature-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 42rem) {
		.demo-section__head {
			flex-direction: column;
		}

		.demo-toggle {
			inline-size: 100%;
			justify-content: space-between;
		}

		.demo-entry__topline {
			flex-direction: column;
		}
	}
</style>
