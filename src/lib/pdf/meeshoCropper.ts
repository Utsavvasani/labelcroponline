import { PDFDocument } from "pdf-lib";

export type MeeshoPartner =
  | "auto"
  | "delhivery"
  | "shadowfax"
  | "valmo"
  | "valmo_plus"
  | "xpressbees";

export type MeeshoCropMode = "label_sku" | "invoice";

export interface MeeshoCropOption {
  id: MeeshoCropMode;
  name: string;
  shortLabel: string;
  desc: string;
  suffix: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MeeshoPartnerInfo {
  id: MeeshoPartner;
  name: string;
  shortName: string;
  keywords: string[];
  options: Record<MeeshoCropMode, MeeshoCropOption>;
}

export const MEESHO_CROP_ORDER: MeeshoCropMode[] = ["invoice", "label_sku"];

export const MEESHO_CROP_OPTIONS: Record<MeeshoCropMode, MeeshoCropOption> = {
  invoice: {
    id: "invoice",
    name: "Full with Tax Invoice",
    shortLabel: "With Tax Invoice",
    desc: "Delhivery shipping label, SKU table + GST Tax Invoice",
    suffix: "invoice",
    x: 6,
    y: 233,
    w: 583,
    h: 609,
  },
  label_sku: {
    id: "label_sku",
    name: "Label + SKU Details",
    shortLabel: "Label + SKU",
    desc: "Crop with SKU & customer address only",
    suffix: "label_sku",
    x: 6,
    y: 434,
    w: 583,
    h: 408,
  },
};

export const MEESHO_PARTNER_LIST: Array<{ id: MeeshoPartner; name: string; shortName: string }> = [
  { id: "auto", name: "Auto-Detect Courier", shortName: "Auto Detect" },
  { id: "delhivery", name: "Delhivery", shortName: "Delhivery" },
  { id: "shadowfax", name: "Shadowfax", shortName: "Shadowfax" },
  { id: "valmo", name: "Valmo", shortName: "Valmo" },
  { id: "valmo_plus", name: "Valmo Plus", shortName: "Valmo Plus" },
  { id: "xpressbees", name: "Xpressbees", shortName: "Xpressbees" },
];

export const MEESHO_PARTNERS: Record<Exclude<MeeshoPartner, "auto">, MeeshoPartnerInfo> = {
  delhivery: {
    id: "delhivery",
    name: "Delhivery",
    shortName: "Delhivery",
    keywords: ["delhivery"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Delhivery shipping label, SKU table + GST Tax Invoice",
        suffix: "delhivery_invoice",
        x: 6,
        y: 233,
        w: 583,
        h: 609,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Crop with SKU & customer address only",
        suffix: "delhivery_label_sku",
        x: 6,
        y: 434,
        w: 583,
        h: 408,
      },
    },
  },
  shadowfax: {
    id: "shadowfax",
    name: "Shadowfax",
    shortName: "Shadowfax",
    keywords: ["shadowfax"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Shadowfax shipping label, SKU table + GST Tax Invoice",
        suffix: "shadowfax_invoice",
        x: 6,
        y: 233,
        w: 583,
        h: 609,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Crop with SKU & customer address only",
        suffix: "shadowfax_label_sku",
        x: 6,
        y: 434,
        w: 583,
        h: 408,
      },
    },
  },
  valmo: {
    id: "valmo",
    name: "Valmo",
    shortName: "Valmo",
    keywords: ["valmo"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Valmo shipping label, SKU table + GST Tax Invoice",
        suffix: "valmo_invoice",
        x: 6,
        y: 233,
        w: 583,
        h: 609,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Crop with SKU & customer address only",
        suffix: "valmo_label_sku",
        x: 6,
        y: 434,
        w: 583,
        h: 408,
      },
    },
  },
  valmo_plus: {
    id: "valmo_plus",
    name: "Valmo Plus",
    shortName: "Valmo Plus",
    keywords: ["valmoplus", "valmo plus", "valmo+"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Valmo Plus shipping label, SKU table + GST Tax Invoice",
        suffix: "valmo_plus_invoice",
        x: 6,
        y: 233,
        w: 583,
        h: 609,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Crop with SKU & customer address only",
        suffix: "valmo_plus_label_sku",
        x: 6,
        y: 434,
        w: 583,
        h: 408,
      },
    },
  },
  xpressbees: {
    id: "xpressbees",
    name: "Xpressbees",
    shortName: "Xpressbees",
    keywords: ["xpressbees", "xpress bees", "xb"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Xpressbees shipping label, SKU table + GST Tax Invoice",
        suffix: "xpressbees_invoice",
        x: 6,
        y: 233,
        w: 583,
        h: 609,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Crop with SKU & customer address only",
        suffix: "xpressbees_label_sku",
        x: 6,
        y: 434,
        w: 583,
        h: 408,
      },
    },
  },
};

