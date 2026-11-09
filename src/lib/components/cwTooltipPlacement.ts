/** A box in viewport coordinates; a `DOMRect` fits. */
export interface CwTooltipBox {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

/** Space kept between a tooltip and the edge of the area it has to stay inside, in px. */
export const CW_TOOLTIP_EDGE_GAP = 8;

/**
 * How far to slide a tooltip along its trigger so it stays inside `area`, in px.
 *
 * The bubble is centred on the trigger: across it for `top` / `bottom`, down
 * its side for `left` / `right`. A positive shift moves it right (or down). A
 * bubble too big for the area keeps its start edge in view.
 */
export function cwTooltipShift(
	position: 'top' | 'bottom' | 'left' | 'right',
	trigger: CwTooltipBox,
	bubble: { width: number; height: number },
	area: CwTooltipBox,
	gap = CW_TOOLTIP_EDGE_GAP
): number {
	const across = position === 'top' || position === 'bottom';
	const size = across ? bubble.width : bubble.height;
	const centre = across ? (trigger.left + trigger.right) / 2 : (trigger.top + trigger.bottom) / 2;
	const start = centre - size / 2;
	const min = (across ? area.left : area.top) + gap;
	const max = (across ? area.right : area.bottom) - gap;

	if (start < min || size > max - min) return min - start;
	if (start + size > max) return max - (start + size);
	return 0;
}

/**
 * Where an element's overflowing content can still be seen: the viewport, cut
 * down by every ancestor that clips its overflow (a scroll area, a card with
 * `overflow: hidden`).
 */
export function cwVisibleArea(element: Element): CwTooltipBox {
	const root = element.ownerDocument.documentElement;
	const view = element.ownerDocument.defaultView;
	let area: CwTooltipBox = { left: 0, top: 0, right: root.clientWidth, bottom: root.clientHeight };
	if (!view) return area;

	for (let node = element.parentElement; node && node !== root; node = node.parentElement) {
		const { overflowX, overflowY } = view.getComputedStyle(node);
		if (overflowX === 'visible' && overflowY === 'visible') continue;
		const box = node.getBoundingClientRect();
		area = {
			left: Math.max(area.left, box.left),
			top: Math.max(area.top, box.top),
			right: Math.min(area.right, box.right),
			bottom: Math.min(area.bottom, box.bottom)
		};
	}
	return area;
}
