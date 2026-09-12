import { PDFDocument } from "pdf-lib";
import { FLIPKART_CROP_CONSTANTS } from "./flipkartCropper";
import type { CropResult } from "./flipkartCropper";
import { getFormattedDateTime } from "@/utils/file";

/** Maps page index (0-based) to its SKU string. */
export type PageSkuMap = Record<number, string>;

/** Fallback SKU used for pages where no SKU text is found. */
export const UNKNOWN_SKU = "Other / Unknown";

/**
 * Extracts the primary SKU from a single page's raw text.
 *
 * Flipkart label table format:
 *   [#]  |  SKU ID | Description  | QTY
 *   1    |  <SKU_VALUE> | <description> | 1
 *
 * In pdfjs-dist, text extraction often returns:
 *   "SKU ID | Description"
 *   "QTY"
 *   "1 <SKU_VALUE> | <description>"
 *
 * This function:
 * 1. Locates the "SKU ID" table header.
 * 2. Skips header tokens like "QTY", "Description", "|".
 * 3. Removes any leading row/serial number (e.g., "1 ").
 * 4. Extracts the SKU before the first "|" separator.
 * 5. Includes a fallback regex to catch standard Flipkart SKU patterns anywhere on page.
 */
export function extractFlipkartSkuFromText(text: string): string {
  if (!text) return "";

  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for SKU ID header
    if (/SKU\s*ID/i.test(line)) {
      for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
        let next = lines[j].trim();
        if (!next) continue;

        // Skip table header tokens
        if (/^(QTY|Description|\||\s)+$/i.test(next)) continue;

        // Strip leading row/item number (e.g., "1 ", "12 ")
        next = next.replace(/^\d+\s+/, "").trim();

        // Extract text before first "|" separator
        const pipeSplit = next.split(/\s*\|\s*/);
        const candidate = pipeSplit[0]?.trim() || "";

        // Verify it's a valid SKU (not another header word or empty)
        if (candidate.length >= 2 && !/^(QTY|Description|SKU|ID|Total)$/i.test(candidate)) {
          return candidate;
        }
      }
    }
  }

  // Secondary search: find line containing both an underscore-separated SKU and a pipe '|'
  for (const line of lines) {
    const trimmed = line.replace(/^\d+\s+/, "").trim();
    if (trimmed.includes("|")) {
      const parts = trimmed.split(/\s*\|\s*/);
      const first = parts[0]?.trim() || "";
      if (/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+$/.test(first)) {
        return first;
      }
    }
  }

  // Fallback: match any underscore-separated SKU pattern anywhere on page
  const fallbackMatch = text.match(/\b([A-Za-z0-9]+(?:_[A-Za-z0-9]+){2,})\b/);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1].trim();
  }

  return "";
}

/**
 * Extracts SKU text for every page of a Flipkart PDF using pdfjs-dist.
 * Returns a map of { pageIndex: skuString }.
 * Pages with no detectable SKU get UNKNOWN_SKU.
 */
export async function extractSkusFromFlipkartPdf(
  input: File
): Promise<PageSkuMap> {
  const pageSkuMap: PageSkuMap = {};

  try {
    if (typeof window === "undefined") return pageSkuMap;

    const pdfjs = await import("pdfjs-dist");
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await input.arrayBuffer();
    const dataCopy = new Uint8Array(arrayBuffer);
    const doc = await pdfjs.getDocument({ data: dataCopy }).promise;

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = textContent.items.map((it: any) => it.str || "").join("\n");
      const sku = extractFlipkartSkuFromText(text);
      pageSkuMap[i - 1] = sku || UNKNOWN_SKU;
    }
  } catch (err) {
    console.warn("SKU extraction failed:", err);
  }

  return pageSkuMap;
}

/**
 * Returns a sorted array of unique SKU strings found in the page map.
 * UNKNOWN_SKU is always placed last if present.
 */
export function getUniqueSku(pageSkuMap: PageSkuMap): string[] {
  const set = new Set<string>(Object.values(pageSkuMap));
  const arr = Array.from(set);
  // Push UNKNOWN_SKU to end
  const withoutUnknown = arr.filter((s) => s !== UNKNOWN_SKU);
  const hasUnknown = arr.includes(UNKNOWN_SKU);
  if (hasUnknown) withoutUnknown.push(UNKNOWN_SKU);
  return withoutUnknown;
}

/**
 * Counts how many pages belong to each SKU.
 */
export function countPagesPerSku(pageSkuMap: PageSkuMap): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const sku of Object.values(pageSkuMap)) {
    counts[sku] = (counts[sku] || 0) + 1;
  }
  return counts;
}

/**
 * Builds a new, re-ordered Flipkart-cropped PDF where pages are grouped
 * by SKU according to the specified skuOrder array.
 *
 * Within each SKU group, original page order is preserved.
 */
export async function buildSkuGroupedPdf(
  input: File,
  pageSkuMap: PageSkuMap,
  skuOrder: string[],
  soldByName?: string
): Promise<CropResult> {
  const originalSize = input.size;
  const arrayBuffer = await input.arrayBuffer();

  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  // Build ordered page index list: pages grouped by SKU order
  const orderedPageIndices: number[] = [];

  // Collect pages for each SKU in order
  for (const sku of skuOrder) {
    for (let i = 0; i < totalPages; i++) {
      if ((pageSkuMap[i] || UNKNOWN_SKU) === sku) {
        orderedPageIndices.push(i);
      }
    }
  }

  // Any pages whose SKU isn't in skuOrder go at the end (safety fallback)
  for (let i = 0; i < totalPages; i++) {
    if (!orderedPageIndices.includes(i)) {
      orderedPageIndices.push(i);
    }
  }

  // Build output PDF
  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(srcDoc, orderedPageIndices);

  for (const page of copiedPages) {
    const { width, height } = page.getSize();
    const cropX = (FLIPKART_CROP_CONSTANTS.x / FLIPKART_CROP_CONSTANTS.baseW) * width;
    const cropY = (FLIPKART_CROP_CONSTANTS.y / FLIPKART_CROP_CONSTANTS.baseH) * height;
    const cropW = (FLIPKART_CROP_CONSTANTS.w / FLIPKART_CROP_CONSTANTS.baseW) * width;
    const cropH = (FLIPKART_CROP_CONSTANTS.h / FLIPKART_CROP_CONSTANTS.baseH) * height;

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);

    outDoc.addPage(page);
  }

  const pdfBytes = await outDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const todayStr = getFormattedDateTime();
  const outputFileName = soldByName
    ? `Flipkart_SKUSorted_${soldByName}_${todayStr}_Labelcroponline.pdf`
    : `Flipkart_SKUSorted_${todayStr}_Labelcroponline.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: orderedPageIndices.length,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    fileName: outputFileName,
    soldBy: soldByName,
  };
}
