import type { Metadata } from "next";
import ContactUs from "@/components/pdf-tools/ContactUsClient";

export const metadata: Metadata = {
  title: "Contact Us – Get in Touch with LabelCropOnline Support",
  description:
    "Have a question or feedback? Contact LabelCropOnline support team. We are here to help with shipping label tools, PDF processing, and any technical issues.",
  keywords: [
    "contact labelcroponline",
    "labelcroponline support",
    "label crop tool help",
    "pdf tool support",
    "contact shipping label tool",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/contact-us" },
  openGraph: {
    title: "Contact LabelCropOnline Support",
    description: "Reach out to the LabelCropOnline team for help, feedback, or partnership inquiries.",
    url: "https://www.labelcroponline.com/contact-us",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Contact LabelCropOnline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact LabelCropOnline",
    description: "Get support for shipping label tools and PDF processing. We are here to help.",
    images: ["/labelcroponline1.png"],
  },
};

function ContactJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://www.labelcroponline.com/contact-us" }
        ]
      },
      {
        "@type": "ContactPage",
        "name": "Contact LabelCropOnline",
        "url": "https://www.labelcroponline.com/contact-us",
        "description": "Contact the LabelCropOnline support team for questions, feedback, or technical help."
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function ContactUsRoute() {
  return (
    <>
      <ContactJsonLd />
      <ContactUs />
    </>
  );
}
