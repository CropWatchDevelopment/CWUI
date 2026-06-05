/**
 * Canonical CropWatch metric → chart-color conventions.
 *
 * These colors are tuned to stay legible on BOTH the light (#fafaf7) and dark
 * (#0e0e0c) chart backgrounds used by CwResponsiveLineChart, and to keep
 * related metrics grouped by hue while remaining easy to tell apart:
 *
 *  • Temperature       → the value-mapped gradient (cold = blue, hot = red).
 *  • Soil temperature  → solid brown-red (a warmer, earthier red than air temp).
 *  • Water (humidity,  → shades of blue, each a distinct hue so they don't blur
 *    soil moisture,       together when plotted on the same chart.
 *    rain, dew point)
 *  • CO₂               → purple.
 *  • Light / PAR / lux → gold-yellow (dark enough to read on a light background,
 *                          bright enough to read on a dark one).
 *
 * Pass a measurement key (e.g. "temperature_c", "soil_moisture", "co2") to
 * {@link metricColor} to get the line color and gradient flag for a series.
 */

export interface MetricColor {
	/** Solid line + axis color. */
	color: string;
	/** When true, draw the line with the value-mapped temperature gradient. */
	gradient?: boolean;
}

// ── Shared swatches ────────────────────────────────────────────
const TEMPERATURE: MetricColor = { color: '#ef4444', gradient: true }; // red, value-gradient
const SOIL_TEMPERATURE: MetricColor = { color: '#b45309' }; // earthy brown-red
const HUMIDITY: MetricColor = { color: '#3b82f6' }; // blue
const SOIL_MOISTURE: MetricColor = { color: '#06b6d4' }; // cyan
const RAIN: MetricColor = { color: '#0284c7' }; // deep sky blue
const DEW_POINT: MetricColor = { color: '#38bdf8' }; // light sky blue
const CO2: MetricColor = { color: '#a855f7' }; // purple
const LIGHT: MetricColor = { color: '#ca8a04' }; // gold (legible on light + dark)
const SOIL_EC: MetricColor = { color: '#ec4899' }; // pink (distinct from CO₂ purple)
const VPD: MetricColor = { color: '#f97316' }; // orange
const PRESSURE: MetricColor = { color: '#64748b' }; // slate

/** Measurement key → color. Keys are normalized (see {@link normalizeMetric}). */
const METRIC_COLORS: Record<string, MetricColor> = {
	// Temperature (gradient)
	temperature: TEMPERATURE,
	temp: TEMPERATURE,
	air_temperature: TEMPERATURE,
	air_temp: TEMPERATURE,
	ambient_temperature: TEMPERATURE,
	// Soil temperature (brown)
	soil_temperature: SOIL_TEMPERATURE,
	soil_temp: SOIL_TEMPERATURE,
	// Water family (blues)
	humidity: HUMIDITY,
	air_humidity: HUMIDITY,
	relative_humidity: HUMIDITY,
	rh: HUMIDITY,
	soil_moisture: SOIL_MOISTURE,
	moisture: SOIL_MOISTURE,
	vwc: SOIL_MOISTURE,
	soil_vwc: SOIL_MOISTURE,
	water_content: SOIL_MOISTURE,
	rain: RAIN,
	rainfall: RAIN,
	precipitation: RAIN,
	precip: RAIN,
	dew_point: DEW_POINT,
	// CO₂
	co2: CO2,
	carbon_dioxide: CO2,
	// Light
	light: LIGHT,
	light_intensity: LIGHT,
	illuminance: LIGHT,
	lux: LIGHT,
	par: LIGHT,
	ppfd: LIGHT,
	solar: LIGHT,
	solar_radiation: LIGHT,
	// Other common metrics
	soil_ec: SOIL_EC,
	ec: SOIL_EC,
	conductivity: SOIL_EC,
	vpd: VPD,
	pressure: PRESSURE,
	barometric_pressure: PRESSURE
};

/** Deterministic fallback hues for metrics not in the map above. */
const FALLBACK_COLORS = ['#64748b', '#14b8a6', '#8b5cf6', '#f43f5e', '#84cc16', '#0ea5e9'];

/**
 * Normalize a measurement key: lowercase, collapse spaces/dashes to underscores,
 * and strip a trailing unit suffix (e.g. `temperature_c` → `temperature`).
 */
export function normalizeMetric(measurement: string): string {
	return measurement
		.trim()
		.toLowerCase()
		.replace(/[\s-]+/g, '_')
		.replace(/_(c|f|celsius|fahrenheit|deg|degrees|pct|percent|ppm)$/, '');
}

/**
 * Resolve a measurement key to its CropWatch line color + gradient flag.
 * Unknown metrics get a stable fallback hue derived from the key, so the same
 * metric always renders the same color across charts.
 */
export function metricColor(measurement: string): MetricColor {
	const key = normalizeMetric(measurement);
	const known = METRIC_COLORS[key];
	if (known) return known;
	let hash = 0;
	for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
	return { color: FALLBACK_COLORS[hash % FALLBACK_COLORS.length] };
}

export { METRIC_COLORS };
