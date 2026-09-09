import { PDFDocument } from "pdf-lib";
import { getFormattedDateTime } from "@/utils/file";

export type CompressionLevel = "light" | "standard" | "aggressive";

export interface CompressOptions {
  level: CompressionLevel;
}

export interface CompressResult {
  pdfBytes: Uint8Array;
  blob: Blob;
  blobUrl: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  pageCount: number;
  fileName: string;
}

export async function compressPdf(
  srcArrayBuffer: ArrayBuffer,
  options: CompressOptions,
  originalFileName: string = "document.pdf"
): Promise<CompressResult> {
  const originalSize = srcArrayBuffer.byteLength;

  const srcDoc = await PDFDocument.load(srcArrayBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Light: strip metadata
  srcDoc.setAuthor("");
  srcDoc.setCreator("LabelCropOnline.com");
  srcDoc.setProducer("LabelCropOnline PDF Compressor");
  srcDoc.setKeywords([]);
  srcDoc.setSubject("");

  // Standard: flatten forms if any
  if (options.level === "standard" || options.level === "aggressive") {
    try {
      const form = srcDoc.getForm();
      form.flatten();
    } catch {
      // ignore
    }
  }

  let outputDoc: PDFDocument;
  if (options.level === "aggressive") {
    outputDoc = await PDFDocument.create();
    outputDoc.setCreator("LabelCropOnline.com");
    outputDoc.setProducer("LabelCropOnline PDF Compressor");
    const copied = await outputDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    copied.forEach((p) => outputDoc.addPage(p));
  } else {
    outputDoc = srcDoc;
  }

  const pdfBytes = await outputDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });

  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  const compressedSize = pdfBytes.byteLength;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  const dateStr = getFormattedDateTime();
  const cleanBase = originalFileName
    .replace(/\.pdf$/i, "")
    .replace(/[^A-Za-z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, 30);
  const fileName = `Compressed_${cleanBase}_${dateStr}_Labelcroponline.pdf`;

  return {
    pdfBytes,
    blob,
    blobUrl,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    pageCount: outputDoc.getPageCount(),
    fileName,
  };
}

export async function getCompressPdfInfo(
  file: File
): Promise<{ pageCount: number; fileSize: number }> {
  const ab = await file.arrayBuffer();
  const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
  return { pageCount: doc.getPageCount(), fileSize: file.size };
}
