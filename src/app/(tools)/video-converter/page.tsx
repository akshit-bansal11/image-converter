import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import VideoConverterTool from "./_components/VideoConverterTool";

const tool = getToolBySlug("video-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Video Converter",
  description: tool?.description,
};

export default function VideoConverterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description} fullWidth>
      <VideoConverterTool />
    </ToolPageShell>
  );
}
