import type { CwStatusDotStatus } from '../types/index.js';
import { getContext, hasContext, setContext } from 'svelte';

const LOCATION_CARD_KEY = Symbol('cw-location-card');

export interface CwLocationCardSensorState {
	id: string;
	label: string;
	status: CwStatusDotStatus;
}

export interface CwLocationCardContextApi {
	setSensor(sensor: CwLocationCardSensorState): void;
	removeSensor(id: string): void;
	readSensors(): CwLocationCardSensorState[];
}

const NOOP_LOCATION_CARD_CONTEXT: CwLocationCardContextApi = {
	setSensor() {},
	removeSensor() {},
	readSensors() {
		return [];
	}
};

export function createCwLocationCardContext(): CwLocationCardContextApi {
	let sensorsById = $state<Record<string, CwLocationCardSensorState>>({});

	function setSensor(sensor: CwLocationCardSensorState) {
		const currentSensor = sensorsById[sensor.id];
		if (
			currentSensor?.label === sensor.label &&
			currentSensor?.status === sensor.status
		) {
			return;
		}

		sensorsById = {
			...sensorsById,
			[sensor.id]: sensor
		};
	}

	function removeSensor(id: string) {
		if (!(id in sensorsById)) {
			return;
		}

		const nextSensors = { ...sensorsById };
		delete nextSensors[id];
		sensorsById = nextSensors;
	}

	const api: CwLocationCardContextApi = {
		setSensor,
		removeSensor,
		readSensors: () => Object.values(sensorsById)
	};

	setContext(LOCATION_CARD_KEY, api);
	return api;
}

export function useCwLocationCard(): CwLocationCardContextApi {
	if (!hasContext(LOCATION_CARD_KEY)) {
		return NOOP_LOCATION_CARD_CONTEXT;
	}

	return getContext<CwLocationCardContextApi>(LOCATION_CARD_KEY);
}
