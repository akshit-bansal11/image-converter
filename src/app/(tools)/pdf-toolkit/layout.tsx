import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";

const tool = getToolBySlug("pdf-toolkit");

export const metadata: Metadata = {
  title: tool?.name ?? "PDF Toolkit",
  description: tool?.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
