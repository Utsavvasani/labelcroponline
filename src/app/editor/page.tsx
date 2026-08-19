"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function EditorRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const platform = searchParams.get("platform");
    if (platform === "meesho" || !platform) {
      router.replace("/meesho-label-crop");
    } else if (platform === "flipkart") {
      router.replace("/flipkart-label-crop");
    } else if (platform === "merge") {
      router.replace("/merge-pdf");
    } else {
      router.replace(`/${platform}-label-crop`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[#007cd7]" />
      <p className="text-sm font-medium text-slate-600">Loading Label Editor...</p>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#007cd7]" />
          <p className="text-sm font-medium text-slate-600">Loading Label Editor...</p>
        </div>
      }
    >
      <EditorRedirectContent />
    </Suspense>
  );
}
