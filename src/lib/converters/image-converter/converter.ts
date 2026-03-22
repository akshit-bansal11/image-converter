export type ImageFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "avif"
  | "tiff"
  | "heif"
  | "ico";

export type CanonicalImageFormat =
  | "png"
  | "jpeg"
  | "webp"
  | "avif"
  | "tiff"
  | "heif"
  | "ico";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_IMAGE_PIXELS = 20_000_000; // 20MP

export type ConversionStatus = "idle" | "converting" | "done" | "error";

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  sourceFormat: ImageFormat | "unknown";
  targetFormat: ImageFormat;
  quality: number;
  status: ConversionStatus;
  progress: number;
  error?: string;
  preview?: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
}

export const SUPPORTED_FORMATS: ImageFormat[] = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "tiff",
  "heif",
  "ico",
];

export const SUPPORTED_INPUT_FORMATS: ImageFormat[] = [...SUPPORTED_FORMATS];

// The bundled magick-wasm build can read HEIF but does not ship a HEIF encoder.
export const SUPPORTED_OUTPUT_FORMATS: ImageFormat[] = SUPPORTED_FORMATS.filter(
  (format) => format !== "heif",
);

export const LOSSY_FORMATS: ImageFormat[] = [
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "heif",
];

export const ACCEPTED_MIME_TYPES: Record<string, ImageFormat> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/tiff": "tiff",
  "image/x-tiff": "tiff",
  "image/heif": "heif",
  "image/heic": "heif",
  "image/heif-sequence": "heif",
  "image/heic-sequence": "heif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

export const FORMAT_MIME_MAP: Record<ImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  tiff: "image/tiff",
  heif: "image/heif",
  ico: "image/x-icon",
};

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  webp: "WebP",
  avif: "AVIF",
  tiff: "TIFF",
  heif: "HEIF",
  ico: "ICO",
};

export function getCanonicalFormat(
  format: ImageFormat | "unknown",
): CanonicalImageFormat | "unknown" {
  switch (format) {
    case "jpg":
    case "jpeg":
      return "jpeg";
    case "png":
    case "webp":
    case "avif":
    case "tiff":
    case "heif":
    case "ico":
      return format;
    default:
      return "unknown";
  }
}

export function areFormatsEquivalent(
  source: ImageFormat | "unknown",
  target: ImageFormat,
): boolean {
  return getCanonicalFormat(source) === getCanonicalFormat(target);
}

export function detectFormat(file: File): ImageFormat | "unknown" {
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "png";
    case "jpg":
      return "jpg";
    case "jpeg":
      return "jpeg";
    case "webp":
      return "webp";
    case "avif":
      return "avif";
    case "tiff":
    case "tif":
      return "tiff";
    case "heif":
    case "heic":
      return "heif";
    case "ico":
      return "ico";
    default:
      return ACCEPTED_MIME_TYPES[file.type] ?? "unknown";
  }
}

export function getDefaultTarget(source: ImageFormat | "unknown"): ImageFormat {
  switch (source) {
    case "png":
      return "jpg";
    case "jpg":
    case "jpeg":
      return "png";
    case "webp":
    case "avif":
    case "tiff":
    case "heif":
    case "ico":
      return "png";
    default:
      return "png";
  }
}

export function getAvailableTargets(
  source: ImageFormat | "unknown",
): ImageFormat[] {
  return SUPPORTED_FORMATS.filter((format) => format !== source);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
}
