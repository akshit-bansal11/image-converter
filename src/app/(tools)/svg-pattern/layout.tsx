import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";

const tool = getToolBySlug("svg-pattern");

export const metadata: Metadata = {
  title: tool?.name ?? "SVG Pattern Generator",
  description: tool?.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
