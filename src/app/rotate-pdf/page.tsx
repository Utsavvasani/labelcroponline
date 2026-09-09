"use client";

import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  Eye,
  Info,
  Loader2,
  X,
  RotateCw,
  Check,
  FileCheck,
  RotateCcw as RotateLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  rotatePdf,
  getRotatePdfInfo,
  RotateResult,
} from "@/lib/pdf/rotatePdf";
import { triggerDownload } from "@/lib/pdf/mergePdf";

const PdfPreviewViewer = dynamic(
  () => import("@/components/pdf/PdfPreviewViewer").then((m) => m.PdfPreviewViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px] gap-2 text-black/70">
        <Loader2 size={32} className="animate-spin text-[#051448]" />
        <span className="text-xs font-medium">Loading viewer...</span>
      </div>
    ),
  }
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

interface PageThumbnail {
  pageIndex: number; // 0-based
  dataUrl: string;
}

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  // Per-page rotation angles in degrees (0, 90, 180, 270)
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);

  const [customFileName, setCustomFileName] = useState("");
  const [rotateResult, setRotateResult] = useState<RotateResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (rotateResult?.blobUrl) URL.revokeObjectURL(rotateResult.blobUrl);
    };
  }, [rotateResult]);

  const handleReset = useCallback(() => {
    if (rotateResult?.blobUrl) URL.revokeObjectURL(rotateResult.blobUrl);
    setFile(null);
    setPageCount(0);
    setFileSize(0);
    setRotations({});
    setThumbnails([]);
    setRotateResult(null);
    setCustomFileName("");
    setErrorMsg(null);
    setShowPreviewModal(false);
    setShowMetaModal(false);
    setIsLoadingFile(false);
    setIsGeneratingResult(false);
    setThumbnailsLoading(false);
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [rotateResult]);

  // Generate lightweight thumbnails for real-time live preview
  const generateThumbnails = async (ab: ArrayBuffer, total: number) => {
    setThumbnailsLoading(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const data = new Uint8Array(ab.slice(0));
      const pdfDoc = await pdfjs.getDocument({ data }).promise;
      const thumbs: PageThumbnail[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i);
        // Low resolution thumbnail scale for super fast 60fps rendering
        const viewport = page.getViewport({ scale: 0.4 });
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        thumbs.push({ pageIndex: i - 1, dataUrl });
      }

      setThumbnails(thumbs);
    } catch (err) {
      console.error("Thumbnail generation error:", err);
    } finally {
      setThumbnailsLoading(false);
    }
  };

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setRotateResult(null);
    setRotations({});
    setThumbnails([]);
    setIsLoadingFile(true);

    try {
      const ab = await f.arrayBuffer();
      arrayBufferRef.current = ab;
      const info = await getRotatePdfInfo(f);
      setPageCount(info.pageCount);
      setFileSize(info.fileSize);

      // Initialize all pages at 0 degrees
      const initialRots: Record<number, number> = {};
      for (let i = 0; i < info.pageCount; i++) {
        initialRots[i] = 0;
      }
      setRotations(initialRots);

      // Start rendering real-time thumbnails immediately
      generateThumbnails(ab, info.pageCount);
    } catch (err: unknown) {
      console.error("Error reading PDF:", err);
      setErrorMsg("Failed to read the PDF file.");
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  // Real-time rotation controls
  const rotateSinglePage = (pageIdx: number, deltaDeg: number = 90) => {
    setRotations((prev) => {
      const cur = prev[pageIdx] || 0;
      const next = (cur + deltaDeg + 360) % 360;
      return { ...prev, [pageIdx]: next };
    });
    // Invalidate cached result so next action regenerates fresh
    if (rotateResult?.blobUrl) {
      URL.revokeObjectURL(rotateResult.blobUrl);
      setRotateResult(null);
    }
  };

  const rotateAllPages = (deltaDeg: number) => {
    setRotations((prev) => {
      const next: Record<number, number> = {};
      for (let i = 0; i < pageCount; i++) {
        const cur = prev[i] || 0;
        next[i] = (cur + deltaDeg + 360) % 360;
      }
      return next;
    });
    if (rotateResult?.blobUrl) {
      URL.revokeObjectURL(rotateResult.blobUrl);
      setRotateResult(null);
    }
  };

  const resetAllRotations = () => {
    const resetRots: Record<number, number> = {};
    for (let i = 0; i < pageCount; i++) {
      resetRots[i] = 0;
    }
    setRotations(resetRots);
    if (rotateResult?.blobUrl) {
      URL.revokeObjectURL(rotateResult.blobUrl);
      setRotateResult(null);
    }
  };

  // Compile final rotated PDF using pdf-lib
  const handleGenerateRotatedPdf = async () => {
    if (!arrayBufferRef.current) return null;
    setIsGeneratingResult(true);
    setErrorMsg(null);

    try {
      if (rotateResult?.blobUrl) URL.revokeObjectURL(rotateResult.blobUrl);
      const res = await rotatePdf(
        arrayBufferRef.current,
        { customRotations: rotations },
        customFileName || file?.name
      );
      setRotateResult(res);
      return res;
    } catch (err: unknown) {
      console.error("Error rotating PDF:", err);
      setErrorMsg("Failed to generate rotated PDF.");
      return null;
    } finally {
      setIsGeneratingResult(false);
    }
  };

  const handleDownloadRotatedPdf = async () => {
    let res = rotateResult;
    if (!res) {
      res = await handleGenerateRotatedPdf();
    }
    if (res) {
      triggerDownload(res.blobUrl, res.fileName);
      handleReset();
    }
  };

  const handleOpenPreviewModal = async () => {
    if (!rotateResult) {
      const res = await handleGenerateRotatedPdf();
      if (res) setShowPreviewModal(true);
    } else {
      setShowPreviewModal(true);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Check how many pages have non-zero rotation
  const modifiedCount = Object.values(rotations).filter((deg) => deg % 360 !== 0).length;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="rotate-file-input"
        />

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded border border-red-400 bg-white text-red-700 text-xs sm:text-sm flex items-center justify-between shadow-sm">
            <div>
              <span className="font-bold">Error: </span>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-700 hover:opacity-75 font-bold px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Main Card Form matching standard format ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-start">
            {/* ── Left Column: Tool Info ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-[#051448]/20 flex items-center justify-center text-[#051448] shadow-xs">
                  <RotateCw size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Rotate PDF Pages
                </h1>
              </div>

              <p className="text-black text-sm sm:text-base leading-relaxed mb-4">
                Upload your PDF to see a live real-time interactive preview. Rotate all pages together or click individual page cards to rotate specific pages.
              </p>

              {file && (
                <div className="w-full bg-slate-50 border border-[#051448]/20 rounded-md p-3 mb-3 text-xs text-black/80 space-y-1 hidden sm:block">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <strong className="truncate max-w-[130px]">{file.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <strong>{pageCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotated Pages:</span>
                    <strong className="text-[#051448]">{modifiedCount} of {pageCount}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#051448] border border-[#051448] px-3.5 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <UploadCloud size={14} />
                {file ? "Change PDF" : "Choose PDF"}
              </button>
            </div>

            {/* ── Right Column: Quick Rotation Tools & Dropzone ── */}
            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Quick Rotation Action Tabs */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Quick Rotate Controls:
                  </span>
                  {modifiedCount > 0 && (
                    <span className="text-[11px] font-semibold text-[#051448] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {modifiedCount} Page{modifiedCount > 1 ? "s" : ""} Rotated
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => rotateAllPages(90)}
                    disabled={!file}
                    className="p-2 sm:p-2.5 rounded border border-slate-300 bg-white hover:border-[#051448] hover:bg-blue-50/50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <RotateCw size={14} className="text-[#051448]" />
                      <span className="font-bold text-xs text-black leading-tight">All 90° CW</span>
                    </div>
                    <p className="text-[10px] text-black/60 leading-tight">Rotate right ↻</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateAllPages(-90)}
                    disabled={!file}
                    className="p-2 sm:p-2.5 rounded border border-slate-300 bg-white hover:border-[#051448] hover:bg-blue-50/50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <RotateLeft size={14} className="text-[#051448]" />
                      <span className="font-bold text-xs text-black leading-tight">All 90° CCW</span>
                    </div>
                    <p className="text-[10px] text-black/60 leading-tight">Rotate left ↺</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => rotateAllPages(180)}
                    disabled={!file}
                    className="p-2 sm:p-2.5 rounded border border-slate-300 bg-white hover:border-[#051448] hover:bg-blue-50/50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-mono font-bold text-[#051448]">↕</span>
                      <span className="font-bold text-xs text-black leading-tight">All 180°</span>
                    </div>
                    <p className="text-[10px] text-black/60 leading-tight">Flip upside down</p>
                  </button>

                  <button
                    type="button"
                    onClick={resetAllRotations}
                    disabled={!file || modifiedCount === 0}
                    className="p-2 sm:p-2.5 rounded border border-slate-300 bg-white hover:border-red-400 hover:bg-red-50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <RotateCcw size={14} className="text-red-600" />
                      <span className="font-bold text-xs text-black leading-tight">Reset All</span>
                    </div>
                    <p className="text-[10px] text-black/60 leading-tight">Back to 0°</p>
                  </button>
                </div>
              </div>

              {/* Drop / Select Zone */}
              {!file && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40 ${
                    isDragging ? "bg-blue-50/80 border-dashed" : "border-[#051448]"
                  }`}
                >
                  <div className="w-11 h-11 mx-auto rounded-full border border-[#051448] flex items-center justify-center text-[#051448] mb-2">
                    {isLoadingFile ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <UploadCloud size={20} />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-black mb-0.5">
                    Click to select or drop PDF file
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/60 truncate max-w-full">
                    Instant real-time preview appears as soon as you upload
                  </p>
                </div>
              )}

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="rotate-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="rotate-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={rotateResult ? rotateResult.fileName.replace(/\.pdf$/i, "") : "rotated_document"}
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1.5 pr-10 focus:outline-hidden focus:border-[#051448] text-black font-medium truncate"
                    />
                    <span className="absolute right-2.5 text-[11px] text-black/50 font-mono pointer-events-none select-none">
                      .pdf
                    </span>
                  </div>
                  {customFileName && (
                    <button
                      type="button"
                      onClick={() => setCustomFileName("")}
                      className="text-[11px] text-[#051448] hover:underline cursor-pointer font-semibold shrink-0"
                    >
                      Reset Name
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons & Status Row */}
              {file && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#051448]/15">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadRotatedPdf}
                      disabled={isGeneratingResult}
                      className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isGeneratingResult ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Saving Rotations...
                        </>
                      ) : (
                        <>
                          <Download size={15} />
                          Download Rotated PDF
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenPreviewModal}
                      disabled={isGeneratingResult}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Full Screen Preview"
                    >
                      <Eye size={14} className="text-[#051448]" />
                      <span>Full Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-black border border-[#051448] px-2.5 py-2 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear and reset"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>

                  {rotateResult && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMetaModal(true)}
                        className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Info size={14} className="text-[#051448]" />
                        <span className="hidden sm:inline">Details</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Status Banner */}
              {file && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Sparkles size={14} />
                    Live Real-Time Preview Active
                  </span>
                  <span className="font-semibold text-black">
                    {modifiedCount > 0
                      ? `${modifiedCount} page(s) rotated`
                      : "Click any thumbnail to rotate individually"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Real-Time Interactive Visual Page Thumbnail Grid ── */}
          {file && (
            <div className="mt-6 border-t border-[#051448]/20 pt-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-[#051448]" />
                  <span className="text-xs sm:text-sm font-bold text-black">
                    Real-Time Visual Page Preview ({pageCount} pages):
                  </span>
                </div>
                <span className="text-[11px] text-black/60">
                  Tip: Click <strong>↻ Rotate</strong> on any card to rotate that page directly
                </span>
              </div>

              {thumbnailsLoading && thumbnails.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded gap-2">
                  <Loader2 size={24} className="animate-spin text-[#051448]" />
                  <span className="text-xs text-black/60 font-medium">
                    Rendering live page preview...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-h-[460px] overflow-y-auto pr-1 p-1">
                  {thumbnails.map((t) => {
                    const rot = rotations[t.pageIndex] || 0;
                    const isRotated = rot % 360 !== 0;

                    return (
                      <div
                        key={t.pageIndex}
                        className={`group relative flex flex-col items-center p-2 rounded-lg border-2 transition-all bg-slate-50/50 hover:bg-blue-50/30 ${
                          isRotated
                            ? "border-[#051448] shadow-xs"
                            : "border-slate-200 hover:border-[#051448]/40"
                        }`}
                      >
                        {/* Page & Angle Badges */}
                        <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                          <span className="text-[11px] font-bold text-black">
                            Page {t.pageIndex + 1}
                          </span>
                          {isRotated ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#051448] text-white">
                              {rot}°
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-black/40">0°</span>
                          )}
                        </div>

                        {/* Interactive Thumbnail Canvas Frame with Live CSS Rotation */}
                        <div className="relative w-full aspect-[3/4] flex items-center justify-center bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.dataUrl}
                            alt={`Page ${t.pageIndex + 1}`}
                            style={{
                              transform: `rotate(${rot}deg)`,
                              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            className="max-w-[88%] max-h-[88%] object-contain"
                          />

                          {/* Hover Quick Rotate Overlay Button */}
                          <button
                            type="button"
                            onClick={() => rotateSinglePage(t.pageIndex, 90)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 cursor-pointer"
                            title="Rotate this page 90° Clockwise"
                          >
                            <RotateCw size={22} className="drop-shadow" />
                            <span className="text-[10px] font-bold drop-shadow">Rotate 90°</span>
                          </button>
                        </div>

                        {/* Bottom Individual Rotate Action Button */}
                        <button
                          type="button"
                          onClick={() => rotateSinglePage(t.pageIndex, 90)}
                          className="w-full mt-2 py-1 px-1 rounded text-[11px] font-bold flex items-center justify-center gap-1 bg-white border border-[#051448]/30 text-[#051448] hover:bg-[#051448] hover:text-white transition-colors cursor-pointer"
                        >
                          <RotateCw size={12} />
                          <span>Rotate ↻</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Full Interactive PDF Preview Modal ── */}
      {showPreviewModal && rotateResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-black truncate">
                  Live Rotated Document Preview
                </span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold shrink-0">
                  {rotateResult.pageCount} Pages Total
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadRotatedPdf}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-[#051448] hover:bg-[#071a5e] px-2.5 sm:px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded text-black hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2 min-h-[480px] h-[650px] flex flex-col overflow-hidden">
              <PdfPreviewViewer url={rotateResult.blobUrl} initialScale={1.3} />
            </div>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {showMetaModal && rotateResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Rotation Summary</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaModal(false)}
                className="text-black hover:opacity-75 cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-black">
              <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-100 min-w-0">
                <span className="text-black/60 shrink-0">Output File:</span>
                <span className="font-semibold text-xs break-all text-right max-w-[200px] sm:max-w-[260px]">
                  {rotateResult.fileName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Pages:</span>
                <span className="font-semibold">{rotateResult.pageCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Pages Modified:</span>
                <span className="font-semibold text-[#051448]">
                  {rotateResult.rotatedPages.length}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-[#051448]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMetaModal(false)}
                className="px-4 py-1.5 bg-[#051448] text-white text-xs font-bold rounded hover:bg-[#071a5e] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
