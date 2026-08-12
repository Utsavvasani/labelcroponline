import { useState, useCallback } from "react";
import { PdfDocumentMeta } from "@/types";

export function usePdf() {
  const [pdfMeta, setPdfMeta] = useState<PdfDocumentMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPdf = useCallback((file: File) => {
    setIsLoading(true);
    // Placeholder for PDF loading logic
    setPdfMeta({
      fileName: file.name,
      fileSize: file.size,
      totalPages: 1,
      pages: [{ pageNumber: 1, width: 612, height: 792, rotation: 0 }],
    });
    setIsLoading(false);
  }, []);

  return {
    pdfMeta,
    isLoading,
    loadPdf,
  };
}
