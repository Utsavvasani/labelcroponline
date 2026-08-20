"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactUs() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((res) => setTimeout(res, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <>
            {/* ── Hero ── */}
            {/* <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-12">
                    <p className="text-sm font-semibold tracking-widest uppercase text-black mb-3">
                        Get in Touch
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black mb-4">
                        Contact Us
                    </h1>
                    <p className="text-black text-base max-w-xl leading-relaxed">
                        Have a question, feedback, or need support? We'd love to hear from
                        you. Our team usually responds within 24 hours.
                    </p>
                </div>
            </div> */}

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-10 ">
                <div className="grid lg:grid-cols-3 gap-8 items-start">

                    {/* ── Form — Left (2/3) ── */}
                    <main className="lg:col-span-2">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center text-center border border-[#051448] rounded-md p-10">
                                <CheckCircle size={40} className="text-green-600 mb-3" />
                                <h2 className="text-lg font-bold text-black mb-2">Message Sent!</h2>
                                <p className="text-black text-sm max-w-sm leading-relaxed">
                                    Thank you for reaching out. We'll get back to you at{" "}
                                    <span className="font-semibold text-black">{formData.email}</span> within 24 hours.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                                    className="mt-5 text-sm text-[#051448] border border-[#051448] px-5 py-2 rounded hover:bg-blue-50 transition-colors font-medium"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="border border-[#051448] rounded-md p-6 space-y-4"
                            >
                                <div>
                                    <h2 className="text-lg font-bold text-black mb-0.5">Send us a message</h2>
                                    <p className="text-black text-sm">Fill out the form and we'll get back to you shortly.</p>
                                </div>

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
                                            className="w-full border border-[#051448] rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/50 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#051448]/30 transition-all bg-white"
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
                                            className="w-full border border-[#051448] rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/50 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#051448]/30 transition-all bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="What is this about?"
                                        className="w-full border border-[#051448] rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/50 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#051448]/30 transition-all bg-white"
                                    />
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
                                        className="w-full border border-[#051448] rounded px-3 py-2 text-sm text-black font-medium placeholder:text-black/50 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#051448]/30 transition-all resize-none bg-white"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center justify-center gap-2 bg-[#051448] text-white text-sm font-bold px-6 py-2.5 rounded hover:bg-[#071a5e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
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
                        <h2 className="text-base font-bold text-black">Contact Information</h2>
                        <div className="space-y-4">
                            <a href="tel:+919909520532" className="flex items-start gap-3 group">
                                <Phone size={16} className="text-[#051448] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Phone</p>
                                    <p className="text-black font-semibold text-sm group-hover:opacity-70 transition-opacity">
                                        +91 99095 20532
                                    </p>
                                </div>
                            </a>
                            <a href="mailto:labelcroponline@gmail.com" className="flex items-start gap-3 group">
                                <Mail size={16} className="text-[#051448] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Email</p>
                                    <p className="text-black font-semibold text-sm group-hover:opacity-70 transition-opacity break-all">
                                        labelcroponline@gmail.com
                                    </p>
                                </div>
                            </a>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-[#051448] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-black mb-0.5">Location</p>
                                    <p className="text-black font-semibold text-sm">India</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </>
    );
}