import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import GradientLibraryTool from "./_components/GradientLibraryTool";

const tool = getToolBySlug("gradient-library");

export const metadata: Metadata = {
  title: tool?.name ?? "Gradient Library",
  description: tool?.description,
};

export default function GradientLibraryPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description} fullWidth>
      <GradientLibraryTool />
    </ToolPageShell>
  );
}
