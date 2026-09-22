import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Meesho Tax Invoice Crop",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.labelcroponline.com/meesho-label-crop" },
};

export default function MeeshoTaxInvoiceRedirect() {
  redirect("/meesho-label-crop");
}
