import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import JsonFormatter from "./_components/JsonFormatter";

const tool = getToolBySlug("json-formatter");

export const metadata: Metadata = {
  title: tool?.name ?? "JSON Formatter",
  description: tool?.description,
};

export default function JsonFormatterPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <JsonFormatter />
    </ToolPageShell>
  );
}
