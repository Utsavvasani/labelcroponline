import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Label Crop Online - PDF & Image Label Cropper",
  description: "Organize, crop, and format shipping labels and PDF pages online effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-[97px] sm:pt-[97px] font-sans">
        <Navbar />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}



