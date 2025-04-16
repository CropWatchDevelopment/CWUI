<script>
	import DashboardCard from '$lib/components/DashboardCard.svelte';
	import DataRowItem from '$lib/components/DataRowItem.svelte';
	import DeviceDataList from '$lib/components/DeviceDataList.svelte';
	import { sampleLocations } from '$lib/sample-data/sample-location.js';

	// sampleLocations[0].cw_devices[0].isActive = null;
</script>

{#each sampleLocations as location}
	<DashboardCard {location} href="#">
		{#each location.cw_devices as device}
			<DataRowItem
				isActive={device.isActive}
				update_interval={device.upload_interval}
				last_updated={new Date(device.latest_data?.created_at ?? '')}
				dataPointPrimary={device.latest_data?.temperatureC}
				primaryNotation={device.cw_device_type.primary_data_notation}
				dataPointSecondary={device.latest_data?.humidity}
				secondaryNotation={device.cw_device_type.secondary_data_notation}
				{device}
				detailHref={`/device/${device.dev_eui}`}
			>
				<DeviceDataList {device} isActive={device.isActive} />
			</DataRowItem>
		{/each}
	</DashboardCard>
{/each}
