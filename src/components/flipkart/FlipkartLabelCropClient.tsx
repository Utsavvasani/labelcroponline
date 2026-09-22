"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileText,
  Download,
  Eye,
  Loader2,
  X,
  Scissors,
  FileCheck,
  Crop,
  Check,
  FileEdit,
  Files,
  Plus,
  Package,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cropFlipkartPdf, triggerDownload, CropResult } from "@/lib/pdf/flipkartCropper";
import { cropPdfCustomArea, CustomCropBox, CustomCropResult } from "@/lib/pdf/customCropper";
import {
  extractSkusFromFlipkartPdf,
  getUniqueSku,
  UNKNOWN_SKU,
  type PageSkuMap,
} from "@/lib/pdf/flipkartSkuExtractor";
import { getStoredSkuOrder } from "@/lib/flipkartSkuStorage";
import { FlipkartSkuSorterPanel } from "@/components/pdf/FlipkartSkuSorterPanel";
import { combinePdfFiles, type FilePageBreakdown } from "@/lib/pdf/pdfCombiner";
import { RelatedTools } from "@/components/shared/RelatedTools";

type SkuExtractionProgress = { current: number; total: number };

const SKU_PROCESSING_STATUS_STEPS = [
  "Extracting SKU identifiers...",
  "Scanning label barcodes & text...",
  "100% Secure: Processed locally in your browser...",
  "Analyzing product variations...",
  "Zero server uploads: Files never leave your device...",
  "Protecting customer address & order data...",
  "Organizing identical SKU sequence...",
];

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

type FlipkartCropMode = "auto" | "custom";

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

      {/* Instant, Light-Background Hover Tooltip (Drops downward so it is never clipped) */}
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

