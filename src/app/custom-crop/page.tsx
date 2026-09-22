import type { Metadata } from "next";
import CustomCropPage from "@/components/pdf-tools/CustomCropClient";

export const metadata: Metadata = {
  title: "Custom PDF Crop Studio – Crop Any Area of a PDF Online Free",
  description:
    "Crop any custom area from a PDF page online. Draw a crop box, set precise coordinates, and extract your desired region. Free, browser-based, no upload.",
  keywords: [
    "custom pdf crop",
    "crop pdf area online",
    "pdf crop tool",
    "crop specific area pdf",
    "pdf crop region",
    "trim pdf pages online",
    "pdf crop online free",
    "extract area from pdf",
    "crop pdf to custom size",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/custom-crop" },
  openGraph: {
    title: "Custom PDF Crop Studio – Crop Any PDF Area Online",
    description: "Draw a crop box and extract any custom area from a PDF. Free, browser-based, no upload.",
    url: "https://www.labelcroponline.com/custom-crop",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Custom PDF Crop Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom PDF Crop Studio",
    description: "Crop any custom area from a PDF online. Free, browser-based, no upload.",
    images: ["/labelcroponline1.png"],
  },
};

function CustomCropJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Custom Crop Studio", "item": "https://www.labelcroponline.com/custom-crop" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Custom PDF Crop Studio",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/custom-crop",
        "description": "Free browser-based tool to crop any custom rectangular area from a PDF page. Draw a selection box or enter precise coordinates."
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function CustomCropRoute() {
  return (
    <>
      <CustomCropJsonLd />
      <CustomCropPage />
    </>
  );
}
