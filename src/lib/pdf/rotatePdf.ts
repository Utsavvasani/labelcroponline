import { PDFDocument, degrees } from "pdf-lib";
import { getFormattedDateTime } from "@/utils/file";

export type RotateAngle = 90 | 180 | 270;
export type RotateTarget = "all" | "specific";

export interface RotateOptions {
  target?: RotateTarget;
  angle?: RotateAngle;
  selectedPages?: number[]; // 1-based page numbers
  /** Custom per-page angle addition in degrees (0, 90, 180, 270), keyed by 0-based page index */
  customRotations?: Record<number, number>;
}

export interface RotateResult {
  pdfBytes: Uint8Array;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
  fileName: string;
  rotatedPages: number[];
}

export async function rotatePdf(
  srcArrayBuffer: ArrayBuffer,
  options: RotateOptions,
  originalFileName: string = "document.pdf"
): Promise<RotateResult> {
  const srcDoc = await PDFDocument.load(srcArrayBuffer, { ignoreEncryption: true });
  const pages = srcDoc.getPages();
  const total = pages.length;

  const modifiedIndices: number[] = [];

  if (options.customRotations) {
    // Apply per-page custom rotations
    for (let i = 0; i < total; i++) {
      const addedAngle = options.customRotations[i] || 0;
      if (addedAngle % 360 !== 0) {
        const page = pages[i];
        const existing = page.getRotation().angle;
        page.setRotation(degrees((existing + addedAngle) % 360));
        modifiedIndices.push(i + 1);
      }
    }
  } else {
    // General target + angle
    const angle = options.angle || 90;
    let targetIndices: number[];
    if (options.target === "all") {
      targetIndices = Array.from({ length: total }, (_, i) => i);
    } else {
      targetIndices = (options.selectedPages || [])
        .map((n) => n - 1)
        .filter((i) => i >= 0 && i < total);
    }

    for (const idx of targetIndices) {
      const page = pages[idx];
      const existing = page.getRotation().angle;
      page.setRotation(degrees((existing + angle) % 360));
      modifiedIndices.push(idx + 1);
    }
  }

  const pdfBytes = await srcDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const dateStr = getFormattedDateTime();
  const cleanBase = originalFileName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 30);
  const fileName = `Rotated_${cleanBase}_${dateStr}_Labelcroponline.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: total,
    fileName,
    rotatedPages: modifiedIndices,
  };
}

export async function getRotatePdfInfo(
  file: File
): Promise<{ pageCount: number; fileSize: number }> {
  const ab = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
  return { pageCount: doc.getPageCount(), fileSize: file.size };
}
