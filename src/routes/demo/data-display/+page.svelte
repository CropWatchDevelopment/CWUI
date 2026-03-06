<script lang="ts">
	import { CwButton, CwProfileMenu, CwStatusDot } from '$lib/index.js';
	import type { CwProfileMenuItem, CwStatusDotStatus } from '$lib/index.js';

	type Category = 'air' | 'soil' | 'water' | 'power';
	type DeviceStatus = 'online' | 'offline' | 'alert';
	type StatusFilter = 'all' | DeviceStatus;

	interface ScopeSummary {
		devicesInView: number;
		fleetTotal: number;
		online: number;
		offline: number;
		alerts: number;
	}

	interface GroupOption extends ScopeSummary {
		id: string;
		code: string;
		label: string;
	}

	interface LocationOption extends ScopeSummary {
		id: string;
		label: string;
	}

	interface DeviceRow {
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

	interface AlertItem {
		id: string;
		deviceId: string;
		groupId: string;
		locationId: string;
		label: string;
		reportedAt: string;
		severity: 'warning' | 'critical';
	}

	const navItems = [
		{
			id: 'home',
			label: 'Home',
			icon: 'M2.5 7.5L8 3l5.5 4.5V13a.75.75 0 01-.75.75H9.5V9.25h-3V13.75H3.25A.75.75 0 012.5 13z'
		},
		{
			id: 'locations',
			label: 'Locations',
			icon: 'M8 13s3.5-3.4 3.5-6.3A3.5 3.5 0 104.5 6.7C4.5 9.6 8 13 8 13zm0-4.6a1.1 1.1 0 100-2.2 1.1 1.1 0 000 2.2z'
		},
		{
			id: 'rules',
			label: 'Rules',
			icon: 'M4 3.5h6.5l2 2V12a1 1 0 01-1 1h-7a1 1 0 01-1-1v-7.5a1 1 0 011-1zm2 3h4m-4 2h4m-4 2h2.5'
		},
		{
			id: 'reports',
			label: 'Reports',
			icon: 'M3 3.5h10v9H3zm2 2.5h6m-6 2h6m-6 2h3'
		},
		{
			id: 'gateways',
			label: 'Gateways',
			icon: 'M3.5 4.5h9v7h-9zm2 5.5h5m-4-5.5v-1m3 1v-1m-5 3h7'
		},
		{
			id: 'compare',
			label: 'Compare',
			icon: 'M3.5 5.5H8m0 0L6.5 4m1.5 1.5L6.5 7M12.5 10.5H8m0 0L9.5 9M8 10.5L9.5 12'
		}
	] as const;

	const categoryMeta = {
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

	const groupOptions: GroupOption[] = [
		{ id: 'all-groups', code: 'all', label: 'All groups', devicesInView: 196, fleetTotal: 206, online: 169, offline: 27, alerts: 10 },
		{ id: 'ungrouped', code: 'UNG', label: 'Ungrouped', devicesInView: 91, fleetTotal: 96, online: 84, offline: 9, alerts: 3 },
		{ id: 'seagaia', code: 'SEA', label: 'Seagaia', devicesInView: 41, fleetTotal: 45, online: 34, offline: 4, alerts: 7 },
		{ id: 'sa', code: 'SA', label: 'SA', devicesInView: 11, fleetTotal: 12, online: 9, offline: 1, alerts: 2 },
		{ id: 'kokokara', code: 'KOK', label: 'Kokokara', devicesInView: 2, fleetTotal: 3, online: 2, offline: 0, alerts: 1 },
		{ id: 'toyota', code: 'TOY', label: 'Toyota', devicesInView: 2, fleetTotal: 2, online: 2, offline: 0, alerts: 0 },
		{ id: 'tk-ebisu', code: 'TK-', label: 'TK-Ebisu', devicesInView: 49, fleetTotal: 52, online: 38, offline: 13, alerts: 1 }
	];

	const locationOptions: LocationOption[] = [
		{ id: 'all-locations', label: 'All locations', devicesInView: 196, fleetTotal: 206, online: 169, offline: 27, alerts: 10 },
		{ id: 'miyazaki', label: 'Miyazaki House!8', devicesInView: 7, fleetTotal: 8, online: 6, offline: 1, alerts: 1 },
		{ id: 'npo', label: 'NPO法人 東米良創生会', devicesInView: 1, fleetTotal: 2, online: 0, offline: 0, alerts: 1 },
		{ id: 'pine-1', label: 'パインテラス 1 階', devicesInView: 26, fleetTotal: 28, online: 24, offline: 1, alerts: 3 },
		{ id: 'pine-b1', label: 'パインテラス地下 1 階', devicesInView: 6, fleetTotal: 7, online: 4, offline: 2, alerts: 1 },
		{ id: 'sa-west', label: 'SA西都農場', devicesInView: 3, fleetTotal: 4, online: 2, offline: 1, alerts: 1 },
		{ id: 'kawagoe', label: '川越農産', devicesInView: 3, fleetTotal: 4, online: 3, offline: 0, alerts: 0 },
		{ id: 'takama', label: '高間ハウス', devicesInView: 3, fleetTotal: 4, online: 2, offline: 1, alerts: 0 }
	];

	const groupLabels = Object.fromEntries(groupOptions.map((group) => [group.id, group.label]));
	const locationLabels = Object.fromEntries(
		locationOptions.map((location) => [location.id, location.label])
	);

	const devices: DeviceRow[] = [
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

	const alerts: AlertItem[] = [
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

	const profileMenuItems: CwProfileMenuItem[] = [
		{ id: 'profile', label: 'My Profile' },
		{ id: 'settings', label: 'Account Settings' },
		{ id: 'support', label: 'Support' },
		{ id: 'signout', label: 'Sign Out', separator: true, danger: true }
	];

	const pageSize = 5;

	let activeNav = $state<(typeof navItems)[number]['id']>('home');
	let activeCategory = $state<Category>('air');
	let selectedGroupId = $state('all-groups');
	let selectedLocationId = $state('all-locations');
	let globalSearch = $state('');
	let tableSearch = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let showVirtualOnly = $state(true);
	let lastRefresh = $state(new Date('2026-03-07T00:18:44'));

	function copySummary(source: ScopeSummary): ScopeSummary {
		return {
			devicesInView: source.devicesInView,
			fleetTotal: source.fleetTotal,
			online: source.online,
			offline: source.offline,
			alerts: source.alerts
		};
	}

	function createSummaryFromRows(rows: DeviceRow[]): ScopeSummary {
		const fleetTotal = rows.length;
		const offline = rows.filter((row) => row.status === 'offline').length;
		const alertsCount = rows.filter((row) => row.status === 'alert').length;
		const online = Math.max(0, fleetTotal - offline - alertsCount);

		return {
			devicesInView: fleetTotal,
			fleetTotal,
			online,
			offline,
			alerts: alertsCount
		};
	}

	function formatReading(value: number | null, unit: string): string {
		if (value === null) return '--';

		const decimals =
			unit === 'ppm' || unit === 'V' || unit === 'W'
				? 0
				: unit === 'A' || unit === 'L/min' || unit === '%'
					? 1
					: 2;

		return `${value.toFixed(decimals)} ${unit}`;
	}

	function statusToDot(status: DeviceStatus): CwStatusDotStatus {
		return status === 'alert' ? 'warning' : status;
	}

	function formatStatus(status: DeviceStatus): string {
		if (status === 'alert') return 'Alert';
		return status === 'online' ? 'Online' : 'Offline';
	}

	function matchesQuery(value: string, query: string): boolean {
		return value.toLowerCase().includes(query);
	}

	function toggleStatusFilter(next: DeviceStatus) {
		statusFilter = statusFilter === next ? 'all' : next;
	}

	function handleRefresh() {
		lastRefresh = new Date();
	}

	function clearTableFilters() {
		tableSearch = '';
		statusFilter = 'all';
		showVirtualOnly = true;
		sortDirection = 'asc';
	}

	const currentGroup = $derived(
		groupOptions.find((group) => group.id === selectedGroupId) ?? groupOptions[0]
	);

	const currentLocation = $derived(
		locationOptions.find((location) => location.id === selectedLocationId) ?? locationOptions[0]
	);

	const normalizedGlobalSearch = $derived(globalSearch.trim().toLowerCase());
	const normalizedTableSearch = $derived(tableSearch.trim().toLowerCase());
	const categoryDetails = $derived(categoryMeta[activeCategory]);

	const visibleGroups = $derived.by(() => {
		if (!normalizedGlobalSearch) return groupOptions;

		return groupOptions.filter((group) => {
			return (
				group.id === selectedGroupId ||
				matchesQuery(`${group.label} ${group.code}`, normalizedGlobalSearch)
			);
		});
	});

	const visibleLocations = $derived.by(() => {
		if (!normalizedGlobalSearch) return locationOptions;

		return locationOptions.filter((location) => {
			return (
				location.id === selectedLocationId ||
				matchesQuery(location.label, normalizedGlobalSearch)
			);
		});
	});

	const filteredDevices = $derived.by(() => {
		let rows = devices.filter((device) => device.category === activeCategory);

		if (selectedGroupId !== 'all-groups') {
			rows = rows.filter((device) => device.groupId === selectedGroupId);
		}

		if (selectedLocationId !== 'all-locations') {
			rows = rows.filter((device) => device.locationId === selectedLocationId);
		}

		if (showVirtualOnly) {
			rows = rows.filter((device) => device.virtual);
		}

		if (statusFilter !== 'all') {
			rows = rows.filter((device) => device.status === statusFilter);
		}

		if (normalizedGlobalSearch) {
			rows = rows.filter((device) => {
				return matchesQuery(
					[
						device.name,
						device.serial,
						device.facility,
						device.floor,
						groupLabels[device.groupId] ?? '',
						locationLabels[device.locationId] ?? ''
					].join(' '),
					normalizedGlobalSearch
				);
			});
		}

		if (normalizedTableSearch) {
			rows = rows.filter((device) => {
				return matchesQuery(
					[device.name, device.serial, device.facility, device.floor].join(' '),
					normalizedTableSearch
				);
			});
		}

		return [...rows].sort((left, right) => {
			return sortDirection === 'asc'
				? left.name.localeCompare(right.name, 'ja')
				: right.name.localeCompare(left.name, 'ja');
		});
	});

	const filtersActiveForCounts = $derived(
		normalizedGlobalSearch.length > 0 ||
			normalizedTableSearch.length > 0 ||
			statusFilter !== 'all' ||
			!showVirtualOnly
	);

	const scopeSummary = $derived.by(() => {
		if (filtersActiveForCounts) {
			return createSummaryFromRows(filteredDevices);
		}

		if (selectedLocationId !== 'all-locations') {
			return copySummary(currentLocation);
		}

		if (selectedGroupId !== 'all-groups') {
			return copySummary(currentGroup);
		}

		return copySummary(groupOptions[0]);
	});

	const visibleRows = $derived(filteredDevices.slice(0, pageSize));
	const tableTotal = $derived(filtersActiveForCounts ? filteredDevices.length : scopeSummary.devicesInView);
	const tableRangeStart = $derived(tableTotal === 0 ? 0 : 1);
	const tableRangeEnd = $derived(Math.min(pageSize, Math.max(visibleRows.length, 0)));
	const tablePageCount = $derived(Math.max(1, Math.ceil(Math.max(tableTotal, 1) / pageSize)));
	const scopeLabel = $derived.by(() => {
		if (selectedLocationId !== 'all-locations') return currentLocation.label;
		if (selectedGroupId !== 'all-groups') return currentGroup.label;
		return 'All locations';
	});

	const statusPills = $derived([
		{
			id: 'online' as const,
			label: 'Online',
			count: scopeSummary.online,
			toneClass: 'online'
		},
		{
			id: 'offline' as const,
			label: 'Offline',
			count: scopeSummary.offline,
			toneClass: 'offline'
		},
		{
			id: 'alert' as const,
			label: 'Alert',
			count: scopeSummary.alerts,
			toneClass: 'alert'
		}
	]);

	const topGroups = $derived.by(() => {
		return [...groupOptions]
			.filter((group) => group.id !== 'all-groups')
			.sort((left, right) => right.devicesInView - left.devicesInView)
			.slice(0, 4);
	});

	const topGroupMax = $derived(Math.max(...topGroups.map((group) => group.devicesInView), 1));

	const visibleAlerts = $derived.by(() => {
		return alerts
			.filter((alert) => {
				const device = devices.find((entry) => entry.id === alert.deviceId);
				if (!device) return false;

				if (device.category !== activeCategory) return false;
				if (selectedGroupId !== 'all-groups' && alert.groupId !== selectedGroupId) return false;
				if (selectedLocationId !== 'all-locations' && alert.locationId !== selectedLocationId) return false;

				if (normalizedGlobalSearch) {
					return matchesQuery(
						[
							alert.label,
							groupLabels[alert.groupId] ?? '',
							locationLabels[alert.locationId] ?? ''
						].join(' '),
						normalizedGlobalSearch
					);
				}

				return true;
			})
			.slice(0, 6);
	});

	const statusLegend = $derived([
		{
			label: 'Devices Online',
			value: scopeSummary.online,
			toneClass: 'online'
		},
		{
			label: 'Devices Offline',
			value: scopeSummary.offline,
			toneClass: 'offline'
		},
		{
			label: 'Active Alerts',
			value: scopeSummary.alerts,
			toneClass: 'alert'
		}
	]);

	const donutBackground = $derived.by(() => {
		const total = Math.max(scopeSummary.fleetTotal, 1);
		const segments = [
			{ value: scopeSummary.online, color: '#18d2aa' },
			{ value: scopeSummary.offline, color: '#ff5d6a' },
			{ value: scopeSummary.alerts, color: '#ffb41f' }
		];

		let cursor = 0;
		const stops = segments.map((segment) => {
			const start = cursor;
			cursor += (segment.value / total) * 360;
			return `${segment.color} ${start}deg ${cursor}deg`;
		});

		if (cursor < 360) {
			stops.push(`rgba(111, 134, 173, 0.3) ${cursor}deg 360deg`);
		}

		return `conic-gradient(${stops.join(', ')})`;
	});

	const lastRefreshLabel = $derived(
		lastRefresh.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<svelte:head>
	<title>CropWatch UI – Data Display</title>
</svelte:head>

<section class="data-display">
	{#snippet accountAvatar()}
		<span class="data-display__avatar-photo">KK</span>
	{/snippet}

	<div class="data-display__frame">
		<aside class="data-display__sidebar" aria-label="Scope filters">
			<div class="data-display__sidebar-section">
				<p class="data-display__sidebar-label">Global Search</p>
				<label class="data-display__search-shell">
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4" />
						<path d="M10.5 10.5L13.5 13.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
					</svg>
					<input
						bind:value={globalSearch}
						type="text"
						placeholder="Search group, location, device..."
						aria-label="Search group, location, or device"
					/>
				</label>
			</div>

			<div class="data-display__sidebar-section">
				<div class="data-display__sidebar-heading">Groups</div>
				<div class="data-display__filter-list">
					{#each visibleGroups as group (group.id)}
						<button
							type="button"
							class="data-display__filter-item"
							class:data-display__filter-item--active={selectedGroupId === group.id}
							onclick={() => {
								selectedGroupId = group.id;
							}}
						>
							<span class="data-display__filter-badge">{group.code}</span>
							<span class="data-display__filter-name">{group.label}</span>
							<span class="data-display__filter-count">{group.devicesInView}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="data-display__sidebar-section data-display__sidebar-section--grow">
				<div class="data-display__sidebar-heading">Locations</div>
				<div class="data-display__filter-list data-display__filter-list--locations">
					{#each visibleLocations as location (location.id)}
						<button
							type="button"
							class="data-display__filter-item data-display__filter-item--location"
							class:data-display__filter-item--active={selectedLocationId === location.id}
							onclick={() => {
								selectedLocationId = location.id;
							}}
						>
							<span class="data-display__location-pin" aria-hidden="true"></span>
							<span class="data-display__filter-name">{location.label}</span>
							<span class="data-display__filter-count">{location.devicesInView}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="data-display__scope-summary">
				<p class="data-display__scope-title">{scopeLabel}:</p>
				<div class="data-display__scope-metric">
					<span>Total in view</span>
					<strong>{scopeSummary.devicesInView}</strong>
				</div>
				<div class="data-display__scope-metric">
					<span>Alerts</span>
					<strong class="data-display__scope-metric--warning">{scopeSummary.alerts}</strong>
				</div>
				<div class="data-display__scope-metric">
					<span>Offline</span>
					<strong class="data-display__scope-metric--danger">{scopeSummary.offline}</strong>
				</div>
				<div class="data-display__scope-metric">
					<span>Last sync</span>
					<strong>{lastRefreshLabel}</strong>
				</div>
			</div>
		</aside>

		<div class="data-display__main">
			<header class="data-display__topbar">
				<div class="data-display__brand">
					<img src="/cropwatch_animated.svg" alt="" />
					<span>CropWatch</span>
				</div>

				<nav class="data-display__nav" aria-label="Dashboard navigation">
					{#each navItems as item (item.id)}
						<button
							type="button"
							class="data-display__nav-item"
							class:data-display__nav-item--active={activeNav === item.id}
							onclick={() => {
								activeNav = item.id;
							}}
						>
							<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d={item.icon}
									stroke="currentColor"
									stroke-width="1.35"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							<span>{item.label}</span>
						</button>
					{/each}
				</nav>

				<div class="data-display__topbar-actions">
					<CwProfileMenu
						class="data-display__profile"
						name="kevin@cropwatch.io"
						subtitle="Administrator"
						menuItems={profileMenuItems}
						avatar={accountAvatar}
					/>
				</div>
			</header>

			<div class="data-display__content">
				<div class="data-display__overview">
					<div>
						<p class="data-display__breadcrumb">Group / {currentGroup.label}</p>
						<div class="data-display__headline-metrics">
							<p><strong>{scopeSummary.devicesInView}</strong> devices in view</p>
							<p class="data-display__headline-metrics--warning">
								<strong>{scopeSummary.alerts}</strong> with active alerts
							</p>
							<p class="data-display__headline-metrics--danger">
								<strong>{scopeSummary.offline}</strong> offline
							</p>
						</div>
					</div>

					<div class="data-display__overview-controls">
						<div class="data-display__status-filters">
							{#each statusPills as pill (pill.id)}
								<button
									type="button"
									class="data-display__status-filter data-display__status-filter--{pill.toneClass}"
									class:data-display__status-filter--selected={statusFilter === pill.id}
									aria-pressed={statusFilter === pill.id}
									onclick={() => toggleStatusFilter(pill.id)}
								>
									<span class="data-display__status-filter-dot"></span>
									<span>{pill.label}</span>
									<strong>{pill.count}</strong>
								</button>
							{/each}
						</div>

						<div class="data-display__quick-actions">
							<CwButton
								class="data-display__refresh-btn"
								size="md"
								variant="secondary"
								onclick={handleRefresh}
							>
								<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M12.8 7.9A4.8 4.8 0 118 3.2c1.3 0 2.5.5 3.4 1.4"
										stroke="currentColor"
										stroke-width="1.4"
										stroke-linecap="round"
									/>
									<path
										d="M11.7 3.2h2.4v2.4"
										stroke="currentColor"
										stroke-width="1.4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								Refresh
							</CwButton>

							<button type="button" class="data-display__bell-btn" aria-label="Open alerts inbox">
								<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M5.2 12.3h5.6l-.5-1.4V7.5a2.8 2.8 0 10-5.6 0v3.4l-.5 1.4zM6.6 13.5a1.4 1.4 0 002.8 0"
										stroke="currentColor"
										stroke-width="1.35"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<span class="data-display__bell-count">10</span>
							</button>
						</div>
					</div>
				</div>

				<div class="data-display__category-bar">
					<div class="data-display__tabs" role="tablist" aria-label="Telemetry categories">
						{#each Object.entries(categoryMeta) as [id, meta]}
							<button
								type="button"
								role="tab"
								class="data-display__tab"
								class:data-display__tab--active={activeCategory === id}
								aria-selected={activeCategory === id}
								onclick={() => {
									activeCategory = id as Category;
								}}
							>
								<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d={meta.icon}
										stroke="currentColor"
										stroke-width="1.35"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								<span>{meta.label}</span>
							</button>
						{/each}
					</div>

					<p class="data-display__sync-copy">Virtual fleet view refreshed at {lastRefreshLabel}</p>
				</div>

				<section class="data-display__table-card" aria-label="Device table">
					<div class="data-display__table-toolbar">
						<label class="data-display__table-search">
							<span>Search</span>
							<input
								bind:value={tableSearch}
								type="text"
								placeholder="Search rows..."
								aria-label="Search table rows"
							/>
						</label>

						<div class="data-display__table-toolbar-actions">
							<button
								type="button"
								class="data-display__toolbar-chip"
								class:data-display__toolbar-chip--active={showVirtualOnly}
								aria-pressed={showVirtualOnly}
								onclick={() => {
									showVirtualOnly = !showVirtualOnly;
								}}
							>
								Virtual
							</button>
							<span class="data-display__toolbar-text">Page size</span>
							<button type="button" class="data-display__toolbar-chip">{pageSize}</button>
							<button
								type="button"
								class="data-display__toolbar-chip"
								onclick={() => {
									sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
								}}
							>
								name {sortDirection === 'asc' ? '↑' : '↓'}
							</button>
							<button
								type="button"
								class="data-display__toolbar-chip"
								onclick={clearTableFilters}
							>
								Clear
							</button>
							<span class="data-display__toolbar-text"
								>{tableRangeStart}–{tableRangeEnd} of {tableTotal}</span
							>
						</div>
					</div>

					<div class="data-display__table-scroll">
						<table class="data-display__table">
							<thead>
								<tr>
									<th>Device ↑</th>
									<th>{categoryDetails.columns[0]}</th>
									<th>{categoryDetails.columns[1]}</th>
									<th>{categoryDetails.columns[2]}</th>
									<th>Status ▼</th>
									<th>Last seen</th>
									<th>Facility / Location</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each visibleRows as device (device.id)}
									<tr>
										<td>
											<div class="data-display__device-cell">
												<strong>{device.name}</strong>
												<span>{device.serial}</span>
											</div>
										</td>
										<td>{formatReading(device.readings[0], device.units[0])}</td>
										<td>{formatReading(device.readings[1], device.units[1])}</td>
										<td>{formatReading(device.readings[2], device.units[2])}</td>
										<td>
											<span
												class="data-display__status-badge data-display__status-badge--{device.status}"
											>
												<CwStatusDot status={statusToDot(device.status)} size="sm" />
												{formatStatus(device.status)}
											</span>
										</td>
										<td>
											<div class="data-display__subtext-cell">
												<strong>{device.lastSeenMinutes}m</strong>
												<span>{device.seenAt}</span>
											</div>
										</td>
										<td>
											<div class="data-display__subtext-cell">
												<strong>{device.facility}</strong>
												<span>{device.floor}</span>
											</div>
										</td>
										<td class="data-display__action-cell">
											<CwButton class="data-display__view-btn" size="sm" variant="info">
												View
											</CwButton>
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan="8" class="data-display__empty-state">
											No devices match this combination of filters.
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="data-display__table-footer">
						<div class="data-display__pager">
							<button type="button" disabled>Prev</button>
							<span>Page 1 of {tablePageCount}</span>
							<button type="button" disabled>Next</button>
						</div>
						<p>Virtualized list • {tableTotal} rows</p>
					</div>
				</section>

				<section class="data-display__analytics" aria-label="Alert analytics">
					<div class="data-display__analytics-header">
						<div class="data-display__analytics-title">
							<span class="data-display__analytics-handle"></span>
							<span>Alerts</span>
						</div>
						<button type="button" class="data-display__analytics-toggle" aria-label="Collapse alerts section">
							⌄
						</button>
					</div>

					<div class="data-display__analytics-grid">
						<article class="data-display__analytics-card">
							<div class="data-display__analytics-card-head">
								<span>Status mix</span>
								<strong>Total {scopeSummary.fleetTotal}</strong>
							</div>

							<div class="data-display__status-mix">
								<div class="data-display__donut" style:background={donutBackground}>
									<div class="data-display__donut-inner">
										<strong>{scopeSummary.fleetTotal}</strong>
										<span>Devices</span>
									</div>
								</div>

								<div class="data-display__legend">
									{#each statusLegend as item (item.label)}
										<div class="data-display__legend-row">
											<span class="data-display__legend-label">
												<span class="data-display__legend-dot data-display__legend-dot--{item.toneClass}"></span>
												{item.label}
											</span>
											<span>{item.value}</span>
										</div>
									{/each}
								</div>
							</div>
						</article>

						<article class="data-display__analytics-card">
							<div class="data-display__analytics-card-head">
								<span>Top groups</span>
								<strong>In view</strong>
							</div>

							<div class="data-display__group-bars">
								{#each topGroups as group (group.id)}
									<div class="data-display__group-bar">
										<div class="data-display__group-bar-meta">
											<span>{group.label}</span>
											<strong>{group.devicesInView}</strong>
										</div>
										<div class="data-display__group-bar-track">
											<span
												class:data-display__group-bar-fill--active={group.id === selectedGroupId}
												style:width={`${(group.devicesInView / topGroupMax) * 100}%`}
											></span>
										</div>
									</div>
								{/each}
							</div>
						</article>

						<article class="data-display__analytics-card">
							<div class="data-display__analytics-card-head">
								<span>Active Alert List</span>
								<strong>Reported Time</strong>
							</div>

							<div class="data-display__alert-list">
								{#each visibleAlerts as alert (alert.id)}
									<div class="data-display__alert-row">
										<div class="data-display__alert-text">
											<span
												class="data-display__alert-icon data-display__alert-icon--{alert.severity}"
												aria-hidden="true"
											></span>
											<span>{alert.label}</span>
										</div>
										<span class="data-display__alert-time">{alert.reportedAt}</span>
									</div>
								{:else}
									<p class="data-display__alert-empty">No active alerts in this scope.</p>
								{/each}
							</div>
						</article>
					</div>
				</section>
			</div>
		</div>
	</div>
</section>

<style>
	.data-display {
		min-height: calc(100dvh - 10rem);
		border-radius: calc(var(--cw-radius-2xl) + 0.25rem);
		border: 1px solid color-mix(in srgb, #21427d 32%, transparent);
		overflow: hidden;
		background:
			radial-gradient(90% 120% at 0% 0%, rgba(24, 79, 173, 0.16), transparent 48%),
			radial-gradient(60% 80% at 100% 0%, rgba(0, 179, 255, 0.12), transparent 40%),
			linear-gradient(180deg, #040b1c 0%, #020816 100%);
		box-shadow:
			0 24px 60px rgba(0, 0, 0, 0.36),
			inset 0 1px 0 rgba(148, 194, 255, 0.08);
	}

	.data-display__frame {
		display: grid;
		grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
		min-height: inherit;
	}

	.data-display__sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1.6rem 1rem 0.9rem;
		background:
			linear-gradient(180deg, rgba(18, 31, 58, 0.96) 0%, rgba(9, 20, 41, 0.98) 100%);
		border-right: 1px solid rgba(77, 112, 167, 0.22);
	}

	.data-display__sidebar-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.data-display__sidebar-section--grow {
		min-height: 0;
		flex: 1;
	}

	.data-display__sidebar-label,
	.data-display__sidebar-heading {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #89a6d7;
	}

	.data-display__search-shell {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.75rem 0.85rem;
		border-radius: 1rem;
		border: 1px solid rgba(84, 116, 168, 0.32);
		background: rgba(19, 33, 60, 0.88);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	.data-display__search-shell svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: #8aa7d6;
	}

	.data-display__search-shell input,
	.data-display__table-search input {
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
		color: #edf5ff;
		font: inherit;
	}

	.data-display__search-shell input::placeholder,
	.data-display__table-search input::placeholder {
		color: #6f86ad;
	}

	.data-display__filter-list {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.data-display__filter-list--locations {
		overflow: auto;
		padding-right: 0.2rem;
	}

	.data-display__filter-item {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.65rem;
		padding: 0.65rem 0.7rem;
		border: 1px solid transparent;
		border-radius: 0.8rem;
		background: transparent;
		color: #cedbf5;
		cursor: pointer;
		text-align: left;
		transition:
			background-color 160ms ease,
			border-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.data-display__filter-item:hover {
		background: rgba(53, 78, 122, 0.26);
		color: #f4f8ff;
	}

	.data-display__filter-item--active {
		background: linear-gradient(180deg, rgba(54, 79, 123, 0.7) 0%, rgba(35, 57, 95, 0.84) 100%);
		border-color: rgba(105, 148, 217, 0.38);
		color: #ffffff;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}

	.data-display__filter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		padding: 0.18rem 0.38rem;
		border-radius: 0.55rem;
		border: 1px solid rgba(116, 150, 205, 0.3);
		background: rgba(14, 28, 51, 0.72);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #dce9ff;
	}

	.data-display__location-pin {
		width: 0.72rem;
		height: 0.72rem;
		border-radius: 999px 999px 999px 0;
		border: 1.5px solid #9bb2dd;
		transform: rotate(-45deg);
		position: relative;
	}

	.data-display__location-pin::after {
		content: '';
		position: absolute;
		inset: 0.16rem;
		border-radius: 999px;
		background: #9bb2dd;
	}

	.data-display__filter-name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.94rem;
	}

	.data-display__filter-count {
		font-size: 0.78rem;
		font-weight: 600;
		color: #90abd6;
	}

	.data-display__scope-summary {
		display: grid;
		gap: 0.45rem;
		padding: 1rem 0.2rem 0.4rem;
		border-top: 1px solid rgba(94, 124, 173, 0.22);
	}

	.data-display__scope-title {
		font-size: 0.8rem;
		color: #86a4d7;
	}

	.data-display__scope-metric {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.82rem;
		color: #91a8cf;
	}

	.data-display__scope-metric strong {
		color: #eef5ff;
	}

	.data-display__scope-metric--warning {
		color: #ffcc4d !important;
	}

	.data-display__scope-metric--danger {
		color: #ff7b8b !important;
	}

	.data-display__main {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.data-display__topbar {
		display: flex;
		align-items: center;
		gap: 1.4rem;
		padding: 0.9rem 1.45rem;
		border-bottom: 1px solid rgba(77, 112, 167, 0.18);
		background: linear-gradient(180deg, rgba(2, 9, 24, 0.92) 0%, rgba(2, 8, 22, 0.78) 100%);
	}

	.data-display__brand {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: #ffffff;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.data-display__brand img {
		width: 1.75rem;
		height: 1.75rem;
	}

	.data-display__nav {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
	}

	.data-display__nav-item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.72rem 0.95rem;
		border-radius: 0.9rem;
		border: 1px solid transparent;
		background: transparent;
		color: #a3badf;
		font-size: 0.94rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.data-display__nav-item svg {
		width: 0.95rem;
		height: 0.95rem;
	}

	.data-display__nav-item--active {
		background: linear-gradient(180deg, rgba(4, 74, 146, 0.44) 0%, rgba(6, 46, 104, 0.44) 100%);
		border-color: rgba(58, 126, 214, 0.4);
		color: #e7f2ff;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.data-display__topbar-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.data-display__content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 1.45rem 1.45rem;
	}

	.data-display__overview {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.data-display__breadcrumb {
		font-size: 0.78rem;
		color: #7f97be;
	}

	.data-display__headline-metrics {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 0.65rem;
		font-size: 0.95rem;
		color: #cfe0ff;
	}

	.data-display__headline-metrics p {
		margin: 0;
	}

	.data-display__headline-metrics strong {
		color: #ffffff;
		font-size: 1.02rem;
	}

	.data-display__headline-metrics--warning strong {
		color: #ffcf52;
	}

	.data-display__headline-metrics--danger strong {
		color: #ff7f92;
	}

	.data-display__overview-controls {
		display: grid;
		gap: 0.8rem;
		justify-items: end;
	}

	.data-display__status-filters,
	.data-display__quick-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		justify-content: flex-end;
	}

	.data-display__status-filter {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.4rem 0.7rem;
		border-radius: 999px;
		border: 1px solid rgba(88, 116, 165, 0.26);
		background: rgba(7, 18, 38, 0.72);
		color: #d8e6ff;
		font-size: 0.82rem;
		cursor: pointer;
	}

	.data-display__status-filter strong {
		font-size: 0.8rem;
		font-weight: 700;
	}

	.data-display__status-filter--selected {
		border-color: rgba(107, 166, 242, 0.54);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.data-display__status-filter-dot,
	.data-display__legend-dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
	}

	.data-display__status-filter--online .data-display__status-filter-dot,
	.data-display__legend-dot--online {
		background: #18d2aa;
	}

	.data-display__status-filter--offline .data-display__status-filter-dot,
	.data-display__legend-dot--offline {
		background: #ff5d6a;
	}

	.data-display__status-filter--alert .data-display__status-filter-dot,
	.data-display__legend-dot--alert {
		background: #ffb41f;
	}

	.data-display__category-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.data-display__tabs {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.35rem;
		border-radius: 1rem;
		border: 1px solid rgba(92, 122, 174, 0.24);
		background: rgba(10, 20, 40, 0.76);
	}

	.data-display__tab {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.62rem 0.88rem;
		border-radius: 0.8rem;
		border: 1px solid transparent;
		background: transparent;
		color: #9ab1d8;
		font-size: 0.98rem;
		cursor: pointer;
	}

	.data-display__tab svg {
		width: 1rem;
		height: 1rem;
	}

	.data-display__tab--active {
		background: linear-gradient(180deg, rgba(47, 70, 110, 0.92) 0%, rgba(23, 41, 72, 0.96) 100%);
		border-color: rgba(97, 142, 209, 0.38);
		color: #ffffff;
	}

	.data-display__sync-copy {
		margin: 0;
		font-size: 0.82rem;
		color: #7f97be;
	}

	.data-display__table-card,
	.data-display__analytics {
		border-radius: 1.35rem;
		border: 1px solid rgba(76, 111, 165, 0.18);
		background: linear-gradient(180deg, rgba(7, 18, 39, 0.94) 0%, rgba(5, 13, 31, 0.98) 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	.data-display__table-toolbar,
	.data-display__analytics-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.95rem 1rem;
		border-bottom: 1px solid rgba(70, 104, 154, 0.18);
	}

	.data-display__table-search {
		display: grid;
		grid-template-columns: auto minmax(12rem, 16rem);
		align-items: center;
		gap: 0.8rem;
		color: #90aad4;
		font-size: 0.85rem;
	}

	.data-display__table-search input {
		padding: 0.75rem 0.9rem;
		border-radius: 0.85rem;
		border: 1px solid rgba(86, 118, 172, 0.3);
		background: rgba(17, 31, 56, 0.86);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	}

	.data-display__table-toolbar-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.data-display__toolbar-chip {
		padding: 0.45rem 0.7rem;
		border-radius: 0.7rem;
		border: 1px solid rgba(86, 118, 172, 0.28);
		background: rgba(11, 21, 42, 0.86);
		color: #d7e6ff;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.data-display__toolbar-chip--active {
		background: rgba(0, 163, 255, 0.14);
		border-color: rgba(0, 163, 255, 0.46);
		color: #e8f4ff;
	}

	.data-display__toolbar-text {
		font-size: 0.82rem;
		color: #8ea8d2;
	}

	.data-display__table-scroll {
		overflow-x: auto;
	}

	.data-display__table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-display__table th,
	.data-display__table td {
		padding: 0.88rem 1rem;
		text-align: left;
	}

	.data-display__table thead th {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #becde9;
		background: rgba(18, 34, 63, 0.6);
		white-space: nowrap;
	}

	.data-display__table tbody tr {
		border-top: 1px solid rgba(70, 104, 154, 0.14);
		background: rgba(10, 21, 43, 0.76);
	}

	.data-display__table tbody tr:nth-child(even) {
		background: rgba(16, 29, 54, 0.8);
	}

	.data-display__table tbody tr:hover {
		background: rgba(24, 40, 74, 0.92);
	}

	.data-display__table tbody td {
		font-size: 0.95rem;
		color: #f2f7ff;
		white-space: nowrap;
	}

	.data-display__device-cell,
	.data-display__subtext-cell {
		display: grid;
		gap: 0.18rem;
	}

	.data-display__device-cell strong,
	.data-display__subtext-cell strong {
		font-size: 0.95rem;
		font-weight: 700;
		color: #ffffff;
	}

	.data-display__device-cell span,
	.data-display__subtext-cell span {
		font-size: 0.78rem;
		color: #90aad4;
	}

	.data-display__status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.3rem 0.65rem;
		border-radius: 999px;
		border: 1px solid rgba(78, 115, 168, 0.24);
		font-size: 0.78rem;
		font-weight: 600;
	}

	.data-display__status-badge--online {
		background: rgba(26, 185, 138, 0.16);
		color: #bbf4e3;
	}

	.data-display__status-badge--offline {
		background: rgba(255, 90, 108, 0.14);
		color: #ffd1d9;
	}

	.data-display__status-badge--alert {
		background: rgba(255, 180, 31, 0.16);
		color: #ffe3a4;
	}

	.data-display__action-cell {
		text-align: right;
	}

	.data-display__empty-state {
		text-align: center;
		color: #8ea8d2;
		padding: 2rem 1rem !important;
	}

	.data-display__table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem 1rem;
		border-top: 1px solid rgba(70, 104, 154, 0.18);
		color: #89a4ce;
		font-size: 0.78rem;
	}

	.data-display__pager {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}

	.data-display__pager button {
		padding: 0.45rem 0.7rem;
		border-radius: 0.7rem;
		border: 1px solid rgba(86, 118, 172, 0.28);
		background: rgba(11, 21, 42, 0.86);
		color: #d7e6ff;
		font-size: 0.8rem;
	}

	.data-display__pager button:disabled {
		opacity: 0.45;
	}

	.data-display__analytics-header {
		padding-bottom: 0.85rem;
	}

	.data-display__analytics-title {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.88rem;
		color: #c8d8f6;
	}

	.data-display__analytics-handle {
		width: 1.7rem;
		height: 0.12rem;
		border-radius: 999px;
		background: rgba(122, 155, 211, 0.6);
	}

	.data-display__analytics-toggle {
		border: none;
		background: transparent;
		color: #92add8;
		font-size: 1rem;
		cursor: pointer;
	}

	.data-display__analytics-grid {
		display: grid;
		grid-template-columns: 1.05fr 1fr 1.1fr;
		gap: 0;
	}

	.data-display__analytics-card {
		padding: 1.1rem 1rem 1.2rem;
	}

	.data-display__analytics-card + .data-display__analytics-card {
		border-left: 1px solid rgba(70, 104, 154, 0.18);
	}

	.data-display__analytics-card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1rem;
		font-size: 0.82rem;
		color: #8fa9d3;
	}

	.data-display__analytics-card-head strong {
		font-size: 0.84rem;
		color: #e9f2ff;
	}

	.data-display__status-mix {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 1rem;
	}

	.data-display__donut {
		position: relative;
		width: 11rem;
		aspect-ratio: 1;
		border-radius: 50%;
	}

	.data-display__donut::after {
		content: '';
		position: absolute;
		inset: 1.6rem;
		border-radius: 50%;
		background: linear-gradient(180deg, rgba(7, 18, 39, 1) 0%, rgba(4, 11, 27, 1) 100%);
		box-shadow: inset 0 0 0 1px rgba(84, 118, 170, 0.14);
	}

	.data-display__donut-inner {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		text-align: center;
		z-index: 1;
	}

	.data-display__donut-inner strong {
		font-size: 2rem;
		line-height: 1;
		color: #ffffff;
	}

	.data-display__donut-inner span {
		margin-top: 0.25rem;
		font-size: 0.82rem;
		color: #8ea8d2;
	}

	.data-display__legend {
		display: grid;
		gap: 0.85rem;
	}

	.data-display__legend-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.88rem;
		color: #dce9ff;
	}

	.data-display__legend-label {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: #b9cae8;
	}

	.data-display__group-bars {
		display: grid;
		gap: 0.9rem;
	}

	.data-display__group-bar {
		display: grid;
		gap: 0.45rem;
	}

	.data-display__group-bar-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.88rem;
		color: #dce9ff;
	}

	.data-display__group-bar-track {
		height: 0.48rem;
		border-radius: 999px;
		background: rgba(21, 35, 62, 0.94);
		overflow: hidden;
	}

	.data-display__group-bar-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #00d5bf 0%, #21c9ff 100%);
	}

	.data-display__group-bar-fill--active {
		filter: brightness(1.18);
	}

	.data-display__alert-list {
		display: grid;
		gap: 0.8rem;
	}

	.data-display__alert-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.88rem;
		color: #e7f1ff;
	}

	.data-display__alert-text {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		min-width: 0;
	}

	.data-display__alert-text span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.data-display__alert-icon {
		width: 0.9rem;
		height: 0.9rem;
		flex-shrink: 0;
		clip-path: polygon(50% 4%, 96% 88%, 4% 88%);
	}

	.data-display__alert-icon--warning {
		background: #ffb41f;
	}

	.data-display__alert-icon--critical {
		background: #ff4c5f;
	}

	.data-display__alert-time {
		flex-shrink: 0;
		color: #9ab2da;
		font-size: 0.82rem;
	}

	.data-display__alert-empty {
		margin: 0;
		font-size: 0.84rem;
		color: #8ea8d2;
	}

	.data-display__avatar-photo {
		display: grid;
		place-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, #ffcc95 0%, #ce8a58 100%);
		color: #2c1b07;
		font-size: 0.78rem;
		font-weight: 800;
	}

	.data-display__bell-btn {
		position: relative;
		display: inline-grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 0.9rem;
		border: 1px solid rgba(94, 124, 173, 0.34);
		background: linear-gradient(180deg, rgba(47, 70, 110, 0.92) 0%, rgba(27, 43, 72, 0.98) 100%);
		color: #f3f8ff;
		cursor: pointer;
	}

	.data-display__bell-btn svg {
		width: 1rem;
		height: 1rem;
	}

	.data-display__bell-count {
		position: absolute;
		right: -0.2rem;
		bottom: -0.2rem;
		display: grid;
		place-items: center;
		min-width: 1.2rem;
		height: 1.2rem;
		padding: 0 0.25rem;
		border-radius: 999px;
		background: #ff394a;
		color: #ffffff;
		font-size: 0.7rem;
		font-weight: 700;
		box-shadow: 0 0 0 2px #071427;
	}

	:global(.data-display__refresh-btn) {
		border-radius: 0.95rem;
	}

	:global(.data-display__refresh-btn .cw-button__label svg) {
		width: 1rem;
		height: 1rem;
	}

	:global(.data-display__view-btn) {
		border-radius: 0.7rem;
		min-height: 1.7rem;
		padding-inline: 0.85rem;
	}

	:global(.data-display__profile .cw-profile-menu__trigger) {
		min-width: 15rem;
		border-radius: 1rem;
	}

	:global(.data-display__profile .cw-profile-menu__avatar) {
		width: 2.25rem;
		height: 2.25rem;
	}

	:global(.data-display__profile .cw-profile-menu__name) {
		font-size: 0.82rem;
	}

	:global(.data-display__profile .cw-profile-menu__subtitle) {
		font-size: 0.75rem;
	}

	.data-display__search-shell input:focus-visible,
	.data-display__table-search input:focus-visible,
	.data-display__filter-item:focus-visible,
	.data-display__nav-item:focus-visible,
	.data-display__status-filter:focus-visible,
	.data-display__tab:focus-visible,
	.data-display__toolbar-chip:focus-visible,
	.data-display__bell-btn:focus-visible,
	.data-display__pager button:focus-visible {
		outline: 2px solid rgba(87, 151, 240, 0.72);
		outline-offset: 2px;
	}

	.data-display__filter-list--locations::-webkit-scrollbar,
	.data-display__nav::-webkit-scrollbar,
	.data-display__table-scroll::-webkit-scrollbar {
		height: 0.4rem;
		width: 0.4rem;
	}

	.data-display__filter-list--locations::-webkit-scrollbar-thumb,
	.data-display__nav::-webkit-scrollbar-thumb,
	.data-display__table-scroll::-webkit-scrollbar-thumb {
		background: rgba(83, 116, 170, 0.5);
		border-radius: 999px;
	}

	@media (max-width: 1100px) {
		.data-display__frame {
			grid-template-columns: 1fr;
		}

		.data-display__sidebar {
			border-right: none;
			border-bottom: 1px solid rgba(77, 112, 167, 0.22);
		}

		.data-display__filter-list--locations {
			max-height: none;
			overflow: visible;
		}

		.data-display__analytics-grid {
			grid-template-columns: 1fr;
		}

		.data-display__analytics-card + .data-display__analytics-card {
			border-left: none;
			border-top: 1px solid rgba(70, 104, 154, 0.18);
		}
	}

	@media (max-width: 820px) {
		.data-display__topbar,
		.data-display__content,
		.data-display__table-toolbar,
		.data-display__analytics-header {
			padding-inline: 0.95rem;
		}

		.data-display__overview,
		.data-display__category-bar,
		.data-display__status-mix {
			grid-template-columns: 1fr;
			display: grid;
		}

		.data-display__overview-controls,
		.data-display__quick-actions,
		.data-display__status-filters,
		.data-display__table-toolbar-actions {
			justify-content: flex-start;
		}

		.data-display__table-search {
			grid-template-columns: 1fr;
		}

		.data-display__table-toolbar {
			align-items: stretch;
		}

		.data-display__table-toolbar,
		.data-display__table-footer,
		.data-display__topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.data-display__topbar-actions {
			justify-content: flex-start;
		}

		.data-display__donut {
			width: min(14rem, 80vw);
		}
	}
</style>
