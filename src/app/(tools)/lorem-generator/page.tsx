import { ToolPageShell } from "@/components/tool-page-shell";
import LoremGeneratorTool from "./_components/LoremGeneratorTool";

export const metadata = {
  title: "Lorem Generator",
  description:
    "Generate customized placeholder text instantly for your mockups, using either classic Latin or random English prose.",
};

export default function LoremGeneratorPage() {
  return (
    <ToolPageShell
      title="Lorem Generator"
      description="Generate customized placeholder text instantly for your mockups, using either classic Latin or random English prose."
      fullWidth
    >
      <LoremGeneratorTool />
    </ToolPageShell>
  );
}
