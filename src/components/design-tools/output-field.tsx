import { CopyButton } from "@/components/design-tools/copy-button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OutputFieldProps {
  label: string;
  value: string;
  description?: string;
  className?: string;
  valueClassName?: string;
}

export function OutputField({
  label,
  value,
  description,
  className,
  valueClassName,
}: OutputFieldProps) {
  return (
    <div className={cn("rounded-2xl border bg-background/60 p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="block">{label}</Label>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <CopyButton value={value} />
      </div>
      <pre
        className={cn(
          "mt-4 overflow-x-auto rounded-xl border bg-background/80 p-4 font-mono text-sm whitespace-pre-wrap break-all text-emerald-200",
          valueClassName,
        )}
      >
        {value}
      </pre>
    </div>
  );
}
