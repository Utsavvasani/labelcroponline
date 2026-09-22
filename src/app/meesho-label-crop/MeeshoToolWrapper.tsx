"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

const MeeshoToolClient = dynamic(
  () => import("./MeeshoToolClient").then((m) => m.MeeshoToolClient),
  {
    ssr: false,
    loading: () => (
      // Branded skeleton shown while the client JS chunk loads.
      // Prevents CLS and gives users instant visual feedback.
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 pt-[66px] sm:pt-[76px] pb-6 sm:pb-10">
        <div className="border border-[#051448] rounded-md bg-white shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7">
            <div className="grid md:grid-cols-12 gap-5 sm:gap-8 items-center">
              {/* Left: Logo placeholder */}
              <div className="md:col-span-4 flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-[#051448]/20 pb-3 md:pb-0 md:pr-6">
                <Image
                  src="/meesho_logo.svg"
                  alt="Meesho Label Crop Tool"
                  width={140}
                  height={48}
                  className="h-9 sm:h-11 w-auto object-contain"
                  priority
                />
                <h1 className="hidden md:block text-base sm:text-lg font-bold text-black mt-2">
                  Meesho Label Cropper
                </h1>
                <p className="hidden md:block text-black text-sm leading-relaxed mt-2">
                  Crop Meesho shipping labels with clean border margins, courier auto-detection, or select your own custom area.
                </p>
              </div>
              {/* Right: Animated drop zone skeleton */}
              <div className="md:col-span-8 flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="h-10 rounded border border-slate-200 bg-slate-50 animate-pulse" />
                  <div className="h-10 rounded border border-slate-200 bg-slate-50 animate-pulse" />
                  <div className="h-10 rounded border border-slate-200 bg-slate-50 animate-pulse" />
                </div>
                <div className="border-2 border-dashed border-[#051448]/30 rounded-md py-10 sm:py-14 px-6 flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-56 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export function MeeshoToolWrapper() {
  return <MeeshoToolClient />;
}
