"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Download,
  Loader2,
  Package,
  RotateCcw,
  GripVertical,
  CheckCircle,
  Trash2,
  Search,
  X,
  ClipboardPaste,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PageSkuMap } from "@/lib/pdf/flipkartSkuExtractor";
import {
  buildSkuGroupedPdf,
  countPagesPerSku,
  UNKNOWN_SKU,
} from "@/lib/pdf/flipkartSkuExtractor";
import {
  saveSkuOrder,
  clearSkuOrder,
  hasStoredSkuOrder,
} from "@/lib/flipkartSkuStorage";
import { triggerDownload } from "@/lib/pdf/flipkartCropper";

interface FlipkartSkuSorterPanelProps {
  file: File;
  pageSkuMap: PageSkuMap;
  skuOrder: string[];
  onSkuOrderChange: (newOrder: string[]) => void;
  soldByName?: string;
  onDownloadComplete?: () => void;
}

export function FlipkartSkuSorterPanel({
  file,
  pageSkuMap,
  skuOrder,
  onSkuOrderChange,
  soldByName,
  onDownloadComplete,
}: FlipkartSkuSorterPanelProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hasSavedBefore, setHasSavedBefore] = useState(hasStoredSkuOrder);

  // Remember initial extraction order for "Reset to PDF Order"
  const originalPdfOrderRef = useRef<string[]>(skuOrder);
  useEffect(() => {
    if (originalPdfOrderRef.current.length === 0 && skuOrder.length > 0) {
      originalPdfOrderRef.current = skuOrder;
    }
  }, [skuOrder]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State for high-volume batches (e.g. 500-2000 SKUs)
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Direct Jump Editing State
  const [jumpSku, setJumpSku] = useState<string | null>(null);
  const [jumpRankInput, setJumpRankInput] = useState<string>("");

  // Bulk Paste / Excel Order Modal State
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [bulkPasteFeedback, setBulkPasteFeedback] = useState<string | null>(null);

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pageCounts = useMemo(() => countPagesPerSku(pageSkuMap), [pageSkuMap]);

  /* ── Filtered SKUs based on search query ── */
  const filteredSkus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return skuOrder;
    return skuOrder.filter((sku, i) => {
      const rank = (i + 1).toString();
      return sku.toLowerCase().includes(q) || rank === q;
    });
  }, [skuOrder, searchQuery]);

  // Adjust current page if search reduces total pages
  const effectivePageSize = pageSize === 0 ? Math.max(1, filteredSkus.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredSkus.length / effectivePageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Current page slice
  const paginatedSkus = useMemo(() => {
    if (pageSize === 0) return filteredSkus; // 0 means "All"
    const start = (currentPage - 1) * pageSize;
    return filteredSkus.slice(start, start + pageSize);
  }, [filteredSkus, currentPage, pageSize]);

  /* ── Move single step up/down ── */
  const moveUp = (globalIndex: number) => {
    if (globalIndex <= 0) return;
    const next = [...skuOrder];
    [next[globalIndex - 1], next[globalIndex]] = [next[globalIndex], next[globalIndex - 1]];
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  const moveDown = (globalIndex: number) => {
    if (globalIndex >= skuOrder.length - 1) return;
    const next = [...skuOrder];
    [next[globalIndex], next[globalIndex + 1]] = [next[globalIndex + 1], next[globalIndex]];
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  /* ── Instant Relocate: Move directly to Top (#1) ── */
  const moveToTop = (sku: string) => {
    const currentIndex = skuOrder.indexOf(sku);
    if (currentIndex <= 0) return;
    const next = [...skuOrder];
    const [item] = next.splice(currentIndex, 1);
    next.unshift(item);
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  /* ── Instant Relocate: Move directly to Bottom ── */
  const moveToBottom = (sku: string) => {
    const currentIndex = skuOrder.indexOf(sku);
    if (currentIndex === -1 || currentIndex === skuOrder.length - 1) return;
    const next = [...skuOrder];
    const [item] = next.splice(currentIndex, 1);
    next.push(item);
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  /* ── Direct Rank Jump (e.g. Type #1 or #5) ── */
  const applyJumpToRank = (sku: string) => {
    const parsed = parseInt(jumpRankInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > skuOrder.length) {
      setJumpSku(null);
      return;
    }
    const targetIndex = parsed - 1;
    const currentIndex = skuOrder.indexOf(sku);
    if (currentIndex === -1 || currentIndex === targetIndex) {
      setJumpSku(null);
      return;
    }
    const next = [...skuOrder];
    const [item] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, item);
    onSkuOrderChange(next);
    setConfirmed(false);
    setJumpSku(null);
    setJumpRankInput("");
  };

  /* ── Bulk Sorting Actions ── */
  const handleSortAlphabetical = (ascending = true) => {
    const sorted = [...skuOrder].sort((a, b) => {
      if (a === UNKNOWN_SKU) return 1;
      if (b === UNKNOWN_SKU) return -1;
      return ascending ? a.localeCompare(b) : b.localeCompare(a);
    });
    onSkuOrderChange(sorted);
    setConfirmed(false);
  };

  const handleSortByQuantity = (descending = true) => {
    const sorted = [...skuOrder].sort((a, b) => {
      if (a === UNKNOWN_SKU) return 1;
      if (b === UNKNOWN_SKU) return -1;
      const countA = pageCounts[a] || 0;
      const countB = pageCounts[b] || 0;
      return descending ? countB - countA : countA - countB;
    });
    onSkuOrderChange(sorted);
    setConfirmed(false);
  };

  const handleResetToPdfOrder = () => {
    if (originalPdfOrderRef.current.length > 0) {
      onSkuOrderChange([...originalPdfOrderRef.current]);
      setConfirmed(false);
    }
  };

  /* ── Bulk Paste Order from Excel / Text ── */
  const handleOpenBulkPaste = () => {
    setBulkPasteText(skuOrder.join("\n"));
    setBulkPasteFeedback(null);
    setShowBulkPasteModal(true);
  };

  const handleApplyBulkPaste = () => {
    const lines = bulkPasteText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setBulkPasteFeedback("Please paste at least one SKU name.");
      return;
    }

    const uniquePasted: string[] = [];
    for (const line of lines) {
      if (!uniquePasted.includes(line)) {
        uniquePasted.push(line);
      }
    }

    // Match pasted SKUs that exist in current uploaded list
    const matched = uniquePasted.filter((s) => skuOrder.includes(s));
    const unmatched = skuOrder.filter((s) => !matched.includes(s));
    const newOrder = [...matched, ...unmatched];

    onSkuOrderChange(newOrder);
    setConfirmed(false);
    setShowBulkPasteModal(false);
  };

  /* ── Drag and drop handlers ── */
  const handleDragStart = (globalIndex: number) => {
    dragIndexRef.current = globalIndex;
  };

  const handleDragEnter = (globalIndex: number) => {
    setDragOverIndex(globalIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropGlobalIndex: number) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropGlobalIndex) {
      dragIndexRef.current = null;
      setDragOverIndex(null);
      return;
    }
    const next = [...skuOrder];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(dropGlobalIndex, 0, dragged);
    onSkuOrderChange(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
    setConfirmed(false);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  /* ── Clear Saved Order from LocalStorage ── */
  const handleClearSaved = () => {
    clearSkuOrder();
    setHasSavedBefore(false);
  };

  /* ── Confirm & Download ── */
  const handleConfirmAndDownload = async () => {
    setIsBuilding(true);
    setErrorMsg(null);
    try {
      saveSkuOrder(skuOrder);
      setHasSavedBefore(true);
      setConfirmed(true);

      const result = await buildSkuGroupedPdf(file, pageSkuMap, skuOrder, soldByName);
      triggerDownload(result.blobUrl, result.fileName);
      setTimeout(() => URL.revokeObjectURL(result.blobUrl), 5000);
      onDownloadComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to build grouped PDF.";
      setErrorMsg(msg);
      setConfirmed(false);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* ── Header: Title + Batch Count + Advanced Bulk Tools ── */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-[#051448]/15 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Title & Count Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm text-black truncate">
            Arrange SKU Order
          </span>
          <span className="text-xs font-bold text-[#051448] bg-[#051448]/10 border border-[#051448]/20 px-2 py-0.5 rounded-full shrink-0">
            {skuOrder.length} Unique SKUs
          </span>
        </div>

        {/* Right: Smart Bulk Actions (A-Z, Qty, Bulk Paste, Reset) */}
        <div className="flex items-center flex-wrap gap-1.5 shrink-0 text-xs">
          {/* A-Z Sort */}
          <button
            type="button"
            onClick={() => handleSortAlphabetical(true)}
            className="font-semibold text-black/75 hover:text-[#051448] border border-slate-300 hover:border-[#051448]/50 px-2 py-1 rounded bg-white transition-colors cursor-pointer shadow-2xs"
            title="Sort A to Z"
          >
            A→Z
          </button>

          {/* Qty High-to-Low Sort */}
          <button
            type="button"
            onClick={() => handleSortByQuantity(true)}
            className="font-semibold text-black/75 hover:text-[#051448] border border-slate-300 hover:border-[#051448]/50 px-2 py-1 rounded bg-white transition-colors cursor-pointer shadow-2xs"
            title="Sort by highest label quantity first"
          >
            Qty ↓
          </button>

          {/* Bulk Paste / Excel Mode */}
          <button
            type="button"
            onClick={handleOpenBulkPaste}
            className="font-semibold text-[#051448] hover:bg-blue-50 border border-[#051448]/30 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Paste customized SKU order from Excel or Notepad"
          >
            <ClipboardPaste size={12} />
            <span className="hidden sm:inline">Paste Order</span>
          </button>

          {/* Reset to Original PDF Order */}
          <button
            type="button"
            onClick={handleResetToPdfOrder}
            className="font-semibold text-black/60 hover:text-black border border-slate-300 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Reset to the original order from the uploaded PDF"
          >
            <RotateCcw size={11} />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Clear Saved arrangement */}
          {hasSavedBefore && (
            <button
              type="button"
              onClick={handleClearSaved}
              className="font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Clear saved arrangement from local storage"
            >
              <Trash2 size={11} />
              <span className="hidden md:inline">Clear Saved</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Controls Strip: Instant Search Bar + Quick Pagination (Crucial for 1000+ SKUs) ── */}
      <div className="px-3.5 py-1.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-sm flex items-center">
          <Search size={13} className="absolute left-2.5 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Search ${skuOrder.length} SKUs by name or position...`}
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-[#051448] text-black font-medium transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2 text-black/40 hover:text-black cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Pagination & Match Count */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-black/60">
            {searchQuery ? (
              <>
                <strong className="text-[#051448]">{filteredSkus.length}</strong> of {skuOrder.length}
              </>
            ) : (
              <>
                Showing <strong>{paginatedSkus.length}</strong> of <strong>{skuOrder.length}</strong>
              </>
            )}
          </span>

          {/* Page Selector when items exceed page size */}
          {filteredSkus.length > 25 && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-bold text-[#051448] px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={13} />
              </button>

              {/* Page size dropdown */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-[11px] bg-slate-50 border border-slate-300 rounded px-1 py-0.5 ml-1 text-black font-medium cursor-pointer"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={0}>All ({filteredSkus.length})</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Error message if any ── */}
      {errorMsg && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── High-Performance Scrollable SKU List (Supports 2,000+ smoothly) ── */}
      <div className="px-3.5 sm:px-4 py-2 space-y-1.5 max-h-[290px] overflow-y-auto">
        {paginatedSkus.length === 0 ? (
          <div className="py-8 text-center text-black/50 text-xs">
            No SKUs match &ldquo;{searchQuery}&rdquo;. Clear the search to view all {skuOrder.length} labels.
          </div>
        ) : (
          paginatedSkus.map((sku) => {
            const globalIndex = skuOrder.indexOf(sku);
            const count = pageCounts[sku] || 0;
            const isUnknown = sku === UNKNOWN_SKU;
            const isDragTarget = dragOverIndex === globalIndex;
            const isEditingJump = jumpSku === sku;

            return (
              <div
                key={sku}
                draggable={!isEditingJump}
                onDragStart={() => handleDragStart(globalIndex)}
                onDragEnter={() => handleDragEnter(globalIndex)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(globalIndex)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-grab active:cursor-grabbing transition-all select-none ${isDragTarget
                    ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                    : isUnknown
                      ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                      : "border-slate-200 bg-slate-50/70 hover:border-[#051448]/40 hover:bg-blue-50/30 shadow-2xs"
                  }`}
              >
                {/* Drag Handle */}
                <GripVertical
                  size={14}
                  className={`shrink-0 ${isDragTarget ? "text-[#051448]" : "text-black/30"}`}
                />

                {/* Position Number / Clickable Rank Jump */}
                {isEditingJump ? (
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min={1}
                      max={skuOrder.length}
                      value={jumpRankInput}
                      onChange={(e) => setJumpRankInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyJumpToRank(sku);
                        if (e.key === "Escape") setJumpSku(null);
                      }}
                      autoFocus
                      placeholder={`${globalIndex + 1}`}
                      className="w-12 px-1 py-0.5 text-xs text-center border border-[#051448] bg-white rounded font-bold text-[#051448]"
                    />
                    <button
                      type="button"
                      onClick={() => applyJumpToRank(sku)}
                      className="text-[10px] bg-[#051448] text-white px-1.5 py-0.5 rounded font-bold hover:bg-[#071a5e] cursor-pointer"
                    >
                      Go
                    </button>
                    <button
                      type="button"
                      onClick={() => setJumpSku(null)}
                      className="text-black/50 hover:text-black text-xs px-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setJumpSku(sku);
                      setJumpRankInput((globalIndex + 1).toString());
                    }}
                    className="text-xs font-bold text-[#051448] min-w-[28px] px-1 py-0.5 rounded hover:bg-blue-100/70 border border-transparent hover:border-blue-300 text-center shrink-0 cursor-pointer transition-colors"
                    title={`Current rank: #${globalIndex + 1}. Click to jump to a specific position`}
                  >
                    #{globalIndex + 1}
                  </button>
                )}

                {/* SKU Name */}
                <span
                  className="flex-1 font-semibold text-black text-xs sm:text-[13px] truncate min-w-0"
                  title={sku}
                >
                  {sku}
                </span>

                {/* Count Badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${isUnknown
                      ? "text-amber-800 bg-amber-100 border-amber-300"
                      : "text-[#051448] bg-[#051448]/8 border-[#051448]/25"
                    }`}
                >
                  {count} {count === 1 ? "label" : "labels"}
                </span>

                {/* Quick Relocate & Up/Down Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Instant Move to Top (#1) */}
                  <button
                    type="button"
                    onClick={() => moveToTop(sku)}
                    disabled={globalIndex === 0}
                    className="p-1 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors text-black/60 hover:text-[#051448]"
                    title="Move to Top (#1)"
                  >
                    <ChevronsUp size={13} />
                  </button>

                  {/* Micro Up */}
                  <button
                    type="button"
                    onClick={() => moveUp(globalIndex)}
                    disabled={globalIndex === 0}
                    className="p-1 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors text-black/60 hover:text-[#051448]"
                    title="Move up 1 position"
                  >
                    <ArrowUp size={13} />
                  </button>

                  {/* Micro Down */}
                  <button
                    type="button"
                    onClick={() => moveDown(globalIndex)}
                    disabled={globalIndex === skuOrder.length - 1}
                    className="p-1 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors text-black/60 hover:text-[#051448]"
                    title="Move down 1 position"
                  >
                    <ArrowDown size={13} />
                  </button>

                  {/* Instant Move to Bottom */}
                  <button
                    type="button"
                    onClick={() => moveToBottom(sku)}
                    disabled={globalIndex === skuOrder.length - 1}
                    className="p-1 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors text-black/60 hover:text-[#051448]"
                    title="Move to Bottom (Last position)"
                  >
                    <ChevronsDown size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Compact Footer: Confirm & Download ── */}
      <div className="px-3.5 sm:px-4 py-2.5 border-t border-[#051448]/15 bg-white rounded-b-md flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleConfirmAndDownload}
          disabled={isBuilding}
          className={`flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${confirmed
              ? "bg-emerald-700 hover:bg-emerald-800 text-white"
              : "bg-[#051448] hover:bg-[#071a5e] text-white shadow-xs"
            } disabled:opacity-60`}
        >
          {isBuilding ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Building PDF...
            </>
          ) : confirmed ? (
            <>
              <CheckCircle size={13} />
              Download Again
            </>
          ) : (
            <>
              <Download size={13} />
              Confirm &amp; Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── Bulk Paste Order Modal (For 1,000+ SKUs from Excel/ERP) ── */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg border border-[#051448] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPaste size={16} className="text-[#051448]" />
                <h3 className="font-bold text-sm text-[#051448]">
                  Bulk Paste SKU Packing Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-black/60 hover:text-black cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-2.5 overflow-y-auto">
              <p className="text-xs text-black/70 leading-relaxed">
                Paste your prioritized SKU list below (one per line, directly from <strong>Excel</strong>, <strong>Google Sheets</strong>, or warehouse ERP).
                Labels matching your list will be grouped in this exact sequence, and any remaining labels will follow afterward.
              </p>

              <textarea
                rows={12}
                value={bulkPasteText}
                onChange={(e) => setBulkPasteText(e.target.value)}
                placeholder="Paste SKU list here (one per line)..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-[#051448] text-black"
              />

              {bulkPasteFeedback && (
                <div className="text-xs text-red-600 font-medium">
                  {bulkPasteFeedback}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs text-black/60">
                {bulkPasteText.split(/\r?\n/).filter((l) => l.trim().length > 0).length} lines pasted
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPasteModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-black/70 hover:text-black border border-slate-300 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkPaste}
                  className="px-4 py-1.5 rounded text-xs font-bold text-white bg-[#051448] hover:bg-[#071a5e] cursor-pointer shadow-xs"
                >
                  Apply Reorder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
