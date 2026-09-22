import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  Layers,
  Split,
  Minimize2,
  RotateCw,
  Image as ImageIcon,
  ArrowRight,
  Star,
  Sliders,
  Scissors,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Shipping Label Cropper for Meesho & Flipkart – PDF Tools Online",
  description:
    "Crop Meesho & Flipkart shipping labels for 4x6 thermal printers. Free browser-based PDF tools: merge, split, compress, rotate, convert PDF to images. No signup, 100% private.",
  keywords: [
    "meesho label crop",
    "flipkart label crop",
    "crop shipping labels online free",
    "4x6 thermal label crop",
    "meesho supplier panel label crop",
    "flipkart seller hub label crop",
    "merge pdf free",
    "split pdf online",
    "compress pdf size",
    "rotate pdf pages",
    "pdf to png converter",
    "ecommerce label tool india",
    "online shipping label crop tool",
    "labelcroponline",
  ],
  alternates: { canonical: "https://www.labelcroponline.com" },
  openGraph: {
    title: "Free Shipping Label Cropper for Meesho & Flipkart – PDF Tools Online",
    description:
      "Crop Meesho & Flipkart shipping labels for 4x6 thermal printers. Merge, split, compress, rotate PDFs free in your browser. No signup required.",
    type: "website",
    url: "https://www.labelcroponline.com",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "LabelCropOnline – Shipping Label & PDF Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Shipping Label Cropper – Meesho & Flipkart",
    description:
      "Crop Meesho & Flipkart shipping labels for 4x6 thermal printing. Free PDF merge, split, compress & more.",
    images: ["/labelcroponline1.png"],
  },
};

// JSON-LD structured data
function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.labelcroponline.com/#website",
        "url": "https://www.labelcroponline.com",
        "name": "LabelCropOnline",
        "description": "Free shipping label cropper and PDF tools for Meesho, Flipkart, and Amazon sellers",
        "publisher": { "@id": "https://www.labelcroponline.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": "https://www.labelcroponline.com/?q={search_term_string}" },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.labelcroponline.com/#organization",
        "name": "LabelCropOnline",
        "url": "https://www.labelcroponline.com",
        "logo": { "@type": "ImageObject", "url": "https://www.labelcroponline.com/labelcroponline.svg" },
        "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://www.labelcroponline.com/contact-us" }
      },
      {
        "@type": "SoftwareApplication",
        "name": "LabelCropOnline",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com",
        "description": "Free browser-based shipping label cropper and PDF suite for Indian eCommerce sellers on Meesho, Flipkart and Amazon.",
        "featureList": [
          "Meesho label crop for 4x6 thermal printers",
          "Flipkart label crop with courier auto-detection",
          "PDF merge, split, compress, rotate online",
          "PDF to PNG/JPEG image converter",
          "Rating card studio for seller review inserts"
        ]
      },
      {
        "@type": "ItemList",
        "name": "LabelCropOnline PDF Tools",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Meesho Label Crop", "url": "https://www.labelcroponline.com/meesho-label-crop" },
          { "@type": "ListItem", "position": 2, "name": "Flipkart Label Crop", "url": "https://www.labelcroponline.com/flipkart-label-crop" },
          { "@type": "ListItem", "position": 3, "name": "Merge PDF", "url": "https://www.labelcroponline.com/merge-pdf" },
          { "@type": "ListItem", "position": 4, "name": "Split PDF", "url": "https://www.labelcroponline.com/split-pdf" },
          { "@type": "ListItem", "position": 5, "name": "Compress PDF", "url": "https://www.labelcroponline.com/compress-pdf" },
          { "@type": "ListItem", "position": 6, "name": "Rotate PDF", "url": "https://www.labelcroponline.com/rotate-pdf" },
          { "@type": "ListItem", "position": 7, "name": "PDF to Images", "url": "https://www.labelcroponline.com/pdf-to-images" },
          { "@type": "ListItem", "position": 8, "name": "Custom Crop Studio", "url": "https://www.labelcroponline.com/custom-crop" },
          { "@type": "ListItem", "position": 9, "name": "Rating Card Studio", "url": "https://www.labelcroponline.com/rating-card" }
        ]
      }
    ]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const heroPlatforms = [
  {
    name: "Meesho",
    logo: "/meesho_logo.svg",
    href: "/meesho-label-crop",
    logoH: "h-[28px]",
    lightBg: "#F7EEFE",
    tagText: "Meesho Labels",
  },
  {
    name: "Flipkart",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    logoH: "h-8",
    lightBg: "#EEF4FF",
    tagText: "Flipkart Labels",
  },
  {
    name: "Custom Crop",
    href: "/custom-crop",
    icon: Sliders,
    lightBg: "#F0F4FF",
    tagText: "Custom Crop",
  },
  {
    name: "Rating Cards",
    href: "/rating-card",
    icon: Star,
    lightBg: "#FEF9C3",
    tagText: "Rating Cards",
  },
  {
    name: "Merge PDF",
    logo: "/merge_icon.svg",
    href: "/merge-pdf",
    logoH: "h-10",
    lightBg: "#fef7f7ff",
    tagText: "Merge PDFs",
  },
  {
    name: "Split PDF",
    href: "/split-pdf",
    icon: Split,
    lightBg: "#F1F5F9",
    tagText: "Split PDFs",
  },
];

