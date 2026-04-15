import type {
	CwCardDataRowItemData,
	CwSensorCardData,
	CwStatusDotStatus
} from '$lib/index.js';
import { formatCwSensorValue } from '$lib/components/cwSensorCardRows.js';

const minute = 60_000;
const now = Date.now();

function minutesAgo(minutes: number): Date {
	return new Date(now - minutes * minute);
}

export interface SensorCardCollapsedDemo {
	title: string;
	deviceLabel: string;
	status: CwStatusDotStatus;
	primaryValue: number;
	primaryUnit?: string;
	secondaryValue?: number;
	secondaryUnit?: string;
	lastSeenAt?: Date;
	expireAfterMinutes?: number;
}

export const rowPreviewRows: CwCardDataRowItemData[] = [
	{
		id: 'preview-temperature',
		label: 'Temperature',
		value: formatCwSensorValue(22.4),
		unit: '°C',
		icon: 'thermo'
	},
	{
		id: 'preview-humidity',
		label: 'Humidity',
		value: formatCwSensorValue(67.3),
		unit: '%',
		icon: 'drop'
	},
	{
		id: 'preview-last-update',
		label: 'Last Update',
		icon: 'timer',
		lastSeenAt: minutesAgo(2),
		expireAfterMinutes: 10
	}
];

export const researchLabDevices: CwSensorCardData[] = [
	{
		label: 'CW-Temp-01',
		primaryValue: 21.5,
		primaryUnit: '°C',
		secondaryValue: 58.2,
		secondaryUnit: '%',
		status: 'online',
		lastSeenAt: minutesAgo(1),
		expireAfterMinutes: 10
	},
	{
		label: 'CW-Temp-02',
		primaryValue: 19.8,
		primaryUnit: '°C',
		secondaryValue: 62.1,
		secondaryUnit: '%',
		status: 'online',
		lastSeenAt: minutesAgo(5),
		expireAfterMinutes: 15
	}
];

export const sensorArrayDevices: CwSensorCardData[] = [
	{
		label: 'CW-Soil-A1',
		primaryValue: 14.3,
		primaryUnit: '°C',
		secondaryValue: 38.9,
		secondaryUnit: '%',
		status: 'online',
		lastSeenAt: minutesAgo(1),
		expireAfterMinutes: 10
	},
	{
		label: 'CW-Soil-A2',
		primaryValue: 15.25,
		primaryUnit: '°C',
		secondaryValue: 41.2,
		secondaryUnit: '%',
		status: 'offline',
		lastSeenAt: minutesAgo(30),
		expireAfterMinutes: 5
	},
	{
		label: 'CW-Soil-A3',
		primaryValue: 13.7,
		primaryUnit: '°C',
		secondaryValue: 44.5,
		secondaryUnit: '%',
		status: 'online',
		lastSeenAt: minutesAgo(2),
		expireAfterMinutes: 10
	}
];

export const allOfflineDevices: CwSensorCardData[] = [
	{
		label: 'CW-Down-01',
		primaryValue: 0,
		primaryUnit: '°C',
		status: 'offline',
		lastSeenAt: minutesAgo(120)
	},
	{
		label: 'CW-Down-02',
		primaryValue: 0,
		primaryUnit: '°C',
		status: 'offline',
		lastSeenAt: minutesAgo(60)
	}
];

export const allLoadingDevices: CwSensorCardData[] = [
	{
		label: 'CW-New-01',
		primaryValue: 0,
		primaryUnit: '°C',
		status: 'loading'
	},
	{
		label: 'CW-New-02',
		primaryValue: 0,
		primaryUnit: '°C',
		status: 'loading'
	}
];

