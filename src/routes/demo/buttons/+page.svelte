<script lang="ts">
	import { CwButton } from '$lib/index.js';
	import moreVertIcon from '$lib/icons/more_vert.svg';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const buttonExample = `<CwButton variant="primary">Save Changes</CwButton>`;
	const iconButtonExample = `<script lang="ts">
	import moreVertIcon from '$lib/icons/more_vert.svg';
<\/script>

<CwButton variant="secondary" aria-label="Refresh data">
	<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
		/>
		<path
			d="M11.7 3.2h2.4v2.4"
			stroke="currentColor"
			stroke-width="1.4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</CwButton>

<CwButton variant="primary" aria-label="More actions" icon={moreVertIcon} />
<CwButton variant="primary" icon={moreVertIcon}>More</CwButton>`;
</script>

<h2>CwButton</h2>
<p class="demo-desc">All variant × size × state combinations.</p>

<section class="demo-section">
	<h3>Variants</h3>
	<div class="demo-row">
		<CwButton variant="primary">Primary</CwButton>
		<CwButton variant="secondary">Secondary</CwButton>
		<CwButton variant="ghost">Ghost</CwButton>
		<CwButton variant="danger">Danger</CwButton>
		<CwButton variant="info">Info</CwButton>
	</div>
</section>

<section class="demo-section">
	<h3>Sizes</h3>
	<div class="demo-row">
		<CwButton size="sm">Small</CwButton>
		<CwButton size="md">Medium</CwButton>
		<CwButton size="lg">Large</CwButton>
	</div>
</section>

<section class="demo-section">
	<h3>States</h3>
	<div class="demo-row">
		<CwButton>Default</CwButton>
		<CwButton disabled>Disabled</CwButton>
		<CwButton loading>Loading</CwButton>
		<CwButton fullWidth>Full Width</CwButton>
	</div>
	<DemoCodeExample code={buttonExample} title="CwButton example" />
</section>

<section class="demo-section">
	<h3>Icons</h3>
	<div class="demo-row">
		<CwButton variant="secondary" aria-label="Refresh data">
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
					stroke="currentColor"
					stroke-width="1.4"
					stroke-linecap="round"
				/>
				<path
					d="M11.7 3.2h2.4v2.4"
					stroke="currentColor"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</CwButton>
		<CwButton variant="primary" aria-label="More actions" icon={moreVertIcon} />
		<CwButton variant="primary" icon={moreVertIcon}>More</CwButton>
	</div>
	<DemoCodeExample code={iconButtonExample} title="CwButton icon examples" />
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-bottom: var(--cw-space-6); }
	.demo-row { display: flex; flex-wrap: wrap; gap: var(--cw-space-3); align-items: center; }
</style>
