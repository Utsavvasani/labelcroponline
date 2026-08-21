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

export const MEESHO_PARTNER_LIST: Array<{ id: MeeshoPartner; name: string; shortName: string }> = [
  { id: "auto", name: "Auto-Detect Courier", shortName: "Auto Detect" },
  { id: "delhivery", name: "Delhivery", shortName: "Delhivery" },
  { id: "shadowfax", name: "Shadowfax", shortName: "Shadowfax" },
  { id: "valmo", name: "Valmo", shortName: "Valmo" },
  { id: "valmo_plus", name: "Valmo Plus", shortName: "Valmo Plus" },
  { id: "xpressbees", name: "Xpressbees", shortName: "Xpressbees" },
];

export const PARTNER_SORT_PRIORITY: Record<Exclude<MeeshoPartner, "auto">, number> = {
  delhivery: 1,
  shadowfax: 2,
  valmo: 3,
  valmo_plus: 4,
  xpressbees: 5,
};

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
        desc: "Delhivery shipping label + Product SKU table",
        suffix: "delhivery_sku",
        x: 6,
        y: 476,
        w: 583,
        h: 360,
      },
    },
  },
  shadowfax: {
    id: "shadowfax",
    name: "Shadowfax",
    shortName: "Shadowfax",
    keywords: ["shadowfax", "sfx"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Shadowfax shipping label + Tax Invoice",
        suffix: "shadowfax_invoice",
        x: 6,
        y: 222,
        w: 583,
        h: 620,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Shadowfax shipping label + SKU table",
        suffix: "shadowfax_sku",
        x: 6,
        y: 466,
        w: 583,
        h: 370,
      },
    },
  },
  valmo: {
    id: "valmo",
    name: "Valmo",
    shortName: "Valmo",
    keywords: ["valmo", "meesho logistics"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Valmo shipping label + Tax Invoice",
        suffix: "valmo_invoice",
        x: 6,
        y: 240,
        w: 583,
        h: 602,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Valmo shipping label + SKU table",
        suffix: "valmo_sku",
        x: 6,
        y: 485,
        w: 583,
        h: 351,
      },
    },
  },
  valmo_plus: {
    id: "valmo_plus",
    name: "Valmo Plus",
    shortName: "Valmo Plus",
    keywords: ["valmo plus", "valmoplus", "valmo+"],
    options: {
      invoice: {
        id: "invoice",
        name: "Full with Tax Invoice",
        shortLabel: "With Tax Invoice",
        desc: "Valmo Plus shipping label + Tax Invoice",
        suffix: "valmoplus_invoice",
        x: 6,
        y: 230,
        w: 583,
        h: 612,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Valmo Plus shipping label + SKU table",
        suffix: "valmoplus_sku",
        x: 6,
        y: 472,
        w: 583,
        h: 364,
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
        desc: "Xpressbees shipping label + Tax Invoice",
        suffix: "xpressbees_invoice",
        x: 6,
        y: 216,
        w: 583,
        h: 626,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Xpressbees shipping label + SKU table",
        suffix: "xpressbees_sku",
        x: 6,
        y: 462,
        w: 583,
        h: 374,
      },
    },
  },
};

// Default fallback options
export const MEESHO_CROP_OPTIONS = MEESHO_PARTNERS.delhivery.options;

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
}

/**
 * Detects the Meesho delivery courier partner from extracted page text.
 */
export function detectCourierFromText(text: string): Exclude<MeeshoPartner, "auto"> {
  const lower = text.toLowerCase();
  if (lower.includes("valmo plus") || lower.includes("valmoplus") || lower.includes("valmo+")) {
    return "valmo_plus";
  }
  if (lower.includes("valmo")) {
    return "valmo";
  }
  if (lower.includes("shadowfax") || lower.includes("sfx")) {
    return "shadowfax";
  }
  if (lower.includes("xpressbees") || lower.includes("xpress bees")) {
    return "xpressbees";
  }
  if (lower.includes("delhivery")) {
    return "delhivery";
  }
  return "delhivery"; // default standard
}

/**
 * Extracts product SKU / Style Code from extracted page text.
 */
