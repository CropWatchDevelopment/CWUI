<script lang="ts">
	import { CwInput } from '$lib/index.js';

	let textVal = $state('');
	let numVal = $state('');
	let emailVal = $state('');
	let passVal = $state('');
	let euiVal = $state('');
</script>

<h2>CwInput</h2>
<p class="demo-desc">All input types, validation states, icon slots, and DevEUI formatting.</p>

<div class="demo-grid">
	<CwInput label="Text" type="text" placeholder="Type here…" bind:value={textVal} />
	<CwInput label="Numeric" type="numeric" placeholder="Numbers only" bind:value={numVal} />
	<CwInput label="Email" type="email" placeholder="user@example.com" bind:value={emailVal} />
	<CwInput label="Password" type="password" placeholder="••••••••" bind:value={passVal} />
	<CwInput label="DevEUI" type="devEui" placeholder="XX:XX:XX:XX:XX:XX:XX:XX" bind:value={euiVal} />
</div>

<section class="demo-section">
	<h3>Validation States</h3>
	<p class="demo-hint">Validation icons auto-render on the right side.</p>
	<div class="demo-grid">
		<CwInput label="Valid" type="text" value="Looks good" valid />
		<CwInput label="Error" type="text" value="Bad value" error="This field is required" />
		<CwInput label="Disabled" type="text" value="Cannot edit" disabled />
	</div>
</section>

<section class="demo-section">
	<h3>With Icon Slots</h3>
	<div class="demo-grid">
		<CwInput label="Left icon" type="text" placeholder="Search…" bind:value={textVal}>
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" fill="none" style="width:1rem;height:1rem">
					<path d="M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			{/snippet}
		</CwInput>
		<CwInput label="Left icon + valid" type="text" value="All good" valid>
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" fill="none" style="width:1rem;height:1rem">
					<path d="M8 2a6 6 0 110 12A6 6 0 018 2z" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			{/snippet}
		</CwInput>
		<CwInput label="Left icon + error" type="text" value="Oops" error="Invalid entry">
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" fill="none" style="width:1rem;height:1rem">
					<path d="M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			{/snippet}
		</CwInput>
	</div>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-hint { color: var(--cw-text-muted); font-size: var(--cw-text-xs); margin-bottom: var(--cw-space-2); }
	.demo-section { margin-top: var(--cw-space-6); }
	.demo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: var(--cw-space-4); }
</style>
