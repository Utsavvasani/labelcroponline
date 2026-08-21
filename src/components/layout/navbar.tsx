"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  Menu,
  ChevronDown,
  X,
  Layers,
  Crop,
  Scissors,
  Sliders,
  Split,
  Minimize2,
  Sparkles,
} from "lucide-react";

interface PdfToolItem {
  id: string;
  name: string;
  desc: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  isAvailable?: boolean;
}

export function Navbar() {
  const [hideAppbar, setHideAppbar] = useState(false);
  const [pdfToolsOpen, setPdfToolsOpen] = useState(false);
  const [mobilePdfToolsOpen, setMobilePdfToolsOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pdfToolItems: PdfToolItem[] = [
    {
      id: "merge-pdf",
      name: "Merge PDF Files",
      desc: "Combine multiple shipping labels or document PDFs into one single file",
      href: "/merge-pdf",
      icon: Layers,
      isAvailable: true,
      badge: "Popular",
    },
    {
      id: "meesho-crop",
      name: "Meesho Label Crop",
      desc: "Auto-detect couriers & crop Meesho labels for 4×6 thermal roll printers",
      href: "/meesho-label-crop",
      icon: Scissors,
      isAvailable: true,
    },
    {
      id: "flipkart-crop",
      name: "Flipkart Label Crop",
      desc: "1-click Flipkart shipping label crop with 100% vector barcode fidelity",
      href: "/flipkart-label-crop",
      icon: Crop,
      isAvailable: true,
    },
    {
      id: "custom-crop",
      name: "Custom Crop Studio",
      desc: "Interactive 8-handle visual crop selector for custom PDF dimensions",
      href: "/editor",
      icon: Sliders,
      isAvailable: true,
    },
    {
      id: "split-pdf",
      name: "Split PDF Pages",
      desc: "Extract or separate multi-page PDF documents into individual files",
      icon: Split,
      isAvailable: false,
      badge: "Soon",
    },
    {
      id: "compress-pdf",
      name: "Compress PDF",
      desc: "Reduce PDF document file size while preserving high-contrast vector lines",
      icon: Minimize2,
      isAvailable: false,
      badge: "Soon",
    },
  ];

  // Hide top announcement bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHideAppbar(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPdfToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setPdfToolsOpen(false);
    setSheetOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setPdfToolsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setPdfToolsOpen(false);
    }, 150);
  };

  return (
    <div className="relative w-full">
      {/* Single fixed header wrapper — slides as one unit on scroll */}
      <div
        className={`fixed top-0 left-0 z-50 w-full transition-transform duration-200 ${
          hideAppbar ? "-translate-y-[44px]" : "translate-y-0"
        }`}
      >
        {/* Blue Top Announcement Bar */}
        <div className="bg-[#051448] w-full px-4 py-3 text-white">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="tel:+919909520532"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Phone size={16} />
                <span className="hidden sm:inline">+91 99095 20532</span>
              </a>
              <a
                href="mailto:labelcroponline@gmail.com"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">labelcroponline@gmail.com</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 sm:gap-5 text-white/90">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:text-gray-300"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:text-gray-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:text-gray-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:text-gray-300"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Nav wrapper — transparent so page background shows through on both sides */}
        <div className="w-full">
          <nav
            ref={dropdownRef}
            className="relative mx-auto flex max-w-[1200px] h-14 sm:h-16 items-center justify-between bg-white px-4 sm:px-6 rounded-b-2xl shadow-lg"
          >
            {/* Logo with labelcroponline.svg */}
            <Link href="/" className="shrink-0 flex items-center">
              <img
                src="/labelcroponline.svg"
                alt="Label Crop Online Logo"
                className="w-32 sm:w-40 h-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links — single horizontal line with vertical centering */}
            <ul className="text-black hidden md:flex items-center space-x-3 lg:space-x-6 text-xs lg:text-sm font-semibold whitespace-nowrap h-full">
              <li className="hover:text-[#051448] cursor-pointer transition-colors flex items-center h-full">
                <Link href="/" className="flex items-center h-full">Home</Link>
              </li>
              <li className="hover:text-[#051448] cursor-pointer transition-colors flex items-center h-full">
                <Link href="/meesho-label-crop" className="flex items-center h-full">Meesho Label Crop</Link>
              </li>
              <li className="hover:text-[#051448] cursor-pointer transition-colors flex items-center h-full">
                <Link href="/flipkart-label-crop" className="flex items-center h-full">Flipkart Label Crop</Link>
              </li>

              {/* ── PDF Tools Dropdown Trigger ── */}
              <li
                className="cursor-pointer flex items-center h-full"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setPdfToolsOpen((prev) => !prev)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer h-full ${
                    pdfToolsOpen || pathname === "/merge-pdf"
                      ? "text-[#051448] font-bold"
                      : "hover:text-[#051448]"
                  }`}
                  aria-expanded={pdfToolsOpen}
                >
                  <span>PDF Tools</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      pdfToolsOpen ? "rotate-180 text-[#051448]" : "text-black/60"
                    }`}
                  />
                </button>
              </li>

              <li className="hover:text-[#051448] cursor-pointer transition-colors flex items-center h-full">
                <Link href="/contact-us" className="flex items-center h-full">Contact Us</Link>
              </li>
            </ul>

            {/* ── Desktop PDF Tools Dropdown Menu (Anchored flush to right edge of navbar) ── */}
            {pdfToolsOpen && (
              <div
                className="hidden md:block absolute top-full right-0 mt-1.5 w-[500px] lg:w-[540px] max-h-[calc(100vh-140px)] overflow-y-auto bg-white border border-[#051448]/20 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#051448] uppercase tracking-wider">
                    <Sparkles size={13} className="text-[#051448]" />
                    <span>All PDF &amp; Label Tools</span>
                  </div>
                  <span className="text-[11px] text-black/50 font-normal">
                    100% Free &amp; Fast
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {pdfToolItems.map((item) => {
                    const Icon = item.icon;
                    const isClickable = item.isAvailable && item.href;

                    const content = (
                      <div
                        className={`group flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                          isClickable
                            ? "border-transparent hover:border-[#051448]/20 hover:bg-slate-50 cursor-pointer"
                            : "border-transparent opacity-60 cursor-not-allowed bg-slate-50/40"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-md bg-[#051448]/10 text-[#051448] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#051448] group-hover:text-white transition-colors">
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-black group-hover:text-[#051448] transition-colors leading-tight">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight ${
                                  item.badge === "Popular"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-blue-50 text-[#051448] border border-blue-200"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-black/65 leading-snug mt-0.5 line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );

                    if (isClickable && item.href) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setPdfToolsOpen(false)}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return <div key={item.id}>{content}</div>;
                  })}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSheetOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="h-8 w-8" />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Sheet / Drawer Menu */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white p-5 shadow-lg flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <Link href="/" onClick={() => setSheetOpen(false)}>
                  <img
                    src="/labelcroponline.svg"
                    alt="Logo"
                    className="w-36 h-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="text-black mt-4 space-y-3 text-base font-semibold">
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/" onClick={() => setSheetOpen(false)}>
                    Home
                  </Link>
                </li>
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/meesho-label-crop" onClick={() => setSheetOpen(false)}>
                    Meesho Label Crop
                  </Link>
                </li>
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/flipkart-label-crop" onClick={() => setSheetOpen(false)}>
                    Flipkart Label Crop
                  </Link>
                </li>

                {/* Mobile PDF Tools Submenu Accordion */}
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => setMobilePdfToolsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left font-bold text-black hover:text-[#051448] cursor-pointer py-1"
                  >
                    <span>PDF Tools</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        mobilePdfToolsOpen ? "rotate-180 text-[#051448]" : "text-black/60"
                      }`}
                    />
                  </button>

                  {mobilePdfToolsOpen && (
                    <div className="mt-2 ml-2 pl-3 border-l-2 border-[#051448]/20 space-y-2.5">
                      {pdfToolItems.map((item) => {
                        const Icon = item.icon;
                        const isClickable = item.isAvailable && item.href;

                        const content = (
                          <div
                            className={`flex items-center gap-2.5 py-1 ${
                              isClickable ? "text-black hover:text-[#051448]" : "text-black/40"
                            }`}
                          >
                            <Icon size={15} className="shrink-0" />
                            <span className="text-xs font-semibold">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                                  item.badge === "Popular"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-50 text-[#051448]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        );

                        if (isClickable && item.href) {
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={() => setSheetOpen(false)}
                            >
                              {content}
                            </Link>
                          );
                        }

                        return <div key={item.id}>{content}</div>;
                      })}
                    </div>
                  )}
                </li>

                <li className="hover:text-[#051448] cursor-pointer pt-1">
                  <Link href="/contact-us" onClick={() => setSheetOpen(false)}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
