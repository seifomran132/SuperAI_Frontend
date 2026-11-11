import { describe, expect, it } from 'vitest';
import {
  fromPoints,
  growBy,
  isValidRegion,
  moveBy,
  resizeCorner,
  toAnswer,
} from '../region';

describe('region boxes', () => {
  it('spans a drag in any direction and stays inside the image', () => {
    expect(fromPoints({ x: 0.8, y: 0.9 }, { x: 0.2, y: 1.4 })).toEqual({
      x: 0.2,
      y: 0.9,
      width: 0.6000000000000001,
      height: 0.09999999999999998,
    });
  });

  it('moves without leaving the image', () => {
    const box = { x: 0.5, y: 0.5, width: 0.4, height: 0.4 };
    expect(moveBy(box, 0.5, -0.9)).toEqual({ ...box, x: 0.6, y: 0 });
  });

  it('resizes from a corner, keeping the opposite one', () => {
    const box = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 };
    const out = resizeCorner(box, 'nw', { x: 0.1, y: 0.3 });
    expect(out.x).toBeCloseTo(0.1);
    expect(out.y).toBeCloseTo(0.3);
    expect(out.x + out.width).toBeCloseTo(0.6);
    expect(out.y + out.height).toBeCloseTo(0.6);
  });

  it('grows within limits for the keyboard', () => {
    const box = { x: 0.9, y: 0.1, width: 0.05, height: 0.05 };
    const out = growBy(box, 0.5, -0.5);
    expect(out.width).toBeCloseTo(0.1);
    expect(out.height).toBeCloseTo(0.03);
  });

  it('accepts the contract minimum, 0.03 per side', () => {
    expect(isValidRegion({ x: 0, y: 0, width: 0.03, height: 0.03 })).toBe(true);
    expect(isValidRegion({ x: 0, y: 0, width: 0.029, height: 0.5 })).toBe(
      false,
    );
    expect(isValidRegion(null)).toBe(false);
  });

  it('sends four decimals that stay inside the image', () => {
    expect(
      toAnswer({ x: 0.123456, y: 0.5, width: 0.876544, height: 0.5 }),
    ).toEqual({ x: 0.1235, y: 0.5, width: 0.8765, height: 0.5 });
  });
});
