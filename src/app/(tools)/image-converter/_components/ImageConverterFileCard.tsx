"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Download,
  ImageIcon,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/interaction/Button";
import { Card, CardContent } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { Progress } from "@/components/ui/feedback/Progress";
import { Slider } from "@/components/ui/interaction/Slider";
import { Select } from "@/components/ui/form/Select";
import { Tooltip } from "@/components/ui/feedback/Tooltip";
import {
  type FileItem,
  FORMAT_LABELS,
  formatFileSize,
  getAvailableTargets,
  LOSSY_FORMATS,
  type ImageFormat,
} from "@/lib/converters/image-converter/converter";
import { ImageConverterStatusBadge } from "./ImageConverterStatusBadge";
import { UNSUPPORTED_OUTPUT_SET } from "./imageConverterConstants";

interface ImageConverterFileCardProps {
  item: FileItem;
  onUpdateTarget: (target: ImageFormat) => void;
  onUpdateQuality: (quality: number) => void;
  onConvert: () => void;
  onDownload: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

export function ImageConverterFileCard({
  item,
  onUpdateTarget,
  onUpdateQuality,
  onConvert,
  onDownload,
  onRemove,
  onRetry,
}: ImageConverterFileCardProps) {
  const [failedPreview, setFailedPreview] = useState<string | null>(null);

  const availableTargets = getAvailableTargets(item.sourceFormat);
  const isLossyTarget = LOSSY_FORMATS.includes(item.targetFormat);
  const isTargetSupported = !UNSUPPORTED_OUTPUT_SET.has(item.targetFormat);
  const convertDisabled =
    item.status === "converting" ||
    !isTargetSupported ||
    item.sourceFormat === "unknown";
  const showPreview = Boolean(item.preview) && failedPreview !== item.preview;

  return (
    <Card className="group relative py-0 transition-all duration-200 hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-colors ${
          item.status === "done"
            ? "bg-emerald-500"
            : item.status === "error"
              ? "bg-red-500"
              : item.status === "converting"
                ? "animate-pulse bg-blue-500"
                : "bg-transparent"
        }`}
      />

      <CardContent className="p-4 pl-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
              {showPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element -- blob URLs from createObjectURL don't work with next/image */
                <img
                  src={item.preview}
                  alt={item.name}
                  className="size-full object-cover"
                  onError={() => setFailedPreview(item.preview ?? null)}
                />
              ) : (
                <ImageIcon className="size-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={item.name}>
                {item.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)}
                </span>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] uppercase"
                >
                  {item.sourceFormat === "unknown"
                    ? "?"
                    : FORMAT_LABELS[item.sourceFormat]}
                </Badge>
                <ArrowRight className="size-3 text-muted-foreground" />
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-bold uppercase"
                >
                  {FORMAT_LABELS[item.targetFormat]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            <div className="flex flex-col gap-1">
              <Select
                options={availableTargets.map((format) => ({
                  label: `${FORMAT_LABELS[format]}${UNSUPPORTED_OUTPUT_SET.has(format) ? " (Unavailable)" : ""}`,
                  value: format,
                  disabled: UNSUPPORTED_OUTPUT_SET.has(format),
                }))}
                value={item.targetFormat}
                onChange={(e) => onUpdateTarget(e.target.value as ImageFormat)}
                disabled={item.status === "converting"}
                className="h-8 w-28 text-xs"
              />
            </div>

            {isLossyTarget && (
              <div className="flex min-w-[120px] items-center gap-2">
                <Tooltip content={`Quality: ${item.quality}%`}>
                  <span className="w-8 whitespace-nowrap text-right text-xs text-muted-foreground">
                    {item.quality}%
                  </span>
                </Tooltip>
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={item.quality}
                  onChange={(e) =>
                    onUpdateQuality(parseInt(e.target.value, 10))
                  }
                  disabled={item.status === "converting"}
                  className="w-20"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageConverterStatusBadge status={item.status} />

              {item.status === "idle" && (
                <Tooltip
                  content={
                    !isTargetSupported
                      ? "This output format is unavailable"
                      : item.sourceFormat === "unknown"
                        ? "Unsupported source format"
                        : "Convert this file"
                  }
                >
                  <Button
                    onClick={onConvert}
                    size="sm"
                    variant={isTargetSupported ? "default" : "outline"}
                    className="h-8 gap-1.5 text-xs"
                    disabled={convertDisabled}
                  >
                    <Sparkles className="size-3" />
                    Convert
                  </Button>
                </Tooltip>
              )}

              {item.status === "converting" && (
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                  <Loader2 className="size-3.5 animate-spin" />
                  {item.progress}%
                </span>
              )}

              {item.status === "done" && (
                <Button
                  onClick={onDownload}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-emerald-500/30 text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  <Download className="size-3" />
                  Download
                  {item.convertedBlob
                    ? ` (${formatFileSize(item.convertedBlob.size)})`
                    : ""}
                </Button>
              )}

              {item.status === "error" && (
                <Tooltip content="Retry conversion">
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    size="icon"
                    className="size-8 border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </Tooltip>
              )}

              <Tooltip content="Remove file">
                <Button
                  onClick={onRemove}
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {item.status === "converting" && (
          <div className="mt-3">
            <Progress value={item.progress} className="h-1.5" />
          </div>
        )}

        {item.status === "error" && item.error && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/5 p-2.5">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">
              {item.error}
            </p>
          </div>
        )}

        {!isTargetSupported && item.status === "idle" && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              HEIF files can be used as input, but HEIF output is not available
              in the bundled codec yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
