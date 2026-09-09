import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online — 90°, 180°, 270° | LabelCropOnline",
  description:
    "Rotate all or specific pages of any PDF document by 90 degrees clockwise, 180 degrees, or 270 degrees. Free, fast in-browser tool with live preview.",
};

export default function RotatePdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
