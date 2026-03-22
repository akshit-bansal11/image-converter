"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NextImage from "next/image";
import JSZip from "jszip";
import {
  Crop,
  Download,
  ImageIcon,
  Loader2,
  Scissors,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatFileSize, uid } from "@/lib/ffmpeg/client";

type CropMode = "individual" | "batch";

type Handle = "move" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface UploadedImage {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  srcUrl: string;
  width: number;
  height: number;
  crop: CropRect;
  outputUrl?: string;
  outputBlob?: Blob;
}

interface PointerState {
  active: boolean;
  pointerId: number | null;
  handle: Handle;
  startPoint: { x: number; y: number };
  startRect: CropRect;
}

const ACCEPTED_IMAGES = "image/*";
const MIN_CROP_SIZE = 20;

const ASPECT_PRESETS = [
  { value: "free", label: "Free", ratio: null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "2:3", label: "2:3", ratio: 2 / 3 },
] as const;

type AspectValue = (typeof ASPECT_PRESETS)[number]["value"];

function createDefaultCrop(width: number, height: number): CropRect {
  const targetW = Math.max(MIN_CROP_SIZE, Math.round(width * 0.7));
  const targetH = Math.max(MIN_CROP_SIZE, Math.round(height * 0.7));
  const x = Math.round((width - targetW) / 2);
  const y = Math.round((height - targetH) / 2);
  return { x, y, w: targetW, h: targetH };
}

function clampRect(rect: CropRect, width: number, height: number): CropRect {
  const w = Math.max(MIN_CROP_SIZE, Math.min(rect.w, width));
  const h = Math.max(MIN_CROP_SIZE, Math.min(rect.h, height));
  const x = Math.max(0, Math.min(rect.x, width - w));
  const y = Math.max(0, Math.min(rect.y, height - h));
  return { x, y, w, h };
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to load image."));
  });

  return image;
}

async function cropToBlob(image: UploadedImage, crop: CropRect): Promise<Blob> {
  const source = await loadImage(image.srcUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.w));
  canvas.height = Math.max(1, Math.round(crop.h));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to initialize image canvas context.");
  }

  context.drawImage(
    source,
    crop.x,
    crop.y,
    crop.w,
    crop.h,
    0,
    0,
    crop.w,
    crop.h,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, image.type || "image/png", 0.95);
  });

  if (!blob) {
    throw new Error("Failed to export cropped image.");
  }

  return blob;
}

function clampBatchCropToImage(
  batchCrop: CropRect,
  image: UploadedImage,
): CropRect {
  return clampRect(batchCrop, image.width, image.height);
}

function getAspectRatio(value: AspectValue): number | null {
  return ASPECT_PRESETS.find((preset) => preset.value === value)?.ratio ?? null;
}

function pointToCanvasSpace(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) * canvas.width) / rect.width;
  const y = ((clientY - rect.top) * canvas.height) / rect.height;
  return { x, y };
}

function getHandleAtPoint(
  point: { x: number; y: number },
  crop: CropRect,
  tolerance: number,
): Handle | null {
  const points: Array<{ handle: Handle; x: number; y: number }> = [
    { handle: "nw", x: crop.x, y: crop.y },
    { handle: "n", x: crop.x + crop.w / 2, y: crop.y },
    { handle: "ne", x: crop.x + crop.w, y: crop.y },
    { handle: "e", x: crop.x + crop.w, y: crop.y + crop.h / 2 },
    { handle: "se", x: crop.x + crop.w, y: crop.y + crop.h },
    { handle: "s", x: crop.x + crop.w / 2, y: crop.y + crop.h },
    { handle: "sw", x: crop.x, y: crop.y + crop.h },
    { handle: "w", x: crop.x, y: crop.y + crop.h / 2 },
  ];

  for (const candidate of points) {
    if (
      Math.abs(point.x - candidate.x) <= tolerance &&
      Math.abs(point.y - candidate.y) <= tolerance
    ) {
      return candidate.handle;
    }
  }

  if (
    point.x >= crop.x &&
    point.x <= crop.x + crop.w &&
    point.y >= crop.y &&
    point.y <= crop.y + crop.h
  ) {
    return "move";
  }

  return null;
}

