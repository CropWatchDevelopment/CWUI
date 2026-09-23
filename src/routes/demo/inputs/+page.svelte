<script lang="ts">
	import { CwInput } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	let textVal = $state('');
	let numVal = $state('');
	let emailVal = $state('');
	let passVal = $state('');
	let colorVal = $state('#2f8f5b');
	let euiVal = $state('');
	let ccVal = $state('');
	let expVal = $state('');
	let limitVal = $state('');
	let clearVal = $state('Type something then clear');
	let requiredVal = $state('');
	const inputExample = `<CwInput
\tlabel="Email"
\ttype="email"
\tplaceholder="user@example.com"
\tbind:value={email}
\tclearable
/>`;
</script>

<h2>CwInput</h2>
<p class="demo-desc">All input types, validation states, icon slots, clear button, numeric stepping with arrow-key support, native color picking, and DevEUI/credit-card formatting.</p>

<section class="demo-section">
	<h3>Input types</h3>
<div class="demo-grid">
	<CwInput label="Text" type="text" placeholder="Type here…" bind:value={textVal} />
	<CwInput label="Numeric" type="numeric" placeholder="Use arrows or the stepper" bind:value={numVal} />
	<CwInput label="Email" type="email" placeholder="user@example.com" bind:value={emailVal} />
	<CwInput label="Password" type="password" placeholder="••••••••" bind:value={passVal} />
	<CwInput label="Accent Color" type="color" bind:value={colorVal} />
	<CwInput label="DevEUI" type="devEui" placeholder="XX:XX:XX:XX:XX:XX:XX:XX" bind:value={euiVal} />
</div>
</section>

<DemoCodeExample code={inputExample} title="CwInput example" />

<section class="demo-section">
	<h3>Sizes</h3>
	<p class="demo-hint">
		<code>size</code> uses the shared control heights (32 / 40 / 48px), so inputs line up with buttons,
		dropdowns and other controls of the same size.
	</p>
	<div class="demo-grid">
		<CwInput label="Small" size="sm" placeholder="size=&quot;sm&quot;" />
		<CwInput label="Medium (default)" size="md" placeholder="size=&quot;md&quot;" />
		<CwInput label="Large" size="lg" placeholder="size=&quot;lg&quot;" />
	</div>
</section>

<section class="demo-section">
	<h3>Hint, required &amp; read-only</h3>
	<p class="demo-hint">
		<code>hint</code> and <code>error</code> share the slot under the field and are linked with
		<code>aria-describedby</code>. <code>required</code> adds a visual marker and
		<code>aria-required</code>.
	</p>
	<div class="demo-grid">
		<CwInput
			label="Gateway name"
			hint="Shown on the dashboard and in alerts."
			placeholder="North field gateway"
			required
			bind:value={requiredVal}
			error={requiredVal.length > 0 && requiredVal.length < 3 ? 'Use at least 3 characters' : undefined}
		/>
		<CwInput label="Device ID" value="a84041000181c61f" readonly hint="Assigned automatically." />
		<CwInput
			label="Custom labels"
			type="password"
			value="secret"
			labels={{ showPassword: 'Reveal', hidePassword: 'Conceal' }}
			hint="Button labels are overridable for localisation."
		/>
	</div>
</section>

<section class="demo-section">
	<h3>Credit Card Types</h3>
	<div class="demo-grid">
		<CwInput label="Card Number" type="creditCard" placeholder="1234 5678 9012 3456" bind:value={ccVal} clearable />
		<CwInput label="Expiry (MM/YY)" type="cardExpiry" placeholder="MM/YY" bind:value={expVal} />
	</div>
</section>

<section class="demo-section">
	<h3>Max Length &amp; Clear Button</h3>
	<p class="demo-hint">The clear button appears when <code>clearable</code> is set and the input has a value.</p>
	<div class="demo-grid">
		<CwInput label="Max 10 chars" type="text" placeholder="Limited to 10" maxlength={10} bind:value={limitVal} clearable />
		<CwInput label="Clearable" type="text" bind:value={clearVal} clearable />
	</div>
</section>

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
				<svg viewBox="0 0 16 16" fill="none" class="demo-input-icon" aria-hidden="true">
					<path d="M7 3a4 4 0 110 8 4 4 0 010-8zm4.5 7.5L14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			{/snippet}
		</CwInput>
		<CwInput label="Left icon + valid" type="text" value="All good" valid>
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" fill="none" class="demo-input-icon" aria-hidden="true">
					<path d="M8 2a6 6 0 110 12A6 6 0 018 2z" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			{/snippet}
		</CwInput>
		<CwInput label="Left icon + error" type="text" value="Oops" error="Invalid entry">
			{#snippet leftSlot()}
				<svg viewBox="0 0 16 16" fill="none" class="demo-input-icon" aria-hidden="true">
					<path d="M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
				</svg>
			{/snippet}
		</CwInput>
	</div>
</section>

<style>
	.demo-input-icon {
		width: 1rem;
		height: 1rem;
	}

	code { font-family: var(--cw-font-mono); font-size: var(--cw-text-xs); color: var(--cw-accent-text); }
</style>
