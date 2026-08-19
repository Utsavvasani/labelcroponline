import { PDFDocument } from "pdf-lib";

export interface MergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export interface MergeResult {
  blobUrl: string;
  pdfBytes: Uint8Array;
  fileName: string;
  pageCount: number;
  totalSize: number;
  fileCount: number;
}

/**
 * Reads a File and returns its page count using pdf-lib
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error("Error reading PDF page count:", err);
    return 1;
  }
}

/**
 * Merges multiple PDF files into a single document preserving vector quality
 */
export async function mergePdfFiles(
  items: MergeItem[],
  customOutputName?: string
): Promise<MergeResult> {
  if (!items || items.length === 0) {
    throw new Error("Please select at least 2 PDF files to merge.");
  }

  // Create target merged PDF document
  const mergedPdf = await PDFDocument.create();
  let totalInputSize = 0;

  for (const item of items) {
    totalInputSize += item.size;
    const arrayBuffer = await item.file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    );

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const baseName = customOutputName || "merged_document";
  const outputFileName = `labelcroponline_${baseName}.pdf`;

  return {
    blobUrl,
    pdfBytes,
    fileName: outputFileName,
    pageCount: mergedPdf.getPageCount(),
    totalSize: pdfBytes.byteLength,
    fileCount: items.length,
  };
}

/**
 * Triggers a browser file download for a given Blob URL
 */
export function triggerDownload(blobUrl: string, fileName: string) {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
