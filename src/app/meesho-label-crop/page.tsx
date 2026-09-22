// Server Component — no "use client" directive.
// All static content (h1, SEO sections, FAQs) is SSR-rendered → fast LCP.
// The interactive PDF tool is loaded as a separate client bundle → low TBT.

import Image from "next/image";
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meesho Shipping Label Crop – Bulk PDF Label Cropper for Sellers",
  description:
    "Crop Meesho Supplier Panel shipping label PDFs to 4x6 inch thermal printer format. Auto-detects Delhivery, Shadowfax, Valmo, Xpressbees couriers. 100% free, browser-based, no upload needed.",
  keywords: [
    "meesho label crop",
    "meesho shipping label cropper",
    "crop meesho label",
    "meesho supplier panel label pdf",
    "meesho 4x6 thermal label",
    "meesho order label crop online",
    "meesho label resize",
    "bulk meesho label crop",
    "meesho barcode label crop",
    "meesho delhivery label crop",
    "meesho shadowfax label crop",
    "meesho valmo label crop",
    "meesho xpressbees label crop",
    "meesho label 100x150",
    "meesho thermal printer label",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/meesho-label-crop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/meesho-label-crop",
    siteName: "LabelCropOnline",
    title: "Meesho Shipping Label Crop – Free Bulk PDF Cropper for Sellers",
    description:
      "Crop Meesho shipping labels from A4 PDF to 4x6 thermal format instantly. Auto-detects Delhivery, Shadowfax, Valmo, Xpressbees. 100% browser-based.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Meesho Label Crop Tool – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meesho Shipping Label Crop – Free Online PDF Cropper",
    description:
      "Bulk crop Meesho supplier label PDFs to 4x6 thermal format. Auto-detects couriers. Free, instant, browser-based.",
    images: ["/og-image.png"],
    creator: "@labelcroponline",
  },
};

import { MeeshoToolWrapper } from "./MeeshoToolWrapper";

export default function MeeshoLabelCropPage() {
  return (
    <>
      {/* ── Client Tool: lazy-loaded via wrapper, keeps heavy PDF libs out of initial bundle ── */}
      <MeeshoToolWrapper />

      {/* ── SEO & User Information Blog / Guide Section (server-rendered static HTML) ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pb-10 sm:pb-16">
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
    </>
  );
}
