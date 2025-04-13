<script lang="ts">
	import DataRowItem from './DataRowItem.svelte';
	import { Avatar, Button, Card, Icon } from 'svelte-ux';
	import { mdiAlert, mdiMailboxUp, mdiCheck, mdiClose, mdiArrowRight } from '@mdi/js';
	import moment from 'moment';

	let {
		location,
		onNavigate = (locationId: string | number) => {},
		customDeviceContent = false,
		renderDeviceItems = null,
		children = null
	}: {
		location;
		onNavigate?: (locationId: string | number) => void;
		customDeviceContent?: boolean;
		renderDeviceItems?: any;
		children?: any;
	} = $props();

	let activeDevices = $derived(
		location.cw_devices
			.map((device) => {
				if (device.cw_device_type.default_upload_interval === -1) return true;
				const dev =
					moment().diff(moment(device.latest_data?.created_at), 'minutes', false) <
					device.cw_device_type.default_upload_interval;
				return dev;
			})
			.filter(Boolean).length
	);

	function handleNavigate() {
		onNavigate(location.location_id);
	}

	// Default content renderer function
	function defaultRenderer() {
		return {
			t: location.cw_devices.map(device => `
				<div class="mb-2">
					<svelte:component this={DataRowItem} device={${JSON.stringify(device)}} location={${JSON.stringify(location)}} />
				</div>
			`).join('')
		};
	}
</script>

<Card class="min-w-64 rounded-2xl bg-surface-200/50 shadow-md">
	<div>
		<div class="border-[rgb(121 121 121)] rounded-t-2xl border-[0.1em] bg-slate-600 pb-0.5">
			<div
				class="custom-bg relative h-20 w-full bg-cover bg-bottom bg-no-repeat p-1"
			>
				<div
					class="absolute top-0 right-0 flex h-full w-1/2 flex-row items-center justify-end rounded-2xl"
				>
					{#if location.cw_devices.some((device) => device?.cw_rules.length > 0)}
						<Avatar size="lg" class="absolute top-3 flex flex-row rounded-full bg-red-300">
							<Icon class="text-3xl text-white" path={mdiMailboxUp} />
						</Avatar>
					{/if}
				</div>
				<Avatar
					size="lg"
					class="absolute top-3 flex flex-row {activeDevices == location.cw_devices.length
						? 'bg-success'
						: 'bg-warning-600'}{activeDevices === 0 ? ' bg-danger-500' : ''} rounded-full"
				>
					{#if activeDevices === location.cw_devices.length}
						<Icon class="absolute text-3xl text-white" path={mdiCheck} />
					{:else if activeDevices > 0}
						<Icon class="absolute text-3xl text-white" path={mdiAlert} />
					{:else if activeDevices === 0}
						<Icon class="absolute text-3xl text-white" path={mdiClose} />
					{/if}
				</Avatar>
			</div>
		</div>
	</div>

	<h2 class="my-3 mx-3 flex flex-row items-center overflow-hidden text-xl text-ellipsis">
		<p class="text-xl text-surface-content">{location.name}</p>
		<span class="flex flex-grow"></span>
		<Button variant="fill" color="primary" icon={mdiArrowRight} on:click={handleNavigate} />
	</h2>
	<div class="flex flex-col gap-1 px-1 pb-4 text-sm text-surface-content">
		{#if location.cw_devices.length === 0}
			<p class="w-full text-center text-surface-content">No devices found</p>
		{:else if customDeviceContent && renderDeviceItems}
			{@render renderDeviceItems?.()}
		{:else if children}
			{@render children?.()}
		{:else}
			<!-- Default content if no children or renderDeviceItems provided -->
			{@render defaultRenderer()}
		{/if}
		<span class="flex flex-grow"></span>
	</div>
</Card>

<style>
	.custom-bg {
		position: relative;
		overflow: hidden;
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
