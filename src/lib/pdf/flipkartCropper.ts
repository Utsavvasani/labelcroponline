import { PDFDocument } from "pdf-lib";

export interface FlipkartCropOptions {
  cropMode?: "tight-crop" | "tight-bill" | "thermal-4x6";
  outputFormat?: "tight-crop" | "tight-bill" | "thermal-4x6";
  cropAllSides?: boolean;
}

export interface CropResult {
  pdfBytes: Uint8Array;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
  originalSize: number;
  croppedSize: number;
  fileName: string;
  detectedSkus?: Record<string, number>;
  skuSummaryText?: string;
}

/**
 * Extracts text per page using pdfjs-dist if available in client environment
 */
async function extractPagesText(arrayBuffer: ArrayBuffer): Promise<string[]> {
  try {
    if (typeof window !== "undefined") {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }
      const dataCopy = new Uint8Array(arrayBuffer.slice(0));
      const doc = await pdfjs.getDocument({ data: dataCopy }).promise;
      const texts: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = textContent.items.map((it: any) => it.str || "").join(" ");
        texts.push(text);
      }
      return texts;
    }
  } catch {
    // Graceful fallback if text extraction fails in worker
  }
  return [];
}

/**
 * Comprehensive, multi-tiered SKU extraction engine for Flipkart shipping labels and invoices.
 * Designed to handle any SKU format (alphanumeric, symbols, spaces, numeric codes, FSNs, multi-word names).
 */
