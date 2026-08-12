export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropRegion extends BoundingBox {
  id: string;
  pageIndex: number;
  rotation?: number;
}

export type ExportFormat = "pdf" | "png" | "jpeg";
