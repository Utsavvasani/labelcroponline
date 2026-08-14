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

const whyCards = [
    {
        icon: "✦",
        title: "Simple",
        desc: "Easy-to-use tools designed without unnecessary complexity. Anyone can get started instantly.",
    },
    {
        icon: "⚡",
        title: "Fast",
        desc: "Designed to reduce the time spent on repetitive label-processing tasks — process in seconds.",
    },
    {
        icon: "⚙️",
        title: "Efficient",
        desc: "Automates common document-processing workflows and helps improve overall productivity.",
    },
    {
        icon: "🛡",
        title: "Reliable",
        desc: "Built with a focus on consistent performance and dependable processing you can count on.",
    },
    {
        icon: "🔒",
        title: "Privacy-Focused",
        desc: "Shipping labels contain business and customer info. We take responsible data handling seriously.",
    },
    {
        icon: "📈",
        title: "Scalable",
        desc: "Whether you process a few labels or thousands of documents daily, we grow with your business.",
    },
];

export default function AboutUs() {
    return (
        <>
            {/* ── Hero ── */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-14">
                    <p className="text-sm font-semibold tracking-widest uppercase text-[#051448]/50 mb-3">
                        Our Story
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#051448] mb-4">
                        About LabelCropOnline
                    </h1>
                    <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
                        We are focused on making shipping label and document processing faster,
                        simpler, and more efficient for ecommerce businesses — helping sellers
                        save time and streamline their order-fulfillment workflow.
                    </p>
                </div>
            </div>

            {/* ── Who We Are ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#051448]/50 mb-3">
                            Who We Are
                        </p>
                        <h2 className="text-3xl font-bold text-[#051448] mb-5 leading-tight">
                            Simplifying Shipping Label Processing
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            As online businesses handle increasing numbers of orders every day,
                            managing shipping documents can become repetitive and inefficient.
                            LabelCropOnline is built to solve this problem by providing practical
                            automation that helps businesses save time and reduce manual work.
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Our platform supports individual sellers, small businesses, growing
                            ecommerce brands, warehouses, and larger operations that regularly
                            handle shipping labels and order documents.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: "Fast", label: "Document Processing" },
                            { value: "Simple", label: "User Experience" },
                            { value: "Bulk", label: "Label Operations" },
                            { value: "Secure", label: "Data Handling" },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100 rounded-xl p-6 text-center"
                            >
                                <p className="text-2xl font-bold text-[#051448] mb-1">{item.value}</p>
                                <p className="text-xs text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── What We Do ── */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-[1200px] mx-auto px-6 py-16">
                    <div className="text-center mb-10">
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#051448]/50 mb-2">
                            What We Do
                        </p>
                        <h2 className="text-3xl font-bold text-[#051448]">
                            Tools Built for Shipping Labels
                        </h2>
                        <p className="text-slate-500 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
                            Upload your files, select the required operation, process your
                            documents, and download the results — quickly and conveniently.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                        {[
                            {
                                title: "Crop & Resize",
                                desc: "Precisely crop label areas from shipping documents and resize them to your exact requirements.",
                            },
                            {
                                title: "Bulk Processing",
                                desc: "Handle large batches of labels, invoices, and order documents in a single operation.",
                            },
                            {
                                title: "Split & Organise",
                                desc: "Split, sort, and merge documents to match your specific workflow and printer requirements.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                                <div className="w-8 h-1 bg-[#051448] rounded-full mb-4" />
                                <h3 className="font-semibold text-[#051448] mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Mission & Vision ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Mission */}
                    <div className="bg-[#051448] text-white rounded-xl p-8">
                        <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-3">
                            Our Mission
                        </p>
                        <h2 className="text-2xl font-bold mb-4 leading-tight">
                            Provide simple, reliable, and efficient tools that make label
                            processing easier for every ecommerce seller.
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            We focus on creating an intuitive user experience, efficient
                            processing, responsible data handling, and continuous product
                            improvement — turning complex tasks into simple workflows that
                            anyone can use.
                        </p>
                    </div>

                    {/* Vision + Goal stacked */}
                    <div className="flex flex-col gap-5">
                        <div className="border border-slate-100 rounded-xl p-7 flex-1">
                            <p className="text-xs font-semibold tracking-widest uppercase text-[#051448]/50 mb-3">
                                Our Vision
                            </p>
                            <h3 className="text-xl font-bold text-[#051448] mb-3 leading-tight">
                                A trusted global platform for smart, efficient, and accessible
                                label-processing solutions.
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                We believe technology should simplify everyday business operations.
                                By continuously improving automation, we help businesses reduce
                                repetitive work and focus on serving customers.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-7 flex-1">
                            <p className="text-xs font-semibold tracking-widest uppercase text-[#051448]/50 mb-3">
                                Our Goal
                            </p>
                            <h3 className="text-xl font-bold text-[#051448] mb-3 leading-tight">
                                Help ecommerce businesses save time and work smarter.
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                We are continuously working to improve LabelCropOnline with better
                                automation, new document-processing capabilities, and features that
                                address the real needs of online sellers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Why LabelCropOnline ── */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-[1200px] mx-auto px-6 py-16">
                    <div className="text-center mb-10">
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#051448]/50 mb-2">
                            Why Choose Us
                        </p>
                        <h2 className="text-3xl font-bold text-[#051448]">
                            Why LabelCropOnline?
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {whyCards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <span className="text-2xl mb-4 block">{card.icon}</span>
                                <h3 className="font-semibold text-[#051448] mb-2">{card.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA Banner ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-16">
                <div className="bg-gradient-to-br from-[#051448] to-[#0a2070] rounded-2xl p-10 text-center text-white">
                    <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
                        Our Commitment
                    </p>
                    <h2 className="text-3xl font-bold mb-4 max-w-xl mx-auto leading-tight">
                        Built for businesses. Growing with you.
                    </h2>
                    <p className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed mb-2">
                        We are committed to continuously improving our technology and delivering
                        useful solutions for modern ecommerce businesses.
                    </p>
                    <p className="text-white/40 text-xs font-medium tracking-wide uppercase mt-6">
                        LabelCropOnline — Simplify Your Labels. Streamline Your Business.
                    </p>
                </div>
            </div>
        </>
    );
}