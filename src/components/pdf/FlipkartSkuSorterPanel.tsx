"use client";

import { useState, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Download,
  Loader2,
  Package,
  RotateCcw,
  GripVertical,
  CheckCircle,
  Trash2,
  ListOrdered,
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
  const [hasSavedBefore] = useState(hasStoredSkuOrder);

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pageCounts = countPagesPerSku(pageSkuMap);
  const totalPages = Object.keys(pageSkuMap).length;

  /* ── Arrow reorder ── */
  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...skuOrder];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  const moveDown = (index: number) => {
    if (index === skuOrder.length - 1) return;
    const next = [...skuOrder];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onSkuOrderChange(next);
    setConfirmed(false);
  };

  /* ── Drag-and-drop handlers ── */
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // required to allow drop
  };

  const handleDrop = (dropIndex: number) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      dragIndexRef.current = null;
      setDragOverIndex(null);
      return;
    }
    const next = [...skuOrder];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, dragged);
    onSkuOrderChange(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
    setConfirmed(false);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  /* ── Confirm arrangement: save to localStorage + build + download ── */
  const handleConfirmAndDownload = async () => {
    setIsBuilding(true);
    setErrorMsg(null);
    try {
      // Save arrangement to localStorage first
      saveSkuOrder(skuOrder);
      setConfirmed(true);

      // Build the grouped PDF
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

  const handleReset = () => {
    const sorted = [...skuOrder].sort((a, b) =>
      a === UNKNOWN_SKU ? 1 : b === UNKNOWN_SKU ? -1 : a.localeCompare(b)
    );
    onSkuOrderChange(sorted);
    setConfirmed(false);
  };

  const handleClearSaved = () => {
    clearSkuOrder();
  };

  return (
    <div className="mt-6 border border-[#051448] rounded-md bg-white shadow-sm overflow-hidden">

      {/* ── Panel Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#051448]/5 border-b border-[#051448]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-[#051448] bg-white flex items-center justify-center shrink-0">
            <ListOrdered size={14} className="text-[#051448]" />
          </div>
          <div>
            <p className="font-bold text-sm text-black leading-tight">Arrange SKU Order</p>
            <p className="text-[10px] text-black/60 leading-tight">
              {skuOrder.length} unique SKU{skuOrder.length !== 1 ? "s" : ""} · {totalPages} label{totalPages !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSavedBefore && (
            <button
              type="button"
              onClick={handleClearSaved}
              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2 py-1 rounded cursor-pointer transition-colors"
              title="Delete saved SKU order from local storage"
            >
              <Trash2 size={11} />
              Clear Saved Order
            </button>
          )}
        </div>
      </div>

      {/* ── Instructions bar ── */}
      <div className="px-5 py-3 bg-blue-50/60 border-b border-[#051448]/10">
        <p className="text-[11px] sm:text-xs text-black/70 leading-relaxed">
          <strong className="text-black">Drag</strong> cards to reorder, or use the <strong className="text-black">↑ ↓</strong> arrows.
          Labels will be grouped by SKU in this order in the downloaded PDF.
          Your arrangement is <strong className="text-black">saved locally</strong> when you confirm.
        </p>
      </div>

      {/* ── Error ── */}
      {errorMsg && (
        <div className="mx-5 mt-3 p-2.5 rounded border border-red-300 bg-red-50 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── SKU Arrangement List ── */}
      <div className="px-5 py-4 space-y-2">
        {skuOrder.map((sku, index) => {
          const count = pageCounts[sku] || 0;
          const isUnknown = sku === UNKNOWN_SKU;
          const isDragTarget = dragOverIndex === index;

          return (
            <div
              key={sku}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-3 py-3 rounded-md border cursor-grab active:cursor-grabbing transition-all select-none ${
                isDragTarget
                  ? "border-[#051448] bg-[#051448]/8 shadow-sm scale-[1.01]"
                  : isUnknown
                  ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                  : "border-[#051448]/15 bg-slate-50 hover:border-[#051448]/40 hover:bg-blue-50/30"
              }`}
            >
              {/* Drag handle */}
              <GripVertical
                size={15}
                className={`shrink-0 ${isDragTarget ? "text-[#051448]" : "text-black/30"}`}
              />

              {/* Position number */}
              <span className="text-[11px] font-bold text-[#051448] w-5 text-center shrink-0">
                {index + 1}
              </span>

              {/* Icon */}
              <Package
                size={14}
                className={`shrink-0 ${isUnknown ? "text-amber-500" : "text-[#051448]"}`}
              />

              {/* SKU name */}
              <span
                className="flex-1 text-xs font-semibold text-black truncate min-w-0"
                title={sku}
              >
                {sku}
              </span>

              {/* Page count badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  isUnknown
                    ? "text-amber-700 bg-amber-100 border-amber-200"
                    : "text-[#051448] bg-[#051448]/8 border-[#051448]/20"
                }`}
              >
                {count} label{count !== 1 ? "s" : ""}
              </span>

              {/* Arrow buttons */}
              <div className="flex gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-white hover:border hover:border-[#051448]/20 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={13} className="text-[#051448]" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === skuOrder.length - 1}
                  className="p-1.5 rounded hover:bg-white hover:border hover:border-[#051448]/20 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={13} className="text-[#051448]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Preview of grouped order ── */}
      <div className="mx-5 mb-4 p-3 rounded bg-slate-50 border border-slate-200 text-[11px] text-black/60">
        <span className="font-bold text-black/80 mr-1">Grouped order preview:</span>
        {skuOrder.map((sku, i) => (
          <span key={sku}>
            <span className="font-semibold text-[#051448]">{sku}</span>
            <span className="text-black/40 text-[10px] ml-0.5">({pageCounts[sku] || 0})</span>
            {i < skuOrder.length - 1 && <span className="mx-1 text-black/30">→</span>}
          </span>
        ))}
      </div>

      {/* ── Footer actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[#051448]/15 bg-slate-50">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-black/70 border border-slate-300 px-3 py-2 rounded hover:bg-white hover:border-[#051448]/30 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          Reset to Default
        </button>

        <button
          type="button"
          onClick={handleConfirmAndDownload}
          disabled={isBuilding}
          className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded transition-all cursor-pointer disabled:cursor-not-allowed ${
            confirmed
              ? "bg-green-700 hover:bg-green-800 text-white"
              : "bg-[#051448] hover:bg-[#071a5e] text-white"
          } disabled:opacity-60`}
        >
          {isBuilding ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Building PDF...
            </>
          ) : confirmed ? (
            <>
              <CheckCircle size={15} />
              Download Again
            </>
          ) : (
            <>
              <Download size={15} />
              Confirm Arrangement &amp; Download
            </>
          )}
        </button>
      </div>

      {/* ── Saved confirmation message ── */}
      {confirmed && !isBuilding && (
        <div className="px-5 pb-4 flex items-center gap-1.5 text-[11px] text-green-700 font-medium">
          <CheckCircle size={12} />
          Arrangement saved locally — it will be remembered next time you upload.
        </div>
      )}
    </div>
  );
}
