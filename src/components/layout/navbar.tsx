"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Menu,
  ChevronDown,
  X,
  Crop,
  FileText,
  Grid,
} from "lucide-react";


interface SubItem {
  id: string;
  name: string;
  desc?: string;
}

interface ToolCategory {
  id: string;
  name: string;
  desc?: string;
  icon?: React.ElementType;
  subItems?: SubItem[];
}

export function Navbar() {
  const [hideAppbar, setHideAppbar] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  const toolCategories: ToolCategory[] = [
    {
      id: "label-cropper",
      name: "Label Cropper",
      desc: "Crop thermal & shipping labels",
      icon: Crop,
      subItems: [
        { id: "amazon", name: "Amazon Shipping Labels", desc: "Standard 4x6 prep" },
        { id: "flipkart", name: "Flipkart Shipping Labels", desc: "2-up & 4-up formats" },
        { id: "shopify", name: "Shopify Packing Slips", desc: "Custom bounding crop" },
        { id: "custom", name: "Custom Bounding Crop", desc: "Manual marquee selection" },
      ],
    },
    {
      id: "pdf-tools",
      name: "PDF Utilities",
      desc: "Split, merge & crop PDF pages",
      icon: FileText,
      subItems: [
        { id: "batch-crop", name: "Batch Multi-Page Crop", desc: "Process all pages at once" },
        { id: "page-split", name: "Split Multi-Label Pages", desc: "Separate 4-on-1 PDF pages" },
        { id: "auto-detect", name: "Auto Margin Removal", desc: "Remove blank borders" },
      ],
    },
    {
      id: "presets",
      name: "Standard Presets",
      desc: "Pre-configured label sizes",
      icon: Grid,
      subItems: [
        { id: "4x6", name: "4 x 6 inch Thermal", desc: "Standard shipping size" },
        { id: "a4-4up", name: "A4 4-Up Grid", desc: "4 labels per sheet" },
        { id: "a4-2up", name: "A4 2-Up Sheet", desc: "2 labels per sheet" },
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setHideAppbar(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToTool = (catId: string, subId?: string) => {
    let url = "/editor?category=" + catId;
    if (subId) {
      url += "&preset=" + subId;
    }
    router.push(url);
    setShowToolsDropdown(false);
    setSheetOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Single fixed header wrapper — slides as one unit on scroll */}
      <div
        className={`fixed top-0 left-0 z-50 w-full ${hideAppbar ? "-translate-y-[44px]" : "translate-y-0"
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
                href="mailto:labelcroponline@gmail.com
"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">labelcroponline@gmail.com
                </span>
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
          <nav className="mx-auto flex max-w-[1200px] items-center justify-between bg-white px-6 py-2 rounded-b-2xl shadow-lg">
            {/* Logo with labelcroponline.svg */}
            <Link href="/">
              <img
                src="/labelcroponline.svg"
                alt="Label Crop Online Logo"
                className="w-40 h-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="text-black hidden space-x-6 text-sm font-semibold md:flex">
              <li className="hover:text-[#051448] cursor-pointer transition-colors">
                <Link href="/">Home</Link>
              </li>
              <li className="hover:text-[#051448] cursor-pointer transition-colors">
                <Link href="/editor">Meesho Label Crop </Link>
              </li>
              <li className="hover:text-[#051448] cursor-pointer transition-colors">
                <Link href="/flipkart-label-crop">Flipkart Label Crop </Link>
              </li>
              <li className="hover:text-[#051448] cursor-pointer transition-colors">
                <Link href="/editor">Amazon Label Crop </Link>
              </li>

              {/* Product / Tools Dropdown */}
              {/* <li
                className="hover:text-[#051448] relative cursor-pointer"
                onMouseEnter={() => setShowToolsDropdown(true)}
                onMouseLeave={() => setShowToolsDropdown(false)}
              >
                <div className="flex items-center gap-1">
                  <Link href="/editor">Tools & Presets</Link>
                  <ChevronDown size={14} />
                </div>

                {showToolsDropdown && (
                  <div className="absolute top-full left-0 z-50 w-64 rounded-md bg-white p-2 shadow-lg">
                    {toolCategories.map((category) => (
                      <div
                        key={category.id}
                        className="relative"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        onMouseLeave={() => setActiveCategory(null)}
                      >
                        <div
                          onClick={() => navigateToTool(category.id)}
                          className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <Crop size={16} className="text-[#051448]" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          {category.subItems && category.subItems.length > 0 && (
                            <ChevronDown size={14} className="ml-auto" />
                          )}
                        </div>

                        {activeCategory === category.id &&
                          category.subItems &&
                          category.subItems.length > 0 && (
                            <div className="absolute top-0 right-full z-50 w-60 rounded-md bg-white p-2 shadow-lg">
                              {category.subItems.map((subItem) => (
                                <div
                                  key={subItem.id}
                                  onClick={() => navigateToTool(category.id, subItem.id)}
                                  className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                                >
                                  <span className="text-xs">{subItem.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </li> */}

              <li className="hover:text-[#051448] cursor-pointer transition-colors">
                <Link href="/contact-us">Contact Us</Link>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSheetOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
          <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm bg-white p-6 shadow-lg flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
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
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="text-[#333333] mt-5 space-y-4 text-lg font-medium">
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/" onClick={() => setSheetOpen(false)}>
                    Home
                  </Link>
                </li>
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/flipkart-label-crop" onClick={() => setSheetOpen(false)}>
                    Flipkart Label Crop
                  </Link>
                </li>
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/editor" onClick={() => setSheetOpen(false)}>
                    Meesho Label Crop
                  </Link>
                </li>
                <li className="hover:text-[#051448] cursor-pointer">
                  <Link href="/editor" onClick={() => setSheetOpen(false)}>
                    Amazon Label Crop
                  </Link>
                </li>
                {/* <li className="hover:text-[#051448] cursor-pointer">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/editor"
                      onClick={() => {
                        router.push("/editor");
                        setSheetOpen(false);
                      }}
                    >
                      Tools & Presets
                    </Link>
                    <button
                      className="p-1"
                      onClick={() =>
                        setShowToolsDropdown(!showToolsDropdown)
                      }
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {showToolsDropdown && (
                    <div className="mt-2 ml-4 space-y-2">
                      {toolCategories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() => {
                                navigateToTool(category.id);
                                setSheetOpen(false);
                              }}
                              className="text-base font-medium cursor-pointer"
                            >
                              {category.name}
                            </div>
                          </div>
                          {category.subItems && (
                            <div className="ml-4 space-y-1">
                              {category.subItems.map((subItem) => (
                                <div
                                  key={subItem.id}
                                  onClick={() => {
                                    navigateToTool(category.id, subItem.id);
                                    setSheetOpen(false);
                                  }}
                                  className="text-sm text-gray-600 hover:text-[#051448] cursor-pointer"
                                >
                                  {subItem.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </li> */}
                <li className="hover:text-[#051448] cursor-pointer">
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
