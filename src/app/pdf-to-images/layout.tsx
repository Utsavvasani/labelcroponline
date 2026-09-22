import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Images Online — Convert PDF Pages to PNG/JPEG Free | LabelCropOnline",
  description:
    "Convert every page of a PDF into crisp PNG or JPEG images at 72, 150, or 300 DPI. Download as individual images or a ZIP archive. Free, browser-based PDF to image converter.",
  keywords: [
    "pdf to image online",
    "convert pdf to png",
    "convert pdf to jpeg",
    "pdf to jpg free",
    "pdf page to image",
    "extract images from pdf",
    "pdf to image converter",
    "pdf to png online free",
    "pdf screenshot tool",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/pdf-to-images",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/pdf-to-images",
    siteName: "LabelCropOnline",
    title: "PDF to Images Online — Convert PDF Pages to PNG/JPEG Free | LabelCropOnline",
    description:
      "Convert PDF pages to PNG or JPEG at up to 300 DPI. Download as ZIP. Free, browser-based, no upload.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF to Images Online – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Images – Free Online PNG/JPEG Converter",
    description:
      "Convert PDF pages to PNG or JPEG images free. Select DPI, download individually or as ZIP. No upload.",
    images: ["/og-image.png"],
  },
};

export default function PdfToImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
