"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Upload,
  Download,
  Eye,
  Scissors,
  FileText,
  HelpCircle,
  X,
  Loader2,
  RefreshCw,
  Edit3,
  Sliders,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  cropMeeshoPdf,
  triggerDownload,
  CropResult,
  MeeshoCropMode,
  MeeshoPartner,
  MEESHO_PARTNER_LIST,
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
        <span className="text-xs font-semibold">Rendering PDF Preview...</span>
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

export default function MeeshoThermalLabelCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<MeeshoCropMode | "custom">("label_sku");
  const [selectedPartner, setSelectedPartner] = useState<MeeshoPartner>("auto");
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
    return fallbackName || cropResult?.fileName || "meesho_thermal_4x6_label.pdf";
  };

  useEffect(() => {
    return () => {
      if (cropResult?.blobUrl) URL.revokeObjectURL(cropResult.blobUrl);
    };
  }, [cropResult]);

  const handleProcessPdf = async (
    inputFile?: File | Blob,
    customName?: string,
    mode: MeeshoCropMode | "custom" = cropMode,
    partner: MeeshoPartner = selectedPartner,
    activeCustomBox: CustomCropBox | null = customCropBox,
    shouldDownload: boolean = false
  ) => {
    const targetFile = inputFile || file;
    const name = customName || (targetFile instanceof File ? targetFile.name : "meesho_order.pdf");

    if (!targetFile) {
      setErrorMsg("Please upload or select a Meesho order PDF first.");
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
        const standardMode: MeeshoCropMode = mode === "custom" ? "label_sku" : mode;
        result = await cropMeeshoPdf(targetFile, name, standardMode, partner);
      }

      setCropResult(result);

      if (shouldDownload) {
        triggerDownload(result.blobUrl, getFinalFileName(result.fileName));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process Meesho PDF. Please ensure it is a valid PDF.";
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF document.");
      return;
    }

    setFile(selected);
    setCustomCropBox(null);
    if (cropMode === "custom") {
      setCropMode("label_sku");
    }
    await handleProcessPdf(selected, selected.name, "label_sku", selectedPartner, null, false);
  };

  const handleCropModeChange = async (newMode: MeeshoCropMode) => {
    setCropMode(newMode);
    setCustomCropBox(null);
    if (file) {
      await handleProcessPdf(file, file.name, newMode, selectedPartner, null, false);
    }
  };

  const handlePartnerChange = async (newPartner: MeeshoPartner) => {
    setSelectedPartner(newPartner);
    if (file) {
      await handleProcessPdf(file, file.name, cropMode, newPartner, customCropBox, false);
    }
  };

  const handleApplyCustomCrop = async (cropBox: CustomCropBox) => {
    setCustomCropBox(cropBox);
    setCropMode("custom");
    setShowCustomCropModal(false);
    if (file) {
      await handleProcessPdf(file, file.name, "custom", selectedPartner, cropBox, false);
    }
  };

  const handleCropAndDownloadClick = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    if (cropResult) {
      triggerDownload(cropResult.blobUrl, getFinalFileName(cropResult.fileName));
    } else {
      await handleProcessPdf(file, file.name, cropMode, selectedPartner, customCropBox, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-black pt-20 sm:pt-24 pb-12 px-3 sm:px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Top Header ── */}
        <div className="text-center sm:text-left mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-[#580a46]/10 text-[#580a46] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <span>Meesho 4×6 Thermal Roll Specialist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#051448] tracking-tight">
            Meesho 4×6 Thermal Label Crop &amp; Print Tool
          </h1>
          <p className="text-xs sm:text-sm text-black/75 mt-1 max-w-2xl text-justify sm:text-left">
            Instantly convert full-page Meesho supplier invoices into print-ready <strong>4×6 inch (100×150 mm) thermal labels</strong>. Auto-detects couriers (Delhivery, Shadowfax, Valmo, Xpressbees) and produces crisp vector barcodes.
          </p>
        </div>

        {/* ── Main Tool Workspace Card ── */}
        <div className="bg-white border border-[#051448]/20 rounded-md p-4 sm:p-6 shadow-sm">

          {/* Hidden Native File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />

          {/* ── Layout: Left Upload Area & Right Mode Selection ── */}
          <div className="grid lg:grid-cols-12 gap-5 items-start">

            {/* Left Upload Zone (7 Cols) */}
            <div className="lg:col-span-7">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped && dropped.type === "application/pdf") {
                    setFile(dropped);
                    setCustomCropBox(null);
                    if (cropMode === "custom") setCropMode("label_sku");
                    await handleProcessPdf(dropped, dropped.name, "label_sku", selectedPartner, null, false);
                  }
                }}
                className={`border-2 border-dashed rounded-md p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-[#051448] bg-blue-50/20"
                    : "border-[#051448]/30 hover:border-[#051448] bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#051448]/10 text-[#051448] flex items-center justify-center mb-3">
                  <Upload size={22} />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-black mb-1">
                  {file ? file.name : "Select or Drop Meesho PDF Here"}
                </h3>
                <p className="text-xs text-black/60 mb-3">
                  {file
                    ? `${formatFileSize(file.size)} • Click or drop another PDF to replace`
                    : "Supports all Meesho single & multi-page bulk supplier invoices"}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#051448] px-4 py-2 rounded hover:bg-[#071a5e] transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  Choose File
                </button>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
                  <X size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Crop Options & Partner Selection (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">

              {/* Partner Auto-Detect Selector */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Courier Calibration
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => handlePartnerChange(e.target.value as MeeshoPartner)}
                  className="w-full text-xs bg-white border border-[#051448]/30 rounded px-3 py-2 text-black font-semibold focus:outline-hidden focus:border-[#051448]"
                >
                  {MEESHO_PARTNER_LIST.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Crop Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCropModeChange("label_sku")}
                    className={`text-left p-2.5 rounded border transition-all cursor-pointer ${
                      cropMode === "label_sku"
                        ? "border-[#051448] bg-blue-50/50 text-[#051448] font-bold shadow-xs"
                        : "border-[#051448]/20 bg-white text-black hover:border-[#051448]/40"
                    }`}
                  >
                    <div className="text-xs font-bold">Label + SKU</div>
                    <div className="text-[10px] text-black/65 mt-0.5 leading-tight">
                      Compact 4×6 sticker
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCropModeChange("invoice")}
                    className={`text-left p-2.5 rounded border transition-all cursor-pointer ${
                      cropMode === "invoice"
                        ? "border-[#051448] bg-blue-50/50 text-[#051448] font-bold shadow-xs"
                        : "border-[#051448]/20 bg-white text-black hover:border-[#051448]/40"
                    }`}
                  >
                    <div className="text-xs font-bold">With Tax Invoice</div>
                    <div className="text-[10px] text-black/65 mt-0.5 leading-tight">
                      Full label + GST tax invoice
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom File Name Input */}
              {file && (
                <div className="pt-2 border-t border-[#051448]/15 flex flex-wrap items-center gap-2">
                  <label htmlFor="filename-input" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 max-w-md flex items-center">
                    <input
                      id="filename-input"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={cropResult ? cropResult.fileName.replace(/\.pdf$/i, "") : "meesho_4x6_label"}
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
                      Reset
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
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

                  {file && (
                    <button
                      type="button"
                      onClick={() => setShowCustomCropModal(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#051448] bg-slate-100 hover:bg-slate-200 border border-[#051448]/20 px-3 py-2.5 rounded transition-colors cursor-pointer"
                    >
                      <Sliders size={13} />
                      Custom Area
                    </button>
                  )}
                </div>

                {cropResult && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-black border border-[#051448]/20 transition-colors cursor-pointer"
                      title="Preview Cropped PDF"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMetaModal(true)}
                      className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-black border border-[#051448]/20 transition-colors cursor-pointer"
                      title="File Details"
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Note */}
              {cropResult && (
                <div className="mt-3 pt-2.5 border-t border-[#051448]/15 text-[11px] sm:text-xs text-black/75 flex flex-wrap items-center justify-between gap-1">
                  <span>
                    Ready: <strong className="text-black uppercase">{cropMode === "custom" ? "Custom Selected Area" : "4×6 Thermal Label"}</strong>
                    {"partnerSummaryText" in cropResult && cropResult.partnerSummaryText && (
                      <span className="text-black/60 ml-1.5 hidden sm:inline">
                        • Couriers: {cropResult.partnerSummaryText}
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

        {/* ── SEO & Informative Thermal Printing Guide Section ── */}
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12 text-black">

          {/* Section 1: Overview */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span>Thermal Printing Guide &amp; Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              How to Crop &amp; Print Meesho Labels on 4×6 Thermal Printers Online
            </h2>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed mb-4 text-justify">
              Direct thermal label printing is the gold standard for high-velocity eCommerce dispatches. Standard Meesho seller invoices are generated as <strong>full A4 PDFs (595 × 842 pt)</strong>, forcing sellers with 4×6 thermal printers (100×150 mm) to either waste expensive thermal sticker paper or manually cut labels with scissors.
            </p>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> automatically detects every courier partner (Delhivery, Shadowfax, Valmo, Valmo Plus, Xpressbees) in your Meesho PDF batch and crops the exact 4×6 label area with <strong>100% vector barcode fidelity</strong>. The cropped PDF sends clean, crisp instructions directly to your thermal print head for instant first-pass barcode scanning.
            </p>
          </div>

          {/* Section 2: Features Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#051448]">
                Key Advantages of 4×6 Thermal Cropping for Meesho Sellers
              </h3>
              <p className="text-xs text-black/70 mt-1 text-justify sm:text-left">
                Engineered to maximize warehouse dispatch speed, eliminate paper waste, and prevent courier return delays.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  <Printer size={16} />
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Universal 4×6 Thermal Compatibility</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Seamlessly prints on all standard 4×6 inch (100×150 mm) thermal printers including TSC DA210, Zebra ZD220, TVS LP 46 Neo, Rollo, and Xprinter.
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  <Zap size={16} />
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">100% Vector Barcode Sharpness</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Direct coordinate-level cropping without bitmap downsampling ensures barcodes, tracking numbers, and routing codes scan on the very first try.
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Courier-Specific Calibration</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Automatically accommodates slight coordinate offsets across Delhivery, Shadowfax, Valmo, Valmo Plus, and Xpressbees labels page-by-page.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Printer Settings */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#051448] mb-4">
              Recommended Thermal Printer Settings for Meesho 4×6 Labels
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Print Dialog Setup</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside">
                  <li><strong>Destination:</strong> Select your 4×6 Thermal Barcode Printer</li>
                  <li><strong>Paper Size:</strong> 4×6 in / 100×150 mm / User Defined</li>
                  <li><strong>Scale:</strong> Fit to Printable Area or 100%</li>
                  <li><strong>Margins:</strong> None / Zero</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-black mb-1">Driver Calibration</h4>
                <ul className="space-y-1.5 text-black/75 list-disc list-inside">
                  <li><strong>Print Speed:</strong> 4 to 5 inches per second (ips)</li>
                  <li><strong>Darkness / Density:</strong> Level 10 to 12</li>
                  <li><strong>Media Type:</strong> Direct Thermal / Label with Gaps</li>
                  <li><strong>Sensor Type:</strong> Gap / Transmissive Sensor</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Interactive Custom Crop Modal ── */}
      {file && (
        <CustomPdfCropModal
          isOpen={showCustomCropModal}
          onClose={() => setShowCustomCropModal(false)}
          file={file}
          onApplyCrop={handleApplyCustomCrop}
          title="Custom Crop Area (Meesho PDF)"
          initialCropBox={customCropBox || undefined}
        />
      )}

      {/* ── Preview Modal ── */}
      {showPreviewModal && cropResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-black">Meesho 4×6 Preview</span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold">
                  {cropResult.pageCount} Label{cropResult.pageCount > 1 ? "s" : ""}
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

      {/* ── File Details Modal ── */}
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
              {"partnerSummaryText" in cropResult && cropResult.partnerSummaryText && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-black/60">Couriers Detected:</span>
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
          </div>
        </div>
      )}

    </div>
  );
}
