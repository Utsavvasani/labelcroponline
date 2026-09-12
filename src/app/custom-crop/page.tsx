"use client";

import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import {
  UploadCloud,
  Download,
  RotateCcw,
  Eye,
  Info,
  Loader2,
  X,
  Sliders,
  Check,
  FileCheck,
  Crop,
  Layers,
  Sparkles,
  Printer,
  ShieldCheck,
  FileText,
} from "lucide-react";
import {
  cropPdfCustomArea,
  CustomCropBox,
  CustomCropResult,
} from "@/lib/pdf/customCropper";
import { triggerDownload } from "@/lib/pdf/mergePdf";
import { PDFDocument } from "pdf-lib";

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

const CustomPdfCropModal = dynamic(
  () => import("@/components/pdf/CustomPdfCropModal").then((m) => m.CustomPdfCropModal),
  { ssr: false }
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

interface CropPreset {
  id: string;
  label: string;
  desc: string;
  box: CustomCropBox;
}

const CROP_PRESETS: CropPreset[] = [
  {
    id: "thermal-4x6",
    label: "4×6 Thermal Label",
    desc: "Centered ~2:3 box for shipping labels",
    box: { leftPct: 0.1, topPct: 0.05, widthPct: 0.8, heightPct: 0.6 },
  },
  {
    id: "top-half",
    label: "Top Half (A4 Label)",
    desc: "Crops upper 50% of the page",
    box: { leftPct: 0.0, topPct: 0.0, widthPct: 1.0, heightPct: 0.5 },
  },
  {
    id: "bottom-half",
    label: "Bottom Half (Invoice)",
    desc: "Crops lower 50% of the page",
    box: { leftPct: 0.0, topPct: 0.5, widthPct: 1.0, heightPct: 0.5 },
  },
  {
    id: "margin-trim",
    label: "Trim Margins (5%)",
    desc: "Trims 5% white border around page",
    box: { leftPct: 0.05, topPct: 0.05, widthPct: 0.9, heightPct: 0.9 },
  },
];

export default function CustomCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  const [cropBox, setCropBox] = useState<CustomCropBox>({
    leftPct: 0.05,
    topPct: 0.05,
    widthPct: 0.9,
    heightPct: 0.9,
  });
  const [activePreset, setActivePreset] = useState<string>("margin-trim");

  const [customFileName, setCustomFileName] = useState("");
  const [cropResult, setCropResult] = useState<CustomCropResult | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);
    };
  }, [cropResult]);

  const handleReset = useCallback(() => {
    if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);
    setFile(null);
    setPageCount(0);
    setFileSize(0);
    setCropResult(null);
    setCustomFileName("");
    setErrorMsg(null);
    setShowCropModal(false);
    setShowPreviewModal(false);
    setShowDetailsModal(false);
    setCropBox({
      leftPct: 0.05,
      topPct: 0.05,
      widthPct: 0.9,
      heightPct: 0.9,
    });
    setActivePreset("margin-trim");
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [cropResult]);

  const processFile = useCallback(async (f: File) => {
    if (
      f.type !== "application/pdf" &&
      !f.name.toLowerCase().endsWith(".pdf")
    ) {
      setErrorMsg("Please upload a valid PDF file.");
      return;
    }

    setFile(f);
    setErrorMsg(null);
    setCropResult(null);
    setIsProcessing(true);

    try {
      const ab = await f.arrayBuffer();
      arrayBufferRef.current = ab;

      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const pages = pdfDoc.getPageCount();

      if (pages === 0) {
        throw new Error("The PDF document has no pages.");
      }

      setPageCount(pages);
      setFileSize(f.size);
    } catch (err: unknown) {
      console.error("Error reading PDF:", err);
      setErrorMsg("Failed to read the PDF file. Please ensure it is not password protected.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCrop = async (targetBox: CustomCropBox = cropBox) => {
    if (!arrayBufferRef.current && !file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);

      const inputData = arrayBufferRef.current || file!;
      const result = await cropPdfCustomArea(
        inputData,
        customFileName ? `${customFileName}.pdf` : file?.name || "document.pdf",
        targetBox
      );

      setCropResult(result);
    } catch (err: unknown) {
      console.error("Error cropping PDF:", err);
      setErrorMsg("Failed to crop the PDF file. Please check the crop coordinates.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCustomCropFromModal = (appliedBox: CustomCropBox) => {
    setCropBox(appliedBox);
    setActivePreset("custom");
    setShowCropModal(false);
    handleCrop(appliedBox);
  };

  const handleSelectPreset = (preset: CropPreset) => {
    setActivePreset(preset.id);
    setCropBox(preset.box);
    if (cropResult?.blobUrl) {
      URL.revokeObjectURL(cropResult.blobUrl);
      setCropResult(null);
    }
  };

  const handleManualCoordChange = (key: keyof CustomCropBox, value: number) => {
    setActivePreset("custom");
    setCropBox((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "leftPct" && updated.leftPct + updated.widthPct > 1) {
        updated.widthPct = Math.max(0.05, 1 - updated.leftPct);
      }
      if (key === "widthPct" && updated.leftPct + updated.widthPct > 1) {
        updated.leftPct = Math.max(0, 1 - updated.widthPct);
      }
      if (key === "topPct" && updated.topPct + updated.heightPct > 1) {
        updated.heightPct = Math.max(0.05, 1 - updated.topPct);
      }
      if (key === "heightPct" && updated.topPct + updated.heightPct > 1) {
        updated.topPct = Math.max(0, 1 - updated.heightPct);
      }
      return updated;
    });
    if (cropResult?.blobUrl) {
      URL.revokeObjectURL(cropResult.blobUrl);
      setCropResult(null);
    }
  };

  const handleDownload = () => {
    if (cropResult) {
      const downloadName = customFileName
        ? `${customFileName.replace(/\.pdf$/i, "")}.pdf`
        : cropResult.fileName;
      triggerDownload(cropResult.blobUrl, downloadName);
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

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="custom-crop-file-input"
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

        {/* ── Main Tool Card Form ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-start">
            
            {/* ── Left Column: Tool Info & File Meta ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-[#051448]/20 flex items-center justify-center text-[#051448] shadow-xs">
                  <Sliders size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Custom Crop Studio
                </h1>
              </div>

              <p className="text-black text-sm sm:text-base leading-relaxed mb-4 text-justify">
                Crop any PDF document or shipping label to your exact custom rectangle. Drag handles visually or choose standard ecommerce presets.
              </p>

              {file && (
                <div className="w-full bg-slate-50 border border-[#051448]/20 rounded-md p-3 mb-3 text-xs text-black/80 space-y-1 hidden sm:block">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <strong className="truncate max-w-[130px]" title={file.name}>
                      {file.name}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <strong>{pageCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Size:</span>
                    <strong>{formatFileSize(fileSize)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span>Crop Box:</span>
                    <strong className="text-[#051448]">
                      {Math.round(cropBox.widthPct * 100)}% × {Math.round(cropBox.heightPct * 100)}%
                    </strong>
                  </div>
                </div>
              )}

              <div className="w-full flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#051448] border border-[#051448] px-3.5 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <UploadCloud size={14} />
                  {file ? "Change PDF" : "Choose PDF"}
                </button>

                {file && (
                  <button
                    type="button"
                    onClick={() => setShowCropModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#051448] px-3.5 py-2 rounded hover:bg-[#071a5e] transition-colors cursor-pointer"
                  >
                    <Crop size={14} />
                    Visual Area Selector
                  </button>
                )}
              </div>
            </div>

            {/* ── Right Column: Dropzone & Settings ── */}
            <div className="md:col-span-8 flex flex-col justify-center">

              {/* Preset Selector */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Quick Crop Presets:
                  </span>
                  {activePreset === "custom" && (
                    <span className="text-[11px] font-semibold text-[#051448] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Visual / Custom Box
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {CROP_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-xs text-black leading-tight">
                            {preset.label}
                          </span>
                          {isSelected && <Check size={13} className="text-[#051448] shrink-0" />}
                        </div>
                        <p className="text-[10px] text-black/70 leading-tight">
                          {preset.desc}
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
                    ? `${pageCount} page(s) • ${formatFileSize(fileSize)} • Ready to crop`
                    : "Upload document to visually select crop area and print on thermal"}
                </p>
              </div>

              {/* Sliders & Coordinate Preview when File is loaded */}
              {file && (
                <div className="mt-3 p-3 bg-slate-50 border border-[#051448]/20 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                      Fine-Tune Crop Box Coordinates:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCropModal(true)}
                      className="text-[11px] text-[#051448] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Crop size={12} />
                      Open Visual Drag Studio
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                        <span>Left:</span>
                        <strong className="text-black font-semibold">{Math.round(cropBox.leftPct * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={1}
                        value={Math.round(cropBox.leftPct * 100)}
                        onChange={(e) => handleManualCoordChange("leftPct", Number(e.target.value) / 100)}
                        className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#051448]"
                      />
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                        <span>Top:</span>
                        <strong className="text-black font-semibold">{Math.round(cropBox.topPct * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={1}
                        value={Math.round(cropBox.topPct * 100)}
                        onChange={(e) => handleManualCoordChange("topPct", Number(e.target.value) / 100)}
                        className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#051448]"
                      />
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                        <span>Width:</span>
                        <strong className="text-black font-semibold">{Math.round(cropBox.widthPct * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={1}
                        value={Math.round(cropBox.widthPct * 100)}
                        onChange={(e) => handleManualCoordChange("widthPct", Number(e.target.value) / 100)}
                        className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#051448]"
                      />
                    </div>

                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-1">
                        <span>Height:</span>
                        <strong className="text-black font-semibold">{Math.round(cropBox.heightPct * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={1}
                        value={Math.round(cropBox.heightPct * 100)}
                        onChange={(e) => handleManualCoordChange("heightPct", Number(e.target.value) / 100)}
                        className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#051448]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="custom-crop-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="custom-crop-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={cropResult ? cropResult.fileName.replace(/\.pdf$/i, "") : "custom_cropped_document"}
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

              {/* Action Buttons & Trigger Row */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#051448]/15">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={cropResult ? handleDownload : () => handleCrop()}
                    disabled={!file || isProcessing}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Cropping PDF...
                      </>
                    ) : cropResult ? (
                      <>
                        <Download size={15} />
                        Download Cropped PDF
                      </>
                    ) : (
                      <>
                        <Crop size={15} />
                        Crop PDF
                      </>
                    )}
                  </button>

                  {file && !cropResult && (
                    <button
                      type="button"
                      onClick={() => setShowCropModal(true)}
                      className="flex items-center justify-center gap-1 text-xs font-semibold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Sliders size={13} className="text-[#051448]" />
                      Visual Selector
                    </button>
                  )}

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

                {cropResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Preview Cropped PDF"
                    >
                      <Eye size={14} className="text-[#051448]" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCropModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Re-adjust Crop Area"
                    >
                      <Crop size={14} className="text-[#051448]" />
                      <span>Re-Crop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(true)}
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
              {cropResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Crop applied successfully across {cropResult.pageCount} page(s)!
                  </span>
                  <span className="font-semibold text-black">
                    {formatFileSize(cropResult.croppedSize)} (from {formatFileSize(cropResult.originalSize)})
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Informational / SEO / Content Sections (Identical to Meesho/Flipkart pages) ── */}
        <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">

          {/* Section 1: Introduction */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              How to Custom Crop PDF Documents &amp; Shipping Labels for Thermal Printing
            </h2>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4 text-justify">
              When working with shipping labels from diverse marketplaces, courier portals, or ERP software, invoices and manifests often contain excessive margins, dual-invoices, or unwanted headers that waste expensive thermal roll paper. Manually trimming each sheet with scissors is slow and error-prone.
            </p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline Custom Crop Studio</strong> lets you visually select the exact rectangular crop boundary on your PDF pages. Our vector engine recalculates page dimensions across every page in your batch instantly, ensuring 100% sharp barcodes and zero quality degradation for thermal roll printing.
            </p>
          </div>

          {/* Section 2: Key Features Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#051448]">
                Why Sellers Choose LabelCropOnline Custom Crop Studio
              </h3>
              <p className="text-sm sm:text-base text-black/70 mt-1 text-justify sm:text-left">
                Engineered specifically for high-volume eCommerce sellers, dispatchers, and warehouse teams.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Feature 1 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  1
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Interactive Visual Drag Studio</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Adjust 8 crop handles directly over the PDF document. Zoom in and out to preview text and isolate barcodes with millimeter precision.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">4×6 Thermal Printer Ready</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Isolate dispatch stickers from full A4 sheets for seamless printing on standard direct thermal rolls without wasted paper.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  3
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">100% Barcode Quality</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Our direct vector cropping retains razor-sharp barcode resolution so delivery partners can scan your labels on the first pass without delays.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  4
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Multi-Page Batch Processing</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Upload multi-page PDFs with 10, 50, or 200+ labels. The selected crop area is automatically applied across every page uniformly in seconds.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  5
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Eliminate Scissor Cutting</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Stop manually cutting paper slips with scissors. Print directly on self-adhesive thermal rolls and stick them straight onto shipping parcels.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  6
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">100% Private &amp; Secure</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  All PDF processing happens locally in your browser sandbox. Your customer addresses, GSTIN numbers, and order data are never uploaded to remote servers.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Presets Comparison Table */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Comparing Quick Crop Presets: Which One Should You Use?
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-[#051448]/20 text-[#051448] font-bold">
                    <th className="p-3">Preset Option</th>
                    <th className="p-3">Included Content</th>
                    <th className="p-3">Recommended Paper</th>
                    <th className="p-3">Best Used For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-black/80">
                  <tr>
                    <td className="p-3 font-bold text-black">4×6 Thermal Label</td>
                    <td className="p-3">Centered ~2:3 label rectangle</td>
                    <td className="p-3">4×6&quot; Thermal Roll (100×150 mm)</td>
                    <td className="p-3">Standard ecommerce courier shipping labels</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Top Half (A4 Label)</td>
                    <td className="p-3">Upper 50% of the A4 page</td>
                    <td className="p-3">4×6&quot; Roll or A5 Sticker</td>
                    <td className="p-3">A4 documents where shipping label is at top</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Bottom Half (Invoice)</td>
                    <td className="p-3">Lower 50% of the A4 page</td>
                    <td className="p-3">A5 Paper or Thermal Roll</td>
                    <td className="p-3">Isolating tax invoice or customer packing slips</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Trim Margins (5%)</td>
                    <td className="p-3">90% centered page area (5% margins removed)</td>
                    <td className="p-3">A4 or Thermal Roll</td>
                    <td className="p-3">Removing blank printer margins and crop marks</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Visual Drag Studio</td>
                    <td className="p-3">User-defined rectangular area on canvas</td>
                    <td className="p-3">Any custom label size</td>
                    <td className="p-3">Specialized courier layouts, bills, and manifests</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Step-by-Step Guide */}
          <div className="bg-slate-50 border border-[#051448]/20 rounded-md p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Step-by-Step: How to Custom Crop &amp; Print PDF Labels on 4×6 Thermal Roll Printers
            </h3>
            <ol className="space-y-3.5 text-sm sm:text-base text-black/80">
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 1:</span>
                <span className="text-justify">
                  Upload your multi-page or single-page PDF document into the upload dropzone above.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 2:</span>
                <span className="text-justify">
                  Select a quick preset (such as <strong>4×6 Thermal Label</strong>) or click <strong>Visual Area Selector</strong> to drag bounding box handles to your desired crop rectangle.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 3:</span>
                <span className="text-justify">
                  Optionally enter a custom file name and click <strong>Crop PDF</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 4:</span>
                <span className="text-justify">
                  Click <strong>Preview</strong> to inspect the multi-page cropped document or click <strong>Download Cropped PDF</strong> to save your print-ready file.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 5:</span>
                <span className="text-justify">
                  Open the cropped PDF in your print dialog, set <strong>Page Size: 4×6 in (100×150 mm)</strong>, <strong>Scale: Fit to Page</strong>, and print directly on your thermal roll.
                </span>
              </li>
            </ol>
          </div>

          {/* Section 5: Thermal Printer Settings & Tips */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Recommended Thermal Printer Settings for Custom PDF Labels
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Print Dialog Settings</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside text-xs sm:text-sm">
                  <li><strong>Destination:</strong> Select your 4×6 Thermal Printer (e.g. TSC, Zebra, TVS, Rollo, Xprinter)</li>
                  <li><strong>Paper Size:</strong> 4×6 inches / 100×150 mm</li>
                  <li><strong>Scale:</strong> Fit to Printable Area or 100%</li>
                  <li><strong>Margins:</strong> None</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Printer Driver Calibration</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside text-xs sm:text-sm">
                  <li><strong>Print Speed:</strong> 4 inches/second (ips) for crisp barcodes</li>
                  <li><strong>Darkness / Density:</strong> Level 10-12 for high-contrast scan readability</li>
                  <li><strong>Media Type:</strong> Direct Thermal / Label with Gaps</li>
                  <li><strong>Sensor:</strong> Gap / Notch Sensor</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6: FAQs (Matching Meesho/Flipkart pages 100%) */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Frequently Asked Questions (FAQs)
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  What is Custom Crop Studio used for?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Custom Crop Studio is an interactive visual cropper for PDF documents. It allows ecommerce sellers and document handlers to select any rectangular portion of a PDF page (such as a 4x6 shipping label on an A4 sheet) and trim away unused white borders or invoices across all pages in batch.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Will my barcodes and text remain clear after cropping?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, 100%. Our tool adjusts the PDF page bounding boxes (MediaBox and CropBox) losslessly using pdf-lib. The underlying vector graphics, barcode lines, and typography are untouched and retain original high-resolution print quality.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Can I crop multi-page batch PDFs?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes! The crop rectangle you specify is automatically applied to all pages in the uploaded PDF. Whether you have 1 label or 500 labels in a single PDF, the entire batch is cropped instantly.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  What printer formats can I crop for?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  You can crop for any printer format including 4×6 inch thermal rolls, 3×5 inch labels, A4 half-page, 2-up or 4-up shipping labels, and custom courier formats.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-black mb-1">
                  Is my business and customer information secure?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, 100%. We do not upload or store your PDF files on any remote server. All PDF parsing, cropping, and rendering are executed client-side inside your web browser.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Interactive Custom Crop Area Selection Modal ── */}
      {file && (
        <CustomPdfCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          file={file}
          onApplyCrop={handleApplyCustomCropFromModal}
          title="Select Area to Crop (Visual Canvas)"
          initialCropBox={cropBox}
        />
      )}

      {/* ── Preview Modal (Opens when Eye is clicked) ── */}
      {showPreviewModal && cropResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-xs sm:text-sm text-black truncate">
                  Custom Crop Preview ({cropResult.pageCount} Pages)
                </span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold shrink-0">
                  {Math.round(cropResult.cropBox.widthPct * 100)}% × {Math.round(cropResult.cropBox.heightPct * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-[#051448] hover:bg-[#071a5e] px-2.5 sm:px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
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

            {/* Modal Body */}
            <div className="flex-1 bg-slate-100 p-2 min-h-[480px] h-[650px] flex flex-col overflow-hidden">
              <PdfPreviewViewer url={cropResult.blobUrl} bytes={cropResult.pdfBytes} initialScale={1.3} />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-[#051448]/20 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate max-w-[280px] sm:max-w-md">
                File: <strong className="text-black">{cropResult.fileName}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setShowCropModal(true);
                }}
                className="text-[#051448] hover:underline font-semibold cursor-pointer shrink-0"
              >
                Re-adjust Area
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Details / Metadata Modal ── */}
      {showDetailsModal && cropResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Crop Specifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-black hover:opacity-75 cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-black">
              <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-100 min-w-0">
                <span className="text-black/60 shrink-0">Output File:</span>
                <span className="font-semibold text-xs break-all text-right max-w-[200px] sm:max-w-[260px]">
                  {cropResult.fileName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Pages:</span>
                <span className="font-semibold">{cropResult.pageCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Original Size:</span>
                <span className="font-semibold">{formatFileSize(cropResult.originalSize)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Cropped Size:</span>
                <span className="font-semibold text-[#051448]">{formatFileSize(cropResult.croppedSize)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Left Margin Crop:</span>
                <span className="font-semibold font-mono">{(cropResult.cropBox.leftPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Top Margin Crop:</span>
                <span className="font-semibold font-mono">{(cropResult.cropBox.topPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Crop Width:</span>
                <span className="font-semibold font-mono">{(cropResult.cropBox.widthPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Crop Height:</span>
                <span className="font-semibold font-mono">{(cropResult.cropBox.heightPct * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#051448]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
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
