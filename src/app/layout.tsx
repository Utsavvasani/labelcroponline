import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.labelcroponline.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/tab_logo.png", type: "image/png", sizes: "512x512" },
      { url: "/tab_logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/tab_logo.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: {
    default: "LabelCropOnline – Free Shipping Label & PDF Cropper for Meesho & Flipkart",
    template: "%s | LabelCropOnline",
  },
  description:
    "Free online tool to crop Meesho & Flipkart shipping labels for 4x6 thermal printers. Merge, split, compress, rotate PDF files instantly in your browser — no uploads, 100% private.",
  keywords: [
    "shipping label cropper",
    "crop shipping labels online",
    "meesho label crop",
    "flipkart label crop",
    "bulk label processing",
    "PDF label crop",
    "merge pdf online",
    "split pdf online",
    "compress pdf free",
    "rotate pdf online",
    "pdf to image converter",
    "4x6 thermal label crop",
    "ecommerce label tool india",
    "labelcroponline",
  ],
  authors: [{ name: "LabelCropOnline", url: "https://www.labelcroponline.com" }],
  creator: "LabelCropOnline",
  // Google Search Console verification
  verification: {
    google: "_jeH06Tr6QZ_HPu5PidRRKMoTRhkD0M_5U6-CybEDKw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://www.labelcroponline.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com",
    siteName: "LabelCropOnline",
    title: "LabelCropOnline – Free Shipping Label & PDF Cropper for Meesho & Flipkart",
    description:
      "Crop Meesho & Flipkart shipping labels for 4x6 thermal printers. Merge, split, compress, rotate PDFs instantly in your browser — free, fast, and secure.",
    images: [
      {
        url: "/labelcroponline1.png",
        width: 1200,
        height: 630,
        alt: "LabelCropOnline – Free Shipping Label & PDF Processing Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabelCropOnline – Free Shipping Label & PDF Cropper",
    description:
      "Crop Meesho & Flipkart shipping labels for 4x6 thermal printers. Merge, split, compress PDFs — free, fast, browser-based.",
    images: ["/labelcroponline1.png"],
    creator: "@labelcroponline",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LabelCropOnline",
    url: "https://www.labelcroponline.com",
    description:
      "Free online tool to crop, resize, merge, and bulk-process shipping labels and PDF documents for ecommerce sellers.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.labelcroponline.com/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LabelCropOnline",
    url: "https://www.labelcroponline.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.labelcroponline.com/tab_logo.png",
      width: 512,
      height: 512,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-99095-20532",
      contactType: "customer support",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://www.facebook.com/labelcroponline",
      "https://www.instagram.com/labelcroponline",
      "https://twitter.com/labelcroponline",
      "https://www.linkedin.com/company/labelcroponline",
    ],
    email: "labelcroponline@gmail.com",
    foundingDate: "2024",
    areaServed: "IN",
    knowsAbout: [
      "Shipping Label Processing",
      "PDF Cropping",
      "Ecommerce Operations",
      "Thermal Printing",
    ],
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="_jeH06Tr6QZ_HPu5PidRRKMoTRhkD0M_5U6-CybEDKw"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Google AdSense — uncomment and replace pub-XXXXXXXXXXXXXXXX with your actual publisher ID after AdSense approval */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
      </head>
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



