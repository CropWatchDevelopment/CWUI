import type { CwCardDataRowItemData, CwSensorCardDevice } from '../types/index.js';
import { resolveCwExpireAfterMinutes, resolveCwLastSeenAt } from '../utils/cwTimeout.js';
import { formatCwNumber } from '../utils/cwFormat.js';

/** Labels used for inferred detail rows. */
export interface CwSensorCardRowLabels {
	temperature?: string;
	humidity?: string;
	level?: string;
	primaryReading?: string;
	secondaryReading?: string;
	lastUpdate?: string;
}

const DEFAULT_ROW_LABELS: Required<CwSensorCardRowLabels> = {
	temperature: 'Temperature',
	humidity: 'Humidity',
	level: 'Level',
	primaryReading: 'Primary Reading',
	secondaryReading: 'Secondary Reading',
	lastUpdate: 'Last Update'
};

type SensorReadingRole = 'primary' | 'secondary';

function isTemperatureUnit(unit?: string): boolean {
	return unit?.includes('°') || unit === 'C' || unit === 'F' || unit === 'K';
}

export function getCwSensorReadingIcon(
	role: SensorReadingRole,
	device: CwSensorCardDevice
): CwCardDataRowItemData['icon'] {
	const icon = role === 'primary' ? device.primary_icon : device.secondary_icon;
	if (icon) return icon;

	const unit = role === 'primary' ? device.primaryUnit : device.secondaryUnit;
	if (isTemperatureUnit(unit)) return 'thermo';
	if (role === 'secondary' && unit === '%') return 'drop';

	return undefined;
}

function inferReadingLabel(
	role: SensorReadingRole,
	device: CwSensorCardDevice,
	l: Required<CwSensorCardRowLabels>
): string {
	const icon = getCwSensorReadingIcon(role, device);
	const unit = role === 'primary' ? device.primaryUnit : device.secondaryUnit;

	if (icon === 'thermo' || isTemperatureUnit(unit)) {
		return l.temperature;
	}

	if (icon === 'drop') {
		return role === 'primary' ? l.level : l.humidity;
	}

	if (role === 'secondary' && unit === '%') {
		return l.humidity;
	}

	if (role === 'primary' && unit === '%') {
		return l.level;
	}

	return role === 'primary' ? l.primaryReading : l.secondaryReading;
}

/** Sensor readings use a fixed two decimals so values don't jitter as they update. */
export function formatCwSensorValue(value: number | null | undefined): string {
	return formatCwNumber(value, { decimals: 2, locale: 'en-US' });
}

export function buildCwSensorCardDetailRows(
	device: CwSensorCardDevice,
	labels: CwSensorCardRowLabels = {}
): CwCardDataRowItemData[] {
	const l = { ...DEFAULT_ROW_LABELS, ...labels };
	const rows: CwCardDataRowItemData[] = [];
	const lastSeenAt = resolveCwLastSeenAt(
		device.lastSeenAt,
		device.lastSeen,
		device.LastSeen,
		device.lastUpdated
	);
	const expireAfterMinutes = resolveCwExpireAfterMinutes(
		device.expireAfterMinutes,
		device.alarmTimeoutMinutes,
		device.AlarmTimeoutMinutes,
		device.expectedUpdateAfterMinutes
	);

	rows.push({
		id: `${device.label}-primary`,
		label: inferReadingLabel('primary', device, l),
		value: device.primaryLabel ?? formatCwSensorValue(device.primaryValue),
		unit: device.primaryUnit ?? '°C',
		icon: getCwSensorReadingIcon('primary', device)
	});

	if (device.secondaryValue != null || device.secondaryLabel != null) {
		rows.push({
			id: `${device.label}-secondary`,
			label: inferReadingLabel('secondary', device, l),
			value: device.secondaryLabel ?? formatCwSensorValue(device.secondaryValue),
			unit: device.secondaryUnit ?? '%',
			icon: getCwSensorReadingIcon('secondary', device)
		});
	}

	if (lastSeenAt != null) {
		rows.push({
			id: `${device.label}-updated`,
			label: l.lastUpdate,
			icon: 'timer',
			lastSeenAt,
			expireAfterMinutes
		});
	}

	return rows;
}