export function extractFlipkartSkuFromText(text: string): string {
  if (!text || !text.trim()) return "";

  const noiseWords = /^(details|table|size|qty|quantity|description|name|code|price|gst|hsn|flipkart|total|invoice|rate|item|fsn|sku|product|seller|null|gstin|amount|igst|cgst|sgst|taxable|value|prepaid|cod|ordered|through|sold|by)$/i;

  const cleanSkuCandidate = (candidate: string): string => {
    if (!candidate) return "";
    let s = candidate.trim();

    // Remove leading serial numbers like '1 ', '1. ', '01 ', '#1 ', etc.
    s = s.replace(/^(?:#?\d+[\.\-\)]?\s+)+/, "").trim();

    // Remove trailing pipes, dashes, commas, colons, or noise
    s = s.replace(/[\|,;\:\-]+$/, "").trim();

    // If candidate starts with 'SKU:' or 'SKU ID:' strip it
    s = s.replace(/^(?:Seller\s+|Product\s+|Item\s+)?SKU(?:\s*(?:ID|Code|No|Number|Name))?[\s:\-#]+/i, "").trim();

    // If candidate has pipe separating description (e.g. "SKU_CODE | Product description"), take first segment
    if (s.includes("|")) {
      const parts = s.split("|");
      const first = parts[0].trim().replace(/^(?:#?\d+[\.\-\)]?\s+)+/, "").trim();
      if (first.length >= 2 && !noiseWords.test(first)) {
        return first;
      }
    }

    if (s.length >= 2 && !noiseWords.test(s)) {
      return s;
    }
    return "";
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 1: Flipkart Label Shipping Table Row (Top Label Part)
  // Structure: "SKU ID | Description" followed by "<Row_Num> <SKU_CODE> | <Description>"
  // ─────────────────────────────────────────────────────────────────────────────
  const tableHeaderRegex = /SKU\s*ID\s*\|?\s*Description(?:\s+QTY)?\s+(?:(\d+)\s+)?([^\|]+?)(?:\s*\||\s+QTY|\s+\d+\s+FMPP|\s+Kelvy|\s+Tax\s+Invoice)/i;
  const tableHeaderMatch = text.match(tableHeaderRegex);
  if (tableHeaderMatch && tableHeaderMatch[2]) {
    const res = cleanSkuCandidate(tableHeaderMatch[2]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 2: Generic Table Cell under "SKU ID" or "SKU / Description"
  // Handles multi-line or variable order headers
  // ─────────────────────────────────────────────────────────────────────────────
  const skuCellRegex = /SKU(?:\s*ID|\s*Code|\s*No)?\s*(?:\||:)?\s*(?:Description\s*)?(?:QTY\s*)?(?:\d+[\.\s]+)?([A-Za-z0-9_\-\.\/\s\(\)]+?)(?:\s*\||\s+Qty\b|\s+Quantity\b|\s+Size\b|\s+FMPP|\s+AWB|\s+OD\d{10})/i;
  const skuCellMatch = text.match(skuCellRegex);
  if (skuCellMatch && skuCellMatch[1]) {
    const res = cleanSkuCandidate(skuCellMatch[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 3: Explicit Key-Value Pairs (e.g., "SKU: ABC", "Seller SKU: XYZ", "Product SKU: 123")
  // ─────────────────────────────────────────────────────────────────────────────
  const kvRegex = /(?:(?:Seller|Product|Item|Merchant)\s+)?SKU(?:\s*(?:Code|ID|Number|No|Name))?\s*[:\-#]\s*([A-Za-z0-9_\-\.\/\s]+?)(?:\s*[\r\n\|]|\s+Qty|\s+Quantity|\s+Price|\s+Tax|\s+Order|\s+Invoice|\s+HSN|$)/i;
  const kvMatch = text.match(kvRegex);
  if (kvMatch && kvMatch[1]) {
    const res = cleanSkuCandidate(kvMatch[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 4: Tax Invoice Product Table SKU
  // In Flipkart tax invoice, the seller SKU is printed directly above IMEI/SrNo or HSN:
  // e.g. "<Product Name> | <SKU_CODE> | | <SKU_CODE> | | IMEI/SrNo: ... HSN: 94049099"
  // ─────────────────────────────────────────────────────────────────────────────
  const invoiceSkuRegex = /\|\s*([A-Za-z0-9_\-\.\/]+)\s*\|\s*\|\s*\1\s*\|\s*\|\s*IMEI/i;
  const invoiceSkuMatch = text.match(invoiceSkuRegex);
  if (invoiceSkuMatch && invoiceSkuMatch[1]) {
    const res = cleanSkuCandidate(invoiceSkuMatch[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 5: FSN Identifier fallback (Flipkart Serial Number)
  // ─────────────────────────────────────────────────────────────────────────────
  const fsnRegex = /\bFSN\s*[:\-#]?\s*([A-Za-z0-9_\-\.\/]+)/i;
  const fsnMatch = text.match(fsnRegex);
  if (fsnMatch && fsnMatch[1]) {
    const res = cleanSkuCandidate(fsnMatch[1]);
    if (res) return res;
  }

  return "";
}

/**
 * Crops Flipkart shipping labels matching the exact cut specifications of cropped_label.pdf:
 * CropBox / MediaBox = { x: 165, y: 460, width: 265, height: 360 } (on standard A4 595 x 842 pt).
 * Automatically groups and sorts multi-page labels by Product SKU.
 */
export async function cropFlipkartPdf(
  input: File | Blob | ArrayBuffer | Uint8Array,
  fileName: string = "Flipkart.pdf",
  _options?: FlipkartCropOptions
): Promise<CropResult> {
  let arrayBuffer: ArrayBuffer;
  let originalSize = 0;

  if (input instanceof File || input instanceof Blob) {
    originalSize = input.size;
    arrayBuffer = await input.arrayBuffer();
  } else if (input instanceof Uint8Array) {
    originalSize = input.byteLength;
    arrayBuffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  } else {
    originalSize = input.byteLength;
    arrayBuffer = input;
  }

  const srcPdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  // Extract page text for SKU sorting
  const pagesText = await extractPagesText(arrayBuffer);
  const detectedSkus: Record<string, number> = {};
  const pageEntries: Array<{
    pageIndex: number;
    sku: string;
  }> = [];

  for (let i = 0; i < totalPages; i++) {
    const pageText = pagesText[i] || "";
    const sku = extractFlipkartSkuFromText(pageText);

    if (sku) {
      detectedSkus[sku] = (detectedSkus[sku] || 0) + 1;
    }

    pageEntries.push({
      pageIndex: i,
      sku,
    });
  }

  // Group and sort multi-page labels by Product SKU (case-insensitive natural alphabetical, original index tie-breaker)
  if (totalPages > 1) {
    pageEntries.sort((a, b) => {
      if (a.sku && b.sku && a.sku.toLowerCase() !== b.sku.toLowerCase()) {
        return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: "base" });
      }
      if (a.sku && !b.sku) return -1;
      if (!a.sku && b.sku) return 1;
      return a.pageIndex - b.pageIndex;
    });
  }

  // Create new sorted output document
  const outputDoc = await PDFDocument.create();

  for (const entry of pageEntries) {
    const [copiedPage] = await outputDoc.copyPages(srcPdfDoc, [entry.pageIndex]);
    const { width, height } = copiedPage.getSize();

    // Exact symmetrical crop with equal spacing on all sides (3.5 pt margins around border):
    // x: 165 pt, y: 459.5 pt, width: 265 pt, height: 361.5 pt
    const cropX = (165 / 595.28) * width;
    const cropY = (459.5 / 841.89) * height;
    const cropW = (265 / 595.28) * width;
    const cropH = (361.5 / 841.89) * height;

    copiedPage.setCropBox(cropX, cropY, cropW, cropH);
    copiedPage.setMediaBox(cropX, cropY, cropW, cropH);
    copiedPage.setBleedBox(cropX, cropY, cropW, cropH);
    copiedPage.setTrimBox(cropX, cropY, cropW, cropH);

    outputDoc.addPage(copiedPage);
  }

  const pdfBytes = await outputDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  // Generate friendly output name
  const cleanBaseName = fileName
    .replace(/^labelcroponline_/i, "")
    .replace(/\.[^/.]+$/, "")
    .replace(/_cropped/g, "");
  const outputFileName = `labelcroponline_${cleanBaseName}_cropped.pdf`;

  const skuList = Object.entries(detectedSkus).map(([sku, count]) => `${sku} (${count})`);
  const skuSummaryText = skuList.length > 0 ? skuList.join(" • ") : undefined;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    fileName: outputFileName,
    detectedSkus,
    skuSummaryText,
  };
}

/**
 * Triggers automatic download of a Blob URL in browser.
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
