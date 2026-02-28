<script lang="ts">
	import { CwListBox } from '$lib/index.js';
	import type { CwListBoxItem } from '$lib/index.js';
	import DemoCodeExample from '../_components/DemoCodeExample.svelte';

	// Groups (like the screenshot sidebar)
	const groups: CwListBoxItem<string>[] = [
		{ value: 'all', label: 'All groups', badge: 'ALL', badgeTone: 'secondary', endText: '196' },
		{ value: 'ungrouped', label: 'Ungrouped', badge: 'UNG', badgeTone: 'secondary', endText: '91' },
		{ value: 'seagaia', label: 'Seagaia', badge: 'SEA', badgeTone: 'success', endText: '41' },
		{ value: 'sa', label: 'SA', badge: 'SA', badgeTone: 'info', endText: '11' },
		{ value: 'kokokara', label: 'Kokokara', badge: 'KOK', badgeTone: 'warning', endText: '2' },
		{ value: 'toyota', label: 'Toyota', badge: 'TOY', badgeTone: 'danger', endText: '2' },
		{ value: 'tk-ebisu', label: 'TK-Ebisu', badge: 'TK-', badgeTone: 'primary', endText: '49' }
	];

	const locations: CwListBoxItem<string>[] = [
		{ value: 'all-loc', label: 'All locations', endText: '196' },
		{ value: 'miyazaki', label: 'Miyazaki House', endText: '7' },
		{ value: 'npo', label: 'NPO法人 東米良創生会', endText: '1' },
		{ value: 'pine1', label: 'パインテラス 1 階', endText: '26' },
		{ value: 'pine-b1', label: 'パインテラス地下 1 階', endText: '6' },
		{ value: 'sa-farm', label: 'SA西都農場', endText: '3' },
		{ value: 'kawagoe', label: '川越農産', endText: '3' },
		{ value: 'takama', label: '高間ハウス', endText: '3' },
		{ value: 'toyotama', label: 'とよたま 2 階', endText: '9' }
	];

	let selectedGroup = $state<string | null>('all');
	let selectedLocation = $state<string | null>('all-loc');

	// Simple list with icons
	const navItems: CwListBoxItem<string>[] = [
		{ value: 'home', label: 'Home', endText: '↗' },
		{ value: 'locations', label: 'Locations', endText: '↗' },
		{ value: 'rules', label: 'Rules', endText: '↗' },
		{ value: 'reports', label: 'Reports', endText: '↗' },
		{ value: 'gateways', label: 'Gateways', endText: '↗' }
	];

	let selectedNav = $state<string | null>('home');
	const SCRIPT_CLOSE = '</' + 'script>';
	const listBoxExample = `<script lang="ts">
	import { CwListBox } from '$lib/index.js';
	import type { CwListBoxItem } from '$lib/index.js';

	const groups: CwListBoxItem<string>[] = [
		{ value: 'all', label: 'All groups', badge: 'ALL', badgeTone: 'secondary', endText: '196' },
		{ value: 'ungrouped', label: 'Ungrouped', badge: 'UNG', badgeTone: 'secondary', endText: '91' },
		{ value: 'seagaia', label: 'Seagaia', badge: 'SEA', badgeTone: 'success', endText: '41' },
		{ value: 'sa', label: 'SA', badge: 'SA', badgeTone: 'info', endText: '11' },
		{ value: 'kokokara', label: 'Kokokara', badge: 'KOK', badgeTone: 'warning', endText: '2' },
		{ value: 'toyota', label: 'Toyota', badge: 'TOY', badgeTone: 'danger', endText: '2' },
		{ value: 'tk-ebisu', label: 'TK-Ebisu', badge: 'TK-', badgeTone: 'primary', endText: '49' }
	];

	const locations: CwListBoxItem<string>[] = [
		{ value: 'all-loc', label: 'All locations', endText: '196' },
		{ value: 'miyazaki', label: 'Miyazaki House', endText: '7' },
		{ value: 'npo', label: 'NPO法人 東米良創生会', endText: '1' },
		{ value: 'pine1', label: 'パインテラス 1 階', endText: '26' },
		{ value: 'pine-b1', label: 'パインテラス地下 1 階', endText: '6' },
		{ value: 'sa-farm', label: 'SA西都農場', endText: '3' },
		{ value: 'kawagoe', label: '川越農産', endText: '3' },
		{ value: 'takama', label: '高間ハウス', endText: '3' },
		{ value: 'toyotama', label: 'とよたま 2 階', endText: '9' }
	];

	const navItems: CwListBoxItem<string>[] = [
		{ value: 'home', label: 'Home', endText: '↗' },
		{ value: 'locations', label: 'Locations', endText: '↗' },
		{ value: 'rules', label: 'Rules', endText: '↗' },
		{ value: 'reports', label: 'Reports', endText: '↗' },
		{ value: 'gateways', label: 'Gateways', endText: '↗' }
	];

	let selectedGroup = $state<string | null>('all');
	let selectedLocation = $state<string | null>('all-loc');
	let selectedNav = $state<string | null>('home');
${SCRIPT_CLOSE}

<div class="demo-columns">
	<div class="demo-sidebar">
		<CwListBox
			heading="Groups"
			items={groups}
			bind:value={selectedGroup}
			onselect={(item) => console.log('Group:', item.value)}
		/>

		<CwListBox
			heading="Locations"
			items={locations}
			bind:value={selectedLocation}
			onselect={(item) => console.log('Location:', item.value)}
		/>
	</div>

	<div class="demo-sidebar">
		<CwListBox
			heading="Navigation"
			items={navItems}
			bind:value={selectedNav}
		/>

		<div class="demo-sidebar__footer">
			<p>Selected group: <strong>{selectedGroup}</strong></p>
			<p>Selected location: <strong>{selectedLocation}</strong></p>
		</div>
	</div>
</div>`;
</script>

<h2>CwListBox</h2>
<p class="demo-desc">Selectable list with left badge, label, and right-aligned count/icon. Matches the sidebar pattern.</p>

<div class="demo-columns">
	<div class="demo-sidebar">
		<CwListBox
			heading="Groups"
			items={groups}
			bind:value={selectedGroup}
			onselect={(item) => console.log('Group:', item.value)}
		/>

		<CwListBox
			heading="Locations"
			items={locations}
			bind:value={selectedLocation}
			onselect={(item) => console.log('Location:', item.value)}
		/>
	</div>

	<div class="demo-sidebar">
		<CwListBox
			heading="Navigation"
			items={navItems}
			bind:value={selectedNav}
		/>

		<div class="demo-sidebar__footer">
			<p>Selected group: <strong>{selectedGroup}</strong></p>
			<p>Selected location: <strong>{selectedLocation}</strong></p>
		</div>
	</div>
</div>

<DemoCodeExample code={listBoxExample} title="CwListBox example" />

<style>
	h2 { font-size: var(--cw-text-xl); font-weight: var(--cw-font-bold); margin-bottom: var(--cw-space-2); }
	.demo-desc { color: var(--cw-text-muted); font-size: var(--cw-text-sm); margin-bottom: var(--cw-space-4); }
	.demo-columns { display: flex; gap: var(--cw-space-6); flex-wrap: wrap; }
	.demo-sidebar {
		width: 16rem;
		padding: var(--cw-space-3);
		background: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-muted);
		border-radius: var(--cw-radius-lg);
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-4);
	}
	.demo-sidebar__footer {
		padding: var(--cw-space-2) var(--cw-space-3);
		border-top: 1px solid var(--cw-border-muted);
	}
	.demo-sidebar__footer p {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}
	strong { color: var(--cw-accent); }
</style>
