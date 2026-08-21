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
 * Crops a Meesho PDF with courier-calibrated margins in original page sequence.
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

  // Extract page text for courier partner auto-detection
  const pagesText: string[] = await extractPagesText(arrayBuffer);
  const detectedPartners: Record<string, number> = {};

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

    const page = srcPdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const option = partnerInfo.options[cropMode] || partnerInfo.options.label_sku;

    const cropX = (option.x / 595) * width;
    const cropY = (option.y / 842) * height;
    const cropW = (option.w / 595) * width;
    const cropH = (option.h / 842) * height;

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);
  }

  const pdfBytes = await srcPdfDoc.save();
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
