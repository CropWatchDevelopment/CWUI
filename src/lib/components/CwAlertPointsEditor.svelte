<script lang="ts">
	import type {
		CwAlertPointCondition,
		CwAlertPointRule,
		CwAlertPointUnit,
		CwAlertPointsValue,
	} from "../types/index.js";
	import CwButton from "./CwButton.svelte";
	import CwCard from "./CwCard.svelte";
	import CwDropdown from "./CwDropdown.svelte";
	import CwInput from "./CwInput.svelte";

	interface Props {
		value?: CwAlertPointsValue;
		onchange?: (value: CwAlertPointsValue) => void;
		tickStep?: number;
		tickCount?: number;
		class?: string;
	}

	interface VisualPoint extends CwAlertPointRule {
		numericValue: number | null;
		numericMin: number | null;
		numericMax: number | null;
		valueError?: string;
		minError?: string;
		maxError?: string;
		overlapError?: string;
	}

	interface RuleGeometry {
		type: "invalid" | "dot" | "segment" | "ray-left" | "ray-right";
		anchor?: number;
		left?: number;
		width?: number;
		inclusive?: boolean;
	}

	interface RuleDomain {
		start: number;
		end: number;
		startInclusive: boolean;
		endInclusive: boolean;
	}

	type PointNumericField = "value" | "min" | "max";

	const STORAGE_UNIT: CwAlertPointUnit = "C";
	const CENTER_DRAFT_KEY = "center";
	const DEFAULT_TICK_INTERVALS = 10;

	const unitOptions = [
		{ label: "°C", value: "C" },
		{ label: "°F", value: "F" },
		{ label: "°K", value: "K" },
	];

	const conditionOptions = [
		{ label: "Equals (=)", value: "equals" },
		{ label: "Range", value: "range" },
		{ label: "Less than (<)", value: "lessThan" },
		{ label: "Less than or equal (<=)", value: "lessThanOrEqual" },
		{ label: "Greater than (>)", value: "greaterThan" },
		{ label: "Greater than or equal (>=)", value: "greaterThanOrEqual" },
	];

	const colorPalette = [
		"#f7903b",
		"#42edf0",
		"#7a8cff",
		"#e35c8d",
		"#4fcf7a",
		"#ffcf5a",
	];
	const numberFormatter = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2,
	});

	function createDefaultValue(): CwAlertPointsValue {
		return {
			unit: STORAGE_UNIT,
			center: "0",
			points: [
				{
					id: "cw-alert-point-1",
					name: "Alert Point 1",
					color: colorPalette[0],
					condition: "equals",
					value: "0",
					min: "",
					max: "",
				},
			],
		};
	}

	let {
		value = $bindable(createDefaultValue()),
		onchange,
		tickStep,
		tickCount,
		class: className = "",
	}: Props = $props();

	let displayUnit = $state<CwAlertPointUnit>(value.unit ?? STORAGE_UNIT);
	let pointSeed = $state(Math.max(value.points.length, 1));
	let numericDrafts = $state<Record<string, string>>({});
	let suppressIncomingNormalization = false;

	function nextPointId() {
		pointSeed += 1;
		return `cw-alert-point-${pointSeed}`;
	}

	function createPoint(index: number, center = "0"): CwAlertPointRule {
		return {
			id: nextPointId(),
			name: `Alert Point ${index}`,
			color: colorPalette[(index - 1) % colorPalette.length],
			condition: "equals",
			value: center,
			min: "",
			max: "",
		};
	}

	function parseNumericInput(raw: string): number | null {
		const trimmed = raw.trim();
		if (!trimmed) return null;

		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}

	function getNumberError(raw: string, label: string): string | undefined {
		if (!raw.trim()) {
			return `${label} is required.`;
		}

		return parseNumericInput(raw) === null
			? "Enter a valid number."
			: undefined;
	}

	function normalizeNumberString(value: number): string {
		const normalized = Number(value.toPrecision(15));
		return Object.is(normalized, -0) ? "0" : String(normalized);
	}

	function toCelsius(value: number, unit: CwAlertPointUnit): number {
		switch (unit) {
			case "C":
				return value;
			case "F":
				return ((value - 32) * 5) / 9;
			case "K":
				return value - 273.15;
		}
	}

	function fromCelsius(value: number, unit: CwAlertPointUnit): number {
		switch (unit) {
			case "C":
				return value;
			case "F":
				return (value * 9) / 5 + 32;
			case "K":
				return value + 273.15;
		}
	}

	function convertStorageToDisplay(
		raw: string,
		unit: CwAlertPointUnit,
	): string {
		const parsed = parseNumericInput(raw);
		return parsed === null
			? raw
			: normalizeNumberString(fromCelsius(parsed, unit));
	}

	function convertDisplayToStorage(
		raw: string,
		unit: CwAlertPointUnit,
	): string {
		const parsed = parseNumericInput(raw);
		return parsed === null
			? raw
			: normalizeNumberString(toCelsius(parsed, unit));
	}

	function normalizeValueToStorage(
		nextValue: CwAlertPointsValue,
	): CwAlertPointsValue {
		const sourceUnit = nextValue.unit ?? STORAGE_UNIT;

		return {
			...nextValue,
			unit: STORAGE_UNIT,
			center: nextValue.center.trim()
				? convertDisplayToStorage(nextValue.center, sourceUnit)
				: "",
			points: nextValue.points.map((point) => ({
				...point,
				value: point.value.trim()
					? convertDisplayToStorage(point.value, sourceUnit)
					: "",
				min: point.min.trim()
					? convertDisplayToStorage(point.min, sourceUnit)
					: "",
				max: point.max.trim()
					? convertDisplayToStorage(point.max, sourceUnit)
					: "",
			})),
		};
	}

	function setInternalValue(next: CwAlertPointsValue) {
		suppressIncomingNormalization = true;
		value = next;
		onchange?.(next);
		queueMicrotask(() => {
			suppressIncomingNormalization = false;
		});
	}

	function clearAllDrafts() {
		if (Object.keys(numericDrafts).length === 0) return;
		numericDrafts = {};
	}

	function getPointDraftKey(id: string, field: PointNumericField): string {
		return `${id}:${field}`;
	}

	function clearDraft(key: string) {
		if (!(key in numericDrafts)) return;

		const { [key]: _discarded, ...rest } = numericDrafts;
		numericDrafts = rest;
	}

	function maybeClearDraft(key: string) {
		const draft = numericDrafts[key];
		if (draft === undefined) return;
		if (!draft.trim() || parseNumericInput(draft) !== null) {
			clearDraft(key);
		}
	}

	function getDisplayInputValue(storageRaw: string, key: string): string {
		return (
			numericDrafts[key] ??
			convertStorageToDisplay(storageRaw, displayUnit)
		);
	}

	function setDraftValue(key: string, raw: string) {
		numericDrafts = {
			...numericDrafts,
			[key]: raw,
		};
	}

	function normalizePoint(point: CwAlertPointRule): VisualPoint {
		const numericValue = parseNumericInput(point.value);
		const numericMin = parseNumericInput(point.min);
		const numericMax = parseNumericInput(point.max);

		if (point.condition === "range") {
			return {
				...point,
				numericValue,
				numericMin,
				numericMax,
				minError: getNumberError(point.min, "Min value"),
				maxError: getNumberError(point.max, "Max value"),
			};
		}

		return {
			...point,
			numericValue,
			numericMin,
			numericMax,
			valueError: getNumberError(point.value, "Value"),
		};
	}

	function getPointLabel(point: CwAlertPointRule, index: number): string {
		return point.name.trim() || `Alert Point ${index + 1}`;
	}

	function getRuleDomain(point: VisualPoint): RuleDomain | null {
		switch (point.condition) {
			case "equals":
				return point.numericValue === null
					? null
					: {
							start: point.numericValue,
							end: point.numericValue,
							startInclusive: true,
							endInclusive: true,
						};
			case "range": {
				if (point.numericMin === null || point.numericMax === null)
					return null;

				return {
					start: Math.min(point.numericMin, point.numericMax),
					end: Math.max(point.numericMin, point.numericMax),
					startInclusive: true,
					endInclusive: true,
				};
			}
			case "lessThan":
				return point.numericValue === null
					? null
					: {
							start: Number.NEGATIVE_INFINITY,
							end: point.numericValue,
							startInclusive: false,
							endInclusive: false,
						};
			case "lessThanOrEqual":
				return point.numericValue === null
					? null
					: {
							start: Number.NEGATIVE_INFINITY,
							end: point.numericValue,
							startInclusive: false,
							endInclusive: true,
						};
			case "greaterThan":
				return point.numericValue === null
					? null
					: {
							start: point.numericValue,
							end: Number.POSITIVE_INFINITY,
							startInclusive: false,
							endInclusive: false,
						};
			case "greaterThanOrEqual":
				return point.numericValue === null
					? null
					: {
							start: point.numericValue,
							end: Number.POSITIVE_INFINITY,
							startInclusive: true,
							endInclusive: false,
						};
		}
	}

	function domainsOverlap(a: RuleDomain, b: RuleDomain): boolean {
		if (a.end < b.start || b.end < a.start) return false;
		if (a.end === b.start) return a.endInclusive && b.startInclusive;
		if (b.end === a.start) return b.endInclusive && a.startInclusive;
		return true;
	}

	function buildOverlapErrors(points: VisualPoint[]): Record<string, string> {
		const conflicts: Record<string, string[]> = {};

		for (let index = 0; index < points.length; index += 1) {
			const current = points[index];
			const currentDomain = getRuleDomain(current);
			if (!currentDomain) continue;

			for (
				let compareIndex = index + 1;
				compareIndex < points.length;
				compareIndex += 1
			) {
				const comparison = points[compareIndex];
				const comparisonDomain = getRuleDomain(comparison);
				if (
					!comparisonDomain ||
					!domainsOverlap(currentDomain, comparisonDomain)
				)
					continue;

				const currentLabel = getPointLabel(current, index);
				const comparisonLabel = getPointLabel(comparison, compareIndex);

				if (!conflicts[current.id]) conflicts[current.id] = [];
				if (!conflicts[comparison.id]) conflicts[comparison.id] = [];
				if (!conflicts[current.id].includes(comparisonLabel))
					conflicts[current.id].push(comparisonLabel);
				if (!conflicts[comparison.id].includes(currentLabel))
					conflicts[comparison.id].push(currentLabel);
			}
		}

		return Object.fromEntries(
			Object.entries(conflicts).map(([id, labels]) => [
				id,
				`Overlaps with ${labels.join(", ")}. Each alert rule must cover a unique part of the number line.`,
			]),
		);
	}

	function niceStep(raw: number): number {
		if (!Number.isFinite(raw) || raw <= 0) return 1;

		const exponent = 10 ** Math.floor(Math.log10(raw));
		const normalized = raw / exponent;

		if (normalized <= 1) return exponent;
		if (normalized <= 2) return 2 * exponent;
		if (normalized <= 5) return 5 * exponent;
		return 10 * exponent;
	}

	function formatNumber(value: number): string {
		return Number.isInteger(value)
			? String(value)
			: numberFormatter.format(value);
	}

	function clampPercent(value: number): number {
		return Math.max(0, Math.min(100, value));
	}

	function toPercent(value: number, min: number, max: number): number {
		return clampPercent(((value - min) / (max - min || 1)) * 100);
	}

	function getExtent(center: number, points: VisualPoint[]): number {
		const distances = [10];

		for (const point of points) {
			if (point.condition === "range") {
				if (point.numericMin !== null)
					distances.push(Math.abs(point.numericMin - center));
				if (point.numericMax !== null)
					distances.push(Math.abs(point.numericMax - center));
				continue;
			}

			if (point.numericValue !== null) {
				distances.push(Math.abs(point.numericValue - center));
			}
		}

		return niceStep(Math.max(10, Math.max(...distances) * 1.25));
	}

	function buildTicks(center: number, extent: number): number[] {
		const step = niceStep((extent * 2) / DEFAULT_TICK_INTERVALS);
		const stepsPerSide = Math.max(2, Math.ceil(extent / step));

		return Array.from(
			{ length: stepsPerSide * 2 + 1 },
			(_, index) => center + (index - stepsPerSide) * step,
		);
	}

	function normalizeNumericTick(value: number): number {
		const normalized = Number(value.toPrecision(15));
		return Object.is(normalized, -0) ? 0 : normalized;
	}

	function normalizeTickStep(value: number | undefined): number | undefined {
		if (value === undefined || !Number.isFinite(value) || value <= 0) {
			return undefined;
		}

		return normalizeNumericTick(value);
	}

	function buildTicksByStep(
		min: number,
		max: number,
		step: number,
	): number[] {
		const startIndex = Math.ceil(min / step);
		const endIndex = Math.floor(max / step);

		if (endIndex < startIndex) return [];

		return Array.from({ length: endIndex - startIndex + 1 }, (_, index) =>
			normalizeNumericTick((startIndex + index) * step),
		);
	}

	function isCenterTick(tick: number, center: number): boolean {
		return Math.abs(tick - center) <= 1e-9;
	}

	function getGeometry(
		point: VisualPoint,
		min: number,
		max: number,
	): RuleGeometry {
		switch (point.condition) {
			case "equals": {
				if (point.numericValue === null) return { type: "invalid" };
				return {
					type: "dot",
					anchor: toPercent(point.numericValue, min, max),
				};
			}
			case "range": {
				if (point.numericMin === null || point.numericMax === null) {
					return { type: "invalid" };
				}

				const start = toPercent(
					Math.min(point.numericMin, point.numericMax),
					min,
					max,
				);
				const end = toPercent(
					Math.max(point.numericMin, point.numericMax),
					min,
					max,
				);

				return {
					type: "segment",
					left: start,
					width: Math.max(end - start, 0.75),
				};
			}
			case "lessThan":
			case "lessThanOrEqual": {
				if (point.numericValue === null) return { type: "invalid" };

				const anchor = toPercent(point.numericValue, min, max);
				return {
					type: "ray-left",
					anchor,
					width: anchor,
					inclusive: point.condition === "lessThanOrEqual",
				};
			}
			case "greaterThan":
			case "greaterThanOrEqual": {
				if (point.numericValue === null) return { type: "invalid" };

				const anchor = toPercent(point.numericValue, min, max);
				return {
					type: "ray-right",
					anchor,
					left: anchor,
					width: 100 - anchor,
					inclusive: point.condition === "greaterThanOrEqual",
				};
			}
		}
	}

	function describePoint(point: VisualPoint, unit: CwAlertPointUnit): string {
		switch (point.condition) {
			case "equals":
				return point.numericValue === null
					? "Waiting for a value."
					: `Equals ${formatNumber(point.numericValue)} ${unit}`;
			case "range":
				return point.numericMin === null || point.numericMax === null
					? "Range requires both min and max."
					: `Range ${formatNumber(point.numericMin)} to ${formatNumber(point.numericMax)} ${unit}`;
			case "lessThan":
				return point.numericValue === null
					? "Waiting for a threshold."
					: `< ${formatNumber(point.numericValue)} ${unit}`;
			case "lessThanOrEqual":
				return point.numericValue === null
					? "Waiting for a threshold."
					: `<= ${formatNumber(point.numericValue)} ${unit}`;
			case "greaterThan":
				return point.numericValue === null
					? "Waiting for a threshold."
					: `> ${formatNumber(point.numericValue)} ${unit}`;
			case "greaterThanOrEqual":
				return point.numericValue === null
					? "Waiting for a threshold."
					: `>= ${formatNumber(point.numericValue)} ${unit}`;
		}
	}

	function commit(next: CwAlertPointsValue) {
		setInternalValue(normalizeValueToStorage(next));
	}

	function updateTopLevel<K extends keyof CwAlertPointsValue>(
		key: K,
		nextValue: CwAlertPointsValue[K],
	) {
		commit({
			...value,
			[key]: nextValue,
		});
	}

	function updatePoint(id: string, patch: Partial<CwAlertPointRule>) {
		commit({
			...value,
			points: value.points.map((point) =>
				point.id === id ? { ...point, ...patch } : point,
			),
		});
	}

	function updateDisplayUnit(nextUnit: CwAlertPointUnit) {
		if (displayUnit === nextUnit) return;
		clearAllDrafts();
		displayUnit = nextUnit;
	}

	function updateCenterFromDisplay(raw: string) {
		setDraftValue(CENTER_DRAFT_KEY, raw);

		if (!raw.trim()) {
			updateTopLevel("center", "");
			return;
		}

		if (parseNumericInput(raw) === null) return;
		updateTopLevel("center", convertDisplayToStorage(raw, displayUnit));
	}

	function updatePointFromDisplay(
		id: string,
		field: PointNumericField,
		raw: string,
	) {
		const key = getPointDraftKey(id, field);
		setDraftValue(key, raw);

		if (!raw.trim()) {
			updatePoint(id, { [field]: "" } as Partial<CwAlertPointRule>);
			return;
		}

		if (parseNumericInput(raw) === null) return;
		updatePoint(id, {
			[field]: convertDisplayToStorage(raw, displayUnit),
		} as Partial<CwAlertPointRule>);
	}

	function handleConditionChange(id: string, rawCondition: string) {
		const condition = rawCondition as CwAlertPointCondition;
		const currentPoint = value.points.find((point) => point.id === id);
		if (!currentPoint) return;

		if (condition === "range") {
			const fallback =
				currentPoint.value ||
				currentPoint.min ||
				currentPoint.max ||
				value.center ||
				"0";
			updatePoint(id, {
				condition,
				value: "",
				min: currentPoint.min || fallback,
				max: currentPoint.max || fallback,
			});
			return;
		}

		const fallback =
			currentPoint.value ||
			currentPoint.min ||
			currentPoint.max ||
			value.center ||
			"0";
		updatePoint(id, {
			condition,
			value: fallback,
			min: "",
			max: "",
		});
	}

	function addPoint() {
		const nextIndex = value.points.length + 1;

		commit({
			...value,
			points: [
				...value.points,
				createPoint(nextIndex, value.center || "0"),
			],
		});
	}

	function removePoint(id: string) {
		commit({
			...value,
			points: value.points.filter((point) => point.id !== id),
		});
	}

	if (value.unit !== STORAGE_UNIT) {
		const normalizedInitialValue = normalizeValueToStorage(value);
		setInternalValue(normalizedInitialValue);
	}

	$effect(() => {
		const incomingUnit = value.unit ?? STORAGE_UNIT;
		if (suppressIncomingNormalization || incomingUnit === STORAGE_UNIT) {
			return;
		}

		clearAllDrafts();
		displayUnit = incomingUnit;
		setInternalValue({
			...value,
			unit: STORAGE_UNIT,
		});
	});

	const centerDisplayValue = $derived.by(() =>
		getDisplayInputValue(value.center, CENTER_DRAFT_KEY),
	);
	const centerError = $derived.by(() => {
		if (!centerDisplayValue.trim()) return "Center is required.";
		return parseNumericInput(centerDisplayValue) === null
			? "Enter a valid number."
			: undefined;
	});

	const centerNumber = $derived(parseNumericInput(centerDisplayValue) ?? 0);
	const visualPoints = $derived.by(() => {
		const normalizedPoints = value.points.map((point) =>
			normalizePoint({
				...point,
				value: getDisplayInputValue(
					point.value,
					getPointDraftKey(point.id, "value"),
				),
				min: getDisplayInputValue(
					point.min,
					getPointDraftKey(point.id, "min"),
				),
				max: getDisplayInputValue(
					point.max,
					getPointDraftKey(point.id, "max"),
				),
			}),
		);
		const overlapErrors = buildOverlapErrors(normalizedPoints);

		return normalizedPoints.map((point) => ({
			...point,
			overlapError: overlapErrors[point.id],
		}));
	});
	const axisExtent = $derived.by(() => getExtent(centerNumber, visualPoints));
	const axisMin = $derived(centerNumber - axisExtent);
	const axisMax = $derived(centerNumber + axisExtent);
	const normalizedTickStep = $derived.by(() =>
		normalizeTickStep(tickStep ?? tickCount),
	);
	const axisTicks = $derived.by(() =>
		normalizedTickStep === undefined
			? buildTicks(centerNumber, axisExtent)
			: buildTicksByStep(axisMin, axisMax, normalizedTickStep),
	);
	const overlapPreviewCount = $derived.by(
		() => visualPoints.filter((point) => point.overlapError).length,
	);
	const invalidPreviewCount = $derived.by(
		() =>
			visualPoints.filter(
				(point) =>
					getGeometry(point, axisMin, axisMax).type === "invalid",
			).length,
	);
