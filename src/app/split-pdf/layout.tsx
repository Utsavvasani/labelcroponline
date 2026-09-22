import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online — Extract Pages & Custom Ranges Free | LabelCropOnline",
  description:
    "Split any multi-page PDF into individual pages, custom page ranges, or even/odd pages. Download as individual PDFs or a ZIP archive. Free, browser-based, no file upload.",
  keywords: [
    "split pdf online",
    "extract pdf pages",
    "split pdf free",
    "separate pdf pages",
    "pdf page extractor",
    "split pdf into multiple files",
    "extract pages from pdf",
    "pdf splitter online",
    "split shipping label pdf",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/split-pdf",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/split-pdf",
    siteName: "LabelCropOnline",
    title: "Split PDF Online — Extract Pages & Custom Ranges Free | LabelCropOnline",
    description:
      "Split PDF files into pages or custom ranges. Download as individual files or ZIP. 100% free, browser-based, no upload.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Split PDF Online – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online – Free Page Extractor",
    description:
      "Split PDF into individual pages or custom ranges online for free. No upload. Instant download.",
    images: ["/og-image.png"],
  },
};

export default function SplitPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
