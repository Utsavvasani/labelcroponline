import { PDFDocument } from "pdf-lib";

export type MeeshoCropMode = "half" | "label_sku" | "invoice";

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

export const MEESHO_CROP_ORDER: MeeshoCropMode[] = ["invoice", "label_sku", "half"];

export const MEESHO_CROP_OPTIONS: Record<MeeshoCropMode, MeeshoCropOption> = {
  invoice: {
    id: "invoice",
    name: "Full with Tax Invoice",
    shortLabel: "With Tax Invoice",
    desc: "Shipping label, SKU table + GST Tax Invoice",
    suffix: "with_invoice",
    x: 6,
    y: 233,
    w: 583,
    h: 603,
  },
  label_sku: {
    id: "label_sku",
    name: "Label + SKU Details",
    shortLabel: "Label + SKU",
    desc: "Shipping label + Product details (SKU, Qty, Order ID)",
    suffix: "label_sku",
    x: 6,
    y: 476,
    w: 583,
    h: 360,
  },
  half: {
    id: "half",
    name: "Half Crop (Label Only)",
    shortLabel: "Half Crop",
    desc: "Customer address, return address & barcode",
    suffix: "half_label",
    x: 6,
    y: 531.5,
    w: 583,
    h: 304.5,
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
}

/**
 * Precision rectangle crop for Meesho Seller shipping labels with clean border spacing:
 *
 * Page Reference (A4: 595 x 842 pt):
 * - "invoice": Full with Tax (Shipping label + product details + Tax Invoice) (x: 6, y: 233, w: 583, h: 603)
 * - "label_sku": Shipping label + product details (x: 6, y: 476, w: 583, h: 360)
 * - "half": Shipping label only (x: 6, y: 531.5, w: 583, h: 304.5)
 */
export async function cropMeeshoPdf(
  input: File | Blob | ArrayBuffer,
  originalFileName: string = "meesho_order.pdf",
  cropMode: MeeshoCropMode = "invoice"
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

  // Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  const option = MEESHO_CROP_OPTIONS[cropMode] || MEESHO_CROP_OPTIONS.label_sku;

  // Loop through all pages and apply proportional Meesho crop box
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const cropX = (option.x / 595) * width;
    const cropY = (option.y / 842) * height;
    const cropW = (option.w / 595) * width;
    const cropH = (option.h / 842) * height;

    // Apply to all standard PDF boxes to ensure universal compatibility
    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);
  }

  // Save the cropped PDF (vector content preserved)
  const pdfBytes = await pdfDoc.save();
  const croppedBlob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(croppedBlob);

  const baseName = originalFileName.replace(/\.pdf$/i, "");
  const outputFileName = `${baseName}_${option.suffix}.pdf`;

  return {
    blobUrl,
    pdfBytes,
    fileName: outputFileName,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    cropMode,
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
