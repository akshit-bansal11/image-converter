export type SupportedColorInput =
  | "hex"
  | "rgb"
  | "hsl"
  | "hsv"
  | "oklch"
  | "css";

export interface ParsedColor {
  source: SupportedColorInput;
  r: number;
  g: number;
  b: number;
  alpha: number;
  originalInput: string;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export function parseColorInput(input: string): ParsedColor | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const hex = parseHexColor(trimmed);

  if (hex) {
    return {
      source: "hex",
      originalInput: trimmed,
      ...hex,
    };
  }

  const rgb = parseRgbColor(trimmed);

  if (rgb) {
    return {
      source: "rgb",
      originalInput: trimmed,
      ...rgb,
    };
  }

  const hsl = parseHslColor(trimmed);

  if (hsl) {
    return {
      source: "hsl",
      originalInput: trimmed,
      ...hslToRgb(hsl.h, hsl.s, hsl.l, hsl.alpha),
    };
  }

  const hsv = parseHsvColor(trimmed);

  if (hsv) {
    return {
      source: "hsv",
      originalInput: trimmed,
      ...hsvToRgb(hsv.h, hsv.s, hsv.v, hsv.alpha),
    };
  }

  const oklch = parseOklchColor(trimmed);

  if (oklch) {
    return {
      source: "oklch",
      originalInput: trimmed,
      ...oklchToRgb(oklch.l, oklch.c, oklch.h, oklch.alpha),
    };
  }

  const cssColor = parseBrowserColor(trimmed);

  if (cssColor) {
    return {
      source: "css",
      originalInput: trimmed,
      ...cssColor,
    };
  }

  return null;
}

export function formatColorOutputs(color: ParsedColor) {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  const hsv = rgbToHsv(color.r, color.g, color.b);
  const oklch = rgbToOklch(color.r, color.g, color.b);

  return {
    hex: formatHex(color.r, color.g, color.b, color.alpha),
    rgb: formatRgb(color.r, color.g, color.b, color.alpha),
    hsl: formatHsl(hsl, color.alpha),
    hsv: formatHsv(hsv, color.alpha),
    oklch: formatOklch(oklch, color.alpha),
  };
}

export function rgbaToCssColor({ r, g, b, alpha }: ParsedColor) {
  return formatRgb(r, g, b, alpha);
}

function parseHexColor(value: string) {
  const match = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (!match) {
    return null;
  }

  const hex = match[1];

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b, a] = hex.split("").map((part) => part.repeat(2));

    return {
      r: parseInt(r, 16),
      g: parseInt(g, 16),
      b: parseInt(b, 16),
      alpha: a ? parseInt(a, 16) / 255 : 1,
    };
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    alpha: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function parseRgbColor(value: string) {
  const match = value.match(
    /^rgba?\(\s*([^,/\s]+)[,\s]+([^,/\s]+)[,\s]+([^,/\s)]+)(?:\s*[,/]\s*([^)]+))?\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    r: parseRgbChannel(match[1]),
    g: parseRgbChannel(match[2]),
    b: parseRgbChannel(match[3]),
    alpha: parseAlpha(match[4]),
  };
}

function parseHslColor(value: string) {
  const match = value.match(
    /^hsla?\(\s*([^,/\s]+)[,\s]+([^,/\s]+)[,\s]+([^,/\s)]+)(?:\s*[,/]\s*([^)]+))?\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    h: parseHue(match[1]),
    s: parsePercentage(match[2]),
    l: parsePercentage(match[3]),
    alpha: parseAlpha(match[4]),
  };
}

function parseHsvColor(value: string) {
  const match = value.match(
    /^hs[vb]a?\(\s*([^,/\s]+)[,\s]+([^,/\s]+)[,\s]+([^,/\s)]+)(?:\s*[,/]\s*([^)]+))?\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    h: parseHue(match[1]),
    s: parsePercentage(match[2]),
    v: parsePercentage(match[3]),
    alpha: parseAlpha(match[4]),
  };
}

function parseOklchColor(value: string) {
  const match = value.match(/^oklch\((.+)\)$/i);

  if (!match) {
    return null;
  }

  const [componentsPart, alphaPart] = match[1].split("/");
  const components = componentsPart
    .trim()
    .replaceAll(",", " ")
    .split(/\s+/)
    .filter(Boolean);

  if (components.length < 3) {
    return null;
  }

  const lightness = parseOklchLightness(components[0]);
  const chroma = Number.parseFloat(components[1]);
  const hue = parseHue(components[2]);

  if (Number.isNaN(lightness) || Number.isNaN(chroma) || Number.isNaN(hue)) {
    return null;
  }

  return {
    l: clamp(lightness, 0, 1),
    c: Math.max(chroma, 0),
    h: normalizeHue(hue),
    alpha: parseAlpha(alphaPart),
  };
}

function parseBrowserColor(value: string) {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !window.CSS?.supports?.("color", value)
  ) {
    return null;
  }

  const element = document.createElement("span");
  element.style.color = value;
  document.body.appendChild(element);
  const computed = window.getComputedStyle(element).color;
  document.body.removeChild(element);

  return parseRgbColor(computed);
}

