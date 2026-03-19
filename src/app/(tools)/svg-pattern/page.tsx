import { ToolPageShell } from "@/components/tool-page-shell";
import SvgPatternTool from "./_components/SvgPatternTool";

export const metadata = {
  title: "SVG Pattern Generator",
  description: "Generate infinitely repeating SVG patterns and export them directly to CSS data URIs.",
};

export default function SvgPatternPage() {
  return (
    <ToolPageShell
      title="SVG Pattern Generator"
      description="Create beautiful, scalable vector patterns directly in your browser. Export native CSS backgrounds or raw SVG data URIs instantly."
      fullWidth
    >
      <SvgPatternTool />
    </ToolPageShell>
  );
}
