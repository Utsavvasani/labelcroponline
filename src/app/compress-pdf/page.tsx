import type { Metadata } from "next";
import CompressPdfPage from "@/components/pdf-tools/CompressPdfClient";

export const metadata: Metadata = {
  title: "Compress PDF Online Free – Reduce PDF File Size Without Quality Loss",
  description:
    "Compress PDF files online for free. Reduce PDF size instantly in your browser. No upload required. Shrink large PDFs for email, WhatsApp, and website uploading.",
  keywords: [
    "compress pdf online",
    "reduce pdf size",
    "compress pdf free",
    "pdf compressor online",
    "shrink pdf size",
    "pdf size reducer",
    "make pdf smaller online",
    "compress pdf without losing quality",
    "pdf file size reducer free",
    "reduce pdf file size online",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/compress-pdf" },
  openGraph: {
    title: "Compress PDF Online Free – Reduce File Size Instantly",
    description: "Compress PDFs to reduce file size instantly in your browser. Free, no upload, no quality loss.",
    url: "https://www.labelcroponline.com/compress-pdf",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Compress PDF Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free",
    description: "Reduce PDF file size instantly. Free, browser-based, no upload.",
    images: ["/labelcroponline1.png"],
  },
};

function CompressPdfJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Compress PDF", "item": "https://www.labelcroponline.com/compress-pdf" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Compress PDF Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/compress-pdf",
        "description": "Free online PDF compressor. Reduce the file size of any PDF instantly in your browser without uploading to a server."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I compress a PDF to a smaller size?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF to LabelCropOnline Compress PDF tool, choose your compression level, and download the reduced-size PDF. Everything happens in your browser." }
          },
          {
            "@type": "Question",
            "name": "Does compressing a PDF reduce its quality?",
            "acceptedAnswer": { "@type": "Answer", "text": "Our compression removes redundant data without visibly affecting text clarity. For shipping labels, the quality remains print-ready." }
          },
          {
            "@type": "Question",
            "name": "What is the maximum PDF size I can compress?",
            "acceptedAnswer": { "@type": "Answer", "text": "There is no strict file size limit as the tool processes everything in your browser, but very large files (over 500MB) may be slow depending on your device." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function CompressPdfRoute() {
  return (
    <>
      <CompressPdfJsonLd />
      <CompressPdfPage />
    </>
  );
}
