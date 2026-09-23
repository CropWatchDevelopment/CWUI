<script lang="ts">
	import { CwToastContainer, CwButton, createCwToastContext, useCwToast } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	createCwToastContext();
	const toast = useCwToast();

	const tones = ['primary', 'secondary', 'info', 'success', 'warning', 'danger'] as const;
	let burstCount = 0;

	function burst() {
		toast.add({
			tone: 'danger',
			title: 'Sensor offline',
			message: 'CW-AIR-014 has not reported for 2 hours.'
		});
		for (let i = 0; i < 5; i++) {
			burstCount += 1;
			toast.add({ tone: 'info', message: `Reading synced (${burstCount})` });
		}
	}

	const toastExample = `createCwToastContext();
const toast = useCwToast();

<CwToastContainer />
<CwButton onclick={() => toast.add({ tone: 'success', message: 'Saved!' })}>
\tShow toast
</CwButton>`;

	const titledExample = `toast.add({
\ttone: 'danger',
\ttitle: 'Sensor offline',
\tmessage: 'CW-AIR-014 has not reported for 2 hours.'
\t// danger toasts stay until dismissed; pass duration to override
});`;
</script>

<CwToastContainer />

<h2>CwToast</h2>
<p class="demo-desc">
	Toast notifications for short confirmations and alerts. Routine toasts are announced politely
	and dismiss after 6 seconds; warning and danger toasts are announced immediately, and danger
	toasts stay until the user dismisses them. The timer pauses while the pointer or keyboard focus
	is on a toast.
</p>

<section class="demo-section">
	<h3>Tones</h3>
	<div class="demo-row">
		{#each tones as tone (tone)}
			<CwButton
				variant={tone === 'danger' ? 'danger' : tone === 'info' ? 'info' : 'secondary'}
				onclick={() => toast.add({ tone, message: `This is a ${tone} toast notification.` })}
			>
				{tone}
			</CwButton>
		{/each}
	</div>
	<DemoCodeExample code={toastExample} title="CwToast example" />
</section>

<section class="demo-section">
	<h3>Title &amp; sticky danger</h3>
	<div class="demo-row">
		<CwButton
			variant="danger"
			onclick={() =>
				toast.add({
					tone: 'danger',
					title: 'Sensor offline',
					message: 'CW-AIR-014 has not reported for 2 hours.'
				})}
		>
			Sticky danger toast
		</CwButton>
		<CwButton
			variant="secondary"
			onclick={() =>
				toast.add({
					tone: 'success',
					title: 'Rule saved',
					message: 'Frost alert will notify the night shift.'
				})}
		>
			Titled success toast
		</CwButton>
	</div>
	<DemoCodeExample code={titledExample} title="Titled toast" />
</section>

<section class="demo-section">
	<h3>Duration &amp; dismissal</h3>
	<div class="demo-row">
		<CwButton
			variant="ghost"
			onclick={() => toast.add({ tone: 'info', message: 'This toast stays for 10 seconds.', duration: 10000 })}
		>
			10s toast
		</CwButton>
		<CwButton
			variant="ghost"
			onclick={() =>
				toast.add({ tone: 'info', message: 'Syncing readings… (no close button)', dismissible: false, duration: 4000 })}
		>
			Non-dismissible
		</CwButton>
	</div>
</section>

<section class="demo-section">
	<h3>Stacking</h3>
	<p class="demo-hint">
		At most 4 toasts are shown. When the stack is full, the oldest routine toast is removed first,
		so danger and warning toasts are never pushed out by routine ones. This button adds one danger
		toast and five info toasts.
	</p>
	<div class="demo-row">
		<CwButton variant="secondary" onclick={burst}>Add 6 toasts</CwButton>
	</div>
</section>
