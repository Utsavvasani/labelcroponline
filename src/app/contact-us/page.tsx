"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit your message. Please try again.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-white text-black pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Content Grid ── */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Form — Left (2/3) ── */}
          <main className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center border border-[#051448] rounded-md p-10 bg-slate-50/50 animate-in fade-in duration-300">
                <CheckCircle size={44} className="text-green-600 mb-3" />
                <h2 className="text-xl font-bold text-black mb-2">Message Received!</h2>
                <p className="text-black text-sm max-w-md leading-relaxed">
                  Thank you for contacting LabelCropOnline. We have safely received your details and will get back to you at{" "}
                  <strong className="text-black font-semibold">{formData.email}</strong> as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-sm text-[#051448] border border-[#051448] px-5 py-2.5 rounded hover:bg-blue-50 transition-colors font-semibold cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="border border-[#051448] rounded-md p-6 sm:p-8 space-y-4 bg-white shadow-xs"
              >
                <div>
                  <h2 className="text-xl font-bold text-black mb-1">Send us a message</h2>
                  <p className="text-black/70 text-sm">
                    Fill out the form below and our team will get in touch with you shortly.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-md flex items-start gap-2 animate-in fade-in">
                    <AlertCircle size={17} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full border border-[#051448]/30 rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full border border-[#051448]/30 rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 99095 20532"
                      className="w-full border border-[#051448]/30 rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Label cropping support, feedback, etc."
                      className="w-full border border-[#051448]/30 rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    className="w-full border border-[#051448]/30 rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all resize-none bg-white"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[#051448] text-white text-sm font-bold px-6 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving to DB...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </main>

          {/* ── Contact Info — Right (1/3) ── */}
          <aside className="lg:col-span-1 flex flex-col gap-5 pt-1">
            <div className="bg-slate-50 border border-[#051448]/20 rounded-md p-6">
              <h2 className="text-base font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-4">
                <a href="tel:+919909520532" className="flex items-start gap-3 group">
                  <Phone size={16} className="text-[#051448] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Phone</p>
                    <p className="text-black font-semibold text-sm group-hover:opacity-70 transition-opacity">
                      +91 99095 20532
                    </p>
                  </div>
                </a>
                <a href="mailto:labelcroponline@gmail.com" className="flex items-start gap-3 group">
                  <Mail size={16} className="text-[#051448] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Email</p>
                    <p className="text-black font-semibold text-sm group-hover:opacity-70 transition-opacity break-all">
                      labelcroponline@gmail.com
                    </p>
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#051448] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Location</p>
                    <p className="text-black font-semibold text-sm">India</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}