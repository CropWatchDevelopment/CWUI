/** Mock fleet data for the data-display dashboard demo. */

export type Category = 'air' | 'soil' | 'water' | 'power';
export type DeviceStatus = 'online' | 'offline' | 'alert';
export type StatusFilter = 'all' | DeviceStatus;

export interface ScopeSummary {
	devicesInView: number;
	fleetTotal: number;
	online: number;
	offline: number;
	alerts: number;
}

export interface GroupOption extends ScopeSummary {
	id: string;
	code: string;
	label: string;
}

export interface LocationOption extends ScopeSummary {
	id: string;
	label: string;
}

export interface DeviceRow {
	id: string;
	name: string;
	serial: string;
	category: Category;
	groupId: string;
	locationId: string;
	readings: [number | null, number | null, number | null];
	units: [string, string, string];
	status: DeviceStatus;
	lastSeenMinutes: number;
	seenAt: string;
	facility: string;
	floor: string;
	virtual: boolean;
}

export interface AlertItem {
	id: string;
	deviceId: string;
	groupId: string;
	locationId: string;
	label: string;
	reportedAt: string;
	severity: 'warning' | 'critical';
}

export const categoryMeta = {
	air: {
		label: 'Air',
		icon: 'M11.9 8.3A2.5 2.5 0 009.4 4.8a3.2 3.2 0 00-6 1A2.2 2.2 0 003.5 10h8.1a1.9 1.9 0 00.3-3.7z',
		columns: ['Temp', 'Humidity', 'CO₂']
	},
	soil: {
		label: 'Soil',
		icon: 'M4 4.5h8M5 7.5h6M6.5 10.5h3M8 4.5v7',
		columns: ['Soil temp', 'Moisture', 'EC']
	},
	water: {
		label: 'Water',
		icon: 'M8 3.2c1.8 2.2 3 3.8 3 5a3 3 0 11-6 0c0-1.2 1.2-2.8 3-5z',
		columns: ['Water temp', 'pH', 'Flow']
	},
	power: {
		label: 'Power',
		icon: 'M8.8 2.8L4.7 8h2.5l-.5 5.2 4.1-5.2H8.3z',
		columns: ['Voltage', 'Current', 'Load']
	}
} satisfies Record<
	Category,
	{
		label: string;
		icon: string;
		columns: [string, string, string];
	}
>;

export const groupOptions: GroupOption[] = [
	{ id: 'all-groups', code: 'all', label: 'All groups', devicesInView: 196, fleetTotal: 206, online: 169, offline: 27, alerts: 10 },
	{ id: 'ungrouped', code: 'UNG', label: 'Ungrouped', devicesInView: 91, fleetTotal: 96, online: 84, offline: 9, alerts: 3 },
	{ id: 'seagaia', code: 'SEA', label: 'Seagaia', devicesInView: 41, fleetTotal: 45, online: 34, offline: 4, alerts: 7 },
	{ id: 'sa', code: 'SA', label: 'SA', devicesInView: 11, fleetTotal: 12, online: 9, offline: 1, alerts: 2 },
	{ id: 'kokokara', code: 'KOK', label: 'Kokokara', devicesInView: 2, fleetTotal: 3, online: 2, offline: 0, alerts: 1 },
	{ id: 'toyota', code: 'TOY', label: 'Toyota', devicesInView: 2, fleetTotal: 2, online: 2, offline: 0, alerts: 0 },
	{ id: 'tk-ebisu', code: 'TK-', label: 'TK-Ebisu', devicesInView: 49, fleetTotal: 52, online: 38, offline: 13, alerts: 1 }
];

