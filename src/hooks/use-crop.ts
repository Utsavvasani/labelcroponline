import { useState, useCallback } from "react";
import { BoundingBox } from "@/types";

export function useCrop(initialBounds?: BoundingBox) {
  const [cropBox, setCropBox] = useState<BoundingBox | null>(initialBounds || null);

  const resetCrop = useCallback(() => {
    setCropBox(null);
  }, []);

  const updateCrop = useCallback((newBounds: BoundingBox) => {
    setCropBox(newBounds);
  }, []);

  return {
    cropBox,
    updateCrop,
    resetCrop,
  };
}