const sellerTools = [
  {
    name: "Meesho Label Crop",
    logo: "/meesho_logo.svg",
    href: "/meesho-label-crop",
    color: "#580a46",
    lightBg: "#F7EEFE",
    logoClass: "h-9 w-auto",
    desc: "Crop Meesho multi-page shipping labels & tax invoices to 4x6 thermal paper. Auto-detects couriers (Delhivery, Shadowfax, Valmo, Xpressbees) with 100% barcode fidelity.",
    tag: "Meesho Supplier Panel",
    cta: "Crop Meesho Labels →",
  },
  {
    name: "Flipkart Label Crop",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    color: "#007cd7",
    lightBg: "#EEF4FF",
    logoClass: "h-11 w-auto",
    desc: "Bulk crop Flipkart Seller Hub shipping labels cleanly to 4x6 thermal format. Strips unneeded invoice tables and margins for rapid dispatching.",
    tag: "Flipkart Seller Hub",
    cta: "Crop Flipkart Labels →",
  },
  {
    name: "Custom Crop Studio",
    icon: Sliders,
    href: "/custom-crop",
    color: "#051448",
    lightBg: "#F0F4FF",
    desc: "Interactive visual crop selector with draggable bounding box handles. Define custom dimensions on page 1 and crop all pages in multi-page PDFs simultaneously.",
    tag: "Visual Crop Selector",
    cta: "Launch Crop Studio →",
  },
  {
    name: "Rating Card Studio",
    icon: Star,
    href: "/rating-card",
    color: "#b45309",
    lightBg: "#FEF9C3",
    desc: "Design and print 5-star customer review insert cards with QR codes for your parcel dispatches. Boost ratings on Meesho, Flipkart, and Amazon.",
    tag: "Seller Review Booster",
    cta: "Design Review Cards →",
  },
];

const pdfTools = [
  {
    name: "Merge PDF",
    logo: "/merge_icon.svg",
    href: "/merge-pdf",
    color: "#B42024",
    lightBg: "#fef5f5ff",
    logoClass: "h-14 w-auto",
    desc: "Combine multiple shipping labels or document PDFs into one unified file. Easily reorder files and download immediately with zero quality loss.",
    tag: "Combine Documents",
    cta: "Merge PDF Files →",
  },
  {
    name: "Split PDF",
    icon: Split,
    href: "/split-pdf",
    color: "#051448",
    lightBg: "#F1F5F9",
    desc: "Extract pages or separate multi-page PDF documents into individual files or ZIP archives with custom page range controls.",
    tag: "Extract & Separate",
    cta: "Split PDF Pages →",
  },
  {
    name: "Compress PDF",
    icon: Minimize2,
    href: "/compress-pdf",
    color: "#047857",
    lightBg: "#ECFDF5",
    desc: "Reduce PDF document file size with lossless optimization in your browser. Perfect for email attachments and portal upload limits.",
    tag: "Reduce File Size",
    cta: "Compress PDF Now →",
  },
  {
    name: "Rotate PDF",
    icon: RotateCw,
    href: "/rotate-pdf",
    color: "#6D28D9",
    lightBg: "#F5F3FF",
    desc: "Rotate all or specific PDF pages 90°, 180°, or 270° with interactive thumbnail preview. Fix upside-down shipping labels in seconds.",
    tag: "Orientation Fix",
    cta: "Rotate PDF Pages →",
  },
  {
    name: "PDF to Images",
    icon: ImageIcon,
    href: "/pdf-to-images",
    color: "#0369A1",
    lightBg: "#F0F9FF",
    desc: "Convert PDF pages into high-resolution PNG or JPEG images at 72, 150, or 300 DPI resolution for crisp print-ready output.",
    tag: "Convert to PNG / JPG",
    cta: "Convert to Images →",
  },
];

