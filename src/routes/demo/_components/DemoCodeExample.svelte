<script lang="ts">
	import { CwCopy } from '$lib/index.js';

	interface Props {
		code: string;
		title?: string;
		class?: string;
	}

	let {
		code,
		title = 'Copy & paste',
		class: className = ''
	}: Props = $props();
</script>

<div class="demo-code-example {className}">
	<div class="demo-code-example__toolbar">
		<span class="demo-code-example__label">{title}</span>
		<CwCopy value={code} size="sm">
			<span class="demo-code-example__copy-label">Copy code</span>
		</CwCopy>
	</div>
	<pre class="demo-code-example__pre"><code>{code}</code></pre>
</div>

<style>
	.demo-code-example {
		margin-top: var(--cw-space-3);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-md);
		background: var(--cw-bg-elevated);
		overflow: hidden;
	}

	.demo-code-example__toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.demo-code-example__label {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
	}

	.demo-code-example__copy-label {
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-xs);
	}

	.demo-code-example__pre {
		margin: 0;
		padding: var(--cw-space-3);
		font-family: var(--cw-font-mono);
		font-size: var(--cw-text-xs);
		line-height: 1.6;
		color: var(--cw-text-secondary);
		overflow-x: auto;
	}
</style>
