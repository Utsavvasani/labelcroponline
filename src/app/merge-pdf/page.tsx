"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  Eye,
  Info,
  Loader2,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Layers,
  FileCheck,
  Check,
  MoveVertical,
  GripVertical,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  MergeItem,
  MergeResult,
  mergePdfFiles,
  getPdfPageCount,
  triggerDownload,
} from "@/lib/pdf/mergePdf";

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

export default function MergePdfPage() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFinalFileName = (fallbackName?: string) => {
    if (customFileName.trim()) {
      const clean = customFileName.trim().replace(/\.pdf$/i, "");
      return `${clean}.pdf`;
    }
    return fallbackName || mergeResult?.fileName || "labelcroponline_merged.pdf";
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (mergeResult?.blobUrl) URL.revokeObjectURL(mergeResult.blobUrl);
    };
  }, [mergeResult]);

  // Handle addition of PDF files
  const handleAddFiles = async (filesList: FileList | File[]) => {
    setErrorMsg(null);
    const validPdfs: File[] = [];

    for (let i = 0; i < filesList.length; i++) {
      const f = filesList[i];
      if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        validPdfs.push(f);
      }
    }

    if (validPdfs.length === 0) {
      setErrorMsg("Please select valid PDF files.");
      return;
    }

    // Process page counts asynchronously
    const newItems: MergeItem[] = [];
    for (const f of validPdfs) {
      const pageCount = await getPdfPageCount(f);
      newItems.push({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        name: f.name,
        size: f.size,
        pageCount,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    // Clear previous merge result on new additions
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Reordering functions via buttons / dropdown
  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...items];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setItems(updated);

    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
  };

  const setItemPosition = (currentIndex: number, newPosition: number) => {
    const targetIndex = Math.max(0, Math.min(items.length - 1, newPosition - 1));
    if (targetIndex === currentIndex) return;

    const updated = [...items];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setItems(updated);

    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
  };

  // Drag-and-Drop item reordering handlers
  const handleItemDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedItemIndex(index);
  };

  const handleItemDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleItemDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItemIndex !== null && draggedItemIndex !== dropIndex) {
      const updated = [...items];
      const [movedItem] = updated.splice(draggedItemIndex, 1);
      updated.splice(dropIndex, 0, movedItem);
      setItems(updated);

      if (mergeResult?.blobUrl) {
        URL.revokeObjectURL(mergeResult.blobUrl);
      }
      setMergeResult(null);
    }

    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
  };

  const handleReset = () => {
    setItems([]);
    if (mergeResult?.blobUrl) {
      URL.revokeObjectURL(mergeResult.blobUrl);
    }
    setMergeResult(null);
    setCustomFileName("");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute PDF Merge
  const handleMergePdf = async () => {
    if (items.length < 2) {
      setErrorMsg("Please upload at least 2 PDF files to merge.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (mergeResult?.blobUrl) {
        URL.revokeObjectURL(mergeResult.blobUrl);
      }

      const result = await mergePdfFiles(items);
      setMergeResult(result);
    } catch (err: unknown) {
      console.error("Error merging PDFs:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to merge PDF files. Please verify all files are valid PDFs.";
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const totalInputPages = items.reduce((acc, item) => acc + (item.pageCount || 1), 0);

  return (
    <>
      {/* ── Main Content Form Container (Proper spacing below fixed navigation bar) ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          id="merge-file-input"
        />

        {/* Error Alert */}
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

        {/* ── Main Card Form matching Contact Us Style ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-start">

            {/* ── Left Column: Tool Info & Actions ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">

              {/* Logo & Title */}
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <Image
                  src="/merge_icon.svg"
                  alt="Merge PDF"
                  width={250}
                  height={60}
                  className="h-20 sm:h-24 w-auto object-contain"
                  priority
                />
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-2">
                  Merge PDF Files
                </h1>
              </div>

              <p className="text-black/75 text-xs leading-relaxed mb-4 hidden sm:block">
                Combine multiple shipping labels, packing slips, or document PDFs into one single file. Rearrange order easily by dragging or changing the position number.
              </p>

              {items.length > 0 && (
                <div className="w-full bg-slate-50 border border-[#051448]/20 rounded-md p-3 mb-3 text-xs text-black/80 space-y-1 hidden sm:block">
                  <div className="flex justify-between">
                    <span>Selected Files:</span>
                    <strong className="text-black">{items.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <strong className="text-black">{totalInputPages}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#051448] border border-[#051448] px-3.5 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Add More PDFs
              </button>
            </div>

            {/* ── Right Column: Upload Zone & Sortable File List ── */}
            <div className="md:col-span-8 flex flex-col justify-center">

              {/* Upload Dropzone (When 0 files or for drag & drop) */}
              {items.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-[#051448] rounded-md p-6 sm:p-10 text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40 ${isDragging ? "bg-blue-50/80 border-dashed" : ""
                    }`}
                >
                  <div className="w-11 h-11 mx-auto rounded-full border border-[#051448] flex items-center justify-center text-[#051448] mb-2.5">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-bold text-black mb-1">
                    Click to select or drop multiple PDF files
                  </p>
                  <p className="text-xs text-black/60">
                    Upload 2 or more PDF documents to merge into one
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* File List Header with Drag Hint */}
                  <div className="flex items-center justify-between pb-1 border-b border-[#051448]/15">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                      <MoveVertical size={14} className="text-[#051448]" />
                      <span>Arrange Order ({items.length} Files • Drag &amp; Drop to reorder)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Drag-and-Drop Sortable File Cards */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, index)}
                        onDragOver={(e) => handleItemDragOver(e, index)}
                        onDrop={(e) => handleItemDrop(e, index)}
                        onDragEnd={handleItemDragEnd}
                        className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 border rounded-md transition-all shadow-xs cursor-grab active:cursor-grabbing select-none ${draggedItemIndex === index
                            ? "opacity-40 scale-[0.98] border-dashed border-[#051448] bg-blue-50/50"
                            : dragOverItemIndex === index
                              ? "border-2 border-[#051448] bg-blue-50/80 shadow-md ring-2 ring-[#051448]/20"
                              : "border-[#051448]/30 bg-white hover:border-[#051448]"
                          }`}
                      >
                        {/* Drag Handle Grip Icon */}
                        <div
                          className="text-black/35 hover:text-[#051448] cursor-grab active:cursor-grabbing shrink-0"
                          title="Drag to reorder position"
                        >
                          <GripVertical size={16} />
                        </div>

                        {/* Position Number Selector */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={index + 1}
                            onChange={(e) => setItemPosition(index, parseInt(e.target.value, 10))}
                            className="bg-blue-50 border border-[#051448] text-[#051448] font-bold text-xs rounded px-1.5 py-1 cursor-pointer focus:outline-none"
                            title="Change order position"
                          >
                            {items.map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                #{i + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* File Details */}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <FileText size={16} className="text-[#051448] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-black truncate">{item.name}</p>
                            <p className="text-[10px] text-black/60">
                              {formatFileSize(item.size)} • {item.pageCount || 1} page{item.pageCount && item.pageCount > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Action Controls (Up / Down / Delete) */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded border border-slate-200 hover:border-[#051448] text-black hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === items.length - 1}
                            className="p-1 rounded border border-slate-200 hover:border-[#051448] text-black hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                            title="Remove file"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add more files drop hint */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed border-[#051448]/40 rounded-md p-2 text-center text-xs font-semibold text-[#051448] cursor-pointer hover:bg-blue-50/40 transition-colors ${isDragging ? "bg-blue-50 border-[#051448]" : ""
                      }`}
                  >
                    + Drop more PDF files here to append
                  </div>

                </div>
              )}

              {/* Optional Custom File Name Input */}
              {items.length > 0 && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20">
                  <label htmlFor="merge-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 max-w-md flex items-center">
                    <input
                      id="merge-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={mergeResult ? mergeResult.fileName.replace(/\.pdf$/i, "") : "labelcroponline_merged"}
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1.5 pr-10 focus:outline-hidden focus:border-[#051448] text-black font-medium"
                    />
                    <span className="absolute right-2.5 text-[11px] text-black/50 font-mono pointer-events-none select-none">
                      .pdf
                    </span>
                  </div>
                  {customFileName && (
                    <button
                      type="button"
                      onClick={() => setCustomFileName("")}
                      className="text-[11px] text-[#051448] hover:underline cursor-pointer font-semibold"
                    >
                      Reset Name
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons & Status Row */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#051448]/15">

                {/* Left: Merge / Download Action */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={mergeResult ? () => triggerDownload(mergeResult.blobUrl, getFinalFileName(mergeResult.fileName)) : handleMergePdf}
                    disabled={isProcessing || items.length < 2}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Merging PDFs...
                      </>
                    ) : mergeResult ? (
                      <>
                        <Download size={15} />
                        Download Merged PDF
                      </>
                    ) : (
                      <>
                        <Layers size={15} />
                        Merge PDF Files
                      </>
                    )}
                  </button>

                  {items.length > 0 && (
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
                {mergeResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Preview Merged PDF"
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
              {mergeResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Merged {mergeResult.fileCount} PDFs successfully!
                  </span>
                  <span className="font-semibold text-black">
                    {mergeResult.pageCount} Pages • {formatFileSize(mergeResult.totalSize)}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Preview Modal (Opens when Eye is clicked) ── */}
      {showPreviewModal && mergeResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-black">Merged Document Preview</span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold">
                  {mergeResult.pageCount} Pages
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(mergeResult.blobUrl, getFinalFileName(mergeResult.fileName))}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-[#051448] hover:bg-[#071a5e] px-2.5 sm:px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded text-black hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Searchable, Continuous-Scroll Canvas PDF viewer */}
            <div className="flex-1 bg-slate-100 p-2 min-h-[480px] h-[650px] flex flex-col overflow-hidden">
              <PdfPreviewViewer
                key={`merged-${mergeResult.blobUrl}`}
                url={mergeResult.blobUrl}
                initialScale={1.3}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Metadata Modal (Opens when Info is clicked) ── */}
      {showMetaModal && mergeResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">

            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Merged File Details</h3>
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
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Output File:</span>
                <span className="font-semibold text-xs truncate max-w-[200px]">{getFinalFileName(mergeResult.fileName)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Merged Files:</span>
                <span className="font-semibold">{mergeResult.fileCount} documents</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Pages:</span>
                <span className="font-semibold">{mergeResult.pageCount} page(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Output Size:</span>
                <span className="font-semibold">{formatFileSize(mergeResult.totalSize)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-black/60">Format:</span>
                <span className="font-semibold">Merged Lossless PDF Vector</span>
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
