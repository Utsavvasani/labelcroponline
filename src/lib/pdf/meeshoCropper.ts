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
        y: 472,
        w: 583,
        h: 364,
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
        y: 234,
        w: 583,
        h: 608,
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
        suffix: "valmo_plus_invoice",
        x: 6,
        y: 240,
        w: 583,
        h: 602,
      },
      label_sku: {
        id: "label_sku",
        name: "Label + SKU Details",
        shortLabel: "Label + SKU",
        desc: "Valmo Plus shipping label + SKU table",
        suffix: "valmo_plus_sku",
        x: 6,
        y: 485,
        w: 583,
        h: 351,
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
 * Precision rectangle crop for Meesho Seller shipping labels with partner-specific calibration.
 * Preserves original PDF page order without reordering.
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
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  // Extract page text for courier partner auto-detection
  const pagesText: string[] = await extractPagesText(arrayBuffer);
  const detectedPartners: Record<string, number> = {};

  // Crop each page in its exact original order
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
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

  // Save the cropped PDF in original sequence
  const pdfBytes = await pdfDoc.save();
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
