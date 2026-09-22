import { Metadata } from "next";

export const metadata: Metadata = {
  // Noindex redirect pages to prevent duplicate content penalties
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlipkartThermalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
