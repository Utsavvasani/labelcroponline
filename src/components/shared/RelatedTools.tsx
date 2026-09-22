"use client";

import React from "react";
import Link from "next/link";
import {
  Scissors,
  Layers,
  Split,
  Minimize2,
  RotateCw,
  Image as ImageIcon,
  Sliders,
  Star,
  ArrowRight,
} from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  desc: string;
  href: string;
  category: "shipping" | "pdf";
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  brandColor?: string;
}

export const ALL_TOOLS: ToolItem[] = [
  {
    id: "meesho",
    name: "Meesho Label Crop",
    desc: "Crop Meesho shipping labels & tax invoices to 4x6 thermal sticker rolls.",
    href: "/meesho-label-crop",
    category: "shipping",
    icon: Scissors,
    badge: "Popular",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    brandColor: "#580a46",
  },
  {
    id: "flipkart",
    name: "Flipkart Label Crop",
    desc: "Bulk crop Flipkart Seller Hub labels for direct thermal printing.",
    href: "/flipkart-label-crop",
    category: "shipping",
    icon: Scissors,
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    brandColor: "#007cd7",
  },
  {
    id: "custom-crop",
    name: "Custom Crop Studio",
    desc: "Interactive visual crop tool with draggable handles for any PDF dimensions.",
    href: "/custom-crop",
    category: "shipping",
    icon: Sliders,
    badge: "Flexible",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    brandColor: "#051448",
  },
  {
    id: "rating-card",
    name: "Rating Card Studio",
    desc: "Create 5-star customer review insert cards with QR codes for packages.",
    href: "/rating-card",
    category: "shipping",
    icon: Star,
    badge: "New",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    brandColor: "#b45309",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    desc: "Combine multiple shipping labels or document PDFs into one single file.",
    href: "/merge-pdf",
    category: "pdf",
    icon: Layers,
    badge: "Fast",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    brandColor: "#b42024",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    desc: "Extract pages or split multi-page PDF documents into individual files or ZIP.",
    href: "/split-pdf",
    category: "pdf",
    icon: Split,
    brandColor: "#051448",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    desc: "Reduce PDF document file size with lossless optimization in browser.",
    href: "/compress-pdf",
    category: "pdf",
    icon: Minimize2,
    brandColor: "#051448",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    desc: "Rotate all or selected PDF pages 90°, 180° or 270° with instant preview.",
    href: "/rotate-pdf",
    category: "pdf",
    icon: RotateCw,
    brandColor: "#051448",
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    desc: "Convert PDF pages to PNG or JPEG images at 72, 150 or 300 DPI resolution.",
    href: "/pdf-to-images",
    category: "pdf",
    icon: ImageIcon,
    brandColor: "#051448",
  },
];

interface RelatedToolsProps {
  currentToolId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function RelatedTools({
  currentToolId,
  title = "Explore Other Free PDF & Label Tools",
  subtitle = "All tools run 100% in your browser — zero uploads, instant processing, and completely free.",
  limit,
}: RelatedToolsProps) {
  const filteredTools = ALL_TOOLS.filter((tool) => tool.id !== currentToolId);
  const displayTools = limit ? filteredTools.slice(0, limit) : filteredTools;

  return (
    <section className="w-full mt-10 sm:mt-14 pt-8 border-t border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#051448]">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {displayTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex flex-col justify-between p-4 bg-white border border-slate-200 hover:border-[#051448] rounded-xl hover:shadow-md transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#051448] group-hover:bg-[#051448] group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon size={16} />
                  </div>
                  {tool.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#051448] transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#051448]">
                <span>Launch tool</span>
                <ArrowRight
                  size={13}
                  className="transform group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedTools;
