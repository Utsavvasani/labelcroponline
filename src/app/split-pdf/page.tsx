"use client";

import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  Info,
  Loader2,
  X,
  Scissors,
  Check,
  FileCheck,
  List,
  AlignJustify,
  Rows3,
  Hash,
} from "lucide-react";
import {
  getPdfInfo,
  planSplit,
  buildSplitZip,
  buildChunkPdf,
  SplitMode,
  SplitOptions,
  SplitChunk,
} from "@/lib/pdf/splitPdf";
import { triggerDownload } from "@/lib/pdf/mergePdf";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const SPLIT_MODES: { id: SplitMode; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: "all_pages",
    label: "All Pages (ZIP)",
    desc: "Every page becomes its own separate PDF",
    icon: List,
  },
  {
    id: "by_range",
    label: "Custom Range",
    desc: "e.g. 1-3, 4-6, 7 — custom chunks",
    icon: AlignJustify,
  },
  {
    id: "every_n",
    label: "Every N Pages",
    desc: "Split into groups of N pages",
    icon: Rows3,
  },
  {
    id: "fixed_pages",
    label: "Extract Pages",
    desc: "Extract chosen pages e.g. 1, 3, 5",
    icon: Hash,
  },
];

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  const [mode, setMode] = useState<SplitMode>("all_pages");
  const [rangeStr, setRangeStr] = useState("");
  const [everyN, setEveryN] = useState(2);
  const [pagesStr, setPagesStr] = useState("");
  const [chunks, setChunks] = useState<SplitChunk[]>([]);

  const [customFileName, setCustomFileName] = useState("");
  const [resultZip, setResultZip] = useState<{ blobUrl: string; fileName: string; count: number } | null>(null);
  const [singleResult, setSingleResult] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (resultZip?.blobUrl) URL.revokeObjectURL(resultZip.blobUrl);
      if (singleResult?.blobUrl) URL.revokeObjectURL(singleResult.blobUrl);
    };
  }, [resultZip, singleResult]);

  const replan = useCallback((m: SplitMode, r: string, n: number, p: string, total: number) => {
    if (!total) return;
    const opts: SplitOptions = { mode: m, rangeStr: r, everyN: n, pagesStr: p };
    setChunks(planSplit(opts, total));
    if (resultZip?.blobUrl) URL.revokeObjectURL(resultZip.blobUrl);
    if (singleResult?.blobUrl) URL.revokeObjectURL(singleResult.blobUrl);
    setResultZip(null);
    setSingleResult(null);
  }, [resultZip, singleResult]);

  const handleReset = useCallback(() => {
    if (resultZip?.blobUrl) URL.revokeObjectURL(resultZip.blobUrl);
    if (singleResult?.blobUrl) URL.revokeObjectURL(singleResult.blobUrl);
    setFile(null);
    setPageCount(0);
    setFileSize(0);
    setChunks([]);
    setResultZip(null);
    setSingleResult(null);
    setCustomFileName("");
    setErrorMsg(null);
    setShowMetaModal(false);
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resultZip, singleResult]);

  const processFile = useCallback(
    async (f: File) => {
      setFile(f);
      setErrorMsg(null);
      setResultZip(null);
      setSingleResult(null);
      setIsProcessing(true);

      try {
        const ab = await f.arrayBuffer();
        arrayBufferRef.current = ab;
        const info = await getPdfInfo(f);
        setPageCount(info.pageCount);
        setFileSize(info.fileSize);
        replan(mode, rangeStr, everyN, pagesStr, info.pageCount);
      } catch (err: unknown) {
        console.error("Error loading PDF:", err);
        setErrorMsg("Failed to read the PDF file.");
      } finally {
        setIsProcessing(false);
      }
    },
    [mode, rangeStr, everyN, pagesStr, replan]
  );

  const handleModeChange = (m: SplitMode) => {
    setMode(m);
    replan(m, rangeStr, everyN, pagesStr, pageCount);
  };

  const handleSplitPdf = async () => {
    if (!arrayBufferRef.current || chunks.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (chunks.length === 1) {
        const built = await buildChunkPdf(
          arrayBufferRef.current,
          chunks[0],
          customFileName || file?.name || "split_document",
          0
        );
        setSingleResult({ blobUrl: built.blobUrl, fileName: built.fileName });
      } else {
        const res = await buildSplitZip(
          arrayBufferRef.current,
          chunks,
          customFileName || file?.name || "split_document"
        );
        setResultZip({ blobUrl: res.blobUrl, fileName: res.fileName, count: res.chunkCount });
      }
    } catch (err: unknown) {
      console.error("Error splitting PDF:", err);
      setErrorMsg("Failed to split PDF file.");
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

  const hasResult = !!(resultZip || singleResult);

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="split-file-input"
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
                  <Scissors size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Split PDF Pages
                </h1>
              </div>

              <p className="text-black text-sm sm:text-base leading-relaxed mb-4">
                Extract single pages, custom ranges, or divide multi-page documents into equal parts. Download all resulting files cleanly as a ZIP package.
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
                    <span>Output Chunks:</span>
                    <strong>{chunks.length}</strong>
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

            {/* ── Right Column: Mode Selector & Dropzone ── */}
            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Split Mode Selection Tabs */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Split Option:
                  </span>
                  {chunks.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#051448] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {chunks.length} Part{chunks.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SPLIT_MODES.map((opt) => {
                    const isChecked = mode === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleModeChange(opt.id)}
                        className={`p-2 rounded border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-black leading-tight truncate">
                            {opt.label}
                          </span>
                          {isChecked && <Check size={13} className="text-[#051448] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-black/70 leading-tight truncate">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Inputs for Custom Modes */}
                {mode === "by_range" && (
                  <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded border border-[#051448]/20">
                    <span className="text-xs font-bold text-black shrink-0">Ranges:</span>
                    <input
                      type="text"
                      value={rangeStr}
                      onChange={(e) => {
                        setRangeStr(e.target.value);
                        replan("by_range", e.target.value, everyN, pagesStr, pageCount);
                      }}
                      placeholder="e.g. 1-3, 4-6, 7"
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1 text-black font-medium focus:outline-none"
                    />
                  </div>
                )}

                {mode === "every_n" && (
                  <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded border border-[#051448]/20">
                    <span className="text-xs font-bold text-black shrink-0">Split every:</span>
                    <input
                      type="number"
                      min={1}
                      max={pageCount || 100}
                      value={everyN}
                      onChange={(e) => {
                        const n = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setEveryN(n);
                        replan("every_n", rangeStr, n, pagesStr, pageCount);
                      }}
                      className="w-16 text-xs bg-white border border-[#051448]/30 rounded px-2 py-1 text-center font-bold text-[#051448] focus:outline-none"
                    />
                    <span className="text-xs text-black/70 font-medium">pages per file</span>
                  </div>
                )}

                {mode === "fixed_pages" && (
                  <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2 rounded border border-[#051448]/20">
                    <span className="text-xs font-bold text-black shrink-0">Pages:</span>
                    <input
                      type="text"
                      value={pagesStr}
                      onChange={(e) => {
                        setPagesStr(e.target.value);
                        replan("fixed_pages", rangeStr, everyN, e.target.value, pageCount);
                      }}
                      placeholder="e.g. 1, 3, 5, 8"
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1 text-black font-medium focus:outline-none"
                    />
                  </div>
                )}
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
                    ? `${pageCount} page(s) loaded • Split into ${chunks.length} part(s)`
                    : "Upload multi-page document to extract or separate pages"}
                </p>
              </div>

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="split-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="split-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={resultZip ? resultZip.fileName.replace(/\.zip$/i, "") : "split_document"}
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1.5 pr-10 focus:outline-hidden focus:border-[#051448] text-black font-medium truncate"
                    />
                    <span className="absolute right-2.5 text-[11px] text-black/50 font-mono pointer-events-none select-none">
                      {chunks.length > 1 ? ".zip" : ".pdf"}
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
                      resultZip
                        ? () => executeDownloadAndReset(resultZip.blobUrl, resultZip.fileName)
                        : singleResult
                        ? () => executeDownloadAndReset(singleResult.blobUrl, singleResult.fileName)
                        : handleSplitPdf
                    }
                    disabled={!file || isProcessing || chunks.length === 0}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Splitting PDF...
                      </>
                    ) : hasResult ? (
                      <>
                        <Download size={15} />
                        {resultZip ? "Download Split ZIP" : "Download PDF"}
                      </>
                    ) : (
                      <>
                        <Scissors size={15} />
                        Split PDF ({chunks.length} Part{chunks.length !== 1 ? "s" : ""})
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

                {hasResult && (
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

              {/* Success Result Status */}
              {hasResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Split completed successfully!
                  </span>
                  <span className="font-semibold text-black">
                    {chunks.length} Output File{chunks.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Chunk Preview Pills ── */}
          {chunks.length > 0 && (
            <div className="mt-6 border-t border-[#051448]/20 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-black">
                  Output Parts Preview ({chunks.length} files to generate):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                {chunks.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#051448] border border-[#051448]/20"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Details Modal ── */}
      {showMetaModal && (resultZip || singleResult) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Split File Details</h3>
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
                  {resultZip?.fileName || singleResult?.fileName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Chunks:</span>
                <span className="font-semibold">{chunks.length} files</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Source Document:</span>
                <span className="font-semibold text-xs truncate max-w-[180px]">{file?.name}</span>
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
