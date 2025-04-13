<script lang="ts">
	import DataRowItem from './DataRowItem.svelte';
	import { Avatar, Button, Card, Icon } from 'svelte-ux';
	import { mdiAlert, mdiMailboxUp, mdiCheck, mdiClose, mdiArrowRight } from '@mdi/js';
	import moment from 'moment';

	// Define paths directly as fallback in case the import fails
	const iconPaths = {
		check: mdiCheck || 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
		alert: mdiAlert || 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
		close: mdiClose || 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
		mailboxUp: mdiMailboxUp || 'M17,4H7A5,5 0 0,0 2,9V20H4V9A3,3 0 0,1 7,6H17A3,3 0 0,1 20,9V20H22V9A5,5 0 0,0 17,4M10,18H6V16H10V18M15,12H9V10H15V12M12,9L7,14H17L12,9Z',
		arrowRight: mdiArrowRight || 'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z'
	};

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
			t: location.cw_devices
				.map(
					(device) => `
				<div class="mb-2">
					<svelte:component this={DataRowItem} device={${JSON.stringify(device)}} location={${JSON.stringify(location)}} />
				</div>
			`
				)
				.join('')
		};
	}
</script>

<Card class="bg-surface-200/50 min-w-64 rounded-2xl shadow-md">
	<div>
		<div class="border-[rgb(121 121 121)] rounded-t-2xl border-[0.1em] bg-slate-600 pb-0.5">
			<div class="custom-bg relative h-20 w-full bg-cover bg-bottom bg-no-repeat p-1">
				<div
					class="absolute top-0 right-0 flex h-full w-1/2 flex-row items-center justify-end rounded-2xl"
				>
					{#if location.cw_devices.some((device) => device?.cw_rules.length > 0)}
						<Avatar size="lg" class="absolute top-3 flex flex-row rounded-full bg-red-300">
							<Icon class="text-3xl text-white" path={iconPaths.mailboxUp} />
						</Avatar>
					{/if}
				</div>
				<Avatar
					size="lg"
					class={`absolute top-3 flex flex-row rounded-full ${
						activeDevices === location.cw_devices.length
							? 'bg-success'
							: activeDevices > 0
							? 'bg-warning-600'
							: 'bg-danger-500'
					}`}
				>

					{#if activeDevices === location.cw_devices.length}
						<Icon class="absolute text-3xl text-white" path={iconPaths.check} />
					{:else if activeDevices > 0}
						<Icon class="absolute text-3xl text-white" path={iconPaths.alert} />
					{:else if activeDevices === 0}
						<Icon class="absolute text-3xl text-white" path={iconPaths.close} />
					{/if}
				</Avatar>
			</div>
		</div>
	</div>

	<h2 class="mx-3 my-3 flex flex-row items-center overflow-hidden text-xl text-ellipsis">
		<p class="text-surface-content text-xl">{location.name}</p>
		<span class="flex flex-grow"></span>
		<Button variant="fill" color="primary" icon={iconPaths.arrowRight} on:click={handleNavigate} />
	</h2>
	<div class="text-surface-content flex flex-col gap-1 px-1 pb-4 text-sm">
		{#if location.cw_devices.length === 0}
			<p class="text-surface-content w-full text-center">No devices found</p>
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
	:root {
		--color-primary: var(--color-emerald-600);
		--color-secondary: var(--color-blue-500);
	}
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
