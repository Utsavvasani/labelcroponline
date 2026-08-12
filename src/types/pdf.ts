export interface PdfPageMeta {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PdfDocumentMeta {
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: PdfPageMeta[];
}
