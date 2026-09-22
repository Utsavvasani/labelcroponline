import type { Metadata } from "next";
import PdfToImagesPage from "@/components/pdf-tools/PdfToImagesClient";

export const metadata: Metadata = {
  title: "PDF to Images Online Free – Convert PDF Pages to PNG or JPEG",
  description:
    "Convert PDF to PNG, JPEG, or WebP images online for free. Each PDF page becomes a high-quality image. Download all as a ZIP file. Browser-based, no upload.",
  keywords: [
    "pdf to image online",
    "convert pdf to png",
    "pdf to jpg online free",
    "pdf to jpeg converter",
    "pdf page to image",
    "pdf to png free",
    "export pdf as images",
    "pdf to picture converter",
    "pdf pages to images download",
    "free pdf image extractor",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/pdf-to-images" },
  openGraph: {
    title: "PDF to Images Online Free – Convert PDF to PNG/JPEG",
    description: "Convert every PDF page to a high-quality image. Download as ZIP. Free, browser-based.",
    url: "https://www.labelcroponline.com/pdf-to-images",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "PDF to Images Converter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Images Online Free",
    description: "Convert PDF pages to PNG/JPEG images. Download all as ZIP. Free, no upload.",
    images: ["/labelcroponline1.png"],
  },
};

function PdfToImagesJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "PDF to Images", "item": "https://www.labelcroponline.com/pdf-to-images" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "PDF to Images Converter",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/pdf-to-images",
        "description": "Free online tool to convert PDF pages to high-quality PNG or JPEG images. Download all images as a ZIP file."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I convert a PDF to images online?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF to LabelCropOnline PDF to Images tool, choose the image format (PNG or JPEG), and download. Each page becomes a separate image." }
          },
          {
            "@type": "Question",
            "name": "What image formats are supported?",
            "acceptedAnswer": { "@type": "Answer", "text": "You can export PDF pages as PNG (lossless) or JPEG (smaller file size) images." }
          },
          {
            "@type": "Question",
            "name": "Can I download all pages at once?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. All converted images are bundled into a ZIP file for easy one-click download." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function PdfToImagesRoute() {
  return (
    <>
      <PdfToImagesJsonLd />
      <PdfToImagesPage />
    </>
  );
}
