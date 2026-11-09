import { describe, expect, it } from 'vitest';
import { cwTooltipShift, cwVisibleArea, type CwTooltipBox } from './cwTooltipPlacement.js';

const VIEWPORT: CwTooltipBox = { left: 0, top: 0, right: 400, bottom: 800 };
const BUBBLE = { width: 120, height: 24 };

/** A trigger `width` wide whose centre is at `x`, on one line at y 100–120. */
function triggerAt(x: number, width = 40): CwTooltipBox {
	return { left: x - width / 2, top: 100, right: x + width / 2, bottom: 120 };
}

describe('cwTooltipShift', () => {
	it('leaves a bubble that fits centred where it is', () => {
		expect(cwTooltipShift('top', triggerAt(200), BUBBLE, VIEWPORT)).toBe(0);
		expect(cwTooltipShift('bottom', triggerAt(200), BUBBLE, VIEWPORT)).toBe(0);
	});

	it('slides a bubble off the left edge back in, keeping the gap', () => {
		// Centred on x 30, the bubble would start at −30; it has to start at 8.
		expect(cwTooltipShift('top', triggerAt(30), BUBBLE, VIEWPORT)).toBe(38);
	});

	it('slides a bubble off the right edge back in', () => {
		// Centred on x 370, the bubble would end at 430; it has to end at 392.
		expect(cwTooltipShift('bottom', triggerAt(370), BUBBLE, VIEWPORT)).toBe(-38);
	});

	it('keeps a bubble wider than the area in view from its start edge', () => {
		expect(cwTooltipShift('top', triggerAt(200), { width: 500, height: 24 }, VIEWPORT)).toBe(58);
	});

	it('stays inside a clipping area that is smaller than the viewport', () => {
		const card: CwTooltipBox = { left: 100, top: 0, right: 300, bottom: 800 };
		expect(cwTooltipShift('top', triggerAt(120), BUBBLE, card)).toBe(48);
		expect(cwTooltipShift('top', triggerAt(120), BUBBLE, card, 0)).toBe(40);
	});

	it('slides a side tooltip up or down instead', () => {
		const nearTop: CwTooltipBox = { left: 200, top: 0, right: 240, bottom: 10 };
		const tall = { width: 120, height: 60 };
		expect(cwTooltipShift('right', nearTop, tall, VIEWPORT)).toBe(33);
		expect(cwTooltipShift('left', nearTop, tall, VIEWPORT)).toBe(33);

		const nearBottom: CwTooltipBox = { left: 200, top: 790, right: 240, bottom: 800 };
		expect(cwTooltipShift('left', nearBottom, tall, VIEWPORT)).toBe(-33);
	});
});

describe('cwVisibleArea', () => {
	interface FakeNode {
		parentElement: FakeNode | null;
		overflow: string;
		box: CwTooltipBox;
	}

	function fakeElement(ancestors: Array<{ overflow: string; box: CwTooltipBox }>) {
		const documentElement = { clientWidth: 400, clientHeight: 800 };
		let parent: FakeNode | null = null;
		for (const ancestor of [...ancestors].reverse()) {
			parent = { parentElement: parent, overflow: ancestor.overflow, box: ancestor.box };
		}
		const element = {
			parentElement: parent,
			ownerDocument: {
				documentElement,
				defaultView: {
					getComputedStyle: (node: FakeNode) => ({ overflowX: node.overflow, overflowY: node.overflow })
				}
			}
		};
		for (let node = parent; node; node = node.parentElement) {
			Object.assign(node, { getBoundingClientRect: () => node.box });
		}
		return element as unknown as Element;
	}

	it('is the viewport when nothing clips', () => {
		const element = fakeElement([{ overflow: 'visible', box: { left: 50, top: 50, right: 90, bottom: 90 } }]);
		expect(cwVisibleArea(element)).toEqual(VIEWPORT);
	});

	it('is cut down by each ancestor that clips', () => {
		const element = fakeElement([
			{ overflow: 'visible', box: { left: 120, top: 300, right: 160, bottom: 320 } },
			{ overflow: 'hidden', box: { left: 100, top: 200, right: 300, bottom: 900 } },
			{ overflow: 'auto', box: { left: 60, top: 64, right: 400, bottom: 800 } }
		]);
		expect(cwVisibleArea(element)).toEqual({ left: 100, top: 200, right: 300, bottom: 800 });
	});

	it('is the viewport when the element has no window', () => {
		const element = {
			parentElement: null,
			ownerDocument: { documentElement: { clientWidth: 400, clientHeight: 800 }, defaultView: null }
		} as unknown as Element;
		expect(cwVisibleArea(element)).toEqual(VIEWPORT);
	});
});
