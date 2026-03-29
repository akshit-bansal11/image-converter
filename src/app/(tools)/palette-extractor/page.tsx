import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import PaletteExtractorTool from "./_components/PaletteExtractorTool";

const tool = getToolBySlug("palette-extractor");

export const metadata: Metadata = {
  title: tool?.name ?? "Palette Extractor",
  description: tool?.description,
};

export default function PaletteExtractorPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <PaletteExtractorTool />
    </ToolPageShell>
  );
}
