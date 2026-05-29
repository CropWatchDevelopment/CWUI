import type { CwNoDataMessage } from '../types/index.js';

export const CW_DEFAULT_NO_DATA_MESSAGE = 'No Data Available';

export function hasCwNoData(noData: CwNoDataMessage | undefined): boolean {
	return noData !== undefined && noData !== false;
}

export function getCwNoDataMessage(noData: CwNoDataMessage | undefined): string {
	if (typeof noData === 'string') {
		const trimmed = noData.trim();
		return trimmed.length > 0 ? trimmed : CW_DEFAULT_NO_DATA_MESSAGE;
	}

	return CW_DEFAULT_NO_DATA_MESSAGE;
}