export const locationOptions: LocationOption[] = [
	{ id: 'all-locations', label: 'All locations', devicesInView: 196, fleetTotal: 206, online: 169, offline: 27, alerts: 10 },
	{ id: 'miyazaki', label: 'Miyazaki House!8', devicesInView: 7, fleetTotal: 8, online: 6, offline: 1, alerts: 1 },
	{ id: 'npo', label: 'NPO法人 東米良創生会', devicesInView: 1, fleetTotal: 2, online: 0, offline: 0, alerts: 1 },
	{ id: 'pine-1', label: 'パインテラス 1 階', devicesInView: 26, fleetTotal: 28, online: 24, offline: 1, alerts: 3 },
	{ id: 'pine-b1', label: 'パインテラス地下 1 階', devicesInView: 6, fleetTotal: 7, online: 4, offline: 2, alerts: 1 },
	{ id: 'sa-west', label: 'SA西都農場', devicesInView: 3, fleetTotal: 4, online: 2, offline: 1, alerts: 1 },
	{ id: 'kawagoe', label: '川越農産', devicesInView: 3, fleetTotal: 4, online: 3, offline: 0, alerts: 0 },
	{ id: 'takama', label: '高間ハウス', devicesInView: 3, fleetTotal: 4, online: 2, offline: 1, alerts: 0 }
];

