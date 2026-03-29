import { ToolPageShell } from "@/components/ToolPageShell";
import SvgOptimizerTool from "./_components/SvgOptimizerTool";

export const metadata = {
  title: "SVG Optimizer",
  description:
    "Clean up messy SVGs, remove editor namespaces, strip metadata, dial in decimal precision, and convert to JSX directly in the browser.",
};

export default function SvgOptimizerPage() {
  return (
    <ToolPageShell
      title="SVG Optimizer"
      description="Clean up messy SVGs, remove editor namespaces, strip metadata, dial in decimal precision, and convert to JSX directly in the browser."
    >
      <SvgOptimizerTool />
    </ToolPageShell>
  );
}
