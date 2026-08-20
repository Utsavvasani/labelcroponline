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
    desc: "Handle Meesho shipping label PDFs with ease. Crop, resize, and organise labels from your supplier panel with clean border margins for fast dispatching.",
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
    desc: "Process Flipkart seller hub shipping labels in bulk. Extract the middle shipping label cleanly, strip extra margins, and download print-ready files instantly.",
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
    desc: "Combine multiple shipping labels, packing slips, or document PDFs into one single file. Easily reorder files by position number and download immediately.",
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

              <p className="text-black text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Upload your PDF shipping labels, crop, resize, or merge
                instantly — built for ecommerce sellers and warehouse dispatchers.
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
            <p className="text-black text-sm mt-3 max-w-lg mx-auto leading-relaxed text-center">
              Whether you sell on Meesho or Flipkart, or need to merge multiple PDF documents — our tools are built for speed and precision.
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
    </>
  );
}