function parseRgbChannel(value: string) {
  if (value.endsWith("%")) {
    return clamp(Math.round((Number.parseFloat(value) / 100) * 255), 0, 255);
  }

  return clamp(Math.round(Number.parseFloat(value)), 0, 255);
}

function parsePercentage(value: string) {
  if (value.endsWith("%")) {
    return clamp(Number.parseFloat(value), 0, 100);
  }

  return clamp(Number.parseFloat(value) * 100, 0, 100);
}

function parseOklchLightness(value: string) {
  if (value.endsWith("%")) {
    return Number.parseFloat(value) / 100;
  }

  return Number.parseFloat(value);
}

function parseAlpha(value?: string) {
  if (!value) {
    return 1;
  }

  const trimmed = value.trim();

  if (trimmed.endsWith("%")) {
    return clamp(Number.parseFloat(trimmed) / 100, 0, 1);
  }

  return clamp(Number.parseFloat(trimmed), 0, 1);
}

function parseHue(value: string) {
  return normalizeHue(Number.parseFloat(value));
}

function normalizeHue(value: number) {
  if (Number.isNaN(value)) {
    return Number.NaN;
  }

  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function formatHex(r: number, g: number, b: number, alpha: number) {
  const base = [r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  if (alpha >= 1) {
    return `#${base}`;
  }

  return `#${base}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()}`;
}

function formatRgb(r: number, g: number, b: number, alpha: number) {
  if (alpha >= 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${trimNumber(alpha, 3)})`;
}

function formatHsl(hsl: HslColor, alpha: number) {
  const value = `${Math.round(hsl.h)}, ${trimNumber(hsl.s, 1)}%, ${trimNumber(
    hsl.l,
    1,
  )}%`;

  if (alpha >= 1) {
    return `hsl(${value})`;
  }

  return `hsla(${value}, ${trimNumber(alpha, 3)})`;
}

function formatHsv(hsv: HsvColor, alpha: number) {
  const value = `${Math.round(hsv.h)}, ${trimNumber(hsv.s, 1)}%, ${trimNumber(
    hsv.v,
    1,
  )}%`;

  if (alpha >= 1) {
    return `hsv(${value})`;
  }

  return `hsv(${value}, ${trimNumber(alpha, 3)})`;
}

function formatOklch(oklch: OklchColor, alpha: number) {
  const value = `${trimNumber(oklch.l * 100, 2)}% ${trimNumber(
    oklch.c,
    4,
  )} ${trimNumber(oklch.h, 2)}`;

  if (alpha >= 1) {
    return `oklch(${value})`;
  }

  return `oklch(${value} / ${trimNumber(alpha, 3)})`;
}

function rgbToHsl(r: number, g: number, b: number): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;
  }

  return {
    h: normalizeHue(hue),
    s: saturation * 100,
    l: lightness * 100,
  };
}

function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;
  }

  return {
    h: normalizeHue(hue),
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

function hsvToRgb(h: number, s: number, v: number, alpha: number) {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const value = clamp(v, 0, 100) / 100;
  const chroma = value * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
    alpha,
  };
}

function hslToRgb(h: number, s: number, l: number, alpha: number) {
  const hue = normalizeHue(h);
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
    alpha,
  };
}

function rgbToOklch(r: number, g: number, b: number): OklchColor {
  const red = srgbToLinear(r / 255);
  const green = srgbToLinear(g / 255);
  const blue = srgbToLinear(b / 255);

  const l = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const m = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const s = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: lightness,
    c: Math.sqrt(a * a + bAxis * bAxis),
    h: normalizeHue((Math.atan2(bAxis, a) * 180) / Math.PI),
  };
}

function oklchToRgb(l: number, c: number, h: number, alpha: number) {
  const hueRadians = (normalizeHue(h) * Math.PI) / 180;
  const a = c * Math.cos(hueRadians);
  const bAxis = c * Math.sin(hueRadians);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * bAxis;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * bAxis;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * bAxis;

  const lCube = lPrime ** 3;
  const mCube = mPrime ** 3;
  const sCube = sPrime ** 3;

  const red = linearToSrgb(
    4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube,
  );
  const green = linearToSrgb(
    -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube,
  );
  const blue = linearToSrgb(
    -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube,
  );

  return {
    r: Math.round(clamp(red * 255, 0, 255)),
    g: Math.round(clamp(green * 255, 0, 255)),
    b: Math.round(clamp(blue * 255, 0, 255)),
    alpha,
  };
}

function srgbToLinear(value: number) {
  if (value <= 0.04045) {
    return value / 12.92;
  }

  return ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number) {
  if (value <= 0.0031308) {
    return 12.92 * value;
  }

  return 1.055 * value ** (1 / 2.4) - 0.055;
}

function trimNumber(value: number, digits: number) {
  return Number.parseFloat(value.toFixed(digits)).toString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
