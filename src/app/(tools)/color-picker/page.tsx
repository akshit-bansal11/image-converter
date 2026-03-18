import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/tool-page-shell";
import ColorPickerTool from "./_components/ColorPickerTool";

const tool = getToolBySlug("color-picker");

export const metadata: Metadata = {
  title: tool?.name ?? "Color Picker",
  description: tool?.description,
};

export default function ColorPickerPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell
      title={tool.name}
      description={tool.description}
      icon={tool.icon}
    >
      <ColorPickerTool />
    </ToolPageShell>
  );
}
