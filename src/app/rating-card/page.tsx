import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rating Card Studio – Create Custom 5-Star Review Cards for Your Shop",
  description:
    "Design and print professional customer review insert cards for your Meesho, Flipkart, or Amazon shipments. Customise templates, add QR codes, and download print-ready PDFs.",
  keywords: [
    "rating card creator",
    "5 star review card maker",
    "customer review insert card",
    "meesho review card",
    "flipkart review card",
    "amazon review card",
    "review request card print",
    "thank you card ecommerce",
    "seller review card design",
    "review qr code card",
  ],
  alternates: { canonical: "https://www.labelcroponline.com/rating-card" },
  openGraph: {
    title: "Rating Card Studio – Custom 5-Star Review Cards",
    description: "Design and print customer review insert cards for Meesho, Flipkart, and Amazon shipments. Free, browser-based.",
    url: "https://www.labelcroponline.com/rating-card",
    images: [{ url: "/labelcroponline1.png", width: 1200, height: 630, alt: "Rating Card Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rating Card Studio – Custom Review Cards",
    description: "Create custom 5-star review insert cards for your shipments. Free, print-ready PDFs.",
    images: ["/labelcroponline1.png"],
  },
};

function RatingCardJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.labelcroponline.com" },
          { "@type": "ListItem", "position": 2, "name": "Rating Card Studio", "item": "https://www.labelcroponline.com/rating-card" }
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Rating Card Studio",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any (Browser-based)",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "url": "https://www.labelcroponline.com/rating-card",
        "description": "Free online tool to design and print custom customer review insert cards for ecommerce shipments. Supports QR codes and multiple print layouts."
      }
    ]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Rating Card Studio page — client component will be added here once built
export default function RatingCardRoute() {
  return (
    <>
      <RatingCardJsonLd />
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#051448] mb-4">Rating Card Studio</h1>
        <p className="text-gray-600">Coming soon — design custom review insert cards for your shipments.</p>
      </div>
    </>
  );
}
