import { ToolPageShell } from "@/components/tool-page-shell";
import PdfToolkitTool from "./_components/PdfToolkitTool";

export const metadata = {
  title: "PDF Toolkit",
  description: "Merge, split, compress, or reorder your PDF documents securely in your browser without any server uploads.",
};

export default function PdfToolkitPage() {
  return (
    <ToolPageShell
      title="PDF Toolkit"
      description="Merge multiple files, break PDFs apart by page, reorder structure, or compress files directly in your browser."
      fullWidth
    >
      <PdfToolkitTool />
    </ToolPageShell>
  );
}
