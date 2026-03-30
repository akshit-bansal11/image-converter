import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/common/ToolPageShell";
import ImageConverter from "./_components/ImageConverter";

const tool = getToolBySlug("image-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Image Converter",
  description: tool?.description,
};

export default function ImageConverterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <ImageConverter />
    </ToolPageShell>
  );
}
