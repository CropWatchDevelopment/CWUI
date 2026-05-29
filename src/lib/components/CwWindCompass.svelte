<script lang="ts" module>
	/**
	 * Overridable display strings for {@link CwWindCompass}. All fields are
	 * optional; any omitted field falls back to the built-in English default.
	 * Decorative / help-text fields have no default and are hidden unless set.
	 */
	export interface CwWindCompassLabels {
		/** Small uppercase eyebrow above the title. Default `"Wind"`. */
		eyebrow?: string;
		/** Heading shown when no `location` is supplied. Default `"Wind compass"`. */
		headingFallback?: string;
		/**
		 * Heading built from a location label, e.g. `"Field 3 wind"`.
		 * Default `` `${location} wind` ``.
		 */
		heading?: (location: string) => string;
		/**
		 * Decorative subtitle paragraph under the title. No default — the
		 * paragraph is hidden entirely unless this string is supplied.
		 */
		subtitle?: string;
		/** Beaufort pill formatter. Default `` `Bft ${force} · ${label}` ``. */
		beaufortPill?: (force: number, label: string) => string;
		/**
		 * Reading block label. Receives the already-localised convention word
		 * (the `conventionFrom`/`conventionTo` value). Default `` `Wind ${word}` ``.
		 */
		readingLabel?: (conventionWord: string) => string;
		/** Prefix for the "updated at" line, e.g. `"Updated …"`. Default `"Updated"`. */
		updatedLabel?: (formatted: string) => string;
		/** Convention word for "from". Default `"from"`. */
		conventionFrom?: string;
		/** Convention word for "to". Default `"to"`. */
		conventionTo?: string;
		/** Stat label: direction. Default `"Direction"`. */
		statDirection?: string;
		/**
		 * Stat label: heading (the opposite of the reading direction). Receives
		 * the already-localised convention word. Default `` `Heading ${word}` ``.
		 */
		statHeading?: (conventionWord: string) => string;
		/** Stat label: speed. Default `"Speed"`. */
		statSpeed?: string;
		/** Stat label: Beaufort. Default `"Beaufort"`. */
		statBeaufort?: string;
		/** Stat value: Beaufort force + name, e.g. `"F4 · Moderate"`. */
		statBeaufortValue?: (force: number, label: string) => string;
		/** Stat label: conditions / guidance. Default `"Conditions"`. */
		statConditions?: string;
		/**
		 * Cardinal direction abbreviations, 16 entries clockwise from North:
		 * `["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]`.
		 * Used for compass-letter readouts and SR text.
		 */
		cardinals?: string[];
		/** The four major cardinal letters drawn on the dial: `["N","E","S","W"]`. */
		cardinalLetters?: { n: string; e: string; s: string; w: string };
		/**
		 * Beaufort force names, indexed by force 0–12. Default English names
		 * (`"Calm"`, `"Light air"`, … `"Hurricane"`).
		 */
		beaufortNames?: string[];
		/**
		 * Per-force descriptive guidance sentences, indexed by force 0–12.
		 * No default — guidance text is hidden unless supplied.
		 */
		beaufortGuidance?: string[];
		/**
		 * SR-summary line: `"Wind from 270° W"`. Receives the already-localised
		 * convention word, the formatted direction, and the cardinal abbreviation.
		 */
		srWind?: (
			conventionWord: string,
			direction: string,
			cardinal: string,
		) => string;
		/** SR-summary line: `"Speed 5 m/s"`. */
		srSpeed?: (speed: string) => string;
		/** SR-summary line: `"Beaufort 4, Moderate"`. */
		srBeaufort?: (force: number, label: string) => string;
	}

	const DEFAULT_BEAUFORT_NAMES = [
		"Calm",
		"Light air",
		"Light breeze",
		"Gentle breeze",
		"Moderate",
		"Fresh",
		"Strong",
		"Near gale",
		"Gale",
		"Strong gale",
		"Storm",
		"Violent storm",
		"Hurricane",
	];

	const DEFAULT_CARDINALS = [
		"N",
		"NNE",
		"NE",
		"ENE",
		"E",
		"ESE",
		"SE",
		"SSE",
		"S",
		"SSW",
		"SW",
		"WSW",
		"W",
		"WNW",
		"NW",
		"NNW",
	];

	const DEFAULT_LABELS = {
		eyebrow: "Wind",
		headingFallback: "Wind compass",
		heading: (location: string) => `${location} wind`,
		beaufortPill: (force: number, label: string) =>
			`Bft ${force} · ${label}`,
		readingLabel: (conventionWord: string) => `Wind ${conventionWord}`,
		updatedLabel: (formatted: string) => `Updated ${formatted}`,
		conventionFrom: "from",
		conventionTo: "to",
		statDirection: "Direction",
		statHeading: (conventionWord: string) => `Heading ${conventionWord}`,
		statSpeed: "Speed",
		statBeaufort: "Beaufort",
		statBeaufortValue: (force: number, label: string) =>
			`F${force} · ${label}`,
		statConditions: "Conditions",
		cardinals: DEFAULT_CARDINALS,
		cardinalLetters: { n: "N", e: "E", s: "S", w: "W" },
		beaufortNames: DEFAULT_BEAUFORT_NAMES,
		srWind: (conventionWord: string, direction: string, cardinal: string) =>
			`Wind ${conventionWord} ${direction} ${cardinal}`,
		srSpeed: (speed: string) => `Speed ${speed}`,
		srBeaufort: (force: number, label: string) =>
			`Beaufort ${force}, ${label}`,
	};
