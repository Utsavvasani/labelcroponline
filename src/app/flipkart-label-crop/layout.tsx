import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flipkart Shipping Label Crop – Bulk PDF Label Cropper for Sellers",
  description:
    "Crop Flipkart Seller Hub shipping label PDFs to 4x6 inch thermal printer format. Bulk process all orders instantly in your browser. 100% free, no upload, barcode-safe vector PDF cropping.",
  keywords: [
    "flipkart label crop",
    "flipkart shipping label cropper",
    "crop flipkart label",
    "flipkart seller label pdf",
    "flipkart 4x6 thermal label",
    "flipkart order label crop online",
    "flipkart seller hub label pdf crop",
    "bulk flipkart label crop",
    "flipkart barcode label crop",
    "flipkart label resize",
    "flipkart shipping label download",
    "flipkart label 100x150",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/flipkart-label-crop",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/flipkart-label-crop",
    siteName: "LabelCropOnline",
    title: "Flipkart Shipping Label Crop – Free Bulk PDF Cropper for Sellers",
    description:
      "Crop Flipkart shipping labels from A4 PDF to 4x6 thermal format instantly. Supports bulk orders, SKU sorting, and custom crop studio. 100% browser-based.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flipkart Label Crop Tool – LabelCropOnline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flipkart Shipping Label Crop – Free Online PDF Cropper",
    description:
      "Bulk crop Flipkart seller label PDFs to 4x6 thermal format. Free, instant, browser-based with 100% barcode accuracy.",
    images: ["/og-image.png"],
    creator: "@labelcroponline",
  },
};

export default function FlipkartLabelCropLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Flipkart Shipping Label Cropper",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    url: "https://www.labelcroponline.com/flipkart-label-crop",
    description:
      "Free online tool to crop Flipkart Seller Hub shipping label PDFs to print-ready 4x6 thermal format. Supports bulk processing, SKU sorting, and custom crop for all courier partners.",
    featureList: [
      "Bulk PDF shipping label cropping",
      "4x6 thermal printer format output",
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
        name: "How do I crop Flipkart shipping labels to 4x6 thermal format?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Upload your Flipkart Seller Hub shipping label PDF on LabelCropOnline, select the 'Label Only' or 'Full with Tax Invoice' crop mode, and click Download. The tool instantly crops and exports a print-ready 4x6 inch (100×150mm) PDF for direct thermal printing.",
        },
      },
      {
        "@type": "Question",
        name: "Does the Flipkart label cropper preserve barcode quality?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. LabelCropOnline crops the PDF at the vector level, preserving 100% of the original barcode geometry. Unlike screenshot-based tools, barcodes scan with 100% first-pass accuracy at all courier and logistics hubs.",
        },
      },
      {
        "@type": "Question",
        name: "Can I bulk crop Flipkart labels for multiple orders at once?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can upload a multi-page Flipkart shipping label PDF containing hundreds of orders, and the tool will process and crop every page simultaneously, producing a single organized output PDF ready to print.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Flipkart label cropper free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the Flipkart shipping label cropper on LabelCropOnline is completely free with no file limits, no watermarks, and no account required.",
        },
      },
      {
        "@type": "Question",
        name: "Are my Flipkart order files safe to upload?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your files never leave your device. All PDF processing happens 100% inside your browser using client-side JavaScript and WebAssembly. No files are sent to or stored on any server.",
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
        name: "Flipkart Label Crop",
        item: "https://www.labelcroponline.com/flipkart-label-crop",
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
