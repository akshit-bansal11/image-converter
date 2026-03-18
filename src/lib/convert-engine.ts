import { type ImageFormat, FORMAT_MIME_MAP } from "./converter";

/**
 * Convert a raster image file to another format using Canvas API.
 */
export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d")!;

  // For JPG, fill white background (no alpha support)
  if (targetFormat === "jpg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mimeType = FORMAT_MIME_MAP[targetFormat];
  const qualityParam = ["jpg", "webp", "avif"].includes(targetFormat)
    ? quality / 100
    : undefined;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob && blob.size > 0) {
          resolve(blob);
        } else {
          reject(
            new Error(
              `Conversion to ${targetFormat.toUpperCase()} failed. Your browser may not support this format.`
            )
          );
        }
      },
      mimeType,
      qualityParam
    );
  });
}

/**
 * Convert a PDF file to images (one image per page) using pdf.js.
 */
export async function convertPdfToImages(
  file: File,
  targetFormat: ImageFormat,
  quality: number,
  onProgress?: (current: number, total: number) => void
): Promise<{ blob: Blob; url: string }[]> {
  // Dynamically import pdf.js
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results: { blob: Blob; url: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 2; // 2x for high quality
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;

    // White background for JPG
    if (targetFormat === "jpg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page as any).render({ canvasContext: ctx, viewport }).promise;

    const mimeType = FORMAT_MIME_MAP[targetFormat];
    const qualityParam = ["jpg", "webp", "avif"].includes(targetFormat)
      ? quality / 100
      : undefined;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b && b.size > 0) {
            resolve(b);
          } else {
            reject(new Error(`Failed to convert PDF page ${i} to ${targetFormat.toUpperCase()}`));
          }
        },
        mimeType,
        qualityParam
      );
    });

    const url = URL.createObjectURL(blob);
    results.push({ blob, url });

    onProgress?.(i, pdf.numPages);
  }

  return results;
}

/**
 * Check if the browser supports encoding to a specific format via Canvas.
 */
export async function checkFormatSupport(format: ImageFormat): Promise<boolean> {
  if (format === "pdf") return true; // PDF handled differently
  if (format === "png" || format === "jpg") return true; // Always supported

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, 1, 1);

    const mimeType = FORMAT_MIME_MAP[format];
    return new Promise<boolean>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob !== null && blob.size > 0);
        },
        mimeType,
        0.8
      );
    });
  } catch {
    return false;
  }
}
