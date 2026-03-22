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
  title: {
    default: "open-tools",
    template: "%s | open-tools",
  },
  description:
    "Open-source browser utilities for image conversion, JSON formatting, and base64 encoding.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "open tools",
    "browser tools",
    "image converter",
    "json formatter",
    "base64 encoder",
    "nextjs tools",
    "client-side utilities",
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