export const weatherStationDevice: CwSensorCardData = {
	label: 'CW-Weather-01',
	primaryValue: 22.4,
	primaryUnit: '°C',
	primary_icon: 'thermo',
	secondaryValue: 67.3,
	secondaryUnit: '%',
	secondary_icon: 'drop',
	status: 'online',
	lastSeenAt: minutesAgo(1),
	expireAfterMinutes: 10,
	detailRows: [
		{
			id: 'weather-temp',
			label: 'Temperature',
			value: formatCwSensorValue(22.4),
			unit: '°C',
			icon: 'thermo'
		},
		{
			id: 'weather-humidity',
			label: 'Humidity',
			value: formatCwSensorValue(67.3),
			unit: '%',
			icon: 'drop'
		},
		{
			id: 'weather-rain',
			label: 'Rain Amount',
			value: formatCwSensorValue(3.2),
			unit: 'mm',
			icon: '🌧️'
		},
		{
			id: 'weather-wind',
			label: 'Wind Speed',
			value: formatCwSensorValue(12.5),
			unit: 'km/h',
			icon: '💨'
		},
		{
			id: 'weather-lux',
			label: 'Lux Level',
			value: '48500',
			unit: 'lx',
			icon: '☀️'
		},
		{
			id: 'weather-pressure',
			label: 'Air Pressure',
			value: formatCwSensorValue(1013.25),
			unit: 'hPa',
			icon: '🔵'
		},
		{
			id: 'weather-relay',
			label: 'Relay State',
			value: 'On',
			icon: '⚡'
		},
		{
			id: 'weather-updated',
			label: 'Last Update',
			icon: 'timer',
			lastSeenAt: minutesAgo(1),
			expireAfterMinutes: 10
		}
	]
};

export const waterLevelDevice: CwSensorCardData = {
	label: 'CW-Tank-01',
	primaryValue: 74.5,
	primaryUnit: '%',
	primary_icon: 'drop',
	status: 'online',
	lastSeenAt: minutesAgo(5),
	expireAfterMinutes: 15,
	detailRows: [
		{
			id: 'tank-level',
			label: 'Water Level',
			value: formatCwSensorValue(74.5),
			unit: '%',
			icon: 'drop'
		},
		{
			id: 'tank-updated',
			label: 'Last Update',
			icon: 'timer',
			lastSeenAt: minutesAgo(5),
			expireAfterMinutes: 15
		}
	]
};

export const collapsedStatusCards: SensorCardCollapsedDemo[] = [
	{
		title: 'Field Station 1',
		deviceLabel: 'CW-Sensor-001',
		status: 'online',
		primaryValue: 24.5,
		secondaryValue: 65.2,
		lastSeenAt: minutesAgo(1),
		expireAfterMinutes: 10
	},
	{
		title: 'Warehouse B',
		deviceLabel: 'CW-Sensor-042',
		status: 'offline',
		primaryValue: -5.1,
		secondaryValue: 88,
		lastSeenAt: minutesAgo(180),
		expireAfterMinutes: 20
	},
	{
		title: 'Rooftop Array',
		deviceLabel: 'CW-Sensor-077',
		status: 'loading',
		primaryValue: 0,
		secondaryValue: 0
	},
	{
		title: 'Lab Freezer',
		deviceLabel: 'CW-Sensor-099',
		status: 'warning',
		primaryValue: -18.25,
		secondaryValue: 72.4,
		lastSeenAt: minutesAgo(12),
		expireAfterMinutes: 10
	}
];

