import type { Metadata } from "next";
import MeeshoLabelCropPage from "@/components/meesho/MeeshoLabelCropClient";

export const metadata: Metadata = {
  title: "Meesho Label Crop – Free Shipping Label Cropper for 4x6 Thermal Printers",
  description:
    "Crop Meesho shipping labels for 4x6 thermal sticker printers. Auto-detects Delhivery, Shadowfax, Xpressbees. Sort by SKU, batch process 100+ pages. 100% browser-based, no upload.",
  keywords: [
    "meesho label crop",
    "meesho shipping label crop",
    "meesho 4x6 label crop",
    "meesho supplier panel label",
    "meesho thermal label print",
    "meesho label crop tool free",
    "crop meesho label online",
    "meesho label resize",
    "meesho label sticker print",
    "meesho delhivery label crop",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/meesho-label-crop" },
  openGraph: {
    title: "Meesho Label Crop – Free 4x6 Thermal Label Cropper",
    description:
      "Crop Meesho shipping labels for thermal sticker printers. Batch process 100+ labels. Sort by SKU. 100% browser-based, zero server uploads.",
    url: "https://www.labelcroponline.com/meesho-label-crop",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Meesho Label Crop Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meesho Label Crop – Free Thermal Label Cropper",
    description: "Crop Meesho shipping labels for 4x6 thermal printers. Sort by SKU. Free, browser-based.",
    images: ["/labelcroponline1.png"],
  },
};

function MeeshoJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Meesho Label Crop", "item": "https://www.labelcroponline.com/meesho-label-crop" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Meesho Label Crop",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/meesho-label-crop",
        "description": "Free online tool to crop Meesho shipping labels for 4x6 thermal sticker printers. Supports batch processing, SKU sorting, and all major Meesho courier partners."
      },
      {
        "@type": "HowTo",
        "name": "How to Crop Meesho Shipping Labels",
        "description": "Step-by-step guide to crop your Meesho shipping label PDF for 4x6 thermal printing",
        "step": [
          { "@type": "HowToStep", "name": "Upload PDF", "text": "Upload your Meesho shipping label PDF file by dragging it onto the tool or clicking the upload area." },
          { "@type": "HowToStep", "name": "Select crop mode", "text": "Choose your preferred crop mode: Standard (top half), Tax Invoice (split invoice + label), or Custom crop area." },
          { "@type": "HowToStep", "name": "Download", "text": "Click Download to save your cropped labels as a ready-to-print PDF for your 4x6 thermal printer." }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Meesho label crop?",
            "acceptedAnswer": { "@type": "Answer", "text": "Meesho label crop is the process of extracting only the shipping label portion from a Meesho order PDF, resizing it to fit a 4x6 thermal sticker printer. Our free tool does this automatically in your browser." }
          },
          {
            "@type": "Question",
            "name": "Is this tool free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes, LabelCropOnline Meesho Label Crop tool is completely free with no signup or subscription required." }
          },
          {
            "@type": "Question",
            "name": "Are my files uploaded to a server?",
            "acceptedAnswer": { "@type": "Answer", "text": "No. All processing happens entirely in your browser using JavaScript. Your PDF files are never uploaded to any server." }
          },
          {
            "@type": "Question",
            "name": "Which courier partners are supported?",
            "acceptedAnswer": { "@type": "Answer", "text": "The tool auto-detects and supports all major Meesho courier partners including Delhivery, Shadowfax, Xpressbees, and Valmo." }
          },
          {
            "@type": "Question",
            "name": "Can I process multiple labels at once?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can upload a multi-page Meesho PDF and all labels will be batch-processed and cropped in a single operation." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function MeeshoLabelCropRoute() {
  return (
    <>
      <MeeshoJsonLd />
      <MeeshoLabelCropPage />
    </>
  );
}
