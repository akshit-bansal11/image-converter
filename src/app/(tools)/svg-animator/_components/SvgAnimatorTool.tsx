"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Download, Play, Upload } from "lucide-react";
import { OutputField } from "@/components/design-tools/output-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type PlayMode = "sequential" | "simultaneous";
type StrokeLinecap = "butt" | "round" | "square";
type StrokeLinejoin = "miter" | "round" | "bevel";

interface ParsedSvgData {
  fileName: string;
  sourceSvg: string;
  pathLengths: number[];
}

const MIN_DURATION = 0.2;
const MAX_DURATION = 6;
const DEFAULT_DURATION = 1.2;

const MIN_STROKE_WIDTH = 0.5;
const MAX_STROKE_WIDTH = 10;
const DEFAULT_STROKE_WIDTH = 1.5;
const DEFAULT_STROKE_COLOR = "#000000";
const DEFAULT_STROKE_LINECAP: StrokeLinecap = "round";
const DEFAULT_STROKE_LINEJOIN: StrokeLinejoin = "round";

function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

function readSvgText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file contents as text."));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the SVG file."));
    };

    reader.readAsText(file);
  });
}

function mergeInlineStyle(node: Element, styleChunk: string) {
  const existing = node.getAttribute("style");
  const normalized = existing?.trim();

  if (!normalized) {
    node.setAttribute("style", styleChunk);
    return;
  }

  const next = normalized.endsWith(";")
    ? `${normalized} ${styleChunk}`
    : `${normalized}; ${styleChunk}`;

  node.setAttribute("style", next);
}

function measurePathLengths(svg: SVGSVGElement) {
  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-99999px";
  holder.style.top = "-99999px";
  holder.style.width = "0";
  holder.style.height = "0";
  holder.style.opacity = "0";
  holder.style.pointerEvents = "none";

  const clone = svg.cloneNode(true) as SVGSVGElement;
  holder.appendChild(clone);
  document.body.appendChild(holder);

  const paths = Array.from(clone.querySelectorAll("path"));
  const lengths = paths.map((path) => {
    try {
      const totalLength = path.getTotalLength();
      return Number.isFinite(totalLength) && totalLength > 0
        ? Number(totalLength.toFixed(3))
        : 1;
    } catch {
      return 1;
    }
  });

  document.body.removeChild(holder);
  return lengths;
}

function buildAnimatedSvg(
  sourceSvg: string,
  pathLengths: number[],
  durationPerPath: number,
  mode: PlayMode,
  strokeColor: string,
  strokeWidth: number,
  strokeLinecap: StrokeLinecap,
  strokeLinejoin: StrokeLinejoin,
  strokeOnly: boolean,
) {
  const doc = new DOMParser().parseFromString(sourceSvg, "image/svg+xml");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    return "";
  }

  const svg = doc.querySelector("svg");
  if (!svg) {
    return "";
  }

  svg.querySelectorAll("style[data-svg-animator='true']").forEach((node) => {
    node.remove();
  });

  const paths = Array.from(svg.querySelectorAll("path"));
  paths.forEach((path, index) => {
    const length = Math.max(pathLengths[index] ?? 1, 1);
    const delay = mode === "sequential" ? index * durationPerPath : 0;

    const styles = [
      `stroke:${strokeColor}`,
      `stroke-width:${strokeWidth}`,
      `stroke-linecap:${strokeLinecap}`,
      `stroke-linejoin:${strokeLinejoin}`,
      `stroke-dasharray:${length}`,
      `stroke-dashoffset:${length}`,
      `animation:svgPathDraw ${durationPerPath}s ease forwards`,
      `animation-delay:${delay}s`,
    ];

    if (strokeOnly) {
      styles.push("fill:none");
    }

    mergeInlineStyle(path, styles.join(";"));
  });

  const style = doc.createElement("style");
  style.setAttribute("data-svg-animator", "true");
  style.textContent = "@keyframes svgPathDraw { to { stroke-dashoffset: 0; } }";

  svg.insertBefore(style, svg.firstChild);

  return new XMLSerializer().serializeToString(svg);
}

function formatDuration(seconds: number) {
  return `${seconds.toFixed(1)}s`;
}