export const devices: DeviceRow[] = [
	{
		id: 'dev-air-1',
		name: '①冷蔵庫',
		serial: '0025CA000000568D',
		category: 'air',
		groupId: 'seagaia',
		locationId: 'pine-1',
		readings: [5.57, 43.85, 0],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 4,
		seenAt: '3/7/2026, 12:18:16 AM',
		facility: 'Seagaia',
		floor: 'パインテラス 1 階',
		virtual: true
	},
	{
		id: 'dev-air-2',
		name: '⑪ドロワー冷蔵庫',
		serial: '0025CA00000056EF',
		category: 'air',
		groupId: 'seagaia',
		locationId: 'pine-1',
		readings: [5.3, 91.55, 0],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 5,
		seenAt: '3/7/2026, 12:17:44 AM',
		facility: 'Seagaia',
		floor: 'パインテラス 1 階',
		virtual: true
	},
	{
		id: 'dev-air-3',
		name: '育苗室 Air Node',
		serial: 'CW-AIR-MIY-018',
		category: 'air',
		groupId: 'ungrouped',
		locationId: 'miyazaki',
		readings: [23.4, 78.2, 812],
		units: ['°C', '%RH', 'ppm'],
		status: 'alert',
		lastSeenMinutes: 1,
		seenAt: '3/7/2026, 12:20:54 AM',
		facility: 'Miyazaki House!8',
		floor: 'North rack',
		virtual: true
	},
	{
		id: 'dev-air-4',
		name: 'Greenhouse A Canopy',
		serial: 'CW-AIR-TKE-221',
		category: 'air',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		readings: [26.1, 56.9, 420],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 7,
		seenAt: '3/7/2026, 12:15:06 AM',
		facility: 'TK-Ebisu',
		floor: 'West canopy',
		virtual: true
	},
	{
		id: 'dev-air-5',
		name: '冷凍庫 B2',
		serial: 'CW-AIR-PNB1-007',
		category: 'air',
		groupId: 'seagaia',
		locationId: 'pine-b1',
		readings: [null, null, null],
		units: ['°C', '%RH', 'ppm'],
		status: 'offline',
		lastSeenMinutes: 92,
		seenAt: '3/6/2026, 10:46:10 PM',
		facility: 'Seagaia',
		floor: 'パインテラス地下 1 階',
		virtual: true
	},
	{
		id: 'dev-air-6',
		name: 'Research Tunnel 03',
		serial: 'CW-AIR-SA-303',
		category: 'air',
		groupId: 'sa',
		locationId: 'kawagoe',
		readings: [18.9, 62.1, 520],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 11,
		seenAt: '3/7/2026, 12:11:28 AM',
		facility: 'SA',
		floor: 'Research tunnel',
		virtual: true
	},
	{
		id: 'dev-air-7',
		name: 'Packing Line Air',
		serial: 'CW-AIR-NPO-091',
		category: 'air',
		groupId: 'ungrouped',
		locationId: 'npo',
		readings: [24.8, 82.4, 1040],
		units: ['°C', '%RH', 'ppm'],
		status: 'alert',
		lastSeenMinutes: 2,
		seenAt: '3/7/2026, 12:19:49 AM',
		facility: 'NPO法人 東米良創生会',
		floor: 'Packing line',
		virtual: true
	},
	{
		id: 'dev-air-8',
		name: 'Gateway Vestibule',
		serial: 'CW-AIR-TAK-011',
		category: 'air',
		groupId: 'toyota',
		locationId: 'takama',
		readings: [21.6, 49.4, 611],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 15,
		seenAt: '3/7/2026, 12:07:03 AM',
		facility: 'Toyota',
		floor: 'Entry vestibule',
		virtual: false
	},
	{
		id: 'dev-air-9',
		name: 'Cold Chain Gate',
		serial: 'CW-AIR-KOK-114',
		category: 'air',
		groupId: 'kokokara',
		locationId: 'pine-1',
		readings: [4.2, 38.1, 0],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 9,
		seenAt: '3/7/2026, 12:13:42 AM',
		facility: 'Kokokara',
		floor: 'Receiving bay',
		virtual: true
	},
	{
		id: 'dev-air-10',
		name: 'Visitor Center Node',
		serial: 'CW-AIR-SEA-422',
		category: 'air',
		groupId: 'sa',
		locationId: 'pine-1',
		readings: [22.3, 51, 480],
		units: ['°C', '%RH', 'ppm'],
		status: 'online',
		lastSeenMinutes: 22,
		seenAt: '3/7/2026, 12:01:51 AM',
		facility: 'SA',
		floor: 'Lobby canopy',
		virtual: true
	},
	{
		id: 'dev-soil-1',
		name: 'Soil Bed A1',
		serial: 'CW-SOIL-TKE-001',
		category: 'soil',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		readings: [14.3, 38.9, 1.4],
		units: ['°C', '%', 'mS/cm'],
		status: 'online',
		lastSeenMinutes: 6,
		seenAt: '3/7/2026, 12:16:17 AM',
		facility: 'TK-Ebisu',
		floor: 'Bed A1',
		virtual: true
	},
	{
		id: 'dev-soil-2',
		name: 'Soil Bed A2',
		serial: 'CW-SOIL-TKE-002',
		category: 'soil',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		readings: [15.1, 41.2, 1.3],
		units: ['°C', '%', 'mS/cm'],
		status: 'online',
		lastSeenMinutes: 8,
		seenAt: '3/7/2026, 12:14:05 AM',
		facility: 'TK-Ebisu',
		floor: 'Bed A2',
		virtual: true
	},
	{
		id: 'dev-soil-3',
		name: 'Compost Block 07',
		serial: 'CW-SOIL-MIY-077',
		category: 'soil',
		groupId: 'ungrouped',
		locationId: 'miyazaki',
		readings: [29.2, 18.4, 2.4],
		units: ['°C', '%', 'mS/cm'],
		status: 'alert',
		lastSeenMinutes: 3,
		seenAt: '3/7/2026, 12:18:58 AM',
		facility: 'Miyazaki House!8',
		floor: 'Compost bay',
		virtual: true
	},
	{
		id: 'dev-soil-4',
		name: 'Nursery Tray 11',
		serial: 'CW-SOIL-SEA-011',
		category: 'soil',
		groupId: 'seagaia',
		locationId: 'pine-1',
		readings: [null, null, null],
		units: ['°C', '%', 'mS/cm'],
		status: 'offline',
		lastSeenMinutes: 74,
		seenAt: '3/6/2026, 11:03:17 PM',
		facility: 'Seagaia',
		floor: 'Tray block 11',
		virtual: true
	},
	{
		id: 'dev-water-1',
		name: 'Irrigation Loop A',
		serial: 'CW-WATER-SEA-101',
		category: 'water',
		groupId: 'seagaia',
		locationId: 'pine-1',
		readings: [12.4, 6.8, 28.2],
		units: ['°C', 'pH', 'L/min'],
		status: 'online',
		lastSeenMinutes: 5,
		seenAt: '3/7/2026, 12:17:20 AM',
		facility: 'Seagaia',
		floor: 'Loop manifold',
		virtual: true
	},
	{
		id: 'dev-water-2',
		name: 'Nutrient Tank East',
		serial: 'CW-WATER-TKE-207',
		category: 'water',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		readings: [19.7, 5.9, 34.5],
		units: ['°C', 'pH', 'L/min'],
		status: 'alert',
		lastSeenMinutes: 2,
		seenAt: '3/7/2026, 12:19:12 AM',
		facility: 'TK-Ebisu',
		floor: 'Nutrient tank',
		virtual: true
	},
	{
		id: 'dev-water-3',
		name: 'Return Line South',
		serial: 'CW-WATER-SA-032',
		category: 'water',
		groupId: 'sa',
		locationId: 'takama',
		readings: [16.1, 6.4, 22],
		units: ['°C', 'pH', 'L/min'],
		status: 'online',
		lastSeenMinutes: 13,
		seenAt: '3/7/2026, 12:08:41 AM',
		facility: 'SA',
		floor: 'Return line south',
		virtual: true
	},
	{
		id: 'dev-power-1',
		name: 'Gateway Cabinet A',
		serial: 'CW-PWR-TKE-440',
		category: 'power',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		readings: [229, 3.8, 860],
		units: ['V', 'A', 'W'],
		status: 'online',
		lastSeenMinutes: 4,
		seenAt: '3/7/2026, 12:18:31 AM',
		facility: 'TK-Ebisu',
		floor: 'Gateway cabinet',
		virtual: true
	},
	{
		id: 'dev-power-2',
		name: 'Pump Room Panel',
		serial: 'CW-PWR-SEA-778',
		category: 'power',
		groupId: 'seagaia',
		locationId: 'pine-b1',
		readings: [211, 8.2, 1740],
		units: ['V', 'A', 'W'],
		status: 'alert',
		lastSeenMinutes: 1,
		seenAt: '3/7/2026, 12:20:31 AM',
		facility: 'Seagaia',
		floor: 'Pump room',
		virtual: true
	},
	{
		id: 'dev-power-3',
		name: 'Cold Storage UPS',
		serial: 'CW-PWR-UNG-009',
		category: 'power',
		groupId: 'ungrouped',
		locationId: 'pine-b1',
		readings: [0, 0, 0],
		units: ['V', 'A', 'W'],
		status: 'offline',
		lastSeenMinutes: 118,
		seenAt: '3/6/2026, 10:20:00 PM',
		facility: 'Ungrouped',
		floor: 'UPS rack',
		virtual: false
	}
];

