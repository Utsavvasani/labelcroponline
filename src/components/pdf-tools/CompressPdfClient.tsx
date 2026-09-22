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
  Minimize2,
  Check,
  FileCheck,
  Zap,
  Shield,
  Flame,
} from "lucide-react";
import {
  compressPdf,
  getCompressPdfInfo,
  CompressOptions,
  CompressResult,
  CompressionLevel,
} from "@/lib/pdf/compressPdf";
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

const COMPRESS_LEVELS: {
  id: CompressionLevel;
  label: string;
  desc: string;
  badge: string;
  icon: React.ElementType;
}[] = [
  {
    id: "standard",
    label: "Standard (Recommended)",
    desc: "Optimizes metadata, forms & streams",
    badge: "Recommended",
    icon: Shield,
  },
  {
    id: "light",
    label: "Light Compression",
    desc: "Strips document metadata & author tags",
    badge: "Fastest",
    icon: Zap,
  },
  {
    id: "aggressive",
    label: "Aggressive Optimization",
    desc: "Deep restructure & orphaned resource drop",
    badge: "Maximum",
    icon: Flame,
  },
];

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  const [level, setLevel] = useState<CompressionLevel>("standard");
  const [customFileName, setCustomFileName] = useState("");
  const [compressResult, setCompressResult] = useState<CompressResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (compressResult?.blobUrl) URL.revokeObjectURL(compressResult.blobUrl);
    };
  }, [compressResult]);

  const handleReset = useCallback(() => {
    if (compressResult?.blobUrl) URL.revokeObjectURL(compressResult.blobUrl);
    setFile(null);
    setPageCount(0);
    setFileSize(0);
    setCompressResult(null);
    setCustomFileName("");
    setErrorMsg(null);
    setShowPreviewModal(false);
    setShowMetaModal(false);
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [compressResult]);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setCompressResult(null);
    setIsProcessing(true);

    try {
      const ab = await f.arrayBuffer();
      arrayBufferRef.current = ab;
      const info = await getCompressPdfInfo(f);
      setPageCount(info.pageCount);
      setFileSize(info.fileSize);
    } catch (err: unknown) {
      console.error("Error loading PDF:", err);
      setErrorMsg("Failed to read the PDF file.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCompressPdf = async () => {
    if (!arrayBufferRef.current) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (compressResult?.blobUrl) URL.revokeObjectURL(compressResult.blobUrl);
      const res = await compressPdf(
        arrayBufferRef.current,
        { level } as CompressOptions,
        customFileName || file?.name
      );
      setCompressResult(res);
    } catch (err: unknown) {
      console.error("Error compressing PDF:", err);
      setErrorMsg("Failed to compress PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDownloadAndReset = (blobUrl: string, fileName: string) => {
    triggerDownload(blobUrl, fileName);
    handleReset();
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

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="compress-file-input"
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

        {/* ── Main Card Form ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-start">
            {/* ── Left Column: Tool Info ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-[#051448]/20 flex items-center justify-center text-[#051448] shadow-xs">
                  <Minimize2 size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Compress PDF File
                </h1>
              </div>

              <p className="text-black text-sm sm:text-base leading-relaxed mb-4">
                Reduce document file size with lossless structure &amp; metadata cleanup. No image quality loss — runs safely in your browser.
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
                    <span>Original Size:</span>
                    <strong>{formatFileSize(fileSize)}</strong>
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

            {/* ── Right Column: Level Selector & Dropzone ── */}
            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Compression Level Selector Tabs */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Compression Level:
                  </span>
                  {compressResult && (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Saved {compressResult.savedPercent}% ({formatFileSize(compressResult.savedBytes)})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {COMPRESS_LEVELS.map((lvl) => {
                    const isChecked = level === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setLevel(lvl.id)}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-black leading-tight">
                            {lvl.label}
                          </span>
                          {isChecked && <Check size={13} className="text-[#051448] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-black/70 leading-tight">
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drop / Select Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-md p-4 sm:p-6 text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40 ${
                  isDragging ? "bg-blue-50/80 border-dashed" : "border-[#051448]"
                }`}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-full border border-[#051448] flex items-center justify-center text-[#051448] mb-2">
                  {isProcessing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : file ? (
                    <FileCheck size={20} />
                  ) : (
                    <UploadCloud size={20} />
                  )}
                </div>

                <p
                  className="text-xs sm:text-sm font-bold text-black mb-0.5 break-all line-clamp-2 max-w-full px-2 mx-auto"
                  title={file ? file.name : undefined}
                >
                  {file ? file.name : "Click to select or drop PDF file"}
                </p>
                <p className="text-[10px] sm:text-xs text-black/60 truncate max-w-full">
                  {file
                    ? `${pageCount} page(s) • ${formatFileSize(fileSize)} • Ready to compress`
                    : "Upload document to compress and optimize"}
                </p>
              </div>

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="compress-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="compress-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={compressResult ? compressResult.fileName.replace(/\.pdf$/i, "") : "compressed_document"}
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#051448]/15">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      compressResult
                        ? () => executeDownloadAndReset(compressResult.blobUrl, compressResult.fileName)
                        : handleCompressPdf
                    }
                    disabled={!file || isProcessing}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Compressing...
                      </>
                    ) : compressResult ? (
                      <>
                        <Download size={15} />
                        Download Compressed PDF
                      </>
                    ) : (
                      <>
                        <Minimize2 size={15} />
                        Compress PDF
                      </>
                    )}
                  </button>

                  {file && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-black border border-[#051448] px-2.5 py-2 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear and reset"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  )}
                </div>

                {compressResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Preview Compressed PDF"
                    >
                      <Eye size={14} className="text-[#051448]" />
                      <span>Preview</span>
                    </button>

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

              {/* Success Result Status */}
              {compressResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Compressed successfully!
                  </span>
                  <span className="font-semibold text-black">
                    {formatFileSize(compressResult.compressedSize)} (from {formatFileSize(compressResult.originalSize)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreviewModal && compressResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-black truncate">
                  Compressed Document Preview
                </span>
                <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded font-semibold shrink-0">
                  {formatFileSize(compressResult.compressedSize)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => executeDownloadAndReset(compressResult.blobUrl, compressResult.fileName)}
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
              <PdfPreviewViewer url={compressResult.blobUrl} initialScale={1.3} />
            </div>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {showMetaModal && compressResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Compression Details</h3>
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
                  {compressResult.fileName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Original Size:</span>
                <span className="font-semibold">{formatFileSize(compressResult.originalSize)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Compressed Size:</span>
                <span className="font-semibold text-green-700">{formatFileSize(compressResult.compressedSize)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Space Saved:</span>
                <span className="font-semibold text-green-700">{compressResult.savedPercent}% ({formatFileSize(compressResult.savedBytes)})</span>
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
