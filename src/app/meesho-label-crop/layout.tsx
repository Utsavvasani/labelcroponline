import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meesho Shipping Label Crop – Bulk PDF Label Cropper for Sellers",
  description:
    "Crop Meesho Supplier Panel shipping label PDFs to 4x6 inch thermal printer format. Auto-detects Delhivery, Shadowfax, Valmo, Xpressbees couriers. 100% free, browser-based, no upload needed.",
  keywords: [
    "meesho label crop",
    "meesho shipping label cropper",
    "crop meesho label",
    "meesho supplier panel label pdf",
    "meesho 4x6 thermal label",
    "meesho order label crop online",
    "meesho label resize",
    "bulk meesho label crop",
    "meesho barcode label crop",
    "meesho delhivery label crop",
    "meesho shadowfax label crop",
    "meesho valmo label crop",
    "meesho xpressbees label crop",
    "meesho label 100x150",
    "meesho thermal printer label",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/meesho-label-crop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/meesho-label-crop",
    siteName: "LabelCropOnline",
    title: "Meesho Shipping Label Crop – Free Bulk PDF Cropper for Sellers",
    description:
      "Crop Meesho shipping labels from A4 PDF to 4x6 thermal format instantly. Auto-detects Delhivery, Shadowfax, Valmo, Xpressbees. 100% browser-based.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meesho Label Crop Tool – LabelCropOnline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meesho Shipping Label Crop – Free Online PDF Cropper",
    description:
      "Bulk crop Meesho supplier label PDFs to 4x6 thermal format. Auto-detects couriers. Free, instant, browser-based.",
    images: ["/og-image.png"],
    creator: "@labelcroponline",
  },
};

export default function MeeshoLabelCropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Meesho Shipping Label Cropper",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    url: "https://www.labelcroponline.com/meesho-label-crop",
    description:
      "Free online tool to crop Meesho Supplier Panel shipping label PDFs to print-ready 4x6 thermal format. Auto-detects Delhivery, Shadowfax, Valmo, Valmo Plus, and Xpressbees courier partners.",
    featureList: [
      "Bulk PDF shipping label cropping",
      "4x6 thermal printer format output",
      "Auto-detection of Delhivery, Shadowfax, Valmo, Xpressbees",
      "100% vector barcode preservation",
      "SKU-based label sorting",
      "Custom crop studio",
      "Zero server upload – 100% browser-based",
    ],
    screenshot: "https://www.labelcroponline.com/og-image.png",
    provider: {
      "@type": "Organization",
      name: "LabelCropOnline",
      url: "https://www.labelcroponline.com",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I crop Meesho shipping labels to 4x6 thermal format?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your Meesho Supplier Panel shipping label PDF on LabelCropOnline, select the crop mode (Label Only, Full with Tax Invoice, or Custom), and click Download. The tool instantly crops and exports a print-ready 4x6 inch (100×150mm) PDF for direct thermal printing.",
        },
      },
      {
        "@type": "Question",
        name: "Does the Meesho label cropper detect courier partners automatically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. LabelCropOnline automatically detects your Meesho courier partner — Delhivery, Shadowfax, Valmo, Valmo Plus, or Xpressbees — and applies the correct crop margins for each label in a bulk PDF.",
        },
      },
      {
        "@type": "Question",
        name: "Can I crop Meesho labels with tax invoice included?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Select 'Full with Tax Invoice' mode to crop and include both the shipping label and tax invoice on the same page, or choose 'Label Only' to extract just the shipping label for thermal printing.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Meesho label cropper free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No file size limits, no watermarks, no registration required. Unlimited use for all Meesho sellers.",
        },
      },
      {
        "@type": "Question",
        name: "Are my Meesho order details and customer addresses kept private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100% private. All PDF parsing and cropping runs entirely inside your browser. Your files and customer data never leave your device and are never uploaded to any server.",
        },
      },
    ],
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
        name: "Meesho Label Crop",
        item: "https://www.labelcroponline.com/meesho-label-crop",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
