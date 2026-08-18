import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crop & Process Shipping Labels Online – Free Label Tool",
  description:
    "LabelCropOnline is a free online tool to crop, resize, sort, split, and bulk-process shipping labels and PDF documents. Perfect for ecommerce sellers and warehouses.",
  keywords: [
    "crop shipping labels online",
    "free label crop tool",
    "shipping label processor",
    "bulk label cropping",
    "PDF shipping label cropper",
    "label tool for ecommerce",
    "online label resizer",
    "labelcroponline",
  ],
  alternates: { canonical: "https://www.labelcroponline.com" },
  openGraph: {
    url: "https://www.labelcroponline.com",
    title: "LabelCropOnline – Crop & Process Shipping Labels Online",
    description:
      "Free online tool to crop, resize, sort, split, and bulk-process shipping labels and PDF documents for ecommerce sellers.",
  },
  twitter: {
    title: "LabelCropOnline – Crop & Process Shipping Labels Online",
    description:
      "Free online tool to crop, resize, sort, split, and bulk-process shipping labels and PDF documents for ecommerce sellers.",
  },
};

const heroPlatforms = [
  {
    name: "Meesho",
    logo: "/meesho_logo.svg",
    href: "/meesho-label-crop",
    logoH: "h-[30px]",
    lightBg: "#F7EEFE",
  },
  {
    name: "Flipkart",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    logoH: "h-9",
    lightBg: "#EEF4FF",
  },
  {
    name: "Amazon",
    logo: "/amazon_logo.svg",
    href: "/editor?platform=amazon",
    logoH: "h-8",
    lightBg: "#FFF8EC",
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
    desc: "Handle Meesho shipping label PDFs with ease. Crop, resize, and organise labels from your supplier panel for fast and efficient dispatching.",
    tag: "Meesho Label Crop",
  },
  {
    name: "Flipkart",
    logo: "/flipkart_logo.svg",
    href: "/flipkart-label-crop",
    color: "#007cd7",
    lightBg: "#EEF4FF",
    logoClass: "h-11 w-auto",
    desc: "Process Flipkart seller hub shipping labels in bulk. Split multi-label PDFs, crop to standard size, and download print-ready files instantly.",
    tag: "Flipkart Label Crop",
  },
  {
    name: "Amazon",
    logo: "/amazon_logo.svg",
    href: "/editor?platform=amazon",
    color: "#FF9900",
    lightBg: "#FFF8EC",
    logoClass: "h-10 w-auto",
    desc: "Crop and resize Amazon shipping labels from seller central PDF downloads. Perfectly sized for thermal printers and A4 sheets with one click.",
    tag: "Amazon Label Crop",
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
                Upload your PDF shipping labels, crop, resize, and download
                instantly — built for ecommerce sellers on every major platform.
              </p>

              {/* Platform Banners */}
              <p className="text-black text-xs font-semibold uppercase tracking-widest mb-3">
                Supported Platforms
              </p>

              {/* Mobile: 2-part pill — fixed logo box + text */}
              <div className="flex flex-col gap-2 mb-8 sm:hidden">
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
                        alt={`${p.name} Label Crop`}
                        width={100}
                        height={40}
                        className="object-contain w-full h-8"
                      />
                    </div>
                    {/* Part 2: Text — remaining width, white bg */}
                    <div className="flex-1 flex items-center justify-between px-4 py-3 bg-white">
                      <span className="text-[#051448] text-sm font-semibold">
                        {p.name} Label Crop
                      </span>
                      <span className="text-[#051448]/40 text-xs ml-2">→</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: equal square cards */}
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
                      alt={`${p.name} Label Crop`}
                      width={120}
                      height={48}
                      className={`object-contain w-auto ${p.logoH}`}
                    />
                    <span className="text-[#051448] text-[10px] font-medium">
                      {p.name} Labels
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Right: Simple SEO Text Paragraph ── */}
            <div>
              <p className="text-black text-sm sm:text-base leading-relaxed text-justify">
                LabelCropOnline is a free, fast, and secure online tool designed for ecommerce sellers and warehouse teams to crop, resize, split, and bulk-process shipping labels from Meesho Supplier Panel, Flipkart Seller Hub, and Amazon Seller Central. Convert multi-page PDF orders into print-ready 4x6 inch thermal printer labels or 2-up and 4-up A4 sheets instantly in your browser without software installation or signup.
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
              Pick your platform, crop your labels
            </h2>
            <p className="text-black text-sm mt-3 max-w-lg mx-auto leading-relaxed  text-justify">
              Whether you sell on Meesho, Flipkart, or Amazon — our tools are
              built to handle your labels, your way.
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
                    alt={`${p.name} Label Crop`}
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
                  <p className="text-black text-sm leading-relaxed  text-justify">
                    {p.desc}
                  </p>
                  <p
                    className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                    style={{ color: p.color }}
                  >
                    Crop {p.name} Labels →
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
