import { PDFDocument } from "pdf-lib";
import { getFormattedDateTime } from "@/utils/file";

export type SortCriterion =
  | "original"
  | "courier"
  | "sku"
  | "order_number"
  | "awb"
  | "pincode"
  | "quantity"
  | "seller";

export type SortDirection = "asc" | "desc";

export interface SortLevel {
  criterion: SortCriterion;
  direction: SortDirection;
}

export interface LabelPageMeta {
  pageIndex: number; // 0-based original index
  courier: string;
  sku: string;
  orderNumber: string;
  awb: string;
  pincode: string;
  quantity: number;
  seller: string;
  rawText: string;
}

export interface SortResult {
  pdfBytes: Uint8Array;
  blobUrl: string;
  fileName: string;
  pageCount: number;
  sortedMetas: LabelPageMeta[];
}

// Courier keyword mapping
const COURIER_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "Delhivery", pattern: /\bdelhivery\b/i },
  { name: "Shadowfax", pattern: /\bshadowfax\b/i },
  { name: "Xpressbees", pattern: /\bxpressbees\b/i },
  { name: "Valmo", pattern: /\bvalmo\b/i },
  { name: "Ecom Express", pattern: /\becom\s*express\b/i },
  { name: "Blue Dart", pattern: /\bblue\s*dart\b/i },
  { name: "DTDC", pattern: /\bdtdc\b/i },
  { name: "Ekart", pattern: /\bekart\b/i },
  { name: "Smartr", pattern: /\bsmartr\b/i },
  { name: "Amazon Shipping", pattern: /\bamazon\s*shipping\b/i },
  { name: "Trackon", pattern: /\btrackon\b/i },
  { name: "Speed Post", pattern: /\bspeed\s*post\b/i },
];

function extractCourier(text: string): string {
  for (const { name, pattern } of COURIER_PATTERNS) {
    if (pattern.test(text)) return name;
  }
  return "Unknown";
}

