<script lang="ts">
	import DemoCodeExample from './DemoCodeExample.svelte';
	import type { DemoRouteDocs } from './demoPageDocs';

	interface Props {
		docs: DemoRouteDocs;
		class?: string;
	}

	let { docs, class: className = '' }: Props = $props();
</script>

<section class="demo-page-docs {className}" aria-labelledby="demo-page-docs-heading">
	<div class="demo-page-docs__intro">
		<div>
			<span class="demo-page-docs__eyebrow">Documentation Upgrade</span>
			<h3 id="demo-page-docs-heading">Start here</h3>
		</div>
		<p>{docs.summary}</p>
	</div>

	<div class="demo-page-docs__grid">
		<section class="demo-page-docs__card" aria-labelledby="demo-page-docs-steps">
			<h4 id="demo-page-docs-steps">How to think about it</h4>
			<ol class="demo-page-docs__steps">
				{#each docs.steps as step (step.title)}
					<li>
						<strong>{step.title}</strong>
						<span>{step.description}</span>
					</li>
				{/each}
			</ol>
		</section>

		<section class="demo-page-docs__card" aria-labelledby="demo-page-docs-api">
			<div class="demo-page-docs__card-head">
				<h4 id="demo-page-docs-api">{docs.apiTitle ?? 'Props and callbacks'}</h4>
				{#if docs.apiNote}
					<p>{docs.apiNote}</p>
				{/if}
			</div>

			<div class="demo-page-docs__table-wrap">
				<table class="demo-page-docs__table">
					<thead>
						<tr>
							<th scope="col">API</th>
							<th scope="col">Type</th>
							<th scope="col">Details</th>
						</tr>
					</thead>
					<tbody>
						{#each docs.apiRows as row (row.name)}
							<tr>
								<td>
									<div class="demo-page-docs__api-name">
										<code>{row.name}</code>
										{#if row.required}
											<span>Required</span>
										{/if}
									</div>
									{#if row.defaultValue}
										<p>Default: <code>{row.defaultValue}</code></p>
									{/if}
								</td>
								<td><code>{row.type}</code></td>
								<td>{row.description}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	</div>

	{#if docs.examples.length > 0}
		<section class="demo-page-docs__examples" aria-labelledby="demo-page-docs-examples">
			<div class="demo-page-docs__examples-head">
				<h4 id="demo-page-docs-examples">Copy-paste examples</h4>
				<p>These snippets intentionally show the full public API surface the live demo relies on.</p>
			</div>

			<div class="demo-page-docs__example-list">
				{#each docs.examples as example (example.title)}
					<article class="demo-page-docs__example">
						<div class="demo-page-docs__example-copy">
							<h5>{example.title}</h5>
							{#if example.description}
								<p>{example.description}</p>
							{/if}
						</div>
						<DemoCodeExample code={example.code} title={example.title} />
					</article>
				{/each}
			</div>
		</section>
	{/if}
</section>

<style>
	.demo-page-docs {
		display: grid;
		gap: var(--cw-space-5);
		margin-top: var(--cw-space-8);
		padding-top: var(--cw-space-6);
		border-top: 1px solid color-mix(in srgb, var(--cw-border-default) 72%, transparent);
	}

	.demo-page-docs__intro {
		display: grid;
		gap: var(--cw-space-2);
		max-width: 70ch;
	}

	.demo-page-docs__eyebrow {
		display: inline-flex;
		align-items: center;
		width: fit-content;
		padding: 0.2rem 0.55rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-accent) 14%, var(--cw-bg-muted));
		color: var(--cw-accent);
		font-size: 0.7rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-page-docs__intro h3,
	.demo-page-docs__card h4,
	.demo-page-docs__examples-head h4,
	.demo-page-docs__example-copy h5 {
		margin: 0;
		color: var(--cw-text-primary);
	}

	.demo-page-docs__intro h3 {
		font-size: clamp(1.2rem, 2vw, 1.5rem);
		font-weight: var(--cw-font-semibold);
	}

	.demo-page-docs__intro p,
	.demo-page-docs__card-head p,
	.demo-page-docs__example-copy p,
	.demo-page-docs__examples-head p {
		margin: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.65;
	}

	.demo-page-docs__grid {
		display: grid;
		gap: var(--cw-space-4);
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		align-items: start;
	}

	.demo-page-docs__card,
	.demo-page-docs__example {
		display: grid;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		border: 1px solid color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		border-radius: var(--cw-radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-elevated) 92%, white),
				color-mix(in srgb, var(--cw-bg-muted) 54%, white)
			);
		box-shadow: var(--cw-shadow-sm);
	}

	.demo-page-docs__steps {
		margin: 0;
		padding-left: 1.1rem;
		display: grid;
		gap: var(--cw-space-3);
	}

	.demo-page-docs__steps li {
		display: grid;
		gap: 0.25rem;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
	}

	.demo-page-docs__steps strong {
		color: var(--cw-text-primary);
		font-weight: var(--cw-font-semibold);
	}

	.demo-page-docs__card-head {
		display: grid;
		gap: 0.35rem;
	}

	.demo-page-docs__table-wrap {
		overflow-x: auto;
	}

	.demo-page-docs__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--cw-text-sm);
		min-width: 38rem;
	}

	.demo-page-docs__table th,
	.demo-page-docs__table td {
		padding: 0.8rem 0.75rem;
		border-bottom: 1px solid color-mix(in srgb, var(--cw-border-default) 74%, transparent);
		text-align: left;
		vertical-align: top;
	}

	.demo-page-docs__table th {
		color: var(--cw-text-muted);
		font-size: 0.72rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.demo-page-docs__table td {
		color: var(--cw-text-secondary);
		line-height: 1.55;
	}

	.demo-page-docs__table code,
	.demo-page-docs__api-name code {
		font-family: var(--cw-font-mono);
		font-size: 0.78rem;
		color: var(--cw-text-primary);
	}

	.demo-page-docs__api-name {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.demo-page-docs__api-name span {
		display: inline-flex;
		align-items: center;
		padding: 0.15rem 0.45rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(in srgb, var(--cw-warning-500) 18%, transparent);
		color: var(--cw-warning-500);
		font-size: 0.68rem;
		font-weight: var(--cw-font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.demo-page-docs__table p {
		margin: 0.35rem 0 0;
		color: var(--cw-text-muted);
		font-size: 0.78rem;
	}

	.demo-page-docs__examples {
		display: grid;
		gap: var(--cw-space-4);
	}

	.demo-page-docs__examples-head {
		display: grid;
		gap: 0.35rem;
	}

	.demo-page-docs__example-list {
		display: grid;
		gap: var(--cw-space-4);
	}

	.demo-page-docs__example-copy {
		display: grid;
		gap: 0.35rem;
	}

	.demo-page-docs__example-copy h5 {
		font-size: var(--cw-text-base);
		font-weight: var(--cw-font-semibold);
	}

	@media (max-width: 768px) {
		.demo-page-docs {
			margin-top: var(--cw-space-6);
			padding-top: var(--cw-space-5);
		}

		.demo-page-docs__table {
			min-width: 30rem;
		}
	}
</style>
