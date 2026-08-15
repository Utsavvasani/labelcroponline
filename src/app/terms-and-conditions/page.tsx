import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions – User Agreement for LabelCropOnline",
    description:
        "Read the Terms & Conditions governing your use of LabelCropOnline's shipping label and document processing services. Understand your rights, responsibilities, and our service policies.",
    keywords: [
        "labelcroponline terms and conditions",
        "label crop user agreement",
        "shipping label tool terms",
        "label processing service terms",
        "labelcroponline legal",
    ],
    alternates: { canonical: "https://www.labelcroponline.com/terms-and-conditions" },
    robots: { index: true, follow: true },
    openGraph: {
        url: "https://www.labelcroponline.com/terms-and-conditions",
        title: "Terms & Conditions | LabelCropOnline",
        description:
            "The legal agreement governing your access to and use of LabelCropOnline's shipping label and document processing services.",
    },
    twitter: {
        title: "Terms & Conditions | LabelCropOnline",
        description:
            "The legal agreement governing your access to and use of LabelCropOnline's shipping label and document processing services.",
    },
};

const sections = [
    {
        id: "use-of-service",
        title: "1. Use of the Service",
        content:
            "LabelCropOnline provides online tools that may allow users to upload and process shipping labels, PDFs, invoices, order documents, images, and similar files. Depending on the available features, the Service may provide functions such as automatic label detection, cropping, resizing, sorting, splitting, merging, bulk processing, and downloading processed documents. Features may be changed, improved, suspended, or discontinued from time to time.",
    },
    {
        id: "eligibility",
        title: "2. Eligibility and Account",
        content:
            "You must be legally capable of entering into a binding agreement to use the Service. Where an account is required, you agree to provide accurate and current information and to keep your login credentials secure. You must not create an account using false information, impersonate another person or business, access another user's account without authorization, or use your account for fraudulent or unlawful purposes. You are responsible for activity conducted through your account, except where applicable law provides otherwise.",
    },
    {
        id: "user-content",
        title: "3. Uploaded Files and User Content",
        content:
            "You retain ownership of documents, files, images, and other content that you upload to LabelCropOnline ('User Content'). We do not claim ownership of your User Content. You grant us a limited right to access, transmit, store, reproduce, modify, and process your User Content only as reasonably necessary to provide the requested Service, generate processed files, maintain security, prevent abuse, troubleshoot technical problems, and comply with applicable law. You are solely responsible for ensuring that you own or have the necessary rights, permissions, authorizations, and lawful basis to upload and process the content.",
    },
    {
        id: "personal-info",
        title: "4. Personal Information in Uploaded Documents",
        content:
            "Shipping labels and other documents may contain personal information such as names, addresses, phone numbers, email addresses, order information, SKU information, or shipment details belonging to other individuals. By uploading such documents, you confirm that you are authorized to provide and process that information through LabelCropOnline and that your use complies with applicable privacy and data-protection laws. You should not upload unnecessary or unlawfully obtained personal or confidential information.",
    },
    {
        id: "automated-processing",
        title: "5. Automated Processing and Accuracy",
        content:
            "The Service may use automated algorithms, document recognition, image-processing technology, and other software to process files. Automated processing may not always correctly identify, crop, resize, sort, split, or otherwise process every document. You are responsible for reviewing processed documents before using them for shipping, printing, order fulfillment, accounting, legal purposes, or other important activities. LabelCropOnline does not guarantee that automated processing will always be accurate, complete, or suitable for your particular requirements.",
    },
    {
        id: "file-storage",
        title: "6. File Storage and Deletion",
        content:
            "Uploaded files and processed outputs may be stored temporarily to provide the Service. Files may be automatically deleted after the retention period applicable to the relevant feature or plan. Users are responsible for maintaining backups of important documents. LabelCropOnline is not responsible for files that are deleted in accordance with our stated retention policy, user requests, account termination, technical limitations, or applicable legal requirements.",
    },
    {
        id: "acceptable-use",
        title: "7. Acceptable Use",
        content:
            "You agree to use LabelCropOnline only for lawful purposes and in accordance with these Terms. You must not use the Service to commit fraud, violate privacy or intellectual-property rights, upload malicious software or harmful code, distribute unlawful content, gain unauthorized access to our systems, bypass security controls or usage restrictions, interfere with our infrastructure, abuse APIs or automated systems, scrape the Service without permission, impersonate another person or organization, or otherwise use the Service in a way that could harm LabelCropOnline, its users, service providers, or third parties.",
    },
    {
        id: "fair-use",
        title: "8. Fair Use and Usage Limits",
        content:
            "The Service is intended for reasonable personal and commercial use. We may apply limits relating to file size, number of files, processing volume, API requests, storage, downloads, or other resources depending on your plan or feature. You must not intentionally circumvent such limits or use automated activity that places unreasonable load on our infrastructure. We may temporarily restrict usage where necessary to maintain security, stability, availability, or fair access for other users.",
    },
    {
        id: "intellectual-property",
        title: "9. Intellectual Property",
        content:
            "The LabelCropOnline name, logo, website, software, source code, user interface, design, graphics, documentation, trademarks, and other materials forming part of the Service are owned by or licensed to LabelCropOnline and are protected by applicable intellectual-property laws. Except where expressly permitted, you may not copy, reproduce, modify, distribute, sell, sublicense, publish, reverse engineer, extract, or commercially exploit any part of the Service without our prior written permission. Your User Content remains your property.",
    },
    {
        id: "paid-services",
        title: "10. Paid Services, Subscriptions, and Payments",
        content:
            "Certain features may require payment or a subscription. Applicable pricing, billing frequency, taxes, usage limits, and other charges will be displayed before purchase. Where subscriptions automatically renew, the payment method provided by you may be charged for subsequent billing periods until cancellation. You are responsible for maintaining accurate billing information and paying applicable charges. Payments may be processed by third-party payment providers, and their applicable terms may also apply.",
    },
    {
        id: "cancellation",
        title: "11. Cancellation and Refunds",
        content:
            "You may cancel a subscription through the available account controls or by contacting our support team. Unless otherwise stated, cancellation generally prevents future renewal but does not automatically refund amounts already charged. Refunds will be provided according to the applicable plan, refund policy, promotional terms, and mandatory rights available under applicable law. Nothing in these Terms is intended to remove or restrict a consumer right that cannot legally be excluded.",
    },
    {
        id: "disclaimer",
        title: "12. Disclaimer",
        content:
            "To the maximum extent permitted by applicable law, the Service is provided on an 'as is' and 'as available' basis. We do not guarantee that the Service will always be available, error-free, completely secure, compatible with every device or document, or capable of producing accurate results for every file or use case. Nothing in these Terms excludes any right, warranty, or remedy that cannot legally be excluded.",
    },
    {
        id: "liability",
        title: "13. Limitation of Liability",
        content:
            "To the maximum extent permitted by applicable law, LabelCropOnline and its owners, employees, affiliates, contractors, and service providers will not be liable for indirect, incidental, special, consequential, or punitive losses arising from your use of the Service, including loss of profits, revenue, business opportunities, goodwill, data, shipping opportunities, or business interruption. To the maximum extent permitted by law, our total liability arising from the Service will not exceed the amount actually paid by you to LabelCropOnline during the twelve months preceding the event giving rise to the claim.",
    },
    {
        id: "termination",
        title: "14. Suspension and Termination",
        content:
            "We may suspend, restrict, or terminate your access where you materially breach these Terms, engage in unlawful or fraudulent activity, create a security or operational risk, abuse the Service, fail to pay applicable charges, or where suspension is required by law. Where reasonably possible and legally permitted, we may provide notice before termination. Upon termination, your access may cease and uploaded files may be deleted according to our retention policy.",
    },
    {
        id: "governing-law",
        title: "15. Governing Law and Jurisdiction",
        content:
            "These Terms shall be governed by and interpreted in accordance with the laws of India. Subject to mandatory rights available under applicable law, disputes relating to the Service or these Terms shall be subject to the jurisdiction of the competent courts in India. Nothing in these Terms prevents a consumer from exercising any mandatory statutory right available under applicable law.",
    },
    {
        id: "changes",
        title: "16. Changes to the Service and Terms",
        content:
            "We may update, modify, add, or remove features from the Service. We may also update these Terms when necessary to reflect changes in our services, business practices, technology, or applicable law. Where changes are material, we may provide reasonable notice through the Website, email, account notification, or another appropriate method. Continued use of the Service after the effective date of updated Terms constitutes acceptance of the revised Terms to the extent permitted by law.",
    },
];

export default function TermsAndConditions() {
    return (
        <>
            {/* Hero — full width light bg, content in container */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-14">
                    <p className="text-sm font-semibold tracking-widest uppercase text-black mb-3">
                        Legal
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-4">
                        Terms &amp; Conditions
                    </h1>
                    <p className="text-black text-base max-w-xl leading-relaxed">
                        These Terms constitute a legal agreement governing your access to
                        and use of LabelCropOnline's services. Please read them carefully.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-black shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Last Updated: July 2025
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1200px] mx-auto px-6 py-14">
                <div className="flex gap-12 items-start">

                    {/* Table of Contents — desktop sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-black mb-4">
                                Table of Contents
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
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10">
                            <p className="text-sm font-semibold text-amber-700 mb-1">
                                ⚠ Important Notice
                            </p>
                            <p className="text-sm text-black leading-relaxed">
                                By accessing, registering for, purchasing, uploading files to,
                                or otherwise using the Service, you confirm that you have read
                                and agree to these Terms. If you do not agree, you must not use
                                the Service.
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
                                            <p className="text-black text-sm leading-relaxed">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-8 border-b border-gray-100" />
                                </section>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}