function resizeRect(
  start: CropRect,
  dx: number,
  dy: number,
  handle: Handle,
  ratio: number | null,
): CropRect {
  const next: CropRect = { ...start };

  const right = start.x + start.w;
  const bottom = start.y + start.h;

  if (handle === "move") {
    return { ...start, x: start.x + dx, y: start.y + dy };
  }

  if (handle.includes("e")) {
    next.w = start.w + dx;
  }
  if (handle.includes("w")) {
    next.x = start.x + dx;
    next.w = right - next.x;
  }
  if (handle.includes("s")) {
    next.h = start.h + dy;
  }
  if (handle.includes("n")) {
    next.y = start.y + dy;
    next.h = bottom - next.y;
  }

  if (ratio) {
    const horizontal = handle.includes("e") || handle.includes("w");
    const vertical = handle.includes("n") || handle.includes("s");

    if (horizontal && !vertical) {
      next.h = next.w / ratio;
      next.y = start.y + (start.h - next.h) / 2;
    } else if (vertical && !horizontal) {
      next.w = next.h * ratio;
      next.x = start.x + (start.w - next.w) / 2;
    } else {
      const basedOnWidth = Math.abs(dx) >= Math.abs(dy);
      if (basedOnWidth) {
        next.h = next.w / ratio;
      } else {
        next.w = next.h * ratio;
      }

      if (handle.includes("w")) {
        next.x = right - next.w;
      }
      if (handle.includes("n")) {
        next.y = bottom - next.h;
      }
    }
  }

  return next;
}

function CropCanvasEditor({
  image,
  crop,
  onCropChange,
  aspectRatio,
}: {
  image: UploadedImage;
  crop: CropRect;
  onCropChange: (next: CropRect) => void;
  aspectRatio: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const pointerStateRef = useRef<PointerState>({
    active: false,
    pointerId: null,
    handle: "move",
    startPoint: { x: 0, y: 0 },
    startRect: crop,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const source = imageRef.current;
    if (!canvas || !source) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    const scaledCrop = {
      x: crop.x * scale,
      y: crop.y * scale,
      w: crop.w * scale,
      h: crop.h * scale,
    };

    context.fillStyle = "rgba(0, 0, 0, 0.48)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.clearRect(scaledCrop.x, scaledCrop.y, scaledCrop.w, scaledCrop.h);

    context.strokeStyle = "#4ade80";
    context.lineWidth = 2;
    context.strokeRect(scaledCrop.x, scaledCrop.y, scaledCrop.w, scaledCrop.h);

    const handleRadius = 4;
    const handlePoints = [
      [scaledCrop.x, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w / 2, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y + scaledCrop.h / 2],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x + scaledCrop.w / 2, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x, scaledCrop.y + scaledCrop.h / 2],
    ];

    context.fillStyle = "#4ade80";
    handlePoints.forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, handleRadius, 0, Math.PI * 2);
      context.fill();
    });
  }, [crop, scale]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const source = await loadImage(image.srcUrl);
      if (!mounted) {
        return;
      }

      imageRef.current = source;
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const maxWidth = 840;
      const maxHeight = 460;
      const computedScale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height,
        1,
      );
      const canvasWidth = Math.max(1, Math.round(image.width * computedScale));
      const canvasHeight = Math.max(
        1,
        Math.round(image.height * computedScale),
      );

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      setScale(computedScale);
    };

    void setup();

    return () => {
      mounted = false;
      imageRef.current = null;
    };
  }, [image.height, image.srcUrl, image.width]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || scale <= 0) {
        return;
      }

      const point = pointToCanvasSpace(canvas, event.clientX, event.clientY);
      const pointInImage = { x: point.x / scale, y: point.y / scale };
      const handle = getHandleAtPoint(pointInImage, crop, 10 / scale);
      if (!handle) {
        return;
      }

      pointerStateRef.current = {
        active: true,
        pointerId: event.pointerId,
        handle,
        startPoint: pointInImage,
        startRect: crop,
      };

      canvas.setPointerCapture(event.pointerId);
    },
    [crop, scale],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !pointerStateRef.current.active || scale <= 0) {
        return;
      }

      const state = pointerStateRef.current;
      if (state.pointerId !== event.pointerId) {
        return;
      }

      const point = pointToCanvasSpace(canvas, event.clientX, event.clientY);
      const pointInImage = { x: point.x / scale, y: point.y / scale };

      const dx = pointInImage.x - state.startPoint.x;
      const dy = pointInImage.y - state.startPoint.y;

      const resized = resizeRect(
        state.startRect,
        dx,
        dy,
        state.handle,
        aspectRatio,
      );
      const clamped = clampRect(resized, image.width, image.height);
      onCropChange(clamped);
    },
    [aspectRatio, image.height, image.width, onCropChange, scale],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      if (pointerStateRef.current.pointerId === event.pointerId) {
        pointerStateRef.current.active = false;
        pointerStateRef.current.pointerId = null;
        canvas.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35 p-2">
        <canvas
          ref={canvasRef}
          className="h-auto w-full touch-none rounded-md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Crop: {Math.round(crop.w)} x {Math.round(crop.h)} px at (
        {Math.round(crop.x)}, {Math.round(crop.y)})
      </p>
    </div>
  );
}

