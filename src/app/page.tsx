import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop Shipping Labels Online - Free Ecommerce PDF Label Cropper",
  description:
    "Crop and resize PDF shipping labels for Meesho, Flipkart, and merge multi-page PDF documents for 4x6 thermal printers and A4 sheets. Free, fast, and secure.",
  keywords: [
    "label cropper",
    "crop shipping labels",
    "flipkart label crop",
    "meesho label crop",
    "merge pdf",
    "combine pdf files",
    "thermal printer label crop",
    "4x6 label crop",
    "ecommerce label resize",
  ],
  openGraph: {
    title: "Crop Shipping Labels Online - Free Ecommerce PDF Cropper",
    description:
      "Instant, lossless shipping label cropping and PDF merging for ecommerce sellers. Works directly in your browser.",
    type: "website",
    url: "https://labelcroponline.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop Shipping Labels Online - LabelCropOnline",
    description:
      "Instant, lossless shipping label cropping and PDF merging for ecommerce sellers.",
  },
};

const heroPlatforms = [
  {
    name: "Meesho",
    logo: "/meesho_logo.svg",
    href: "/meesho-label-crop",
    logoH: "h-[30px]",
    lightBg: "#F7EEFE",
    tagText: "Meesho Labels",
  },
  {
    name: "Flipkart",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    logoH: "h-9",
    lightBg: "#EEF4FF",
    tagText: "Flipkart Labels",
  },
  {
    name: "Merge PDF",
    logo: "/merge_icon.svg",
    href: "/merge-pdf",
    logoH: "h-12",
    lightBg: "#fef7f7ff",
    tagText: "Merge PDFs",
  },
];

const cardPlatforms = [
  {
    name: "Meesho",
    logo: "/meesho_logo.svg",
    href: "/meesho-label-crop",
    color: "#580a46",
    lightBg: "#F7EEFE",
    logoClass: "h-9 w-auto",
    desc: "Handle Meesho shipping label PDFs with ease. Crop, resize, and organise labels from your supplier panel with clean border margins and courier auto-detection for fast dispatching.",
    tag: "Meesho Label Crop",
    cta: "Crop Meesho Labels →",
  },
  {
    name: "Flipkart",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    color: "#007cd7",
    lightBg: "#EEF4FF",
    logoClass: "h-11 w-auto",
    desc: "Process Flipkart seller hub shipping labels in bulk. Extract the shipping label cleanly, sort multi-page orders by SKU, and download 4x6 print-ready files instantly with 100% vector barcode fidelity.",
    tag: "Flipkart Label Crop",
    cta: "Crop Flipkart Labels →",
  },
  {
    name: "Merge PDF",
    logo: "/merge_icon.svg",
    href: "/merge-pdf",
    color: "#B42024",
    lightBg: "#fef5f5ff",
    logoClass: "h-14 w-auto",
    desc: "Combine multiple shipping labels, packing slips, or document PDFs into one single file. Easily reorder files by position number and download immediately with zero quality loss.",
    tag: "PDF Merge Tool",
    cta: "Merge PDF Files →",
  },
];

