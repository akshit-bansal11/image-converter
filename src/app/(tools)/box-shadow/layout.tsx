import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";

const tool = getToolBySlug("box-shadow");

export const metadata: Metadata = {
  title: tool?.name ?? "Box Shadow Generator",
  description: tool?.description,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
