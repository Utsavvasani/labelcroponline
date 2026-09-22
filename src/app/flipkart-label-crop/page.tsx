// Server Component — no "use client" directive.
// All static content (h1, SEO sections, FAQs) is SSR-rendered → fast LCP.
// The interactive PDF tool is loaded as a separate client bundle → low TBT.

import Image from "next/image";
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flipkart Shipping Label Crop – Bulk PDF Label Cropper for Sellers",
  description:
    "Crop Flipkart Seller Hub shipping label PDFs to 4x6 inch thermal printer format. Bulk process all orders instantly in your browser. 100% free, no upload, barcode-safe vector PDF cropping.",
  keywords: [
    "flipkart label crop",
    "flipkart shipping label cropper",
    "crop flipkart label",
    "flipkart seller label pdf",
    "flipkart 4x6 thermal label",
    "flipkart order label crop online",
    "flipkart seller hub label pdf crop",
    "bulk flipkart label crop",
    "flipkart barcode label crop",
    "flipkart label resize",
    "flipkart shipping label download",
    "flipkart label 100x150",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/flipkart-label-crop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/flipkart-label-crop",
    siteName: "LabelCropOnline",
    title: "Flipkart Label Crop – Free Bulk PDF Shipping Label Cropper",
    description:
      "Crop Flipkart Seller Hub shipping labels to 4×6 thermal format. Bulk process multi-page PDFs instantly. Free, browser-based, barcode-safe.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Flipkart Label Crop – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flipkart Label Crop – Free Thermal Label Cropper",
    description:
      "Crop Flipkart shipping labels to 4×6 thermal format. Bulk process PDFs in your browser. 100% free.",
    images: ["/og-image.png"],
  },
};

import { FlipkartToolWrapper } from "./FlipkartToolWrapper";

export default function FlipkartLabelCropPage() {
  return (
    <>
      {/* ── Client Tool: lazy-loaded via wrapper, keeps heavy PDF libs out of initial bundle ── */}
      <FlipkartToolWrapper />

      {/* ── SEO & User Information Guide Section (server-rendered static HTML) ── */}
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pb-10 sm:pb-16">
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
      </div>
    </>
  );
}
