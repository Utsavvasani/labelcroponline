import type { Metadata } from "next";
import SplitPdfPage from "@/components/pdf-tools/SplitPdfClient";

export const metadata: Metadata = {
  title: "Split PDF Online Free – Extract & Separate PDF Pages Instantly",
  description:
    "Split a PDF into individual pages or custom page ranges online for free. Extract specific pages from any PDF instantly in your browser. No upload, 100% private.",
  keywords: [
    "split pdf online",
    "split pdf free",
    "extract pdf pages",
    "separate pdf pages",
    "pdf splitter online",
    "pdf page extractor",
    "cut pdf pages online",
    "pdf split tool free",
    "extract pages from pdf",
    "divide pdf online",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/split-pdf" },
  openGraph: {
    title: "Split PDF Online Free – Extract PDF Pages Instantly",
    description: "Split PDF into individual pages or ranges online. Free, browser-based, no upload.",
    url: "https://www.labelcroponline.com/split-pdf",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Split PDF Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free",
    description: "Extract and separate PDF pages instantly. Free, browser-based, no upload.",
    images: ["/labelcroponline1.png"],
  },
};

function SplitPdfJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Split PDF", "item": "https://www.labelcroponline.com/split-pdf" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Split PDF Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/split-pdf",
        "description": "Free online PDF splitter. Extract individual pages or custom ranges from any PDF instantly in your browser."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I split a PDF online for free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF to LabelCropOnline Split PDF, select the pages or range you want to extract, and click Download. Everything runs in your browser." }
          },
          {
            "@type": "Question",
            "name": "Can I extract specific pages from a PDF?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can select individual pages or enter custom page ranges like 1-3, 5, 7-10 to extract exactly the pages you need." }
          },
          {
            "@type": "Question",
            "name": "Is my PDF data safe when I split it?",
            "acceptedAnswer": { "@type": "Answer", "text": "Completely. Your PDF is processed entirely in your browser using JavaScript. No data is ever sent to a server." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function SplitPdfRoute() {
  return (
    <>
      <SplitPdfJsonLd />
      <SplitPdfPage />
    </>
  );
}
