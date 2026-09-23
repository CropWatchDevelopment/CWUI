<script lang="ts">
	import DemoCodeExample from './_components/DemoCodeExample.svelte';
	import { getDemoNavGroups } from './_components/demoNav';

	const navGroups = getDemoNavGroups();
	const componentCount = navGroups.reduce((total, group) => total + group.items.length, 0);

	const npmrcSnippet = `@cropwatchdevelopment:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`;

	const installSnippet = 'pnpm add @cropwatchdevelopment/cwui';

	const layoutSnippet = `<script lang="ts">
	import '@cropwatchdevelopment/cwui/styles';

	let { children } = $props();
</${'script'}>

{@render children()}`;

	const themeSnippet = `<!-- app.html: dark is the default; set "light" to switch -->
<html lang="en" data-theme="dark">`;

	const upgradeSnippet = `rm -rf node_modules .svelte-kit
pnpm install
pnpm up @cropwatchdevelopment/cwui --latest`;
</script>

<section class="home-intro" aria-labelledby="home-title">
	<p class="home-intro__eyebrow">Svelte 5 component library</p>
	<h2 id="home-title">CropWatch UI</h2>
	<p class="demo-desc">
		The shared interface kit behind CropWatch: {componentCount} accessible components, charts and
		helpers built on plain CSS custom properties, with matching dark and light themes. Browse the
		components below or from the sidebar. Every page has live examples, the full API and
		copy-paste snippets.
	</p>
	<ul class="home-intro__links">
		<li>
			<a href="https://github.com/CropWatchDevelopment/CWUI" target="_blank" rel="noopener noreferrer">
				Source on GitHub
			</a>
		</li>
		<li>
			<a href="/llms.txt" target="_blank" rel="noopener noreferrer">
				LLM docs (<code>/llms.txt</code>)
			</a>
		</li>
	</ul>
</section>

<section class="home-guide" aria-labelledby="home-guide-title">
	<div class="home-guide__body">
		<p class="home-intro__eyebrow">For designers</p>
		<h3 id="home-guide-title" class="home-guide__title">Design style guide</h3>
		<p class="home-guide__text">
			Colour tokens for dark and light mode with measured contrast ratios, the logo and brand
			colours, typography, spacing, chart colours, form anatomy and a hand-off checklist. Start here
			before designing a CropWatch screen.
		</p>
	</div>
	<a
		class="home-guide__download"
		href="/cropwatch-style-guide.pdf"
		download="CropWatch-Style-Guide.pdf"
	>
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M8 2v8m0 0L5 7m3 3l3-3M3 12.5h10"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		Download PDF
	</a>
</section>

<section class="demo-section" aria-labelledby="home-components">
	<h3 id="home-components">Components</h3>
	<div class="home-groups">
		{#each navGroups as group (group.group)}
			<div class="home-group">
				<h4 class="home-group__title">{group.group}</h4>
				<ul class="home-group__list">
					{#each group.items as item (item.id)}
						<li>
							<a class="home-group__link" href={item.href}>
								{#if typeof item.icon === 'string'}
									<svg
										class="home-group__icon"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										stroke-width="1.25"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d={item.icon} />
									</svg>
								{/if}
								<span>{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<section class="demo-section" aria-labelledby="home-install">
	<h3 id="home-install">Getting started</h3>
	<ol class="home-steps">
		<li>
			<strong>Point the scope at GitHub Packages.</strong>
			<span>Add this to your project's <code>.npmrc</code>, with a token that has <code>read:packages</code>.</span>
			<DemoCodeExample title=".npmrc" code={npmrcSnippet} />
		</li>
		<li>
			<strong>Install the package.</strong>
			<DemoCodeExample title="Terminal" code={installSnippet} />
		</li>
		<li>
			<strong>Load the styles once in your root layout.</strong>
			<span>This single import brings in the design tokens and both themes.</span>
			<DemoCodeExample title="src/routes/+layout.svelte" code={layoutSnippet} />
		</li>
		<li>
			<strong>Choose a theme.</strong>
			<span>
				Themes switch with the <code>data-theme</code> attribute on <code>&lt;html&gt;</code>, or use
				<a href="/demo/themepicker">CwThemePicker</a> to let people choose.
			</span>
			<DemoCodeExample title="src/app.html" code={themeSnippet} />
		</li>
	</ol>
</section>

<section class="demo-section" aria-labelledby="home-upgrade">
	<h3 id="home-upgrade">Upgrading an existing install</h3>
	<p class="demo-hint">Clear local build artifacts first so SvelteKit picks up the new components.</p>
	<DemoCodeExample title="Terminal" code={upgradeSnippet} />
</section>

<style>
	.home-intro {
		margin-bottom: var(--cw-space-8);
	}

	.home-intro__eyebrow {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cw-accent-text);
		margin-bottom: var(--cw-space-1);
	}

	.home-intro h2 {
		font-size: var(--cw-text-3xl);
		font-weight: var(--cw-font-bold);
		line-height: var(--cw-leading-tight);
		margin-bottom: var(--cw-space-3);
	}

	.home-intro__links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2) var(--cw-space-6);
		list-style: none;
		font-size: var(--cw-text-sm);
	}

	a {
		color: var(--cw-accent-text);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}

	.home-guide {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-4) var(--cw-space-6);
		margin-bottom: var(--cw-space-8);
		padding: var(--cw-space-5);
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-inline-start: 4px solid var(--cw-brand-green);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
	}

	.home-guide__body {
		flex: 1 1 22rem;
		min-width: 0;
	}

	.home-guide__title {
		margin-bottom: var(--cw-space-1);
	}

	.home-guide__text {
		max-width: 60ch;
		color: var(--cw-text-muted);
		font-size: var(--cw-text-sm);
	}

	.home-guide__download {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-height: var(--cw-control-h-md);
		padding-inline: var(--cw-control-px-lg);
		border: 1px solid var(--cw-button-primary-border);
		border-radius: var(--cw-control-radius);
		background: var(--cw-button-primary-bg);
		box-shadow: var(--cw-button-primary-shadow);
		color: var(--cw-button-primary-text);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		text-decoration: none;
		white-space: nowrap;
	}

	.home-guide__download:hover {
		border-color: var(--cw-button-primary-border-hover);
		background: var(--cw-button-primary-bg-hover);
	}

	.home-guide__download svg {
		width: 1rem;
		height: 1rem;
	}

	.home-groups {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));
		gap: var(--cw-space-4);
	}

	.home-group {
		padding: var(--cw-space-4);
		background: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-card-radius);
		box-shadow: var(--cw-shadow-sm);
	}

	.home-group__title {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		margin-bottom: var(--cw-space-2);
	}

	.home-group__list {
		list-style: none;
		display: grid;
		gap: var(--cw-space-1);
	}

	.home-group__link {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		min-height: 2rem;
		padding-inline: var(--cw-space-2);
		margin-inline: calc(var(--cw-space-2) * -1);
		border-radius: var(--cw-radius-md);
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		text-decoration: none;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.home-group__link:hover {
		background: var(--cw-option-hover-bg);
	}

	.home-group__icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-text-muted);
	}

	.home-steps {
		display: grid;
		gap: var(--cw-space-6);
		padding-inline-start: var(--cw-space-5);
		max-width: 60rem;
	}

	.home-steps li {
		display: grid;
		gap: var(--cw-space-1);
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.home-steps strong {
		color: var(--cw-text-primary);
		font-weight: var(--cw-font-semibold);
	}
</style>
