<script lang="ts">
	import { Button, Collapse, TweenedValue } from 'svelte-ux';
	import { goto } from '$app/navigation';
	import { mdiArrowRight } from '@mdi/js';
	import { nameToEmoji } from '$lib/utilities/NameToEmoji.js';
	import { browser } from '$app/environment';
	import { createActiveTimer } from '$lib/utilities/ActiveTimer.js';
	import { onDestroy } from 'svelte';

	let {
		device,
		update_interval = -1,
		last_updated,

		dataPointPrimary = null,
		primaryNotation = '',

		dataPointSecondary = null,
		secondaryNotation = '',

		detailHref = '#',
		children = null
	}: {
		device: any;
		update_interval?: number;
		last_updated?: Date;
		dataPointPrimary?: number | null;
		primaryNotation?: string;
		primaryIcon?: string | null;
		dataPointSecondary?: number | null;
		secondaryNotation?: string;
		secondaryIcon?: string | null;
		detailHref?: string;
		children?: any;
	} = $props();

	// Create the active timer store
	const activeTimer = createActiveTimer(last_updated, update_interval);
	
	// Get the active status from the timer - state can be true, false, or null
	let isactive: boolean | null = $state(null);
	
	// Subscribe to the timer store
	const unsubscribe = activeTimer.subscribe((value: boolean | null) => {
		isactive = value;
	});
	
	// Update the timer when props change
	$effect(() => {
		activeTimer.update(last_updated, update_interval);
	});
	
	// Clean up subscription when component is destroyed
	onDestroy(() => {
		unsubscribe();
	});

	let localStorageOpenState = browser
		? localStorage.getItem(`${device.dev_eui}-collapseState`)
		: null;
	let defaultCollapse: boolean = $state(
		localStorageOpenState ? JSON.parse(localStorageOpenState) : false
	);

	function collapseStateChange(e: CustomEvent) {
		defaultCollapse = e.detail.open;
		if (browser) {
			localStorage.setItem(`${device.dev_eui}-collapseState`, JSON.stringify(e.detail.open));
		}
	}

</script>

<Collapse
	classes={{ root: 'shadow-md pr-2 bg-surface-200/50', icon: 'data-[open=true]:rotate-90' }}
	open={defaultCollapse}
	on:change={(e) => collapseStateChange(e)}
>
	<div
		slot="trigger"
		class="flex-1 border-l-8 {isactive
			? '!border-l-green-500'
			: 'border-l-red-500'} {isactive === null ? '!border-l-yellow-400' : ''}"
	>
		<div class="my-1 mr-2 border-r-2">
			<div class="flex flex-col text-center text-base">
				<div class="justify-left flex flex-row">
					<b class="text-surface-content ml-4 text-sm">{device.name}</b>
				</div>
				<div class="flex flex-row justify-center">
					{#if device.latest_data}
						<p class="m-auto justify-center">
							<span class="text-surface-content">
								{nameToEmoji(device.cw_device_type.primary_data_v2 ?? '')}
								<TweenedValue
									value={dataPointPrimary}
									format="decimal"
									class="text-accent-500 font-medium"
								/>
							</span>
							<small>
								<sup class="text-accent-300">{primaryNotation}</sup>
							</small>
						</p>
						<p class="m-auto justify-center">
							<span class="text-surface-content">
								{#if device.cw_device_type.secondary_data_v2}
									{nameToEmoji(device.cw_device_type.secondary_data_v2 ?? '')}
									<TweenedValue
										value={dataPointSecondary}
										format="decimal"
										class="text-accent-500 font-medium"
									/>
								{/if}
							</span>
							<small>
								<sup class="text-accent-300">{secondaryNotation}</sup>
							</small>
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if device.latest_data}
		{#if children}
			{@render children?.()}
		{:else}
			<p>No Data Points</p>
		{/if}
	{/if}
	<div class="border-l-8 pl-1 {isactive ? '!border-l-green-500' : 'border-l-red-500'}">
		<Button
			href={detailHref}
			variant="fill"
			color="info"
			class="mb-1 w-full"
			icon={mdiArrowRight}
		>
			Details
		</Button>
	</div>
</Collapse>
