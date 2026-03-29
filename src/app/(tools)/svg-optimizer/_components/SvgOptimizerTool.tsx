"use client";

import React, { useState, useMemo } from "react";
import {
  FileCode2,
  Copy,
  Download,
  Settings,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/Card";
import { Badge } from "@/components/ui/feedback/Badge";
import { FileDropzoneCard } from "@/components/ui/FileDropZone";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/form/Textarea";

import { optimize } from "svgo/browser";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const KEBAB_TO_CAMEL = [
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "fill-rule",
  "clip-rule",
  "fill-opacity",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "alignment-baseline",
  "clip-path",
  "stop-color",
  "stop-opacity",
  "vector-effect",
];

function convertToJSX(svgString: string) {
  let jsx = svgString.replace(/class=/g, "className=");
  jsx = jsx.replace(/for=/g, "htmlFor=");

  // Replace kebab-case SVG attributes with camelCase
  KEBAB_TO_CAMEL.forEach((kebab) => {
    const camel = kebab.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const regex = new RegExp(`${kebab}=`, "gi");
    jsx = jsx.replace(regex, `${camel}=`);
  });

  // Inject props
  jsx = jsx.replace(/<svg\s*/, "<svg {...props} ");

  return `export default function SvgIcon(props) {\n  return (\n    ${jsx.trim().replace(/\n/g, "\n    ")}\n  );\n}`;
}

export default function SvgOptimizerTool() {
  const [inputSvg, setInputSvg] = useState<string>("");

  // Notification UI
  const [copiedId, setCopiedId] = useState<"optimized" | "jsx" | null>(null);

  // Settings
  const [precision, setPrecision] = useState<number>(3);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeEmptyAttrs, setRemoveEmptyAttrs] = useState(true);
  const [collapseGroups, setCollapseGroups] = useState(true);
  const [stripNamespaces, setStripNamespaces] = useState(true);
  const [convertStyles, setConvertStyles] = useState(true); // convertStyleToAttrs

  const [enableJsx, setEnableJsx] = useState(false);

  // Process File wrapper
  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setInputSvg(result);
    };
    reader.readAsText(file);
  };

  // Compute Optimizations live
  const optimizedData = useMemo(() => {
    if (!inputSvg.trim()) {
      return {
        output: "",
        jsxOutput: "",
        preview: null,
        origSize: 0,
        optiSize: 0,
      };
    }

    try {
      const plugins: unknown[] = [];

      if (removeComments) plugins.push("removeComments");
      if (removeMetadata)
        plugins.push(
          "removeMetadata",
          "removeTitle",
          "removeDesc",
          "removeXMLProcInst",
        );
      if (removeEmptyAttrs)
        plugins.push("removeEmptyAttrs", "removeEmptyContainers");
      if (collapseGroups) plugins.push("collapseGroups");
      if (stripNamespaces) plugins.push("removeEditorsNSData");
      if (convertStyles) plugins.push("convertStyleToAttrs");

      plugins.push("cleanupIds", "minifyStyles", "removeUnknownsAndDefaults");

      const result = optimize(inputSvg, {
        multipass: true,
        plugins: [
          // @ts-expect-error - plugins array is dynamically built
          ...plugins,
          // @ts-expect-error - overriding generic SVGO preset config
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: { floatPrecision: precision },
                convertPathData: { floatPrecision: precision },
                transformGroupAnimations: false, // Safer defaults
              },
            },
          },
        ],
      });

      const optiSvg = result.data;
      const optiBlobSize = new Blob([optiSvg]).size;
      const origBlobSize = new Blob([inputSvg]).size;

      const computedJsx = enableJsx ? convertToJSX(optiSvg) : "";

      return {
        output: optiSvg,
        jsxOutput: computedJsx,
        preview: optiSvg,
        origSize: origBlobSize,
        optiSize: optiBlobSize,
      };
    } catch (e) {
      console.error("SVGO optimization failed:", e);
      return {
        output: "Error parsing/optimizing SVG. Ensure valid syntax.",
        jsxOutput: "",
        preview: null,
        origSize: 0,
        optiSize: 0,
      };
    }
  }, [
    inputSvg,
    precision,
    removeComments,
    removeMetadata,
    removeEmptyAttrs,
    collapseGroups,
    stripNamespaces,
    convertStyles,
    enableJsx,
  ]);

  const savingsPct =
    optimizedData.origSize > 0
      ? Math.round(
          ((optimizedData.origSize - optimizedData.optiSize) /
            optimizedData.origSize) *
            100,
        )
      : 0;

  const handleCopy = (text: string, id: "optimized" | "jsx") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = () => {
    if (!optimizedData.output) return;
    const blob = new Blob([optimizedData.output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert encoded data URL for visual background preview safely
  const previewDataUrl = useMemo(() => {
    if (!optimizedData.preview) return null;
    return `data:image/svg+xml;base64,${btoa(encodeURIComponent(optimizedData.preview).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(Number("0x" + p1))))}`;
  }, [optimizedData.preview]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto xl:max-w-screen-2xl">
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card className="tool-card-inline sticky top-6 lg:top-8">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="size-5 text-muted-foreground" />
                Optimization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium leading-none flex items-center justify-between">
                  Decimal Precision
                  <Badge variant="outline" className="font-mono">
                    {precision}
                  </Badge>
                </label>
                <Slider
                  min={0}
                  max={5}
                  step={1}
                  value={precision}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPrecision(Number(e.target.value))
                  }
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Lower numbers heavily compress paths but can distort curves.
                  Recommended: 2-3.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">
                  Strip Toggles
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={removeComments}
                    onChange={(e) => setRemoveComments(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Remove Comments
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={removeMetadata}
                    onChange={(e) => setRemoveMetadata(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Remove Metadata & Title
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={removeEmptyAttrs}
                    onChange={(e) => setRemoveEmptyAttrs(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Remove Empty Groups & Attrs
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={collapseGroups}
                    onChange={(e) => setCollapseGroups(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Collapse Useless Groups
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={stripNamespaces}
                    onChange={(e) => setStripNamespaces(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Strip Editor Namespaces
                </label>

                <label className="flex items-center gap-3 text-sm text-foreground hover:cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={convertStyles}
                    onChange={(e) => setConvertStyles(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-background"
                  />
                  Convert Inline Styles to Attrs
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_200px] xl:grid-cols-[1fr_300px]">
            {/* Input Header & Dragzone */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Original SVG Input</label>
              <FileDropzoneCard
                fileTypeLabel="an SVG file"
                supportedFormats="SVG"
                accept=".svg,image/svg+xml"
                onFilesSelected={(incoming) => {
                  const validSvg = incoming.find(
                    (file) =>
                      file.name.toLowerCase().endsWith(".svg") ||
                      file.type === "image/svg+xml",
                  );

                  if (validSvg) {
                    handleFileLoad(validSvg);
                  }
                }}
              >
                <div className="relative">
                  {inputSvg ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 z-10 text-muted-foreground hover:text-red-400"
                      onClick={() => setInputSvg("")}
                    >
                      Clear
                    </Button>
                  ) : null}

                  <Textarea
                    value={inputSvg}
                    onChange={(e) => setInputSvg(e.target.value)}
                    spellCheck={false}
                    placeholder="Paste raw <svg> markup here, or drop a file anywhere on this box..."
                    className="min-h-[260px] w-full resize-none border border-white/10 bg-background/30 p-4 pt-12 font-mono text-xs leading-relaxed focus-visible:ring-0"
                  />
                </div>
              </FileDropzoneCard>
            </div>

            {/* Live Visual Preview */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Live Render Output</label>
              <div className="flex h-[260px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-black/10 border border-white/5 shadow-inner">
                {previewDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewDataUrl}
                    alt="Optimized Preview"
                    className="h-[200px] w-[200px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="text-muted-foreground/30 flex flex-col items-center">
                    <FileCode2 className="size-16 mb-4 opacity-30" />
                    <span className="text-xs">Preview Empty</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between rounded-xl bg-card border border-white/5 p-4 shadow-sm">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                  Original Size
                </p>
                <p className="font-mono text-sm mt-0.5">
                  {formatFileSize(optimizedData.origSize)}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/30" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                  Optimized Size
                </p>
                <p className="font-mono text-sm mt-0.5 text-emerald-400">
                  {formatFileSize(optimizedData.optiSize)}
                </p>
              </div>
            </div>
            {optimizedData.origSize > 0 && (
              <Badge
                variant="outline"
                className={`font-mono text-sm border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-1 ${savingsPct < 0 ? "border-red-500/30 bg-red-500/10 text-red-300" : ""}`}
              >
                {savingsPct > 0
                  ? `-${savingsPct}% Saved`
                  : savingsPct === 0
                    ? "No Change"
                    : `+${Math.abs(savingsPct)}% Larger`}
              </Badge>
            )}
          </div>

          {/* Optimized Output Area */}
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Optimized Markup</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCopy(optimizedData.output, "optimized")
                    }
                  >
                    {copiedId === "optimized" ? (
                      <CheckCircle2 className="size-3.5 mr-2 text-primary" />
                    ) : (
                      <Copy className="size-3.5 mr-2" />
                    )}
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    <Download className="size-3.5 mr-2" />
                    Download SVG
                  </Button>
                </div>
              </div>
              <Textarea
                readOnly
                value={optimizedData.output}
                spellCheck={false}
                className="min-h-[300px] resize-none font-mono text-xs bg-black/20 focus-visible:ring-0 leading-relaxed"
                placeholder="Optimized code will appear here..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Convert to JSX</label>
                  <div
                    className={`h-5 w-9 cursor-pointer rounded-full border border-white/20 transition-colors flex items-center p-0.5 ${enableJsx ? "bg-primary" : "bg-black/30"}`}
                    onClick={() => setEnableJsx(!enableJsx)}
                  >
                    <div
                      className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${enableJsx ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                </div>
                {enableJsx && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(optimizedData.jsxOutput, "jsx")}
                  >
                    {copiedId === "jsx" ? (
                      <CheckCircle2 className="size-3.5 mr-2 text-primary" />
                    ) : (
                      <Copy className="size-3.5 mr-2" />
                    )}
                    Copy JSX
                  </Button>
                )}
              </div>

              <div className="relative">
                {!enableJsx && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[1rem] border border-white/5">
                    <Button
                      variant="secondary"
                      onClick={() => setEnableJsx(true)}
                    >
                      Enable JSX Conversion
                    </Button>
                  </div>
                )}
                <Textarea
                  readOnly
                  value={optimizedData.jsxOutput || ""}
                  spellCheck={false}
                  className="min-h-[300px] resize-none font-mono text-xs bg-black/20 focus-visible:ring-0 leading-relaxed"
                  placeholder="import React from 'react';..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
