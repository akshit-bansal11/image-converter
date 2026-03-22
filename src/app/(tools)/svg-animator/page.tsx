import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import SvgAnimatorTool from "./_components/SvgAnimatorTool";

const tool = getToolBySlug("svg-animator");

export const metadata: Metadata = {
  title: tool?.name ?? "SVG Border Animator",
  description: tool?.description,
};

export default function SvgAnimatorPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <SvgAnimatorTool />
    </ToolPageShell>
  );
}
