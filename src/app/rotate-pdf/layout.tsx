import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online — 90°, 180°, 270° Free | LabelCropOnline",
  description:
    "Rotate all or specific pages of any PDF document by 90°, 180°, or 270°. Free, fast in-browser PDF rotation tool with live preview. No upload, no registration required.",
  keywords: [
    "rotate pdf online",
    "rotate pdf pages free",
    "pdf page rotation",
    "rotate pdf 90 degrees",
    "rotate pdf 180 degrees",
    "flip pdf pages",
    "pdf rotator online",
    "rotate shipping label pdf",
    "fix rotated pdf pages",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/rotate-pdf",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/rotate-pdf",
    siteName: "LabelCropOnline",
    title: "Rotate PDF Pages Online — 90°, 180°, 270° Free | LabelCropOnline",
    description:
      "Rotate PDF pages by 90°, 180° or 270° for free. Works in your browser with live page preview. No file upload needed.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Rotate PDF Online – LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Pages Online – Free 90°/180°/270° Tool",
    description:
      "Rotate PDF pages online for free. Select specific pages or rotate all at once. No upload. Browser-based.",
    images: ["/og-image.png"],
  },
};

export default function RotatePdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
