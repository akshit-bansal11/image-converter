import {
  ArrowLeftRight,
  AudioLines,
  Blocks,
  Binary,
  Blend,
  Box,
  Braces,
  Crop,
  Droplet,
  Film,
  FileBox,
  FileCode2,
  FileDiff,
  FileText,
  FolderTree,
  Grid3X3,
  ImageIcon,
  ImageUp,
  LibraryBig,
  Music,
  PenTool,
  Pipette,
  Shapes,
  SwatchBook,
  Type,
  Video,
} from "lucide-react";
import type { ToolCategoryDefinition, ToolDefinition } from "@/types/tool";

export const toolCategories: ToolCategoryDefinition[] = [
  { name: "Audio", icon: AudioLines },
  { name: "Video", icon: Video },
  { name: "Dev", icon: Blocks },
  { name: "Images", icon: ImageIcon },
  { name: "SVG", icon: PenTool },
  { name: "Colors", icon: SwatchBook },
  { name: "CSS", icon: Box },
  { name: "Documents", icon: FileText },
  { name: "Text", icon: Type },
];

export const tools: ToolDefinition[] = [
  {
    slug: "audio-converter",
    href: "/audio-converter",
    name: "Convert",
    description:
      "Convert audio files between formats and codecs entirely in the browser using ffmpeg.wasm.",
    category: "Audio",
    highlights: [
      "Per-file format + codec controls",
      "Batch conversion with ZIP downloads",
    ],
    icon: Music,
  },
  {
    slug: "audio-extractor",
    href: "/audio-extractor",
    name: "Extract",
    description:
      "Extract the audio track from any video file and download it in your chosen format and codec.",
    category: "Audio",
    highlights: ["Video to audio extraction", "Codec-aware output selection"],
    icon: AudioLines,
  },
  {
    slug: "video-converter",
    href: "/video-converter",
    name: "Convert",
    description:
      "Convert videos between formats and codecs directly in the browser using ffmpeg.wasm.",
    category: "Video",
    highlights: [
      "Per-file video and audio codec mapping",
      "Batch conversion and ZIP export",
    ],
    icon: Video,
  },
  {
    slug: "frames-extractor",
    href: "/frames-extractor",
    name: "Frames",
    description:
      "Upload a GIF or video and extract every frame as individual PNG images, then download them as a ZIP.",
    category: "Video",
    highlights: ["Frame thumbnail grid", "FPS and frame-count metadata"],
    icon: Film,
  },
  {
    slug: "git-scaffold",
    href: "/git-scaffold",
    name: "Git Scaffold",
    description:
      "Paste a public GitHub repository URL and instantly visualize its full directory structure including all filenames.",
    category: "Dev",
    highlights: ["Collapsible file tree UI", "ASCII tree copy and TXT export"],
    icon: FolderTree,
  },
  {
    slug: "image-cropper",
    href: "/image-cropper",
    name: "Crop",
    description:
      "Crop one or many images in the browser - apply individual crops per image or a single crop to all at once.",
    category: "Images",
    highlights: [
      "Individual and batch crop modes",
      "Canvas drag-resize crop handles",
    ],
    icon: Crop,
  },
  {
    slug: "svg-animator",
    href: "/svg-animator",
    name: "Animate",
    description:
      "Upload any SVG and animate each path border locally with stroke-dashoffset controls and export-ready output.",
    category: "SVG",
    highlights: [
      "Sequential or simultaneous path animation",
      "Downloadable SVG with embedded keyframes",
    ],
    icon: PenTool,
  },
  {
    slug: "svg-pattern",
    href: "/svg-pattern",
    name: "Pattern",
    description:
      "Create beautiful, scalable vector patterns directly in your browser. Export native CSS backgrounds or raw SVG data URIs instantly.",
    category: "SVG",
    highlights: [
      "Injected vector properties directly generated",
      "CSS backgrounds",
    ],
    icon: Grid3X3,
  },
  {
    slug: "blob-generator",
    href: "/blob-generator",
    name: "Blob",
    description:
      "Create intricate, organic shapes natively by independently customizing the 8 anchor points of the border-radius property.",
    category: "CSS",
    highlights: ["8-Point interpolators natively computed"],
    icon: Shapes,
  },
  {
    slug: "glassmorphism",
    href: "/glassmorphism",
    name: "Glass",
    description:
      "Design stunning frosted-glass UI elements with real-time backdrop filtering and export the CSS directly.",
    category: "CSS",
    highlights: ["Interactive refractive blur previews", "Tailwind & CSS"],
    icon: Droplet,
  },
  {
    slug: "box-shadow",
    href: "/box-shadow",
    name: "Shadow",
    description:
      "Create layered CSS shadows natively through visual controls and export the exact styling string for your projects.",
    category: "CSS",
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
    name: "Optimize",
    description:
      "Clean up messy SVGs, strip metadata, dial in decimal precision, and convert to JSX directly in the browser.",
    category: "SVG",
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
    name: "Convert",
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
    name: "Gradients",
    description:
      "Build multi-stop gradients with live previews, PNG exports, CSS output, and Tailwind arbitrary values.",
    category: "Colors",
    highlights: ["Drag and reorder gradient stops"],
    icon: Blend,
  },
  {
    slug: "gradient-library",
    href: "/gradient-library",
    name: "Gradient Library",
    description:
      "Browse curated named gradients and copy them as CSS or Tailwind-ready arbitrary values.",
    category: "Colors",
    highlights: ["Curated presets with instant PNG downloads"],
    icon: LibraryBig,
  },
  {
    slug: "palette-library",
    href: "/palette-library",
    name: "Palette Library",
    description:
      "Explore curated color palettes, copy individual swatches, or export full palettes as JSON.",
    category: "Colors",
    highlights: ["Copy any swatch or full palette JSON"],
    icon: SwatchBook,
  },
  {
    slug: "palette-extractor",
    href: "/palette-extractor",
    name: "Extract Palette",
    description:
      "Upload an image and use Gemini vision to extract dominant colors into a copyable palette.",
    category: "Colors",
    highlights: ["Gemini-powered image palette extraction"],
    icon: ImageUp,
  },
  {
    slug: "gradient-converter",
    href: "/gradient-converter",
    name: "Convert Gradient",
    description:
      "Convert CSS gradients into Tailwind arbitrary values or switch between linear, radial, and conic syntax.",
    category: "Colors",
    highlights: ["Live preview while converting gradient syntax"],
    icon: ArrowLeftRight,
  },
  {
    slug: "color-converter",
    href: "/color-converter",
    name: "Convert Color",
    description:
      "Convert HEX, RGB, HSL, HSV, OKLCH, and named colors into every other format at once.",
    category: "Colors",
    highlights: ["All major color models at the same time"],
    icon: Pipette,
  },
  {
    slug: "base64",
    href: "/base64",
    name: "Base64",
    description:
      "Encode and decode text with a clean local workflow that stays entirely in the browser.",
    category: "Text",
    highlights: ["Unicode-safe encode and decode"],
    icon: Binary,
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export const toolsByCategory = toolCategories.map((category) => ({
  ...category,
  tools: tools.filter((tool) => tool.category === category.name),
}));
