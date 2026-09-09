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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  FileCheck,
  ListOrdered,
  Truck,
  Package,
  Hash,
  MapPin,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  extractLabelMetadata,
  sortLabelPages,
  buildSortedPdf,
  LabelPageMeta,
  SortCriterion,
  SortDirection,
  SortLevel,
  SortResult,
} from "@/lib/pdf/labelSorter";
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

interface CriterionConfig {
  id: SortCriterion;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const SORT_CRITERIA: CriterionConfig[] = [
  { id: "courier", label: "Courier Partner", shortLabel: "Courier", icon: Truck },
  { id: "sku", label: "SKU / Product Code", shortLabel: "SKU", icon: Package },
  { id: "order_number", label: "Order Number / ID", shortLabel: "Order ID", icon: Hash },
  { id: "pincode", label: "Destination Pincode", shortLabel: "Pincode", icon: MapPin },
  { id: "quantity", label: "Quantity (Multi-qty)", shortLabel: "Quantity", icon: Layers },
];

export default function SortLabelsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractTotal, setExtractTotal] = useState(0);

  const [pageMetas, setPageMetas] = useState<LabelPageMeta[]>([]);
  const [sortedMetas, setSortedMetas] = useState<LabelPageMeta[]>([]);
  const [activeLevels, setActiveLevels] = useState<SortLevel[]>([
    { criterion: "courier", direction: "asc" },
    { criterion: "sku", direction: "asc" },
  ]);
  const [checkedCriteria, setCheckedCriteria] = useState<Set<SortCriterion>>(
    new Set(["courier", "sku"])
  );
  const [directions, setDirections] = useState<Record<SortCriterion, SortDirection>>({
    original: "asc",
    courier: "asc",
    sku: "asc",
    order_number: "asc",
    awb: "asc",
    pincode: "asc",
    quantity: "desc",
    seller: "asc",
  });

  const [customFileName, setCustomFileName] = useState("");
  const [sortResult, setSortResult] = useState<SortResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [expandedRawRow, setExpandedRawRow] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (sortResult?.blobUrl) URL.revokeObjectURL(sortResult.blobUrl);
    };
  }, [sortResult]);

  const updateSort = useCallback(
    (levels: SortLevel[], metas: LabelPageMeta[]) => {
      if (metas.length === 0) return;
      const sorted = sortLabelPages(metas, levels);
      setSortedMetas(sorted);
      if (sortResult?.blobUrl) {
        URL.revokeObjectURL(sortResult.blobUrl);
        setSortResult(null);
      }
    },
    [sortResult]
  );

  const handleReset = useCallback(() => {
    if (sortResult?.blobUrl) URL.revokeObjectURL(sortResult.blobUrl);
    setFile(null);
    setPageMetas([]);
    setSortedMetas([]);
    setSortResult(null);
    setIsProcessing(false);
    setExtractProgress(0);
    setExtractTotal(0);
    setErrorMsg(null);
    setCustomFileName("");
    setShowPreviewModal(false);
    setShowMetaModal(false);
    setShowRawText(false);
    setExpandedRawRow(null);
    setActiveLevels([
      { criterion: "courier", direction: "asc" },
      { criterion: "sku", direction: "asc" },
    ]);
    setCheckedCriteria(new Set(["courier", "sku"]));
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [sortResult]);

  const processFile = useCallback(
    async (f: File) => {
      setFile(f);
      setErrorMsg(null);
      setSortResult(null);
      setPageMetas([]);
      setSortedMetas([]);
      setIsProcessing(true);
      setExtractProgress(0);

      try {
        const ab = await f.arrayBuffer();
        arrayBufferRef.current = ab;

        const metas = await extractLabelMetadata(ab, (curr, tot) => {
          setExtractProgress(curr);
          setExtractTotal(tot);
        });

        setPageMetas(metas);
        const sorted = sortLabelPages(metas, activeLevels);
        setSortedMetas(sorted);
      } catch (err: unknown) {
        console.error("Error reading label PDF:", err);
        setErrorMsg("Failed to extract label metadata from this PDF.");
      } finally {
        setIsProcessing(false);
      }
    },
    [activeLevels]
  );

  const handleToggleCriterion = (criterion: SortCriterion) => {
    const nextChecked = new Set(checkedCriteria);
    let nextLevels = [...activeLevels];

    if (nextChecked.has(criterion)) {
      nextChecked.delete(criterion);
      nextLevels = nextLevels.filter((l) => l.criterion !== criterion);
    } else {
      nextChecked.add(criterion);
      nextLevels.push({ criterion, direction: directions[criterion] || "asc" });
    }

    setCheckedCriteria(nextChecked);
    setActiveLevels(nextLevels);
    updateSort(nextLevels, pageMetas);
  };

  const handleToggleDirection = (criterion: SortCriterion, e: React.MouseEvent) => {
    e.stopPropagation();
    const curDir = directions[criterion] || "asc";
    const nextDir: SortDirection = curDir === "asc" ? "desc" : "asc";

    const nextDirections = { ...directions, [criterion]: nextDir };
    setDirections(nextDirections);

    const nextLevels = activeLevels.map((l) =>
      l.criterion === criterion ? { ...l, direction: nextDir } : l
    );
    setActiveLevels(nextLevels);
    updateSort(nextLevels, pageMetas);
  };

  const handleBuildSortedPdf = async () => {
    if (!arrayBufferRef.current || sortedMetas.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (sortResult?.blobUrl) URL.revokeObjectURL(sortResult.blobUrl);
      const res = await buildSortedPdf(
        arrayBufferRef.current,
        sortedMetas,
        customFileName || file?.name
      );
      setSortResult(res);
    } catch (err: unknown) {
      console.error("Error building sorted PDF:", err);
      setErrorMsg("Failed to generate sorted PDF.");
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
          id="sort-file-input"
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
            {/* ── Left Column: Tool Info & File Details ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-[#051448]/20 flex items-center justify-center text-[#051448] shadow-xs">
                  <ArrowUpDown size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Sort Shipping Labels
                </h1>
              </div>

              <p className="text-black/75 text-xs leading-relaxed mb-4 hidden sm:block">
                Organize multi-page shipping labels by courier partner, SKU product code, order ID, or destination pincode. Check multiple criteria for multi-level priority sorting.
              </p>

              {file && (
                <div className="w-full bg-slate-50 border border-[#051448]/20 rounded-md p-3 mb-3 text-xs text-black/80 space-y-1 hidden sm:block">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <strong className="truncate max-w-[130px]">{file.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Labels:</span>
                    <strong>{pageMetas.length || "..."}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <strong>{formatFileSize(file.size)}</strong>
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

            {/* ── Right Column: Sort Criteria Selector & Dropzone ── */}
            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Sort Criteria Selection Cards */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Sort Criteria &amp; Priority:
                  </span>
                  {activeLevels.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#051448] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {activeLevels.length} Level{activeLevels.length > 1 ? "s" : ""} Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SORT_CRITERIA.map((c) => {
                    const isChecked = checkedCriteria.has(c.id);
                    const priorityIdx = activeLevels.findIndex((l) => l.criterion === c.id);
                    const dir = directions[c.id] || "asc";
                    const Icon = c.icon;

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleCriterion(c.id)}
                        className={`p-2 sm:p-2.5 rounded border text-left transition-all cursor-pointer select-none ${
                          isChecked
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon size={14} className={isChecked ? "text-[#051448]" : "text-black/50"} />
                            <span className="font-bold text-xs text-black truncate">
                              {c.shortLabel}
                            </span>
                          </div>
                          {isChecked ? (
                            <span className="w-4 h-4 rounded-full bg-[#051448] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {priorityIdx + 1}
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5">
                          <span className="text-[10px] text-black/60 truncate">{c.label}</span>
                          {isChecked && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleDirection(c.id, e)}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#051448]/30 text-[#051448] hover:bg-[#051448] hover:text-white transition-colors cursor-pointer"
                              title="Toggle sort direction"
                            >
                              {dir === "asc" ? "A→Z" : "Z→A"}
                            </button>
                          )}
                        </div>
                      </div>
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
                  {file ? file.name : "Click to select or drop shipping label PDF"}
                </p>
                <p className="text-[10px] sm:text-xs text-black/60 truncate max-w-full">
                  {file
                    ? `${pageMetas.length} label(s) parsed • Ready to sort & download`
                    : "Supports Meesho, Flipkart, and courier batch PDFs"}
                </p>
              </div>

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="sort-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="sort-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={sortResult ? sortResult.fileName.replace(/\.pdf$/i, "") : "sorted_labels"}
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
                      sortResult
                        ? () => executeDownloadAndReset(sortResult.blobUrl, sortResult.fileName)
                        : handleBuildSortedPdf
                    }
                    disabled={!file || isProcessing || sortedMetas.length === 0}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        {extractTotal > 0
                          ? `Parsing (${extractProgress}/${extractTotal})...`
                          : "Sorting PDF..."}
                      </>
                    ) : sortResult ? (
                      <>
                        <Download size={15} />
                        Download Sorted PDF
                      </>
                    ) : (
                      <>
                        <ArrowUpDown size={15} />
                        Sort PDF Labels
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

                {/* Right: Preview & Details */}
                {sortResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Preview Sorted PDF"
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
              {sortResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Sorted {sortResult.pageCount} labels successfully!
                  </span>
                  <span className="font-semibold text-black">
                    {activeLevels.map((l) => l.criterion).join(" → ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Table: Live Label Order Preview ── */}
          {sortedMetas.length > 0 && !isProcessing && (
            <div className="mt-6 border-t border-[#051448]/20 pt-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ListOrdered size={15} className="text-[#051448]" />
                  <span className="text-xs font-bold text-black">
                    Live Label Order Preview ({sortedMetas.length} labels)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawText((v) => !v)}
                  className="text-[11px] font-semibold text-[#051448] hover:underline cursor-pointer"
                >
                  {showRawText ? "Hide Raw Text" : "Show Raw Extracted Text"}
                </button>
              </div>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="p-2 font-semibold text-black/70 w-10">#</th>
                      <th className="p-2 font-semibold text-black/70 w-12">Orig.</th>
                      <th className="p-2 font-semibold text-black/70">Courier</th>
                      <th className="p-2 font-semibold text-black/70">Order ID</th>
                      <th className="p-2 font-semibold text-black/70">SKU</th>
                      <th className="p-2 font-semibold text-black/70">AWB</th>
                      <th className="p-2 font-semibold text-black/70">Pincode</th>
                      <th className="p-2 font-semibold text-black/70 w-12">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMetas.map((meta, idx) => (
                      <React.Fragment key={`meta-${meta.pageIndex}-${idx}`}>
                        <tr
                          onClick={() =>
                            setExpandedRawRow((prev) =>
                              prev === meta.pageIndex ? null : meta.pageIndex
                            )
                          }
                          className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors cursor-pointer"
                        >
                          <td className="p-2 font-bold text-[#051448]">{idx + 1}</td>
                          <td className="p-2 text-black/40">#{meta.pageIndex + 1}</td>
                          <td className="p-2 font-medium text-black">{meta.courier || "—"}</td>
                          <td className="p-2 font-mono text-black/80">{meta.orderNumber || "—"}</td>
                          <td className="p-2 font-mono font-semibold text-[#051448]">
                            {meta.sku || "—"}
                          </td>
                          <td className="p-2 font-mono text-black/70">{meta.awb || "—"}</td>
                          <td className="p-2 text-black/80">{meta.pincode || "—"}</td>
                          <td className="p-2 text-center font-bold">
                            {meta.quantity > 1 ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                                {meta.quantity}
                              </span>
                            ) : (
                              <span className="text-black/40">1</span>
                            )}
                          </td>
                        </tr>
                        {(showRawText || expandedRawRow === meta.pageIndex) && (
                          <tr className="bg-amber-50/50 border-b border-amber-100 text-[11px]">
                            <td colSpan={8} className="p-2 text-amber-900 font-mono break-all">
                              <strong className="text-amber-800">Page {meta.pageIndex + 1} Raw Text:</strong>{" "}
                              {meta.rawText || "(No text extracted)"}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreviewModal && sortResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-black truncate">
                  Sorted PDF Preview
                </span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold shrink-0">
                  {sortResult.pageCount} Pages
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => executeDownloadAndReset(sortResult.blobUrl, sortResult.fileName)}
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
              <PdfPreviewViewer url={sortResult.blobUrl} initialScale={1.3} />
            </div>
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {showMetaModal && sortResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Sorted File Details</h3>
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
                  {sortResult.fileName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Labels:</span>
                <span className="font-semibold">{sortResult.pageCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Active Sort:</span>
                <span className="font-semibold text-xs">
                  {activeLevels.map((l) => l.criterion).join(" → ")}
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
