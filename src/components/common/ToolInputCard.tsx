"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/feedback/Badge";
import { Progress } from "@/components/ui/feedback/Progress";
import { Input } from "@/components/ui/form/Input";
import { Select } from "@/components/ui/form/Select";
import { Button } from "@/components/ui/interaction/Button";
import { Slider } from "@/components/ui/interaction/Slider";
import { Card } from "@/components/ui/layout/Card";
import { cn } from "@/lib/utils";

type ToolInputCardTone = "idle" | "converting" | "done" | "error";

const toneClassNames: Record<ToolInputCardTone, string> = {
  idle: "before:bg-transparent",
  converting: "before:bg-primary before:opacity-80",
  done: "before:bg-white/80",
  error: "before:bg-red-500",
};

function ToolInputCard({
  className,
  tone = "idle",
  ...props
}: React.ComponentProps<"div"> & { tone?: ToolInputCardTone }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-white/10 bg-background/45 p-0 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[calc(theme(borderRadius.2xl))]",
        toneClassNames[tone],
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardInner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-5 p-5 pl-6", className)} {...props} />;
}

function ToolInputCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("truncate text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function ToolInputCardText({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToolInputCardDismissButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-8 shrink-0 text-muted-foreground", className)}
      {...props}
    >
      {children ?? <X className="size-4" />}
    </Button>
  );
}

function ToolInputCardGrid({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 lg:grid-cols-3", className)}
      {...props}
    />
  );
}

function ToolInputCardField({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function ToolInputCardLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.14em] text-white/55",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardBadge({
  className,
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs uppercase text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "h-11 border-white/10 bg-white/[0.04] text-foreground shadow-none placeholder:text-white/35 focus-visible:ring-0 focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardSelect({
  className,
  ...props
}: React.ComponentProps<typeof Select>) {
  return (
    <Select
      className={cn(
        "h-11 border-white/10 bg-white/[0.04] text-foreground shadow-none hover:bg-white/[0.07]",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardSlider({
  className,
  ...props
}: React.ComponentProps<typeof Slider>) {
  return <Slider className={cn("py-1", className)} {...props} />;
}

function ToolInputCardButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "h-10 rounded-xl px-4 text-sm shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function ToolInputCardProgress({
  className,
  ...props
}: React.ComponentProps<typeof Progress>) {
  return (
    <Progress
      className={cn("h-2 bg-white/10 [&>div]:bg-white", className)}
      {...props}
    />
  );
}

function ToolInputCardPreview({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border-t border-white/10 pt-5", className)}
      {...props}
    />
  );
}

export {
  ToolInputCard,
  ToolInputCardBadge,
  ToolInputCardButton,
  ToolInputCardDismissButton,
  ToolInputCardField,
  ToolInputCardGrid,
  ToolInputCardHeader,
  ToolInputCardInner,
  ToolInputCardInput,
  ToolInputCardLabel,
  ToolInputCardPreview,
  ToolInputCardProgress,
  ToolInputCardSelect,
  ToolInputCardSlider,
  ToolInputCardText,
  ToolInputCardTitle,
};
