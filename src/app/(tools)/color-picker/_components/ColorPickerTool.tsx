"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Pipette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_HEX = "#F97316";

export default function ColorPickerTool() {
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const normalizedHex = useMemo(() => normalizeHex(hex) ?? DEFAULT_HEX, [hex]);
  const rgb = useMemo(() => hexToRgb(normalizedHex), [normalizedHex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  const values = [
    { label: "HEX", value: normalizedHex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    {
      label: "HSL",
      value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    },
  ];

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(null), 1600);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pipette className="size-5" />
            Picker
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a color visually or paste a hex value to inspect it.
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="mb-5 aspect-square w-full rounded-[2rem] border shadow-inner"
            style={{ backgroundColor: normalizedHex }}
          />

          <input
            type="color"
            value={normalizedHex}
            onChange={(event) => setHex(event.target.value)}
            className="h-14 w-full cursor-pointer rounded-2xl border bg-transparent p-1"
          />

          <input
            value={hex}
            onChange={(event) => setHex(event.target.value)}
            className="mt-4 w-full rounded-2xl border bg-background/70 px-4 py-3 font-mono outline-none transition focus:border-primary"
            placeholder="#F97316"
          />
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-card/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Color values</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Copy the format that fits your workflow.
            </p>
          </div>
          <Badge variant="secondary">{normalizedHex}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {values.map((entry) => (
            <div
              key={entry.label}
              className="flex flex-col gap-3 rounded-2xl border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {entry.label}
                </p>
                <p className="mt-2 font-mono text-sm">{entry.value}</p>
              </div>
              <Button
                onClick={() => copyValue(entry.value)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copiedValue === entry.value ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copiedValue === entry.value ? "Copied" : "Copy"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function normalizeHex(value: string) {
  const trimmed = value.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toUpperCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }

  return null;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    case blue:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}
