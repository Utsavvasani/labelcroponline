import type { Metadata } from "next";
import RotatePdfPage from "@/components/pdf-tools/RotatePdfClient";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free – Rotate PDF Pages 90° or 180° Instantly",
  description:
    "Rotate PDF pages online for free. Rotate individual pages or all pages 90, 180, or 270 degrees instantly in your browser. No upload, 100% secure and private.",
  keywords: [
    "rotate pdf online",
    "rotate pdf pages",
    "rotate pdf free",
    "pdf rotator online",
    "rotate pdf 90 degrees",
    "flip pdf pages online",
    "rotate pdf without software",
    "online pdf page rotator",
    "rotate all pages in pdf",
    "pdf orientation fix online",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/rotate-pdf" },
  openGraph: {
    title: "Rotate PDF Online Free – Rotate Pages 90° or 180°",
    description: "Rotate PDF pages 90, 180, or 270 degrees online. Free, browser-based, no upload.",
    url: "https://www.labelcroponline.com/rotate-pdf",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Rotate PDF Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online Free",
    description: "Rotate PDF pages 90°, 180°, or 270° instantly. Free, no upload required.",
    images: ["/labelcroponline1.png"],
  },
};

function RotatePdfJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Rotate PDF", "item": "https://www.labelcroponline.com/rotate-pdf" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Rotate PDF Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/rotate-pdf",
        "description": "Free online PDF rotator. Rotate individual or all pages 90, 180, or 270 degrees in your browser instantly."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I rotate a PDF page online?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF, select the pages you want to rotate, choose 90°, 180°, or 270°, and download the result. No software needed." }
          },
          {
            "@type": "Question",
            "name": "Can I rotate only specific pages in a PDF?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can select individual pages to rotate, or rotate all pages at once." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function RotatePdfRoute() {
  return (
    <>
      <RotatePdfJsonLd />
      <RotatePdfPage />
    </>
  );
}
