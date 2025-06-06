<script lang="ts">
	import DashboardCard from '$lib/components/DashboardCard.svelte';
	import DataRowItem from '$lib/components/DataRowItem.svelte';
	import DeviceDataList from '$lib/components/DeviceDataList.svelte';
	import { sampleLocations } from '$lib/sample-data/sample-location.js';
	import { createActiveTimer } from '$lib/utilities/ActiveTimer.js';
	import { onDestroy } from 'svelte';

	// Simple reactive object to track device active status
	const deviceActiveStatus = $state({});

	// Store unsubscribe functions for cleanup
	const unsubscribers = [];

	// Initialize active timers for each device
	$effect(() => {
		// Clear previous timers
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers.length = 0;

		// Process each location and device
		sampleLocations.forEach((location) => {
			location.cw_devices.forEach((device) => {
				const deviceKey: string = device.dev_eui;

				 // If upload_interval is null, set the status to null directly
				if (device.upload_interval === null) {
					deviceActiveStatus[deviceKey] = null;
					return;
				}

				// Create an active timer for this device with explicit Date conversion
				const activeTimer = createActiveTimer(
					new Date(device.latest_data?.created_at),
					Number(device.upload_interval || device.cw_device_type?.default_upload_interval || 10)
				);

				// Subscribe to the timer and directly update our state object
				const unsubscribe = activeTimer.subscribe((isActive) => {
					console.log(`Device ${device.name} status updated: ${isActive}`);
					deviceActiveStatus[deviceKey] = isActive;
				});

				// Store the unsubscribe function for cleanup
				unsubscribers.push(unsubscribe);
			});
		});
	});

	// Cleanup on destroy
	onDestroy(() => {
		unsubscribers.forEach((unsub) => unsub());
		unsubscribers.length = 0;
	});

	// Get active status for a specific device
	function getDeviceActiveStatus(deviceKey: string) {
		return deviceActiveStatus[deviceKey] ?? null;
	}

	// Helper function to get active status indicators for a location
	function getLocationActiveStatus(location) {
		if (!location?.cw_devices?.length)
			return { activeDevices: [], allActive: false, allInactive: false };

		const activeValues = location.cw_devices.map((device) => getDeviceActiveStatus(device.dev_eui));
		const activeDevices = activeValues.filter((status: boolean | null) => status !== null);
		const allActive =
			activeDevices.length > 0 && activeDevices.every((status: boolean | null) => status === true);
		const allInactive =
			activeDevices.length > 0 && activeDevices.every((status: boolean | null) => status === false);

		return { activeDevices, allActive, allInactive };
	}

	function getContainerClass(viewType: string): string {
		switch (viewType) {
			case 'grid':
				return 'grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
			case 'mozaic':
				return 'columns-[20rem] gap-4 space-y-4';
			case 'list':
				return 'flex flex-col gap-4';
			default:
				return 'grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
		}
	}
</script>
<h1>CropWatch Dashboard Displays</h1>
<div class={getContainerClass('grid')}>
	{#each sampleLocations as location}
		{@const { activeDevices, allActive, allInactive } = getLocationActiveStatus(location)}
		<DashboardCard {location} href="#" {activeDevices} {allActive} {allInactive}>
			{#snippet content()}
				{#each location.cw_devices as device}
					{@const deviceKey = device.dev_eui}
					{@const isActive = getDeviceActiveStatus(deviceKey)}

					<DataRowItem
						{device}
						{isActive}
						dataPointPrimary={device.latest_data?.temperatureC}
						primaryNotation={device.cw_device_type.primary_data_notation}
						dataPointSecondary={device.latest_data?.humidity}
						secondaryNotation={device.cw_device_type.secondary_data_notation}
						detailHref={`/device/${device.dev_eui}`}
					>
						{#snippet children()}
							<DeviceDataList {device} {isActive} />
						{/snippet}
					</DataRowItem>
				{/each}
			{/snippet}
		</DashboardCard>
	{/each}
</div>
