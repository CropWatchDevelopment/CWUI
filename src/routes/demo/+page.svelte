<script lang="ts">
	import WORKER_IMAGE from '$lib/images/office-work.webp';

	const publishWorkflowUrl =
		'https://github.com/CropWatchDevelopment/CWUI/actions/workflows/publish.yml';

	const releaseSteps = [
		{
			step: '01',
			title: 'Confirm the release version',
			body: 'Bump package.json, then make sure the release commit on main is the exact code you want to publish.'
		},
		{
			step: '02',
			title: 'Push the release commit',
			body: 'If your version bump is only local, push main first so the tag points at a commit GitHub Actions can build.',
			code: 'git push origin main'
		},
		{
			step: '03',
			title: 'Create the matching tag',
			body: 'The publish workflow only runs for tags shaped like v<version>. The tag must match package.json exactly.',
			code: 'git tag v<your-version>'
		},
		{
			step: '04',
			title: 'Push the tag to publish',
			body: 'Pushing the tag triggers the GitHub Packages release workflow.',
			code: 'git push origin v<your-version>'
		},
		{
			step: '05',
			title: 'Watch the workflow finish',
			body: 'Open the publish workflow in GitHub Actions and wait for the package job to complete before announcing the release.'
		}
	];
</script>
<img src={WORKER_IMAGE} alt="CWUI In development Header" style="width: 100%;" />

<h2>CropWatch UI Demo</h2>
<p class="demo-desc">Select a component from the sidebar to view demos, API behavior, and copy-paste examples.</p>
<p class="demo-links">
	<a href="/llms.txt" target="_blank" rel="noopener noreferrer">LLM Docs: <code>/llms.txt</code></a>
</p>

<section class="demo-section">
	<h3>Update Existing Install</h3>
	<p class="demo-copy">
		If you already use <code>@cropwatchdevelopment/cwui</code>, clear local build artifacts first, then upgrade:
	</p>
	<pre class="demo-code"><code>rm -rf node_modules .svelte-kit
pnpm install
pnpm up @cropwatchdevelopment/cwui --latest</code></pre>
</section>

<section class="demo-section">
	<h3>Getting Started (Not Installed Yet)</h3>
	<p class="demo-copy">Install the package in your SvelteKit project:</p>
	<pre class="demo-code"><code>pnpm add @cropwatchdevelopment/cwui</code></pre>

	<p class="demo-copy">Load the base styles and a theme once (typically in your root layout):</p>
	<pre class="demo-code"><code>&lt;script lang="ts"&gt;
	import '@cropwatchdevelopment/cwui/styles';
	import '@cropwatchdevelopment/cwui/styles/tokens';
	import '@cropwatchdevelopment/cwui/styles/theme-light';
&lt;/script&gt;

&lt;slot /&gt;</code></pre>
</section>

<section class="demo-section">
	<h3>Verify</h3>
	<p class="demo-copy">Start your app and open this demo route to validate everything is wired correctly:</p>
	<pre class="demo-code"><code>pnpm dev</code></pre>
</section>

<section class="demo-section release-section">
	<p class="demo-kicker">Maintainer Workflow</p>
	<h3>Publish A New Package</h3>
	<p class="demo-copy">
		CWUI publishes through GitHub Packages at <code>npm.pkg.github.com</code>. After bumping the
		version, release by pushing a matching Git tag.
	</p>

	<ol class="release-steps">
		{#each releaseSteps as releaseStep (releaseStep.step)}
			<li class="release-step">
				<div class="release-step-number" aria-hidden="true">{releaseStep.step}</div>
				<div class="release-step-body">
					<h4>{releaseStep.title}</h4>
					<p>{releaseStep.body}</p>
					{#if releaseStep.code}
						<pre class="demo-code"><code>{releaseStep.code}</code></pre>
					{/if}
				</div>
			</li>
		{/each}
	</ol>

	<p class="demo-copy demo-note">
		The workflow checks whether the tagged version already exists. If that version is already in
		the registry, the publish step is skipped instead of failing.
	</p>
	<p class="demo-links">
		<a href={publishWorkflowUrl} target="_blank" rel="noopener noreferrer">
			Open the publish workflow in GitHub Actions
		</a>
	</p>
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
		margin-bottom: var(--cw-space-5);
	}

	.demo-links {
		margin: 0 0 var(--cw-space-5);
		font-size: var(--cw-text-sm);
	}

	.demo-links a {
		color: var(--cw-primary-400);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.demo-links a:hover {
		color: var(--cw-primary-300);
	}

	.demo-section {
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		padding: var(--cw-space-4);
		margin-bottom: var(--cw-space-4);
	}

	.release-section {
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-primary-500) 10%, var(--cw-bg-elevated)) 0%,
				var(--cw-bg-elevated) 100%
			);
	}

	.demo-kicker {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--cw-primary-300);
	}

	.demo-copy {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		margin: 0 0 var(--cw-space-2);
	}

	.demo-note {
		margin-top: var(--cw-space-4);
	}

	.demo-code {
		margin: 0;
		padding: var(--cw-space-3);
		border-radius: var(--cw-radius-sm);
		background: color-mix(in srgb, var(--cw-bg-base) 80%, black);
		border: 1px solid var(--cw-border-muted);
		overflow-x: auto;
	}

	.demo-code code {
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		color: var(--cw-text-primary);
		line-height: 1.6;
	}

	.release-steps {
		list-style: none;
		padding: 0;
		margin: var(--cw-space-4) 0 0;
		display: grid;
		gap: var(--cw-space-4);
	}

	.release-step {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--cw-space-3);
		align-items: start;
	}

	.release-step-number {
		min-width: 3rem;
		padding: var(--cw-space-2) var(--cw-space-3);
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--cw-primary-400) 30%, transparent);
		background: color-mix(in srgb, var(--cw-primary-500) 12%, transparent);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		text-align: center;
		color: var(--cw-primary-200);
	}

	.release-step-body h4 {
		margin: 0 0 var(--cw-space-1);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.release-step-body p {
		margin: 0 0 var(--cw-space-2);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	@media (max-width: 640px) {
		.release-step {
			grid-template-columns: 1fr;
		}

		.release-step-number {
			width: fit-content;
		}
	}
</style>
