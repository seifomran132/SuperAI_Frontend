import type { AgentRegion } from './agent';

// Box arithmetic for the «حدّد مكان …» step (S30). Everything is in fractions
// of the image (0-1 from its top left), as the API takes it (§11.1); the
// image is never mirrored, whatever the page direction.

/** The contract's smallest side (§11.1). */
export const REGION_MIN = 0.03;
/** Arrow-key steps: fine, and with Shift. */
export const NUDGE = 0.01;
export const NUDGE_BIG = 0.05;

export type Corner = 'nw' | 'ne' | 'sw' | 'se';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** The box spanned by two points of a drag, inside the image. */
export function fromPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
): AgentRegion {
  const x1 = clamp(Math.min(a.x, b.x));
  const y1 = clamp(Math.min(a.y, b.y));
  const x2 = clamp(Math.max(a.x, b.x));
  const y2 = clamp(Math.max(a.y, b.y));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

/** Moves the whole box, keeping it inside the image. */
export function moveBy(box: AgentRegion, dx: number, dy: number): AgentRegion {
  return {
    ...box,
    x: clamp(box.x + dx, 0, 1 - box.width),
    y: clamp(box.y + dy, 0, 1 - box.height),
  };
}

/** Drags one corner to a point; the opposite corner stays put. */
export function resizeCorner(
  box: AgentRegion,
  corner: Corner,
  to: { x: number; y: number },
): AgentRegion {
  const left = box.x;
  const top = box.y;
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  const fixed = {
    x: corner === 'nw' || corner === 'sw' ? right : left,
    y: corner === 'nw' || corner === 'ne' ? bottom : top,
  };
  return fromPoints(fixed, to);
}

/** Grows (or shrinks) width and height from the top-left corner, for the keyboard. */
export function growBy(box: AgentRegion, dw: number, dh: number): AgentRegion {
  return {
    ...box,
    width: clamp(box.width + dw, REGION_MIN, 1 - box.x),
    height: clamp(box.height + dh, REGION_MIN, 1 - box.y),
  };
}

/** A centred box for Enter on the image (keyboard users). */
export const centred = (): AgentRegion => ({
  x: 0.3,
  y: 0.3,
  width: 0.4,
  height: 0.4,
});

export const isValidRegion = (box: AgentRegion | null): box is AgentRegion =>
  box !== null &&
  box.width >= REGION_MIN &&
  box.height >= REGION_MIN &&
  box.x >= 0 &&
  box.y >= 0 &&
  box.x + box.width <= 1 + 1e-9 &&
  box.y + box.height <= 1 + 1e-9;

const round4 = (v: number) => Math.round(v * 10_000) / 10_000;

/** What is sent: four decimals, as the server stores it, still inside the image. */
export function toAnswer(box: AgentRegion): AgentRegion {
  const x = round4(box.x);
  const y = round4(box.y);
  return {
    x,
    y,
    width: Math.min(round4(box.width), round4(1 - x)),
    height: Math.min(round4(box.height), round4(1 - y)),
  };
}

/** Whole percentages for the screen-reader announcement. */
export const percent = (v: number) => Math.round(v * 100);
