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

import { RelatedTools } from "@/components/shared/RelatedTools";

// Rating Card Studio page — client component will be added here once built
export default function RatingCardRoute() {
  return (
    <>
      <RatingCardJsonLd />
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-12">
        <div className="border border-[#051448] rounded-md bg-white p-8 sm:p-12 text-center shadow-xs">
          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 mb-4">
            Under Development
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#051448] mb-4">
            Rating Card Studio
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Design and print 5-star customer review insert cards with dynamic QR codes, coupon rewards, and custom branding for your Meesho, Flipkart, and Amazon parcels.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/meesho-label-crop"
              className="px-5 py-2.5 rounded-md bg-[#051448] text-white text-xs sm:text-sm font-semibold hover:bg-[#071a5e] transition-colors"
            >
              Go to Meesho Label Cropper
            </a>
            <a
              href="/flipkart-label-crop"
              className="px-5 py-2.5 rounded-md border border-[#051448] text-[#051448] text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Go to Flipkart Label Cropper
            </a>
          </div>
        </div>

        {/* Full navigation to all other tools */}
        <RelatedTools currentToolId="rating-card" />
      </div>
    </>
  );
}
