"use client";

import { useEffect, useRef, useState, useCallback, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Crop,
  Info,
  Maximize,
} from "lucide-react";
import { CustomCropBox } from "@/lib/pdf/customCropper";

interface CustomPdfCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | Blob;
  onApplyCrop: (cropBox: CustomCropBox) => void;
  title?: string;
  initialCropBox?: CustomCropBox;
}

type HandleType =
  | "move"
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

export function CustomPdfCropModal({
  isOpen,
  onClose,
  file,
  onApplyCrop,
  title = "Select Area to Crop",
  initialCropBox,
}: CustomPdfCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentRenderTaskRef = useRef<any>(null);

  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rendered canvas dimensions in CSS pixels
  const [canvasDim, setCanvasDim] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Crop box in normalized percentages (0..1)
  const [box, setBox] = useState<CustomCropBox>(() => {
    return initialCropBox || {
      leftPct: 0.05,
      topPct: 0.05,
      widthPct: 0.9,
      heightPct: 0.9,
    };
  });

  // Dragging / Resizing interaction state
  const dragRef = useRef<{
    active: boolean;
    handle: HandleType;
    startX: number;
    startY: number;
    initialBox: CustomCropBox;
  }>({
    active: false,
    handle: "move",
    startX: 0,
    startY: 0,
    initialBox: { leftPct: 0.05, topPct: 0.05, widthPct: 0.9, heightPct: 0.9 },
  });

  // Render page onto canvas with viewport height fitting
  const renderCurrentPage = useCallback(async (doc: any, pageNum: number, currentScale: number) => {
    if (!doc || !canvasRef.current || !containerRef.current) return;

    // Cancel any in-flight rendering task to avoid concurrency crashes
    if (currentRenderTaskRef.current) {
      try {
        currentRenderTaskRef.current.cancel();
      } catch {
        // Ignored
      }
      currentRenderTaskRef.current = null;
    }

    try {
      const page = await doc.getPage(pageNum);
      const viewportUnscaled = page.getViewport({ scale: 1 });

      const containerWidth = Math.max(300, (containerRef.current.clientWidth || 600) - 64);
      const containerHeight = Math.max(380, (containerRef.current.clientHeight || 540) - 48);

      // Fit entire A4 page within visible area
      const scaleW = containerWidth / viewportUnscaled.width;
      const scaleH = containerHeight / viewportUnscaled.height;
      const baseScale = Math.min(scaleW, scaleH);
      const effectiveScale = Math.max(0.35, baseScale * currentScale);

      const viewport = page.getViewport({ scale: effectiveScale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasDim({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      currentRenderTaskRef.current = renderTask;
      await renderTask.promise;
      currentRenderTaskRef.current = null;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Error rendering page on canvas:", err);
      }
    }
  }, []);

  // 1. Load PDF Document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!file || !isOpen) return;

      try {
        setIsLoading(true);
        setError(null);

        const pdfjs = await import("pdfjs-dist");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const dataCopy = new Uint8Array(arrayBuffer.slice(0));
        const loadingTask = pdfjs.getDocument({ data: dataCopy });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);

        // Small timeout to allow containerRef layout measurement
        setTimeout(() => {
          if (!isCancelled && doc) {
            renderCurrentPage(doc, 1, 1);
          }
        }, 30);
      } catch (err) {
        console.error("Failed to load PDF in crop studio:", err);
        if (!isCancelled) {
          setError("Could not render PDF for area selection.");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch {
          // Ignored
        }
        currentRenderTaskRef.current = null;
      }
      pdfDocRef.current = null;
    };
  }, [file, isOpen, renderCurrentPage]);

  // Re-render when page or zoom changes
  useEffect(() => {
    if (pdfDocRef.current && isOpen && !isLoading) {
      renderCurrentPage(pdfDocRef.current, currentPage, zoomScale);
    }
  }, [currentPage, zoomScale, isOpen, isLoading, renderCurrentPage]);

  // Mouse / Touch handlers for dragging and resizing the crop box
  const handlePointerDown = (e: ReactMouseEvent | ReactTouchEvent, handle: HandleType) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      active: true,
      handle,
      startX: clientX,
      startY: clientY,
      initialBox: { ...box },
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  };

  const handlePointerMove = (e: MouseEvent) => {
    processPointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches && e.touches[0]) {
      processPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const processPointerMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.active || !canvasRef.current) return;

    const { handle, startX, startY, initialBox } = dragRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = (clientX - startX) / rect.width;
    const deltaY = (clientY - startY) / rect.height;

    let newLeft = initialBox.leftPct;
    let newTop = initialBox.topPct;
    let newWidth = initialBox.widthPct;
    let newHeight = initialBox.heightPct;

    const minSize = 0.03; // 3% minimum box dimension

    if (handle === "move") {
      newLeft = Math.max(0, Math.min(1 - newWidth, initialBox.leftPct + deltaX));
      newTop = Math.max(0, Math.min(1 - newHeight, initialBox.topPct + deltaY));
    } else {
      // Horizontal resizing
      if (handle === "left" || handle === "top-left" || handle === "bottom-left") {
        const potentialLeft = Math.max(0, Math.min(initialBox.leftPct + initialBox.widthPct - minSize, initialBox.leftPct + deltaX));
        newWidth = (initialBox.leftPct + initialBox.widthPct) - potentialLeft;
        newLeft = potentialLeft;
      } else if (handle === "right" || handle === "top-right" || handle === "bottom-right") {
        newWidth = Math.max(minSize, Math.min(1 - initialBox.leftPct, initialBox.widthPct + deltaX));
      }

      // Vertical resizing (Top / Bottom)
      if (handle === "top" || handle === "top-left" || handle === "top-right") {
        const potentialTop = Math.max(0, Math.min(initialBox.topPct + initialBox.heightPct - minSize, initialBox.topPct + deltaY));
        newHeight = (initialBox.topPct + initialBox.heightPct) - potentialTop;
        newTop = potentialTop;
      } else if (handle === "bottom" || handle === "bottom-left" || handle === "bottom-right") {
        newHeight = Math.max(minSize, Math.min(1 - initialBox.topPct, initialBox.heightPct + deltaY));
      }
    }

    setBox({
      leftPct: Math.max(0, Math.min(1, newLeft)),
      topPct: Math.max(0, Math.min(1, newTop)),
      widthPct: Math.max(minSize, Math.min(1 - newLeft, newWidth)),
      heightPct: Math.max(minSize, Math.min(1 - newTop, newHeight)),
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handlePointerUp);
  };

  const handleApply = () => {
    onApplyCrop(box);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#051448] rounded-lg w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#051448]/20 bg-[#051448] text-white">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-blue-300" />
            <h2 className="font-bold text-sm sm:text-base">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 text-xs font-bold text-[#051448] bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded transition-colors cursor-pointer shadow-sm"
            >
              <Check size={14} strokeWidth={2.5} />
              Apply Crop Area
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar: Zoom & Page Navigation */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-1.5 text-black/75 text-xs">
            <Info size={14} className="text-[#051448]" />
            <span>Drag any border (top, bottom, left, right) to select the area.</span>
          </div>

          {/* Controls: Zoom & Page Navigation */}
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-[#051448]/30 rounded p-0.5">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.15))}
                className="p-1 hover:bg-slate-100 rounded text-black cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="text-[10px] font-bold text-black px-1.5 hover:bg-slate-100 rounded"
                title="Fit Page (100%)"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(2.0, prev + 0.15))}
                className="p-1 hover:bg-slate-100 rounded text-black cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            {/* Multi-page Navigation if needed */}
            {numPages > 1 && (
              <div className="flex items-center gap-1 bg-white border border-[#051448]/30 rounded p-0.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-black cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[10px] font-semibold text-black px-1">
                  Page {currentPage}/{numPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-black cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas & Interactive Crop Overlay Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200/95 p-6 sm:p-10 flex justify-center items-start min-h-[440px] max-h-[70vh] select-none"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center my-auto gap-2 text-[#051448]">
              <div className="w-8 h-8 border-3 border-[#051448] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Rendering PDF page...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 text-xs font-semibold bg-red-50 p-4 rounded border border-red-200 my-auto">
              {error}
            </div>
          ) : (
            <div
              className="relative shadow-2xl border border-slate-400 bg-white my-2"
              style={{
                width: canvasDim.width > 0 ? `${canvasDim.width}px` : "auto",
                height: canvasDim.height > 0 ? `${canvasDim.height}px` : "auto",
              }}
            >
              {/* Actual PDF Page Canvas */}
              <canvas ref={canvasRef} className="block pointer-events-none" />

              {/* Shaded Backdrop Overlays Outside the Crop Box */}
              {canvasDim.width > 0 && (
                <>
                  {/* Top shaded strip */}
                  <div
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${box.topPct * 100}%`,
                    }}
                  />
                  {/* Bottom shaded strip */}
                  <div
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                      top: `${(box.topPct + box.heightPct) * 100}%`,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  {/* Left shaded strip */}
                  <div
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                      top: `${box.topPct * 100}%`,
                      left: 0,
                      width: `${box.leftPct * 100}%`,
                      height: `${box.heightPct * 100}%`,
                    }}
                  />
                  {/* Right shaded strip */}
                  <div
                    className="absolute bg-black/50 pointer-events-none"
                    style={{
                      top: `${box.topPct * 100}%`,
                      left: `${(box.leftPct + box.widthPct) * 100}%`,
                      right: 0,
                      height: `${box.heightPct * 100}%`,
                    }}
                  />
                </>
              )}

              {/* Interactive Resizable Crop Box */}
              {canvasDim.width > 0 && (
                <div
                  onMouseDown={(e) => handlePointerDown(e, "move")}
                  onTouchStart={(e) => handlePointerDown(e, "move")}
                  className="absolute border-2 border-dashed border-[#051448] bg-transparent cursor-move shadow-[0_0_0_1px_rgba(255,255,255,0.9)] z-20"
                  style={{
                    left: `${box.leftPct * 100}%`,
                    top: `${box.topPct * 100}%`,
                    width: `${box.widthPct * 100}%`,
                    height: `${box.heightPct * 100}%`,
                  }}
                >
                  {/* Area Dimensions Badge */}
                  <div className="absolute top-2 left-2 bg-[#051448]/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none flex items-center gap-1 z-30">
                    <span>{Math.round(box.widthPct * 100)}% × {Math.round(box.heightPct * 100)}%</span>
                  </div>

                  {/* ── 8 Resize Handles with Clear Touch Targets ── */}

                  {/* Top Edge Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "top")}
                    onTouchStart={(e) => handlePointerDown(e, "top")}
                    className="absolute -top-3 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center z-30 group"
                  >
                    <div className="w-10 h-3 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Bottom Edge Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "bottom")}
                    onTouchStart={(e) => handlePointerDown(e, "bottom")}
                    className="absolute -bottom-3 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center z-30 group"
                  >
                    <div className="w-10 h-3 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Left Edge Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "left")}
                    onTouchStart={(e) => handlePointerDown(e, "left")}
                    className="absolute top-0 bottom-0 -left-3 w-6 cursor-ew-resize flex items-center justify-center z-30 group"
                  >
                    <div className="h-10 w-3 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Right Edge Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "right")}
                    onTouchStart={(e) => handlePointerDown(e, "right")}
                    className="absolute top-0 bottom-0 -right-3 w-6 cursor-ew-resize flex items-center justify-center z-30 group"
                  >
                    <div className="h-10 w-3 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Top-Left Corner Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "top-left")}
                    onTouchStart={(e) => handlePointerDown(e, "top-left")}
                    className="absolute -top-3.5 -left-3.5 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-40 group"
                  >
                    <div className="w-4.5 h-4.5 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Top-Right Corner Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "top-right")}
                    onTouchStart={(e) => handlePointerDown(e, "top-right")}
                    className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-40 group"
                  >
                    <div className="w-4.5 h-4.5 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Bottom-Right Corner Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "bottom-right")}
                    onTouchStart={(e) => handlePointerDown(e, "bottom-right")}
                    className="absolute -bottom-3.5 -right-3.5 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-40 group"
                  >
                    <div className="w-4.5 h-4.5 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Bottom-Left Corner Handle */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, "bottom-left")}
                    onTouchStart={(e) => handlePointerDown(e, "bottom-left")}
                    className="absolute -bottom-3.5 -left-3.5 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-40 group"
                  >
                    <div className="w-4.5 h-4.5 bg-[#051448] border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-black/70">
            Selected area will be applied across all pages in this PDF.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#051448]/30 rounded text-black text-xs font-semibold hover:border-[#051448] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#051448] hover:bg-[#071a5e] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Check size={14} strokeWidth={2.5} />
              Apply & Crop PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