export default function ImageCropperTool() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [mode, setMode] = useState<CropMode>("individual");
  const [aspect, setAspect] = useState<AspectValue>("free");
  const [batchCrop, setBatchCrop] = useState<CropRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const aspectRatio = useMemo(() => getAspectRatio(aspect), [aspect]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.srcUrl);
        if (image.outputUrl) {
          URL.revokeObjectURL(image.outputUrl);
        }
      });
    };
  }, [images]);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const loaded: UploadedImage[] = [];

      for (const file of incoming) {
        if (!file.type.startsWith("image/")) {
          continue;
        }

        const srcUrl = URL.createObjectURL(file);

        try {
          const source = await loadImage(srcUrl);
          loaded.push({
            id: uid("crop"),
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            srcUrl,
            width: source.naturalWidth,
            height: source.naturalHeight,
            crop: createDefaultCrop(source.naturalWidth, source.naturalHeight),
          });
        } catch {
          URL.revokeObjectURL(srcUrl);
          setErrorMessage("One or more selected images could not be read.");
        }
      }

      if (loaded.length > 0) {
        setImages((prev) => [...prev, ...loaded]);
        if (!batchCrop) {
          setBatchCrop(loaded[0].crop);
        }
        setErrorMessage(null);
      }
    },
    [batchCrop],
  );

  const updateImage = useCallback(
    (id: string, patch: Partial<UploadedImage>) => {
      setImages((prev) =>
        prev.map((image) => (image.id === id ? { ...image, ...patch } : image)),
      );
    },
    [],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.srcUrl);
        if (target.outputUrl) {
          URL.revokeObjectURL(target.outputUrl);
        }
      }
      return prev.filter((image) => image.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.srcUrl);
      if (image.outputUrl) {
        URL.revokeObjectURL(image.outputUrl);
      }
    });

    setImages([]);
    setBatchCrop(null);
    setErrorMessage(null);
  }, [images]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        void addFiles(files);
      }
    },
    [addFiles],
  );

  const onSelectFiles = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (files.length > 0) {
        void addFiles(files);
      }
      event.target.value = "";
    },
    [addFiles],
  );

  const generatePreviewForImage = useCallback(
    async (image: UploadedImage) => {
      const crop =
        mode === "batch" && batchCrop
          ? clampBatchCropToImage(batchCrop, image)
          : image.crop;
      const blob = await cropToBlob(image, crop);
      const outputUrl = URL.createObjectURL(blob);

      if (image.outputUrl) {
        URL.revokeObjectURL(image.outputUrl);
      }

      updateImage(image.id, {
        outputBlob: blob,
        outputUrl,
      });
    },
    [batchCrop, mode, updateImage],
  );

  const previewAll = useCallback(async () => {
    for (const image of images) {
      await generatePreviewForImage(image);
    }
  }, [generatePreviewForImage, images]);

  const downloadOne = useCallback((image: UploadedImage) => {
    if (!image.outputUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = image.outputUrl;
    link.download = image.name;
    link.click();
  }, []);

  const downloadAll = useCallback(async () => {
    setIsDownloadingZip(true);
    setErrorMessage(null);

    try {
      const zip = new JSZip();

      for (const image of images) {
        let blob = image.outputBlob;
        if (!blob) {
          const crop =
            mode === "batch" && batchCrop
              ? clampBatchCropToImage(batchCrop, image)
              : image.crop;
          blob = await cropToBlob(image, crop);
        }

        zip.file(image.name, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "cropped-images.zip";
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch {
      setErrorMessage("Failed to prepare ZIP download for cropped images.");
    } finally {
      setIsDownloadingZip(false);
    }
  }, [batchCrop, images, mode]);

  const setImageCrop = useCallback((id: string, next: CropRect) => {
    setImages((prev) =>
      prev.map((image) => {
        if (image.id !== id) {
          return image;
        }

        if (image.outputUrl) {
          URL.revokeObjectURL(image.outputUrl);
        }

        return {
          ...image,
          crop: next,
          outputBlob: undefined,
          outputUrl: undefined,
        };
      }),
    );
  }, []);

  const referenceImage = images[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crop className="size-5 text-primary" />
            Multi-image crop editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="inline-flex rounded-lg border border-white/10 bg-background/50 p-1">
            <button
              onClick={() => setMode("individual")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "individual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
            >
              Individual Crop
            </button>
            <button
              onClick={() => setMode("batch")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "batch"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
            >
              Batch Crop
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Aspect ratio preset
              </p>
              <Select
                value={aspect}
                onChange={(event) =>
                  setAspect(event.target.value as AspectValue)
                }
              >
                {ASPECT_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => void previewAll()}
                disabled={images.length === 0}
              >
                <Scissors className="size-4" />
                Preview all
              </Button>
              <Button
                variant="outline"
                onClick={() => void downloadAll()}
                disabled={images.length === 0 || isDownloadingZip}
              >
                {isDownloadingZip ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download ZIP
              </Button>
              <Button
                variant="ghost"
                onClick={clearAll}
                disabled={images.length === 0}
              >
                <X className="size-4" />
                Clear
              </Button>
            </div>
          </div>

          <div
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-white/15 bg-background/40 hover:border-primary/60"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragCounter.current += 1;
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              dragCounter.current -= 1;
              if (dragCounter.current === 0) {
                setIsDragging(false);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={onDrop}
          >
            <ImageIcon className="mx-auto mb-3 size-9 text-muted-foreground" />
            <p className="text-base font-semibold">
              Drop one or multiple images here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag inside the crop box to move. Drag edges or corners to resize.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGES}
              multiple
              className="hidden"
              onChange={onSelectFiles}
            />

            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              Upload images
            </Button>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {mode === "batch" && referenceImage && batchCrop ? (
        <Card className="border-white/10 bg-card/70">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg">Shared batch crop region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-muted-foreground">
              Batch crop is edited on the first uploaded image and clamped to
              each image during export.
            </p>
            <CropCanvasEditor
              image={referenceImage}
              crop={batchCrop}
              aspectRatio={aspectRatio}
              onCropChange={(next) => {
                setBatchCrop(next);
                setImages((prev) =>
                  prev.map((image) => {
                    if (image.outputUrl) {
                      URL.revokeObjectURL(image.outputUrl);
                    }
                    return {
                      ...image,
                      outputBlob: undefined,
                      outputUrl: undefined,
                    };
                  }),
                );
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {images.length > 0 ? (
        <Card className="border-white/10 bg-card/70">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-lg">
              Image list ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {images.map((image) => {
              const activeCrop =
                mode === "batch" && batchCrop
                  ? clampBatchCropToImage(batchCrop, image)
                  : image.crop;

              return (
                <Card
                  key={image.id}
                  className="border-white/10 bg-background/40"
                >
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {image.width} x {image.height} px •{" "}
                          {formatFileSize(image.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-white/15 bg-background/70"
                        >
                          {Math.round(activeCrop.w)} x{" "}
                          {Math.round(activeCrop.h)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {mode === "individual" ? (
                      <CropCanvasEditor
                        image={image}
                        crop={image.crop}
                        aspectRatio={aspectRatio}
                        onCropChange={(next) => setImageCrop(image.id, next)}
                      />
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-[220px_1fr] sm:items-center">
                        <NextImage
                          src={image.srcUrl}
                          alt={image.name}
                          width={220}
                          height={128}
                          className="h-32 w-full rounded-lg border border-white/10 object-cover"
                          unoptimized
                        />
                        <p className="text-sm text-muted-foreground">
                          Batch crop will use this image with clamped bounds at
                          export time.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void generatePreviewForImage(image)}
                      >
                        <Scissors className="size-4" />
                        Preview crop
                      </Button>
                      <Button
                        size="sm"
                        disabled={!image.outputUrl}
                        onClick={() => downloadOne(image)}
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>

                    {image.outputUrl ? (
                      <div className="rounded-lg border border-white/10 bg-black/35 p-2">
                        <NextImage
                          src={image.outputUrl}
                          alt={`${image.name} cropped preview`}
                          width={320}
                          height={240}
                          className="max-h-60 w-auto rounded-md"
                          unoptimized
                        />
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
