"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  FileCheck,
  Maximize2,
} from "lucide-react";

interface PdfPreviewViewerProps {
  url?: string;
  bytes?: Uint8Array;
  initialScale?: number;
}

interface PageTextData {
  pageNum: number;
  fullText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Array<{ str: string; transform: number[]; width: number; height: number }>;
}

interface SearchMatch {
  pageNum: number;
  snippet: string;
}

export function PdfPreviewViewer({ url, bytes, initialScale = 1.3 }: PdfPreviewViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pagesWrapperRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasksRef = useRef<Map<number, any>>(new Map());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(initialScale);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pagesText, setPagesText] = useState<PageTextData[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  // Pinch-to-zoom state ref
  const pinchStateRef = useRef<{
    isPinching: boolean;
    initialDistance: number;
    initialScale: number;
    midpointX: number;
    midpointY: number;
  }>({
    isPinching: false,
    initialDistance: 0,
    initialScale: initialScale,
    midpointX: 0,
    midpointY: 0,
  });

  // 1. Load document dynamically on client side
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadingTask: any = null;

    async function loadPdf() {
      if (!url && !bytes) return;

      try {
        setLoading(true);
        setError(null);
        setPagesText([]);
        setSearchQuery("");

        const pdfjs = await import("pdfjs-dist");

        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        if (url) {
          loadingTask = pdfjs.getDocument({ url });
        } else if (bytes) {
          const bufferCopy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
          loadingTask = pdfjs.getDocument({ data: new Uint8Array(bufferCopy) });
        }

        if (!loadingTask) return;

        const doc = await loadingTask.promise;
        if (!active) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);

        // Extract text content in background for instant search
        const extracted: PageTextData[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          try {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = textContent.items.map((it: any) => ({
              str: it.str || "",
              transform: it.transform,
              width: it.width,
              height: it.height,
            }));
            const fullText = items.map((it: { str: string }) => it.str).join(" ");
            extracted.push({ pageNum: i, fullText, items });
          } catch (e) {
            console.error(`Failed to extract text for page ${i}:`, e);
          }
        }

        if (active) {
          setPagesText(extracted);
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

  // 2. Render all pages vertically on canvas safely cancelling in-flight renders
  const renderAllPages = useCallback(async () => {
    if (!pdfDoc) return;

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2.5) : 1;

    for (let p = 1; p <= numPages; p++) {
      try {
        const canvas = canvasRefs.current.get(p);
        if (!canvas) continue;

        const page = await pdfDoc.getPage(p);
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Cancel previous in-flight render task on this canvas if any
        const prevTask = renderTasksRef.current.get(p);
        if (prevTask) {
          try {
            prevTask.cancel();
          } catch {
            // Ignored
          }
          renderTasksRef.current.delete(p);
        }

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

        const renderTask = page.render(renderContext);
        renderTasksRef.current.set(p, renderTask);

        try {
          await renderTask.promise;
        } catch (err: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = err as any;
          if (e?.name !== "RenderingCancelledException" && !e?.message?.includes("cancelled")) {
            console.error(`Error rendering page ${p}:`, err);
          }
        } finally {
          if (renderTasksRef.current.get(p) === renderTask) {
            renderTasksRef.current.delete(p);
          }
        }
      } catch (err: unknown) {
        console.error(`Error processing page ${p}:`, err);
      }
    }
  }, [pdfDoc, numPages, scale]);

  useEffect(() => {
    renderAllPages();
    return () => {
      renderTasksRef.current.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // Ignored
        }
      });
      renderTasksRef.current.clear();
    };
  }, [renderAllPages]);

  // 3. Two-Finger Pinch-To-Zoom and Wheel Zoom Event Listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        pinchStateRef.current = {
          isPinching: true,
          initialDistance: dist > 0 ? dist : 1,
          initialScale: scale,
          midpointX: (t1.clientX + t2.clientX) / 2,
          midpointY: (t1.clientY + t2.clientY) / 2,
        };
        if (pagesWrapperRef.current) {
          pagesWrapperRef.current.style.transition = "none";
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStateRef.current.isPinching) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = dist / pinchStateRef.current.initialDistance;

        const targetScale = Math.min(
          Math.max(pinchStateRef.current.initialScale * ratio, 0.4),
          3.5
        );

        if (pagesWrapperRef.current) {
          const visualRatio = targetScale / scale;
          pagesWrapperRef.current.style.transform = `scale(${visualRatio})`;
          pagesWrapperRef.current.style.transformOrigin = "center top";
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (pinchStateRef.current.isPinching && e.touches.length < 2) {
        pinchStateRef.current.isPinching = false;
        if (pagesWrapperRef.current) {
          const currentTransform = pagesWrapperRef.current.style.transform;
          const match = currentTransform.match(/scale\(([^)]+)\)/);
          const visualRatio = match ? parseFloat(match[1]) : 1;

          pagesWrapperRef.current.style.transform = "none";
          pagesWrapperRef.current.style.transition = "";

          if (!isNaN(visualRatio) && visualRatio !== 1) {
            const finalScale = Math.min(Math.max(scale * visualRatio, 0.4), 3.5);
            setScale(Math.round(finalScale * 100) / 100);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.005;
        setScale((prev) => {
          const next = Math.min(Math.max(prev + zoomDelta, 0.4), 3.5);
          return Math.round(next * 100) / 100;
        });
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scale]);

  // 4. Compute search matches across all pages
  const searchMatches = useMemo<SearchMatch[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || pagesText.length === 0) return [];

    const matches: SearchMatch[] = [];
    pagesText.forEach((pt) => {
      const lower = pt.fullText.toLowerCase();
      let pos = lower.indexOf(q);
      while (pos !== -1) {
        // Grab a short preview snippet around match
        const start = Math.max(0, pos - 15);
        const end = Math.min(pt.fullText.length, pos + q.length + 20);
        const snippet = pt.fullText.substring(start, end);
        matches.push({ pageNum: pt.pageNum, snippet });
        pos = lower.indexOf(q, pos + q.length);
      }
    });

    return matches;
  }, [searchQuery, pagesText]);

  // Jump to specific match
  const scrollToMatch = useCallback(
    (index: number) => {
      if (searchMatches.length === 0) return;
      const safeIndex = (index + searchMatches.length) % searchMatches.length;
      setActiveMatchIndex(safeIndex);

      const targetMatch = searchMatches[safeIndex];
      const pageEl = pageRefs.current.get(targetMatch.pageNum);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [searchMatches]
  );

  // Search navigation
  const handleNextMatch = () => {
    scrollToMatch(activeMatchIndex + 1);
  };

  const handlePrevMatch = () => {
    scrollToMatch(activeMatchIndex - 1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(Math.round((prev + 0.2) * 10) / 10, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Math.round((prev - 0.2) * 10) / 10, 0.4));
  };

  const handleResetZoom = () => {
    setScale(initialScale);
  };

  // Check if a page has any search matches
  const matchedPagesSet = useMemo(() => {
    return new Set(searchMatches.map((m) => m.pageNum));
  }, [searchMatches]);

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] select-none overflow-hidden rounded">
      
      {/* ── Top Control & Search Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-4 py-2 bg-white border-b border-[#051448]/20 text-xs font-semibold text-black">
        
        {/* Search Bar for Order ID, SKU, and details */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMatchIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search Order ID, SKU, Tracking..."
              className="w-full pl-8 pr-7 py-1 text-xs text-black border border-[#051448]/30 rounded focus:outline-hidden focus:ring-1 focus:ring-[#051448] bg-white font-medium placeholder:font-normal placeholder:text-black/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black cursor-pointer p-0.5"
                title="Clear Search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search match navigation */}
          {searchQuery && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-black/70 shrink-0">
              <span className="whitespace-nowrap">
                {searchMatches.length > 0
                  ? `${activeMatchIndex + 1}/${searchMatches.length}`
                  : "0"}
              </span>

              <button
                type="button"
                onClick={handlePrevMatch}
                disabled={searchMatches.length === 0}
                className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous match (Shift + Enter)"
              >
                <ChevronUp size={13} />
              </button>

              <button
                type="button"
                onClick={handleNextMatch}
                disabled={searchMatches.length === 0}
                className="p-1 rounded border border-[#051448]/30 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next match (Enter)"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Zoom & Page Count Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {numPages > 0 && (
            <span className="inline-flex items-center gap-1 text-black/60 font-medium text-xs">
              <Layers size={13} className="text-[#051448]" />
              {numPages} <span className="hidden sm:inline">Label{numPages > 1 ? "s" : ""}</span>
            </span>
          )}

          <div className="flex items-center gap-1 bg-slate-50 border border-[#051448]/20 rounded p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-200 cursor-pointer transition-colors text-[#051448]"
              title="Zoom Out (or pinch with two fingers)"
            >
              <ZoomOut size={14} />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer text-[11px] font-bold text-[#051448] flex items-center gap-0.5"
              title="Reset Zoom / Fit"
            >
              <Maximize2 size={11} className="opacity-70" />
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-200 cursor-pointer transition-colors text-[#051448]"
              title="Zoom In (or spread with two fingers)"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Continuous Scrollable Canvas Container with Full 2D Panning & Pinch-Zoom ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 sm:p-6 min-h-[400px] w-full overscroll-contain"
        style={{
          touchAction: "pan-x pan-y",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-black/70">
            <Loader2 size={32} className="animate-spin text-[#051448]" />
            <span className="text-xs font-medium">Loading and rendering labels...</span>
          </div>
        )}

        {error && (
          <div className="text-xs font-semibold text-red-600 p-4 text-center bg-white rounded border border-red-300">
            {error}
          </div>
        )}

        {!loading && !error && numPages > 0 && (
          <div
            ref={pagesWrapperRef}
            className="min-w-full inline-flex flex-col items-center gap-6 pb-6"
          >
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
              const isMatched = matchedPagesSet.has(p);
              const isActiveMatchPage =
                searchMatches.length > 0 &&
                searchMatches[activeMatchIndex]?.pageNum === p;

              return (
                <div
                  key={`page-container-${p}`}
                  ref={(el) => {
                    if (el) pageRefs.current.set(p, el);
                    else pageRefs.current.delete(p);
                  }}
                  className={`flex flex-col items-center transition-shadow duration-200 max-w-full ${
                    isActiveMatchPage
                      ? "ring-4 ring-amber-400 rounded-md p-1 bg-amber-50/50"
                      : isMatched
                      ? "ring-2 ring-blue-400 rounded-md p-1"
                      : ""
                  }`}
                >
                  {/* Page / Label Header Pill */}
                  <div className="flex items-center justify-between w-full max-w-[400px] mb-1.5 px-1 text-[11px] text-black/60 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <FileCheck size={12} className="text-[#051448]" />
                      Label #{p}
                    </span>

                    {isMatched && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        Match Found
                      </span>
                    )}
                  </div>

                  {/* Rendered Page Canvas with responsive shadow card */}
                  <div className="shadow-md bg-white border border-[#051448]/20 rounded overflow-hidden max-w-none">
                    <canvas
                      ref={(el) => {
                        if (el) canvasRefs.current.set(p, el);
                        else canvasRefs.current.delete(p);
                      }}
                      className="block bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

