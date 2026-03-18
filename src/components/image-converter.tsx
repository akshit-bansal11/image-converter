"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  FileImage,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArchiveIcon,
  Sparkles,
  RotateCcw,
  X,
  ArrowRight,
  ImageIcon,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import {
  type FileItem,
  type ImageFormat,
  type ConversionStatus,
  LOSSY_FORMATS,
  detectFormat,
  getDefaultTarget,
  getAvailableTargets,
  formatFileSize,
  generateId,
  FORMAT_LABELS,
} from "@/lib/converter";
import { convertImage, convertPdfToImages, checkFormatSupport } from "@/lib/convert-engine";

const ACCEPTED_INPUT = ".png,.jpg,.jpeg,.webp,.avif,.tiff,.tif,.pdf";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export default function ImageConverter() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formatWarnings, setFormatWarnings] = useState<Record<string, boolean>>({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Check browser format support on mount
  useEffect(() => {
    async function check() {
      const formats: ImageFormat[] = ["avif", "tiff", "webp"];
      const warnings: Record<string, boolean> = {};
      for (const fmt of formats) {
        const supported = await checkFormatSupport(fmt);
        if (!supported) {
          warnings[fmt] = true;
        }
      }
      setFormatWarnings(warnings);
    }
    check();
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    // Filter out files that exceed the size limit
    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    // Show warning for oversized files
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.length <= 3
        ? oversizedFiles.join(", ")
        : `${oversizedFiles.slice(0, 3).join(", ")} and ${oversizedFiles.length - 3} more`;
      setSizeWarning(`File${oversizedFiles.length > 1 ? "s" : ""} exceeding 50MB limit: ${fileList}`);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setSizeWarning(null), 5000);
    }

    if (validFiles.length === 0) return;

    const items: FileItem[] = validFiles.map((file) => {
      const sourceFormat = detectFormat(file);
      const targetFormat = getDefaultTarget(sourceFormat);
      return {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        sourceFormat,
        targetFormat,
        quality: 85,
        status: "idle" as ConversionStatus,
        progress: 0,
        preview: sourceFormat !== "pdf" ? URL.createObjectURL(file) : undefined,
      };
    });
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      if (selected.length > 0) {
        addFiles(selected);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        if (file.preview) URL.revokeObjectURL(file.preview);
        if (file.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
        if (file.convertedPages) {
          file.convertedPages.forEach((p) => URL.revokeObjectURL(p.url));
        }
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      if (f.convertedPages) {
        f.convertedPages.forEach((p) => URL.revokeObjectURL(p.url));
      }
    });
    setFiles([]);
  }, [files]);

  const convertFile = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file || file.status === "converting") return;

      updateFile(id, { status: "converting", progress: 0, error: undefined });

      // Helper to animate progress smoothly
      const animateProgress = (from: number, to: number, duration: number): Promise<void> => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(from + (to - from) * progress);
            updateFile(id, { progress: current });
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(tick);
        });
      };

      try {
        if (file.sourceFormat === "pdf") {
          const pages = await convertPdfToImages(
            file.file,
            file.targetFormat,
            file.quality,
            (current, total) => {
              updateFile(id, {
                progress: Math.round((current / total) * 95) + 5,
              });
            }
          );
          updateFile(id, {
            status: "done",
            progress: 100,
            convertedPages: pages,
          });
        } else if (file.sourceFormat === "unknown") {
          throw new Error("Unsupported source format");
        } else {
          // Start progress animation (0 -> 85% over 800ms)
          const progressPromise = animateProgress(0, 85, 800);

          // Start actual conversion in parallel
          const blob = await convertImage(
            file.file,
            file.targetFormat,
            file.quality
          );

          // Wait for progress animation to catch up if needed
          await progressPromise;

          // Quick finish animation
          await animateProgress(85, 100, 150);

          const url = URL.createObjectURL(blob);
          updateFile(id, {
            status: "done",
            progress: 100,
            convertedBlob: blob,
            convertedUrl: url,
          });
        }
      } catch (err) {
        updateFile(id, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Conversion failed",
        });
      }
    },
    [files, updateFile]
  );

  const convertAll = useCallback(async () => {
    const toConvert = files.filter(
      (f) => f.status === "idle" || f.status === "error"
    );
    // Convert sequentially to avoid memory issues
    for (const file of toConvert) {
      await convertFile(file.id);
    }
  }, [files, convertFile]);

  const downloadFile = useCallback((item: FileItem) => {
    if (item.convertedPages && item.convertedPages.length > 0) {
      // PDF pages — download each
      item.convertedPages.forEach((page, i) => {
        const a = document.createElement("a");
        a.href = page.url;
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        a.download = `${baseName}_page${i + 1}.${item.targetFormat}`;
        a.click();
      });
    } else if (item.convertedUrl) {
      const a = document.createElement("a");
      a.href = item.convertedUrl;
      const baseName = item.name.replace(/\.[^/.]+$/, "");
      a.download = `${baseName}.${item.targetFormat}`;
      a.click();
    }
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.status === "done");
    if (doneFiles.length === 0) return;

    setIsDownloadingAll(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const item of doneFiles) {
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        if (item.convertedPages && item.convertedPages.length > 0) {
          for (let i = 0; i < item.convertedPages.length; i++) {
            zip.file(
              `${baseName}_page${i + 1}.${item.targetFormat}`,
              item.convertedPages[i].blob
            );
          }
        } else if (item.convertedBlob) {
          zip.file(`${baseName}.${item.targetFormat}`, item.convertedBlob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted-images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to create ZIP:", err);
    }
    setIsDownloadingAll(false);
  }, [files]);

  const hasFiles = files.length > 0;
  const doneCount = files.filter((f) => f.status === "done").length;
  const idleOrErrorCount = files.filter(
    (f) => f.status === "idle" || f.status === "error"
  ).length;
  const isConverting = files.some((f) => f.status === "converting");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3.5 text-amber-500" />
            100% client-side • No uploads
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Image Converter
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Convert images between PNG, JPG, WebP, AVIF, TIFF, and PDF —
            instantly in your browser.
          </p>
        </header>

        {/* Format warnings */}
        {Object.keys(formatWarnings).length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Limited Format Support
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your browser doesn&apos;t support encoding to{" "}
                  <strong>
                    {Object.keys(formatWarnings)
                      .map((f) => f.toUpperCase())
                      .join(", ")}
                  </strong>
                  . Conversions to these formats may fail. Try using Chrome or
                  Edge for full support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File size warning */}
        {sizeWarning && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">
                  File Size Limit Exceeded
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sizeWarning}
                </p>
              </div>
              <button
                onClick={() => setSizeWarning(null)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Drop zone */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 ${
            isDragging
              ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.01]"
              : "border-dashed hover:border-muted-foreground/30 hover:shadow-md"
          }`}
        >
          <div
            className="p-8 sm:p-12"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_INPUT}
              className="hidden"
              onChange={handleFileSelect}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center gap-4"
            >
              <div
                className={`rounded-2xl p-5 transition-all duration-300 ${
                  isDragging
                    ? "bg-primary/10 scale-110"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <Upload
                  className={`size-8 transition-colors ${
                    isDragging ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {isDragging ? (
                    "Drop files here"
                  ) : (
                    <>
                      Drag & drop files or{" "}
                      <span className="text-primary underline underline-offset-4">
                        browse
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  PNG, JPG, WebP, AVIF, TIFF, PDF — max 50MB per file
                </p>
              </div>
            </label>
          </div>

          {/* Animated border glow on drag */}
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary/40 animate-pulse" />
          )}
        </Card>

        {/* File list */}
        {hasFiles && (
          <div className="mt-8 space-y-4">
            {/* Batch actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  <FileImage className="size-3.5 mr-1" />
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </Badge>
                {doneCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" />
                    {doneCount} converted
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {idleOrErrorCount > 0 && (
                  <Button
                    onClick={convertAll}
                    disabled={isConverting}
                    size="sm"
                    className="gap-2"
                  >
                    {isConverting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    Convert All
                  </Button>
                )}
                {doneCount > 1 && (
                  <Button
                    onClick={downloadAll}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isDownloadingAll}
                  >
                    {isDownloadingAll ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArchiveIcon className="size-4" />
                    )}
                    Download All (.zip)
                  </Button>
                )}
                <Separator orientation="vertical" className="h-6" />
                <Tooltip content="Clear all files">
                  <Button
                    onClick={clearAll}
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* File cards */}
            <div className="space-y-3">
              {files.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  formatWarnings={formatWarnings}
                  onUpdateTarget={(target) =>
                    updateFile(item.id, {
                      targetFormat: target,
                      status: "idle",
                      progress: 0,
                      convertedBlob: undefined,
                      convertedUrl: undefined,
                      convertedPages: undefined,
                      error: undefined,
                    })
                  }
                  onUpdateQuality={(quality) =>
                    updateFile(item.id, { quality })
                  }
                  onConvert={() => convertFile(item.id)}
                  onDownload={() => downloadFile(item)}
                  onRemove={() => removeFile(item.id)}
                  onRetry={() => {
                    updateFile(item.id, {
                      status: "idle",
                      progress: 0,
                      error: undefined,
                    });
                    convertFile(item.id);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            All conversions happen locally in your browser. No files are
            uploaded anywhere.
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ───────────── File Card Component ───────────── */

interface FileCardProps {
  item: FileItem;
  formatWarnings: Record<string, boolean>;
  onUpdateTarget: (target: ImageFormat) => void;
  onUpdateQuality: (quality: number) => void;
  onConvert: () => void;
  onDownload: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

function FileCard({
  item,
  formatWarnings,
  onUpdateTarget,
  onUpdateQuality,
  onConvert,
  onDownload,
  onRemove,
  onRetry,
}: FileCardProps) {
  const availableTargets = getAvailableTargets(item.sourceFormat);
  const isLossyTarget = LOSSY_FORMATS.includes(item.targetFormat);
  const showWarning = formatWarnings[item.targetFormat];

  return (
    <Card className="group relative transition-all duration-200 hover:shadow-md py-0">
      {/* Status indicator line */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-colors ${
          item.status === "done"
            ? "bg-emerald-500"
            : item.status === "error"
            ? "bg-red-500"
            : item.status === "converting"
            ? "bg-blue-500 animate-pulse"
            : "bg-transparent"
        }`}
      />

      <CardContent className="p-4 pl-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Thumbnail + Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Thumbnail */}
            <div className="relative size-14 shrink-0 rounded-lg overflow-hidden bg-muted/50 border flex items-center justify-center">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : (
                <ImageIcon className="size-6 text-muted-foreground" />
              )}
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={item.name}>
                {item.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase">
                  {item.sourceFormat === "unknown"
                    ? "?"
                    : FORMAT_LABELS[item.sourceFormat]}
                </Badge>
                <ArrowRight className="size-3 text-muted-foreground" />
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 uppercase font-bold"
                >
                  {FORMAT_LABELS[item.targetFormat]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
            {/* Format selector */}
            <div className="flex flex-col gap-1">
              <Select
                value={item.targetFormat}
                onChange={(e) =>
                  onUpdateTarget(e.target.value as ImageFormat)
                }
                disabled={item.status === "converting"}
                className="w-24 h-8 text-xs"
              >
                {availableTargets.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {FORMAT_LABELS[fmt]}
                    {formatWarnings[fmt] ? " ⚠️" : ""}
                  </option>
                ))}
              </Select>
            </div>

            {/* Quality slider */}
            {isLossyTarget && (
              <div className="flex items-center gap-2 min-w-[120px]">
                <Tooltip content={`Quality: ${item.quality}%`}>
                  <span className="text-xs text-muted-foreground whitespace-nowrap w-8 text-right">
                    {item.quality}%
                  </span>
                </Tooltip>
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={item.quality}
                  onChange={(e) =>
                    onUpdateQuality(parseInt(e.target.value))
                  }
                  disabled={item.status === "converting"}
                  className="w-20"
                />
              </div>
            )}

            {/* Status badge + Actions */}
            <div className="flex items-center gap-2">
              <StatusBadge status={item.status} />

              {item.status === "idle" && (
                <Tooltip content={showWarning ? "May not work in this browser" : "Convert this file"}>
                  <Button
                    onClick={onConvert}
                    size="sm"
                    variant={showWarning ? "outline" : "default"}
                    className="gap-1.5 h-8 text-xs"
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
                  className="gap-1.5 h-8 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                >
                  <Download className="size-3" />
                  Download
                  {item.convertedPages && item.convertedPages.length > 1
                    ? ` (${item.convertedPages.length})`
                    : item.convertedBlob
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
                  className="size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3.5" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {item.status === "converting" && (
          <div className="mt-3">
            <Progress value={item.progress} className="h-1.5" />
          </div>
        )}

        {/* Error message */}
        {item.status === "error" && item.error && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-red-500/5 border border-red-500/20 p-2.5">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">
              {item.error}
            </p>
          </div>
        )}

        {/* Format warning */}
        {showWarning && item.status === "idle" && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/5 border border-amber-500/20 p-2.5">
            <Info className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Your browser may not support encoding to{" "}
              {item.targetFormat.toUpperCase()}. Try Chrome or Edge for best
              results.
            </p>
          </div>
        )}

        {/* Converted pages preview (PDF) */}
        {item.convertedPages && item.convertedPages.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {item.convertedPages.map((page, i) => (
              <div
                key={i}
                className="relative size-16 shrink-0 rounded-md overflow-hidden border bg-muted/30"
              >
                <img
                  src={page.url}
                  alt={`Page ${i + 1}`}
                  className="size-full object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-black/60 px-1 text-[9px] text-white rounded-tl-sm">
                  p{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ConversionStatus }) {
  switch (status) {
    case "idle":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          Ready
        </Badge>
      );
    case "converting":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
        >
          Converting
        </Badge>
      );
    case "done":
      return (
        <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          Done
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="destructive"
          className="text-[10px] px-1.5 py-0"
        >
          Error
        </Badge>
      );
  }
}