export function extractSkuFromText(text: string): string {
  if (!text) return "";

  const ignoredWords = /^(details|table|size|qty|quantity|description|name|code|price|gst|hsn|meesho|total|invoice|rate|item)$/i;

  // Pattern 1: Explicit labels like "SKU: ABC", "SKU Code: ABC", "Item SKU: ABC", "Product SKU: ABC"
  const labelMatch = text.match(/(?:(?:Product|Item)\s+)?SKU(?:\s*(?:Code|ID|Number|No|Name))?\s*[:\-#]\s*([A-Za-z0-9_\-\./]+)/i);
  if (labelMatch && labelMatch[1]) {
    const val = labelMatch[1].trim();
    if (val.length >= 2 && !ignoredWords.test(val)) {
      return val;
    }
  }

  // Pattern 2: Style ID / Style Code
  const styleMatch = text.match(/(?:Style\s*(?:ID|Code|No))\s*[:\-#]?\s*([A-Za-z0-9_\-\./]+)/i);
  if (styleMatch && styleMatch[1]) {
    const val = styleMatch[1].trim();
    if (val.length >= 2 && !ignoredWords.test(val)) {
      return val;
    }
  }

  // Pattern 3: SKU table rows where SKU is listed alongside Size and Qty (e.g., "SKU Size Qty ... <SKU_CODE>")
  const tableHeaderMatch = text.match(/SKU\s+(?:Size\s+Qty\s+|Description\s+|Qty\s+Size\s+)?([A-Za-z0-9_\-\./]+)/i);
  if (tableHeaderMatch && tableHeaderMatch[1]) {
    const val = tableHeaderMatch[1].trim();
    if (val.length >= 2 && !ignoredWords.test(val)) {
      return val;
    }
  }

  // Pattern 4: General fallback match for "SKU <value>"
  const generalMatch = text.match(/\bSKU\s+([A-Za-z0-9_\-\./]+)/i);
  if (generalMatch && generalMatch[1]) {
    const val = generalMatch[1].trim();
    if (val.length >= 2 && !ignoredWords.test(val)) {
      return val;
    }
  }

  return "";
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
    // Graceful fallback if text extraction encounters worker sandbox issues
  }
  return [];
}

/**
 * Precision rectangle crop for Meesho Seller shipping labels with partner-specific calibration
 * and multi-level sorting:
 * 1. Delivery Courier Partner (Delhivery -> Shadowfax -> Valmo -> Valmo Plus -> Xpressbees)
 * 2. Product SKU Code (Alphabetical A-Z within each delivery partner)
 */
export async function cropMeeshoPdf(
  input: File | Blob | ArrayBuffer,
  originalFileName: string = "meesho_order.pdf",
  cropMode: MeeshoCropMode = "invoice",
  selectedPartner: MeeshoPartner = "auto"
): Promise<CropResult> {
  let arrayBuffer: ArrayBuffer;
  let originalSize = 0;

  if (input instanceof File || input instanceof Blob) {
    originalSize = input.size;
    arrayBuffer = await input.arrayBuffer();
  } else {
    originalSize = input.byteLength;
    arrayBuffer = input;
  }

  // Load source PDF with pdf-lib
  const srcPdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  // Extract page text for courier partner auto-detection and SKU extraction
  const pagesText: string[] = await extractPagesText(arrayBuffer);

  const detectedPartners: Record<string, number> = {};
  const detectedSkus: Record<string, number> = {};
  const pageEntries: Array<{
    pageIndex: number;
    partnerKey: Exclude<MeeshoPartner, "auto">;
    partnerName: string;
    priority: number;
    sku: string;
  }> = [];

  // Identify courier partner and SKU for each page
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

    const sku = extractSkuFromText(pageText);
    if (sku) {
      detectedSkus[sku] = (detectedSkus[sku] || 0) + 1;
    }

    pageEntries.push({
      pageIndex: i,
      partnerKey,
      partnerName: partnerInfo.name,
      priority: PARTNER_SORT_PRIORITY[partnerKey] ?? 99,
      sku,
    });
  }

  // Multi-level sort:
  // Level 1: Delivery Partner Order (Delhivery -> Shadowfax -> Valmo -> Valmo Plus -> Xpressbees)
  // Level 2: SKU Alphabetical (within the same delivery partner)
  // Level 3: Original Page Index (stable tie-breaker)
  pageEntries.sort((a, b) => {
    // 1. Primary sort: Delivery Partner priority
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // 2. Secondary sort: Product SKU (case-insensitive natural alphabetical)
    if (a.sku && b.sku && a.sku.toLowerCase() !== b.sku.toLowerCase()) {
      return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: "base" });
    }
    if (a.sku && !b.sku) return -1;
    if (!a.sku && b.sku) return 1;

    // 3. Stable tie-breaker: original page index
    return a.pageIndex - b.pageIndex;
  });

  // Create new sorted output document
  const outputDoc = await PDFDocument.create();

  // Copy and crop pages in the sorted order
  for (const entry of pageEntries) {
    const [copiedPage] = await outputDoc.copyPages(srcPdfDoc, [entry.pageIndex]);
    const { width, height } = copiedPage.getSize();

    const partnerInfo = MEESHO_PARTNERS[entry.partnerKey] || MEESHO_PARTNERS.delhivery;
    const option = partnerInfo.options[cropMode] || partnerInfo.options.label_sku;

    const cropX = (option.x / 595) * width;
    const cropY = (option.y / 842) * height;
    const cropW = (option.w / 595) * width;
    const cropH = (option.h / 842) * height;

    // Apply to all standard PDF boxes
    copiedPage.setCropBox(cropX, cropY, cropW, cropH);
    copiedPage.setMediaBox(cropX, cropY, cropW, cropH);
    copiedPage.setBleedBox(cropX, cropY, cropW, cropH);
    copiedPage.setTrimBox(cropX, cropY, cropW, cropH);

    outputDoc.addPage(copiedPage);
  }

  // Save the cropped, courier & SKU sorted PDF
  const pdfBytes = await outputDoc.save();
  const croppedBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(croppedBlob);

  const baseName = originalFileName.replace(/^labelcroponline_/i, "").replace(/\.pdf$/i, "");
  const outputFileName = `labelcroponline_${baseName}_${cropMode}.pdf`;

  const partnerSummaryList = Object.entries(detectedPartners).map(
    ([name, count]) => `${name} (${count})`
  );
  const partnerSummaryText = partnerSummaryList.join(" • ");

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