export const alerts: AlertItem[] = [
	{
		id: 'alert-1',
		deviceId: 'dev-air-3',
		groupId: 'ungrouped',
		locationId: 'miyazaki',
		label: 'Humidity drift in propagation bay',
		reportedAt: '3/7/2026, 12:19:04 AM',
		severity: 'critical'
	},
	{
		id: 'alert-2',
		deviceId: 'dev-air-7',
		groupId: 'ungrouped',
		locationId: 'npo',
		label: 'CO₂ threshold breach',
		reportedAt: '3/7/2026, 12:18:16 AM',
		severity: 'critical'
	},
	{
		id: 'alert-3',
		deviceId: 'dev-water-2',
		groupId: 'tk-ebisu',
		locationId: 'sa-west',
		label: 'pH trend outside target range',
		reportedAt: '3/7/2026, 12:17:32 AM',
		severity: 'warning'
	},
	{
		id: 'alert-4',
		deviceId: 'dev-power-2',
		groupId: 'seagaia',
		locationId: 'pine-b1',
		label: 'Pump room load spike',
		reportedAt: '3/7/2026, 12:16:11 AM',
		severity: 'warning'
	},
	{
		id: 'alert-5',
		deviceId: 'dev-soil-3',
		groupId: 'ungrouped',
		locationId: 'miyazaki',
		label: 'EC rising faster than expected',
		reportedAt: '3/7/2026, 12:14:49 AM',
		severity: 'warning'
	},
	{
		id: 'alert-6',
		deviceId: 'dev-air-5',
		groupId: 'seagaia',
		locationId: 'pine-b1',
		label: 'Freezer telemetry overdue',
		reportedAt: '3/7/2026, 12:10:27 AM',
		severity: 'critical'
	}
];
