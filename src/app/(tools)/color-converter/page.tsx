import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import ColorConverterTool from "./_components/ColorConverterTool";

const tool = getToolBySlug("color-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Color Converter",
  description: tool?.description,
};

export default function ColorConverterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <ColorConverterTool />
    </ToolPageShell>
  );
}
