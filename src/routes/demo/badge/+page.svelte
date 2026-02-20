<script lang="ts">
	import { CwBadge } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const badgeExample = `<CwBadge value={7} position="top_right">
\t<button type="button" class="demo-target">Refresh</button>
</CwBadge>

<CwBadge dot tone="success" position="bottom_left">
\t<button type="button" class="demo-target">Live</button>
</CwBadge>`;
</script>

<h2>CwBadge</h2>
<p class="demo-desc">Wrap any content and anchor a badge at top-left, top-right, bottom-left, or bottom-right.</p>

<div class="demo-grid">
	<div class="demo-card">
		<span class="demo-label">Top right</span>
		<CwBadge value={7} position="top_right">
			<button type="button" class="demo-target">Refresh</button>
		</CwBadge>
	</div>

	<div class="demo-card">
		<span class="demo-label">Top left</span>
		<CwBadge value={12} position="top_left" tone="info">
			<button type="button" class="demo-target">Messages</button>
		</CwBadge>
	</div>

	<div class="demo-card">
		<span class="demo-label">Bottom right</span>
		<CwBadge value={3} position="bottom_right" tone="warning">
			<button type="button" class="demo-target">Queue</button>
		</CwBadge>
	</div>

	<div class="demo-card">
		<span class="demo-label">Bottom left (dot)</span>
		<CwBadge dot tone="success" position="bottom_left">
			<button type="button" class="demo-target">Live</button>
		</CwBadge>
	</div>
</div>

<DemoCodeExample code={badgeExample} title="CwBadge example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--cw-space-4); margin-bottom: var(--cw-space-4); }
	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		min-height: 7.5rem;
	}
	.demo-label { font-size: var(--cw-text-xs); color: var(--cw-text-muted); }
	.demo-target {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-2) var(--cw-space-4);
		border-radius: var(--cw-radius-xl);
		border: 1px solid #40567a;
		background: linear-gradient(180deg, #2b3f5f 0%, #1f293e 100%);
		color: #f2f6ff;
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
	}
</style>
