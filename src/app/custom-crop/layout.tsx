import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom PDF Crop Studio — Interactive Visual Area Selector | LabelCropOnline",
  description:
    "Visually select, crop, and resize any PDF shipping label or document to custom dimensions. Free client-side tool with real-time preview and 4x6 thermal printer support.",
  keywords: [
    "custom pdf crop",
    "crop pdf online",
    "shipping label cropper",
    "visual pdf cropper",
    "crop pdf margins",
    "pdf area crop",
    "4x6 label crop",
    "custom dimension crop",
    "browser pdf crop",
  ],
  openGraph: {
    title: "Custom PDF Crop Studio — Interactive Visual Area Selector | LabelCropOnline",
    description:
      "Interactive visual crop studio to select custom PDF dimensions and crop shipping labels or documents with live preview.",
    type: "website",
    url: "https://labelcroponline.com/custom-crop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom PDF Crop Studio — LabelCropOnline",
    description:
      "Visually select, crop, and resize any PDF document to custom dimensions directly in your browser.",
  },
};

export default function CustomCropLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
