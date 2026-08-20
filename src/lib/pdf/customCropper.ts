import { PDFDocument } from "pdf-lib";

export interface CustomCropBox {
  leftPct: number;   // 0 to 1 (distance from left edge)
  topPct: number;    // 0 to 1 (distance from top edge)
  widthPct: number;  // 0 to 1 (width of crop area)
  heightPct: number; // 0 to 1 (height of crop area)
}

export interface CustomCropResult {
  pdfBytes: Uint8Array;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
  originalSize: number;
  croppedSize: number;
  fileName: string;
  cropBox: CustomCropBox;
  partnerSummaryText?: string;
}

/**
 * Precision rectangle crop on any PDF based on normalized percentage coordinates.
 * Coordinates are measured from top-left (0..1) and converted to PDF-lib origin (bottom-left).
 */
export async function cropPdfCustomArea(
  input: File | Blob | ArrayBuffer | Uint8Array,
  originalFileName: string = "document.pdf",
  cropBox: CustomCropBox
): Promise<CustomCropResult> {
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

  if (totalPages === 0) {
    throw new Error("The uploaded PDF has no pages.");
  }

  // Ensure cropBox is bounded within 0..1
  const leftPct = Math.max(0, Math.min(1, cropBox.leftPct));
  const topPct = Math.max(0, Math.min(1, cropBox.topPct));
  const widthPct = Math.max(0.01, Math.min(1 - leftPct, cropBox.widthPct));
  const heightPct = Math.max(0.01, Math.min(1 - topPct, cropBox.heightPct));

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    const cropX = leftPct * width;
    const cropW = widthPct * width;
    const cropH = heightPct * height;
    // In PDF coordinate space, (0,0) is bottom-left:
    const cropY = height - (topPct * height + cropH);

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const cleanBaseName = originalFileName
    .replace(/^labelcroponline_/i, "")
    .replace(/\.[^/.]+$/, "")
    .replace(/_cropped/g, "");
  const outputFileName = `labelcroponline_${cleanBaseName}_custom_crop.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    fileName: outputFileName,
    cropBox: { leftPct, topPct, widthPct, heightPct },
  };
}
