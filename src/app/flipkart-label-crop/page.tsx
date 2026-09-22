import type { Metadata } from "next";
import FlipkartLabelCropPage from "@/components/flipkart/FlipkartLabelCropClient";

export const metadata: Metadata = {
  title: "Flipkart Label Crop – Free Shipping Label Cropper for 4x6 Thermal Printers",
  description:
    "Crop Flipkart shipping labels for 4x6 thermal sticker printers. Auto-detect Ekart, Delhivery, Shadowfax. Sort by SKU, batch process hundreds of labels instantly. Browser-only, zero uploads.",
  keywords: [
    "flipkart label crop",
    "flipkart shipping label crop",
    "flipkart 4x6 label",
    "flipkart seller hub label crop",
    "flipkart thermal label print",
    "flipkart label crop tool free",
    "crop flipkart label online",
    "flipkart label resize",
    "flipkart sticker label print",
    "flipkart ekart label crop",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/flipkart-label-crop" },
  openGraph: {
    title: "Flipkart Label Crop – Free 4x6 Thermal Label Cropper",
    description:
      "Crop Flipkart shipping labels for thermal sticker printers. Batch process hundreds of labels. Sort by SKU. 100% browser-based.",
    url: "https://www.labelcroponline.com/flipkart-label-crop",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Flipkart Label Crop Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flipkart Label Crop – Free Thermal Label Cropper",
    description: "Crop Flipkart shipping labels for 4x6 thermal printers. Sort by SKU. Free, browser-based.",
    images: ["/labelcroponline1.png"],
  },
};

function FlipkartJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Flipkart Label Crop", "item": "https://www.labelcroponline.com/flipkart-label-crop" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Flipkart Label Crop",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/flipkart-label-crop",
        "description": "Free online tool to crop Flipkart shipping labels for 4x6 thermal sticker printers. Supports batch processing, SKU sorting, and Flipkart courier partners including Ekart and Delhivery."
      },
      {
        "@type": "HowTo",
        "name": "How to Crop Flipkart Shipping Labels",
        "step": [
          { "@type": "HowToStep", "name": "Upload PDF", "text": "Upload your Flipkart shipping label PDF file." },
          { "@type": "HowToStep", "name": "Choose crop settings", "text": "Select crop mode and output format for your thermal printer." },
          { "@type": "HowToStep", "name": "Download", "text": "Download the cropped PDF, ready for your 4x6 thermal printer." }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I crop Flipkart shipping labels for thermal printing?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your Flipkart label PDF to LabelCropOnline, select your crop mode, and download the cropped 4x6 thermal label. No software installation needed." }
          },
          {
            "@type": "Question",
            "name": "Does this tool support Flipkart Ekart labels?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Flipkart Label Crop tool automatically detects and handles Ekart, Delhivery, and other Flipkart courier partner labels." }
          },
          {
            "@type": "Question",
            "name": "Is my data safe?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. All processing happens in your browser. No files are ever uploaded to a server." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function FlipkartLabelCropRoute() {
  return (
    <>
      <FlipkartJsonLd />
      <FlipkartLabelCropPage />
    </>
  );
}
