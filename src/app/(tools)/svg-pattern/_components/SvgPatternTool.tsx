"use client";

import React, { useState, useMemo } from "react";
import { Grid, Copy, CheckCircle2, Download, SlidersHorizontal, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

// The raw pattern templates using fill/stroke bindings to update natively
const PATTERNS = {
  grid: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${fg}" stroke-width="1"/></svg>`,
  dots: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/2}" cy="${size/2}" r="${size/8}" fill="${fg}"/></svg>`,
  diagonal: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M0 ${size} L${size} 0 Z" fill="none" stroke="${fg}" stroke-width="2"/></svg>`,
  cross: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M${size/2} 0v${size}M0 ${size/2}h${size}" fill="none" stroke="${fg}" stroke-width="1"/></svg>`,
  waves: (fg: string, size: number) => `<svg width="${size}" height="${size/2}" xmlns="http://www.w3.org/2000/svg"><path d="M 0 ${size/4} Q ${size/4} 0, ${size/2} ${size/4} T ${size} ${size/4}" fill="none" stroke="${fg}" stroke-width="2"/></svg>`,
  polkaMap: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/4}" cy="${size/4}" r="${size/8}" fill="${fg}"/><circle cx="${size/1.33}" cy="${size/1.33}" r="${size/6}" fill="${fg}"/></svg>`,
  zigzag: (fg: string, size: number) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M 0 ${size/2} L ${size/4} 0 L ${size/2} ${size/2} L ${size*0.75} 0 L ${size} ${size/2}" fill="none" stroke="${fg}" stroke-width="1"/></svg>`,
};

type PatternType = keyof typeof PATTERNS;

