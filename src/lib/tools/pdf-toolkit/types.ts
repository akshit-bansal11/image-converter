export type TabType = "merge" | "split" | "compress" | "reorder";

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface PdfPageThumbnail {
  id: string;
  originalIndex: number;
  previewUrl: string;
}
