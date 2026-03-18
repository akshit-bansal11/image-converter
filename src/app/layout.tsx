import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Converter — Convert PNG, JPG, WebP, AVIF, TIFF & PDF",
  description:
    "Free, client-side image converter. Convert between PNG, JPG, WebP, AVIF, TIFF, and PDF instantly in your browser. No uploads, no server, 100% private.",
  keywords: [
    "image converter",
    "png to jpg",
    "webp converter",
    "avif converter",
    "pdf to image",
    "client-side",
    "browser",
    "free",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
