/* ============================================================
   CropWatch UI — Toast Context (Svelte 5 runes-based)
   ============================================================ */

import type { CwTone, CwToastItem } from '../types/index.js';
import { getContext, setContext } from 'svelte';

const TOAST_KEY = Symbol('cw-toast');

export interface CwToastApi {
	add(opts: {
		tone?: CwTone;
		message: string;
		duration?: number;
		dismissible?: boolean;
	}): string;
	dismiss(id: string): void;
	readonly items: CwToastItem[];
}

/**
 * Creates the toast context. Call once in a layout/root component.
 * Returns the API for adding / dismissing toasts.
 */
export function createCwToastContext(maxItems = 5): CwToastApi {
	let items = $state<CwToastItem[]>([]);
	let counter = 0;

	function add(opts: {
		tone?: CwTone;
		message: string;
		duration?: number;
		dismissible?: boolean;
	}): string {
		const id = `cw-toast-${++counter}`;
		const item: CwToastItem = {
			id,
			tone: opts.tone ?? 'info',
			message: opts.message,
			duration: opts.duration ?? 5000,
			dismissible: opts.dismissible ?? true
		};

		items = [...items, item].slice(-maxItems);
		return id;
	}

	function dismiss(id: string) {
		items = items.filter((t) => t.id !== id);
	}

	const api: CwToastApi = {
		add,
		dismiss,
		get items() {
			return items;
		}
	};

	setContext(TOAST_KEY, api);
	return api;
}

/**
 * Retrieve the toast API from context. Call in child components.
 */
export function useCwToast(): CwToastApi {
	return getContext<CwToastApi>(TOAST_KEY);
}
