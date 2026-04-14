import type { CwCardDataRowItemData, CwSensorCardDevice } from '../types/index.js';
import { resolveCwExpireAfterMinutes, resolveCwLastSeenAt } from '../utils/cwTimeout.js';

const sensorValueFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

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

function inferReadingLabel(role: SensorReadingRole, device: CwSensorCardDevice): string {
	const icon = getCwSensorReadingIcon(role, device);
	const unit = role === 'primary' ? device.primaryUnit : device.secondaryUnit;

	if (icon === 'thermo' || isTemperatureUnit(unit)) {
		return 'Temperature';
	}

	if (icon === 'drop') {
		return role === 'primary' ? 'Level' : 'Humidity';
	}

	if (role === 'secondary' && unit === '%') {
		return 'Humidity';
	}

	if (role === 'primary' && unit === '%') {
		return 'Level';
	}

	return role === 'primary' ? 'Primary Reading' : 'Secondary Reading';
}

export function formatCwSensorValue(value: number): string {
	return sensorValueFormatter.format(value);
}

export function buildCwSensorCardDetailRows(device: CwSensorCardDevice): CwCardDataRowItemData[] {
	const rows: CwCardDataRowItemData[] = [];
	const lastSeenAt = resolveCwLastSeenAt(device.lastSeenAt, device.lastUpdated);
	const expireAfterMinutes = resolveCwExpireAfterMinutes(
		device.expireAfterMinutes,
		device.expectedUpdateAfterMinutes
	);

	rows.push({
		id: `${device.label}-primary`,
		label: inferReadingLabel('primary', device),
		value: formatCwSensorValue(device.primaryValue),
		unit: device.primaryUnit ?? '°C',
		icon: getCwSensorReadingIcon('primary', device)
	});

	if (device.secondaryValue != null) {
		rows.push({
			id: `${device.label}-secondary`,
			label: inferReadingLabel('secondary', device),
			value: formatCwSensorValue(device.secondaryValue),
			unit: device.secondaryUnit ?? '%',
			icon: getCwSensorReadingIcon('secondary', device)
		});
	}

	if (lastSeenAt != null) {
		rows.push({
			id: `${device.label}-updated`,
			label: 'Last Update',
			icon: 'timer',
			lastSeenAt,
			expireAfterMinutes
		});
	}

	return rows;
}
