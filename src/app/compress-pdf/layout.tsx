import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online — Reduce File Size Losslessly | LabelCropOnline",
  description:
    "Compress PDF files by stripping redundant metadata, flattening interactive forms, and restructuring document streams. Free, secure, in-browser PDF compressor.",
};

export default function CompressPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
