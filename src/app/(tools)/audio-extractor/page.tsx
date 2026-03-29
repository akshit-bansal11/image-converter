import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/common/ToolPageShell";
import AudioExtractorTool from "./_components/AudioExtractorTool";

const tool = getToolBySlug("audio-extractor");

export const metadata: Metadata = {
  title: tool?.name ?? "Audio Extractor",
  description: tool?.description,
};

export default function AudioExtractorPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <AudioExtractorTool />
    </ToolPageShell>
  );
}
