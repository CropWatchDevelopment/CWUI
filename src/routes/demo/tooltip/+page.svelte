<script lang="ts">
	import { CwTooltip, CwButton } from '$lib/index.js';
</script>

<h2>CwTooltip</h2>
<p class="demo-desc">Hover tooltips with position and tone variants.</p>

<section class="demo-section">
	<h3>Positions</h3>
	<div class="demo-row">
		<CwTooltip value="Tooltip on top" position="top">
			<CwButton variant="secondary">Top</CwButton>
		</CwTooltip>
		<CwTooltip value="Tooltip on bottom" position="bottom">
			<CwButton variant="secondary">Bottom</CwButton>
		</CwTooltip>
		<CwTooltip value="Tooltip on left" position="left">
			<CwButton variant="secondary">Left</CwButton>
		</CwTooltip>
		<CwTooltip value="Tooltip on right" position="right">
			<CwButton variant="secondary">Right</CwButton>
		</CwTooltip>
	</div>
</section>

<section class="demo-section">
	<h3>Tones</h3>
	<div class="demo-row">
		<CwTooltip value="Primary tone" tone="primary">
			<CwButton variant="primary">Primary</CwButton>
		</CwTooltip>
		<CwTooltip value="Secondary tone" tone="secondary">
			<CwButton variant="secondary">Secondary</CwButton>
		</CwTooltip>
		<CwTooltip value="Info tone (default)" tone="info">
			<CwButton variant="info">Info</CwButton>
		</CwTooltip>
		<CwTooltip value="Warning — heads up!" tone="warning">
			<CwButton variant="secondary">Warning</CwButton>
		</CwTooltip>
		<CwTooltip value="Danger — careful!" tone="danger">
			<CwButton variant="danger">Danger</CwButton>
		</CwTooltip>
		<CwTooltip value="Success — all good" tone="success">
			<CwButton variant="primary">Success</CwButton>
		</CwTooltip>
	</div>
</section>

<section class="demo-section">
	<h3>On Inline Text</h3>
	<p class="demo-text">
		Hover over
		<CwTooltip value="I'm a tooltip!" tone="primary">
			<span class="demo-highlight">this word</span>
		</CwTooltip>
		to see a tooltip on inline content.
	</p>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-top: var(--cw-space-6); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-4); align-items: center; }
	.demo-text { color: var(--cw-text-secondary); font-size: var(--cw-text-sm); }
	.demo-highlight {
		color: var(--cw-accent);
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
	}
</style>
