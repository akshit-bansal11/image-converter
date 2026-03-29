import { ToolPageShell } from "@/components/ToolPageShell";
import DiffCheckerTool from "./_components/DiffCheckerTool";

export const metadata = {
  title: "Diff Checker",
  description:
    "Find inline character-level or line-level text differences with robust ignoring whitespace and case sensitivity.",
};

export default function DiffCheckerPage() {
  return (
    <ToolPageShell
      title="Diff Checker"
      description="Find inline character-level or line-level text differences with robust ignoring whitespace and case sensitivity."
    >
      <DiffCheckerTool />
    </ToolPageShell>
  );
}
