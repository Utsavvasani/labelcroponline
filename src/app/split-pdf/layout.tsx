import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Pages Online — Extract Pages & Custom Ranges | LabelCropOnline",
  description:
    "Split any multi-page PDF document into individual pages, custom page ranges, or groups. Download as ZIP. Free and browser-based.",
};

export default function SplitPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
