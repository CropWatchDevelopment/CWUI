<script lang="ts">
	import { CwProfileMenu } from '$lib/index.js';
	import type { CwProfileMenuItem } from '$lib/index.js';

	const menuItems: CwProfileMenuItem[] = [
		{ id: 'profile', label: 'My Profile' },
		{ id: 'settings', label: 'Account Settings' },
		{ id: 'api-keys', label: 'API Keys' },
		{ id: 'signout', label: 'Sign Out', separator: true, danger: true }
	];
</script>

<h2>CwProfileMenu</h2>
<p class="demo-desc">User avatar with dropdown menu. Shows name, role, and action items.</p>

<section class="demo-section">
	<h3>With initials (no avatar image)</h3>
	<div class="demo-row">
		<CwProfileMenu
			name="kevin@cropwatch.io"
			subtitle="Administrator"
			{menuItems}
			onselect={(item) => console.log('Menu:', item.id)}
		/>
	</div>
</section>

<section class="demo-section">
	<h3>With avatar image</h3>
	<div class="demo-row">
		<CwProfileMenu
			name="Jane Doe"
			subtitle="Operator"
			avatarUrl="https://i.pravatar.cc/64?u=jane"
			{menuItems}
			onselect={(item) => alert(`Clicked: ${item.label}`)}
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
			name="kevin@cropwatch.io"
			subtitle="Administrator"
			{menuItems}
		/>
	</div>
</section>

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	h3 { font-size: var(--cw-text-base); font-weight: var(--cw-font-semibold); margin-bottom: var(--cw-space-2); color: var(--cw-text-secondary); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-section { margin-bottom: var(--cw-space-6); }
	.demo-row { display: flex; gap: var(--cw-space-3); align-items: center; }
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
		color: var(--cw-accent);
	}
	.demo-topbar__spacer { flex: 1; }
</style>
