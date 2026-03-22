import {
  DEFAULT_GRADIENT_IMAGE_HEIGHT,
  DEFAULT_GRADIENT_IMAGE_WIDTH,
} from "@/lib/design-tools/constants";

export type GradientKind = "linear" | "radial" | "conic";

export interface GradientStop {
  id: string;
  color: string;
  position: number;
}

export interface GradientBuilderConfig {
  type: GradientKind;
  stops: GradientStop[];
  linearAngle: number;
  radialShape: string;
  conicFrom: number;
}

export interface ParsedGradient {
  type: GradientKind;
  orientation: string;
  stops: string[];
  normalized: string;
}

const DEFAULT_LINEAR_ANGLE = 135;
const DEFAULT_RADIAL_ORIENTATION = "circle at center";
const DEFAULT_CONIC_FROM = 90;

export const LINEAR_DIRECTION_PRESETS = [
  { label: "To Right", value: 90 },
  { label: "To Bottom Right", value: 135 },
  { label: "To Bottom", value: 180 },
  { label: "To Bottom Left", value: 225 },
  { label: "To Left", value: 270 },
  { label: "To Top Left", value: 315 },
  { label: "To Top", value: 0 },
  { label: "To Top Right", value: 45 },
] as const;

export const RADIAL_SHAPES = [
  "circle at center",
  "circle at top",
  "circle at bottom right",
  "ellipse at center",
  "ellipse at top left",
  "ellipse at bottom",
] as const;

export function createGradientStop(
  color = "#5B8CFF",
  position = 0,
): GradientStop {
  return {
    id: createStableId(),
    color: color.toUpperCase(),
    position: clamp(position, 0, 100),
  };
}

export function createDefaultGradientStops() {
  return [
    createGradientStop("#2563EB", 0),
    createGradientStop("#8B5CF6", 50),
    createGradientStop("#EC4899", 100),
  ];
}

export function buildGradientCss({
  type,
  stops,
  linearAngle,
  radialShape,
  conicFrom,
}: GradientBuilderConfig) {
  const stopList = stops
    .map(
      (stop) =>
        `${normalizeColor(stop.color)} ${clamp(stop.position, 0, 100)}%`,
    )
    .join(", ");

  if (type === "radial") {
    return `radial-gradient(${radialShape || DEFAULT_RADIAL_ORIENTATION}, ${stopList})`;
  }

  if (type === "conic") {
    return `conic-gradient(from ${normalizeAngle(conicFrom)}deg at center, ${stopList})`;
  }

  return `linear-gradient(${normalizeAngle(linearAngle)}deg, ${stopList})`;
}

export function gradientToBackgroundProperty(cssGradient: string) {
  return `background: ${stripTrailingSemicolon(cssGradient)};`;
}

export function gradientToTailwindArbitrary(cssGradient: string) {
  return `bg-[${stripTrailingSemicolon(cssGradient).replace(/\s+/g, "_")}]`;
}

export function moveStop(
  stops: GradientStop[],
  fromIndex: number,
  toIndex: number,
) {
  const nextStops = [...stops];
  const [moved] = nextStops.splice(fromIndex, 1);

  if (!moved) {
    return stops;
  }

  nextStops.splice(toIndex, 0, moved);
  return nextStops;
}

export function addStop(stops: GradientStop[]) {
  if (stops.length === 0) {
    return [createGradientStop("#5B8CFF", 0)];
  }

  const lastStop = stops.at(-1);
  const previousStop = stops.at(-2);

  if (!lastStop) {
    return [...stops, createGradientStop("#5B8CFF", 100)];
  }

  const nextPosition =
    previousStop !== undefined
      ? Math.round((previousStop.position + lastStop.position) / 2)
      : Math.min(100, lastStop.position + 20);

  return [...stops, createGradientStop(lastStop.color, nextPosition)];
}

