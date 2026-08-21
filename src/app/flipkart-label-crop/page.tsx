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
  FileCheck,
  Crop,
  Check,
} from "lucide-react";
import dynamic from "next/dynamic";
import { cropFlipkartPdf, triggerDownload, CropResult } from "@/lib/pdf/flipkartCropper";
import { cropPdfCustomArea, CustomCropBox, CustomCropResult } from "@/lib/pdf/customCropper";

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

export default function FlipkartLabelCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<FlipkartCropMode>("auto");
  const [customCropBox, setCustomCropBox] = useState<CustomCropBox | null>(null);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [cropResult, setCropResult] = useState<CropResult | CustomCropResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showCustomCropModal, setShowCustomCropModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        triggerDownload(result.blobUrl, getFinalFileName(result.fileName));
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
    if (file) {
      handleProcessPdf(file, file.name, "custom", appliedBox, false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type !== "application/pdf" &&
        !selectedFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setErrorMsg("Please select a valid PDF file.");
        return;
      }
      setFile(selectedFile);
      setCropResult(null);
      setErrorMsg(null);

      if (cropMode === "custom") {
        setShowCustomCropModal(true);
      } else {
        handleProcessPdf(selectedFile, selectedFile.name, "auto", null, false);
      }
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
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type !== "application/pdf" &&
        !droppedFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setErrorMsg("Please drop a valid PDF file.");
        return;
      }
      setFile(droppedFile);
      setCropResult(null);
      setErrorMsg(null);

      if (cropMode === "custom") {
        setShowCustomCropModal(true);
      } else {
        handleProcessPdf(droppedFile, droppedFile.name, "auto", null, false);
      }
    }
  };

  const handleCropAndDownloadClick = () => {
    if (cropResult) {
      triggerDownload(cropResult.blobUrl, getFinalFileName(cropResult.fileName));
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

  const handleReset = () => {
    setFile(null);
    if (cropResult?.blobUrl) {
      URL.revokeObjectURL(cropResult.blobUrl);
    }
    setCropResult(null);
    setCustomCropBox(null);
    setCustomFileName("");
    setCropMode("auto");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="flipkart-file-input"
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

        {/* ── Main Single Card Form matching Contact Us Style ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-center">

            {/* ── Left Column: Compact on Mobile, Detailed on Desktop ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">

              {/* Logo & Title */}
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <Image
                  src="/flipkart_logo.svg"
                  alt="Flipkart Logo"
                  width={140}
                  height={48}
                  className="h-9 sm:h-11 w-auto object-contain"
                  priority
                />
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-2">
                  Flipkart Label Cropper
                </h1>
              </div>

              <p className="text-black/75 text-xs leading-relaxed mb-1 hidden sm:block">
                Crop Flipkart shipping labels automatically or select your own custom crop area interactively.
              </p>
            </div>

            {/* ── Right Column: Mode Selector, Upload & Actions ── */}
            <div className="md:col-span-8 flex flex-col justify-center">

              {/* Crop Mode Selection Tabs */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider">
                    Crop Option:
                  </span>
                  {cropResult && (
                    <span className="text-[11px] font-semibold text-[#051448] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""} Ready
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: Standard Auto Crop */}
                  <button
                    type="button"
                    onClick={() => handleModeChange("auto")}
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-md border text-center sm:text-left transition-all cursor-pointer ${
                      cropMode === "auto"
                        ? "border-[#051448] bg-[#051448] text-white shadow-sm"
                        : "border-[#051448]/30 bg-white text-black hover:border-[#051448]"
                    }`}
                  >
                    <div
                      className={`hidden sm:flex mt-0.5 w-3.5 h-3.5 rounded-full border items-center justify-center shrink-0 ${
                        cropMode === "auto"
                          ? "border-white bg-white text-[#051448]"
                          : "border-black/40 bg-white"
                      }`}
                    >
                      {cropMode === "auto" && <Check size={9} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold leading-tight">Standard Crop</div>
                      <div
                        className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 hidden sm:block ${
                          cropMode === "auto" ? "text-white/80" : "text-black/60"
                        }`}
                      >
                        Auto Flipkart Label Box
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Custom Area Crop */}
                  <button
                    type="button"
                    onClick={() => handleModeChange("custom")}
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-md border text-center sm:text-left transition-all cursor-pointer ${
                      cropMode === "custom"
                        ? "border-[#051448] bg-[#051448] text-white shadow-sm"
                        : "border-[#051448]/30 bg-white text-black hover:border-[#051448]"
                    }`}
                  >
                    <div
                      className={`hidden sm:flex mt-0.5 w-3.5 h-3.5 rounded-full border items-center justify-center shrink-0 ${
                        cropMode === "custom"
                          ? "border-white bg-white text-[#051448]"
                          : "border-black/40 bg-white"
                      }`}
                    >
                      {cropMode === "custom" && <Check size={9} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold leading-tight flex items-center gap-1">
                        <Crop size={11} />
                        Custom Crop
                      </div>
                      <div
                        className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 hidden sm:block ${
                          cropMode === "custom" ? "text-white/80" : "text-black/60"
                        }`}
                      >
                        {customCropBox ? "Area Selected (Click to change)" : "Select Area in PDF"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Drop / Select Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-[#051448] rounded-md p-4 sm:p-6 text-center cursor-pointer transition-colors bg-white hover:bg-blue-50/40 ${
                  isDragging ? "bg-blue-50/80 border-dashed" : ""
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

                <p className="text-xs sm:text-sm font-bold text-black mb-0.5 truncate max-w-xs sm:max-w-md mx-auto">
                  {file ? file.name : "Click to select or drop Flipkart PDF"}
                </p>
                <p className="text-[10px] sm:text-xs text-black/60">
                  {file ? "PDF loaded • Ready to crop & download" : "Single or bulk multi-page order PDF"}
                </p>
              </div>

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20">
                  <label htmlFor="flipkart-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 max-w-md flex items-center">
                    <input
                      id="flipkart-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={cropResult ? cropResult.fileName.replace(/\.pdf$/i, "") : "custom_filename"}
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">

                {/* Left side actions: Crop / Download button */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCropAndDownloadClick}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Processing...
                      </>
                    ) : cropResult ? (
                      <>
                        <Download size={15} />
                        Crop &amp; Download
                      </>
                    ) : (
                      <>
                        <Scissors size={15} />
                        Crop the Label
                      </>
                    )}
                  </button>

                  {/* Customize Area Button if file uploaded */}
                  {file && (
                    <button
                      type="button"
                      onClick={() => setShowCustomCropModal(true)}
                      className="text-xs font-semibold text-black border border-[#051448] px-2.5 py-2 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Select custom area to crop"
                    >
                      <Crop size={13} className="text-[#051448]" />
                      <span>{customCropBox ? "Adjust Area" : "Custom Area"}</span>
                    </button>
                  )}

                  {file && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-black border border-[#051448] px-2.5 py-2 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Upload a different PDF"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  )}
                </div>

                {/* Right side utility icons: Eye (Preview) & Info (Metadata) */}
                {cropResult && (
                  <div className="flex items-center gap-2">
                    {/* Eye Icon for Preview */}
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Preview Cropped PDF"
                    >
                      <Eye size={14} className="text-[#051448]" />
                      <span>Preview</span>
                    </button>

                    {/* Info Icon for Metadata */}
                    <button
                      type="button"
                      onClick={() => setShowMetaModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-black border border-[#051448] px-3 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                      title="View PDF Metadata"
                    >
                      <Info size={14} className="text-[#051448]" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Note */}
              {cropResult && (
                <div className="mt-3 pt-2.5 border-t border-[#051448]/15 text-[11px] sm:text-xs text-black/75 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    Ready: <strong className="text-black uppercase">{cropMode === "custom" ? "Custom Selected Area" : "Standard Label Crop"}</strong>
                    {"skuSummaryText" in cropResult && cropResult.skuSummaryText && (
                      <span className="text-black/60 ml-1.5 hidden sm:inline">
                        • Sorted by SKU: {cropResult.skuSummaryText}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-black">
                    {cropResult.pageCount} Page(s) • {formatFileSize(cropResult.croppedSize)}
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── SEO & User Information Blog / Guide Section ── */}
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12 text-black">

          {/* Section 1: Overview & Value Proposition */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span>Free Flipkart Shipping Label Cropping Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              How to Crop Flipkart Shipping Labels for 4×6 Thermal Printing Online
            </h2>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed mb-4 text-justify">
              When selling on <strong>Flipkart Seller Hub</strong>, order labels and invoices are generated as full A4 PDFs. While full A4 pages work for standard laser printers, eCommerce sellers using <strong>4×6 thermal barcode printers</strong> face wasted paper margins, tiny unreadable barcodes, or tedious manual scissor cutting.
            </p>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> automatically crops your Flipkart order PDFs into standard <strong>4×6 inch (100×150 mm) thermal labels</strong> and sorts multi-page labels by <strong>Product SKU</strong> for rapid warehouse picking and packaging. With 100% vector barcode fidelity, your Ekart, Shadowfax, and Delhivery barcodes will scan with lightning speed at courier pickup hubs.
            </p>
          </div>

          {/* Section 2: Key Features Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#051448]">
                Key Benefits of Using LabelCropOnline for Flipkart Sellers
              </h3>
              <p className="text-xs text-black/70 mt-1 text-justify sm:text-left">
                Optimized for fast order processing, high barcode accuracy, and zero paper wastage.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Feature 1 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Auto Sort by Product SKU</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Automatically extracts and sorts multi-page batch labels alphabetically by SKU / FSN, reducing product picking time and packing errors.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">100% Vector Barcode Clarity</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Unlike screenshot or image-based tools, vector-level PDF cropping preserves crisp barcode lines and text for 100% first-pass scan rates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Fast Batch Processing</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Crop bulk Flipkart multi-page PDFs with 10, 50, or 200+ labels simultaneously in just a couple of seconds.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Custom Area Crop Studio</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Want to adjust margins or crop a specific sub-area? Use our visual 8-handle box selector to crop any custom dimensions freely.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  5
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Eliminate Scissor Cutting</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Stop manually cutting A4 printouts. Print directly on peel-and-stick thermal labels and apply straight to your dispatch boxes.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  6
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Private &amp; Secure In-Browser Processing</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
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
            <ol className="space-y-3.5 text-xs sm:text-sm text-black/80">
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
            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Print Dialog Settings</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside">
                  <li><strong>Destination:</strong> Select your Thermal Printer (e.g. TSC DA210, Zebra ZD220, TVS LP 46 Neo)</li>
                  <li><strong>Paper Size:</strong> 4×6 inches / 100×150 mm / User Defined (4×6)</li>
                  <li><strong>Scale:</strong> Fit to Printable Area or 100%</li>
                  <li><strong>Margins:</strong> None / Zero</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Printer Driver Calibration</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside">
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
            <div className="space-y-4 text-xs sm:text-sm">
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
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-black">Flipkart Labels Preview</span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold">
                  {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""} • Sorted by SKU
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(cropResult.blobUrl, getFinalFileName(cropResult.fileName))}
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
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Output File:</span>
                <span className="font-semibold text-xs truncate max-w-[200px]">{getFinalFileName(cropResult.fileName)}</span>
              </div>
              {"skuSummaryText" in cropResult && cropResult.skuSummaryText && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-black/60">SKUs Sorted:</span>
                  <span className="font-semibold text-xs text-right max-w-[220px]">{cropResult.skuSummaryText}</span>
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