export interface CropResult {
  blobUrl: string;
  pdfBytes: Uint8Array;
  fileName: string;
  pageCount: number;
  originalSize: number;
  croppedSize: number;
  cropMode: MeeshoCropMode;
  selectedPartner: MeeshoPartner;
  detectedPartners: Record<string, number>;
  partnerSummaryText: string;
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
 * Detects courier partner from page text content
 */
export function detectCourierFromText(text: string): Exclude<MeeshoPartner, "auto"> {
  const lower = text.toLowerCase();
  if (lower.includes("valmoplus") || lower.includes("valmo plus") || lower.includes("valmo+")) {
    return "valmo_plus";
  }
  if (lower.includes("valmo")) {
    return "valmo";
  }
  if (lower.includes("shadowfax")) {
    return "shadowfax";
  }
  if (lower.includes("xpressbees") || lower.includes("xpress bees") || lower.includes("xb")) {
    return "xpressbees";
  }
  if (lower.includes("delhivery")) {
    return "delhivery";
  }
  return "delhivery";
}

/**
 * Comprehensive, multi-tiered SKU extraction engine for Meesho shipping labels and invoices.
 * Handles diverse SKU patterns (alphanumeric, symbols, spaces, numeric codes, multi-word names).
 */
export function extractMeeshoSkuFromText(text: string): string {
  if (!text || !text.trim()) return "";

  const noiseWords = /^(details|table|size|qty|quantity|description|name|code|price|gst|hsn|meesho|total|invoice|rate|item|sku|product|seller|null|gstin|amount|igst|cgst|sgst|taxable|value|prepaid|cod|ordered|through|sold|by)$/i;

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
  // Tier 1: Meesho "Product Details SKU Size Qty Color Order No. <SKU> <Size>"
  // ─────────────────────────────────────────────────────────────────────────────
  const m1 = text.match(/Product\s+Details\s+SKU\s+Size\s+Qty\s+Color\s+Order\s+No\.?\s+([^\t\r\n]+?)(?:\s+(?:Free\s+Size|[SMLXL\d]+|XS|XXL|XXXL|\d+XL)\s+\d+|\s+TAX\s+INVOICE)/i);
  if (m1 && m1[1]) {
    const res = cleanSkuCandidate(m1[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 2: Generic Meesho Table Row "SKU Size Qty Color Order No. <SKU>"
  // ─────────────────────────────────────────────────────────────────────────────
  const m2 = text.match(/\bSKU\s+Size\s+Qty\s+Color\s+Order\s+No\.?\s+([^\t\r\n]+?)(?:\s+(?:Free\s+Size|[SMLXL\d]+)\s+\d+|\s+TAX)/i);
  if (m2 && m2[1]) {
    const res = cleanSkuCandidate(m2[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 3: Explicit Key-Value Pairs (e.g. "SKU: <value>", "Seller SKU: <value>")
  // ─────────────────────────────────────────────────────────────────────────────
  const kvRegex = /(?:(?:Seller|Product|Item|Merchant)\s+)?SKU(?:\s*(?:Code|ID|Number|No|Name))?\s*[:\-#]\s*([A-Za-z0-9_\-\.\/\s\+\(\)]+?)(?:\s*[\r\n\|]|\s+Size\b|\s+Qty\b|\s+Color\b|\s+Order\b|\s+TAX\b|\s+HSN\b|$)/i;
  const m3 = text.match(kvRegex);
  if (m3 && m3[1]) {
    const res = cleanSkuCandidate(m3[1]);
    if (res) return res;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier 4: Generic SKU ID Table Cell
  // ─────────────────────────────────────────────────────────────────────────────
  const skuCellRegex = /SKU(?:\s*ID|\s*Code|\s*No)?\s*(?:\||:)?\s*(?:Description\s*)?(?:QTY\s*)?(?:\d+[\.\s]+)?([A-Za-z0-9_\-\.\/\s\+\(\)]+?)(?:\s*\||\s+Qty\b|\s+Quantity\b|\s+Size\b|\s+Free\s+Size|\s+TAX)/i;
  const m4 = text.match(skuCellRegex);
  if (m4 && m4[1]) {
    const res = cleanSkuCandidate(m4[1]);
    if (res) return res;
  }

  return "";
}

/**
 * Crops a Meesho PDF with courier-calibrated margins and groups/sorts multi-page orders by SKU.
 */
export async function cropMeeshoPdf(
  input: File | Blob | ArrayBuffer | Uint8Array,
  originalFileName: string = "meesho_order.pdf",
  cropMode: MeeshoCropMode = "invoice",
  selectedPartner: MeeshoPartner = "auto"
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

  // Load source PDF with pdf-lib
  const srcPdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  // Extract page text for courier partner auto-detection and SKU sorting
  const pagesText: string[] = await extractPagesText(arrayBuffer);
  const detectedPartners: Record<string, number> = {};
  const detectedSkus: Record<string, number> = {};

  const pageEntries: Array<{
    pageIndex: number;
    partnerKey: Exclude<MeeshoPartner, "auto">;
    sku: string;
  }> = [];

  for (let i = 0; i < totalPages; i++) {
    const pageText = pagesText[i] || "";

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

    const sku = extractMeeshoSkuFromText(pageText);
    if (sku) {
      detectedSkus[sku] = (detectedSkus[sku] || 0) + 1;
    }

    pageEntries.push({
      pageIndex: i,
      partnerKey,
      sku,
    });
  }

  // Group and sort multi-page labels by Product SKU (case-insensitive natural alphabetical)
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

    const partnerInfo = MEESHO_PARTNERS[entry.partnerKey] || MEESHO_PARTNERS.delhivery;
    const option = partnerInfo.options[cropMode] || partnerInfo.options.label_sku;

    const cropX = (option.x / 595) * width;
    const cropY = (option.y / 842) * height;
    const cropW = (option.w / 595) * width;
    const cropH = (option.h / 842) * height;

    copiedPage.setCropBox(cropX, cropY, cropW, cropH);
    copiedPage.setMediaBox(cropX, cropY, cropW, cropH);
    copiedPage.setBleedBox(cropX, cropY, cropW, cropH);
    copiedPage.setTrimBox(cropX, cropY, cropW, cropH);

    outputDoc.addPage(copiedPage);
  }

  const pdfBytes = await outputDoc.save();
  const croppedBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(croppedBlob);

  const baseName = originalFileName.replace(/^labelcroponline_/i, "").replace(/\.pdf$/i, "");
  const outputFileName = `labelcroponline_${baseName}_${cropMode}.pdf`;

  const partnerSummaryList = Object.entries(detectedPartners).map(
    ([name, count]) => `${name} (${count})`
  );
  const partnerSummaryText = partnerSummaryList.join(" • ");

  const skuList = Object.entries(detectedSkus).map(([sku, count]) => `${sku} (${count})`);
  const skuSummaryText = skuList.length > 0 ? skuList.join(" • ") : undefined;

  return {
    blobUrl,
    pdfBytes,
    fileName: outputFileName,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    cropMode,
    selectedPartner,
    detectedPartners,
    partnerSummaryText,
    detectedSkus,
    skuSummaryText,
  };
}

/**
 * Triggers a browser file download for a given Blob URL
 */
export function triggerDownload(blobUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
