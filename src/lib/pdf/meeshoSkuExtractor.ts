import { PDFDocument } from "pdf-lib";
import {
  MEESHO_PARTNERS,
  detectCourierFromText,
  type MeeshoCropMode,
  type MeeshoPartner,
  type CropResult,
} from "./meeshoCropper";
import { getFormattedDateTime } from "@/utils/file";

/** Maps page index (0-based) to its SKU string. */
export type PageSkuMap = Record<number, string>;

/** Fallback SKU used for pages where no SKU text is found. */
export const UNKNOWN_SKU = "Other / Unknown";

/**
 * Extracts SKU from a list of clean text tokens extracted from a single Meesho page.
 *
 * Meesho label table structure:
 *   Product Details
 *   SKU | Size | Qty | Color | Order No.
 *   <SKU_VALUE> | Free Size | 1 | Gold | 329...
 */
export function extractMeeshoSkuFromTokens(tokens: string[]): string {
  const clean = tokens.map((s) => s.trim()).filter(Boolean);
  const skuIdx = clean.findIndex((s) => s.toUpperCase() === "SKU");
  if (skuIdx === -1) return "";

  // The Meesho header columns are typically: SKU, Size, Qty, Color, Order No.
  // After "Order No." comes the actual row data starting with SKU value.
  const orderNoIdx = clean.findIndex(
    (s, idx) => idx >= skuIdx && s.toLowerCase().includes("order no")
  );
  if (orderNoIdx !== -1 && orderNoIdx + 1 < clean.length) {
    const candidate = clean[orderNoIdx + 1];
    if (
      candidate &&
      candidate.length >= 2 &&
      !candidate.toLowerCase().includes("tax invoice") &&
      !candidate.toLowerCase().includes("bill to")
    ) {
      return candidate;
    }
  }

  // Fallback: look for tokens after SKU that are not common header column names
  const headerWords = new Set([
    "SKU",
    "SIZE",
    "QTY",
    "QUANTITY",
    "COLOR",
    "COLOUR",
    "ORDER NO.",
    "ORDER NO",
    "ORDER_NO",
  ]);

  for (let i = skuIdx + 1; i < Math.min(clean.length, skuIdx + 12); i++) {
    const token = clean[i];
    if (!headerWords.has(token.toUpperCase())) {
      if (
        token.length >= 2 &&
        !token.toLowerCase().includes("tax invoice") &&
        !token.toLowerCase().includes("bill to")
      ) {
        return token;
      }
    }
  }

  return "";
}

/**
 * Fallback SKU extractor from raw text string.
 */
export function extractMeeshoSkuFromText(text: string): string {
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return extractMeeshoSkuFromTokens(lines);
}

/**
 * Extracts SKU text for every page of a Meesho PDF using pdfjs-dist.
 * Returns a map of { pageIndex: skuString }.
 * Pages with no detectable SKU get UNKNOWN_SKU.
 */
export async function extractSkusFromMeeshoPdf(input: File): Promise<PageSkuMap> {
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
      const tokens = textContent.items.map((it: any) => it.str || "");
      const sku = extractMeeshoSkuFromTokens(tokens);
      pageSkuMap[i - 1] = sku || UNKNOWN_SKU;
    }
  } catch (err) {
    console.warn("Meesho SKU extraction failed:", err);
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
 * Builds a new, re-ordered Meesho-cropped PDF where pages are grouped
 * by SKU according to the specified skuOrder array.
 *
 * Within each SKU group, original page order is preserved.
 * Courier partner is auto-detected per original page so calibrated crop boxes are applied.
 */
export async function buildMeeshoSkuGroupedPdf(
  input: File,
  pageSkuMap: PageSkuMap,
  skuOrder: string[],
  cropMode: MeeshoCropMode = "invoice",
  selectedPartner: MeeshoPartner = "auto"
): Promise<CropResult> {
  const originalSize = input.size;
  const arrayBuffer = await input.arrayBuffer();

  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  // Extract page text for courier partner auto-detection
  let pagesText: string[] = [];
  try {
    if (typeof window !== "undefined") {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }
      const dataCopy = new Uint8Array(arrayBuffer.slice(0));
      const doc = await pdfjs.getDocument({ data: dataCopy }).promise;
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = textContent.items.map((it: any) => it.str || "").join(" ");
        pagesText.push(text);
      }
    }
  } catch (e) {
    console.warn("Could not extract page texts for courier detection:", e);
  }

  // Build ordered page index list: pages grouped by SKU order
  const orderedPageIndices: number[] = [];

  for (const sku of skuOrder) {
    for (let i = 0; i < totalPages; i++) {
      if ((pageSkuMap[i] || UNKNOWN_SKU) === sku) {
        orderedPageIndices.push(i);
      }
    }
  }

  // Any pages whose SKU isn't in skuOrder go at the end
  for (let i = 0; i < totalPages; i++) {
    if (!orderedPageIndices.includes(i)) {
      orderedPageIndices.push(i);
    }
  }

  // Build output PDF
  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(srcDoc, orderedPageIndices);
  const detectedPartners: Record<string, number> = {};

  for (let outIdx = 0; outIdx < copiedPages.length; outIdx++) {
    const originalPageIdx = orderedPageIndices[outIdx];
    const pageText = pagesText[originalPageIdx] || "";

    let partnerKey: Exclude<MeeshoPartner, "auto">;
    if (selectedPartner !== "auto") {
      partnerKey = selectedPartner;
    } else if (pageText) {
      partnerKey = detectCourierFromText(pageText);
    } else {
      partnerKey = "delhivery";
    }

    const partnerInfo = MEESHO_PARTNERS[partnerKey] || MEESHO_PARTNERS.delhivery;
    detectedPartners[partnerInfo.name] = (detectedPartners[partnerInfo.name] || 0) + 1;

    const page = copiedPages[outIdx];
    const { width, height } = page.getSize();
    const option = partnerInfo.options[cropMode] || partnerInfo.options.invoice;

    const cropX = (option.x / 595) * width;
    const cropY = (option.y / 842) * height;
    const cropW = (option.w / 595) * width;
    const cropH = (option.h / 842) * height;

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);

    outDoc.addPage(page);
  }

  const pdfBytes = await outDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const dateTimeStr = getFormattedDateTime();
  const outputFileName = `Meesho_SKUSorted_${cropMode}_${dateTimeStr}_Labelcroponline.pdf`;

  const partnerSummaryList = Object.entries(detectedPartners).map(
    ([name, count]) => `${name} (${count})`
  );
  const partnerSummaryText = partnerSummaryList.join(" • ");

  return {
    blobUrl,
    pdfBytes,
    fileName: outputFileName,
    pageCount: orderedPageIndices.length,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    cropMode,
    selectedPartner,
    detectedPartners,
    partnerSummaryText,
  };
}
