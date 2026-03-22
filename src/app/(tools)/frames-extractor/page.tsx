import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import FramesExtractorTool from "./_components/FramesExtractorTool";

const tool = getToolBySlug("frames-extractor");

export const metadata: Metadata = {
  title: tool?.name ?? "Frames Extractor",
  description: tool?.description,
};

export default function FramesExtractorPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description} fullWidth>
      <FramesExtractorTool />
    </ToolPageShell>
  );
}
