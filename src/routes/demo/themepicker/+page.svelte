<script lang="ts">
	import { CwThemePicker } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let lastEvent = $state('none yet');

	const themePickerExample = `<CwThemePicker onchange={(theme) => savePreference(theme)} />`;
</script>

<h2>CwThemePicker</h2>
<p class="demo-desc">
	Menu for switching between dark, light and system themes. It sets <code>data-theme</code> on the
	root element and remembers the choice in <code>localStorage</code>. This site's own picker is in
	the header; the one below controls the same setting.
</p>

<section class="demo-section">
	<h3>In a settings toolbar</h3>
	<div class="demo-toolbar">
		<span class="demo-toolbar__title">Appearance</span>
		<CwThemePicker onchange={(t) => (lastEvent = `theme → ${t}`)} />
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
	<p class="demo-hint">
		Open it with Enter or Space, move with the arrow keys, and press Escape to close and return
		focus to the button.
	</p>
	<DemoCodeExample code={themePickerExample} title="CwThemePicker example" />
</section>

<section class="demo-section">
	<h3>Avoiding a flash of the wrong theme</h3>
	<p class="demo-hint">
		Apply the stored theme before the app renders with a small inline script in
		<code>app.html</code> that reads the <code>cwui-theme</code> key and sets
		<code>data-theme</code> on <code>&lt;html&gt;</code>. This site does the same.
	</p>
</section>

<style>
	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); background: var(--cw-bg-muted); padding: 0.125rem 0.375rem; border-radius: var(--cw-radius-sm); }
	.demo-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		max-width: 24rem;
	}
	.demo-toolbar__title { font-size: var(--cw-text-sm); font-weight: var(--cw-font-semibold); }
</style>
