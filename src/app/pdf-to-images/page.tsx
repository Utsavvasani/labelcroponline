"use client";

import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  RotateCcw,
  Info,
  Loader2,
  X,
  Image as ImageIcon,
  Check,
  FileCheck,
  ZoomIn,
} from "lucide-react";
import {
  convertPdfToImages,
  buildImagesZip,
  getPdfImageInfo,
  ConvertedImage,
  ImageFormat,
  ImageDpi,
} from "@/lib/pdf/pdfToImages";
import { triggerDownload } from "@/lib/pdf/mergePdf";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

const FORMAT_OPTIONS: { id: ImageFormat; label: string; desc: string }[] = [
  { id: "png", label: "PNG (Lossless)", desc: "Best for text & barcodes" },
  { id: "jpeg", label: "JPEG (Compact)", desc: "Smaller file size" },
];

const DPI_OPTIONS: { id: ImageDpi; label: string; desc: string }[] = [
  { id: 150, label: "150 DPI (Standard)", desc: "Balanced web quality" },
  { id: 300, label: "300 DPI (HD Print)", desc: "High-resolution clarity" },
  { id: 72, label: "72 DPI (Screen)", desc: "Fast & lightweight" },
];

export default function PdfToImagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [format, setFormat] = useState<ImageFormat>("png");
  const [dpi, setDpi] = useState<ImageDpi>(150);
  const [pagesStr, setPagesStr] = useState("all");
  const [customFileName, setCustomFileName] = useState("");

  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.blobUrl));
    };
  }, [images]);

  const handleReset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.blobUrl));
    setFile(null);
    setPageCount(0);
    setImages([]);
    setCustomFileName("");
    setErrorMsg(null);
    setPreviewSrc(null);
    setShowMetaModal(false);
    setProgress(0);
    setProgressTotal(0);
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [images]);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setImages([]);
    setIsProcessing(true);

    try {
      const ab = await f.arrayBuffer();
      arrayBufferRef.current = ab;
      const pc = await getPdfImageInfo(ab);
      setPageCount(pc);
    } catch (err: unknown) {
      console.error("Error reading PDF:", err);
      setErrorMsg("Failed to read the PDF file.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConvert = async () => {
    if (!arrayBufferRef.current) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setProgress(0);
    setProgressTotal(0);

    try {
      const res = await convertPdfToImages(
        arrayBufferRef.current,
        { format, dpi, pagesStr },
        customFileName || file?.name,
        (d, t) => {
          setProgress(d);
          setProgressTotal(t);
        }
      );
      setImages(res);
    } catch (err: unknown) {
      console.error("Error converting PDF to images:", err);
      setErrorMsg("Failed to convert PDF pages to images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZipAndReset = async () => {
    if (images.length === 0) return;
    try {
      const zip = await buildImagesZip(images, customFileName || file?.name || "images");
      triggerDownload(zip.blobUrl, zip.fileName);
      handleReset();
    } catch (err: unknown) {
      console.error("Error creating ZIP:", err);
      setErrorMsg("Failed to download image ZIP.");
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

  const hasResult = images.length > 0;

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[96px] sm:pt-32 pb-6 sm:pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="images-file-input"
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

        {/* ── Main Card Form ── */}
        <div className="border border-[#051448] rounded-md p-4 sm:p-7 bg-white shadow-sm">
          <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-start">
            {/* ── Left Column: Tool Info ── */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#051448]/20 pb-4 md:pb-0 md:pr-6">
              <div className="flex items-center md:flex-col gap-3 md:gap-0 mb-2 md:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-[#051448]/20 flex items-center justify-center text-[#051448] shadow-xs">
                  <ImageIcon size={34} />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-black md:mt-3">
                  Convert PDF to Images
                </h1>
              </div>

              <p className="text-black/75 text-xs leading-relaxed mb-4 hidden sm:block">
                Render every PDF page into sharp PNG or JPEG files. Choose resolution up to 300 DPI and download all images in one ZIP archive.
              </p>

              {file && (
                <div className="w-full bg-slate-50 border border-[#051448]/20 rounded-md p-3 mb-3 text-xs text-black/80 space-y-1 hidden sm:block">
                  <div className="flex justify-between">
                    <span>File:</span>
                    <strong className="truncate max-w-[130px]">{file.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pages:</span>
                    <strong>{pageCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <strong>{format.toUpperCase()} · {dpi} DPI</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#051448] border border-[#051448] px-3.5 py-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <UploadCloud size={14} />
                {file ? "Change PDF" : "Choose PDF"}
              </button>
            </div>

            {/* ── Right Column: Options & Dropzone ── */}
            <div className="md:col-span-8 flex flex-col justify-center">
              {/* Image Format & DPI Tabs */}
              <div className="mb-3.5 space-y-2.5">
                {/* Format selection */}
                <div>
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider block mb-1">
                    Image Format:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMAT_OPTIONS.map((f) => {
                      const isChecked = format === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormat(f.id)}
                          className={`p-2 rounded border text-left transition-all cursor-pointer ${
                            isChecked
                              ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                              : "border-slate-300 bg-white hover:border-[#051448]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs text-black leading-tight">
                              {f.label}
                            </span>
                            {isChecked && <Check size={13} className="text-[#051448] shrink-0" />}
                          </div>
                          <p className="text-[10px] text-black/70 leading-tight">{f.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DPI selection */}
                <div>
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider block mb-1">
                    Resolution (DPI):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {DPI_OPTIONS.map((d) => {
                      const isChecked = dpi === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDpi(d.id)}
                          className={`p-2 rounded border text-left transition-all cursor-pointer ${
                            isChecked
                              ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                              : "border-slate-300 bg-white hover:border-[#051448]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs text-black leading-tight truncate">
                              {d.label}
                            </span>
                            {isChecked && <Check size={13} className="text-[#051448] shrink-0" />}
                          </div>
                          <p className="text-[10px] text-black/70 leading-tight truncate">{d.desc}</p>
                        </button>
                      );
                    })}
                  </div>
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
                    ? `${pageCount} page(s) loaded • Ready to convert to ${format.toUpperCase()}`
                    : "Converts vector pages to high-fidelity images"}
                </p>
              </div>

              {/* Optional Custom File Name Input */}
              {file && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 bg-slate-50 p-2.5 rounded border border-[#051448]/20 min-w-0">
                  <label htmlFor="images-filename" className="text-xs font-bold text-black shrink-0">
                    File Name:
                  </label>
                  <div className="relative flex-1 min-w-0 max-w-md flex items-center">
                    <input
                      id="images-filename"
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="images_archive"
                      className="w-full text-xs bg-white border border-[#051448]/30 rounded px-2.5 py-1.5 pr-10 focus:outline-hidden focus:border-[#051448] text-black font-medium truncate"
                    />
                    <span className="absolute right-2.5 text-[11px] text-black/50 font-mono pointer-events-none select-none">
                      .zip
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

              {/* Action Buttons & Status Row */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#051448]/15">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={hasResult ? handleDownloadZipAndReset : handleConvert}
                    disabled={!file || isProcessing}
                    className="flex items-center justify-center gap-1.5 bg-[#051448] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        {progressTotal > 0
                          ? `Rendering (${progress}/${progressTotal})...`
                          : "Converting..."}
                      </>
                    ) : hasResult ? (
                      <>
                        <Download size={15} />
                        Download Images ZIP ({images.length})
                      </>
                    ) : (
                      <>
                        <ImageIcon size={15} />
                        Convert to {format.toUpperCase()}
                      </>
                    )}
                  </button>

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

                {hasResult && (
                  <div className="flex items-center gap-2">
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
              {hasResult && (
                <div className="mt-3 p-2.5 bg-blue-50 border border-[#051448]/20 rounded text-[11px] sm:text-xs text-black/80 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-[#051448]">
                    <Check size={14} />
                    Rendered {images.length} images successfully!
                  </span>
                  <span className="font-semibold text-black">
                    {format.toUpperCase()} · {dpi} DPI
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Thumbnail Gallery Grid ── */}
          {images.length > 0 && !isProcessing && (
            <div className="mt-6 border-t border-[#051448]/20 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-black">
                  Image Gallery ({images.length} pages):
                </span>
                <span className="text-[11px] text-black/50">Click to enlarge or save individual page</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {images.map((img) => (
                  <div key={img.pageIndex} className="group relative border border-slate-200 rounded p-1 bg-slate-50 flex flex-col items-center">
                    <div
                      className="relative w-full aspect-[3/4] overflow-hidden rounded cursor-pointer bg-white"
                      onClick={() => setPreviewSrc(img.blobUrl)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.blobUrl}
                        alt={img.label}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn size={18} className="text-white drop-shadow" />
                      </div>
                    </div>
                    <div className="w-full mt-1.5 flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-black">{img.label}</span>
                      <button
                        type="button"
                        onClick={() => triggerDownload(img.blobUrl, img.fileName)}
                        className="text-[10px] text-[#051448] hover:underline font-semibold cursor-pointer"
                        title="Download single image"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Enlarge Image Modal ── */}
      {previewSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="Enlarged Preview"
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setPreviewSrc(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* ── Details Modal ── */}
      {showMetaModal && hasResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#051448] rounded-md w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#051448]/20 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#051448]" />
                <h3 className="font-bold text-base text-black">Image Conversion Details</h3>
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
                <span className="text-black/60">Total Images:</span>
                <span className="font-semibold">{images.length} pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Format:</span>
                <span className="font-semibold">{format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-black/60">Resolution:</span>
                <span className="font-semibold">{dpi} DPI</span>
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
