"use client";

import React, { useState, useMemo } from "react";
import { Dices, Copy, CheckCircle2, SlidersVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export default function BlobGeneratorTool() {
  const [tlX, setTlX] = useState<number>(30);
  const [trX, setTrX] = useState<number>(70);
  const [brX, setBrX] = useState<number>(70);
  const [blX, setBlX] = useState<number>(30);

  const [tlY, setTlY] = useState<number>(30);
  const [trY, setTrY] = useState<number>(30);
  const [brY, setBrY] = useState<number>(70);
  const [blY, setBlY] = useState<number>(70);

  const [blobColor, setBlobColor] = useState<string>("#8b5cf6");
  const [blobGradient, setBlobGradient] = useState<boolean>(true);

  const [copiedCSS, setCopiedCSS] = useState(false);
  const [copiedTW, setCopiedTW] = useState(false);

  const borderRadiusValue = `${tlX}% ${trX}% ${brX}% ${blX}% / ${tlY}% ${trY}% ${brY}% ${blY}%`;

  const cssValue = useMemo(() => {
    return [
      `border-radius: ${borderRadiusValue};`,
      blobGradient
        ? `background: linear-gradient(135deg, ${blobColor}, ${blobColor}80);`
        : `background: ${blobColor};`,
    ].join("\n");
  }, [borderRadiusValue, blobColor, blobGradient]);

  const tailwindValue = useMemo(() => {
    // Tailwind strictly uses exact class equivalents for arbitrary border-radius strings via JIT
    return `rounded-[${borderRadiusValue.replace(/ /g, "_")}] ${
      blobGradient
        ? "bg-gradient-to-br from-violet-500 to-violet-500/50"
        : "bg-violet-500"
    }`;
  }, [borderRadiusValue, blobGradient]);

  function randomize() {
    setTlX(Math.floor(Math.random() * 80) + 10);
    setTrX(Math.floor(Math.random() * 80) + 10);
    setBrX(Math.floor(Math.random() * 80) + 10);
    setBlX(Math.floor(Math.random() * 80) + 10);

    setTlY(Math.floor(Math.random() * 80) + 10);
    setTrY(Math.floor(Math.random() * 80) + 10);
    setBrY(Math.floor(Math.random() * 80) + 10);
    setBlY(Math.floor(Math.random() * 80) + 10);
  }

  const setCssCopy = () => {
    navigator.clipboard.writeText(cssValue);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };
  const setTwCopy = () => {
    navigator.clipboard.writeText(tailwindValue);
    setCopiedTW(true);
    setTimeout(() => setCopiedTW(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto xl:max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[2fr_1.5fr]">
        {/* PREVIEW DOMAIN */}
        <div className="space-y-6 flex flex-col">
          <Card className="border-white/10 bg-card/70 overflow-hidden flex-1 shadow-sm flex flex-col rounded-3xl min-h-[500px]">
            <CardHeader className="bg-background/20 border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Live Shape Projection
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomize}
                  className="h-8 gap-1.5 text-xs bg-background/50 leading-none"
                >
                  <Dices className="size-3.5" /> Randomize
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-8 sm:p-16 relative bg-[#1e293b]/50 dotted-bg">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              ></div>

              <div
                className="relative z-10 w-full max-w-[280px] aspect-square transition-all duration-[400ms] shadow-2xl ease-out"
                style={{
                  borderRadius: borderRadiusValue,
                  background: blobGradient
                    ? `linear-gradient(135deg, ${blobColor}, ${blobColor}40)`
                    : blobColor,
                }}
              />
            </CardContent>
          </Card>

          {/* EXPORT CARDS */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-white/10 bg-card/70 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-background/20 border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-l-2 border-blue-500 pl-2">
                  Native CSS
                </CardTitle>
                <Button
                  variant={copiedCSS ? "default" : "secondary"}
                  size="sm"
                  onClick={setCssCopy}
                  className={`h-7 text-xs px-3 transition-colors ${copiedCSS ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}`}
                >
                  {copiedCSS ? (
                    <>
                      <CheckCircle2 className="size-3.5 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 mr-2" /> Copy Native
                    </>
                  )}
                </Button>
              </CardHeader>
              <div className="p-0">
                <Textarea
                  readOnly
                  value={cssValue}
                  className="h-[90px] font-mono text-sm leading-relaxed p-4 bg-background/50 border-0 focus-visible:ring-0 resize-none text-blue-400"
                />
              </div>
            </Card>

            <Card className="border-white/10 bg-card/70 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-background/20 border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
                  Tailwind JIT
                </CardTitle>
                <Button
                  variant={copiedTW ? "default" : "secondary"}
                  size="sm"
                  onClick={setTwCopy}
                  className={`h-7 text-xs px-3 transition-colors ${copiedTW ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}`}
                >
                  {copiedTW ? (
                    <>
                      <CheckCircle2 className="size-3.5 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 mr-2" /> Copy Arbitrary
                    </>
                  )}
                </Button>
              </CardHeader>
              <div className="p-0">
                <Textarea
                  readOnly
                  value={tailwindValue}
                  className="h-[90px] font-mono text-[13px] leading-relaxed p-4 bg-background/50 border-0 focus-visible:ring-0 resize-none text-emerald-400"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* 8-POINT CONTROL COORDINATES */}
        <div className="space-y-6 flex flex-col h-full">
          <Card className="border-white/10 bg-card/70 shadow-sm relative overflow-hidden rounded-3xl flex flex-col flex-1">
            <CardHeader className="bg-background/20 border-b border-white/5 py-4 pb-0 z-10 sticky top-0">
              <CardTitle className="flex items-center gap-2 text-base pb-4">
                <SlidersVertical className="size-4 text-primary" />
                8-Point Radii Settings
              </CardTitle>
            </CardHeader>
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid gap-x-8 gap-y-8">
                {/* Top Left Constraints */}
                <div className="space-y-4 p-4 rounded-2xl bg-background/30 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Top-Left Quadrant
                  </h4>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      X Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {tlX}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={tlX}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTlX(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Y Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {tlY}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={tlY}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTlY(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* Top Right Constraints */}
                <div className="space-y-4 p-4 rounded-2xl bg-background/30 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Top-Right Quadrant
                  </h4>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      X Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {trX}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={trX}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTrX(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Y Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {trY}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={trY}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTrY(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* Bottom Right Constraints */}
                <div className="space-y-4 p-4 rounded-2xl bg-background/30 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Bottom-Right Quadrant
                  </h4>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      X Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {brX}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={brX}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBrX(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Y Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {brY}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={brY}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBrY(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* Bottom Left Constraints */}
                <div className="space-y-4 p-4 rounded-2xl bg-background/30 border border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Bottom-Left Quadrant
                  </h4>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      X Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {blX}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={blX}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBlX(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                      Y Interpolation{" "}
                      <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                        {blY}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={blY}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setBlY(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Base Aesthetics Controls Footer */}
            <div className="p-6 border-t border-white/5 bg-background/20 z-10 sticky bottom-0 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground block">
                  Blob Context Fill
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={blobGradient}
                      onChange={(e) => setBlobGradient(e.target.checked)}
                      className="h-4 w-4 rounded bg-background border-muted"
                    />
                    <span className="text-xs text-muted-foreground select-none">
                      Gradient Depth
                    </span>
                  </div>
                  <input
                    type="color"
                    value={blobColor}
                    onChange={(e) => setBlobColor(e.target.value)}
                    className="w-6 h-6 rounded border-none p-0 cursor-pointer block"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
