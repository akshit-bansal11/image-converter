import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import AudioConverterTool from "./_components/AudioConverterTool";

const tool = getToolBySlug("audio-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Audio Converter",
  description: tool?.description,
};

export default function AudioConverterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description} fullWidth>
      <AudioConverterTool />
    </ToolPageShell>
  );
}
