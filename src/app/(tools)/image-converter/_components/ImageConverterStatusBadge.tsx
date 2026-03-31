import { Badge } from "@/components/ui/feedback/Badge";
import type { ConversionStatus } from "@/lib/converters/image-converter/converter";

interface ImageConverterStatusBadgeProps {
  status: ConversionStatus;
}

export function ImageConverterStatusBadge({
  status,
}: ImageConverterStatusBadgeProps) {
  switch (status) {
    case "idle":
      return (
        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
          Ready
        </Badge>
      );
    case "converting":
      return (
        <Badge
          variant="secondary"
          className="border-blue-500/20 bg-blue-500/10 px-1.5 py-0 text-[10px] text-blue-600 dark:text-blue-400"
        >
          Converting
        </Badge>
      );
    case "done":
      return (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400">
          Done
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
          Error
        </Badge>
      );
  }
}
