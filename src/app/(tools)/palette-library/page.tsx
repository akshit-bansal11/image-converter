import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import PaletteLibraryTool from "./_components/PaletteLibraryTool";

const tool = getToolBySlug("palette-library");

export const metadata: Metadata = {
  title: tool?.name ?? "Palette Library",
  description: tool?.description,
};

export default function PaletteLibraryPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell
      title={tool.name}
      description={tool.description}
      fullWidth
    >
      <PaletteLibraryTool />
    </ToolPageShell>
  );
}