export function parseGradientString(input: string): ParsedGradient | null {
  const normalizedInput = stripTrailingSemicolon(input.trim());

  if (!normalizedInput) {
    return null;
  }

  const match = normalizedInput.match(
    /^(linear|radial|conic)-gradient\(([\s\S]+)\)$/i,
  );

  if (!match) {
    return null;
  }

  const type = match[1].toLowerCase() as GradientKind;
  const segments = splitTopLevel(match[2]).map((segment) => segment.trim());

  if (segments.length < 2) {
    return null;
  }

  let orientation = getDefaultOrientation(type);
  let stops = segments;

  if (type === "linear" && isLinearOrientation(segments[0])) {
    orientation = segments[0];
    stops = segments.slice(1);
  }

  if (type === "radial" && isRadialOrientation(segments[0])) {
    orientation = segments[0];
    stops = segments.slice(1);
  }

  if (type === "conic" && isConicOrientation(segments[0])) {
    orientation = segments[0];
    stops = segments.slice(1);
  }

  if (stops.length < 2) {
    return null;
  }

  return {
    type,
    orientation,
    stops,
    normalized: createGradientFromParts(type, orientation, stops),
  };
}

export function convertGradientSyntax(
  parsed: ParsedGradient,
  targetType: GradientKind,
) {
  if (targetType === "linear") {
    return createGradientFromParts(
      "linear",
      inferLinearOrientation(parsed),
      parsed.stops,
    );
  }

  if (targetType === "radial") {
    return createGradientFromParts(
      "radial",
      parsed.type === "radial"
        ? parsed.orientation
        : DEFAULT_RADIAL_ORIENTATION,
      parsed.stops,
    );
  }

  return createGradientFromParts(
    "conic",
    inferConicOrientation(parsed),
    parsed.stops,
  );
}

export async function downloadGradientPng(
  cssGradient: string,
  filename: string,
  width = DEFAULT_GRADIENT_IMAGE_WIDTH,
  height = DEFAULT_GRADIENT_IMAGE_HEIGHT,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  const parsed = parseGradientString(cssGradient);

  if (!parsed || parsed.type === "conic") {
    // Fallback for conic or complex types that are hard to render natively
    // We try to use the safer <div> trick but if it fails, we fall back to a simple native one
    try {
      await renderWithForeignObject(context, cssGradient, width, height);
    } catch (error) {
      console.error(
        "Native SVG rendering failed, falling back to simple canvas gradient.",
        error,
      );
      // Last resort: simple linear fill if everything fails
      const grad = context.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#2563EB");
      grad.addColorStop(1, "#EC4899");
      context.fillStyle = grad;
      context.fillRect(0, 0, width, height);
    }
  } else if (parsed.type === "linear") {
    renderLinearGradient(context, parsed, width, height);
  } else if (parsed.type === "radial") {
    renderRadialGradient(context, parsed, width, height);
  }

  const pngBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  if (!pngBlob) {
    throw new Error("PNG generation failed.");
  }

  downloadBlob(
    pngBlob,
    filename.endsWith(".png") ? filename : `${filename}.png`,
  );
}

async function renderWithForeignObject(
  context: CanvasRenderingContext2D,
  css: string,
  width: number,
  height: number,
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:${escapeHtmlAttribute(
          stripTrailingSemicolon(css),
        )};"></div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    context.drawImage(image, 0, 0, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renderLinearGradient(
  ctx: CanvasRenderingContext2D,
  parsed: ParsedGradient,
  width: number,
  height: number,
) {
  const angle = linearOrientationToAngle(parsed.orientation);
  const rad = (parseFloat(angle) * Math.PI) / 180;

  // Calculate coordinates for the angle to match CSS spec
  const length =
    Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));
  const halfLen = length / 2;

  const cx = width / 2;
  const cy = height / 2;

  const x0 = cx - Math.sin(rad) * halfLen;
  const y0 = cy + Math.cos(rad) * halfLen;
  const x1 = cx + Math.sin(rad) * halfLen;
  const y1 = cy - Math.cos(rad) * halfLen;

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  addStopsToGradient(gradient, parsed.stops);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderRadialGradient(
  ctx: CanvasRenderingContext2D,
  parsed: ParsedGradient,
  width: number,
  height: number,
) {
  // Simple centered radial for now
  const cx = width / 2;
  const cy = height / 2;
  const r1 = Math.min(width, height) / 2;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1);
  addStopsToGradient(gradient, parsed.stops);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function addStopsToGradient(gradient: CanvasGradient, stops: string[]) {
  stops.forEach((stop, index) => {
    // Split by whitespace NOT inside parentheses (e.g. rgba(0, 0, 0) skip)
    const parts = stop.trim().split(/\s+(?![^(]*\))/);
    const color = parts[0];
    let position = index / (stops.length - 1);

    if (parts.length > 1) {
      const posStr = parts[1];
      if (posStr.endsWith("%")) {
        position = parseFloat(posStr) / 100;
      }
    }

    try {
      gradient.addColorStop(clamp(position, 0, 1), color);
    } catch {
      // Ignore invalid colors/positions
    }
  });
}

