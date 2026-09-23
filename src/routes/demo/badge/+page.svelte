<script lang="ts">
	import { CwBadge } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const badgeExample = `<CwBadge value={7} position="top_right">
\t<button type="button" class="demo-target">Refresh</button>
</CwBadge>

<CwBadge dot tone="success" position="bottom_left">
\t<button type="button" class="demo-target">Live</button>
</CwBadge>

<!-- label gives screen readers context for the number -->
<CwBadge value={5} label="5 unread messages">
\t<button type="button" class="demo-target">Inbox</button>
</CwBadge>`;
</script>

<h2>CwBadge</h2>
<p class="demo-desc">Wrap any content and anchor a badge at top-left, top-right, bottom-left, or bottom-right.</p>

<section class="demo-section">
	<h3>Positions</h3>
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
</section>

<section class="demo-section">
	<h3>Sizes and accessible labels</h3>
	<div class="demo-grid">
		{#each ['sm', 'md', 'lg'] as const as size (size)}
			<div class="demo-card">
				<span class="demo-label">Size {size}</span>
				<CwBadge value={5} {size} tone="info" label="5 unread messages">
					<button type="button" class="demo-target">Inbox</button>
				</CwBadge>
			</div>
		{/each}
		<div class="demo-card">
			<span class="demo-label">Over max (max=99)</span>
			<CwBadge value={140} label="140 pending alerts">
				<button type="button" class="demo-target">Alerts</button>
			</CwBadge>
		</div>
	</div>
	<p class="demo-hint">
		Pass <code>label</code> so screen readers hear "5 unread messages" instead of a bare number.
	</p>
</section>

<DemoCodeExample code={badgeExample} title="CwBadge example" />

<style>
	.demo-card {
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-3);
		padding: var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		min-height: 7.5rem;
	}

	.demo-target {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--cw-space-2) var(--cw-space-4);
		border-radius: var(--cw-control-radius);
		border: 1px solid var(--cw-border-default);
		background: var(--cw-bg-surface);
		color: var(--cw-text-primary);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
	}

	code {
		font-family: var(--cw-font-mono);
	}
</style>
