import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolDefinition } from "@/types/tool";

interface ToolPillProps {
  tool: ToolDefinition;
  isInDevelopment?: boolean;
}

export function ToolPill({
  tool,
  isInDevelopment = false,
}: ToolPillProps) {
  const Icon = tool.icon;
  const label = tool.shortName ?? tool.name;
  const className = cn(
    "inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#252626] px-5 py-2.5 text-sm font-medium text-[#e7e5e4] shadow-[inset_1px_1px_0px_rgba(72,72,72,0.15)] transition-all duration-300",
    isInDevelopment
      ? "cursor-not-allowed opacity-60"
      : "hover:border-[#c6c6c6]/40 hover:bg-[#2b2c2c]",
  );

  const content = (
    <>
      {isInDevelopment ? (
        <TriangleAlert className="size-4 shrink-0 text-amber-300" />
      ) : (
        <Icon className="size-4 shrink-0 text-[#acabaa]" />
      )}
      <span>{label}</span>
    </>
  );

  if (isInDevelopment) {
    return (
      <div
        aria-disabled="true"
        title={`${tool.name} is in development`}
        className={className}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={tool.href} className={className}>
      {content}
    </Link>
  );
}
