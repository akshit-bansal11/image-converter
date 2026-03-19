import {
  ArrowLeftRight,
  Binary,
  Blend,
  Box,
  Braces,
  Droplet,
  FileBox,
  FileCode2,
  FileDiff,
  FileText,
  Grid3X3,
  ImageIcon,
  ImageUp,
  LibraryBig,
  Pipette,
  Shapes,
  SwatchBook,
  Type,
} from "lucide-react";
import type { ToolDefinition } from "@/types/tool";

export const tools: ToolDefinition[] = [
  {
    slug: "svg-pattern",
    href: "/svg-pattern",
    name: "SVG Pattern Generator",
    description:
      "Create beautiful, scalable vector patterns directly in your browser. Export native CSS backgrounds or raw SVG data URIs instantly.",
    category: "Design",
    highlights: ["Injected vector properties directly generated", "CSS backgrounds"],
    icon: Grid3X3,
  },
  {
    slug: "blob-generator",
    href: "/blob-generator",
    name: "CSS Blob Generator",
    description:
      "Create intricate, organic shapes natively by independently customizing the 8 anchor points of the border-radius property.",
    category: "Design",
    highlights: ["8-Point interpolators natively computed"],
    icon: Shapes,
  },
  {
    slug: "glassmorphism",
    href: "/glassmorphism",
    name: "Glassmorphism Generator",
    description:
      "Design stunning frosted-glass UI elements with real-time backdrop filtering and export the CSS directly.",
    category: "Design",
    highlights: ["Interactive refractive blur previews", "Tailwind & CSS"],
    icon: Droplet,
  },
  {
    slug: "box-shadow",
    href: "/box-shadow",
    name: "Box Shadow Generator",
    description:
      "Create layered CSS shadows natively through visual controls and export the exact styling string for your projects.",
    category: "Design",
    highlights: ["Detailed multi-layer controls natively"],
    icon: Box,
  },
  {
    slug: "pdf-toolkit",
    href: "/pdf-toolkit",
    name: "PDF Toolkit",
    description:
      "Merge multiple files, break PDFs apart by page, reorder structure, or compress files directly in your browser.",
    category: "Documents",
    highlights: ["Compress documents securely natively"],
    icon: FileText,
  },
  {
    slug: "lorem-generator",
    href: "/lorem-generator",
    name: "Lorem Generator",
    description:
      "Generate customized placeholder text instantly for your mockups, using either classic Latin or random English prose.",
    category: "Text",
    highlights: ["Configurable words, sentences, and paragraphs"],
    icon: Type,
  },
  {
    slug: "diff-checker",
    href: "/diff-checker",
    name: "Diff Checker",
    description:
      "Find inline character-level or line-level text differences with robust ignoring whitespace and case sensitivity.",
    category: "Text",
    highlights: ["Unified patch and raw markup generation"],
    icon: FileDiff,
  },
  {
    slug: "svg-optimizer",
    href: "/svg-optimizer",
    name: "SVG Optimizer",
    description:
      "Clean up messy SVGs, strip metadata, dial in decimal precision, and convert to JSX directly in the browser.",
    category: "Design",
    highlights: ["Live visual preview with JSX conversion"],
    icon: FileCode2,
  },
  {
    slug: "pdf-converter",
    href: "/pdf-converter",
    name: "PDF ↔ Image",
    description:
      "Merge images into a single PDF, batch convert them, or extract pages from existing PDFs as images.",
    category: "Documents",
    highlights: ["Drag-to-reorder combined page layout"],
    icon: FileBox,
  },
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
    slug: "gradient-maker",
    href: "/gradient-maker",
    name: "Gradient Maker",
    description:
      "Build multi-stop gradients with live previews, PNG exports, CSS output, and Tailwind arbitrary values.",
    category: "Design",
    highlights: ["Drag and reorder gradient stops"],
    icon: Blend,
  },
  {
    slug: "gradient-library",
    href: "/gradient-library",
    name: "Gradient Library",
    description:
      "Browse curated named gradients and copy them as CSS or Tailwind-ready arbitrary values.",
    category: "Design",
    highlights: ["Curated presets with instant PNG downloads"],
    icon: LibraryBig,
  },
  {
    slug: "palette-library",
    href: "/palette-library",
    name: "Palette Library",
    description:
      "Explore curated color palettes, copy individual swatches, or export full palettes as JSON.",
    category: "Design",
    highlights: ["Copy any swatch or full palette JSON"],
    icon: SwatchBook,
  },
  {
    slug: "palette-extractor",
    href: "/palette-extractor",
    name: "Palette Extractor",
    description:
      "Upload an image and use Gemini vision to extract dominant colors into a copyable palette.",
    category: "Design",
    highlights: ["Gemini-powered image palette extraction"],
    icon: ImageUp,
  },
  {
    slug: "gradient-converter",
    href: "/gradient-converter",
    name: "Gradient Converter",
    description:
      "Convert CSS gradients into Tailwind arbitrary values or switch between linear, radial, and conic syntax.",
    category: "Design",
    highlights: ["Live preview while converting gradient syntax"],
    icon: ArrowLeftRight,
  },
  {
    slug: "color-converter",
    href: "/color-converter",
    name: "Color Converter",
    description:
      "Convert HEX, RGB, HSL, HSV, OKLCH, and named colors into every other format at once.",
    category: "Design",
    highlights: ["All major color models at the same time"],
    icon: Pipette,
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
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}