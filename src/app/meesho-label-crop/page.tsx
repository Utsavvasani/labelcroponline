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

export default function MeeshoLabelCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [cropMode, setCropMode] = useState<ExtendedMeeshoCropMode>("invoice");
  const [customCropBox, setCustomCropBox] = useState<CustomCropBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropResult, setCropResult] = useState<CropResult | CustomCropResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showCustomCropModal, setShowCustomCropModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        triggerDownload(result.blobUrl, result.fileName);
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
        handleProcessPdf(selectedFile, selectedFile.name, cropMode, null, false);
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
        handleProcessPdf(droppedFile, droppedFile.name, cropMode, null, false);
      }
    }
  };

  const handleCropAndDownloadClick = () => {
    if (cropResult) {
      triggerDownload(cropResult.blobUrl, cropResult.fileName);
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
    setCropMode("invoice");
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

  const getActiveModeName = () => {
    if (cropMode === "custom") return "Custom Selected Area";
    return MEESHO_CROP_OPTIONS[cropMode]?.name || "Meesho Label";
  };

  return (
    <>
      {/* ── Main Content Form Container (Proper spacing below fixed navigation bar) ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="meesho-file-input"
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

              <p className="text-black/75 text-xs leading-relaxed mb-1 hidden sm:block">
                Crop Meesho shipping labels with clean border margins, auto delivery partner sorting, or select your own custom area.
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

                <div className="grid grid-cols-3 gap-2">

                  {/* Option 1: Full with Tax Invoice */}
                  <button
                    type="button"
                    onClick={() => handleModeChange("invoice")}
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-md border text-center sm:text-left transition-all cursor-pointer ${
                      cropMode === "invoice"
                        ? "border-[#051448] bg-[#051448] text-white shadow-sm"
                        : "border-[#051448]/30 bg-white text-black hover:border-[#051448]"
                    }`}
                  >
                    <div
                      className={`hidden sm:flex mt-0.5 w-3.5 h-3.5 rounded-full border items-center justify-center shrink-0 ${
                        cropMode === "invoice"
                          ? "border-white bg-white text-[#051448]"
                          : "border-black/40 bg-white"
                      }`}
                    >
                      {cropMode === "invoice" && <Check size={9} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold leading-tight">Full with Tax</div>
                      <div
                        className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 hidden sm:block ${
                          cropMode === "invoice" ? "text-white/80" : "text-black/60"
                        }`}
                      >
                        Label + Tax Invoice
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Label + SKU */}
                  <button
                    type="button"
                    onClick={() => handleModeChange("label_sku")}
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 p-2 sm:p-2.5 rounded-md border text-center sm:text-left transition-all cursor-pointer ${
                      cropMode === "label_sku"
                        ? "border-[#051448] bg-[#051448] text-white shadow-sm"
                        : "border-[#051448]/30 bg-white text-black hover:border-[#051448]"
                    }`}
                  >
                    <div
                      className={`hidden sm:flex mt-0.5 w-3.5 h-3.5 rounded-full border items-center justify-center shrink-0 ${
                        cropMode === "label_sku"
                          ? "border-white bg-white text-[#051448]"
                          : "border-black/40 bg-white"
                      }`}
                    >
                      {cropMode === "label_sku" && <Check size={9} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs font-bold leading-tight">Label + SKU</div>
                      <div
                        className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 hidden sm:block ${
                          cropMode === "label_sku" ? "text-white/80" : "text-black/60"
                        }`}
                      >
                        Label + SKU Details
                      </div>
                    </div>
                  </button>

                  {/* Option 3: Custom Area Crop */}
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
                        {customCropBox ? "Area Selected" : "Select Area in PDF"}
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
                  {file ? file.name : "Click to select or drop Meesho PDF"}
                </p>
                <p className="text-[10px] sm:text-xs text-black/60">
                  {file ? "PDF loaded • Ready to crop & download" : "Single or bulk multi-page order PDF"}
                </p>
              </div>

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
                    Ready: <strong className="text-black uppercase">{getActiveModeName()}</strong>
                    {cropResult.partnerSummaryText && (
                      <span className="text-black/60 ml-1.5 hidden sm:inline">
                        • Sorted by Partner: {cropResult.partnerSummaryText}
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
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-black">
                  Meesho ({getActiveModeName()})
                </span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold">
                  {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(cropResult.blobUrl, cropResult.fileName)}
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
                <span className="font-semibold text-xs truncate max-w-[200px]">{cropResult.fileName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Crop Option:</span>
                <span className="font-semibold capitalize">{getActiveModeName()}</span>
              </div>
              {cropResult.partnerSummaryText && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-black/60">Sorted Order:</span>
                  <span className="font-semibold text-xs text-right max-w-[220px]">{cropResult.partnerSummaryText}</span>
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