export default function Home() {
  return (
    <>
      {/* ─── Hero ─── */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: Text + Platform Banners ── */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">
                Crop Shipping Labels
                <br />
                <span className="text-[#051448]">in Seconds</span>
              </h1>

              <p className="text-black text-sm sm:text-base leading-relaxed mb-8 max-w-md text-justify">
                Upload your PDF shipping labels, crop, resize, or merge instantly — built specifically for eCommerce sellers and warehouse dispatchers to eliminate manual cutting and paper waste.
              </p>

              {/* Mobile: stacked horizontal cards */}
              <div className="flex flex-col gap-2.5 sm:hidden mb-8">
                {heroPlatforms.map((p) => (
                  <Link
                    key={p.name}
                    href={p.href}
                    className="flex items-stretch border border-[#051448] rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                  >
                    {/* Part 1: Logo — fixed width, brand bg */}
                    <div
                      className="w-28 flex-shrink-0 flex items-center justify-center px-3 py-3"
                      style={{ backgroundColor: p.lightBg }}
                    >
                      <Image
                        src={p.logo}
                        alt={`${p.name} Tool`}
                        width={100}
                        height={40}
                        className="object-contain w-full h-8"
                      />
                    </div>
                    {/* Part 2: Text — remaining width, white bg */}
                    <div className="flex-1 flex items-center justify-between px-4 py-3 bg-white">
                      <span className="text-[#051448] text-sm font-semibold">
                        {p.tagText}
                      </span>
                      <span className="text-[#051448]/40 text-xs ml-2">→</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: 3 equal cards */}
              <div className="hidden sm:grid grid-cols-3 gap-3 mb-8">
                {heroPlatforms.map((p) => (
                  <Link
                    key={p.name}
                    href={p.href}
                    className="group flex flex-col items-center justify-center gap-2 border border-[#051448] rounded-xl py-4 px-3 transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: p.lightBg }}
                  >
                    <Image
                      src={p.logo}
                      alt={`${p.name} Tool`}
                      width={120}
                      height={48}
                      className={`object-contain w-auto ${p.logoH}`}
                    />
                    <span className="text-[#051448] text-[10px] font-medium">
                      {p.tagText}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right: Simple SEO Text Paragraph ── */}
            <div>
              <p className="text-black text-sm sm:text-base leading-relaxed text-justify">
                LabelCropOnline is a free, fast, and secure online tool designed for ecommerce sellers and warehouse teams to crop, resize, split, and bulk-process shipping labels from Meesho Supplier Panel and Flipkart Seller Hub, or merge multiple PDFs into one unified document. Convert multi-page PDF orders into print-ready 4x6 inch thermal printer labels or A4 sheets instantly in your browser without software installation or signup.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Platform Cards Section ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 py-16">

          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-black mb-2">
              How It Works
            </p>
            <h2 className="text-3xl font-bold text-black">
              Pick your tool, process your files
            </h2>
            <p className="text-black text-sm mt-3 max-w-lg mx-auto leading-relaxed text-justify">
              Whether you sell on Meesho or Flipkart, or need to merge multiple PDF documents — our tools are built for speed and precision. Crop unwanted margins, organize dispatches, and print directly on 4x6 thermal paper.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {cardPlatforms.map((p) => (
              <Link
                key={p.name}
                href={p.href}
                className="group block border border-[#051448] rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {/* Logo area — fixed h-32 so all 3 cards are identical */}
                <div
                  className="flex items-center justify-center h-32"
                  style={{ backgroundColor: p.lightBg }}
                >
                  <Image
                    src={p.logo}
                    alt={`${p.name} Tool`}
                    width={160}
                    height={60}
                    className={`object-contain ${p.logoClass}`}
                  />
                </div>

                {/* Text area */}
                <div className="p-6 bg-white">
                  <span
                    className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                    style={{ backgroundColor: p.lightBg, color: p.color }}
                  >
                    {p.tag}
                  </span>
                  <p className="text-black text-sm leading-relaxed text-justify">
                    {p.desc}
                  </p>
                  <p
                    className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                    style={{ color: p.color }}
                  >
                    {p.cta}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Detailed Home Information & SEO Guide Blog Section ─── */}
      <div className="bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-12 text-black">

          {/* Guide Header Banner */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span>Ultimate Shipping Label Cropper &amp; Printing Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#051448] mb-4">
              Complete Guide to Online Shipping Label Cropping &amp; Thermal Printing for eCommerce
            </h2>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed mb-4 text-justify">
              In the fast-paced world of Indian eCommerce, operational speed and cost efficiency are critical. When fulfilling customer orders on major marketplaces like <strong>Meesho Supplier Panel</strong> and <strong>Flipkart Seller Hub</strong>, sellers receive shipping labels generated as standard A4 PDFs. However, standard A4 invoices are not designed for modern 4×6 inch (100×150 mm) direct thermal roll printers.
            </p>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> bridges this gap by providing an intelligent, vector-lossless PDF cropping platform. Our technology strips away unnecessary page borders, formats labels precisely for 4×6 thermal rolls, and preserves 100% vector barcode clarity so warehouse teams can pack and dispatch orders faster than ever.
            </p>
          </div>

          {/* ── Key Advantages Grid ── */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#051448]">
                Why Online Sellers Rely on LabelCropOnline
              </h2>
              <p className="text-xs text-black/70 mt-1 text-justify sm:text-left">
                Purpose-built to streamline warehouse order dispatching and eliminate paper wastage.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Saves up to 70% Paper Costs</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Converts standard full-page A4 PDFs into standard 4×6 inch (100×150 mm) labels, fitting perfectly on direct thermal rolls without expensive white waste margins.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Zero Barcode Scanning Failures</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Unlike basic screenshot tools, LabelCropOnline retains 100% pure vector PDF geometry. Barcodes scan instantly with 100% first-pass accuracy at courier hubs.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Universal Courier Calibration</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Intelligently detects logistics partners including Delhivery, Shadowfax, Valmo, Valmo Plus, and Xpressbees, applying precise crop margins for every label in multi-page PDFs.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Eliminate Manual Cutting</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Say goodbye to scissors and knives. Print directly on self-adhesive thermal stickers and apply straight to your packages.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  5
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Interactive Crop Studio</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Need specific adjustments? Use our visual canvas with 8-directional drag handles to define custom crop boundaries that apply instantly across all pages.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  6
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">100% Privacy Guaranteed</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  All PDF parsing and cropping operations execute directly in your browser. No files are ever uploaded or stored on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Workflow */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-[#051448] mb-4">
              How to Crop &amp; Print Labels in 4 Simple Steps
            </h3>
            <ol className="space-y-4 text-xs sm:text-sm text-black/80">
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">1.</span>
                <p className="text-justify">
                  <strong>Download Invoices:</strong> Download pending order labels or invoices in PDF format from your marketplace seller portal.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">2.</span>
                <p className="text-justify">
                  <strong>Select Tool &amp; Upload:</strong> Choose the dedicated tool above (Meesho, Flipkart, or Merge PDF) and drop your file into the secure workspace.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">3.</span>
                <p className="text-justify">
                  <strong>Select Crop Mode:</strong> Pick your required format (Full with Tax Invoice, Label Only, or Custom). Multi-page files are processed and optimized automatically.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">4.</span>
                <p className="text-justify">
                  <strong>Preview &amp; Print:</strong> Inspect your cropped file in the interactive zoomable preview and click Download to print directly on your 4×6 thermal rolls.
                </p>
              </li>
            </ol>
          </div>

          {/* Homepage FAQs */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-[#051448] mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Is LabelCropOnline free to use?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, LabelCropOnline is 100% free with no hidden charges, watermarks, or daily file restrictions.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  How does cropping save money on thermal printing?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Standard A4 PDFs contain large empty white margins and unneeded footer space. By cropping only the relevant shipping label and tax details to 4×6 inches, you print 1 label per thermal sticker rather than wasting full A4 adhesive sheets.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-black mb-1">
                  Can I crop multi-page bulk orders at once?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes. Whether you have 5 orders or a bulk PDF with 500+ order pages, our engine processes the entire file in seconds while keeping the pages organized and cleanly aligned.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-black mb-1">
                  Are my customer details and order files kept private?
                </h4>
                <p className="text-black/75 leading-relaxed text-justify">
                  Yes, completely. All PDF parsing, coordinate cropping, reordering, and previews run 100% inside your browser using client-side WebAssembly and JavaScript. No files or personal data are ever uploaded to any server.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
