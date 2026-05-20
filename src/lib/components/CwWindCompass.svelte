<script lang="ts">
	import type {
		CwWindDirectionConvention,
		CwWindSpeedUnit,
	} from "../types/index.js";

	interface Props {
		/** Direction in degrees, 0 = North, 90 = East. */
		direction: number;
		/** Wind speed in the chosen unit. */
		speed: number;
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
		/** Show the Beaufort scale legend. */
		showLegend?: boolean;
		/**
		 * Bindable output. Updated to the current cardinal abbreviation
		 * ("N", "NE", "ESE", …) of the FROM direction. Use with `bind:cardinal`.
		 */
		cardinal?: string;
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
		showLegend = true,
		cardinal = $bindable(""),
		class: className = "",
	}: Props = $props();

	const uid = $props.id();

	/* ── Beaufort table (m/s thresholds) ──────────────────── */
	interface BeaufortStep {
		force: number;
		label: string;
		maxMs: number;
		tone: "calm" | "light" | "moderate" | "strong" | "gale" | "storm";
		guidance: string;
	}

	const BEAUFORT_TABLE: BeaufortStep[] = [
		{
			force: 0,
			label: "Calm",
			maxMs: 0.3,
			tone: "calm",
			guidance: "Smoke rises vertically; canopy still.",
		},
		{
			force: 1,
			label: "Light air",
			maxMs: 1.5,
			tone: "calm",
			guidance: "Drift visible in smoke; leaves barely moving.",
		},
		{
			force: 2,
			label: "Light breeze",
			maxMs: 3.3,
			tone: "light",
			guidance: "Felt on face; leaves rustle.",
		},
		{
			force: 3,
			label: "Gentle breeze",
			maxMs: 5.4,
			tone: "light",
			guidance: "Light flags lift; leaves in constant motion.",
		},
		{
			force: 4,
			label: "Moderate",
			maxMs: 7.9,
			tone: "moderate",
			guidance: "Dust raised; small branches move.",
		},
		{
			force: 5,
			label: "Fresh",
			maxMs: 10.7,
			tone: "moderate",
			guidance: "Small trees sway; whitecaps inland.",
		},
		{
			force: 6,
			label: "Strong",
			maxMs: 13.8,
			tone: "strong",
			guidance: "Large branches move; spraying possible.",
		},
		{
			force: 7,
			label: "Near gale",
			maxMs: 17.1,
			tone: "strong",
			guidance: "Whole trees in motion; walking effort.",
		},
		{
			force: 8,
			label: "Gale",
			maxMs: 20.7,
			tone: "gale",
			guidance: "Twigs break; progress impeded.",
		},
		{
			force: 9,
			label: "Strong gale",
			maxMs: 24.4,
			tone: "gale",
			guidance: "Slight structural damage; tiles loosened.",
		},
		{
			force: 10,
			label: "Storm",
			maxMs: 28.4,
			tone: "storm",
			guidance: "Trees uprooted; considerable damage.",
		},
		{
			force: 11,
			label: "Violent storm",
			maxMs: 32.6,
			tone: "storm",
			guidance: "Widespread damage; rare inland.",
		},
		{
			force: 12,
			label: "Hurricane",
			maxMs: Number.POSITIVE_INFINITY,
			tone: "storm",
			guidance: "Devastating effects.",
		},
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

	/* ── Direction helpers ────────────────────────────────── */
	function normalizeDeg(deg: number): number {
		const wrapped = ((deg % 360) + 360) % 360;
		return wrapped;
	}

	const CARDINAL_LABELS = [
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

	function cardinalLabel(deg: number): string {
		const idx = Math.round(normalizeDeg(deg) / 22.5) % 16;
		return CARDINAL_LABELS[idx];
	}

	const normalizedDirection = $derived(normalizeDeg(direction));
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
	const speedMs = $derived(toMs(speed));

	const beaufort = $derived.by<BeaufortStep>(() => {
		const ms = Math.max(0, speedMs);
		return (
			BEAUFORT_TABLE.find((step) => ms <= step.maxMs) ??
			BEAUFORT_TABLE[BEAUFORT_TABLE.length - 1]
		);
	});


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

	const cardinalPositions = [
		{ deg: 0, label: "N" },
		{ deg: 90, label: "E" },
		{ deg: 180, label: "S" },
		{ deg: 270, label: "W" },
	].map((c) => ({
		...c,
		...polar(c.deg, CARDINAL_R),
	}));

	/* ── Formatting ───────────────────────────────────────── */
	const speedFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
	});
	const directionFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});

	const formattedSpeed = $derived(`${speedFormatter.format(speed)} ${unit}`);
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

	const updatedLabel = $derived(
		timestamp === undefined ? "" : formatUpdatedAt(timestamp),
	);

	const formattedSpeedValue = $derived(speedFormatter.format(speed));
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

	/* ── Beaufort legend grouping ──────────────────────────── */
	interface BeaufortGroup {
		tone: BeaufortStep["tone"];
		label: string;
		minForce: number;
		maxForce: number;
		minMs: number;
		maxMs: number;
		guidance: string;
	}

	const beaufortGroups: BeaufortGroup[] = [
		{
			tone: "calm",
			label: "Calm air",
			minForce: 0,
			maxForce: 1,
			minMs: 0,
			maxMs: BEAUFORT_TABLE[1].maxMs,
			guidance: "Negligible movement; canopy and smoke nearly still.",
		},
		{
			tone: "light",
			label: "Light",
			minForce: 2,
			maxForce: 3,
			minMs: BEAUFORT_TABLE[1].maxMs,
			maxMs: BEAUFORT_TABLE[3].maxMs,
			guidance: "Pleasant breeze; leaves and small flags move.",
		},
		{
			tone: "moderate",
			label: "Moderate",
			minForce: 4,
			maxForce: 5,
			minMs: BEAUFORT_TABLE[3].maxMs,
			maxMs: BEAUFORT_TABLE[5].maxMs,
			guidance: "Branches sway; dust and loose paper raised.",
		},
		{
			tone: "strong",
			label: "Strong",
			minForce: 6,
			maxForce: 7,
			minMs: BEAUFORT_TABLE[5].maxMs,
			maxMs: BEAUFORT_TABLE[7].maxMs,
			guidance: "Whole trees move; walking and spraying impeded.",
		},
		{
			tone: "gale",
			label: "Gale",
			minForce: 8,
			maxForce: 9,
			minMs: BEAUFORT_TABLE[7].maxMs,
			maxMs: BEAUFORT_TABLE[9].maxMs,
			guidance: "Twigs break; structural damage possible.",
		},
		{
			tone: "storm",
			label: "Storm",
			minForce: 10,
			maxForce: 12,
			minMs: BEAUFORT_TABLE[9].maxMs,
			maxMs: Number.POSITIVE_INFINITY,
			guidance: "Trees uprooted; widespread damage.",
		},
	];

	function formatRangeMs(min: number, max: number): string {
		const minDisplay = speedFormatter.format(min / TO_MS[unit]);
		if (!Number.isFinite(max)) {
			return `${minDisplay}+ ${unit}`;
		}
		return `${minDisplay}-${speedFormatter.format(max / TO_MS[unit])} ${unit}`;
	}

	const heading = $derived(
		location.trim() ? `${location} wind` : "Wind compass",
	);

	const fromOrTo = $derived(convention === "from" ? "from" : "to");

	const srSummary = $derived(
		[
			heading,
			`Wind ${fromOrTo} ${formattedDirection} ${directionCardinal}`,
			`Speed ${formattedSpeed}`,
			`Beaufort ${beaufort.force}, ${beaufort.label}`,
		].join(". "),
	);
