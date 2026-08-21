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
  Sliders,
  CheckCircle2,
  Printer,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import {
  cropMeeshoPdf,
  triggerDownload,
  CropResult,
  MeeshoCropMode,
  MeeshoPartner,
  MEESHO_PARTNER_LIST,
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

export default function MeeshoTaxInvoiceCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState<MeeshoCropMode | "custom">("invoice");
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
    return fallbackName || cropResult?.fileName || "meesho_tax_invoice.pdf";
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
    const name = customName || (targetFile instanceof File ? targetFile.name : "meesho_invoice.pdf");

    if (!targetFile) {
      setErrorMsg("Please upload or select a Meesho invoice PDF first.");
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
        const standardMode: MeeshoCropMode = mode === "custom" ? "invoice" : mode;
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
      setCropMode("invoice");
    }
    await handleProcessPdf(selected, selected.name, "invoice", selectedPartner, null, false);
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
            <span>GST Tax Invoice &amp; Shipping Label Crop</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#051448] tracking-tight">
            Meesho Tax Invoice &amp; Shipping Label Cropper
          </h1>
          <p className="text-xs sm:text-sm text-black/75 mt-1 max-w-2xl text-justify sm:text-left">
            Crop and extract Meesho <strong>GST Tax Invoices</strong> and shipping labels with complete interstate compliance. Preserves HSN codes, GSTIN numbers, SKU packing tables, and courier barcodes without white border wastage.
          </p>
        </div>

        {/* ── Main Tool Workspace Card ── */}
        <div className="bg-white border border-[#051448]/20 rounded-md p-4 sm:p-6 shadow-sm">

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />

          <div className="grid lg:grid-cols-12 gap-5 items-start">

            {/* Left Upload Zone */}
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
                    if (cropMode === "custom") setCropMode("invoice");
                    await handleProcessPdf(dropped, dropped.name, "invoice", selectedPartner, null, false);
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
                  {file ? file.name : "Upload Meesho Invoice PDF"}
                </h3>
                <p className="text-xs text-black/60 mb-3">
                  {file
                    ? `${formatFileSize(file.size)} • Click or drop another PDF to replace`
                    : "Supports all single and batch Meesho tax invoice PDF documents"}
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
                  Choose PDF
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
                  <X size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Right Crop Options */}
            <div className="lg:col-span-5 space-y-4">

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

              <div>
                <label className="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">
                  Crop Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                      Compact sticker only
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom File Name */}
              {file && (
                <div className="pt-2 border-t border-[#051448]/15 flex flex-wrap items-center gap-2">
                  <label htmlFor="tax-filename-input" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 max-w-md flex items-center">
                    <input
                      id="tax-filename-input"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder={cropResult ? cropResult.fileName.replace(/\.pdf$/i, "") : "meesho_tax_invoice"}
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

              {/* Actions */}
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
                        Crop the Invoice
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
                    Ready: <strong className="text-black uppercase">{cropMode === "custom" ? "Custom Selected Area" : "Full with Tax Invoice"}</strong>
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

        {/* ── Informative SEO & Guide Section ── */}
        <div className="mt-10 sm:mt-14 space-y-8 sm:space-y-12 text-black">

          {/* Section 1: Overview */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-5 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span>GST &amp; Interstate Invoicing Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#051448] mb-3">
              Crop Meesho Invoices with Full GST Compliance &amp; SKU Details
            </h2>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed mb-4 text-justify">
              Under Indian GST regulations and interstate e-way bill requirements, orders exceeding specific thresholds or traveling interstate must carry an accompanying <strong>Tax Invoice</strong> showing seller GSTIN, customer address, HSN codes, IGST/CGST rates, and invoice numbers.
            </p>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed text-justify">
              The <strong>With Tax Invoice</strong> mode of <strong>LabelCropOnline</strong> precisely extracts both the top shipping label and the bottom GST Tax Invoice into an optimal proportion for thermal sticker and packing slip envelopes, removing extraneous blank margins while retaining complete tax integrity.
            </p>
          </div>

          {/* Section 2: Key Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
              <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                <FileCheck size={16} />
              </div>
              <h4 className="font-bold text-sm text-black mb-1.5">Full GST Audit Trail</h4>
              <p className="text-xs text-black/75 leading-relaxed text-justify">
                Preserves all legal tax invoice line items, tax breakdown matrices, seller details, and HSN codes without truncation.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
              <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                <Printer size={16} />
              </div>
              <h4 className="font-bold text-sm text-black mb-1.5">Zero Paper Wastage</h4>
              <p className="text-xs text-black/75 leading-relaxed text-justify">
                Eliminates the top and bottom white header/footer gaps, reducing thermal roll paper consumption by over 60%.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
              <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                <ShieldCheck size={16} />
              </div>
              <h4 className="font-bold text-sm text-black mb-1.5">100% In-Browser Privacy</h4>
              <p className="text-xs text-black/75 leading-relaxed text-justify">
                Invoices containing customer phone numbers and GST credentials are never sent to remote servers; all processing is client-side.
              </p>
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
          title="Custom Crop Area (Meesho Invoice)"
          initialCropBox={customCropBox || undefined}
        />
      )}

      {/* ── Preview Modal ── */}
      {showPreviewModal && cropResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#051448] bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-black">Meesho Tax Invoice Preview</span>
                <span className="text-[10px] sm:text-xs bg-blue-100 text-[#051448] border border-[#051448]/20 px-2 py-0.5 rounded font-semibold">
                  {cropResult.pageCount} Page{cropResult.pageCount > 1 ? "s" : ""}
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