export default function Home() {
  return (
    <>
      <HomeJsonLd />
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
              <div className="grid grid-cols-2 gap-2 sm:hidden mb-8">
                {heroPlatforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.name}
                      href={p.href}
                      className="flex items-center gap-2 p-2.5 border border-[#051448] rounded-xl bg-white transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: p.lightBg }}
                      >
                        {p.logo ? (
                          <Image
                            src={p.logo}
                            alt={`${p.name} Tool`}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        ) : Icon ? (
                          <Icon size={16} className="text-[#051448]" />
                        ) : null}
                      </div>
                      <span className="text-[#051448] text-xs font-semibold truncate">
                        {p.tagText}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Desktop: 6 equal grid cards */}
              <div className="hidden sm:grid grid-cols-3 gap-2.5 mb-8">
                {heroPlatforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.name}
                      href={p.href}
                      className="group flex flex-col items-center justify-center gap-1.5 border border-[#051448] rounded-xl py-3 px-2.5 transition-all duration-200 hover:scale-105 bg-white shadow-2xs"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: p.lightBg }}
                      >
                        {p.logo ? (
                          <Image
                            src={p.logo}
                            alt={`${p.name} Tool`}
                            width={80}
                            height={32}
                            className={`object-contain ${p.logoH || "h-6"}`}
                          />
                        ) : Icon ? (
                          <Icon size={20} className="text-[#051448]" />
                        ) : null}
                      </div>
                      <span className="text-[#051448] text-[11px] font-semibold">
                        {p.tagText}
                      </span>
                    </Link>
                  );
                })}
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

      {/* ─── Platform Cards Section (All Tools) ─── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 py-16">

          {/* Section 1: E-Commerce Shipping & Seller Tools */}
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-black mb-2">
              eCommerce Dispatch Tools
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              Shipping Label Cropper &amp; Seller Suite
            </h2>
            <p className="text-black text-sm mt-2 max-w-lg mx-auto leading-relaxed text-justify">
              Custom-tailored for Indian online sellers on Meesho, Flipkart, and Amazon to format invoices and labels for 4×6 thermal roll printers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {sellerTools.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.name}
                  href={p.href}
                  className="group flex flex-col justify-between border border-[#051448] rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white"
                >
                  <div>
                    <div
                      className="flex items-center justify-center h-28"
                      style={{ backgroundColor: p.lightBg }}
                    >
                      {p.logo ? (
                        <Image
                          src={p.logo}
                          alt={`${p.name} Tool`}
                          width={140}
                          height={50}
                          className={`object-contain ${p.logoClass}`}
                        />
                      ) : Icon ? (
                        <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center">
                          <Icon size={28} style={{ color: p.color }} />
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5">
                      <span
                        className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2.5"
                        style={{ backgroundColor: p.lightBg, color: p.color }}
                      >
                        {p.tag}
                      </span>
                      <h3 className="text-base font-bold text-black mb-1.5">{p.name}</h3>
                      <p className="text-black/80 text-xs leading-relaxed text-justify">
                        {p.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-0">
                    <p
                      className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all pt-3 border-t border-slate-100"
                      style={{ color: p.color }}
                    >
                      {p.cta}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Section 2: All-in-One Free PDF Utility Suite */}
          <div className="text-center mb-10 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold tracking-widest uppercase text-black mb-2">
              Free Browser Utilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              All-in-One Free PDF Tool Suite
            </h2>
            <p className="text-black text-sm mt-2 max-w-lg mx-auto leading-relaxed text-justify">
              Merge, split, compress, rotate, and convert PDF documents in your browser with zero file uploads and 100% privacy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {pdfTools.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.name}
                  href={p.href}
                  className="group flex flex-col justify-between border border-[#051448]/30 hover:border-[#051448] rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white"
                >
                  <div>
                    <div
                      className="flex items-center justify-center h-24"
                      style={{ backgroundColor: p.lightBg }}
                    >
                      {p.logo ? (
                        <Image
                          src={p.logo}
                          alt={`${p.name} Tool`}
                          width={120}
                          height={40}
                          className={`object-contain ${p.logoClass}`}
                        />
                      ) : Icon ? (
                        <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                          <Icon size={24} style={{ color: p.color }} />
                        </div>
                      ) : null}
                    </div>

                    <div className="p-4">
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded mb-2"
                        style={{ backgroundColor: p.lightBg, color: p.color }}
                      >
                        {p.tag}
                      </span>
                      <h3 className="text-sm font-bold text-black mb-1">{p.name}</h3>
                      <p className="text-black/75 text-xs leading-relaxed line-clamp-3">
                        {p.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-0">
                    <p
                      className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all pt-2.5 border-t border-slate-100"
                      style={{ color: p.color }}
                    >
                      {p.cta}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>

      {/* ─── Detailed Home Information & SEO Guide Blog Section ─── */}
      <div className="bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-12 text-black">

          {/* Guide Header Banner */}
          <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-xs">
            <div className="inline-flex items-center gap-2 bg-[#051448]/10 text-[#051448] text-xs sm:text-sm font-bold px-3 py-1 rounded-full mb-3">
              <span>Ultimate Shipping Label Cropper &amp; Printing Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#051448] mb-4">
              Complete Guide to Online Shipping Label Cropping &amp; Thermal Printing for eCommerce
            </h2>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-4 text-justify">
              In the fast-paced world of Indian eCommerce, operational speed and cost efficiency are critical. When fulfilling customer orders on major marketplaces like <strong>Meesho Supplier Panel</strong> and <strong>Flipkart Seller Hub</strong>, sellers receive shipping labels generated as standard A4 PDFs. However, standard A4 invoices are not designed for modern 4×6 inch (100×150 mm) direct thermal roll printers.
            </p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed text-justify">
              <strong>LabelCropOnline</strong> bridges this gap by providing an intelligent, vector-lossless PDF cropping platform. Our technology strips away unnecessary page borders, formats labels precisely for 4×6 thermal rolls, and preserves 100% vector barcode clarity so warehouse teams can pack and dispatch orders faster than ever.
            </p>
          </div>

          {/* ── Key Advantages Grid ── */}
          <div>
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#051448]">
                Why Online Sellers Rely on LabelCropOnline
              </h2>
              <p className="text-sm sm:text-base text-black/70 mt-1 text-justify sm:text-left">
                Purpose-built to streamline warehouse order dispatching and eliminate paper wastage.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  1
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Saves up to 70% Paper Costs</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Converts standard full-page A4 PDFs into standard 4×6 inch (100×150 mm) labels, fitting perfectly on direct thermal rolls without expensive white waste margins.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Zero Barcode Scanning Failures</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Unlike basic screenshot tools, LabelCropOnline retains 100% pure vector PDF geometry. Barcodes scan instantly with 100% first-pass accuracy at courier hubs.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  3
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Universal Courier Calibration</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Intelligently detects logistics partners including Delhivery, Shadowfax, Valmo, Valmo Plus, and Xpressbees, applying precise crop margins for every label in multi-page PDFs.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  4
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Eliminate Manual Cutting</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Say goodbye to scissors and knives. Print directly on self-adhesive thermal stickers and apply straight to your packages.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  5
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">Interactive Crop Studio</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
                  Need specific adjustments? Use our visual canvas with 8-directional drag handles to define custom crop boundaries that apply instantly across all pages.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#051448]/20 rounded-md shadow-xs">
                <div className="w-8 h-8 rounded-md border border-[#051448] bg-white text-[#051448] flex items-center justify-center font-bold text-sm mb-3 shadow-2xs">
                  6
                </div>
                <h4 className="font-bold text-sm sm:text-base text-black mb-1.5">100% Privacy Guaranteed</h4>
                <p className="text-xs sm:text-sm text-black/75 leading-relaxed text-justify">
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
            <ol className="space-y-4 text-sm sm:text-base text-black/80">
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
            <div className="space-y-4 text-sm sm:text-base">
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