</script>

<section class="cw-alert-points {className}">
	<CwCard class="cw-alert-points__preview-card" padded={false}>
		<section
			class="cw-alert-points__preview"
			aria-labelledby="cw-alert-points-preview"
		>
			<div class="cw-alert-points__toolbar">
				<div class="cw-alert-points__toolbar-fields">
					<div
						class="cw-alert-points__toolbar-field cw-alert-points__toolbar-field--unit"
					>
						<span class="cw-alert-points__toolbar-label">Unit</span>
						<CwDropdown
							options={unitOptions}
							value={displayUnit}
							onchange={(nextUnit) =>
								updateDisplayUnit(nextUnit as CwAlertPointUnit)}
						/>
					</div>

					<CwInput
						label={`Center (${displayUnit})`}
						type="numeric"
						value={centerDisplayValue}
						error={centerError}
						oninput={(event) =>
							updateCenterFromDisplay(
								(event.currentTarget as HTMLInputElement).value,
							)}
						onblur={() => maybeClearDraft(CENTER_DRAFT_KEY)}
					/>
				</div>

				<CwButton variant="secondary" onclick={addPoint}>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M8 3.5v9M3.5 8h9"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
					Add Alert Point
				</CwButton>
			</div>

			<div class="cw-alert-points__plot">
				{#if visualPoints.length === 0}
					<div class="cw-alert-points__empty">
						<p>No alert points yet.</p>
						<span
							>Add one to start mapping values onto the number
							line.</span
						>
					</div>
				{:else}
					<div class="cw-alert-points__legend">
						{#each visualPoints as point (point.id)}
							{@const geometry = getGeometry(
								point,
								axisMin,
								axisMax,
							)}
							<div
								class="cw-alert-points__legend-item"
								class:cw-alert-points__legend-item--inactive={geometry.type ===
									"invalid"}
								style={`--cw-alert-color:${point.color};`}
							>
								<span
									class="cw-alert-points__legend-swatch"
									aria-hidden="true"
								></span>
								<div class="cw-alert-points__legend-copy">
									<strong>{point.name}</strong>
									<span
										>{describePoint(
											point,
											displayUnit,
										)}</span
									>
								</div>
							</div>
						{/each}
					</div>

					<div class="cw-alert-points__line-visual">
						<div class="cw-alert-points__line-guide"></div>
						<div
							class="cw-alert-points__line-center"
							aria-hidden="true"
						></div>

						{#each visualPoints as point (point.id)}
							{@const geometry = getGeometry(
								point,
								axisMin,
								axisMax,
							)}
							{#if geometry.type === "dot"}
								<div
									class="cw-alert-points__dot"
									style={`--cw-alert-color:${point.color};left:${geometry.anchor}%`}
								>
									<span class="cw-alert-points__dot-core"
									></span>
								</div>
							{:else if geometry.type === "segment"}
								<div
									class="cw-alert-points__segment"
									style={`--cw-alert-color:${point.color};left:${geometry.left}%;width:${geometry.width}%`}
								></div>
							{:else if geometry.type === "ray-left"}
								<div
									class="cw-alert-points__ray cw-alert-points__ray--left"
									style={`--cw-alert-color:${point.color};width:${geometry.width}%`}
								>
									<span
										class="cw-alert-points__ray-arrow cw-alert-points__ray-arrow--left"
									></span>
								</div>
								<div
									class="cw-alert-points__endpoint"
									class:cw-alert-points__endpoint--filled={geometry.inclusive}
									style={`--cw-alert-color:${point.color};left:${geometry.anchor}%`}
								></div>
							{:else if geometry.type === "ray-right"}
								<div
									class="cw-alert-points__ray cw-alert-points__ray--right"
									style={`--cw-alert-color:${point.color};left:${geometry.left}%;width:${geometry.width}%`}
								>
									<span
										class="cw-alert-points__ray-arrow cw-alert-points__ray-arrow--right"
									></span>
								</div>
								<div
									class="cw-alert-points__endpoint"
									class:cw-alert-points__endpoint--filled={geometry.inclusive}
									style={`--cw-alert-color:${point.color};left:${geometry.anchor}%`}
								></div>
							{/if}
						{/each}
					</div>

					{#if invalidPreviewCount > 0}
						<p class="cw-alert-points__plot-note">
							{invalidPreviewCount} rule{invalidPreviewCount === 1
								? ""
								: "s"} still need complete values before they can
							be drawn.
						</p>
					{/if}

					{#if overlapPreviewCount > 0}
						<p
							class="cw-alert-points__plot-note cw-alert-points__plot-note--danger"
						>
							{overlapPreviewCount} rule{overlapPreviewCount === 1
								? ""
								: "s"} overlap another rule. Adjust the values so
							each rule covers a unique part of the number line.
						</p>
					{/if}
				{/if}

				<div class="cw-alert-points__axis" aria-hidden="true">
					{#each axisTicks as tick (tick)}
						<div
							class="cw-alert-points__tick"
							style={`left:${toPercent(tick, axisMin, axisMax)}%`}
						>
							<span class="cw-alert-points__tick-mark"></span>
							<span
								class="cw-alert-points__tick-label"
								class:cw-alert-points__tick-label--center={isCenterTick(
									tick,
									centerNumber,
								)}
							>
								{formatNumber(tick)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</CwCard>

	<div class="cw-alert-points__editor">
		{#each visualPoints as point (point.id)}
			<CwCard
				class={`cw-alert-points__card-shell${!!point.valueError || !!point.minError || !!point.maxError || !!point.overlapError ? " cw-alert-points__card-shell--invalid" : ""}`}
				padded={false}
			>
				<article class="cw-alert-points__card">
					<div class="cw-alert-points__card-top">
						<CwInput
							label="Name"
							type="text"
							value={point.name}
							oninput={(event) =>
								updatePoint(point.id, {
									name: (
										event.currentTarget as HTMLInputElement
									).value,
								})}
						/>

						<CwDropdown
							label="Condition"
							options={conditionOptions}
							value={point.condition}
							error={point.overlapError}
							onchange={(nextCondition) =>
								handleConditionChange(point.id, nextCondition)}
						/>

						<div class="cw-alert-points__remove">
							<CwButton
								variant="danger"
								onclick={() => removePoint(point.id)}
							>
								<svg
									viewBox="0 0 16 16"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M4.5 4.5l7 7M11.5 4.5l-7 7"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
								Remove
							</CwButton>
						</div>
					</div>

					<div
						class="cw-alert-points__values"
						class:cw-alert-points__values--range={point.condition ===
							"range"}
					>
						{#if point.condition === "range"}
							<CwInput
								label={`Min Value (${displayUnit})`}
								type="numeric"
								value={point.min}
								error={point.minError}
								oninput={(event) =>
									updatePointFromDisplay(
										point.id,
										"min",
										(
											event.currentTarget as HTMLInputElement
										).value,
									)}
								onblur={() =>
									maybeClearDraft(
										getPointDraftKey(point.id, "min"),
									)}
							/>
							<CwInput
								label={`Max Value (${displayUnit})`}
								type="numeric"
								value={point.max}
								error={point.maxError}
								oninput={(event) =>
									updatePointFromDisplay(
										point.id,
										"max",
										(
											event.currentTarget as HTMLInputElement
										).value,
									)}
								onblur={() =>
									maybeClearDraft(
										getPointDraftKey(point.id, "max"),
									)}
							/>
						{:else}
							<CwInput
								label={`Value (${displayUnit})`}
								type="numeric"
								value={point.value}
								error={point.valueError}
								oninput={(event) =>
									updatePointFromDisplay(
										point.id,
										"value",
										(
											event.currentTarget as HTMLInputElement
										).value,
									)}
								onblur={() =>
									maybeClearDraft(
										getPointDraftKey(point.id, "value"),
									)}
							/>
						{/if}

						<div class="cw-alert-points__color-stack">
							<CwInput
								label="Color"
								type="color"
								value={point.color}
								oninput={(event) =>
									updatePoint(point.id, {
										color: (
											event.currentTarget as HTMLInputElement
										).value,
									})}
							/>
						</div>
					</div>
					{#if point.min && point.max && point.min === point.max}
						<div class="w-full">
							<p class="text-red-600">
								Min and Max are the same. Consider using
								"equals" condition instead for clarity.
							</p>
						</div>
					{/if}
				</article>
			</CwCard>
		{/each}
	</div>
</section>

<style>
	.cw-alert-points {
		display: grid;
		gap: var(--cw-space-5);
	}

	.cw-alert-points__toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--cw-space-4);
		align-items: end;
	}

	.cw-alert-points__toolbar-fields {
		display: grid;
		grid-template-columns: minmax(8rem, 10rem) minmax(12rem, 16rem);
		gap: var(--cw-space-4);
		align-items: end;
	}

	.cw-alert-points__toolbar-field {
		display: grid;
		gap: var(--cw-space-2);
	}

	.cw-alert-points__toolbar-label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	:global(.cw-alert-points__preview-card .cw-card__body),
	:global(.cw-alert-points__card-shell .cw-card__body) {
		padding: 0;
	}

	:global(.cw-alert-points__card-shell--invalid) {
		border-color: color-mix(
			in srgb,
			var(--cw-danger-500) 32%,
			var(--cw-border-default)
		);
	}

	.cw-alert-points__preview {
		display: grid;
		gap: var(--cw-space-4);
		padding: clamp(1rem, 2vw, 1.5rem);
	}

	.cw-alert-points__preview-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--cw-space-3);
		align-items: start;
	}

	.cw-alert-points__eyebrow {
		margin: 0 0 var(--cw-space-1);
		font-size: 0.72rem;
		font-weight: var(--cw-font-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--cw-accent);
	}

	.cw-alert-points__preview-head p,
	.cw-alert-points__rule-text {
		margin: 0;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
		line-height: 1.6;
	}

	.cw-alert-points__plot {
		display: grid;
		gap: var(--cw-space-3);
	}

	.cw-alert-points__legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-2);
	}

	.cw-alert-points__legend-item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: 0.45rem 0.7rem;
		border-radius: var(--cw-radius-full);
		background: color-mix(
			in srgb,
			var(--cw-alert-color) 12%,
			var(--cw-bg-base)
		);
		border: 1px solid
			color-mix(in srgb, var(--cw-alert-color) 24%, transparent);
	}

	.cw-alert-points__legend-item--inactive {
		opacity: 0.62;
	}

	.cw-alert-points__legend-swatch {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 999px;
		background: var(--cw-alert-color);
		box-shadow: 0 0 0 2px
			color-mix(in srgb, var(--cw-alert-color) 18%, transparent);
	}

	.cw-alert-points__legend-copy {
		display: grid;
		gap: 0.08rem;
	}

	.cw-alert-points__legend-copy strong {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-primary);
	}

	.cw-alert-points__legend-copy span {
		font-size: 0.72rem;
		color: var(--cw-text-muted);
	}

	.cw-alert-points__line-visual {
		position: relative;
		height: 3rem;
		border-radius: var(--cw-radius-md);
		overflow: hidden;
		background-color: var(--cw-bg-muted);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 72%, transparent);
	}

	.cw-alert-points__line-guide,
	.cw-alert-points__ray,
	.cw-alert-points__segment {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
	}

	.cw-alert-points__line-guide {
		left: 0.75rem;
		right: 0.75rem;
		height: 2px;
		background: color-mix(
			in srgb,
			var(--cw-border-default) 88%,
			transparent
		);
	}

	.cw-alert-points__line-center {
		position: absolute;
		top: 0.4rem;
		bottom: 0.4rem;
		left: 50%;
		width: 1px;
		background-color: color-mix(in srgb, var(--cw-accent) 42%, transparent);
	}

	.cw-alert-points__dot,
	.cw-alert-points__endpoint {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 2px solid var(--cw-alert-color);
		background: var(--cw-bg-base);
		box-shadow: 0 0 0 4px
			color-mix(in srgb, var(--cw-alert-color) 14%, transparent);
		z-index: 2;
	}

	.cw-alert-points__dot-core {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		background: var(--cw-alert-color);
		transform: scale(0.58);
	}

	.cw-alert-points__endpoint--filled {
		background: var(--cw-alert-color);
	}

	.cw-alert-points__segment,
	.cw-alert-points__ray {
		height: 0.7rem;
		border-radius: var(--cw-radius-full);
		border: 1px solid
			color-mix(in srgb, var(--cw-alert-color) 72%, transparent);
		background-color: color-mix(
			in srgb,
			var(--cw-alert-color) 34%,
			transparent
		);
		z-index: 1;
	}

	.cw-alert-points__ray-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 0.65rem;
		height: 0.65rem;
	}

	.cw-alert-points__ray-arrow::before {
		content: "";
		position: absolute;
		inset: 0;
		border-top: 1px solid
			color-mix(in srgb, var(--cw-alert-color) 82%, transparent);
		border-right: 1px solid
			color-mix(in srgb, var(--cw-alert-color) 82%, transparent);
	}

	.cw-alert-points__ray-arrow--left {
		left: 0.3rem;
	}

	.cw-alert-points__ray-arrow--left::before {
		transform: rotate(-135deg);
	}

	.cw-alert-points__ray-arrow--right {
		right: 0.3rem;
	}

	.cw-alert-points__ray-arrow--right::before {
		transform: rotate(45deg);
	}

	.cw-alert-points__empty {
		display: grid;
		place-items: center;
		text-align: center;
		min-height: 6rem;
		padding: var(--cw-space-4);
		border-radius: var(--cw-radius-md);
		border: 1px dashed
			color-mix(in srgb, var(--cw-border-default) 78%, transparent);
		background: color-mix(in srgb, var(--cw-bg-muted) 72%, transparent);
		color: var(--cw-text-muted);
	}

	.cw-alert-points__empty p {
		margin: 0;
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-primary);
	}

	.cw-alert-points__empty span {
		font-size: var(--cw-text-sm);
	}

	.cw-alert-points__plot-note {
		margin: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-alert-points__plot-note--danger {
		color: var(--cw-danger-500);
	}

	.cw-alert-points__axis {
		position: relative;
		height: 3.5rem;
		padding-top: var(--cw-space-2);
		border-top: 1px solid
			color-mix(in srgb, var(--cw-border-default) 72%, transparent);
	}

	.cw-alert-points__tick {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: grid;
		justify-items: center;
		gap: var(--cw-space-1);
	}

	.cw-alert-points__tick-mark {
		width: 1px;
		height: 0.65rem;
		background: color-mix(
			in srgb,
			var(--cw-border-strong) 70%,
			transparent
		);
	}

	.cw-alert-points__tick-label {
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
		white-space: nowrap;
	}

	.cw-alert-points__tick-label--center {
		color: var(--cw-accent);
		font-weight: var(--cw-font-semibold);
	}

	.cw-alert-points__editor {
		display: grid;
		gap: var(--cw-space-4);
	}

	.cw-alert-points__card {
		display: grid;
		gap: var(--cw-space-4);
		padding: clamp(1rem, 2vw, 1.35rem);
	}

	.cw-alert-points__card-top {
		display: grid;
		grid-template-columns: minmax(14rem, 1fr) minmax(14rem, 18rem) auto;
		gap: var(--cw-space-4);
		align-items: end;
	}

	.cw-alert-points__color-stack,
	.cw-alert-points__remove {
		display: grid;
		gap: var(--cw-space-2);
	}

	.cw-alert-points__values {
		display: grid;
		grid-template-columns: minmax(12rem, 1fr) minmax(9rem, 11rem);
		gap: var(--cw-space-4);
		align-items: end;
	}

	.cw-alert-points__values--range {
		grid-template-columns: minmax(12rem, 1fr) minmax(12rem, 1fr) minmax(
				9rem,
				11rem
			);
	}

	.cw-alert-points__rule-text {
		padding: var(--cw-space-3);
		border-radius: var(--cw-radius-md);
		background: color-mix(in srgb, var(--cw-bg-base) 74%, transparent);
		border: 1px solid
			color-mix(in srgb, var(--cw-border-default) 72%, transparent);
	}

	@media (max-width: 960px) {
		.cw-alert-points__card-top {
			grid-template-columns: repeat(2, minmax(12rem, 1fr));
		}
	}

	@media (max-width: 720px) {
		.cw-alert-points__toolbar-fields,
		.cw-alert-points__card-top,
		.cw-alert-points__values {
			grid-template-columns: 1fr;
		}

		.cw-alert-points__toolbar {
			align-items: stretch;
		}

		.cw-alert-points__tick-label {
			font-size: 0.68rem;
		}
	}
</style>
