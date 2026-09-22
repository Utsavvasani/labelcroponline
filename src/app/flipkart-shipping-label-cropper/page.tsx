import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Flipkart Shipping Label Cropper",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.labelcroponline.com/flipkart-label-crop" },
};

export default function FlipkartShippingCropperRedirect() {
  redirect("/flipkart-label-crop");
}
