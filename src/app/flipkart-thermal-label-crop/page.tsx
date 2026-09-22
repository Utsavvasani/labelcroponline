import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Flipkart Thermal Label Crop",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.labelcroponline.com/flipkart-label-crop" },
};

export default function FlipkartThermalRedirect() {
  redirect("/flipkart-label-crop");
}
