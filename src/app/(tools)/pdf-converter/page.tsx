import { ToolPageShell } from "@/components/tool-page-shell";
import PdfConverterTool from "./_components/PdfConverterTool";

export const metadata = {
  title: "PDF ↔ Image Converter",
  description: "Seamlessly merge images into a PDF, batch convert them, or explode a PDF into individual image files entirely in your browser.",
};

export default function PdfConverterPage() {
  return (
    <ToolPageShell
      title="PDF ↔ Image Converter"
      description="Seamlessly merge images into a PDF, batch convert them, or explode a PDF into individual image files entirely in your browser."
      fullWidth
    >
      <PdfConverterTool />
    </ToolPageShell>
  );
}
