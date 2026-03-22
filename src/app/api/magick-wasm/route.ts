import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const wasmPath = path.join(
    process.cwd(),
    "node_modules",
    "@imagemagick",
    "magick-wasm",
    "dist",
    "magick.wasm",
  );

  const wasmBytes = await readFile(wasmPath);

  return new Response(wasmBytes, {
    headers: {
      "Content-Type": "application/wasm",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
