import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sort Shipping Labels PDF — Courier, SKU, Pincode & Order ID | LabelCropOnline",
  description:
    "Sort multi-page eCommerce shipping labels by Courier (Delhivery, Shadowfax, Xpressbees, Valmo), SKU, Order ID, AWB, Pincode, or Quantity. Multi-level custom sorting.",
};

export default function SortLabelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