function extractOrderNumber(text: string): string {
  const patterns = [
    /Order\s*(?:No\.?|Number|ID|#)\s*[:\-]?\s*([A-Za-z0-9\-_]{6,25})/i,
    /(?:OD|FK|MO|MP|FN|ON)\d{9,20}/i,
    /\b\d{10,18}\b/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
    if (m && m[0]) return m[0].trim();
  }
  return "";
}

function extractAwb(text: string): string {
  const patterns = [
    /(?:AWB|Tracking\s*(?:No\.?|Number|ID)|Shipment\s*(?:No\.?|ID))\s*[:\-]?\s*([A-Za-z0-9]{9,22})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "";
}

function extractSku(text: string): string {
  // Pattern 1: Explicit "SKU" label with colon/dash/space
  const p1 = text.match(/SKU\s*[:\-]?\s*([A-Za-z0-9\-_+\/\. ]{2,40}?)(?:\s{2,}|\t|\n|$|(?=\s+[A-Z][a-z]))/i);
  if (p1 && p1[1]) {
    const v = p1[1].trim().replace(/\s+$/, "");
    if (v.length >= 2) return v;
  }

  // Pattern 2: "SKU" followed by whitespace then value
  const p2 = text.match(/\bSKU\b\s+([^\s][^\n\r]{1,35}?)(?:\s{2,}|\t|$)/i);
  if (p2 && p2[1]) {
    const v = p2[1].trim();
    if (v.length >= 2 && !/^(Product|Name|Code|ID|item)/i.test(v)) return v;
  }

  // Pattern 3: "Seller SKU" or "Item SKU"
  const p3 = text.match(/(?:Seller|Item|Product)\s+SKU\s*[:\-]?\s*([A-Za-z0-9\-_+\/\.]{2,40})/i);
  if (p3 && p3[1]) return p3[1].trim();

  // Pattern 4: Product Code / Item Code
  const p4 = text.match(/(?:Product|Item)\s*Code\s*[:\-]?\s*([A-Za-z0-9\-_+\/\.]{2,40})/i);
  if (p4 && p4[1]) return p4[1].trim();

  // Pattern 5: Near SKU keyword
  const p5 = text.match(/\bSKU\b[^A-Za-z0-9\n\r]{0,10}([A-Za-z0-9][A-Za-z0-9\-_+\/\.]{1,39})/i);
  if (p5 && p5[1]) {
    const v = p5[1].trim();
    if (v.length >= 2 && !/^(Details|Info|Number|Code|Name|Product|Label|Item|Qty|Quantity|Price)$/i.test(v)) {
      return v;
    }
  }

  return "";
}

function extractPincode(text: string): string {
  const anchored = text.match(/(?:PIN|Pincode|Postal|Zip)\s*[:\-]?\s*([1-9][0-9]{5})/i);
  if (anchored) return anchored[1];
  const allPins = text.match(/\b[1-9][0-9]{5}\b/g);
  if (allPins && allPins.length > 0) return allPins[allPins.length - 1];
  return "";
}

function extractQuantity(text: string): number {
  const patterns = [
    /(?:Qty|Quantity|Total\s*Qty)\s*[:\-]?\s*([0-9]{1,4})/i,
    /\bQty\s+([0-9]{1,4})\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      const q = parseInt(m[1], 10);
      if (!isNaN(q) && q > 0 && q < 1000) return q;
    }
  }
  return 1;
}

function extractSeller(text: string): string {
  const m = text.match(/(?:Sold\s*By|Seller(?:\s*Name)?)\s*[:\-]?\s*([A-Za-z0-9\s&,.]{3,35})/i);
  if (m && m[1]) return m[1].trim();
  return "";
}

/**
 * Extracts metadata for every page of a PDF using pdf.js
 */
export async function extractLabelMetadata(
  arrayBuffer: ArrayBuffer,
  onProgress?: (current: number, total: number) => void
): Promise<LabelPageMeta[]> {
  if (typeof window === "undefined") return [];

  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const data = new Uint8Array(arrayBuffer.slice(0));
  const pdfDoc = await pdfjs.getDocument({ data }).promise;
  const numPages = pdfDoc.numPages;
  const metas: LabelPageMeta[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const rawText = content.items
      .map((it: unknown) => ("str" in (it as { str: string }) ? (it as { str: string }).str : ""))
      .join(" ");

    metas.push({
      pageIndex: i - 1,
      courier: extractCourier(rawText),
      sku: extractSku(rawText),
      orderNumber: extractOrderNumber(rawText),
      awb: extractAwb(rawText),
      pincode: extractPincode(rawText),
      quantity: extractQuantity(rawText),
      seller: extractSeller(rawText),
      rawText: rawText.trim(),
    });

    if (onProgress) onProgress(i, numPages);
  }

  return metas;
}

/**
 * Sorts label page metadata using a multi-level criteria list
 */
export function sortLabelPages(
  metas: LabelPageMeta[],
  sortLevels: SortLevel[]
): LabelPageMeta[] {
  if (sortLevels.length === 0) return [...metas];

  return [...metas].sort((a, b) => {
    for (const { criterion, direction } of sortLevels) {
      let cmp = 0;
      switch (criterion) {
        case "courier": {
          const ca = a.courier === "Unknown" ? "ZZZZ" : a.courier.toLowerCase();
          const cb = b.courier === "Unknown" ? "ZZZZ" : b.courier.toLowerCase();
          cmp = ca.localeCompare(cb);
          break;
        }
        case "sku":
          cmp = (a.sku || "ZZZZ").toLowerCase().localeCompare((b.sku || "ZZZZ").toLowerCase());
          break;
        case "order_number":
          cmp = (a.orderNumber || "ZZZZ").toLowerCase().localeCompare((b.orderNumber || "ZZZZ").toLowerCase());
          break;
        case "awb":
          cmp = (a.awb || "ZZZZ").toLowerCase().localeCompare((b.awb || "ZZZZ").toLowerCase());
          break;
        case "pincode":
          cmp = (a.pincode || "999999").localeCompare(b.pincode || "999999");
          break;
        case "quantity":
          cmp = a.quantity - b.quantity;
          break;
        case "seller":
          cmp = (a.seller || "ZZZZ").toLowerCase().localeCompare((b.seller || "ZZZZ").toLowerCase());
          break;
        case "original":
          cmp = a.pageIndex - b.pageIndex;
          break;
      }
      if (cmp !== 0) {
        return direction === "asc" ? cmp : -cmp;
      }
    }
    return a.pageIndex - b.pageIndex;
  });
}

/**
 * Builds a new sorted PDF using pdf-lib
 */
export async function buildSortedPdf(
  srcArrayBuffer: ArrayBuffer,
  sortedMetas: LabelPageMeta[],
  customFileName?: string
): Promise<SortResult> {
  const srcDoc = await PDFDocument.load(srcArrayBuffer, { ignoreEncryption: true });
  const sortedDoc = await PDFDocument.create();

  const newIndices = sortedMetas.map((m) => m.pageIndex);
  const copiedPages = await sortedDoc.copyPages(srcDoc, newIndices);
  copiedPages.forEach((p) => sortedDoc.addPage(p));

  const pdfBytes = await sortedDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const dateStr = getFormattedDateTime();
  const cleanBase = (customFileName || "sorted_labels")
    .replace(/^labelcroponline_/i, "")
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const fileName = `Sorted_${cleanBase}_${dateStr}_Labelcroponline.pdf`;

  return {
    pdfBytes,
    blobUrl,
    fileName,
    pageCount: sortedDoc.getPageCount(),
    sortedMetas,
  };
}
