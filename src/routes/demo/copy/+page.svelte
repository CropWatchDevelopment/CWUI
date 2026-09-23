<script lang="ts">
	import { CwCopy } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const apiKey = 'cw_demo_4f9a2c71e0b8d35a';
	const shortText = 'Hello, CropWatch!';
	const longText = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNyb3BXYXRjaCJ9';
	let copyCount = $state(0);
	const copyExample = `<CwCopy value="cw_demo_4f9a2c71e0b8">
\t<code>cw_demo_4f9a2c71e0b8</code>
</CwCopy>`;
</script>

<h2>CwCopy</h2>
<p class="demo-desc">
	Click-to-copy button with visual feedback and a screen-reader announcement. Pass any string as
	<code>value</code>. If the browser blocks clipboard access the button reports the failure instead of
	pretending it worked (customise the text with <code>labels.failedFeedback</code>).
</p>

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
			<span class="demo-size-label">sm</span>
			<CwCopy value={shortText} size="sm">
				<code class="demo-code">{shortText}</code>
			</CwCopy>
		</div>
		<div class="demo-size-row">
			<span class="demo-size-label">md</span>
			<CwCopy value={shortText} size="md">
				<code class="demo-code">{shortText}</code>
			</CwCopy>
		</div>
		<div class="demo-size-row">
			<span class="demo-size-label">lg</span>
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
	<p class="demo-hint">The <code>onCopy</code> prop fires after a successful copy.</p>
	<CwCopy value="Count me!" onCopy={() => copyCount++}>
		<span>Click to increment counter</span>
	</CwCopy>
	<p class="demo-event" aria-live="polite">Last event: copied {copyCount} {copyCount === 1 ? 'time' : 'times'}</p>
</section>

<style>
	.demo-desc code,
	.demo-hint code {
		padding: 0.1rem 0.35rem;
		border-radius: var(--cw-radius-sm);
		background: var(--cw-bg-muted);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
	}
	.demo-code {
		font-family: var(--cw-font-mono);
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

	.demo-size-label {
		width: 2rem;
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
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
