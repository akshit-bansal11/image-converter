import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import Base64Tool from "./_components/Base64Tool";

const tool = getToolBySlug("base64");

export const metadata: Metadata = {
  title: tool?.name ?? "Base64",
  description: tool?.description,
};

export default function Base64Page() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <Base64Tool />
    </ToolPageShell>
  );
}
