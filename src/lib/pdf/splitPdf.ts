import { PDFDocument } from "pdf-lib";
import { getFormattedDateTime } from "@/utils/file";

export type SplitMode = "all_pages" | "by_range" | "every_n" | "fixed_pages";

export interface SplitOptions {
  mode: SplitMode;
  /** "1-3, 5-7, 9" for by_range */
  rangeStr?: string;
  /** Number N for every_n mode */
  everyN?: number;
  /** "1,3,5,7" for fixed_pages mode */
  pagesStr?: string;
}

export interface SplitChunk {
  label: string;
  pageIndices: number[]; // 0-based
}

export interface BuiltChunk {
  label: string;
  pdfBytes: Uint8Array;
  blob: Blob;
  blobUrl: string;
  fileName: string;
  pageCount: number;
}

function parseRanges(rangeStr: string, total: number): SplitChunk[] {
  const chunks: SplitChunk[] = [];
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const dashMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (dashMatch) {
      const from = Math.max(1, parseInt(dashMatch[1], 10));
      const to = Math.min(total, parseInt(dashMatch[2], 10));
      if (from <= to) {
        chunks.push({
          label: `Pages ${from}–${to}`,
          pageIndices: Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i),
        });
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= total) {
        chunks.push({ label: `Page ${n}`, pageIndices: [n - 1] });
      }
    }
  }
  return chunks;
}

function parseFixedPages(pagesStr: string, total: number): SplitChunk[] {
  const indices = pagesStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= total)
    .sort((a, b) => a - b);

  return indices.map((n) => ({ label: `Page ${n}`, pageIndices: [n - 1] }));
}

export function planSplit(options: SplitOptions, totalPages: number): SplitChunk[] {
  switch (options.mode) {
    case "all_pages":
      return Array.from({ length: totalPages }, (_, i) => ({
        label: `Page ${i + 1}`,
        pageIndices: [i],
      }));

    case "by_range":
      return parseRanges(options.rangeStr || "", totalPages);

    case "every_n": {
      const n = Math.max(1, options.everyN || 1);
      const chunks: SplitChunk[] = [];
      for (let start = 0; start < totalPages; start += n) {
        const end = Math.min(start + n - 1, totalPages - 1);
        const label = start === end ? `Page ${start + 1}` : `Pages ${start + 1}–${end + 1}`;
        chunks.push({
          label,
          pageIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        });
      }
      return chunks;
    }

    case "fixed_pages":
      return parseFixedPages(options.pagesStr || "", totalPages);

    default:
      return [];
  }
}

export async function buildChunkPdf(
  srcArrayBuffer: ArrayBuffer,
  chunk: SplitChunk,
  baseName: string,
  chunkIndex: number
): Promise<BuiltChunk> {
  const srcDoc = await PDFDocument.load(srcArrayBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const copied = await newDoc.copyPages(srcDoc, chunk.pageIndices);
  copied.forEach((p) => newDoc.addPage(p));

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  const dateStr = getFormattedDateTime();
  const cleanBase = baseName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 25);
  const fileName = `Split_${cleanBase}_${String(chunkIndex + 1).padStart(2, "0")}_${dateStr}.pdf`;

  return { label: chunk.label, pdfBytes, blob, blobUrl, fileName, pageCount: chunk.pageIndices.length };
}

export async function buildSplitZip(
  srcArrayBuffer: ArrayBuffer,
  chunks: SplitChunk[],
  baseName: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ blobUrl: string; blob: Blob; fileName: string; chunkCount: number }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const dateStr = getFormattedDateTime();

  const cleanBase = baseName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 25);

  for (let i = 0; i < chunks.length; i++) {
    const built = await buildChunkPdf(srcArrayBuffer, chunks[i], baseName, i);
    zip.file(built.fileName, built.pdfBytes);
    if (onProgress) onProgress(i + 1, chunks.length);
  }

  const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const blobUrl = URL.createObjectURL(zipBlob);
  const fileName = `Split_${cleanBase}_${chunks.length}parts_${dateStr}.zip`;

  return { blobUrl, blob: zipBlob, fileName, chunkCount: chunks.length };
}

export async function getPdfInfo(
  file: File
): Promise<{ pageCount: number; fileSize: number }> {
  const ab = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
  return { pageCount: doc.getPageCount(), fileSize: file.size };
}