</script>

<section
	class={["cw-wind-compass", className]}
	style:--cw-wind-size="{size}px"
	aria-labelledby="{uid}-title"
>
	<header class="cw-wind-compass__header">
		<div class="cw-wind-compass__header-copy">
			<p class="cw-wind-compass__eyebrow">Wind</p>
			<div class="cw-wind-compass__title-row">
				<h3 id="{uid}-title" class="cw-wind-compass__title">{heading}</h3>
				<span
					class={[
						"cw-wind-compass__beaufort-pill",
						`cw-wind-compass__beaufort-pill--${beaufort.tone}`,
					]}
				>
					Bft {beaufort.force} · {beaufort.label}
				</span>
			</div>
			<p class="cw-wind-compass__subtitle">
				Aviation-style heading dial. Cardinal letters mark the dial,
				numerical labels read in tens of degrees, and the live speed
				appears as a digital readout in the centre of the instrument.
			</p>
		</div>

		<div class="cw-wind-compass__reading">
			<span class="cw-wind-compass__reading-label"
				>Wind {fromOrTo}</span
			>
			<strong class="cw-wind-compass__reading-direction"
				>{formattedDirection}</strong
			>
			<small class="cw-wind-compass__reading-cardinal"
				>{directionCardinal}</small
			>
			<small>{formattedSpeed}</small>
			{#if updatedLabel}
				<small>Updated {updatedLabel}</small>
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
			{#each cardinalPositions as c (c.label)}
				<text
					x={c.x}
					y={c.y}
					text-anchor="middle"
					dominant-baseline="central"
					class={[
						"cw-wind-compass__cardinal",
						c.label === "N" && "cw-wind-compass__cardinal--north",
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
				<dt>Direction</dt>
				<dd>
					{formattedDirection}
					<span class="cw-wind-compass__stat-secondary"
						>{directionCardinal}</span
					>
				</dd>
			</div>
			<div class="cw-wind-compass__stat">
				<dt>Heading {fromOrTo === "from" ? "to" : "from"}</dt>
				<dd>{flowCardinal}</dd>
			</div>
			<div class="cw-wind-compass__stat">
				<dt>Speed</dt>
				<dd>{formattedSpeed}</dd>
			</div>
			<div
				class={[
					"cw-wind-compass__stat",
					`cw-wind-compass__stat--${beaufort.tone}`,
				]}
			>
				<dt>Beaufort</dt>
				<dd>F{beaufort.force} · {beaufort.label}</dd>
			</div>
			<div class="cw-wind-compass__stat cw-wind-compass__stat--guidance">
				<dt>Conditions</dt>
				<dd>{beaufort.guidance}</dd>
			</div>
		</dl>
	{/if}

	{#if showLegend}
		<div class="cw-wind-compass__legend">
			<p class="cw-wind-compass__legend-title">Beaufort scale reference</p>
			<div class="cw-wind-compass__legend-grid">
				{#each beaufortGroups as group (group.tone)}
					<div
						class={[
							"cw-wind-compass__legend-item",
							`cw-wind-compass__legend-item--${group.tone}`,
							beaufort.force >= group.minForce &&
								beaufort.force <= group.maxForce &&
								"cw-wind-compass__legend-item--active",
						]}
					>
						<span
							class="cw-wind-compass__legend-swatch"
							aria-hidden="true"
						></span>
						<div>
							<strong>{group.label}</strong>
							<span>F{group.minForce}–F{group.maxForce}</span>
							<small
								>{formatRangeMs(group.minMs, group.maxMs)}</small
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
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

	/* ── Legend ───────────────────────────────────────────── */
	.cw-wind-compass__legend {
		display: grid;
		gap: var(--cw-space-3);
		padding: var(--cw-space-3) var(--cw-space-3) var(--cw-space-4);
		background: color-mix(
			in srgb,
			var(--cw-bg-muted) 35%,
			var(--cw-bg-surface)
		);
		border-radius: var(--cw-radius-lg, 0.75rem);
		border: 1px dashed
			color-mix(in srgb, var(--cw-border-default) 65%, transparent);
	}

	.cw-wind-compass__legend-title {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--cw-text-muted);
		font-weight: 700;
		margin: 0 0 0.25rem;
	}

	.cw-wind-compass__legend-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: var(--cw-space-2);
	}

	.cw-wind-compass__legend-item {
		display: grid;
		grid-template-columns: 0.6rem 1fr;
		gap: 0.7rem;
		align-items: start;
		padding: 0.55rem 0.75rem;
		border-radius: 0.6rem;
		border: 1px solid transparent;
		background: color-mix(in srgb, var(--cw-bg-surface) 75%, transparent);
		transition:
			border-color 180ms ease,
			background-color 180ms ease,
			transform 180ms ease;
	}

	.cw-wind-compass__legend-item--active {
		transform: translateY(-1px);
		background: color-mix(
			in srgb,
			var(--cw-bg-surface-elevated) 78%,
			transparent
		);
		box-shadow: 0 8px 18px -14px color-mix(in srgb, #000 60%, transparent);
	}

	.cw-wind-compass__legend-swatch {
		display: block;
		width: 0.6rem;
		min-height: 100%;
		border-radius: 0.25rem;
	}

	.cw-wind-compass__legend-item strong {
		display: block;
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		margin-bottom: 0.1rem;
	}

	.cw-wind-compass__legend-item span {
		display: block;
		font-size: 0.72rem;
		color: var(--cw-text-secondary);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.cw-wind-compass__legend-item small {
		display: block;
		font-size: 0.72rem;
		color: var(--cw-text-muted);
		margin-top: 0.15rem;
	}

	.cw-wind-compass__legend-item--calm .cw-wind-compass__legend-swatch {
		background: var(--cw-info-500);
	}
	.cw-wind-compass__legend-item--calm.cw-wind-compass__legend-item--active {
		border-color: color-mix(in srgb, var(--cw-info-500) 65%, transparent);
	}
	.cw-wind-compass__legend-item--light .cw-wind-compass__legend-swatch {
		background: var(--cw-success-500);
	}
	.cw-wind-compass__legend-item--light.cw-wind-compass__legend-item--active {
		border-color: color-mix(in srgb, var(--cw-success-500) 65%, transparent);
	}
	.cw-wind-compass__legend-item--moderate .cw-wind-compass__legend-swatch {
		background: var(--cw-primary-500);
	}
	.cw-wind-compass__legend-item--moderate.cw-wind-compass__legend-item--active {
		border-color: color-mix(
			in srgb,
			var(--cw-primary-500) 65%,
			transparent
		);
	}
	.cw-wind-compass__legend-item--strong .cw-wind-compass__legend-swatch {
		background: var(--cw-warning-500);
	}
	.cw-wind-compass__legend-item--strong.cw-wind-compass__legend-item--active {
		border-color: color-mix(in srgb, var(--cw-warning-500) 75%, transparent);
	}
	.cw-wind-compass__legend-item--gale .cw-wind-compass__legend-swatch {
		background: var(--cw-danger-500);
	}
	.cw-wind-compass__legend-item--gale.cw-wind-compass__legend-item--active {
		border-color: color-mix(in srgb, var(--cw-danger-500) 75%, transparent);
	}
	.cw-wind-compass__legend-item--storm .cw-wind-compass__legend-swatch {
		background: var(--cw-danger-700);
	}
	.cw-wind-compass__legend-item--storm.cw-wind-compass__legend-item--active {
		border-color: color-mix(in srgb, var(--cw-danger-700) 80%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.cw-wind-compass__arrow {
			transition: none;
		}
	}
</style>
