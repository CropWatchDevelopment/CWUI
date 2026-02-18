<script lang="ts">
	import { CwThemePicker } from '$lib/index.js';
</script>

<h2>CwThemePicker</h2>
<p class="demo-desc">Toggle between dark, light, and system themes. Applies <code>data-theme</code> on the root element.</p>

<section class="demo-section">
	<h3>Default (starts dark)</h3>
	<div class="demo-row">
		<CwThemePicker />
	</div>
</section>

<section class="demo-section">
	<h3>Inline with toolbar</h3>
	<div class="demo-toolbar">
		<span class="demo-toolbar__title">Settings</span>
		<CwThemePicker onchange={(t) => console.log('Theme:', t)} />
	</div>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-bottom: var(--cw-space-6); }
	.demo-row { display: flex; gap: var(--cw-space-3); align-items: center; }
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); background: var(--cw-bg-muted); padding: 0.125rem 0.375rem; border-radius: var(--cw-radius-sm); }
	.demo-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--cw-space-3) var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		max-width: 24rem;
	}
	.demo-toolbar__title { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); }
</style>
