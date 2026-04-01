import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";

const tool = getToolBySlug("color-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Color Converter",
  description: tool?.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
