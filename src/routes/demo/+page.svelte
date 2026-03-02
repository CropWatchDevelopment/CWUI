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

	.demo-copy {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		margin: 0 0 var(--cw-space-2);
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
</style>
