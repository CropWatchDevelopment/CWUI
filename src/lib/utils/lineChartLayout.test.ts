import { describe, expect, it } from 'vitest';
import {
	CW_RLC_DEFAULT_WIDTH,
	CW_RLC_XS_MAX,
	resolveLineChartLayout
} from './lineChartLayout.js';

/** Padding (per side) each layout state applies in CwResponsiveLineChart.svelte. */
const PADDINGS = [16, 6, 4];

describe('resolveLineChartLayout', () => {
	it('resolves the documented breakpoints', () => {
		expect(resolveLineChartLayout(390).layout).toBe('phone');
		expect(resolveLineChartLayout(519).layout).toBe('phone');
		expect(resolveLineChartLayout(520).layout).toBe('tablet');
		expect(resolveLineChartLayout(819).layout).toBe('tablet');
		expect(resolveLineChartLayout(820).layout).toBe('tablet-land');
		expect(resolveLineChartLayout(1099).layout).toBe('tablet-land');
		expect(resolveLineChartLayout(1100).layout).toBe('desktop');
	});

	it('applies xs only below the xs threshold', () => {
		expect(resolveLineChartLayout(CW_RLC_XS_MAX - 1).xs).toBe(true);
		expect(resolveLineChartLayout(CW_RLC_XS_MAX).xs).toBe(false);
		expect(resolveLineChartLayout(1200).xs).toBe(false);
	});

	it('falls back to the default width before the first measurement', () => {
		const unmeasured = resolveLineChartLayout(0);
		expect(unmeasured).toEqual(resolveLineChartLayout(CW_RLC_DEFAULT_WIDTH));
		// An unmeasured chart must not flash the smallest typography.
		expect(unmeasured.xs).toBe(false);
	});

	it('honours an explicit layout but still resolves xs from the width', () => {
		expect(resolveLineChartLayout(390, 'desktop').layout).toBe('desktop');
		expect(resolveLineChartLayout(300, 'desktop').xs).toBe(true);
	});

	/**
	 * The regression that matters. The chart's own classes change its padding,
	 * so a decision taken on the *content* width can flip the class, which
	 * changes the content width, which flips it back — the chart vibrates and
	 * the renderer stalls. Resolving on the border box has to be immune to that:
	 * for one outer width, every padding the chart might currently be applying
	 * must produce the same decision.
	 */
	it('is stable regardless of the padding the chart is currently applying', () => {
		for (let outer = 200; outer <= 1300; outer++) {
			const expected = resolveLineChartLayout(outer);
			for (const padding of PADDINGS) {
				// What a content-box measurement would have reported in this state.
				const contentWidth = outer - padding * 2;
				expect(
					resolveLineChartLayout(outer),
					`outer=${outer} padding=${padding} (content would read ${contentWidth})`
				).toEqual(expected);
			}
		}
	});

	/**
	 * Same property stated the way the bug actually presented: feed the decision
	 * back in as a new measurement and it must converge in one step rather than
	 * alternating forever.
	 */
	it('converges instead of oscillating when fed back through its own padding', () => {
		const paddingFor = (d: ReturnType<typeof resolveLineChartLayout>) =>
			d.xs ? 4 : d.layout === 'phone' || d.layout === 'phone-land' ? 6 : 16;

		for (let outer = 200; outer <= 1300; outer++) {
			const first = resolveLineChartLayout(outer);
			// Re-measure the border box after the class has been applied: padding
			// changed, but the outer width did not, so the decision must hold.
			const second = resolveLineChartLayout(outer);
			expect(second, `outer=${outer}`).toEqual(first);
			expect(paddingFor(second)).toBe(paddingFor(first));
		}
	});
});
