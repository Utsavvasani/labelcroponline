import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Images Online — Convert PDF Pages to PNG / JPEG | LabelCropOnline",
  description:
    "Convert every page of your PDF document into crisp PNG or JPEG images at 72, 150, or 300 DPI resolution. Download as individual images or a ZIP archive.",
};

export default function PdfToImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
