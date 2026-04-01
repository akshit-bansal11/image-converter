import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";

const tool = getToolBySlug("palette-extractor");

export const metadata: Metadata = {
  title: tool?.name ?? "Palette Extractor",
  description: tool?.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
