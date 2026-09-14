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
  Scissors,
  Check,
  FileCheck,
  Crop,
  FileEdit,
  Sparkles,
  Files,
  Plus,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  cropMeeshoPdf,
  triggerDownload,
  CropResult,
  MeeshoCropMode,
  MEESHO_CROP_OPTIONS,
} from "@/lib/pdf/meeshoCropper";
import { cropPdfCustomArea, CustomCropBox, CustomCropResult } from "@/lib/pdf/customCropper";
import {
  extractSkusFromMeeshoPdf,
  getUniqueSku,
  UNKNOWN_SKU,
  type PageSkuMap,
} from "@/lib/pdf/meeshoSkuExtractor";
import { getStoredSkuOrder } from "@/lib/meeshoSkuStorage";
import { MeeshoSkuSorterPanel } from "@/components/pdf/MeeshoSkuSorterPanel";
import { combinePdfFiles, type FilePageBreakdown } from "@/lib/pdf/pdfCombiner";

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
  {
    ssr: false,
  }
);

type ExtendedMeeshoCropMode = MeeshoCropMode | "custom";

function TooltipButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  badge,
  disabled = false,
  alignRight = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
  alignRight?: boolean;
}) {
  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-[34px] w-[34px] rounded-md border transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-2xs ${
          active
            ? "border-[#051448] bg-[#051448] text-white shadow-xs"
            : "border-slate-400 bg-white hover:bg-blue-50 text-[#051448] hover:border-[#051448]/60 hover:text-[#051448]"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={label}
      >
        <Icon size={16} className="stroke-[2.2]" />
        {badge !== undefined && (
          <span className="text-[11px] font-bold px-1.5 rounded-full bg-blue-100 text-[#051448]">
            {badge}
          </span>
        )}
      </button>

      {/* Instant, Light-Background Hover Tooltip */}
      <div
        className={`absolute top-full mt-2.5 ${
          alignRight ? "right-0" : "left-1/2 -translate-x-1/2"
        } opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-75 z-50 flex flex-col ${
          alignRight ? "items-end" : "items-center"
        }`}
      >
        <div
          className={`w-2 h-2 bg-white border-t border-l border-slate-400 rotate-45 -mb-1 z-10 ${
            alignRight ? "mr-3.5" : ""
          }`}
        />
        <div className="bg-white text-[#051448] border border-slate-400 text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function MeeshoLabelCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [cropMode, setCropMode] = useState<ExtendedMeeshoCropMode>("invoice");
  const [customCropBox, setCustomCropBox] = useState<CustomCropBox | null>(null);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropResult, setCropResult] = useState<CropResult | CustomCropResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showCustomCropModal, setShowCustomCropModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Multi-File & SKU Sorting State ──
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [fileBreakdown, setFileBreakdown] = useState<FilePageBreakdown[]>([]);
  const [isCombining, setIsCombining] = useState(false);
  const [pageSkuMap, setPageSkuMap] = useState<PageSkuMap>({});
  const [skuOrder, setSkuOrder] = useState<string[]>([]);
  const [isExtractingSku, setIsExtractingSku] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  const getFinalFileName = (fallbackName?: string) => {
    if (customFileName.trim()) {
      const clean = customFileName.trim().replace(/\.pdf$/i, "");
      return `${clean}.pdf`;
    }
    return fallbackName || cropResult?.fileName || "meesho_cropped_label.pdf";
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);
    };
  }, [cropResult]);

  // Process the uploaded PDF with background courier partner auto-detection or custom crop
  const handleProcessPdf = async (
    inputFile?: File | Blob,
    customName?: string,
    modeToUse: ExtendedMeeshoCropMode = cropMode,
    activeCustomBox: CustomCropBox | null = customCropBox,
    shouldDownload: boolean = false
  ) => {
    const targetFile = inputFile || file;
    const name = customName || (targetFile instanceof File ? targetFile.name : "Meesho.pdf");

    if (!targetFile) {
      setErrorMsg("Please upload or select a Meesho PDF first.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (cropResult?.blobUrl) {
        URL.revokeObjectURL(cropResult.blobUrl);
      }

      let result: CropResult | CustomCropResult;
      if (modeToUse === "custom" && activeCustomBox) {
        result = await cropPdfCustomArea(targetFile, name, activeCustomBox);
      } else {
        const standardMode: MeeshoCropMode = modeToUse === "custom" ? "invoice" : modeToUse;
        result = await cropMeeshoPdf(targetFile, name, standardMode, "auto");
      }

      setCropResult(result);

      if (shouldDownload) {
        executeDownloadAndReset(result.blobUrl, getFinalFileName(result.fileName));
      }
    } catch (err: unknown) {
      console.error("Error cropping Meesho PDF:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to process the PDF. Please check if the file is a valid Meesho PDF.";
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Non-blocking SKU extraction, runs after file is loaded ──
  const triggerSkuExtraction = async (inputFile: File) => {
    setIsExtractingSku(true);
    setPageSkuMap({});
    setSkuOrder([]);
    try {
      const map = await extractSkusFromMeeshoPdf(inputFile);
      const unique = getUniqueSku(map);
      setPageSkuMap(map);

      // Apply saved order if it matches current SKUs, otherwise use extracted order
      if (unique.length >= 1 && unique[0] !== UNKNOWN_SKU) {
        const saved = getStoredSkuOrder();
        const savedFiltered = saved.filter((s) => unique.includes(s));
        const missing = unique.filter((s) => !savedFiltered.includes(s));
        setSkuOrder(savedFiltered.length > 0 ? [...savedFiltered, ...missing] : unique);
      } else if (unique.length >= 2) {
        setSkuOrder(unique);
      }
    } catch (err) {
      console.warn("SKU extraction error:", err);
    } finally {
      setIsExtractingSku(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSourceFiles([]);
    setFileBreakdown([]);
    setIsCombining(false);
    if (cropResult?.blobUrl) {
      const urlToRevoke = cropResult.blobUrl;
      setTimeout(() => URL.revokeObjectURL(urlToRevoke), 1000);
    }
    setCropResult(null);
    setCustomCropBox(null);
    setCustomFileName("");
    setCropMode("invoice");
    setErrorMsg(null);
    setShowPreviewModal(false);
    setShowMetaModal(false);
    setShowCustomCropModal(false);
    setShowRenameInput(false);
    // Reset SKU state
    setPageSkuMap({});
    setSkuOrder([]);
    setIsExtractingSku(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (appendFileInputRef.current) appendFileInputRef.current.value = "";
  };

  const executeDownloadAndReset = (blobUrl: string, fileName: string) => {
    triggerDownload(blobUrl, fileName);
    handleReset();
  };

  const handleModeChange = (newMode: ExtendedMeeshoCropMode) => {
    setCropMode(newMode);
    if (newMode === "custom") {
      if (file) {
        setShowCustomCropModal(true);
      } else {
        fileInputRef.current?.click();
      }
    } else {
      if (file) {
        handleProcessPdf(file, file.name, newMode, null, false);
      }
    }
  };

  const handleApplyCustomCrop = (appliedBox: CustomCropBox) => {
    setCustomCropBox(appliedBox);
    setCropMode("custom");
    setShowCustomCropModal(false);
    if (file) {
      handleProcessPdf(file, file.name, "custom", appliedBox, false);
    }
  };

  const processFiles = async (incomingFiles: File[], append = false) => {
    const validPdfs = incomingFiles.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    if (validPdfs.length === 0) {
      setErrorMsg("Please upload valid PDF file(s).");
      return;
    }

    const allFiles = append ? [...sourceFiles, ...validPdfs] : validPdfs;
    setIsCombining(true);
    setErrorMsg(null);

    try {
      const { combinedFile, breakdown } = await combinePdfFiles(allFiles, "meesho_labels");
      setSourceFiles(allFiles);
      setFileBreakdown(breakdown);
      setFile(combinedFile);
      setCustomCropBox(null);
      handleProcessPdf(combinedFile, combinedFile.name, cropMode, null, false);
      triggerSkuExtraction(combinedFile);
    } catch (err) {
      console.error("Error processing Meesho PDFs:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to process PDF files.");
    } finally {
      setIsCombining(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (appendFileInputRef.current) appendFileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processFiles(files, false);
    }
  };

  const handleAppendFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      processFiles(files, true);
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
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      processFiles(files, false);
    }
  };

  const handleCropAndDownloadClick = () => {
    if (cropResult) {
      executeDownloadAndReset(cropResult.blobUrl, getFinalFileName(cropResult.fileName));
    } else if (file) {
      if (cropMode === "custom" && !customCropBox) {
        setShowCustomCropModal(true);
      } else {
        handleProcessPdf(file, file.name, cropMode, customCropBox, true);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getActiveModeName = () => {
    if (cropMode === "custom") return "Custom Selected Area";
    return MEESHO_CROP_OPTIONS[cropMode]?.name || "Meesho Label";
  };

  return (
    <>
      {/* ── Main Content Form Container ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[76px] sm:pt-20 pb-6 sm:pb-10">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="meesho-file-input"
        />
        {/* Hidden Append File Input */}
        <input
          ref={appendFileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleAppendFileChange}
          className="hidden"
          id="meesho-append-file-input"
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

        {/* ── Main Workspace Card ── */}
        <div className="border border-[#051448] rounded-md bg-white shadow-sm overflow-hidden">
          {!file ? (
            /* ── Initial Upload View: Clean 2-Column Card with Large Drop Zone ── */
            <div className="p-5 sm:p-7">
              <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-center">
                {/* Left Column: Logo & Description */}
                <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-3 md:pb-0 md:pr-6">
                  <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-0 md:mb-3">
                    <Image
                      src="/meesho_logo.svg"
                      alt="Meesho Logo"
                      width={140}
                      height={48}
                      className="h-9 sm:h-11 w-auto object-contain"
                      priority
                    />
                    <h1 className="text-base sm:text-lg font-bold text-black md:mt-2">
                      Meesho Label Cropper
                    </h1>
                  </div>

                  <p className="hidden md:block text-black text-sm leading-relaxed mb-4">
                    Crop Meesho shipping labels with clean border margins, courier auto-detection, or select your own custom area.
                  </p>
                </div>

                {/* Right Column: Crop Option Tabs & Big Drop Zone */}
                <div className="md:col-span-8 flex flex-col justify-center">
                  <div className="mb-3">

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleModeChange("invoice")}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer flex items-center justify-between ${
                          cropMode === "invoice"
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <span className="text-xs sm:text-sm text-black">
                          With Tax Invoice
                        </span>
                        {cropMode === "invoice" && (
                          <Check size={14} className="text-[#051448] shrink-0" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModeChange("label_sku")}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer flex items-center justify-between ${
                          cropMode === "label_sku"
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <span className="text-xs sm:text-sm text-black">
                          Label + SKU
                        </span>
                        {cropMode === "label_sku" && (
                          <Check size={14} className="text-[#051448] shrink-0" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModeChange("custom")}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer flex items-center justify-between ${
                          cropMode === "custom"
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <span className="text-xs sm:text-sm text-black">
                          Custom Area
                        </span>
                        {cropMode === "custom" && (
                          <Check size={14} className="text-[#051448] shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Big, Attractive Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md py-10 sm:py-14 px-6 text-center cursor-pointer transition-all duration-150 bg-white hover:bg-blue-50/50 group ${
                      isDragging ? "bg-blue-50/90 border-[#051448]" : "border-[#051448]"
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full border border-[#051448] bg-blue-50/60 flex items-center justify-center text-[#051448] mb-2.5 group-hover:scale-105 transition-transform">
                      <UploadCloud size={24} className="stroke-[2]" />
                    </div>
                    <p className="text-xs sm:text-sm text-black/80 font-normal">
                      Upload Meesho PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Active Workspace View: Compact, Scroll-Free with Menubar ── */
            <div className="flex flex-col">
              {/* 1. Sleek Top Toolbar / Menubar */}
              <div className="relative z-30 px-3.5 sm:px-4 py-2 bg-slate-50 border-b border-slate-400 rounded-t-md flex flex-wrap items-center justify-between gap-2">
                {/* Left: Meesho Logo + File Name + Deduplicated Count Badge */}
                <div className="flex items-center gap-3 min-w-0">
                  <Image
                    src="/meesho_logo.svg"
                    alt="Meesho"
                    width={110}
                    height={38}
                    className="h-8 sm:h-9 w-auto object-contain shrink-0"
                    priority
                  />
                  <div className="h-5 w-px bg-slate-400 shrink-0" />
                  <div className="flex items-center gap-2 min-w-0">
                    {sourceFiles.length > 1 ? (
                      <div className="relative group inline-flex items-center">
                        <div className="flex items-center gap-1.5 cursor-pointer bg-slate-200/70 hover:bg-slate-200 border border-slate-400 px-2 py-1 rounded-md transition-colors shrink-0 shadow-2xs">
                          <Files size={14} className="text-[#051448] shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-black">
                            {sourceFiles.length} PDFs
                          </span>
                        </div>
                        {/* Instant Light Tooltip with Per-File Breakdown */}
                        <div className="absolute top-full mt-2.5 left-0 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-75 z-50 flex flex-col items-start">
                          <div className="w-2 h-2 bg-white border-t border-l border-slate-400 rotate-45 ml-4 -mb-1 z-10" />
                          <div className="bg-white text-[#051448] border border-slate-400 text-xs rounded-md shadow-lg p-2.5 min-w-[240px] max-w-[320px] space-y-1.5">
                            <div className="font-bold text-[11px] uppercase tracking-wider text-[#051448] border-b border-slate-200 pb-1 flex justify-between items-center">
                              <span>Combined Files ({sourceFiles.length})</span>
                              <span>{cropResult ? `${cropResult.pageCount} Labels` : `${fileBreakdown.reduce((a, b) => a + b.pages, 0)} Total`}</span>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {fileBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] gap-2 text-slate-800">
                                  <span className="truncate max-w-[170px]" title={item.name}>
                                    {idx + 1}. {item.name}
                                  </span>
                                  <span className="font-semibold shrink-0 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300 text-[#051448]">
                                    {item.pages} {item.pages === 1 ? "page" : "pages"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span
                        className="font-bold text-sm text-black truncate max-w-[150px] sm:max-w-[260px]"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    )}

                    {cropResult ? (
                      <span className="text-xs font-bold text-[#051448] bg-blue-100/90 border border-blue-300 px-2.5 py-0.5 rounded-full shrink-0">
                        {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-black/60 bg-slate-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                        PDF Loaded
                      </span>
                    )}

                    {/* Add More PDFs Button */}
                    <button
                      type="button"
                      onClick={() => appendFileInputRef.current?.click()}
                      disabled={isCombining || isProcessing}
                      className="h-[28px] flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#051448] bg-white hover:bg-blue-50 border border-slate-400 px-2 rounded cursor-pointer transition-colors shadow-2xs shrink-0 disabled:opacity-50"
                      title="Add and merge more PDF files into this batch"
                    >
                      <Plus size={13} className="stroke-[2.5]" />
                      <span>Add PDF</span>
                    </button>
                  </div>
                </div>

                {/* Right: Menubar of Icon Tools with Instant Light Hover Tooltips */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Crop Mode Switcher */}
                  <div className="relative group inline-flex items-center">
                    <div className="h-[34px] flex items-center p-0.5 rounded-md border border-slate-400 bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleModeChange("invoice")}
                        className={`h-full px-2.5 sm:px-3 rounded flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          cropMode === "invoice"
                            ? "bg-[#051448] text-white shadow-xs"
                            : "text-slate-600 hover:text-black"
                        }`}
                      >
                        With Tax Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange("label_sku")}
                        className={`h-full px-2.5 sm:px-3 rounded flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          cropMode === "label_sku"
                            ? "bg-[#051448] text-white shadow-xs"
                            : "text-slate-600 hover:text-black"
                        }`}
                      >
                        Label + SKU
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange("custom")}
                        className={`h-full px-2.5 sm:px-3 rounded flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          cropMode === "custom"
                            ? "bg-[#051448] text-white shadow-xs"
                            : "text-slate-600 hover:text-black"
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                    {/* Instant Light Tooltip */}
                    <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-75 z-50 flex flex-col items-center">
                      <div className="w-2 h-2 bg-white border-t border-l border-slate-400 rotate-45 -mb-1 z-10" />
                      <div className="bg-white text-[#051448] border border-slate-400 text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                        Crop Mode: {getActiveModeName()}
                      </div>
                    </div>
                  </div>

                  {/* Adjust Custom Area Button (shown in custom mode) */}
                  {cropMode === "custom" && (
                    <TooltipButton
                      icon={Crop}
                      label="Adjust Custom Area"
                      onClick={() => setShowCustomCropModal(true)}
                      active={!!customCropBox}
                    />
                  )}

                  {/* Rename Output File */}
                  <TooltipButton
                    icon={FileEdit}
                    label={customFileName ? `Renamed: ${customFileName}.pdf` : "Rename Output File"}
                    onClick={() => setShowRenameInput((prev) => !prev)}
                    active={showRenameInput || !!customFileName}
                  />

                  {/* Preview Cropped PDF */}
                  {cropResult && (
                    <TooltipButton
                      icon={Eye}
                      label="Preview Cropped PDF"
                      onClick={() => setShowPreviewModal(true)}
                      alignRight={true}
                    />
                  )}

                  {/* Direct Crop & Download button (visible when SKU sorter is not active) */}
                  {skuOrder.length < 2 && (
                    <button
                      type="button"
                      onClick={handleCropAndDownloadClick}
                      disabled={isProcessing}
                      className="h-[34px] flex items-center gap-1.5 bg-[#051448] hover:bg-[#071a5e] text-white text-xs sm:text-sm font-medium px-4 rounded-md transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
                    >
                      {isProcessing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Combining Overlay / Status Bar */}
              {isCombining && (
                <div className="px-3.5 sm:px-4 py-1.5 bg-blue-50/90 border-b border-blue-200 text-xs font-medium text-[#051448] flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#051448]" />
                  <span>Merging PDF files preserving 100% vector quality...</span>
                </div>
              )}

              {/* 2. Optional Inline File Rename Bar */}
              {showRenameInput && (
                <div className="px-3.5 sm:px-4 py-2 bg-blue-50/70 border-b border-[#051448]/15 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-black shrink-0">Output File Name:</span>
                    <div className="relative flex-1 max-w-sm flex items-center">
                      <input
                        type="text"
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        placeholder={cropResult ? cropResult.fileName.replace(/\.pdf$/i, "") : "custom_filename"}
                        className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2 py-1 pr-10 focus:outline-hidden focus:border-[#051448] text-black font-medium"
                      />
                      <span className="absolute right-2 text-[10px] text-black/50 font-mono pointer-events-none">
                        .pdf
                      </span>
                    </div>
                    {customFileName && (
                      <button
                        type="button"
                        onClick={() => setCustomFileName("")}
                        className="text-[11px] text-[#051448] hover:underline font-semibold shrink-0 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRenameInput(false)}
                    className="p-1 rounded hover:bg-white text-black/60 hover:text-black cursor-pointer"
                    title="Close rename"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* 3. Central Content Area: Seamlessly Integrated with Main Box (Zero Unwanted Margin) */}
              {isExtractingSku && skuOrder.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-black/70">
                  <Loader2 size={24} className="animate-spin text-[#051448]" />
                  <span className="font-semibold">Analyzing labels & detecting SKUs...</span>
                  <span className="text-[11px] text-black/50">Grouping order will appear automatically</span>
                </div>
              ) : skuOrder.length >= 2 ? (
                /* 2+ SKUs: Seamlessly integrated into main box with NO double borders or extra margins */
                <MeeshoSkuSorterPanel
                  file={file}
                  pageSkuMap={pageSkuMap}
                  skuOrder={skuOrder}
                  onSkuOrderChange={(newOrder) => setSkuOrder(newOrder)}
                  cropMode={cropMode === "custom" ? "invoice" : cropMode}
                />
              ) : skuOrder.length === 1 && skuOrder[0] !== UNKNOWN_SKU ? (
                /* 1 SKU: Compact Notification */
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-black">
                        SKU Detected: <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-[#051448] font-bold">{skuOrder[0]}</code>
                      </p>
                      <p className="text-[11px] text-black/60 mt-0.5">
                        All {Object.keys(pageSkuMap).length} labels belong to this product. (Multi-SKU sorting activates when 2+ different SKUs exist).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCropAndDownloadClick}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#051448] hover:bg-[#071a5e] text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <Download size={14} />
                    <span>Crop &amp; Download PDF</span>
                  </button>
                </div>
              ) : (
                /* Fallback: No SKUs or Unknown (Single action crop & download) */
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-center p-4">
                  <p className="font-bold text-xs text-black">Labels Ready for Crop</p>
                  <p className="text-[11px] text-black/60 max-w-sm">
                    Labels are ready to crop and download according to the selected mode ({getActiveModeName()}).
                  </p>
                  <button
                    type="button"
                    onClick={handleCropAndDownloadClick}
                    disabled={isProcessing}
                    className="mt-2 inline-flex items-center gap-1.5 bg-[#051448] hover:bg-[#071a5e] text-white text-xs font-bold px-5 py-2.5 rounded transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Crop &amp; Download PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SEO & User Information Blog / Guide Section ── */}
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12 text-black">

          {/* Section 1: Overview & Value Proposition */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-3">
              <span>Free Meesho Shipping Label Cropping Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              How to Crop Meesho Shipping Labels for 4×6 Thermal Printing Online
            </h2>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4 text-justify">
              When you download order invoices from the <strong>Meesho Supplier Panel</strong>, they come formatted as standard full-page A4 PDFs containing the shipping label at the top and the tax invoice at the bottom. Printing full A4 sheets wastes expensive thermal roll paper, slows down order packing, and requires manual scissor cutting.
            </p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> automatically detects each delivery courier partner (Delhivery, Shadowfax, Valmo, Valmo Plus, Xpressbees), crops the exact shipping label and tax invoice area with vector precision, and optimizes your bulk PDF for seamless batch thermal printing.
            </p>
          </div>

          {/* Section 2: Key Features Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#051448]">
                Why Sellers Choose LabelCropOnline for Meesho Label Cropping
              </h3>
              <p className="text-sm sm:text-base text-black/70 mt-1 text-justify sm:text-left">
                Engineered specifically for high-volume eCommerce sellers and warehouse dispatch teams.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Feature 1 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  1
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Courier-Wise Calibration</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Different logistics partners on Meesho have slightly different label positions. Our intelligent engine detects the courier for every page and applies precise crop margins.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Full Invoice &amp; Label+SKU Modes</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Choose between <strong>Full with Tax Invoice</strong> (mandatory for high-value &amp; interstate shipments) or <strong>Label + SKU Details</strong> (compact thermal stickers).
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
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Custom Area Crop Studio</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Have unique invoice dimensions or custom requirements? Use our interactive visual canvas selector to customize your crop area freely.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  5
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Eliminate Scissor Cutting</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Stop manually cutting A4 printouts. Print directly on self-adhesive thermal rolls and stick them straight onto your parcels.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  6
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">100% Private &amp; Secure</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  All PDF processing happens locally in your browser sandbox. Your customer addresses, GSTIN numbers, and sales data are never uploaded to remote servers.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Meesho Crop Modes Comparison */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Comparing Meesho Crop Modes: Which One Should You Use?
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-[#051448]/20 text-[#051448] font-bold">
                    <th className="p-3">Crop Option</th>
                    <th className="p-3">Included Content</th>
                    <th className="p-3">Recommended Paper</th>
                    <th className="p-3">Best Used For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-black/80">
                  <tr>
                    <td className="p-3 font-bold text-black">Full with Tax Invoice</td>
                    <td className="p-3">Shipping Label + SKU Table + Complete GST Tax Invoice</td>
                    <td className="p-3">4×6&quot; Thermal Roll or A4 Sticker</td>
                    <td className="p-3">Standard orders requiring physical tax invoice attached to parcel</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Label + SKU Details</td>
                    <td className="p-3">Shipping Barcode Label + Product SKU Summary Table</td>
                    <td className="p-3">4×4&quot; or 4×6&quot; Thermal Roll</td>
                    <td className="p-3">Quick warehouse packing where invoice is sent electronically</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-black">Custom Crop Area</td>
                    <td className="p-3">User-defined rectangular area on canvas</td>
                    <td className="p-3">Any custom label size</td>
                    <td className="p-3">Specialized printers or unique packing slips</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Step-by-Step Guide */}
          <div className="bg-slate-50 border border-[#051448]/20 rounded-md p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Step-by-Step: How to Crop &amp; Print Meesho Labels on 4×6 Thermal Roll Printers
            </h3>
            <ol className="space-y-3.5 text-sm sm:text-base text-black/80">
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 1:</span>
                <span className="text-justify">
                  Go to <strong>Meesho Supplier Panel</strong> → <strong>Orders</strong> → <strong>Ready to Ship</strong>. Select your pending orders and click <strong>Download Labels</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 2:</span>
                <span className="text-justify">
                  Upload your Meesho PDF into the upload box above.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 3:</span>
                <span className="text-justify">
                  Select your desired crop mode (<strong>Full with Tax Invoice</strong> or <strong>Label + SKU</strong>). If left on <strong>Auto Detect</strong>, our engine calibrates margins automatically for each courier partner.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 4:</span>
                <span className="text-justify">
                  Click <strong>Preview</strong> to inspect the multi-page cropped document or click <strong>Crop the Label &amp; Download</strong> to save your print-ready PDF.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 5:</span>
                <span className="text-justify">
                  Open the cropped PDF in your print dialog, set <strong>Page Size: 4×6 in (100×150 mm)</strong>, <strong>Scale: Fit to Page</strong>, and print on your thermal sticker roll.
                </span>
              </li>
            </ol>
          </div>

          {/* Section 4: Thermal Printer Settings & Tips */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Recommended Thermal Printer Settings for Meesho Labels
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

          {/* Section 5: FAQs */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Frequently Asked Questions (FAQs)
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Which Meesho delivery partners are supported?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  All major delivery partners used by Meesho are supported with auto-detection: <strong>Delhivery</strong>, <strong>Shadowfax</strong>, <strong>Valmo</strong>, <strong>Valmo Plus</strong>, and <strong>Xpressbees</strong>.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Which crop mode should I choose: With Tax Invoice or Label + SKU?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  If you are shipping interstate or required to attach the GST Tax Invoice to the parcel, choose <strong>Full with Tax Invoice</strong>. If you only need the shipping address and SKU table on a smaller sticker, choose <strong>Label + SKU Details</strong>.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Can I crop multi-page batch PDFs from Meesho?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes. You can upload multi-page PDFs with 10, 50, 100, or more labels. The cropper processes all pages simultaneously in seconds and auto-calibrates courier crop margins page by page.
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
          isOpen={showCustomCropModal}
          onClose={() => setShowCustomCropModal(false)}
          file={file}
          onApplyCrop={handleApplyCustomCrop}
          title="Select Area to Crop (Meesho PDF)"
          initialCropBox={customCropBox || undefined}
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
                  Meesho ({getActiveModeName()})
                </span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold shrink-0">
                  {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => executeDownloadAndReset(cropResult.blobUrl, getFinalFileName(cropResult.fileName))}
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
                key={`cropped-${cropResult.blobUrl}`}
                url={cropResult.blobUrl}
                initialScale={1.3}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Metadata Modal (Opens when Info is clicked) ── */}
      {showMetaModal && cropResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">

            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">File Details</h3>
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
                <span className="font-semibold text-xs break-all text-right max-w-[200px] sm:max-w-[260px]">{getFinalFileName(cropResult.fileName)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Crop Option:</span>
                <span className="font-semibold capitalize">{getActiveModeName()}</span>
              </div>
              {cropResult.partnerSummaryText && (
                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-100 min-w-0">
                  <span className="text-black/60 shrink-0">Couriers Detected:</span>
                  <span className="font-semibold text-xs text-right max-w-[200px] sm:max-w-[220px] break-all">{cropResult.partnerSummaryText}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Total Pages:</span>
                <span className="font-semibold">{cropResult.pageCount} page(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Original Size:</span>
                <span className="font-semibold">{formatFileSize(cropResult.originalSize)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Cropped Size:</span>
                <span className="font-semibold">{formatFileSize(cropResult.croppedSize)}</span>
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
