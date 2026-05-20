import type { CwAlertPointCondition } from "../../types/index.js";

export interface RuleDomain {
	start: number;
	end: number;
	startInclusive: boolean;
	endInclusive: boolean;
}

interface NumericRule {
	condition: CwAlertPointCondition;
	numericValue: number | null;
	numericMin: number | null;
	numericMax: number | null;
	numericReset: number | null;
}

export function domainHasValues(domain: RuleDomain): boolean {
	if (domain.start < domain.end) return true;
	if (domain.start > domain.end) return false;
	if (!Number.isFinite(domain.start)) return false;

	return domain.startInclusive && domain.endInclusive;
}

export function getTriggerDomain(rule: NumericRule): RuleDomain | null {
	switch (rule.condition) {
		case "equals":
			return rule.numericValue === null
				? null
				: {
						start: rule.numericValue,
						end: rule.numericValue,
						startInclusive: true,
						endInclusive: true,
					};
		case "range": {
			if (rule.numericMin === null || rule.numericMax === null) return null;

			return {
				start: Math.min(rule.numericMin, rule.numericMax),
				end: Math.max(rule.numericMin, rule.numericMax),
				startInclusive: true,
				endInclusive: true,
			};
		}
		case "lessThan":
			return rule.numericValue === null
				? null
				: {
						start: Number.NEGATIVE_INFINITY,
						end: rule.numericValue,
						startInclusive: false,
						endInclusive: false,
					};
		case "lessThanOrEqual":
			return rule.numericValue === null
				? null
				: {
						start: Number.NEGATIVE_INFINITY,
						end: rule.numericValue,
						startInclusive: false,
						endInclusive: true,
					};
		case "greaterThan":
			return rule.numericValue === null
				? null
				: {
						start: rule.numericValue,
						end: Number.POSITIVE_INFINITY,
						startInclusive: false,
						endInclusive: false,
					};
		case "greaterThanOrEqual":
			return rule.numericValue === null
				? null
				: {
						start: rule.numericValue,
						end: Number.POSITIVE_INFINITY,
						startInclusive: true,
						endInclusive: false,
					};
	}
}

export function getResetDomains(rule: NumericRule): RuleDomain[] | null {
	switch (rule.condition) {
		case "equals":
			if (rule.numericValue === null) return null;

			return [
				{
					start: Number.NEGATIVE_INFINITY,
					end: rule.numericValue,
					startInclusive: false,
					endInclusive: false,
				},
				{
					start: rule.numericValue,
					end: Number.POSITIVE_INFINITY,
					startInclusive: false,
					endInclusive: false,
				},
			];
		case "range":
			return null;
		case "lessThan":
			return rule.numericReset === null
				? null
				: [
						{
							start: rule.numericReset,
							end: Number.POSITIVE_INFINITY,
							startInclusive: false,
							endInclusive: false,
						},
					];
		case "lessThanOrEqual":
			return rule.numericReset === null
				? null
				: [
						{
							start: rule.numericReset,
							end: Number.POSITIVE_INFINITY,
							startInclusive: true,
							endInclusive: false,
						},
					];
		case "greaterThan":
			return rule.numericReset === null
				? null
				: [
						{
							start: Number.NEGATIVE_INFINITY,
							end: rule.numericReset,
							startInclusive: false,
							endInclusive: false,
						},
					];
		case "greaterThanOrEqual":
			return rule.numericReset === null
				? null
				: [
						{
							start: Number.NEGATIVE_INFINITY,
							end: rule.numericReset,
							startInclusive: false,
							endInclusive: true,
						},
					];
	}
}

export function domainsOverlap(a: RuleDomain, b: RuleDomain): boolean {
	if (a.end < b.start || b.end < a.start) return false;
	if (a.end === b.start) return a.endInclusive && b.startInclusive;
	if (b.end === a.start) return b.endInclusive && a.startInclusive;

	return true;
}

function domainContainsBoundary(domain: RuleDomain, value: number): boolean {
	if (!Number.isFinite(value)) return false;

	const afterStart =
		value > domain.start ||
		(value === domain.start && domain.startInclusive);
	const beforeEnd =
		value < domain.end || (value === domain.end && domain.endInclusive);

	return afterStart && beforeEnd;
}

function makeDomain(
	start: number,
	end: number,
	startInclusive: boolean,
	endInclusive: boolean,
): RuleDomain | null {
	if (start > end) return null;
	if (start === end) {
		if (!Number.isFinite(start)) return null;
		if (!startInclusive || !endInclusive) return null;
	}

	return {
		start,
		end,
		startInclusive,
		endInclusive,
	};
}

function subtractDomain(
	target: RuleDomain,
	cover: RuleDomain,
): RuleDomain[] {
	if (!domainsOverlap(target, cover)) return [target];

	const next: RuleDomain[] = [];

	if (target.start <= cover.start) {
		const left = makeDomain(
			target.start,
			cover.start,
			target.startInclusive,
			domainContainsBoundary(target, cover.start) &&
				!domainContainsBoundary(cover, cover.start),
		);

		if (left) next.push(left);
	}

	if (cover.end <= target.end) {
		const right = makeDomain(
			cover.end,
			target.end,
			domainContainsBoundary(target, cover.end) &&
				!domainContainsBoundary(cover, cover.end),
			target.endInclusive,
		);

		if (right) next.push(right);
	}

	return next;
}

function hasUncoveredDomainValues(
	target: RuleDomain,
	covers: RuleDomain[],
): boolean {
	let remaining = domainHasValues(target) ? [target] : [];

	for (const cover of covers) {
		if (!domainHasValues(cover)) continue;

		remaining = remaining.flatMap((domain) => subtractDomain(domain, cover));
		if (remaining.length === 0) return false;
	}

	return remaining.length > 0;
}

export function areDomainsFullyCovered(
	targets: RuleDomain[],
	covers: RuleDomain[],
): boolean {
	const validTargets = targets.filter(domainHasValues);
	if (validTargets.length === 0) return false;

	return validTargets.every(
		(target) => !hasUncoveredDomainValues(target, covers),
	);
}
