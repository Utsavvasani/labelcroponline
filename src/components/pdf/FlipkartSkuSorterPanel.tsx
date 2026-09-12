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

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pageCounts = countPagesPerSku(pageSkuMap);

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
    e.preventDefault();
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

  const handleSortAlphabetical = () => {
    const sorted = [...skuOrder].sort((a, b) =>
      a === UNKNOWN_SKU ? 1 : b === UNKNOWN_SKU ? -1 : a.localeCompare(b)
    );
    onSkuOrderChange(sorted);
    setConfirmed(false);
  };

  const handleClearSaved = () => {
    clearSkuOrder();
    setHasSavedBefore(false);
  };

  return (
    <div className="w-full flex flex-col">
      {/* ── Compact Header & Quick Tools ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-[#051448]/15 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm text-black truncate">
            Arrange SKU Order
          </span>
          <span className="text-xs text-black/55 hidden sm:inline truncate">
            (Drag cards or use arrows to group labels)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleSortAlphabetical}
            className="text-xs font-bold text-black/75 hover:text-[#051448] border border-slate-300 hover:border-[#051448]/50 px-2.5 py-1 rounded-md bg-white transition-colors cursor-pointer shadow-2xs"
            title="Sort SKUs alphabetically (A-Z)"
          >
            A-Z Sort
          </button>

          {hasSavedBefore && (
            <button
              type="button"
              onClick={handleClearSaved}
              className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-md bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Clear saved arrangement from local storage"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Clear Saved</span>
            </button>
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

      {/* ── Ultra-Compact Scrollable SKU List (max-h keeps everything on screen) ── */}
      <div className="px-3.5 sm:px-4 py-2 space-y-1.5 max-h-[270px] overflow-y-auto">
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-xs cursor-grab active:cursor-grabbing transition-all select-none ${
                isDragTarget
                  ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                  : isUnknown
                  ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                  : "border-slate-200 bg-slate-50/70 hover:border-[#051448]/40 hover:bg-blue-50/30 shadow-2xs"
              }`}
            >
              {/* Drag Handle */}
              <GripVertical
                size={15}
                className={`shrink-0 ${isDragTarget ? "text-[#051448]" : "text-black/35"}`}
              />

              {/* Position Number */}
              <span className="text-xs font-bold text-[#051448] w-4 text-center shrink-0">
                {index + 1}
              </span>

              {/* Icon */}
              <Package
                size={15}
                className={`shrink-0 ${isUnknown ? "text-amber-500" : "text-[#051448]"}`}
              />

              {/* SKU Title */}
              <span
                className="flex-1 font-semibold text-black text-xs sm:text-[13px] truncate min-w-0"
                title={sku}
              >
                {sku}
              </span>

              {/* Count Badge */}
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  isUnknown
                    ? "text-amber-800 bg-amber-100 border-amber-300"
                    : "text-[#051448] bg-[#051448]/8 border-[#051448]/25"
                }`}
              >
                {count} {count === 1 ? "label" : "labels"}
              </span>

              {/* Micro Up/Down Arrows */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move up"
                >
                  <ArrowUp size={13} className="text-[#051448]" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === skuOrder.length - 1}
                  className="p-1.5 rounded hover:bg-white hover:border hover:border-slate-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Move down"
                >
                  <ArrowDown size={13} className="text-[#051448]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Compact Footer: Confirm & Download ── */}
      <div className="px-3.5 sm:px-4 py-2.5 border-t border-[#051448]/15 bg-white rounded-b-md flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleConfirmAndDownload}
          disabled={isBuilding}
          className={`flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${
            confirmed
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
    </div>
  );
}