export default function SvgAnimatorTool() {
  const [parsedSvg, setParsedSvg] = useState<ParsedSvgData | null>(null);
  const [mode, setMode] = useState<PlayMode>("sequential");
  const [durationPerPath, setDurationPerPath] = useState(DEFAULT_DURATION);
  const [strokeColor, setStrokeColor] = useState(DEFAULT_STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [strokeLinecap, setStrokeLinecap] = useState<StrokeLinecap>(DEFAULT_STROKE_LINECAP);
  const [strokeLinejoin, setStrokeLinejoin] = useState<StrokeLinejoin>(DEFAULT_STROKE_LINEJOIN);
  const [strokeOnly, setStrokeOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [replayTick, setReplayTick] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const animatedSvg = useMemo(() => {
    if (!parsedSvg) {
      return "";
    }

    return buildAnimatedSvg(
      parsedSvg.sourceSvg,
      parsedSvg.pathLengths,
      durationPerPath,
      mode,
      strokeColor,
      strokeWidth,
      strokeLinecap,
      strokeLinejoin,
      strokeOnly,
    );
  }, [parsedSvg, durationPerPath, mode, strokeColor, strokeWidth, strokeLinecap, strokeLinejoin, strokeOnly]);

  const totalAnimationTime = useMemo(() => {
    if (!parsedSvg) {
      return 0;
    }

    return mode === "sequential"
      ? parsedSvg.pathLengths.length * durationPerPath
      : durationPerPath;
  }, [parsedSvg, durationPerPath, mode]);

  const previewKey = useMemo(() => {
    if (!parsedSvg) {
      return "empty";
    }

    return `${parsedSvg.fileName}-${mode}-${durationPerPath}-${strokeColor}-${strokeWidth}-${strokeLinecap}-${strokeLinejoin}-${strokeOnly}-${replayTick}`;
  }, [parsedSvg, mode, durationPerPath, strokeColor, strokeWidth, strokeLinecap, strokeLinejoin, replayTick]);

  const handleFile = useCallback(async (file: File) => {
    if (!isSvgFile(file)) {
      setErrorMessage("Please upload a valid SVG file.");
      return;
    }

    try {
      const text = await readSvgText(file);
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        throw new Error("This SVG could not be parsed.");
      }

      const svg = doc.querySelector("svg");
      if (!svg) {
        throw new Error("No <svg> root element was found.");
      }

      const pathElements = Array.from(svg.querySelectorAll("path"));
      if (pathElements.length === 0) {
        throw new Error("No <path> elements were found in this SVG.");
      }

      const lengths = measurePathLengths(svg as SVGSVGElement);
      const sourceSvg = new XMLSerializer().serializeToString(svg);

      setParsedSvg({
        fileName: file.name,
        sourceSvg,
        pathLengths: lengths,
      });
      setErrorMessage(null);
      setReplayTick((current) => current + 1);
    } catch (error) {
      setParsedSvg(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process the SVG file.",
      );
    }
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;

    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const file = Array.from(event.dataTransfer.files).find((entry) =>
        isSvgFile(entry),
      );

      if (!file) {
        setErrorMessage("Drop an SVG file to continue.");
        return;
      }

      await handleFile(file);
    },
    [handleFile],
  );

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleFile(file);
      }

      event.target.value = "";
    },
    [handleFile],
  );

  const handleReplay = useCallback(() => {
    setReplayTick((current) => current + 1);
  }, []);

  const handleDownload = useCallback(() => {
    if (!animatedSvg) {
      return;
    }

    const blob = new Blob([animatedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${parsedSvg?.fileName.replace(/\.svg$/i, "") ?? "animated"}-animated.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [animatedSvg, parsedSvg]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-white/10 bg-card/70">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Upload SVG</CardTitle>
            <Badge variant="outline" className="uppercase">
              Client-side
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload any SVG and animate each path border using stroke-dashoffset.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "rounded-2xl border border-dashed p-6 text-center transition",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-white/20 bg-background/30",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-3 size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your SVG here, or choose a file manually.
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose SVG File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-card/70">
        <CardHeader className="space-y-3">
          <CardTitle>Animation Controls</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Mode: {mode}</Badge>
            <Badge variant="secondary">
              Duration per path: {formatDuration(durationPerPath)}
            </Badge>
            <Badge variant="secondary">
              Total time: {formatDuration(totalAnimationTime)}
            </Badge>
            <Badge variant="secondary">
              Paths: {parsedSvg?.pathLengths.length ?? 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Animation duration per path</Label>
            <Slider
              value={durationPerPath}
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={0.1}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                setDurationPerPath(next);
              }}
              disabled={!parsedSvg}
            />
          </div>

          <div className="space-y-3">
            <Label>Border color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
                disabled={!parsedSvg}
                className="h-10 w-20 cursor-pointer rounded-lg border border-white/20 bg-background disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="text"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
                disabled={!parsedSvg}
                placeholder="#000000"
                className="flex h-10 w-full rounded-md border border-white/20 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Border size (stroke width: {strokeWidth.toFixed(1)})</Label>
            <Slider
              value={strokeWidth}
              min={MIN_STROKE_WIDTH}
              max={MAX_STROKE_WIDTH}
              step={0.1}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                setStrokeWidth(next);
              }}
              disabled={!parsedSvg}
            />
          </div>

          <div className="space-y-3">
            <Label>Border style (linecap)</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={strokeLinecap === "butt" ? "default" : "outline"}
                onClick={() => setStrokeLinecap("butt")}
                disabled={!parsedSvg}
              >
                Butt
              </Button>
              <Button
                type="button"
                variant={strokeLinecap === "round" ? "default" : "outline"}
                onClick={() => setStrokeLinecap("round")}
                disabled={!parsedSvg}
              >
                Round
              </Button>
              <Button
                type="button"
                variant={strokeLinecap === "square" ? "default" : "outline"}
                onClick={() => setStrokeLinecap("square")}
                disabled={!parsedSvg}
              >
                Square
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Border join style (linejoin)</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={strokeLinejoin === "miter" ? "default" : "outline"}
                onClick={() => setStrokeLinejoin("miter")}
                disabled={!parsedSvg}
              >
                Miter
              </Button>
              <Button
                type="button"
                variant={strokeLinejoin === "round" ? "default" : "outline"}
                onClick={() => setStrokeLinejoin("round")}
                disabled={!parsedSvg}
              >
                Round
              </Button>
              <Button
                type="button"
                variant={strokeLinejoin === "bevel" ? "default" : "outline"}
                onClick={() => setStrokeLinejoin("bevel")}
                disabled={!parsedSvg}
              >
                Bevel
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="stroke-only"
              checked={strokeOnly}
              onChange={(e) => setStrokeOnly(e.target.checked)}
              disabled={!parsedSvg}
              className="h-4 w-4 rounded border-white/20 bg-background accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Label htmlFor="stroke-only" className="cursor-pointer">
              Stroke only (remove fill)
            </Label>
          </div>

          <div className="space-y-3">
            <Label>Playback mode</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "sequential" ? "default" : "outline"}
                onClick={() => setMode("sequential")}
                disabled={!parsedSvg}
              >
                Sequential
              </Button>
              <Button
                type="button"
                variant={mode === "simultaneous" ? "default" : "outline"}
                onClick={() => setMode("simultaneous")}
                disabled={!parsedSvg}
              >
                Simultaneous
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleReplay} disabled={!animatedSvg}>
              <Play className="size-4" />
              Replay
            </Button>
            <Button onClick={handleDownload} variant="outline" disabled={!animatedSvg}>
              <Download className="size-4" />
              Download Animated SVG
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle>Animated Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {animatedSvg ? (
            <div className="rounded-2xl border bg-background/60 p-6">
              <div
                key={previewKey}
                className="mx-auto flex min-h-[260px] items-center justify-center text-foreground [&_svg]:h-auto [&_svg]:max-h-[420px] [&_svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: animatedSvg }}
              />
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-background/40 text-sm text-muted-foreground">
              Upload an SVG file to start animating its paths.
            </div>
          )}
        </CardContent>
      </Card>

      <OutputField
        label="Animated SVG Markup"
        description="Export-ready SVG with embedded @keyframes and per-path animation styles."
        value={animatedSvg}
        className="border-white/10 bg-card/70"
      />
    </div>
  );
}
