import type { Metadata } from "next";
import MergePdfPage from "@/components/pdf-tools/MergePdfClient";

export const metadata: Metadata = {
  title: "Merge PDF Online Free – Combine Multiple PDF Files Instantly",
  description:
    "Merge multiple PDF files into one document online for free. Drag, reorder, and combine PDFs instantly in your browser. No file upload, 100% private and secure.",
  keywords: [
    "merge pdf online",
    "combine pdf files free",
    "merge pdf free",
    "pdf merger online",
    "join pdf files",
    "combine multiple pdfs",
    "pdf combiner online",
    "merge pdfs no upload",
    "online pdf merge tool",
    "free pdf merger",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/merge-pdf" },
  openGraph: {
    title: "Merge PDF Online Free – Combine Multiple PDF Files",
    description: "Drag, reorder, and merge PDFs into one file instantly in your browser. Free, no signup, no upload.",
    url: "https://www.labelcroponline.com/merge-pdf",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Merge PDF Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online Free",
    description: "Combine multiple PDF files into one instantly. Free, browser-based, no upload.",
    images: ["/labelcroponline1.png"],
  },
};

function MergePdfJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Merge PDF", "item": "https://www.labelcroponline.com/merge-pdf" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Merge PDF Online",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/merge-pdf",
        "description": "Free online PDF merger. Combine multiple PDF files into one document instantly in your browser with drag-and-drop reordering."
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I merge PDF files online for free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Upload your PDF files to LabelCropOnline Merge PDF tool, arrange them in your preferred order by dragging, then click Merge & Download to get the combined PDF." }
          },
          {
            "@type": "Question",
            "name": "Is there a limit to how many PDFs I can merge?",
            "acceptedAnswer": { "@type": "Answer", "text": "No hard limit. You can merge as many PDFs as your browser memory allows. The tool processes everything locally in your browser." }
          },
          {
            "@type": "Question",
            "name": "Are my files uploaded to a server when I merge PDFs?",
            "acceptedAnswer": { "@type": "Answer", "text": "No. All PDF merging happens entirely in your browser. Your files never leave your device and are never uploaded to any server." }
          }
        ]
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function MergePdfRoute() {
  return (
    <>
      <MergePdfJsonLd />
      <MergePdfPage />
    </>
  );
}
