import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/common/ToolPageShell";
import GitScaffoldTool from "./_components/GitScaffoldTool";

const tool = getToolBySlug("git-scaffold");

export const metadata: Metadata = {
  title: tool?.name ?? "Git Scaffold",
  description: tool?.description,
};

export default function GitScaffoldPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <GitScaffoldTool />
    </ToolPageShell>
  );
}
