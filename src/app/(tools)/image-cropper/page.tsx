import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPageShell } from "@/components/ToolPageShell";
import ImageCropperTool from "./_components/ImageCropperTool";

const tool = getToolBySlug("image-cropper");

export const metadata: Metadata = {
  title: tool?.name ?? "Image Cropper",
  description: tool?.description,
};

export default function ImageCropperPage() {
  if (!tool) {
    return null;
  }

  return (
    <ToolPageShell title={tool.name} description={tool.description}>
      <ImageCropperTool />
    </ToolPageShell>
  );
}
