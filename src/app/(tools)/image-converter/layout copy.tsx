import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert PNG, JPG, JPEG, WebP, AVIF, TIFF, HEIF, and ICO images locally in your browser.",
};

export default function ImageConverterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
