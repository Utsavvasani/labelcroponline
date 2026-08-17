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
}

/**
 * Crops Flipkart shipping labels matching the exact cut specifications of cropped_label.pdf:
 * CropBox / MediaBox = { x: 165, y: 460, width: 265, height: 360 } (on standard A4 595 x 842 pt).
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

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Exact reference cut matching cropped_label.pdf:
    // x: 165 pt (27.73% of width)
    // y: 460 pt (54.63% of height)
    // width: 265 pt (44.54% of width)
    // height: 360 pt (42.76% of height)
    const cropX = (165 / 595) * width;
    const cropY = (460 / 842) * height;
    const cropW = (265 / 595) * width;
    const cropH = (360 / 842) * height;

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  // Generate friendly output name
  const cleanBaseName = fileName.replace(/\.[^/.]+$/, "").replace(/_cropped/g, "");
  const outputFileName = `${cleanBaseName}_Cropped_Label.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    fileName: outputFileName,
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
