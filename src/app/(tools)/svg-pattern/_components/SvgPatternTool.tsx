"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  SlidersHorizontal,
  Check,
  Copy as CopyIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/interaction/Button";
import { Slider } from "@/components/ui/interaction/Slider";
import { Textarea } from "@/components/ui/form/Textarea";

const PATTERNS = {
  grid: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${fg}" stroke-width="${w}"/></svg>`,
  dots: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${(size / 8) * w}" fill="${fg}"/></svg>`,
  diagonal: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M0 ${size} L${size} 0" stroke="${fg}" stroke-width="${w}" fill="none"/></svg>`,
  cross: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M${size / 2} 0v${size}M0 ${size / 2}h${size}" stroke="${fg}" stroke-width="${w}" fill="none"/></svg>`,
  waves: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size / 2}" xmlns="http://www.w3.org/2000/svg"><path d="M0 ${size / 4} Q ${size / 4} 0 ${size / 2} ${size / 4} T ${size} ${size / 4}" stroke="${fg}" stroke-width="${w}" fill="none"/></svg>`,
  zigzag: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M0 ${size / 2} L ${size / 4} 0 L ${size / 2} ${size / 2} L ${size * 0.75} 0 L ${size} ${size / 2}" stroke="${fg}" stroke-width="${w}" fill="none"/></svg>`,
  rings: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" stroke="${fg}" stroke-width="${w}" fill="none"/></svg>`,
  checker: (fg: string, size: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size / 2}" height="${size / 2}" fill="${fg}"/><rect x="${size / 2}" y="${size / 2}" width="${size / 2}" height="${size / 2}" fill="${fg}"/></svg>`,
  verticalLines: (fg: string, size: number, w: number) =>
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M${size / 2} 0 V${size}" stroke="${fg}" stroke-width="${w}"/></svg>`,
};

type PatternType = keyof typeof PATTERNS;

