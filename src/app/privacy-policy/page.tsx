import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Label Crop Online",
  description:
    "Learn how Label Crop Online collects, uses, and protects your personal information.",
};

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content:
      "We may collect information that you voluntarily provide when creating an account, contacting us, subscribing to our services, or using our features. This may include your name, email address, mobile number, company or business information, login credentials, billing information, account preferences, and information included in communications with our support team. We may also automatically collect limited technical information such as IP address, browser type, device information, operating system, pages or features accessed, timestamps, error information, and similar technical data necessary to operate, secure, and improve our Service.",
  },
  {
    id: "uploaded-documents",
    title: "2. Uploaded Documents and Files",
    content:
      "LabelCropOnline allows users to upload PDF files, shipping labels, invoices, order documents, images, and other supported files for processing. Such files may contain personal information belonging to you or other individuals, including names, addresses, telephone numbers, email addresses, order numbers, SKU information, and shipping details. We process uploaded files primarily to provide the functionality requested by you, such as cropping, resizing, sorting, splitting, merging, or otherwise processing documents. You remain responsible for ensuring that you have the necessary rights, authorization, or lawful basis to upload and process information belonging to other individuals.",
  },
  {
    id: "how-we-use",
    title: "3. How We Use Information",
    content:
      "We use information to create and manage accounts, provide and operate our services, process uploaded documents, generate requested outputs, process subscriptions and payments, provide customer support, communicate important service information, maintain security, prevent fraud and misuse, troubleshoot technical problems, monitor performance, improve existing features, develop new features, comply with applicable legal obligations, and protect our rights and users. Where appropriate, we may use aggregated or de-identified information for analytics, research, service improvement, and operational purposes.",
  },
  {
    id: "cookies",
    title: "4. Cookies and Similar Technologies",
    content:
      "We may use cookies, local storage, session technologies, analytics tools, and similar technologies to maintain login sessions, remember preferences, improve performance, understand how our Service is used, maintain security, and detect abuse. Where consent is legally required for non-essential cookies or tracking technologies, we will obtain the appropriate consent. You may control certain cookies through your browser or available cookie settings, although disabling essential technologies may affect some features of the Service.",
  },
  {
    id: "payments",
    title: "5. Payments and Billing Information",
    content:
      "If you purchase a paid service, payment transactions may be processed through third-party payment providers. We may receive information such as transaction identifiers, payment status, billing amount, currency, subscription details, and limited payment metadata. Complete payment-card information may be handled directly by the applicable payment provider rather than being stored by LabelCropOnline. Payment providers may process information according to their own terms and privacy policies.",
  },
  {
    id: "sharing",
    title: "6. Sharing of Information",
    content:
      "We do not sell your personal information or uploaded documents to third parties for monetary consideration. We may share information with trusted service providers that help us operate the Service, such as hosting and cloud-storage providers, payment processors, email providers, analytics and monitoring services, security providers, customer-support services, and professional advisors. We may also disclose information where required or permitted by applicable law, court order, governmental authority, fraud-prevention requirements, security investigations, or to protect our rights, users, property, or the public.",
  },
  {
    id: "third-party",
    title: "7. Uploaded Data and Third-Party Processing",
    content:
      "We may use third-party infrastructure and service providers to host, store, transmit, secure, or process information required to provide LabelCropOnline. Where a particular feature requires information to be sent to a third-party service, we will use that information only as reasonably necessary to provide the relevant functionality and will take appropriate steps required by applicable law. We will not intentionally use your uploaded documents or personal information to train third-party artificial intelligence models unless such use is separately disclosed and legally permitted.",
  },
  {
    id: "retention",
    title: "8. Data Retention and File Deletion",
    content:
      "We retain information only for as long as reasonably necessary to provide the Service, maintain accounts, process transactions, provide support, maintain security, prevent fraud, resolve disputes, comply with legal obligations, and satisfy legitimate operational requirements. Uploaded and processed files may be stored temporarily and may be automatically deleted after the retention period applicable to the relevant feature or service. Certain information may need to be retained for longer periods where required or permitted by law. You should maintain your own backup of important files.",
  },
  {
    id: "security",
    title: "9. Data Security",
    content:
      "We use reasonable technical and organizational measures designed to protect information against unauthorized access, loss, misuse, alteration, disclosure, and destruction. These measures may include encryption in transit, access controls, authentication mechanisms, secure infrastructure, monitoring, logging, vulnerability management, and restricted access. However, no internet-based service or electronic storage system can guarantee absolute security. You are also responsible for protecting your account credentials and notifying us promptly if you suspect unauthorized access to your account.",
  },
  {
    id: "your-rights",
    title: "10. Your Privacy Rights",
    content:
      "Subject to applicable law, you may have rights regarding your personal information, including the right to request access to information, correction of inaccurate information, deletion of information where legally applicable, withdrawal of consent where consent is the applicable basis for processing, information regarding processing activities, and grievance redressal. Requests may be subject to reasonable identity verification and applicable legal limitations. To exercise an applicable privacy right, contact us using the details provided below.",
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    content:
      "LabelCropOnline is intended primarily for businesses, sellers, merchants, and general users and is not intentionally directed toward children. We do not knowingly collect personal information from children where such collection is prohibited by applicable law. If you believe that information relating to a child has been improperly provided to us, please contact us so that we can take appropriate action.",
  },
  {
    id: "changes",
    title: "12. Changes to This Privacy Policy",
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our services, technology, business practices, legal requirements, or security practices. When material changes are made, we may provide notice through the Website, email, account notification, or another appropriate method. The 'Last Updated' date at the top of this policy indicates when it was most recently revised. Your continued use of the Service after an updated policy becomes effective will be subject to the revised policy to the extent permitted by applicable law.",
  },
  {
    id: "contact",
    title: "13. Contact and Grievance Redressal",
    content:
      "If you have questions, privacy requests, complaints, or concerns regarding this Privacy Policy or our handling of personal information, please contact us at the details provided below. We will make reasonable efforts to review and address privacy-related requests and complaints in accordance with applicable law.",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      {/* Hero — full width bg, content in container */}
      <div className="bg-[#051448] text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-14">
          <p className="text-sm font-semibold tracking-widest uppercase text-blue-300 mb-3">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-base max-w-xl leading-relaxed">
            We are committed to protecting your privacy. This policy explains
            how we collect, use, and safeguard your information.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
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
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Table of Contents
              </p>
              <nav className="space-y-2">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-xs text-gray-500 hover:text-[#051448] hover:font-medium transition-colors leading-snug py-0.5"
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
              <p className="text-sm text-[#051448]/80 leading-relaxed">
                LabelCropOnline respects your privacy and is committed to
                protecting the information you provide while using our website,
                web application, document-processing tools, and related
                services. By using our Service, you acknowledge this Privacy
                Policy.
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
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 border-b border-gray-100" />
                </section>
              ))}
            </div>

            {/* Contact Card */}
            <div className="mt-12 bg-[#051448] text-white rounded-2xl p-8">
              <h3 className="text-lg font-semibold mb-1">Contact Us</h3>
              <p className="text-white/60 text-sm mb-5">
                For privacy-related queries, reach out to our team.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["Brand", "LabelCropOnline"],
                  ["Website", "labelcroponline.com"],
                  ["Privacy Email", "privacy@labelcroponline.com"],
                  ["Grievance Email", "grievance@labelcroponline.com"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-white/50 text-xs mb-0.5">{label}</p>
                    <p className="font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}