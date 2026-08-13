import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us – Our Mission, Vision & Story",
    description:
        "Learn about LabelCropOnline – our mission to simplify shipping label and document processing for ecommerce sellers, online businesses, and warehouses across India and beyond.",
    keywords: [
        "about labelcroponline",
        "label crop company",
        "shipping label company india",
        "ecommerce label tool company",
        "document processing startup",
        "label processing platform",
    ],
    alternates: { canonical: "https://www.labelcroponline.com/about-us" },
    openGraph: {
        url: "https://www.labelcroponline.com/about-us",
        title: "About LabelCropOnline – Our Mission, Vision & Story",
        description:
            "We are building a simple, fast, and reliable solution for businesses that regularly work with shipping labels and order documents.",
    },
    twitter: {
        title: "About LabelCropOnline – Our Mission & Story",
        description:
            "We are building a simple, fast, and reliable solution for businesses that regularly work with shipping labels and order documents.",
    },
};

export default function AboutUs() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <h1>About Us</h1>
        </div>
    )
}