import { BoundingBox } from "@/types";

/**
 * Clamps coordinates within canvas bounds
 */
export function clampBounds(
  box: BoundingBox,
  maxWidth: number,
  maxHeight: number
): BoundingBox {
  const x = Math.max(0, Math.min(box.x, maxWidth));
  const y = Math.max(0, Math.min(box.y, maxHeight));
  const width = Math.min(box.width, maxWidth - x);
  const height = Math.min(box.height, maxHeight - y);

  return { x, y, width, height };
}

/**
 * Calculates scaled coordinates based on zoom factor
 */
export function scaleBounds(box: BoundingBox, scale: number): BoundingBox {
  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}
