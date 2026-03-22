import { ToolPageShell } from "@/components/tool-page-shell";
import BlobGeneratorTool from "./_components/BlobGeneratorTool";

export const metadata = {
  title: "CSS Blob Generator",
  description:
    "Create intricate, organic shapes using 8-point CSS border-radius.",
};

export default function BlobGeneratorPage() {
  return (
    <ToolPageShell
      title="CSS Blob Generator"
      description="Create intricate, organic shapes natively by independently customizing the 8 anchor points of the border-radius property."
      fullWidth
    >
      <BlobGeneratorTool />
    </ToolPageShell>
  );
}
