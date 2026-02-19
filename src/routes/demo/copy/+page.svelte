<script lang="ts">
	import { CwCopy } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const apiKey = 'sk-proj-abc123def456ghi789';
	const shortText = 'Hello, CropWatch!';
	const longText = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNyb3BXYXRjaCJ9';
	let copyCount = $state(0);
	const copyExample = `<CwCopy value="sk-proj-abc123def456">
\t<code>sk-proj-abc123def456</code>
</CwCopy>`;
</script>

<h2>CwCopy</h2>
<p class="demo-desc">Click-to-copy button with animated visual feedback. Pass any string as <code>value</code>.</p>

<section class="demo-section">
	<h3>Basic (icon only)</h3>
	<p class="demo-hint">Just the copy button — hover to see the clipboard icon, click to copy.</p>
	<div class="demo-row">
		<code class="demo-code">{shortText}</code>
		<CwCopy value={shortText} />
	</div>
</section>

<section class="demo-section">
	<h3>With inline content</h3>
	<p class="demo-hint">Pass children to display the value alongside the button.</p>
	<CwCopy value={apiKey}>
		<code class="demo-code">{apiKey}</code>
	</CwCopy>
	<DemoCodeExample code={copyExample} title="CwCopy example" />
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-sizes">
		<div class="demo-size-row">
			<span class="demo-label">sm</span>
			<CwCopy value={shortText} size="sm">
				<code class="demo-code">{shortText}</code>
			</CwCopy>
		</div>
		<div class="demo-size-row">
			<span class="demo-label">md</span>
			<CwCopy value={shortText} size="md">
				<code class="demo-code">{shortText}</code>
			</CwCopy>
		</div>
		<div class="demo-size-row">
			<span class="demo-label">lg</span>
			<CwCopy value={shortText} size="lg">
				<code class="demo-code">{shortText}</code>
			</CwCopy>
		</div>
	</div>
</section>

<section class="demo-section">
	<h3>Long value (truncated display)</h3>
	<div class="demo-truncated">
		<CwCopy value={longText}>
			<code class="demo-code demo-code--truncated">{longText}</code>
		</CwCopy>
	</div>
</section>

<section class="demo-section">
	<h3>onCopy callback</h3>
	<p class="demo-hint">The <code>onCopy</code> prop fires after a successful copy. Counter: <strong>{copyCount}</strong></p>
	<CwCopy value="Count me!" onCopy={() => copyCount++}>
		<span>Click to increment counter</span>
	</CwCopy>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-6); }
	.demo-desc code { background: var(--cw-bg-muted); padding: 0.1rem 0.35rem; border-radius: var(--cw-radius-sm); font-size: var(--cw-text-xs); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-hint code { background: var(--cw-bg-muted); padding: 0.1rem 0.3rem; border-radius: var(--cw-radius-sm); }
	.demo-hint strong { color: var(--cw-accent); }
	.demo-section { margin-bottom: var(--cw-space-8); }

	.demo-row {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.demo-code {
		font-family: monospace;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		background: var(--cw-bg-muted);
		padding: 0.2rem 0.5rem;
		border-radius: var(--cw-radius-sm);
	}

	.demo-sizes {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
	}

	.demo-size-row {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
	}

	.demo-label {
		width: 2rem;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
	}

	.demo-truncated {
		max-width: 22rem;
	}

	.demo-code--truncated {
		display: inline-block;
		max-width: 16rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		vertical-align: middle;
	}
</style>
