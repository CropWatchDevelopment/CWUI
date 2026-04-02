import type { CwViewSize } from "../types/index.js";

export const CW_VIEW_SIZE_BREAKPOINTS = {
	phoneMax: 640,
	tabletMax: 1024,
} as const;

export function getCwViewSize(width: number): CwViewSize {
	if (!Number.isFinite(width) || width <= 0) {
		return "desktop";
	}

	if (width <= CW_VIEW_SIZE_BREAKPOINTS.phoneMax) {
		return "phone";
	}

	if (width <= CW_VIEW_SIZE_BREAKPOINTS.tabletMax) {
		return "tablet";
	}

	return "desktop";
}

export function isCwPhoneView(width: number): boolean {
	return getCwViewSize(width) === "phone";
}

export function isCwTabletView(width: number): boolean {
	return getCwViewSize(width) === "tablet";
}

export function isCwDesktopView(width: number): boolean {
	return getCwViewSize(width) === "desktop";
}
