"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  ArchiveIcon,
  ArrowRight,
  CheckCircle2,
  Download,
  FileImage,
  Github,
  ImageIcon,
  Info,
  Linkedin,
  Loader2,
  Mail,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import {
  areFormatsEquivalent,
  type ConversionStatus,
  type FileItem,
  detectFormat,
  FORMAT_LABELS,
  FORMAT_MIME_MAP,
  formatFileSize,
  generateId,
  getAvailableTargets,
  getDefaultTarget,
  LOSSY_FORMATS,
  MAX_FILE_SIZE,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  SUPPORTED_OUTPUT_FORMATS,
  type ImageFormat,
} from "@/lib/converter";
import { convertImage, getImageMetadata } from "@/lib/convert-engine";

const ACCEPTED_INPUT =
  ".png,.jpg,.jpeg,.webp,.avif,.tiff,.tif,.heif,.heic,.ico";

const UNSUPPORTED_OUTPUT_FORMATS: ImageFormat[] = ["heif"];
const UNSUPPORTED_OUTPUT_SET = new Set<ImageFormat>(UNSUPPORTED_OUTPUT_FORMATS);
const GITHUB_PROFILE_URL = "https://github.com/akshit-bansal11";
const GITHUB_REPO_URL = "https://github.com/akshit-bansal11/image-converter";
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/akshit-bansal11/";
const EMAIL_ADDRESS = "artistbansal2004@gmail.com";

function formatMegapixels(pixels: number) {
  return `${(pixels / 1_000_000).toFixed(1)}MP`;
}

function summarizeUploadIssues(issues: string[]) {
  if (issues.length <= 3) {
    return issues.join("; ");
  }

  return `${issues.slice(0, 3).join("; ")}; and ${issues.length - 3} more.`;
}

