/**
 * Canonical CropWatch metric → chart-color conventions.
 *
 * Every color sits in a narrow luminance band so it keeps at least 3:1
 * contrast (WCAG 1.4.11 non-text) against BOTH theme chart surfaces
 * (`--cw-chart-card-bg`: #293950 dark, #f7fafc light). Metrics are told
 * apart by hue, and related metrics share a hue family:
 *
 *  • Temperature       → the value-mapped gradient (cold = blue, hot = red).
 *  • Soil temperature  → solid clay (an earthier red than air temperature).
 *  • Water (humidity,  → blue / teal / indigo / sky, each a distinct hue so
 *    soil moisture,       they don't blur together on the same chart.
 *    rain, dew point)
 *  • CO₂               → purple.
 *  • Light / PAR / lux → gold.
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
const TEMPERATURE: MetricColor = { color: '#f05151', gradient: true }; // red, value-gradient
const SOIL_TEMPERATURE: MetricColor = { color: '#bf7758' }; // earthy clay
const HUMIDITY: MetricColor = { color: '#4286f6' }; // blue
const SOIL_MOISTURE: MetricColor = { color: '#119a8b' }; // teal
const RAIN: MetricColor = { color: '#747ef0' }; // indigo
const DEW_POINT: MetricColor = { color: '#0b92cc' }; // sky blue
const CO2: MetricColor = { color: '#af64f8' }; // purple
const LIGHT: MetricColor = { color: '#b87e04' }; // gold
const SOIL_EC: MetricColor = { color: '#ec499a' }; // pink (distinct from CO₂ purple)
const VPD: MetricColor = { color: '#e46106' }; // orange
const PRESSURE: MetricColor = { color: '#7b8aa0' }; // slate

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
const FALLBACK_COLORS = ['#7b8aa0', '#119a8b', '#996ff7', '#f54966', '#629710', '#0c92ce'];

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
