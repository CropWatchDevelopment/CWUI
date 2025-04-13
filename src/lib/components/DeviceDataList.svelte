<script lang="ts">
	import { nameToJapaneseName } from '$lib/utilities/nameToJapanese.js';
	import { convertObject } from '$lib/utilities/ConvertSensorDataObject.js';
	import { nameToEmoji } from '$lib/utilities/NameToEmoji.js';
	import { Duration, Tooltip, TweenedValue } from 'svelte-ux';
	import { nameToNotation } from '$lib/utilities/NameToNotation.js';
	import { DurationUnits } from '@layerstack/utils';
	import { createActiveTimer } from '$lib/utilities/ActiveTimer.js';
	import { onDestroy } from 'svelte';

	let { device, update_interval, last_updated } = $props();

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

	// 1. Convert the latest_data to an object
	let convertedData = convertObject(device.latest_data);

	// 2. Extract the keys
	let dataPoints = $state(Object.keys(convertedData).filter((key) => key !== 'created_at'));

	// 3. Filter out `created_at` ...
	// dataPoints = dataPoints.filter((key) => key !== 'created_at');

	// 4. ... then push it to the end if it was present
	if (Object.keys(convertedData).includes('created_at')) {
		dataPoints.push('created_at');
	}
</script>

<div
	class="mr-2 border-l-8
        {isactive ? 'border-l-green-500' : 'border-l-red-500'}
		{isactive === null ? '!border-l-yellow-400' : ''}"
>
	<div class="flex px-3">
		<h3 class="text-surface-content mb-2 basis-1/3 text-lg font-medium">
			{nameToJapaneseName('Details')}
		</h3>
	</div>

	{#each dataPoints as dataPointKey, index}
		{#if device.latest_data[dataPointKey] !== null}
			<div class="py-1">
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<p class="text-primary text-base">{nameToEmoji(dataPointKey)}</p>
						<p class="text-surface-content ml-1 text-right">{nameToJapaneseName(dataPointKey)}</p>
					</div>
					<div class="flex items-center">
						{#if dataPointKey === 'created_at'}
							<p class="text-surface-content flex flex-row items-center text-base">
								<Tooltip
									title={update_interval > 0
										? `Uploads Every: ${update_interval} minutes`
										: 'Device no regular upload interval'}
								>
									<Duration
										start={device.latest_data.created_at}
										totalUnits={2}
										minUnits={DurationUnits.Second}
										class={update_interval == null || update_interval < 0
											? 'text-neutral-content'
											: isactive
												? 'text-accent-500'
												: 'text-danger'}
									/>&nbsp;ago
								</Tooltip>
							</p>
						{:else if device.latest_data[dataPointKey] !== null}
							<div class="flex items-center">
								<p>
									<TweenedValue
										value={device.latest_data[dataPointKey]}
										format="decimal"
										class="text-accent-500 font-medium"
									/>
								</p>
								<small class="ml-1">
									<sup class="text-accent-300">{nameToNotation(dataPointKey)}</sup>
								</small>
							</div>
						{/if}
					</div>
				</div>

				{#if dataPoints.length - 1 !== index}
					<div class="border-b border-[#7d7d81] px-3 pt-2"></div>
				{:else}
					<div class="px-3 pt-2"></div>
				{/if}
			</div>
		{/if}
	{/each}
</div>
