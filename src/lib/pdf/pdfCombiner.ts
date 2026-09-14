import { PDFDocument } from "pdf-lib";

export interface FilePageBreakdown {
  name: string;
  pages: number;
}

export interface CombinedPdfResult {
  combinedFile: File;
  breakdown: FilePageBreakdown[];
  totalPages: number;
}

/**
 * Combines an array of PDF files into a single in-memory File preserving vector fidelity.
 * If only 1 file is provided, returns the file directly while reading its page count.
 */
export async function combinePdfFiles(
  files: File[],
  defaultBaseName: string
): Promise<CombinedPdfResult> {
  if (!files || files.length === 0) {
    throw new Error("No PDF files provided.");
  }

  if (files.length === 1) {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();
    return {
      combinedFile: file,
      breakdown: [{ name: file.name, pages: totalPages }],
      totalPages,
    };
  }

  const mergedDoc = await PDFDocument.create();
  const breakdown: FilePageBreakdown[] = [];
  let totalPages = 0;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();
    breakdown.push({ name: file.name, pages: pageCount });
    totalPages += pageCount;

    const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  const mergedBytes = await mergedDoc.save();
  const blob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });
  const combinedFileName = `${defaultBaseName}_${files.length}_files.pdf`;
  const combinedFile = new File([blob], combinedFileName, { type: "application/pdf" });

  return {
    combinedFile,
    breakdown,
    totalPages,
  };
}
