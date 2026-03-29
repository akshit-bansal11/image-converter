import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import GradientMakerTool from "./_components/GradientMakerTool";

const tool = getToolBySlug("gradient-maker");

export const metadata: Metadata = {
  title: tool?.name ?? "Gradient Maker",
  description: tool?.description,
};

export default function GradientMakerPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <GradientMakerTool />
    </ToolPageShell>
  );
}