export default function SvgPatternTool() {
  const [activePattern, setActivePattern] = useState<PatternType>("dots");
  const [size, setSize] = useState<number>(32);
  const [bgColor, setBgColor] = useState<string>("#0f172a");
  const [fgColor, setFgColor] = useState<string>("#3b82f6");
  const [fgOpacity, setFgOpacity] = useState<number>(50); // 0-100 mapped to hex

  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedSVG, setCopiedSVG] = useState(false);

  const finalFgHex = useMemo(() => {
    // Convert 0-100 opacity to a 2 digit 00-FF hex code suffix
    let alpha = Math.round((fgOpacity / 100) * 255).toString(16);
    if (alpha.length === 1) alpha = "0" + alpha;
    return fgColor + alpha;
  }, [fgColor, fgOpacity]);

  const rawSvgBlob = useMemo(() => {
    const generator = PATTERNS[activePattern];
    return generator(finalFgHex, size);
  }, [activePattern, finalFgHex, size]);

  const encodedSvgUrl = useMemo(() => {
    // Encodes for use inside background-image: url()
    // Using encodeURIComponent replaces %23 for # etc securely
    return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvgBlob)}`;
  }, [rawSvgBlob]);

  const cssValue = useMemo(() => {
    return [
      `background-color: ${bgColor};`,
      `background-image: url("${encodedSvgUrl}");`
    ].join("\n");
  }, [bgColor, encodedSvgUrl]);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssValue);
    setCopiedCSS(true); setTimeout(() => setCopiedCSS(false), 2000);
  };
  const handleCopySvg = () => {
    navigator.clipboard.writeText(rawSvgBlob);
    setCopiedSVG(true); setTimeout(() => setCopiedSVG(false), 2000);
  };

  const downloadSvg = () => {
    // Generate a standalone, fillable SVG file combining bg so it matches
    const standalone = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pat" width="${size}" height="${activePattern === "waves" ? size/2 : size}" patternUnits="userSpaceOnUse">
          ${rawSvgBlob.replace(/<svg[^>]*>|<\/svg>/g, '')}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="${bgColor}" />
      <rect width="100%" height="100%" fill="url(#pat)" />
    </svg>`;
    const blob = new Blob([standalone], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePattern}_pattern.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto xl:max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        
        {/* PREVIEW DOMAIN */}
        <div className="space-y-6 flex flex-col">
          <Card className="border-white/10 bg-card/70 overflow-hidden flex-1 shadow-sm flex flex-col rounded-3xl min-h-[500px]">
            <CardHeader className="bg-background/20 border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between z-20">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ImageIcon className="size-4" /> Infinite Workspace
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadSvg} className="h-8 gap-1.5 text-xs bg-background/50 hover:bg-background/80">
                  <Download className="size-3.5" /> Export Tile .SVG
                </Button>
              </div>
            </CardHeader>

            <CardContent
              className="flex-1 flex items-center justify-center p-0 transition-opacity duration-300 relative border-0 outline-none ease-out shadow-inner"
              style={{
                backgroundColor: bgColor,
                backgroundImage: `url("${encodedSvgUrl}")`,
                backgroundPosition: 'center',
              }}
            >
               {/* Internal showcase box just to show scale context */}
               <div className="relative z-10 p-6 sm:p-10 w-full max-w-md mx-auto aspect-[16/9] flex flex-col items-center justify-center rounded-3xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10" style={{ pointerEvents: 'none' }}>
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-2 drop-shadow-md">Infinite Scaling</h2>
                  <p className="text-white/80 font-medium text-sm text-center max-w-xs drop-shadow-sm leading-relaxed">
                    Zero pixelation natively injected directly through vector primitives.
                  </p>
               </div>
            </CardContent>
          </Card>

          {/* EXPORT CARDS */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-white/10 bg-card/70 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-background/20 border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-l-2 border-rose-500 pl-2">Native CSS Background</CardTitle>
                 <Button
                  variant={copiedCSS ? "default" : "secondary"} size="sm" onClick={handleCopyCss}
                  className={`h-7 text-xs px-3 transition-colors ${copiedCSS ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}`}
                 >
                  {copiedCSS ? <><CheckCircle2 className="size-3.5 mr-2" /> Copied</> : <><Copy className="size-3.5 mr-2" /> Copy CSS</>}
                </Button>
              </CardHeader>
              <div className="p-0">
                <Textarea readOnly value={cssValue} className="h-[105px] font-mono text-sm leading-relaxed p-4 bg-background/50 border-0 focus-visible:ring-0 resize-none text-rose-400 break-all overflow-y-auto custom-scrollbar" />
              </div>
            </Card>

            <Card className="border-white/10 bg-card/70 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-background/20 border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-l-2 border-amber-500 pl-2">Embeddable SVG Element</CardTitle>
                 <Button
                  variant={copiedSVG ? "default" : "secondary"} size="sm" onClick={handleCopySvg}
                  className={`h-7 text-xs px-3 transition-colors ${copiedSVG ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}`}
                 >
                  {copiedSVG ? <><CheckCircle2 className="size-3.5 mr-2" /> Copied</> : <><Copy className="size-3.5 mr-2" /> Copy &lt;svg&gt;</>}
                </Button>
              </CardHeader>
              <div className="p-0">
                <Textarea readOnly value={rawSvgBlob} className="h-[105px] font-mono text-[13px] leading-relaxed p-4 bg-background/50 border-0 focus-visible:ring-0 resize-none text-amber-400" />
              </div>
            </Card>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-white/10 bg-card/70 shadow-sm relative overflow-hidden rounded-3xl flex flex-col flex-1">
            <CardHeader className="bg-background/20 border-b border-white/5 py-4 flex flex-col z-10 sticky top-0 backdrop-blur">
              <CardTitle className="flex items-center gap-2 text-base pb-1">
                <SlidersHorizontal className="size-4 text-primary" />
                Pattern Settings
              </CardTitle>
            </CardHeader>
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1 relative z-0">
              
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none text-muted-foreground">Architectural Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PATTERNS) as PatternType[]).map((pType) => (
                    <button
                      key={pType}
                      onClick={() => setActivePattern(pType)}
                      className={`flex flex-col items-center justify-center p-3 text-xs font-semibold rounded-xl border transition-all ${
                        activePattern === pType
                          ? "bg-primary border-primary text-primary-foreground shadow-sm scale-[1.02]"
                          : "bg-background/50 border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Grid className="size-4 mb-2 opacity-50 block" />
                      <span className="capitalize">{pType.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  Tile Scaling <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">{size}px</span>
                </label>
                <Slider min={8} max={128} step={2} value={size} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(Number(e.target.value))} />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  Foreground Fill Opacity <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">{fgOpacity}%</span>
                </label>
                <Slider min={0} max={100} step={1} value={fgOpacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFgOpacity(Number(e.target.value))} />
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground block uppercase tracking-wider text-muted-foreground">Background base</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 bg-transparent block"
                    />
                    <span className="font-mono text-xs text-muted-foreground uppercase">{bgColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground block uppercase tracking-wider text-muted-foreground">Vector Fill</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-none p-0 bg-transparent block"
                    />
                    <span className="font-mono text-xs text-muted-foreground uppercase">{fgColor}</span>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
