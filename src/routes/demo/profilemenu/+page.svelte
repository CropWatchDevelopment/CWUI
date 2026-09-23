<script lang="ts">
	import { CwProfileMenu } from '$lib/index.js';
	import type { CwProfileMenuItem } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	const menuItems: CwProfileMenuItem[] = [
		{ id: 'profile', label: 'My Profile' },
		{ id: 'settings', label: 'Account Settings' },
		{ id: 'api-keys', label: 'API Keys' },
		{ id: 'signout', label: 'Sign Out', separator: true, danger: true }
	];
	let lastEvent = $state('none yet');

	// A local, generated avatar so the demo never loads third-party images.
	const avatarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2f6b55"/><circle cx="32" cy="25" r="11" fill="#cfe9dc"/><path d="M12 58c3-11 11-17 20-17s17 6 20 17" fill="#cfe9dc"/></svg>`;
	const avatarUrl = `data:image/svg+xml,${encodeURIComponent(avatarSvg)}`;

	const profileMenuExample = `{#snippet refreshIcon()}
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13 8a5 5 0 1 1-1.28-3.36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M13 3.5v3.2H9.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<CwProfileMenu
\tname="alex.morgan@example.com"
\tsubtitle="Administrator"
\ticon={refreshIcon}
\t{menuItems}
\tonselect={(item) => handleMenu(item.id)}
/>`;
</script>

<h2>CwProfileMenu</h2>
<p class="demo-desc">
	User avatar with a dropdown menu showing name, role and actions. The menu supports the full
	keyboard pattern: focus moves into it on open, arrow keys and Home/End move between items, and
	Escape closes it and returns focus. On phones only the avatar is shown.
</p>

<section class="demo-section">
	<h3>With initials (no avatar image)</h3>
	<div class="demo-row">
		{#snippet refreshIcon()}
			<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M13 8a5 5 0 1 1-1.28-3.36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<path d="M13 3.5v3.2H9.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		{/snippet}
		<CwProfileMenu
			name="alex.morgan@example.com"
			subtitle="Administrator"
			icon={refreshIcon}
			{menuItems}
			onselect={(item) => (lastEvent = `menu → ${item.id}`)}
		/>
	</div>
	<p class="demo-event" aria-live="polite">Last event: {lastEvent}</p>
	<DemoCodeExample code={profileMenuExample} title="CwProfileMenu example" />
</section>

<section class="demo-section">
	<h3>With avatar image</h3>
	<div class="demo-row">
		<CwProfileMenu
			name="Jane Doe"
			subtitle="Operator"
			{avatarUrl}
			{menuItems}
			onselect={(item) => (lastEvent = `menu → ${item.id}`)}
		/>
	</div>
</section>

<section class="demo-section">
	<h3>Compact (no subtitle)</h3>
	<div class="demo-row">
		<CwProfileMenu
			name="Admin"
			{menuItems}
		/>
	</div>
</section>

<section class="demo-section">
	<h3>In a toolbar</h3>
	<div class="demo-topbar">
		<span class="demo-topbar__brand">CropWatch</span>
		<span class="demo-topbar__spacer"></span>
		<CwProfileMenu
			name="alex.morgan@example.com"
			subtitle="Administrator"
			{menuItems}
		/>
	</div>
</section>

<style>
	.demo-topbar {
		display: flex;
		align-items: center;
		padding: var(--cw-space-2) var(--cw-space-4);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
	}
	.demo-topbar__brand {
		font-size: var(--cw-text-lg);
		font-weight: var(--cw-font-bold);
		color: var(--cw-accent-text);
	}
	.demo-topbar__spacer { flex: 1; }
</style>