export default function ImageConverter() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(`${file.name} exceeds the 10MB upload limit`);
        continue;
      }

      try {
        const metadata = await getImageMetadata(file);
        const pixelCount = metadata.width * metadata.height;

        if (
          metadata.width > MAX_IMAGE_DIMENSION ||
          metadata.height > MAX_IMAGE_DIMENSION
        ) {
          rejectedFiles.push(
            `${file.name} is ${metadata.width}x${metadata.height}; max is ${MAX_IMAGE_DIMENSION}px per side`,
          );
          continue;
        }

        if (pixelCount > MAX_IMAGE_PIXELS) {
          rejectedFiles.push(
            `${file.name} is ${formatMegapixels(pixelCount)}; max is ${formatMegapixels(
              MAX_IMAGE_PIXELS,
            )}`,
          );
          continue;
        }

        validFiles.push(file);
      } catch {
        rejectedFiles.push(`Couldn't read dimensions for ${file.name}`);
      }
    }

    if (rejectedFiles.length > 0) {
      setUploadWarning(summarizeUploadIssues(rejectedFiles));
      setTimeout(() => setUploadWarning(null), 7000);
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
        preview: URL.createObjectURL(file),
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
        void addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      if (selected.length > 0) {
        void addFiles(selected);
      }
      e.target.value = "";
    },
    [addFiles],
  );

  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    );
  }, []);

  const revokeFileUrls = useCallback((file: FileItem) => {
    if (file.preview) URL.revokeObjectURL(file.preview);
    if (file.convertedUrl) URL.revokeObjectURL(file.convertedUrl);
  }, []);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const file = prev.find((item) => item.id === id);
        if (file) {
          revokeFileUrls(file);
        }
        return prev.filter((item) => item.id !== id);
      });
    },
    [revokeFileUrls],
  );

  const clearAll = useCallback(() => {
    files.forEach(revokeFileUrls);
    setFiles([]);
  }, [files, revokeFileUrls]);

  const convertFile = useCallback(
    async (id: string) => {
      const file = files.find((item) => item.id === id);
      if (!file || file.status === "converting") return;

      updateFile(id, { status: "converting", progress: 0, error: undefined });

      const animateProgress = (
        from: number,
        to: number,
        duration: number,
      ): Promise<void> =>
        new Promise((resolve) => {
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

      try {
        if (file.sourceFormat === "unknown") {
          throw new Error("Unsupported source format");
        }

        if (!SUPPORTED_OUTPUT_FORMATS.includes(file.targetFormat)) {
          throw new Error(
            `${FORMAT_LABELS[file.targetFormat]} export is not available yet.`,
          );
        }

        const progressPromise = animateProgress(0, 85, 800);

        const blob = areFormatsEquivalent(file.sourceFormat, file.targetFormat)
          ? file.file.slice(
              0,
              file.file.size,
              FORMAT_MIME_MAP[file.targetFormat],
            )
          : await convertImage(file.file, file.targetFormat, file.quality);

        await progressPromise;
        await animateProgress(85, 100, 150);

        const url = URL.createObjectURL(blob);

        updateFile(id, {
          status: "done",
          progress: 100,
          convertedBlob: blob,
          convertedUrl: url,
        });
      } catch (error) {
        updateFile(id, {
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Conversion failed",
        });
      }
    },
    [files, updateFile],
  );

  const convertAll = useCallback(async () => {
    const toConvert = files.filter(
      (file) =>
        (file.status === "idle" || file.status === "error") &&
        SUPPORTED_OUTPUT_FORMATS.includes(file.targetFormat),
    );

    for (const file of toConvert) {
      await convertFile(file.id);
    }
  }, [files, convertFile]);

  const downloadFile = useCallback((item: FileItem) => {
    if (!item.convertedUrl) return;

    const anchor = document.createElement("a");
    anchor.href = item.convertedUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, "");
    anchor.download = `${baseName}.${item.targetFormat}`;
    anchor.click();
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter(
      (file) => file.status === "done" && file.convertedBlob,
    );
    if (doneFiles.length === 0) return;

    setIsDownloadingAll(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const item of doneFiles) {
        const baseName = item.name.replace(/\.[^/.]+$/, "");
        if (item.convertedBlob) {
          zip.file(`${baseName}.${item.targetFormat}`, item.convertedBlob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "converted-images.zip";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
    }

    setIsDownloadingAll(false);
  }, [files]);

  const hasFiles = files.length > 0;
  const doneCount = files.filter((file) => file.status === "done").length;
  const convertibleCount = files.filter(
    (file) =>
      (file.status === "idle" || file.status === "error") &&
      SUPPORTED_OUTPUT_FORMATS.includes(file.targetFormat),
  ).length;
  const isConverting = files.some((file) => file.status === "converting");

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-accent/30">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none dark:bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)]" />

      <div className="fixed right-0 top-0 z-20 p-2 sm:p-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-11 rounded-full hover:scale-110 active:scale-95 bg-card/85 shadow-sm backdrop-blur-sm sm:size-12"
        >
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
            <Github className="size-5" />
          </a>
        </Button>
      </div>

      <div className="relative z-10 mx-auto h-full max-w-5xl overflow-y-auto px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3.5 text-amber-500" />
            100% client-side - No uploads
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Image Converter
            </span>
          </h1>
        </header>

        {UNSUPPORTED_OUTPUT_FORMATS.length > 0 && (
          <div className="mx-auto mb-4 max-w-4xl rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  HEIF Export Limitation
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  HEIF and HEIC files can be uploaded as sources, but the
                  bundled codec does not yet export
                  <strong> HEIF </strong>
                  output. PNG, JPG, JPEG, WebP, AVIF, TIFF, and ICO are
                  available as targets.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mb-4 max-w-4xl rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Upload Limits
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                Uploads are limited to 10MB, 4096px on either side, and 20MP
                total. ICO exports above 512px are automatically resized to fit
                the encoder limit instead of failing.
              </p>
            </div>
          </div>
        </div>

        {uploadWarning && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">
                  Upload Rejected
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {uploadWarning}
                </p>
              </div>
              <button
                onClick={() => setUploadWarning(null)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        <Card
          className={`relative overflow-hidden transition-all duration-300 ${
            isDragging
              ? "scale-[1.01] border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
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
                    ? "scale-110 bg-primary/10"
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
                  PNG, JPG, JPEG, WebP, AVIF, TIFF, HEIF, ICO - max 10MB, 4096px
                  per side, 20MP
                </p>
              </div>
            </label>
          </div>

          {isDragging && (
            <div className="pointer-events-none absolute inset-0 animate-pulse rounded-xl border-2 border-primary/40" />
          )}
        </Card>

        {hasFiles && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  <FileImage className="mr-1 size-3.5" />
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </Badge>
                {doneCount > 0 && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 px-3 py-1 text-sm text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="mr-1 size-3.5" />
                    {doneCount} converted
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {convertibleCount > 0 && (
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

            <div className="space-y-3">
              {files.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onUpdateTarget={(target) =>
                    updateFile(item.id, {
                      targetFormat: target,
                      status: "idle",
                      progress: 0,
                      convertedBlob: undefined,
                      convertedUrl: undefined,
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

        <footer className="mt-12 flex flex-col items-center gap-6 border-t pt-6">
          <div>
            <p>Made by: Er. Akshit Bansal (Next.js Developer)</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-card/70 backdrop-blur-sm"
            >
              <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
                <Github className="size-4" />
                GitHub
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-card/70 backdrop-blur-sm"
            >
              <a href={LINKEDIN_PROFILE_URL} target="_blank" rel="noreferrer">
                <Linkedin className="size-4" />
                LinkedIn
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-card/70 backdrop-blur-sm"
            >
              <a href={`mailto:${EMAIL_ADDRESS}`}>
                <Mail className="size-4" />
                Mail
              </a>
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface FileCardProps {
  item: FileItem;
  onUpdateTarget: (target: ImageFormat) => void;
  onUpdateQuality: (quality: number) => void;
  onConvert: () => void;
  onDownload: () => void;
  onRemove: () => void;
  onRetry: () => void;
}

function FileCard({
  item,
  onUpdateTarget,
  onUpdateQuality,
  onConvert,
  onDownload,
  onRemove,
  onRetry,
}: FileCardProps) {
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
                value={item.targetFormat}
                onChange={(e) => onUpdateTarget(e.target.value as ImageFormat)}
                disabled={item.status === "converting"}
                className="h-8 w-28 text-xs"
              >
                {availableTargets.map((format) => (
                  <option
                    key={format}
                    value={format}
                    disabled={UNSUPPORTED_OUTPUT_SET.has(format)}
                  >
                    {FORMAT_LABELS[format]}
                    {UNSUPPORTED_OUTPUT_SET.has(format) ? " (Unavailable)" : ""}
                  </option>
                ))}
              </Select>
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
              <StatusBadge status={item.status} />

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

function StatusBadge({ status }: { status: ConversionStatus }) {
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
