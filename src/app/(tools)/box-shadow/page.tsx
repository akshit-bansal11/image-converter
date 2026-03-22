import { ToolPageShell } from "@/components/tool-page-shell";
import BoxShadowTool from "./_components/BoxShadowTool";

export const metadata = {
  title: "Box Shadow Generator",
  description:
    "Design and instantly preview soft, layered CSS box shadows for your web applications.",
};

export default function BoxShadowPage() {
  return (
    <ToolPageShell
      title="Box Shadow Generator"
      description="Create layered CSS shadows natively through visual controls and export the exact styling string for your projects."
      fullWidth
    >
      <BoxShadowTool />
    </ToolPageShell>
  );
}
