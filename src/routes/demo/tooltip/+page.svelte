<script lang="ts">
	import { CwTooltip, CwButton } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const tooltipExample = `<CwTooltip value="Tooltip on top" position="top">
\t<CwButton variant="secondary">Top</CwButton>
</CwTooltip>`;
</script>

<h2>CwTooltip</h2>
<p class="demo-desc">
	Short descriptions that appear on hover and on keyboard focus. The bubble is linked to its
	trigger with <code>aria-describedby</code>, stays open while the pointer moves onto it, and
	closes with Escape.
</p>

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
	<DemoCodeExample code={tooltipExample} title="CwTooltip example" />
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
	<h3>Keyboard</h3>
	<p class="demo-hint">
		Tab to a trigger to show its tooltip, then press Escape to hide it without moving focus.
	</p>
	<div class="demo-row">
		<CwTooltip value="Exports the last 24 hours as CSV" position="bottom">
			<CwButton variant="secondary">Export</CwButton>
		</CwTooltip>
		<CwTooltip value="Readings refresh every 5 minutes" position="bottom">
			<CwButton variant="ghost">Refresh</CwButton>
		</CwTooltip>
	</div>
</section>

<section class="demo-section">
	<h3>On inline text</h3>
	<p class="demo-text">
		Hover or focus
		<CwTooltip value="Vapour pressure deficit" tone="primary">
			<button type="button" class="demo-highlight">VPD</button>
		</CwTooltip>
		to see a tooltip on inline content. Use a focusable element so keyboard users can reach it.
	</p>
</section>

<style>
	.demo-text { color: var(--cw-text-secondary); font-size: var(--cw-text-sm); }
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); }
	.demo-highlight {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: var(--cw-accent-text);
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
	}
</style>
