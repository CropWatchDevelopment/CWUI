<script lang="ts">
	import { Avatar, Icon } from 'svelte-ux';
	import { mdiAlert, mdiCheck, mdiClose } from '@mdi/js';
	import moment from 'moment';
	import type { ICWDevice } from '$lib/interfaces/ILocation.interface';

	let { 
		device,
		customContent = false,
		renderContent = null
	}: { 
		device: ICWDevice;
		customContent?: boolean;
		renderContent?: any;
	} = $props();

	let isActive = $derived(() => {
		if (device.cw_device_type.default_upload_interval === -1) return true;
		return moment().diff(moment(device.latest_data?.created_at), 'minutes', false) < 
			device.cw_device_type.default_upload_interval;
	});
</script>

<div class="flex flex-row items-center gap-2 p-2">
	<div class="flex-shrink-0">
		<Avatar
			size="sm"
			class="flex flex-row {isActive
				? 'bg-success'
				: 'bg-warning-600'} rounded-full"
		>
			{#if isActive}
				<Icon class="text-sm text-white" path={mdiCheck} />
			{:else}
				<Icon class="text-sm text-white" path={mdiAlert} />
			{/if}
		</Avatar>
	</div>
	
	<div class="flex-grow">
		{#if customContent && renderContent}
			{@render renderContent()}
		{:else}
			<!-- Default content -->
			<div class="text-sm">
				Device status: {isActive ? 'Active' : 'Inactive'}
			</div>
		{/if}
	</div>
</div>