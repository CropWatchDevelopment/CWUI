import type { CwStatusDotStatus, CwTone } from '../types/index.js';

/** Display labels for each sensor status. */
export interface CwSensorStatusLabels {
	online?: string;
	offline?: string;
	warning?: string;
	loading?: string;
}

const DEFAULT_STATUS_LABELS: Required<CwSensorStatusLabels> = {
	online: 'Online',
	offline: 'Offline',
	warning: 'Warning',
	loading: 'Loading'
};

/**
 * Rolls several sensor statuses up into one location status.
 *
 * - Every sensor offline → `offline`.
 * - Any sensor offline or warning (but not all offline) → `warning`
 *   (a partial outage needs attention, but the location is still reporting).
 * - Otherwise any sensor still loading → `loading`.
 * - Otherwise → `online`.
 */
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

	if (resolvedStatuses.every((status) => status === 'offline')) {
		return 'offline';
	}

	if (resolvedStatuses.some((status) => status === 'offline' || status === 'warning')) {
		return 'warning';
	}

	if (resolvedStatuses.some((status) => status === 'loading')) {
		return 'loading';
	}

	return 'online';
}

/**
 * Canonical status → chip tone mapping. Offline is a real alert in CropWatch,
 * so it shares the danger tone. Loading uses the neutral `secondary` tone so a
 * chip never competes with the (purple) loading status dot beside it.
 */
export function getCwSensorTone(status: CwStatusDotStatus): CwTone {
	if (status === 'online') return 'success';
	if (status === 'offline') return 'danger';
	if (status === 'loading') return 'secondary';
	return 'warning';
}

/** CSS colour (a `--cw-status-*` token) for rails, markers and dots. */
export function getCwStatusColor(status: CwStatusDotStatus | undefined): string {
	if (status === 'online') return 'var(--cw-status-online)';
	if (status === 'offline') return 'var(--cw-status-offline)';
	if (status === 'warning') return 'var(--cw-status-warning)';
	if (status === 'loading') return 'var(--cw-status-loading)';
	return 'var(--cw-border-default)';
}

export function getCwSensorStatusLabel(
	status: CwStatusDotStatus,
	labels: CwSensorStatusLabels = {}
): string {
	return labels[status] ?? DEFAULT_STATUS_LABELS[status] ?? DEFAULT_STATUS_LABELS.loading;
}
