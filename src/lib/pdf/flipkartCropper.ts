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
  soldBy?: string;
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
 * Extracts "Sold By" seller/brand name from Flipkart shipping label/invoice text.
 */
export function extractFlipkartSoldByFromText(text: string): string {
  if (!text) return "";

  // Pattern 1: "Sold By:" or "Sold By :" or "Sold By |"
  const m1 = text.match(/Sold\s+By\s*[:\|\-]?\s*([^,\r\n\|]+)/i);
  if (m1 && m1[1]) {
    let name = m1[1].trim();
    name = name.replace(/[^A-Za-z0-9_\- ]/g, "").trim().replace(/\s+/g, "_");
    if (name.length >= 2) return name;
  }

  // Pattern 2: "Seller Registered Address:" or "Seller:"
  const m2 = text.match(/Seller(?:\s+Registered\s+Address)?\s*[:\|\-]?\s*([^,\r\n\|]+)/i);
  if (m2 && m2[1]) {
    let name = m2[1].trim();
    name = name.replace(/[^A-Za-z0-9_\- ]/g, "").trim().replace(/\s+/g, "_");
    if (name.length >= 2) return name;
  }

  return "";
}

/**
 * Returns today's date formatted as DD_MM_YYYY (e.g., 21_08_2026)
 */
export function getFormattedTodayDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}_${month}_${year}`;
}

/**
 * Crops Flipkart shipping labels matching the exact cut specifications:
 * CropBox / MediaBox = { x: 165, y: 460, width: 265, height: 360 } (on standard A4 595 x 842 pt).
 * Preserves exact original page sequence without sorting.
 * Generates default file name format: Flipkart_<Sold_By>_<date>_Labelcroponline.pdf
 */
export async function cropFlipkartPdf(
  input: File | Blob | ArrayBuffer | Uint8Array,
  _fileName: string = "Flipkart.pdf",
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

  // Extract page text for Sold By seller detection
  const pagesText = await extractPagesText(arrayBuffer);
  let soldByName = "";

  for (let i = 0; i < totalPages; i++) {
    const pageText = pagesText[i] || "";

    if (!soldByName) {
      soldByName = extractFlipkartSoldByFromText(pageText);
    }

    const page = srcPdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Exact symmetrical crop with equal spacing on all sides (3.5 pt margins around border):
    // x: 165 pt, y: 459.5 pt, width: 265 pt, height: 361.5 pt
    const cropX = (165 / 595.28) * width;
    const cropY = (459.5 / 841.89) * height;
    const cropW = (265 / 595.28) * width;
    const cropH = (361.5 / 841.89) * height;

    page.setCropBox(cropX, cropY, cropW, cropH);
    page.setMediaBox(cropX, cropY, cropW, cropH);
    page.setBleedBox(cropX, cropY, cropW, cropH);
    page.setTrimBox(cropX, cropY, cropW, cropH);
  }

  const pdfBytes = await srcPdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  // Generate default file name format: Flipkart_<Sold_By>_<date>_Labelcroponline.pdf
  const todayDateStr = getFormattedTodayDate();
  const outputFileName = soldByName
    ? `Flipkart_${soldByName}_${todayDateStr}_Labelcroponline.pdf`
    : `Flipkart_${todayDateStr}_Labelcroponline.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    pageCount: totalPages,
    originalSize,
    croppedSize: pdfBytes.byteLength,
    fileName: outputFileName,
    soldBy: soldByName || undefined,
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