</script>

<script lang="ts">
	import type {
		CwNoDataMessage,
		CwWindDirectionConvention,
		CwWindSpeedUnit,
	} from "../types/index.js";
	import CwNoDataOverlay from "./CwNoDataOverlay.svelte";
	import { getCwNoDataMessage, hasCwNoData } from "./cwNoData.js";

	interface Props {
		/** Direction in degrees, 0 = North, 90 = East. */
		direction?: number | null;
		/** Wind speed in the chosen unit. */
		speed?: number | null;
		/** Optional location label. */
		location?: string;
		/** Optional timestamp shown in the summary. */
		timestamp?: string | Date | number;
		/** Speed unit. Default `m/s`. */
		unit?: CwWindSpeedUnit;
		/**
		 * Optional secondary unit. When set, the digital readout shows the same
		 * speed converted into this unit on a second line (e.g. `unit="mph"`
		 * with `secondaryUnit="km/h"` shows both MPH and KPH).
		 */
		secondaryUnit?: CwWindSpeedUnit;
		/**
		 * Whether the supplied direction means the wind is blowing FROM that direction
		 * (meteorological, default) or TO that direction (oceanographic).
		 */
		convention?: CwWindDirectionConvention;
		/** Pixel size of the dial. Default `320`. */
		size?: number;
		/** Show the textual summary below the dial. */
		showSummary?: boolean;
		/**
		 * Bindable output. Updated to the current cardinal abbreviation
		 * ("N", "NE", "ESE", …) of the FROM direction. Use with `bind:cardinal`.
		 */
		cardinal?: string;
		noData?: CwNoDataMessage;
		/** Override display strings for i18n. English defaults are used for any omitted field. */
		labels?: CwWindCompassLabels;
		class?: string;
	}

	let {
		direction,
		speed,
		location = "",
		timestamp,
		unit = "m/s",
		secondaryUnit,
		convention = "from",
		size = 320,
		showSummary = true,
		cardinal = $bindable(""),
		noData,
		labels = {},
		class: className = "",
	}: Props = $props();

	const l = $derived({
		...DEFAULT_LABELS,
		...labels,
		cardinalLetters: {
			...DEFAULT_LABELS.cardinalLetters,
			...labels.cardinalLetters,
		},
	});

	const uid = $props.id();

	/* ── Beaufort table (m/s thresholds) ──────────────────── */
	type BeaufortTone =
		| "calm"
		| "light"
		| "moderate"
		| "strong"
		| "gale"
		| "storm";

	interface BeaufortStep {
		force: number;
		maxMs: number;
		tone: BeaufortTone;
	}

	const BEAUFORT_TABLE: BeaufortStep[] = [
		{ force: 0, maxMs: 0.3, tone: "calm" },
		{ force: 1, maxMs: 1.5, tone: "calm" },
		{ force: 2, maxMs: 3.3, tone: "light" },
		{ force: 3, maxMs: 5.4, tone: "light" },
		{ force: 4, maxMs: 7.9, tone: "moderate" },
		{ force: 5, maxMs: 10.7, tone: "moderate" },
		{ force: 6, maxMs: 13.8, tone: "strong" },
		{ force: 7, maxMs: 17.1, tone: "strong" },
		{ force: 8, maxMs: 20.7, tone: "gale" },
		{ force: 9, maxMs: 24.4, tone: "gale" },
		{ force: 10, maxMs: 28.4, tone: "storm" },
		{ force: 11, maxMs: 32.6, tone: "storm" },
		{ force: 12, maxMs: Number.POSITIVE_INFINITY, tone: "storm" },
	];

	/* ── Unit conversions ─────────────────────────────────── */
	const TO_MS: Record<CwWindSpeedUnit, number> = {
		"m/s": 1,
		"km/h": 1 / 3.6,
		mph: 0.44704,
		knots: 0.514444,
	};

	function toMs(value: number): number {
		return value * TO_MS[unit];
	}

	function fromMs(ms: number, target: CwWindSpeedUnit): number {
		return ms / TO_MS[target];
	}

	function toFiniteNumber(input: number | null | undefined, fallback: number): number {
		return typeof input === "number" && Number.isFinite(input) ? input : fallback;
	}

	/* ── Direction helpers ────────────────────────────────── */
	function normalizeDeg(deg: number): number {
		const wrapped = ((deg % 360) + 360) % 360;
		return wrapped;
	}

	function cardinalLabel(deg: number): string {
		const idx = Math.round(normalizeDeg(deg) / 22.5) % 16;
		return l.cardinals[idx] ?? DEFAULT_CARDINALS[idx];
	}

	const hasNoData = $derived(hasCwNoData(noData));
	const noDataMessage = $derived(getCwNoDataMessage(noData));
	const directionValue = $derived(toFiniteNumber(direction, 0));
	const speedValue = $derived(toFiniteNumber(speed, 0));
	const normalizedDirection = $derived(normalizeDeg(directionValue));
	/** The direction the wind is moving TO (used to draw the arrow). */
	const flowDirection = $derived(
		convention === "from"
			? normalizeDeg(normalizedDirection + 180)
			: normalizedDirection,
	);
	/** The direction the wind is coming FROM (used for cardinal labels). */
	const fromDirection = $derived(
		convention === "from"
			? normalizedDirection
			: normalizeDeg(normalizedDirection + 180),
	);

	/* ── Speed / Beaufort derivations ─────────────────────── */
	const speedMs = $derived(toMs(speedValue));

	const beaufort = $derived.by<BeaufortStep>(() => {
		const ms = Math.max(0, speedMs);
		return (
			BEAUFORT_TABLE.find((step) => ms <= step.maxMs) ??
			BEAUFORT_TABLE[BEAUFORT_TABLE.length - 1]
		);
	});

	/** Localised Beaufort force name for the current step. */
	const beaufortName = $derived(
		l.beaufortNames[beaufort.force] ??
			DEFAULT_BEAUFORT_NAMES[beaufort.force] ??
			"",
	);
	/** Optional per-force guidance sentence (hidden unless supplied via labels). */
	const beaufortGuidance = $derived(l.beaufortGuidance?.[beaufort.force]);

	/* ── Geometry ──────────────────────────────────────────── */
	const VIEWBOX = 320;
	const CENTER = VIEWBOX / 2;
	const OUTER_R = 150;
	const TICK_R = 142;
	const MAJOR_TICK_R = 134;
	const NUMBER_R = 120;
	const CARDINAL_R = 105;
	const ARROW_LENGTH = 78;

	function polar(angleDeg: number, radius: number): { x: number; y: number } {
		// 0° = North (top); rotate clockwise.
		const rad = ((angleDeg - 90) * Math.PI) / 180;
		return {
			x: CENTER + radius * Math.cos(rad),
			y: CENTER + radius * Math.sin(rad),
		};
	}

	interface Tick {
		angle: number;
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		major: boolean;
		cardinal: boolean;
	}

	const ticks = $derived.by<Tick[]>(() => {
		const items: Tick[] = [];
		for (let deg = 0; deg < 360; deg += 5) {
			const isCardinal = deg % 90 === 0;
			const isMajor = deg % 30 === 0;
			const innerR = isCardinal ? MAJOR_TICK_R - 6 : isMajor ? MAJOR_TICK_R : 138;
			const outer = polar(deg, TICK_R);
			const inner = polar(deg, innerR);
			items.push({
				angle: deg,
				x1: inner.x,
				y1: inner.y,
				x2: outer.x,
				y2: outer.y,
				major: isMajor,
				cardinal: isCardinal,
			});
		}
		return items;
	});

	interface NumberTick {
		angle: number;
		x: number;
		y: number;
		label: string;
	}

	const numberTicks = $derived.by<NumberTick[]>(() => {
		const items: NumberTick[] = [];
		for (let deg = 30; deg < 360; deg += 30) {
			if (deg % 90 === 0) continue;
			const point = polar(deg, NUMBER_R);
			items.push({
				angle: deg,
				x: point.x,
				y: point.y,
				label: String(deg / 10).padStart(2, "0"),
			});
		}
		return items;
	});

	const CARDINAL_POSITIONS = [
		{ deg: 0, key: "n" as const },
		{ deg: 90, key: "e" as const },
		{ deg: 180, key: "s" as const },
		{ deg: 270, key: "w" as const },
	].map((c) => ({
		...c,
		...polar(c.deg, CARDINAL_R),
	}));

	const cardinalPositions = $derived(
		CARDINAL_POSITIONS.map((c) => ({
			...c,
			label: l.cardinalLetters[c.key],
		})),
	);

	/* ── Formatting ───────────────────────────────────────── */
	const speedFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	});
	const directionFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});

	const formattedSpeed = $derived(`${speedFormatter.format(speedValue)} ${unit}`);
	const formattedDirection = $derived(
		`${directionFormatter.format(normalizedDirection)}°`,
	);
	const directionCardinal = $derived(cardinalLabel(fromDirection));
	const flowCardinal = $derived(cardinalLabel(flowDirection));

	function formatUpdatedAt(value: string | Date | number): string {
		try {
			let d: Date;
			if (value instanceof Date) d = value;
			else if (typeof value === "number")
				d = new Date(value > 1e11 ? value : value * 1000);
			else d = new Date(value);
			if (Number.isNaN(d.getTime())) return "";
			return d.toLocaleString(undefined, {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "";
		}
	}

	const updatedAt = $derived(
		timestamp === undefined ? "" : formatUpdatedAt(timestamp),
	);

	const formattedSpeedValue = $derived(speedFormatter.format(speedValue));
	const secondaryShown = $derived(
		secondaryUnit !== undefined && secondaryUnit !== unit,
	);
	const secondarySpeedValue = $derived(
		secondaryUnit === undefined
			? ""
			: speedFormatter.format(fromMs(speedMs, secondaryUnit)),
	);

	/* Push the cardinal abbreviation back to bindable output. */
	$effect(() => {
		cardinal = directionCardinal;
	});

	const heading = $derived(
		location.trim() ? l.heading(location) : l.headingFallback,
	);

	/** Logical convention of the displayed direction. */
	const fromOrTo = $derived<"from" | "to">(
		convention === "from" ? "from" : "to",
	);
	/** Logical convention of the flow (heading) direction — the opposite. */
	const headingFromOrTo = $derived<"from" | "to">(
		fromOrTo === "from" ? "to" : "from",
	);
	/** Localised convention word for the displayed direction. */
	const conventionWord = $derived(
		fromOrTo === "from" ? l.conventionFrom : l.conventionTo,
	);
	/** Localised convention word for the flow (heading) direction. */
	const headingConventionWord = $derived(
		headingFromOrTo === "from" ? l.conventionFrom : l.conventionTo,
	);

	const srSummary = $derived(
		[
			heading,
			l.srWind(conventionWord, formattedDirection, directionCardinal),
			l.srSpeed(formattedSpeed),
			l.srBeaufort(beaufort.force, beaufortName),
		].join(". "),
	);
</script>

<section
	class={[
		"cw-wind-compass",
		"cw-no-data-host",
		hasNoData && "cw-no-data-host--active",
		className,
	]}
	style:--cw-wind-size="{size}px"
	aria-labelledby="{uid}-title"
>
	<header class="cw-wind-compass__header">
		<div class="cw-wind-compass__header-copy">
			<p class="cw-wind-compass__eyebrow">{l.eyebrow}</p>
			<div class="cw-wind-compass__title-row">
				<h3 id="{uid}-title" class="cw-wind-compass__title">{heading}</h3>
				<span
					class={[
						"cw-wind-compass__beaufort-pill",
						`cw-wind-compass__beaufort-pill--${beaufort.tone}`,
					]}
				>
					{l.beaufortPill(beaufort.force, beaufortName)}
				</span>
			</div>
			{#if l.subtitle}
				<p class="cw-wind-compass__subtitle">{l.subtitle}</p>
			{/if}
		</div>

		<div class="cw-wind-compass__reading">
			<span class="cw-wind-compass__reading-label"
				>{l.readingLabel(conventionWord)}</span
			>
			<strong class="cw-wind-compass__reading-direction"
				>{formattedDirection}</strong
			>
			<small class="cw-wind-compass__reading-cardinal"
				>{directionCardinal}</small
			>
			<small>{formattedSpeed}</small>
			{#if updatedAt}
				<small>{l.updatedLabel(updatedAt)}</small>
			{/if}
		</div>
	</header>

	<div class="cw-wind-compass__dial-shell">
		<svg
			class="cw-wind-compass__dial"
			viewBox="0 0 {VIEWBOX} {VIEWBOX}"
			width={size}
			height={size}
			role="img"
			aria-describedby="{uid}-summary"
		>
			<defs>
				<radialGradient id="{uid}-bezel" cx="50%" cy="40%" r="60%">
					<stop offset="0%" stop-color="var(--cw-wind-bezel-hi)" />
					<stop offset="100%" stop-color="var(--cw-wind-bezel-lo)" />
				</radialGradient>
				<radialGradient id="{uid}-face" cx="50%" cy="40%" r="65%">
					<stop offset="0%" stop-color="var(--cw-wind-face-hi)" />
					<stop offset="100%" stop-color="var(--cw-wind-face-lo)" />
				</radialGradient>
				<linearGradient
					id="{uid}-arrow"
					x1="0"
					y1="0"
					x2="0"
					y2="1"
				>
					<stop offset="0%" stop-color="var(--cw-wind-arrow-hi)" />
					<stop offset="100%" stop-color="var(--cw-wind-arrow-lo)" />
				</linearGradient>
			</defs>

			<!-- Bezel + face -->
			<circle
				cx={CENTER}
				cy={CENTER}
				r={OUTER_R + 8}
				fill="url(#{uid}-bezel)"
				stroke="var(--cw-wind-bezel-stroke)"
				stroke-width="1.5"
			/>
			<circle
				cx={CENTER}
				cy={CENTER}
				r={OUTER_R}
				fill="url(#{uid}-face)"
				stroke="var(--cw-wind-face-stroke)"
				stroke-width="1"
			/>

			<!-- Subtle inner concentric ring -->
			<circle
				cx={CENTER}
				cy={CENTER}
				r={NUMBER_R - 6}
				fill="none"
				stroke="var(--cw-wind-ring)"
				stroke-width="0.6"
				stroke-dasharray="2 4"
			/>

			<!-- Tick marks -->
			{#each ticks as tick (tick.angle)}
				<line
					x1={tick.x1}
					y1={tick.y1}
					x2={tick.x2}
					y2={tick.y2}
					stroke={tick.cardinal
						? "var(--cw-wind-tick-cardinal)"
						: tick.major
							? "var(--cw-wind-tick-major)"
							: "var(--cw-wind-tick)"}
					stroke-width={tick.cardinal ? 2.4 : tick.major ? 1.6 : 0.9}
					stroke-linecap="round"
				/>
			{/each}

			<!-- Number labels (e.g. 03, 06, 12, 15…) -->
			{#each numberTicks as nt (nt.angle)}
				<text
					x={nt.x}
					y={nt.y}
					text-anchor="middle"
					dominant-baseline="central"
					class="cw-wind-compass__deg-label"
				>
					{nt.label}
				</text>
			{/each}

			<!-- Cardinal letters -->
			{#each cardinalPositions as c (c.key)}
				<text
					x={c.x}
					y={c.y}
					text-anchor="middle"
					dominant-baseline="central"
					class={[
						"cw-wind-compass__cardinal",
						c.key === "n" && "cw-wind-compass__cardinal--north",
					]}
				>
					{c.label}
				</text>
			{/each}

			<!-- Wind arrow (rotated to flow direction) -->
			<g
				transform="rotate({flowDirection} {CENTER} {CENTER})"
				class="cw-wind-compass__arrow"
			>
				<!-- Arrowhead + shaft (one shape so the gradient flows continuously) -->
				<polygon
					points="
						{CENTER},{CENTER - ARROW_LENGTH}
						{CENTER - 11},{CENTER - ARROW_LENGTH * 0.72}
						{CENTER - 2},{CENTER - ARROW_LENGTH * 0.72}
						{CENTER - 2},{CENTER + ARROW_LENGTH * 0.55}
						{CENTER + 2},{CENTER + ARROW_LENGTH * 0.55}
						{CENTER + 2},{CENTER - ARROW_LENGTH * 0.72}
						{CENTER + 11},{CENTER - ARROW_LENGTH * 0.72}
					"
					fill="url(#{uid}-arrow)"
				/>
				<!-- Left fletching -->
				<polygon
					points="
						{CENTER - 2},{CENTER + ARROW_LENGTH * 0.25}
						{CENTER - 14},{CENTER + ARROW_LENGTH * 0.7}
						{CENTER - 2},{CENTER + ARROW_LENGTH * 0.55}
					"
					fill="var(--cw-wind-arrow-tail)"
				/>
				<!-- Right fletching -->
				<polygon
					points="
						{CENTER + 2},{CENTER + ARROW_LENGTH * 0.25}
						{CENTER + 14},{CENTER + ARROW_LENGTH * 0.7}
						{CENTER + 2},{CENTER + ARROW_LENGTH * 0.55}
					"
					fill="var(--cw-wind-arrow-tail)"
				/>
				<!-- Fletching back-V (subtle accent line) -->
				<polyline
					points="
						{CENTER - 14},{CENTER + ARROW_LENGTH * 0.7}
						{CENTER},{CENTER + ARROW_LENGTH * 0.6}
						{CENTER + 14},{CENTER + ARROW_LENGTH * 0.7}
					"
					fill="none"
					stroke="var(--cw-wind-arrow-tail)"
					stroke-width="1"
					stroke-linecap="round"
					stroke-linejoin="round"
					opacity="0.6"
				/>
			</g>

			<!-- Center hub -->
			<circle
				cx={CENTER}
				cy={CENTER}
				r="11"
				fill="var(--cw-wind-hub)"
				stroke="var(--cw-wind-hub-ring)"
				stroke-width="1.5"
			/>
			<circle cx={CENTER} cy={CENTER} r="3" fill="var(--cw-wind-hub-dot)" />

			<!-- Top heading marker (bug) -->
			<polygon
				points="{CENTER},{CENTER - OUTER_R - 2} {CENTER - 6},{CENTER -
					OUTER_R - 12} {CENTER + 6},{CENTER - OUTER_R - 12}"
				fill="var(--cw-wind-heading-bug)"
			/>
		</svg>

		<div class="cw-wind-compass__readout-panel" aria-hidden="true">
			<div class="cw-wind-compass__readout-primary">
				<span class="cw-wind-compass__readout-value">
					{formattedSpeedValue}
				</span>
				<span class="cw-wind-compass__readout-unit">{unit}</span>
			</div>
			{#if secondaryShown}
				<div class="cw-wind-compass__readout-secondary">
					<span class="cw-wind-compass__readout-secondary-value">
						{secondarySpeedValue}
					</span>
					<span class="cw-wind-compass__readout-secondary-unit">
						{secondaryUnit}
					</span>
				</div>
			{/if}
		</div>

		<p id="{uid}-summary" class="cw-wind-compass__sr-summary">
			{srSummary}
		</p>
	</div>

	{#if showSummary}
		<dl class="cw-wind-compass__stats">
			<div class="cw-wind-compass__stat">
				<dt>{l.statDirection}</dt>
				<dd>
					{formattedDirection}
					<span class="cw-wind-compass__stat-secondary"
						>{directionCardinal}</span
					>
				</dd>
			</div>
			<div class="cw-wind-compass__stat">
				<dt>{l.statHeading(headingConventionWord)}</dt>
				<dd>{flowCardinal}</dd>
			</div>
			<div class="cw-wind-compass__stat">
				<dt>{l.statSpeed}</dt>
				<dd>{formattedSpeed}</dd>
			</div>
			<div
				class={[
					"cw-wind-compass__stat",
					`cw-wind-compass__stat--${beaufort.tone}`,
				]}
			>
				<dt>{l.statBeaufort}</dt>
				<dd>{l.statBeaufortValue(beaufort.force, beaufortName)}</dd>
			</div>
			{#if beaufortGuidance}
				<div
					class="cw-wind-compass__stat cw-wind-compass__stat--guidance"
				>
					<dt>{l.statConditions}</dt>
					<dd>{beaufortGuidance}</dd>
				</div>
			{/if}
		</dl>
	{/if}

	{#if hasNoData}
		<CwNoDataOverlay message={noDataMessage} />
	{/if}
</section>

<style>
	.cw-wind-compass {
		--cw-wind-size: 320px;

		/* Aeronautical instrument palette — auto-adapts to light/dark via base tokens. */
		--cw-wind-bezel-hi: color-mix(
			in srgb,
			var(--cw-bg-elevated) 78%,
			#0d1726
		);
		--cw-wind-bezel-lo: color-mix(
			in srgb,
			var(--cw-bg-base) 60%,
			#000814
		);
		--cw-wind-bezel-stroke: color-mix(
			in srgb,
			var(--cw-border-strong, var(--cw-border-default)) 70%,
			transparent
		);

		--cw-wind-face-hi: color-mix(
			in srgb,
			#0e1c2c 90%,
			var(--cw-bg-surface) 10%
		);
		--cw-wind-face-lo: #050b14;
		--cw-wind-face-stroke: color-mix(in srgb, #1d3550 70%, transparent);

		--cw-wind-ring: color-mix(in srgb, #5fa6ff 32%, transparent);
		--cw-wind-tick: color-mix(in srgb, #cfe1ff 55%, transparent);
		--cw-wind-tick-major: #d6e4f8;
		--cw-wind-tick-cardinal: #f4f8ff;

		--cw-wind-arrow-hi: #ffd866;
		--cw-wind-arrow-lo: #ff9a3d;
		--cw-wind-arrow-tail: #4cd7ff;

		--cw-wind-hub: #1c2c44;
		--cw-wind-hub-ring: #d6e4f8;
		--cw-wind-hub-dot: #ffd866;
		--cw-wind-heading-bug: #ffd866;

		--cw-wind-readout-bg: #050b14;
		--cw-wind-readout-stroke: color-mix(in srgb, #1d3550 80%, transparent);
		--cw-wind-readout-inner: color-mix(in srgb, #4cd7ff 22%, transparent);
		--cw-wind-readout-value: #ffd866;
		--cw-wind-readout-unit: color-mix(in srgb, #4cd7ff 88%, #ffffff);

		display: grid;
		gap: var(--cw-space-5);
		padding: var(--cw-space-5);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--cw-bg-surface-elevated) 92%, transparent),
				color-mix(in srgb, var(--cw-bg-surface) 88%, transparent)
			);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 72%, transparent);
		border-radius: var(--cw-radius-xl, 1.25rem);
		color: var(--cw-text-primary);
		box-shadow:
			0 1px 0 color-mix(in srgb, white 6%, transparent) inset,
			0 18px 30px -22px color-mix(in srgb, #000 50%, transparent);
	}

	/* Light theme tweaks — keep instrument feel but readable. */
	:global([data-theme="light"]) .cw-wind-compass,
	:global(.cw-wind-compass[data-theme="light"]) {
		--cw-wind-bezel-hi: #2a3a52;
		--cw-wind-bezel-lo: #142035;
		--cw-wind-face-hi: #1a2a3f;
		--cw-wind-face-lo: #0c1726;
		--cw-wind-face-stroke: color-mix(in srgb, #2a3a52 78%, transparent);
		--cw-wind-tick: color-mix(in srgb, #cfe1ff 55%, transparent);
		--cw-wind-tick-major: #e7eefb;
		--cw-wind-tick-cardinal: #ffffff;
		--cw-wind-ring: color-mix(in srgb, #79b6ff 36%, transparent);
		--cw-wind-arrow-hi: #ffd070;
		--cw-wind-arrow-lo: #ff8a3a;
		--cw-wind-hub: #213553;
		--cw-wind-hub-ring: #f4f8ff;
		--cw-wind-readout-bg: #06101e;
		--cw-wind-readout-stroke: color-mix(in srgb, #2a3a52 80%, transparent);
		--cw-wind-readout-inner: color-mix(in srgb, #79b6ff 28%, transparent);
	}

	/* ── Header ───────────────────────────────────────────── */
	.cw-wind-compass__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--cw-space-4);
	}

	.cw-wind-compass__header-copy {
		display: grid;
		gap: 0.4rem;
		max-width: 60ch;
	}

	.cw-wind-compass__eyebrow {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		font-weight: 700;
		margin: 0;
	}

	.cw-wind-compass__title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--cw-space-2);
	}

	.cw-wind-compass__title {
		font-size: clamp(1.1rem, 1.6vw, 1.35rem);
		font-weight: var(--cw-font-semibold, 600);
		margin: 0;
		color: var(--cw-text-primary);
	}

	.cw-wind-compass__subtitle {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		line-height: 1.55;
		margin: 0;
	}

	.cw-wind-compass__beaufort-pill {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-weight: 700;
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		border: 1px solid currentColor;
		color: var(--cw-text-secondary);
	}
	.cw-wind-compass__beaufort-pill--calm {
		color: var(--cw-info-500);
		background: color-mix(in srgb, var(--cw-info-500) 14%, transparent);
	}
	.cw-wind-compass__beaufort-pill--light {
		color: var(--cw-success-500);
		background: color-mix(in srgb, var(--cw-success-500) 14%, transparent);
	}
	.cw-wind-compass__beaufort-pill--moderate {
		color: var(--cw-primary-500);
		background: color-mix(in srgb, var(--cw-primary-500) 14%, transparent);
	}
	.cw-wind-compass__beaufort-pill--strong {
		color: var(--cw-warning-700);
		background: color-mix(in srgb, var(--cw-warning-500) 18%, transparent);
	}
	.cw-wind-compass__beaufort-pill--gale {
		color: var(--cw-danger-500);
		background: color-mix(in srgb, var(--cw-danger-500) 16%, transparent);
	}
	.cw-wind-compass__beaufort-pill--storm {
		color: #fff;
		background: var(--cw-danger-700);
		border-color: transparent;
	}

	.cw-wind-compass__reading {
		display: grid;
		gap: 0.15rem;
		justify-items: end;
		text-align: right;
		min-width: 9rem;
	}

	.cw-wind-compass__reading-label {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		font-weight: 700;
	}

	.cw-wind-compass__reading-direction {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		font-variant-numeric: tabular-nums;
		font-weight: 800;
		letter-spacing: 0.02em;
		color: var(--cw-text-primary);
	}

	.cw-wind-compass__reading-cardinal {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		font-weight: 600;
		letter-spacing: 0.08em;
	}

	.cw-wind-compass__reading small {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	/* ── Dial ─────────────────────────────────────────────── */
	.cw-wind-compass__dial-shell {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) 0 0;
	}

	.cw-wind-compass__dial {
		width: var(--cw-wind-size);
		height: var(--cw-wind-size);
		max-width: 100%;
		filter: drop-shadow(
			0 18px 30px color-mix(in srgb, #000814 55%, transparent)
		);
	}

	.cw-wind-compass__deg-label {
		font-size: 12px;
		font-weight: 600;
		fill: var(--cw-wind-tick-major);
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.05em;
	}

	.cw-wind-compass__cardinal {
		font-size: 19px;
		font-weight: 800;
		fill: var(--cw-wind-tick-cardinal);
		letter-spacing: 0.08em;
	}

	.cw-wind-compass__cardinal--north {
		fill: #ffd866;
	}

	.cw-wind-compass__arrow {
		transition: transform var(--cw-duration-medium, 0.4s)
			var(--cw-ease-default, cubic-bezier(0.4, 0, 0.2, 1));
	}

	/* ── Digital readout (LCD-style panel below the dial) ── */
	.cw-wind-compass__readout-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		min-width: 9rem;
		padding: 0.55rem 1.25rem 0.65rem;
		border-radius: 0.7rem;
		background: var(--cw-wind-readout-bg);
		border: 1px solid var(--cw-wind-readout-stroke);
		box-shadow:
			inset 0 0 0 1px var(--cw-wind-readout-inner),
			0 8px 18px -10px color-mix(in srgb, #000 60%, transparent);
		font-feature-settings: "tnum" 1;
	}

	.cw-wind-compass__readout-primary {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
	}

	.cw-wind-compass__readout-value {
		font-size: 1.65rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-family: var(
			--cw-font-mono,
			ui-monospace,
			"SFMono-Regular",
			Menlo,
			monospace
		);
		color: var(--cw-wind-readout-value);
		letter-spacing: 0.04em;
		line-height: 1;
	}

	.cw-wind-compass__readout-unit {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--cw-wind-readout-unit);
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.cw-wind-compass__readout-secondary {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		padding-top: 0.3rem;
		border-top: 1px dashed
			color-mix(in srgb, var(--cw-wind-readout-inner) 70%, transparent);
		width: 100%;
		justify-content: center;
	}

	.cw-wind-compass__readout-secondary-value {
		font-size: 1rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-family: var(
			--cw-font-mono,
			ui-monospace,
			"SFMono-Regular",
			Menlo,
			monospace
		);
		color: var(--cw-wind-readout-value);
		opacity: 0.85;
		letter-spacing: 0.03em;
		line-height: 1;
	}

	.cw-wind-compass__readout-secondary-unit {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--cw-wind-readout-unit);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.85;
	}

	.cw-wind-compass__sr-summary {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* ── Stats ────────────────────────────────────────────── */
	.cw-wind-compass__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--cw-space-2);
		padding: 0;
		margin: 0;
	}

	.cw-wind-compass__stat {
		display: grid;
		gap: 0.2rem;
		padding: 0.7rem 0.85rem;
		border-radius: var(--cw-radius-lg, 0.75rem);
		background: color-mix(
			in srgb,
			var(--cw-bg-muted) 60%,
			var(--cw-bg-surface)
		);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 60%, transparent);
	}

	.cw-wind-compass__stat dt {
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		font-weight: 700;
	}

	.cw-wind-compass__stat dd {
		font-size: var(--cw-text-base);
		font-weight: 600;
		color: var(--cw-text-primary);
		font-variant-numeric: tabular-nums;
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin: 0;
	}

	.cw-wind-compass__stat-secondary {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		font-weight: 500;
		letter-spacing: 0.06em;
	}

	.cw-wind-compass__stat--guidance dd {
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		font-weight: 500;
		line-height: 1.4;
	}

	.cw-wind-compass__stat--calm {
		border-color: color-mix(in srgb, var(--cw-info-500) 50%, transparent);
	}
	.cw-wind-compass__stat--light {
		border-color: color-mix(in srgb, var(--cw-success-500) 50%, transparent);
	}
	.cw-wind-compass__stat--moderate {
		border-color: color-mix(in srgb, var(--cw-primary-500) 55%, transparent);
	}
	.cw-wind-compass__stat--strong {
		border-color: color-mix(in srgb, var(--cw-warning-500) 65%, transparent);
	}
	.cw-wind-compass__stat--gale {
		border-color: color-mix(in srgb, var(--cw-danger-500) 65%, transparent);
	}
	.cw-wind-compass__stat--storm {
		border-color: color-mix(in srgb, var(--cw-danger-700) 80%, transparent);
		background: color-mix(in srgb, var(--cw-danger-700) 14%, var(--cw-bg-muted));
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-wind-compass__arrow {
			transition: none;
		}
	}
</style>
