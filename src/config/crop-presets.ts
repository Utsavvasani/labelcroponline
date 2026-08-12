export interface CropPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: "in" | "mm" | "px";
  aspectRatio: number;
}

export const CROP_PRESETS: CropPreset[] = [
  {
    id: "shipping-4x6",
    name: 'Standard Shipping Label (4" x 6")',
    width: 4,
    height: 6,
    unit: "in",
    aspectRatio: 4 / 6,
  },
  {
    id: "thermal-4x4",
    name: 'Thermal Square Label (4" x 4")',
    width: 4,
    height: 4,
    unit: "in",
    aspectRatio: 1,
  },
  {
    id: "amazon-fba",
    name: 'Amazon FBA Label (3" x 5")',
    width: 3,
    height: 5,
    unit: "in",
    aspectRatio: 3 / 5,
  },
  {
    id: "custom",
    name: "Custom Dimensions",
    width: 0,
    height: 0,
    unit: "in",
    aspectRatio: 0,
  },
];
