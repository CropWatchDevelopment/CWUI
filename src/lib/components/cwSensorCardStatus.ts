import type { CwStatusDotStatus, CwTone } from '../types/index.js';

export function aggregateCwSensorStatuses(
	statuses: Array<CwStatusDotStatus | undefined>,
	fallback: CwStatusDotStatus = 'loading'
): CwStatusDotStatus {
	const resolvedStatuses = statuses.filter(
		(status): status is CwStatusDotStatus => status != null
	);

	if (resolvedStatuses.length === 0) {
		return fallback;
	}

	const allOnline = resolvedStatuses.every((status) => status === 'online');
	if (allOnline) {
		return 'online';
	}

	const allOffline = resolvedStatuses.every((status) => status === 'offline');
	if (allOffline) {
		return 'offline';
	}

	const allLoading = resolvedStatuses.every((status) => status === 'loading');
	if (allLoading) {
		return 'loading';
	}

	const hasOnline = resolvedStatuses.some((status) => status === 'online');
	const hasOffline = resolvedStatuses.some((status) => status === 'offline');
	if (hasOnline && hasOffline) {
		return 'warning';
	}

	return 'warning';
}

export function getCwSensorTone(status: CwStatusDotStatus): CwTone {
	if (status === 'online') return 'success';
	if (status === 'offline') return 'danger';
	if (status === 'loading') return 'info';
	return 'warning';
}

export function getCwSensorStatusLabel(status: CwStatusDotStatus): string {
	if (status === 'online') return 'Online';
	if (status === 'offline') return 'Offline';
	if (status === 'warning') return 'Warning';
	return 'Loading';
}
