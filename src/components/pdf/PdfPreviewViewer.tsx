"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

interface PdfPreviewViewerProps {
  url?: string;
  bytes?: Uint8Array;
  initialScale?: number;
}

export function PdfPreviewViewer({ url, bytes, initialScale = 1.2 }: PdfPreviewViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(initialScale);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load document dynamically on client side
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadingTask: any = null;

    async function loadPdf() {
      if (!url && !bytes) return;

      try {
        setLoading(true);
        setError(null);

        // Dynamically import pdfjs only on client
        const pdfjs = await import("pdfjs-dist");
        
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        if (url) {
          loadingTask = pdfjs.getDocument({ url });
        } else if (bytes) {
          // Clone the buffer so React state is never detached by worker postMessage
          const bufferCopy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
          loadingTask = pdfjs.getDocument({ data: new Uint8Array(bufferCopy) });
        }

        if (!loadingTask) return;

        const doc = await loadingTask.promise;
        if (active) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          console.error("PDF load error:", err);
          setError("Failed to render PDF preview.");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      active = false;
      if (loadingTask && typeof loadingTask.destroy === "function") {
        loadingTask.destroy();
      }
    };
  }, [url, bytes]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Higher DPI scaling for crisp barcode rendering
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      const viewport = page.getViewport({ scale: scale * dpr });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (err: unknown) {
      console.error("Page render error:", err);
    }
  }, [pdfDoc, pageNum, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pageNum < numPages) setPageNum((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleResetZoom = () => {
    setScale(initialScale);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 rounded select-none overflow-hidden">
      
      {/* Control bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#051448]/20 text-xs font-semibold text-black">
        
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={pageNum <= 1 || loading}
            className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-2 py-0.5 font-medium">
            Page {pageNum} of {numPages || 1}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={pageNum >= numPages || loading}
            className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 rounded border border-[#051448]/30 hover:bg-slate-100 cursor-pointer text-[11px] font-bold"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-100 min-h-[480px]"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 text-black/70">
            <Loader2 size={32} className="animate-spin text-[#051448]" />
            <span className="text-xs font-medium">Rendering PDF preview...</span>
          </div>
        )}

        {error && (
          <div className="text-xs font-semibold text-red-600 p-4 text-center bg-white rounded border border-red-300">
            {error}
          </div>
        )}

        <div className={`transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`}>
          <canvas
            ref={canvasRef}
            className="shadow-md bg-white border border-slate-300 rounded mx-auto block"
          />
        </div>
      </div>
    </div>
  );
}
