import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online — Reduce File Size Free | LabelCropOnline",
  description:
    "Compress PDF files by stripping redundant metadata, flattening forms, and restructuring streams. Reduce PDF size without visible quality loss. Free, secure, 100% in-browser PDF compressor.",
  keywords: [
    "compress pdf online",
    "reduce pdf file size",
    "pdf compressor free",
    "compress pdf without losing quality",
    "shrink pdf online",
    "pdf size reducer",
    "online pdf compress",
    "compress shipping label pdf",
    "compress pdf india",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/compress-pdf",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/compress-pdf",
    siteName: "LabelCropOnline",
    title: "Compress PDF Online — Reduce File Size Free | LabelCropOnline",
    description:
      "Free online PDF compressor. Strip metadata, flatten forms, reduce file size with no visible quality loss. 100% browser-based.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Compress PDF Online – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online – Free File Size Reducer",
    description:
      "Compress PDF files online for free. No upload. No quality loss. 100% browser-based.",
    images: ["/og-image.png"],
  },
};

export default function CompressPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