export function normalizeGradientInput(value: string) {
  return stripTrailingSemicolon(value.trim());
}

function createGradientFromParts(
  type: GradientKind,
  orientation: string,
  stops: string[],
) {
  return `${type}-gradient(${orientation}, ${stops.join(", ")})`;
}

function inferLinearOrientation(parsed: ParsedGradient) {
  if (parsed.type === "linear") {
    return parsed.orientation;
  }

  if (parsed.type === "conic") {
    const match = parsed.orientation.match(
      /from\s+(-?\d+(?:\.\d+)?(?:deg|turn|rad|grad))/i,
    );

    if (match?.[1]) {
      return match[1];
    }
  }

  return `${DEFAULT_LINEAR_ANGLE}deg`;
}

function inferConicOrientation(parsed: ParsedGradient) {
  if (parsed.type === "conic") {
    return parsed.orientation;
  }

  if (parsed.type === "linear") {
    return `from ${linearOrientationToAngle(parsed.orientation)} at center`;
  }

  return `from ${DEFAULT_CONIC_FROM}deg at center`;
}

function linearOrientationToAngle(orientation: string) {
  if (ANGLE_TOKEN.test(orientation.trim())) {
    return orientation.trim();
  }

  const mappedAngle =
    LINEAR_DIRECTION_TO_ANGLE[orientation.trim().toLowerCase()];

  if (mappedAngle !== undefined) {
    return `${mappedAngle}deg`;
  }

  return `${DEFAULT_LINEAR_ANGLE}deg`;
}

function isLinearOrientation(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("to ") || ANGLE_TOKEN.test(trimmed);
}

function isRadialOrientation(value: string) {
  const trimmed = value.trim().toLowerCase();

  return (
    trimmed.includes("circle") ||
    trimmed.includes("ellipse") ||
    trimmed.includes("at ") ||
    trimmed.includes("closest-") ||
    trimmed.includes("farthest-")
  );
}

function isConicOrientation(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("from ") || trimmed.includes("at ");
}

function getDefaultOrientation(type: GradientKind) {
  if (type === "radial") {
    return DEFAULT_RADIAL_ORIENTATION;
  }

  if (type === "conic") {
    return `from ${DEFAULT_CONIC_FROM}deg at center`;
  }

  return `${DEFAULT_LINEAR_ANGLE}deg`;
}

function splitTopLevel(value: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (const character of value) {
    if (character === "(") {
      depth += 1;
    }

    if (character === ")") {
      depth = Math.max(0, depth - 1);
    }

    if (character === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (current.trim()) {
    parts.push(current);
  }

  return parts;
}

function stripTrailingSemicolon(value: string) {
  return value.replace(/;+\s*$/, "");
}

function normalizeColor(value: string) {
  return value.trim();
}

function normalizeAngle(value: number) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createStableId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `stop-${Math.random().toString(36).slice(2, 10)}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to render the gradient."));
    image.src = url;
  });
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const ANGLE_TOKEN = /^-?\d+(?:\.\d+)?(?:deg|turn|rad|grad)$/i;

const LINEAR_DIRECTION_TO_ANGLE: Record<string, number> = {
  "to top": 0,
  "to top right": 45,
  "to right": 90,
  "to bottom right": 135,
  "to bottom": 180,
  "to bottom left": 225,
  "to left": 270,
  "to top left": 315,
};
