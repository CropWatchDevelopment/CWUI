<script lang="ts">
	import { CwCard, CwHelp, CwInput } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const resetGuide = 'https://kb.cropwatch.io/en/software/setting-up-alert-rules#trigger-and-reset';
	const sizes = ['sm', 'md', 'lg'] as const;

	let reset = $state('7');

	const helpExample = `<!-- Wrap the thing it explains: the mark sits at its top right. -->
<CwHelp
\tlabel="Why a reset is needed"
\thref="https://kb.cropwatch.io/en/software/setting-up-alert-rules#trigger-and-reset"
>
\t<label for="reset">Reset value</label>
</CwHelp>`;

	const aloneExample = `<!-- Or let it follow any text, raised like a footnote number. -->
<p>The rule resets quietly<CwHelp label="Why a reset is needed" href={guideUrl} />.</p>`;

	const translatedExample = `<CwHelp
\tlabel="リセットが必要な理由"
\thref={guideUrl}
\tlabels={{ help: 'ヘルプ', newTab: '新しいタブで開きます' }}
>
\tリセット値
</CwHelp>`;
</script>

<h2>CwHelp</h2>
<p class="demo-desc">
	A small raised question mark at the top right of the thing it explains. One click opens the page
	that explains it in a new tab, so a half-filled form is not lost. Give the address its
	<code>#section</code> and the browser scrolls straight to that part of the article.
</p>

<section class="demo-section">
	<h3>At the top right of a label</h3>
	<div class="demo-field">
		<CwHelp label="Why a reset is needed" href={resetGuide}>
			<label class="demo-label" for="demo-help-reset">Reset value</label>
		</CwHelp>
		<CwInput id="demo-help-reset" bind:value={reset} />
	</div>
	<p class="demo-hint">
		Hover or focus it for the tooltip. Enter or a click opens the guide at "Trigger value and reset
		value".
	</p>
	<DemoCodeExample code={helpExample} title="CwHelp example" />
</section>

<section class="demo-section">
	<h3>Following text</h3>
	<p class="demo-text">
		The rule resets quietly<CwHelp label="Why a reset is needed" href={resetGuide} />. No message
		is sent when it does.
	</p>
	<DemoCodeExample code={aloneExample} title="Without children" />
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row demo-row--sizes">
		{#each sizes as size (size)}
			<span class="demo-size">
				<CwHelp {size} label="Why a reset is needed" href={resetGuide}>
					<span class="demo-size__text demo-size__text--{size}">Reset value</span>
				</CwHelp>
				<code>{size}</code>
			</span>
		{/each}
	</div>
	<p class="demo-hint">
		12, 14 and 16 px. The area that takes a tap is 32 px at every size.
	</p>
</section>

<section class="demo-section">
	<h3>On a card title, and translated</h3>
	<div class="demo-grid">
		<CwCard>
			{#snippet header()}
				<CwHelp size="lg" label="How alert rules work" href={resetGuide}>
					<h4 class="demo-card-title">Alert rules</h4>
				</CwHelp>
			{/snippet}
			<p class="demo-text">Any element can be the thing that is explained.</p>
		</CwCard>
		<div class="demo-field">
			<CwHelp
				label="リセットが必要な理由"
				href={resetGuide}
				tooltipPosition="bottom"
				labels={{ help: 'ヘルプ', newTab: '新しいタブで開きます' }}
			>
				<span class="demo-label">リセット値</span>
			</CwHelp>
		</div>
	</div>
	<DemoCodeExample code={translatedExample} title="Translated text" />
</section>

<style>
	code {
		font-family: var(--cw-font-mono);
		font-size: 0.9em;
	}

	.demo-field {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--cw-space-2);
		max-width: 20rem;
	}

	.demo-field :global(.cw-input) {
		width: 100%;
	}

	.demo-label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.demo-text {
		margin: 0;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
	}

	.demo-row--sizes {
		align-items: flex-end;
		gap: var(--cw-space-8);
	}

	.demo-size {
		display: inline-flex;
		flex-direction: column;
		gap: var(--cw-space-2);
	}

	.demo-size__text {
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.demo-size__text--sm {
		font-size: var(--cw-text-xs);
	}

	.demo-size__text--md {
		font-size: var(--cw-text-sm);
	}

	.demo-size__text--lg {
		font-size: var(--cw-text-lg);
	}

	.demo-card-title {
		margin: 0;
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}
</style>
