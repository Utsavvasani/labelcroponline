import { getFormattedDateTime } from "@/utils/file";

export type ImageFormat = "png" | "jpeg";
export type ImageDpi = 72 | 150 | 300;

export interface PdfToImagesOptions {
  format: ImageFormat;
  dpi: ImageDpi;
  pagesStr: string;
}

export interface ConvertedImage {
  pageIndex: number;
  label: string;
  blob: Blob;
  blobUrl: string;
  fileName: string;
  width: number;
  height: number;
}

function parsePagesStr(pagesStr: string, total: number): number[] {
  if (!pagesStr.trim() || pagesStr.toLowerCase() === "all") {
    return Array.from({ length: total }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = pagesStr.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const dash = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (dash) {
      const from = Math.max(1, parseInt(dash[1], 10));
      const to = Math.min(total, parseInt(dash[2], 10));
      for (let i = from; i <= to; i++) indices.add(i - 1);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= total) indices.add(n - 1);
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

function dpiToScale(dpi: ImageDpi): number {
  return dpi / 72;
}

export async function convertPdfToImages(
  arrayBuffer: ArrayBuffer,
  options: PdfToImagesOptions,
  originalFileName: string = "document.pdf",
  onProgress?: (done: number, total: number) => void
): Promise<ConvertedImage[]> {
  if (typeof window === "undefined") return [];

  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const data = new Uint8Array(arrayBuffer.slice(0));
  const pdfDoc = await pdfjs.getDocument({ data }).promise;
  const total = pdfDoc.numPages;

  const pageIndices = parsePagesStr(options.pagesStr, total);
  const scale = dpiToScale(options.dpi);
  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const ext = options.format;
  const quality = options.format === "jpeg" ? 0.92 : undefined;

  const dateStr = getFormattedDateTime();
  const cleanBase = originalFileName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 25);

  const results: ConvertedImage[] = [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  for (let i = 0; i < pageIndices.length; i++) {
    const pageNum = pageIndices[i] + 1;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    if (options.format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, quality);
    });

    const blobUrl = URL.createObjectURL(blob);
    const fileName = `${cleanBase}_page${String(pageNum).padStart(3, "0")}_${options.dpi}dpi_${dateStr}.${ext}`;

    results.push({
      pageIndex: pageIndices[i],
      label: `Page ${pageNum}`,
      blob,
      blobUrl,
      fileName,
      width: canvas.width,
      height: canvas.height,
    });

    if (onProgress) onProgress(i + 1, pageIndices.length);
  }

  return results;
}

export async function buildImagesZip(
  images: ConvertedImage[],
  baseName: string
): Promise<{ blobUrl: string; blob: Blob; fileName: string }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const dateStr = getFormattedDateTime();

  for (const img of images) {
    const arrayBuffer = await img.blob.arrayBuffer();
    zip.file(img.fileName, arrayBuffer);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 4 },
  });

  const blobUrl = URL.createObjectURL(zipBlob);
  const cleanBase = baseName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 25);
  const fileName = `Images_${cleanBase}_${images.length}pages_${dateStr}.zip`;

  return { blobUrl, blob: zipBlob, fileName };
}

export async function getPdfImageInfo(
  arrayBuffer: ArrayBuffer
): Promise<number> {
  if (typeof window === "undefined") return 0;
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  const data = new Uint8Array(arrayBuffer.slice(0));
  const doc = await pdfjs.getDocument({ data }).promise;
  return doc.numPages;
}