export const sensorCardSingleDeviceExample = `<CwLocationCard title="Greenhouse A">
\t<CwSensorCard
\t\tlabel="CW-SS-TMEPNCO2-18"
\t\tstatus="online"
\t\tprimaryValue={-22.93}
\t\tprimaryUnit="°C"
\t\tprimary_icon="thermo"
\t\tsecondaryValue={79.61}
\t\tsecondaryUnit="%"
\t\tsecondary_icon="drop"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t\tonExpand={(label) => console.log('expanded:', label)}
\t\tonCollapse={(label) => console.log('collapsed:', label)}
\t\tonExpire={(label) => console.log('overdue:', label)}
\t>
\t\t<CwDataList
\t\t\trows={[
\t\t\t\t{ id: 'temperature', label: 'Temperature', value: '-22.93', unit: '°C', icon: 'thermo' },
\t\t\t\t{ id: 'humidity', label: 'Humidity', value: '79.61', unit: '%', icon: 'drop' },
\t\t\t\t{ id: 'updated', label: 'Last Update', icon: 'timer', lastSeenAt: new Date(Date.now() - 120_000), expireAfterMinutes: 10 }
\t\t\t]}
\t\t/>
\t</CwSensorCard>
</CwLocationCard>`;

export const sensorCardMultiDeviceExample = `<script lang="ts">
\timport { buildCwSensorCardDetailRows } from '$lib/components/cwSensorCardRows.js';

\tconst sensors = [
\t\t{
\t\t\tlabel: 'CW-Temp-01',
\t\t\tprimaryValue: 21.5,
\t\t\tprimaryUnit: '°C',
\t\t\tsecondaryValue: 58.2,
\t\t\tsecondaryUnit: '%',
\t\t\tlastSeenAt: new Date(Date.now() - 60_000),
\t\t\texpireAfterMinutes: 10
\t\t},
\t\t{
\t\t\tlabel: 'CW-Temp-02',
\t\t\tprimaryValue: 19.8,
\t\t\tprimaryUnit: '°C',
\t\t\tsecondaryValue: 62.1,
\t\t\tsecondaryUnit: '%',
\t\t\tlastSeenAt: new Date(Date.now() - 300_000),
\t\t\texpireAfterMinutes: 15
\t\t}
\t];
</script>

<CwLocationCard title="Research Lab">
\t{#each sensors as sensor (sensor.label)}
\t\t<CwSensorCard
\t\t\tlabel={sensor.label}
\t\t\tstatus={sensor.status ?? 'online'}
\t\t\tprimaryValue={sensor.primaryValue}
\t\t\tprimaryUnit={sensor.primaryUnit ?? '°C'}
\t\t\tsecondaryValue={sensor.secondaryValue}
\t\t\tsecondaryUnit={sensor.secondaryUnit ?? '%'}
\t\t\tlastSeenAt={sensor.lastSeenAt}
\t\t\texpireAfterMinutes={sensor.expireAfterMinutes}
\t\t>
\t\t\t<CwDataList rows={buildCwSensorCardDetailRows(sensor)} />
\t\t</CwSensorCard>
\t{/each}
</CwLocationCard>`;

export const sensorCardCustomRowsExample = `<script lang="ts">
\tconst weatherDevice = {
\t\tlabel: 'CW-Weather-01',
\t\tprimaryValue: 22.4,
\t\tprimaryUnit: '°C',
\t\tprimary_icon: 'thermo',
\t\tsecondaryValue: 67.3,
\t\tsecondaryUnit: '%',
\t\tsecondary_icon: 'drop',
\t\tlastSeenAt: new Date(Date.now() - 60_000),
\t\texpireAfterMinutes: 10,
\t\tdetailRows: [
\t\t\t{ id: 'wind', label: 'Wind Speed', value: '12.50', unit: 'km/h', icon: '💨' },
\t\t\t{ id: 'lux', label: 'Lux Level', value: '48500', unit: 'lx', icon: '☀️' },
\t\t\t{ id: 'updated', label: 'Last Update', icon: 'timer', lastSeenAt: new Date(Date.now() - 60_000), expireAfterMinutes: 10 }
\t\t]
\t};
</script>

<CwLocationCard title="Weather Station Alpha">
\t<CwSensorCard
\t\tlabel={weatherDevice.label}
\t\tstatus="online"
\t\tprimaryValue={weatherDevice.primaryValue}
\t\tprimaryUnit={weatherDevice.primaryUnit}
\t\tprimary_icon={weatherDevice.primary_icon}
\t\tsecondaryValue={weatherDevice.secondaryValue}
\t\tsecondaryUnit={weatherDevice.secondaryUnit}
\t\tsecondary_icon={weatherDevice.secondary_icon}
\t\tlastSeenAt={weatherDevice.lastSeenAt}
\t\texpireAfterMinutes={weatherDevice.expireAfterMinutes}
\t\tdefaultExpanded
\t>
\t\t<CwDataList rows={weatherDevice.detailRows} />
\t</CwSensorCard>
</CwLocationCard>`;

