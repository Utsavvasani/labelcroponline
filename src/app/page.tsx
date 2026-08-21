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
    desc: "Handle Meesho shipping label PDFs with ease. Crop, resize, and organise labels from your supplier panel with clean border margins and automated Courier & SKU sorting for fast dispatching.",
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
    desc: "Process Flipkart seller hub shipping labels in bulk. Extract the shipping label cleanly, strip extra margins, and download 4x6 print-ready files instantly with 100% vector barcode fidelity.",
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
              In the competitive world of Indian eCommerce, operational speed and cost efficiency are critical. When fulfilling customer orders on major marketplaces like <strong>Meesho Supplier Panel</strong> and <strong>Flipkart Seller Hub</strong>, sellers receive shipping labels generated as standard A4 PDFs. However, standard A4 invoices are not designed for modern 4×6 inch (100×150 mm) direct thermal roll printers.
            </p>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> bridges this gap by providing an intelligent, vector-lossless PDF cropping platform. Our technology strips away unnecessary page borders, formats labels precisely for 4×6 thermal rolls, and automatically reorders multi-page batch labels by <strong>Delivery Partner and Product SKU</strong> so warehouse teams can pack and dispatch orders faster than ever.
            </p>
          </div>

          {/* Key Advantages Grid */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h3 className="text-xl font-bold text-[#051448]">
                Why eCommerce Sellers &amp; Warehouses Use LabelCropOnline
              </h3>
              <p className="text-xs text-black/70 mt-1 text-justify sm:text-left">
                Built specifically to solve real packing bottleneck problems for online merchants across India.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Save Up to 70% Paper Cost</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Stop printing full A4 pages where only 30% of the space contains the shipping label. Cropping directly to 4×6 thermal rolls eliminates wasted margins and saves thousands in monthly stationary expenses.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Zero Barcode Scanning Failures</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Unlike basic screenshot tools or image croppers that blur text and barcodes, LabelCropOnline retains 100% pure vector PDF geometry. Barcodes scan instantly with 100% first-pass accuracy at courier transit hubs.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Batch Sort by Courier &amp; SKU</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  For Meesho dispatches, our engine automatically groups orders by delivery partner (Delhivery, Shadowfax, Valmo, Valmo Plus, Xpressbees) and sub-sorts by product SKU, slashing batch picking time by up to 50%.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Eliminate Manual Scissor Cutting</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Say goodbye to tedious manual cutting of paper sheets with scissors or craft knives. Print directly on self-adhesive peel-and-stick thermal stickers and apply straight to packages.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  5
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">Interactive Custom Area Studio</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Need non-standard crop coordinates? Use our visual canvas crop studio with 8-directional drag handles to customize your crop boundary on any PDF and apply it across all pages instantly.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded bg-[#051448] text-white flex items-center justify-center font-bold text-sm mb-3">
                  6
                </div>
                <h4 className="font-bold text-sm text-black mb-1.5">100% Client-Side Privacy</h4>
                <p className="text-xs text-black/75 leading-relaxed text-justify">
                  Your business data and customer addresses are strictly private. All PDF parsing and cropping operations execute directly in your browser sandbox without ever uploading files to external servers.
                </p>
              </div>
            </div>
          </div>

          {/* Thermal Printer Compatibility Guide */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-[#051448] mb-3">
              Universal Thermal Printer Compatibility
            </h3>
            <p className="text-xs sm:text-sm text-black/80 leading-relaxed mb-4 text-justify">
              Cropped shipping labels generated by LabelCropOnline adhere to standard 4×6 inch (100×150 mm) dimensions and are universally compatible with all popular barcode thermal printers used in India, including:
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <strong className="block text-black mb-1">TSC Printers</strong>
                <p className="text-black/75 text-justify">TSC DA210, DA220, TE244, TDP-244, TE210, TE344</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <strong className="block text-black mb-1">Zebra &amp; TVS Printers</strong>
                <p className="text-black/75 text-justify">Zebra ZD220, ZD230, GT800, TVS LP 46 Neo, LP 46 Plus</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <strong className="block text-black mb-1">Rollo &amp; Xprinter</strong>
                <p className="text-black/75 text-justify">Rollo Commercial, Xprinter XP-420B, XP-470B, Everycom</p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Workflow */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-[#051448] mb-4">
              How to Crop &amp; Print Shipping Labels in 4 Simple Steps
            </h3>
            <ol className="space-y-4 text-xs sm:text-sm text-black/80">
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">1.</span>
                <p className="text-justify">
                  <strong>Download Invoices:</strong> Download pending order labels or invoices in PDF format from your seller portal (Meesho Supplier Panel, Flipkart Seller Hub, etc.).
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">2.</span>
                <p className="text-justify">
                  <strong>Select Tool &amp; Upload:</strong> Choose the dedicated marketplace tool above (Meesho, Flipkart, or Merge PDF) and upload your file into the drag-and-drop zone.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">3.</span>
                <p className="text-justify">
                  <strong>Select Crop Mode:</strong> Pick your required format (Full with Tax Invoice, Label + SKU, or Custom Crop Area). Multi-page files are processed and sorted automatically.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#051448] shrink-0">4.</span>
                <p className="text-justify">
                  <strong>Preview &amp; Print:</strong> Inspect your cropped file in the interactive zoomable preview modal and click Download to print directly on your 4×6 thermal rolls.
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
