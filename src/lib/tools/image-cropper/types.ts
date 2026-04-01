export type CropMode = "individual" | "batch";
export type CropShape = "rectangular" | "circular" | "mesh";

export type Handle = "move" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  srcUrl: string;
  width: number;
  height: number;
  crop: CropRect;
  cropShape: CropShape;
  outputUrl?: string;
  outputBlob?: Blob;
}

export interface PointerState {
  active: boolean;
  pointerId: number | null;
  handle: Handle;
  startPoint: { x: number; y: number };
  startRect: CropRect;
}