export const dataListExample = `<CwDataList
\trows={[
\t\t{ id: 'temperature', label: 'Temperature', value: '22.40', unit: '°C', icon: 'thermo' },
\t\t{ id: 'humidity', label: 'Humidity', value: '67.30', unit: '%', icon: 'drop' },
\t\t{ id: 'updated', label: 'Last Update', icon: 'timer', lastSeenAt: new Date(Date.now() - 120_000), expireAfterMinutes: 10 }
\t]}
/>`;

export const cardDataRowListExample = `<ul>
\t<CwCardDataRowItem
\t\tid="temperature"
\t\tlabel="Temperature"
\t\tvalue="22.40"
\t\tunit="°C"
\t\ticon="thermo"
\t/>
\t<CwCardDataRowItem
\t\tid="humidity"
\t\tlabel="Humidity"
\t\tvalue="67.30"
\t\tunit="%"
\t\ticon="drop"
\t/>
\t<CwCardDataRowItem
\t\tid="updated"
\t\tlabel="Last Update"
\t\ticon="timer"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t/>
</ul>`;

export const cardDataRowTimeoutExample = `<script lang="ts">
\tlet withinTimeout = $state<boolean | null>(null);
\tlet expired = $state(false);
</script>

<ul>
\t<CwCardDataRowItem
\t\tid="updated"
\t\tlabel="Last Update"
\t\ticon="timer"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t\tonExpire={() => (expired = true)}
\t\tbind:withinTimeout
\t/>
</ul>

<p>Within timeout: {withinTimeout}</p>
<p>Expired callback fired: {expired}</p>`;

export const sensorCardFreshnessExample = `<script lang="ts">
\tlet sensorWithinTimeout = $state<boolean | null>(null);
</script>

<CwLocationCard title="Greenhouse A">
\t<CwSensorCard
\t\tlabel="CW-SS-TMEPNCO2-18"
\t\tstatus="online"
\t\tprimaryValue={22.93}
\t\tprimaryUnit="°C"
\t\tsecondaryValue={79.61}
\t\tsecondaryUnit="%"
\t\tlastSeenAt={new Date(Date.now() - 120_000)}
\t\texpireAfterMinutes={10}
\t\tonExpand={(label) => console.log('expanded:', label)}
\t\tonCollapse={(label) => console.log('collapsed:', label)}
\t\tonExpire={(label) => console.log('expired:', label)}
\t\tbind:withinTimeout={sensorWithinTimeout}
\t>
\t\t<CwDataList
\t\t\trows={[
\t\t\t\t{ id: 'temperature', label: 'Temperature', value: '22.93', unit: '°C', icon: 'thermo' },
\t\t\t\t{ id: 'humidity', label: 'Humidity', value: '79.61', unit: '%', icon: 'drop' },
\t\t\t\t{ id: 'updated', label: 'Last Update', icon: 'timer', lastSeenAt: new Date(Date.now() - 120_000), expireAfterMinutes: 10 }
\t\t\t]}
\t\t/>
\t</CwSensorCard>
</CwLocationCard>

<pre>{JSON.stringify({ sensorWithinTimeout }, null, 2)}</pre>`;

export const cardDataRowCustomIconExample = `<CwCardDataRowItem
\tid="relay-state"
\tlabel="Relay State"
\tvalue="On"
\ticon="⚡"
/>`;
