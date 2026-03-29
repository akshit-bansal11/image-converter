import { ToolPageShell } from "@/components/ToolPageShell";
import GlassmorphismTool from "./_components/GlassmorphismTool";

export const metadata = {
  title: "Glassmorphism Generator",
  description:
    "Design stunning frosted-glass UI elements with real-time backdrop filtering.",
};

export default function GlassmorphismPage() {
  return (
    <ToolPageShell
      title="Glassmorphism Generator"
      description="Design stunning frosted-glass UI elements with real-time backdrop filtering and export the CSS directly."
    >
      <GlassmorphismTool />
    </ToolPageShell>
  );
}
