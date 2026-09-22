import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online — Combine Multiple PDF Files Free | LabelCropOnline",
  description:
    "Merge multiple PDF files into one document online. Reorder files by drag-and-drop, combine shipping labels, packing slips, and invoices. Free, instant, 100% browser-based PDF merger.",
  keywords: [
    "merge pdf online",
    "combine pdf files",
    "merge pdf free",
    "pdf merger online",
    "join pdf files",
    "combine shipping label pdfs",
    "merge documents online",
    "pdf combine free",
    "merge multiple pdfs into one",
    "pdf merger tool india",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/merge-pdf",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/merge-pdf",
    siteName: "LabelCropOnline",
    title: "Merge PDF Online — Combine Multiple PDF Files Free | LabelCropOnline",
    description:
      "Combine multiple PDF files into one. Drag to reorder. Download instantly. Free, browser-based, no upload.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Merge PDF Online – LabelCropOnline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online – Free PDF Combiner",
    description:
      "Merge multiple PDF files into one online for free. Reorder, combine, and download in seconds. No upload required.",
    images: ["/og-image.png"],
  },
};

export default function MergePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF Merger Tool",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    url: "https://www.labelcroponline.com/merge-pdf",
    description:
      "Free online PDF merger tool. Combine multiple shipping labels, packing slips, or document PDFs into a single file with drag-and-drop reordering.",
    featureList: [
      "Merge multiple PDF files",
      "Drag-and-drop file reordering",
      "Zero quality loss",
      "Download single combined PDF",
      "Zero server upload – 100% browser-based",
    ],
    provider: {
      "@type": "Organization",
      name: "LabelCropOnline",
      url: "https://www.labelcroponline.com",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.labelcroponline.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Merge PDF",
        item: "https://www.labelcroponline.com/merge-pdf",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
