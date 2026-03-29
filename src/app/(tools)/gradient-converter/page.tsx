import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import GradientConverterTool from "./_components/GradientConverterTool";

const tool = getToolBySlug("gradient-converter");

export const metadata: Metadata = {
  title: tool?.name ?? "Gradient Converter",
  description: tool?.description,
};

export default function GradientConverterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <GradientConverterTool />
    </ToolPageShell>
  );
}
