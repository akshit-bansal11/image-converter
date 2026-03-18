import { Binary, Braces, ImageIcon, Pipette } from "lucide-react";
import type { ToolDefinition } from "@/types/tool";

export const tools: ToolDefinition[] = [
  {
    slug: "image-converter",
    href: "/image-converter",
    name: "Image Converter",
    description:
      "Convert popular image formats locally with batch downloads, quality controls, and upload guardrails.",
    category: "Images",
    highlights: ["Batch conversion with ZIP downloads"],
    icon: ImageIcon,
  },
  {
    slug: "json-formatter",
    href: "/json-formatter",
    name: "JSON Formatter",
    description:
      "Pretty-print, minify, validate, and copy JSON without leaving the browser.",
    category: "Text",
    highlights: ["Pretty print or minify in one click"],
    icon: Braces,
  },
  {
    slug: "base64",
    href: "/base64",
    name: "Base64",
    description:
      "Encode and decode text with a clean local workflow that stays entirely in the browser.",
    category: "Encoding",
    highlights: ["Unicode-safe encode and decode"],
    icon: Binary,
  },
  {
    slug: "color-picker",
    href: "/color-picker",
    name: "Color Picker",
    description:
      "Pick a color, inspect its values, and copy hex, RGB, or HSL formats instantly.",
    category: "Design",
    highlights: ["Live hex, RGB, and HSL values"],
    icon: Pipette,
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
