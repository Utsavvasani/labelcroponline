import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us – Get in Touch with LabelCropOnline",
    description:
        "Have questions or need support? Contact the LabelCropOnline team via email or phone. We are here to help with label processing, document tools, and account queries.",
    keywords: [
        "contact labelcroponline",
        "label crop support",
        "shipping label tool support",
        "labelcroponline contact",
        "customer support label processing",
    ],
    alternates: { canonical: "https://www.labelcroponline.com/contact-us" },
    openGraph: {
        url: "https://www.labelcroponline.com/contact-us",
        title: "Contact LabelCropOnline – We're Here to Help",
        description:
            "Reach out to the LabelCropOnline team for support, questions, or feedback about our shipping label and document processing tools.",
    },
    twitter: {
        title: "Contact LabelCropOnline – We're Here to Help",
        description:
            "Reach out to the LabelCropOnline team for support, questions, or feedback about our shipping label and document processing tools.",
    },
};

export default function ContactUs() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <h1>Contact Us</h1>
        </div>
    )
}