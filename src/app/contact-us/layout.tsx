import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Get in Touch | LabelCropOnline",
  description:
    "Have a question, feedback, or need support? Contact the LabelCropOnline team. We help ecommerce sellers with shipping label cropping, PDF tools, and order processing queries.",
  keywords: [
    "contact labelcroponline",
    "label crop support",
    "shipping label tool support",
    "pdf tool help",
    "ecommerce label help india",
  ],
  alternates: {
    canonical: "https://www.labelcroponline.com/contact-us",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.labelcroponline.com/contact-us",
    siteName: "LabelCropOnline",
    title: "Contact LabelCropOnline – Get Help & Support",
    description:
      "Reach out to the LabelCropOnline team for support, feedback, or any questions about our shipping label and PDF tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact LabelCropOnline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact LabelCropOnline – Support & Feedback",
    description:
      "Get in touch with the LabelCropOnline team for support, tool feedback, or business inquiries.",
    images: ["/og-image.png"],
  },
};

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