export default function FlipkartLabelCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<FlipkartCropMode>("auto");
  const [customCropBox, setCustomCropBox] = useState<CustomCropBox | null>(null);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [showRenameInput, setShowRenameInput] = useState(false);
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
  const [skuProgress, setSkuProgress] = useState<SkuExtractionProgress | null>(null);
  const [extractionStatusIndex, setExtractionStatusIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  const getFinalFileName = (fallbackName?: string) => {
    if (customFileName.trim()) {
      const clean = customFileName.trim().replace(/\.pdf$/i, "");
      return `${clean}.pdf`;
    }
    return fallbackName || cropResult?.fileName || "flipkart_cropped_label.pdf";
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);
    };
  }, [cropResult]);

  // Frequently cycle status and privacy details during SKU extraction
  useEffect(() => {
    if (!isExtractingSku) {
      setExtractionStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setExtractionStatusIndex((prev) => (prev + 1) % SKU_PROCESSING_STATUS_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isExtractingSku]);

  // Process the uploaded PDF (Auto or Custom)
  const handleProcessPdf = async (
    inputFile?: File | Blob,
    customName?: string,
    mode: FlipkartCropMode = cropMode,
    activeCustomBox: CustomCropBox | null = customCropBox,
    shouldDownload: boolean = false
  ) => {
    const targetFile = inputFile || file;
    const name = customName || (targetFile instanceof File ? targetFile.name : "Flipkart.pdf");

    if (!targetFile) {
      setErrorMsg("Please upload or select a Flipkart PDF first.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (cropResult?.blobUrl) {
        URL.revokeObjectURL(cropResult.blobUrl);
      }

      let result: CropResult | CustomCropResult;
      if (mode === "custom" && activeCustomBox) {
        result = await cropPdfCustomArea(targetFile, name, activeCustomBox);
      } else {
        result = await cropFlipkartPdf(targetFile, name);
      }

      setCropResult(result);

      if (shouldDownload) {
        executeDownloadAndReset(result.blobUrl, getFinalFileName(result.fileName));
      }
    } catch (err: unknown) {
      console.error("Error cropping PDF:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to process the PDF. Please check if the file is a valid PDF.";
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Non-blocking SKU extraction, runs after file is loaded ──
  const triggerSkuExtraction = async (inputFile: File) => {
    setIsExtractingSku(true);
    setSkuProgress({ current: 0, total: 0 });
    setPageSkuMap({});
    setSkuOrder([]);
    try {
      const map = await extractSkusFromFlipkartPdf(inputFile, (current, total) => {
        setSkuProgress({ current, total });
      });
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
    setCropMode("auto");
    setErrorMsg(null);
    setShowPreviewModal(false);
    setShowMetaModal(false);
    setShowCustomCropModal(false);
    setShowRenameInput(false);
    // Reset SKU state
    setPageSkuMap({});
    setSkuOrder([]);
    setIsExtractingSku(false);
    setSkuProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (appendFileInputRef.current) appendFileInputRef.current.value = "";
  };

  const executeDownloadAndReset = (blobUrl: string, fileName: string) => {
    triggerDownload(blobUrl, fileName);
    handleReset();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleModeChange = (newMode: FlipkartCropMode) => {
    setCropMode(newMode);
    if (newMode === "custom") {
      if (file) {
        setShowCustomCropModal(true);
      } else {
        fileInputRef.current?.click();
      }
    } else {
      if (file) {
        handleProcessPdf(file, file.name, "auto", null, false);
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
      const { combinedFile, breakdown } = await combinePdfFiles(allFiles, "flipkart_labels");
      setSourceFiles(allFiles);
      setFileBreakdown(breakdown);
      setFile(combinedFile);
      setCustomCropBox(null);
      setCropMode("auto");
      handleProcessPdf(combinedFile, combinedFile.name, "auto", null, false);
      triggerSkuExtraction(combinedFile);
    } catch (err) {
      console.error("Error processing PDFs:", err);
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

  return (
    <>
      {/* ── Main Content Form Container ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[66px] sm:pt-[76px] pb-6 sm:pb-10">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="flipkart-file-input"
        />
        {/* Hidden Append File Input */}
        <input
          ref={appendFileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleAppendFileChange}
          className="hidden"
          id="flipkart-append-file-input"
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
                      src="/flipkart_logo.svg"
                      alt="Flipkart Logo"
                      width={180}
                      height={60}
                      className="h-12 sm:h-14 w-auto object-contain"
                      priority
                    />
                    <h1 className="hidden md:block text-base sm:text-lg font-bold text-black md:mt-2">
                      Flipkart Label Cropper
                    </h1>
                  </div>

                  <p className="hidden md:block text-black text-sm leading-relaxed mb-4">
                    Crop Flipkart shipping labels automatically or select your own custom crop area interactively.
                  </p>
                </div>

                {/* Right Column: Crop Option Tabs & Big Drop Zone */}
                <div className="md:col-span-8 flex flex-col justify-center">
                  <div className="mb-3">

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleModeChange("auto")}
                        className={`p-2.5 rounded border text-left transition-all cursor-pointer flex items-center justify-between ${
                          cropMode === "auto"
                            ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-[#051448]/50"
                        }`}
                      >
                        <span className="text-sm sm:text-base font-normal text-black">
                          Standard Cut
                        </span>
                        {cropMode === "auto" && (
                          <Check size={16} className="text-[#051448] shrink-0" />
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
                        <span className="text-sm sm:text-base font-normal text-black">
                          Custom
                        </span>
                        {cropMode === "custom" && (
                          <Check size={16} className="text-[#051448] shrink-0" />
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
                    <p className="text-base sm:text-lg text-black/85 font-normal">
                      Upload Flipkart PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Active Workspace View: Compact, Scroll-Free with Menubar ── */
            <div className="flex flex-col">
              {/* 1. Sleek Top Toolbar / Menu Bar */}
              <div className="relative z-30 px-3 sm:px-4 py-2 bg-white border-b border-slate-300 rounded-t-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                {/* Row 1 on Mobile / Left on Desktop: Brand Logo + Mobile Action Tools */}
                <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Image
                      src="/flipkart_logo.svg"
                      alt="Flipkart"
                      width={110}
                      height={38}
                      className="h-6 sm:h-8 w-auto object-contain shrink-0"
                      priority
                    />
                    <div className="hidden sm:block h-5 w-px bg-slate-300 shrink-0" />
                  </div>

                  {/* Actions for Mobile (displayed in Row 1 next to logo) */}
                  <div className="flex sm:hidden items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => appendFileInputRef.current?.click()}
                      disabled={isCombining || isProcessing}
                      className="h-[28px] flex items-center gap-1 text-[11px] font-semibold text-[#051448] bg-blue-50/70 hover:bg-blue-100 border border-blue-200 px-2 rounded cursor-pointer transition-colors shadow-2xs shrink-0 disabled:opacity-50"
                      title="Add and merge more PDF files into this batch"
                    >
                      <Plus size={12} className="stroke-[2.5]" />
                      <span>Add PDF</span>
                    </button>

                    {cropMode === "custom" && (
                      <TooltipButton
                        icon={Crop}
                        label="Adjust Custom Area"
                        onClick={() => setShowCustomCropModal(true)}
                        active={!!customCropBox}
                      />
                    )}

                    <TooltipButton
                      icon={FileEdit}
                      label={customFileName ? `Renamed: ${customFileName}.pdf` : "Rename Output File"}
                      onClick={() => setShowRenameInput((prev) => !prev)}
                      active={showRenameInput || !!customFileName}
                    />

                    {cropResult && (
                      <TooltipButton
                        icon={Eye}
                        label="Preview Cropped PDF"
                        onClick={() => setShowPreviewModal(true)}
                        alignRight={true}
                      />
                    )}

                    {skuOrder.length < 2 && (
                      <button
                        type="button"
                        onClick={handleCropAndDownloadClick}
                        disabled={isProcessing || isExtractingSku}
                        className="h-[28px] flex items-center gap-1 bg-[#051448] hover:bg-[#071a5e] text-white text-[11px] font-medium px-2 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2 on Mobile / Center on Desktop: Segmented Cut Mode Controller */}
                <div className="w-full sm:w-auto flex items-center gap-1.5">
                  <span className="hidden md:inline text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Cut Mode:
                  </span>
                  <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center h-[34px] p-0.5 rounded-md border border-slate-300 bg-slate-100/80 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleModeChange("auto")}
                      className={`h-full px-2 sm:px-3 rounded flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                        cropMode === "auto"
                          ? "bg-[#051448] text-white shadow-xs"
                          : "text-slate-600 hover:text-black"
                      }`}
                      title="Standard Cut: Optimized Flipkart shipping label crop"
                    >
                      Standard Cut
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("custom")}
                      className={`h-full px-2 sm:px-3 rounded flex items-center justify-center text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                        cropMode === "custom"
                          ? "bg-[#051448] text-white shadow-xs"
                          : "text-slate-600 hover:text-black"
                      }`}
                      title="Custom: Interactive custom crop area"
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Right / Desktop Actions (hidden on mobile) */}
                <div className="hidden sm:flex items-center justify-end gap-1.5 sm:gap-2">
                  {/* Add More PDFs Button */}
                  <button
                    type="button"
                    onClick={() => appendFileInputRef.current?.click()}
                    disabled={isCombining || isProcessing}
                    className="h-[32px] flex items-center gap-1.5 text-xs font-semibold text-[#051448] bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 px-2.5 rounded-md cursor-pointer transition-colors shadow-2xs shrink-0 disabled:opacity-50"
                    title="Add and merge more PDF files into this batch"
                  >
                    <Plus size={13} className="stroke-[2.5]" />
                    <span>Add PDF</span>
                  </button>

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
                      disabled={isProcessing || isExtractingSku}
                      className="h-[34px] flex items-center gap-1.5 bg-[#051448] hover:bg-[#071a5e] text-white text-xs sm:text-sm font-medium px-4 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    >
                      <Download size={14} />
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
                <div className="min-h-[300px] sm:min-h-[360px] py-14 sm:py-20 px-4 sm:px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center gap-3">
                    {/* 1. Dynamic Status & Privacy Details (Upper Side, Regular Font Size) */}
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-base font-normal text-slate-700 min-h-[26px]">
                      <span
                        key={extractionStatusIndex}
                        className="animate-in fade-in duration-300 text-center font-normal line-clamp-2"
                      >
                        {SKU_PROCESSING_STATUS_STEPS[extractionStatusIndex]}
                      </span>
                    </div>

                    {/* 2. Simple Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      {skuProgress && skuProgress.total > 0 ? (
                        <div
                          className="h-full bg-[#051448] transition-all duration-200 rounded-full"
                          style={{
                            width: `${Math.max(5, Math.round((skuProgress.current / skuProgress.total) * 100))}%`,
                          }}
                        />
                      ) : (
                        <div className="h-full w-1/3 bg-[#051448] rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* 3. Label Processing Information After Progress Bar */}
                    <div className="flex items-center justify-between w-full text-xs sm:text-sm font-normal text-slate-600">
                      <span className="flex items-center gap-1.5 font-normal text-slate-700">
                        <Loader2 size={13} className="animate-spin text-[#051448]" />
                        <span>
                          {skuProgress && skuProgress.total > 0
                            ? `Analyzing label ${skuProgress.current} of ${skuProgress.total}`
                            : "Analyzing labels & detecting SKUs..."}
                        </span>
                      </span>
                      <span className="font-semibold text-[#051448]">
                        {skuProgress && skuProgress.total > 0
                          ? `${Math.round((skuProgress.current / skuProgress.total) * 100)}%`
                          : "Processing"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : skuOrder.length >= 2 ? (
                /* 2+ SKUs: Seamlessly integrated into main box with NO double borders or extra margins */
                <FlipkartSkuSorterPanel
                  file={file}
                  pageSkuMap={pageSkuMap}
                  skuOrder={skuOrder}
                  onSkuOrderChange={(newOrder) => setSkuOrder(newOrder)}
                  soldByName={
                    cropResult && "soldBy" in cropResult && cropResult.soldBy
                      ? cropResult.soldBy
                      : undefined
                  }
                  sourceFilesCount={sourceFiles.length || 1}
                  totalLabelsCount={cropResult?.pageCount || Object.keys(pageSkuMap).length}
                  fileBreakdown={fileBreakdown}
                  onDownloadComplete={() => {
                    handleReset();
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }}
                />
              ) : skuOrder.length === 1 && skuOrder[0] !== UNKNOWN_SKU ? (
                /* 1 SKU: Information bar + Compact Notification */
                <div className="flex flex-col">
                  {/* Information Bar strip */}
                  <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-300 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                        <Files size={12} className="text-[#051448]" />
                        <span>{sourceFiles.length || 1} {(sourceFiles.length || 1) === 1 ? "PDF" : "PDFs"}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#051448] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                        <FileText size={12} className="text-[#051448]" />
                        <span>{cropResult?.pageCount || Object.keys(pageSkuMap).length} Labels</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                        <Package size={12} className="text-slate-600" />
                        <span>1 SKU</span>
                      </span>
                    </div>
                  </div>
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
                </div>
              ) : (
                /* Fallback: No SKUs or Unknown (Single action crop & download) */
                <div className="flex flex-col">
                  {/* Information Bar strip */}
                  <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-300 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 px-2 py-0.5 rounded-full shadow-2xs">
                        <Files size={12} className="text-[#051448]" />
                        <span>{sourceFiles.length || 1} {(sourceFiles.length || 1) === 1 ? "PDF" : "PDFs"}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#051448] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                        <FileText size={12} className="text-[#051448]" />
                        <span>{cropResult?.pageCount || Object.keys(pageSkuMap).length} Labels</span>
                      </span>
                    </div>
                  </div>
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-center p-4">
                    <p className="font-bold text-xs text-black">Labels Ready for Standard Crop</p>
                    <p className="text-[11px] text-black/60 max-w-sm">
                      Labels are ready to crop and download according to the selected mode ({cropMode === "custom" ? "Custom Box" : "Standard Cut"}).
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
              <span>Free Flipkart Shipping Label Cropping Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              How to Crop Flipkart Shipping Labels for 4×6 Thermal Printing Online
            </h2>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4 text-justify">
              When selling on <strong>Flipkart Seller Hub</strong>, order labels and invoices are generated as full A4 PDFs. While full A4 pages work for standard laser printers, eCommerce sellers using <strong>4×6 thermal barcode printers</strong> face wasted paper margins, tiny unreadable barcodes, or tedious manual scissor cutting.
            </p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> automatically crops your Flipkart order PDFs into standard <strong>4×6 inch (100×150 mm) thermal labels</strong> for rapid warehouse picking and packaging. With 100% vector barcode fidelity, your Ekart, Shadowfax, and Delhivery barcodes will scan with lightning speed at courier pickup hubs.
            </p>
          </div>

          {/* Section 2: Key Features Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#051448]">
                Key Benefits of Using LabelCropOnline for Flipkart Sellers
              </h3>
              <p className="text-sm sm:text-base text-black/70 mt-1 text-justify sm:text-left">
                Optimized for fast order processing, high barcode accuracy, and zero paper wastage.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Feature 1 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  1
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">4×6&quot; Thermal Roll Ready</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Converts standard A4 invoices into standard 4×6 inch (100×150 mm) thermal labels compatible with TVS, TSC, Zebra, Rollo, and Xprinter.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">100% Vector Barcode Clarity</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Unlike screenshot or image-based tools, vector-level PDF cropping preserves crisp barcode lines and text for 100% first-pass scan rates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  3
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Fast Batch Processing</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Crop bulk Flipkart multi-page PDFs with 10, 50, or 200+ labels simultaneously in just a couple of seconds.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  4
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Custom Area Crop Studio</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Want to adjust margins or crop a specific sub-area? Use our visual 8-handle box selector to crop any custom dimensions freely.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  5
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Eliminate Scissor Cutting</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Stop manually cutting A4 printouts. Print directly on peel-and-stick thermal labels and apply straight to your dispatch boxes.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  6
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Private &amp; Secure In-Browser Processing</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Your PDF stays strictly on your computer. All rendering and cropping happen in your browser without cloud storage.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Step-by-Step Guide */}
          <div className="bg-slate-50 border border-[#051448]/20 rounded-md p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Step-by-Step: How to Crop &amp; Print Flipkart Labels on Thermal Printers
            </h3>
            <ol className="space-y-3.5 text-sm sm:text-base text-black/80">
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 1:</span>
                <span className="text-justify">
                  Log in to <strong>Flipkart Seller Hub</strong> → Go to <strong>Orders → Active Orders</strong>. Select your packed orders and click <strong>Generate Labels</strong> to download the PDF.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 2:</span>
                <span className="text-justify">
                  Upload the downloaded Flipkart PDF into the drop zone above.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 3:</span>
                <span className="text-justify">
                  Choose <strong>Standard Label Crop</strong> or click <strong>Custom Area</strong> to drag a custom bounding box if you want a specialized label area.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 4:</span>
                <span className="text-justify">
                  Click <strong>Preview</strong> to inspect pages or click <strong>Crop &amp; Download</strong> to save the optimized PDF.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">Step 5:</span>
                <span className="text-justify">
                  Open the cropped PDF in Adobe Acrobat or Chrome print dialog. Set <strong>Paper Size: 4×6 in (100×150 mm)</strong>, <strong>Margins: None</strong>, and print on your thermal roll.
                </span>
              </li>
            </ol>
          </div>

          {/* Section 4: Thermal Printer Settings & Tips */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Recommended Thermal Printer Settings for Flipkart Labels
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Print Dialog Settings</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside text-xs sm:text-sm">
                  <li><strong>Destination:</strong> Select your Thermal Printer (e.g. TSC DA210, Zebra ZD220, TVS LP 46 Neo)</li>
                  <li><strong>Paper Size:</strong> 4×6 inches / 100×150 mm / User Defined (4×6)</li>
                  <li><strong>Scale:</strong> Fit to Printable Area or 100%</li>
                  <li><strong>Margins:</strong> None / Zero</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Printer Driver Calibration</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside text-xs sm:text-sm">
                  <li><strong>Print Speed:</strong> 4 to 5 inches/second (ips) for sharp barcodes</li>
                  <li><strong>Darkness / Density:</strong> Level 10-14 for high-contrast scan readability</li>
                  <li><strong>Media Type:</strong> Direct Thermal / Label with Gaps</li>
                  <li><strong>Sensor:</strong> Transmissive / Gap Sensor</li>
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
                  Does this tool support Flipkart Smart and Flipkart Assured labels?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes. All standard order labels generated from Flipkart Seller Hub (including FBF, Flipkart Smart, and Standard Dropship orders) are fully supported.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Will Ekart Logistics and courier delivery agents be able to scan my labels?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, absolutely. Because LabelCropOnline preserves the underlying vector PDF coordinates, all Ekart barcodes, routing codes, and QR codes remain in ultra-crisp vector sharpness.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Is LabelCropOnline free for eCommerce sellers?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, LabelCropOnline is 100% free to use with no hidden fees, subscriptions, or daily cropping limits.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-black mb-1">
                  Do you store my customer shipping data on any server?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  No. We take seller data privacy seriously. All PDF parsing, visual adjustments, and cropping run entirely within your local web browser. No customer addresses or order information are ever uploaded or transmitted to our servers.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Related Tools Cross-Navigation Section ── */}
        <RelatedTools currentToolId="flipkart" />
      </div>

      {/* ── Interactive Custom Crop Area Selection Modal ── */}
      {file && (
        <CustomPdfCropModal
          isOpen={showCustomCropModal}
          onClose={() => setShowCustomCropModal(false)}
          file={file}
          onApplyCrop={handleApplyCustomCrop}
          title="Select Area to Crop (Flipkart PDF)"
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
                <span className="font-bold text-xs sm:text-sm text-black truncate">Flipkart Labels Preview</span>
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
                bytes={'pdfBytes' in cropResult ? cropResult.pdfBytes : undefined}
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
              {"soldBy" in cropResult && cropResult.soldBy && (
                <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-100 min-w-0">
                  <span className="text-black/60 shrink-0">Sold By:</span>
                  <span className="font-semibold text-xs text-right max-w-[200px] sm:max-w-[220px] break-all">{cropResult.soldBy.replace(/_/g, " ")}</span>
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
              <div className="flex justify-between py-1">
                <span className="text-black/60">Format:</span>
                <span className="font-semibold">Tight Rectangle Label (Vector)</span>
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
