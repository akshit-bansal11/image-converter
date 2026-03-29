import React from "react";
import { Badge } from "@/components/ui/feedback/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/layout/Card";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ToolCardData {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
}

interface ToolCardProps {
  tool: ToolCardData;
  isInDevelopment?: boolean;
}

export function ToolCard({ tool, isInDevelopment = false }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Card
      className={cn(
        "relative p-5 h-full border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-lg hover:shadow-white/[0.02]",
        isInDevelopment &&
          "overflow-hidden hover:translate-y-0 hover:border-white/[0.06] hover:shadow-none",
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <Icon className="size-5" />
          </div>
          <Badge variant="outline" className="uppercase text-xs">
            {tool.category}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-xl">{tool.name}</CardTitle>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </CardHeader>

      {isInDevelopment && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-600/35 backdrop-blur-[1px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-300/60 bg-red-700/85 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <TriangleAlert className="size-4 text-yellow-300" />
            In Development
          </div>
        </div>
      )}
    </Card>
  );
}
