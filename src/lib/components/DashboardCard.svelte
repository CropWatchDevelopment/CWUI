<script lang="ts">
	import { Button, Card, Icon } from 'svelte-ux';
	import { mdiAlert, mdiMailboxUp, mdiCheck, mdiClose, mdiArrowRight } from '@mdi/js';
	import type { Snippet } from 'svelte';

	// Define paths directly as fallback in case the import fails
	const iconPaths = {
		check: mdiCheck || 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
		alert: mdiAlert || 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
		close:
			mdiClose ||
			'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
		arrowRight:
			mdiArrowRight || 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z'
	};

	let {
		location,
		href = '#',
		content = undefined,
		// Receive active status from parent component
		activeDevices = [],
		allActive = false,
		allInactive = false
	}: {
		location: any;
		href?: string;
		content?: Snippet;
		activeDevices?: (boolean | null)[];
		allActive?: boolean;
		allInactive?: boolean;
	} = $props();
</script>

<Card class="bg-surface-200/50 min-w-64 rounded-2xl shadow-md">
	<div>
		<div class="border-[rgb(121 121 121)] rounded-t-2xl border-[0.1em] bg-slate-600 pb-0.5">
			<div class="custom-bg relative h-20 w-full bg-cover bg-bottom bg-no-repeat p-1">
				{#if activeDevices.length === 0}
					<div
						class="bg-warning absolute top-3 flex h-12 w-12 flex-row items-center justify-center rounded-full"
					>
						<Icon class="absolute text-3xl text-white" path={iconPaths.alert} />
					</div>
				{:else}
					<div
						class="
						{allActive ? 'bg-success' : allInactive ? 'bg-danger' : 'bg-warning'}
						absolute top-3 flex h-12 w-12 flex-row items-center justify-center rounded-full"
					>
						<Icon
							class="absolute text-3xl text-white"
							path={allActive ? iconPaths.check : allInactive ? iconPaths.close : iconPaths.alert}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<h2 class="mx-3 my-3 flex flex-row items-center overflow-hidden text-xl text-ellipsis">
		<p class="text-surface-content text-xl">{location.name}</p>
		<span class="flex flex-grow"></span>
		<Button variant="fill" color="primary" icon={iconPaths.arrowRight} {href} />
	</h2>
	<div class="text-surface-content flex flex-col gap-1 px-1 pb-4 text-sm">
		{#if location.cw_devices.length === 0}
			<p class="text-surface-content w-full text-center">No devices found</p>
		{:else if content}
			{@render content()}
		{:else}
			<!-- Default content when no content snippet is provided -->
			{#each location.cw_devices as device}
				<div class="mb-2 rounded border p-2">
					<div class="flex items-center">
						<div class="mr-2 h-3 w-3 rounded-full"></div>
						<div>{device.name || device.dev_eui}</div>
					</div>
				</div>
			{/each}
		{/if}
		<span class="flex flex-grow"></span>
	</div>
</Card>

<style>
	:root {
		--color-primary: var(--color-emerald-600);
		--color-secondary: var(--color-blue-500);
	}
	.custom-bg {
		position: relative;
		overflow: hidden;
	}
	.bg-success {
		background-color: var(--color-success) /* hsl(160 100% 30%) = #009966 */;
	}
	.bg-danger {
		background-color: var(--color-danger-500, #ef4444);
	}
	.bg-warning {
		background-color: var(--color-warning-600, #d97706);
	}
	.custom-bg::before {
		content: ' ';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: #4e7dd6;
		background-image:
			linear-gradient(
				30deg,
				#4676c8 12%,
				transparent 12.5%,
				transparent 87%,
				#4676c8 87.5%,
				#4676c8
			),
			linear-gradient(
				150deg,
				#4676c8 12%,
				transparent 12.5%,
				transparent 87%,
				#4676c8 87.5%,
				#4676c8
			),
			linear-gradient(
				30deg,
				#4676c8 12%,
				transparent 12.5%,
				transparent 87%,
				#4676c8 87.5%,
				#4676c8
			),
			linear-gradient(
				150deg,
				#4676c8 12%,
				transparent 12.5%,
				transparent 87%,
				#4676c8 87.5%,
				#4676c8
			),
			linear-gradient(60deg, #4d86e8 25%, transparent 25.5%, transparent 75%, #4d86e8 75%, #4d86e8),
			linear-gradient(60deg, #4d86e8 25%, transparent 25.5%, transparent 75%, #4d86e8 75%, #4d86e8);
		background-size: 40px 70px;
		background-position:
			0 0,
			0 0,
			20px 35px,
			20px 35px,
			0 0,
			20px 35px;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
		opacity: 0.9; /* Increased from 0.7 to make the pattern more visible */
	}
</style>
