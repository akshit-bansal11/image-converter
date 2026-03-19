import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function FieldLabel({
  className,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function TextInput({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[140px] w-full rounded-2xl border border-input bg-background/70 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}