export default function SvgPatternTool() {

  // State
  const [activePattern, setActivePattern] = useState<PatternType>("dots");
  const [size, setSize] = useState(32);
  const [fgSize, setFgSize] = useState(1);
  const [bgColor, setBgColor] = useState("#0f172a");
  const [fgColor, setFgColor] = useState("#3b82f6");
  const [fgOpacity, setFgOpacity] = useState(50);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedSVG, setCopiedSVG] = useState(false);

  // Compose FG color with opacity
  const finalFgHex = useMemo(() => {
    let alpha = Math.round((fgOpacity / 100) * 255).toString(16);
    if (alpha.length === 1) alpha = "0" + alpha;
    return fgColor + alpha;
  }, [fgColor, fgOpacity]);

  // SVG string
  const rawSvgBlob = useMemo(() => {
    const generator = PATTERNS[activePattern];
    // Checker pattern doesn't use width param
    if (activePattern === "checker") {
      return generator(finalFgHex, size, fgSize);
    }
    return generator(finalFgHex, size, fgSize);
  }, [activePattern, finalFgHex, size, fgSize]);

  // Data URL for preview
  const encodedSvgUrl = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(rawSvgBlob)}`,
    [rawSvgBlob]
  );

  // CSS output
  const cssValue = useMemo(
    () =>
      `background-color: ${bgColor};\nbackground-image: url("${encodedSvgUrl}");`,
    [bgColor, encodedSvgUrl]
  );

  // Copy to clipboard
  const copy = (text: string, type: "css" | "svg") => {
    navigator.clipboard.writeText(text);
    if (type === "css") {
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 1200);
    } else {
      setCopiedSVG(true);
      setTimeout(() => setCopiedSVG(false), 1200);
    }
  };

  // Download SVG
  const downloadSvg = () => {
    const blob = new Blob([rawSvgBlob], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePattern}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  // --- UI ---
  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-0 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">SVG Pattern Generator</h1>
        <span className="text-xs text-white/40">Seamless SVG backgrounds for your UI</span>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Preview */}
        <Card className="rounded-3xl overflow-hidden border border-white/10 shadow-xl">
          <CardContent
            className="h-[420px] md:h-[500px] transition-all relative flex items-center justify-center"
            style={{
              backgroundColor: bgColor,
              backgroundImage: `url("${encodedSvgUrl}")`,
            }}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button size="sm" onClick={downloadSvg} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow">
                <Download className="size-4 mr-2" />
                Export SVG
              </Button>
            </div>
          </CardContent>
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-white/0">
            <span className="text-sm opacity-70 capitalize font-medium tracking-wide">
              {activePattern}
            </span>
            <span className="text-xs text-white/40">{size}x{size}px</span>
          </div>
        </Card>

        {/* Controls */}
        <Card className="p-6 rounded-3xl border border-white/10 space-y-7 bg-gradient-to-br from-white/5 to-white/0">
          <CardTitle className="flex items-center gap-2 text-base mb-2">
            <SlidersHorizontal className="size-4" />
            Controls
          </CardTitle>

          {/* Pattern grid with previews */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {(Object.keys(PATTERNS) as PatternType[]).map((p) => {
              // Small preview SVG for each pattern
              const preview = (() => {
                const gen = PATTERNS[p];
                if (p === "checker") return gen(finalFgHex, 24, 1);
                return gen(finalFgHex, 24, 1);
              })();
              return (
                <Button
                  variant={activePattern === p ? "default" : "outline"}
                  key={p}
                  onClick={() => setActivePattern(p)}
                  className={`flex flex-col items-center gap-1 p-2 text-xs rounded-lg capitalize transition font-medium border-2 ${
                    activePattern === p
                      ? "border-primary bg-primary/90 text-white shadow"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                  }`}
                  style={{ minHeight: 54 }}
                >
                  <span className="block w-7 h-7 rounded bg-white/10 flex items-center justify-center mb-1">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: preview,
                      }}
                    />
                  </span>
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Scale</span>
                <span className="font-mono">{size}px</span>
              </div>
              <Slider
                min={8}
                max={128}
                step={2}
                value={size}
                onChange={(e: any) => setSize(Number(e.target.value))}
              />
            </div>

            {activePattern !== "checker" && (
              <div>
                <div className="flex justify-between mb-1">
                  <span>Width</span>
                  <span className="font-mono">{fgSize}x</span>
                </div>
                <Slider
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={fgSize}
                  onChange={(e: any) => setFgSize(Number(e.target.value))}
                />
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1">
                <span>Opacity</span>
                <span className="font-mono">{fgOpacity}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                value={fgOpacity}
                onChange={(e: any) => setFgOpacity(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Colors */}
          <div className="flex gap-6 mt-2">
            <div className="flex flex-col text-xs gap-1 items-center">
              <span className="mb-1 font-semibold text-white/70">BG</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-full border-2 border-white/20 shadow cursor-pointer appearance-none"
                style={{ borderRadius: '50%' }}
                aria-label="Background color"
              />
            </div>
            <div className="flex flex-col text-xs gap-1 items-center">
              <span className="mb-1 font-semibold text-white/70">FG</span>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded-full border-2 border-white/20 shadow cursor-pointer appearance-none"
                style={{ borderRadius: '50%' }}
                aria-label="Foreground color"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Output */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-base">CSS</CardTitle>
            <Button size="sm" onClick={() => copy(cssValue, "css")}
              className={copiedCSS ? "bg-green-600/80 text-white" : "bg-white/10 text-white hover:bg-white/20"}
            >
              {copiedCSS ? (
                <Check className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </CardHeader>
          <Textarea
            readOnly
            value={cssValue}
            className="bg-[#05070f] text-rose-400 font-mono text-xs rounded-xl min-h-[80px]"
          />
        </Card>

        <Card className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-lg">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-base">SVG</CardTitle>
            <Button size="sm" onClick={() => copy(rawSvgBlob, "svg")}
              className={copiedSVG ? "bg-green-600/80 text-white" : "bg-white/10 text-white hover:bg-white/20"}
            >
              {copiedSVG ? (
                <Check className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </CardHeader>
          <Textarea
            readOnly
            value={rawSvgBlob}
            className="bg-[#05070f] text-amber-400 font-mono text-xs rounded-xl min-h-[80px]"
          />
        </Card>
      </div>
    </div>
  );
}