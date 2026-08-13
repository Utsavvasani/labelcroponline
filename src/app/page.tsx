import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6 sm:p-12">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Image
            className="dark:invert h-6 w-[120px]"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-4 text-center my-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
           live, Label Crop Online
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Professional, scalable tool for cropping shipping labels, bulk PDF management, and custom label sizing.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Crop Canvas</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Precise label area selection and multi-page batch cropping.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">PDF Engine</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Client-side high performance PDF processing and extraction.</p>
          </div>
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Presets & Export</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Standard 4x6, thermal printer presets, and instant download.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
