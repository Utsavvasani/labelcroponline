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

const sections = [
    {
        id: "who-we-are",
        title: "Who We Are",
        content:
            "LabelCropOnline is an online platform focused on making shipping label and document processing faster, simpler, and more efficient for ecommerce businesses. Our platform provides easy-to-use tools that help sellers crop, resize, organize, split, and process shipping labels without relying on time-consuming manual work. As online businesses handle increasing numbers of orders every day, managing shipping documents can become repetitive and inefficient. LabelCropOnline is built to solve this problem by providing practical automation that helps businesses save time and streamline their order-fulfillment workflow.",
    },
    {
        id: "what-we-do",
        title: "What We Do",
        content:
            "LabelCropOnline provides online tools designed specifically for processing shipping labels and related documents. Users can upload supported files, select the required operation, process their documents, and download the resulting files quickly and conveniently. Our platform is designed to support individual sellers, small businesses, growing ecommerce brands, warehouses, and larger operations that regularly handle shipping labels and order documents.",
    },
    {
        id: "our-vision",
        title: "Our Vision",
        content:
            "Our vision is to become a trusted global platform for smart, efficient, and accessible shipping-label and document-processing solutions. We believe technology should simplify everyday business operations. By continuously improving automation and introducing useful features, we aim to help businesses reduce repetitive work and focus more on serving customers and growing their business.",
    },
    {
        id: "our-mission",
        title: "Our Mission",
        content:
            "Our mission is to provide simple, reliable, and efficient tools that make label processing easier for every ecommerce seller. We focus on creating an intuitive user experience, efficient processing, responsible data handling, and continuous product improvement. Our goal is to turn complex or repetitive document-processing tasks into simple workflows that anyone can use.",
    },
    {
        id: "why-labelcroponline",
        title: "Why LabelCropOnline?",
        content:
            "Simple: Easy-to-use tools designed without unnecessary complexity. Fast: Designed to reduce the time spent on repetitive label-processing tasks. Efficient: Automates common document-processing workflows and helps improve productivity. Reliable: Built with a focus on consistent performance and dependable processing. Privacy-Focused: We understand that shipping labels can contain business and customer information, so responsible data handling and security are important parts of our approach.",
    },
    {
        id: "our-goal",
        title: "Our Goal",
        content:
            "Our goal is simple: help ecommerce businesses save time and work smarter. We are continuously working to improve LabelCropOnline with better automation, new document-processing capabilities, and features that address the real needs of online sellers. As LabelCropOnline grows, we will continue expanding our capabilities to support more document formats, workflows, integrations, and business requirements.",
    },
];

export default function AboutUs() {
    return (
        <>
            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-14">
                    <p className="text-sm font-semibold tracking-widest uppercase text-black mb-3">
                        Our Story
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-4">
                        About Us
                    </h1>
                    <p className="text-black text-base max-w-xl leading-relaxed  text-justify">
                        We are focused on making shipping label and document processing faster,
                        simpler, and more efficient for every ecommerce business.
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-14">
                <div className="flex gap-12 items-start">

                    {/* Table of Contents — desktop sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-black mb-4">
                                Contents
                            </p>
                            <nav className="space-y-2">
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="block text-xs text-black hover:text-[#051448] hover:font-semibold transition-colors leading-snug py-0.5"
                                    >
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Intro box */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
                            <p className="text-sm text-black leading-relaxed  text-justify">
                                LabelCropOnline is built for ecommerce sellers who want to spend
                                less time on manual document work and more time growing their
                                business. Our tools are simple, reliable, and designed for everyday
                                use.
                            </p>
                        </div>

                        {/* Sections */}
                        <div className="space-y-10">
                            {sections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-1 h-6 bg-[#051448] rounded-full mt-1 flex-shrink-0" />
                                        <div>
                                            <h2 className="text-lg font-semibold text-black mb-3">
                                                {section.title}
                                            </h2>
                                            <p className="text-black text-sm leading-relaxed  text-justify">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-8 border-b border-gray-100" />
                                </section>
                            ))}
                        </div>

                        {/* Footer note */}
                        <p className="mt-10 text-xs text-black/70 italic">
                            LabelCropOnline — Simplify Your Labels. Streamline Your Business.
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}