export type ImageFormat = "png" | "jpg" | "webp" | "avif" | "tiff" | "pdf";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
  convertedPages?: { blob: Blob; url: string }[];
}

export const SUPPORTED_FORMATS: ImageFormat[] = [
  "png",
  "jpg",
  "webp",
  "avif",
  "tiff",
  "pdf",
];

export const LOSSY_FORMATS: ImageFormat[] = ["jpg", "webp", "avif"];

export const ACCEPTED_MIME_TYPES: Record<string, ImageFormat> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/tiff": "tiff",
  "application/pdf": "pdf",
};

export const FORMAT_MIME_MAP: Record<ImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  tiff: "image/tiff",
  pdf: "application/pdf",
};

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  png: "PNG",
  jpg: "JPG",
  webp: "WebP",
  avif: "AVIF",
  tiff: "TIFF",
  pdf: "PDF",
};

export function detectFormat(file: File): ImageFormat | "unknown" {
  const mimeFormat = ACCEPTED_MIME_TYPES[file.type];
  if (mimeFormat) return mimeFormat;

  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "png";
    case "jpg":
    case "jpeg":
      return "jpg";
    case "webp":
      return "webp";
    case "avif":
      return "avif";
    case "tiff":
    case "tif":
      return "tiff";
    case "pdf":
      return "pdf";
    default:
      return "unknown";
  }
}

export function getDefaultTarget(source: ImageFormat | "unknown"): ImageFormat {
  switch (source) {
    case "png":
      return "jpg";
    case "jpg":
      return "png";
    case "webp":
      return "png";
    case "avif":
      return "png";
    case "tiff":
      return "png";
    case "pdf":
      return "png";
    default:
      return "png";
  }
}

export function getAvailableTargets(source: ImageFormat | "unknown"): ImageFormat[] {
  // PDF can only be converted to image formats
  if (source === "pdf") {
    return ["png", "jpg", "webp", "avif"];
  }
  // Images cannot be converted to PDF
  return SUPPORTED_FORMATS.filter((f) => f !== "pdf" && f !== source);
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
