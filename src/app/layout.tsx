import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.labelcroponline.com"),
  icons: {
    icon: [
      { url: "/tab_logo.svg", type: "image/svg+xml" },
      { url: "/tab_logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/tab_logo.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: {
    default: "LabelCropOnline – Crop & Process Shipping Labels Online",
    template: "%s | LabelCropOnline",
  },
  description:
    "Crop, resize, sort, and bulk-process shipping labels and PDF documents online. Fast, simple, browser-based label processing for ecommerce sellers and businesses.",
  keywords: [
    "shipping label cropper",
    "crop shipping labels online",
    "bulk label processing",
    "PDF label crop",
    "label crop tool",
    "shipping label tool",
    "ecommerce label processor",
    "online label cropper",
    "resize shipping labels",
    "split PDF labels",
    "labelcroponline",
  ],
  authors: [{ name: "LabelCropOnline", url: "https://www.labelcroponline.com" }],
  creator: "LabelCropOnline",
  publisher: "LabelCropOnline",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com",
    siteName: "LabelCropOnline",
    title: "LabelCropOnline – Crop & Process Shipping Labels Online",
    description:
      "Crop, resize, sort, and bulk-process shipping labels and PDF documents online. Fast, simple label processing for ecommerce sellers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LabelCropOnline – Shipping Label Processing Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabelCropOnline – Crop & Process Shipping Labels Online",
    description:
      "Crop, resize, sort, and bulk-process shipping labels and PDF documents online. Fast, simple label processing for ecommerce sellers.",
    images: ["/og-image.png"],
    creator: "@labelcroponline",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-[44px] font-sans bg-white">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}



