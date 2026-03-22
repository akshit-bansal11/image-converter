"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  FileImage,
  FileBox,
  Trash2,
  RefreshCw,
  ArrowRight,
  Download,
  ImageIcon,
  GripVertical,
  LayoutGrid,
  Settings,
  X,
  File,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import JSZip from "jszip";

// Set worker source for PDF.js safely in Next.js client
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

type TabType = "img-to-pdf" | "pdf-to-img";
type ImgToPdfMode = "combined" | "batch";

interface ImgFileItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}

interface PdfPageItem {
  id: string;
  pageNumber: number;
  preview: string;
  blob: Blob;
  name: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PdfConverterTool() {
  const [activeTab, setActiveTab] = useState<TabType>("img-to-pdf");

  // --- Img -> PDF State ---
  const [imgFiles, setImgFiles] = useState<ImgFileItem[]>([]);
  const [imgMode, setImgMode] = useState<ImgToPdfMode>("combined");
  const [isProcessingImgToPdf, setIsProcessingImgToPdf] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);

  // --- PDF -> Img State ---
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PdfPageItem[]>([]);
  const [outputImgFormat, setOutputImgFormat] = useState<
    "image/png" | "image/jpeg"
  >("image/png");
  const [isProcessingPdfToImg, setIsProcessingPdfToImg] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // --- Common DnD State ---
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HTML5 Sortable Drag State for Img -> PDF Combined mode
  const [draggedImgId, setDraggedImgId] = useState<string | null>(null);

  // --- Cleanup Blob URLs ---
  useEffect(() => {
    return () => {
      imgFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      pdfPages.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []); // eslint-disable-line

  // --- File Handlers ---
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processUpload = useCallback(
    (files: File[]) => {
      if (activeTab === "img-to-pdf") {
        const validImages = files.filter((f) => f.type.startsWith("image/"));
        const newItems = validImages.map((f) => ({
          id: generateId(),
          file: f,
          preview: URL.createObjectURL(f),
          name: f.name,
        }));
        setImgFiles((prev) => [...prev, ...newItems]);
      } else {
        const validPdf = files.find((f) => f.type === "application/pdf");
        if (validPdf) {
          setPdfFile(validPdf);
          setPdfPages([]); // Reset pages
        }
      }
    },
    [activeTab],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      dragCounter.current = 0;

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        processUpload(droppedFiles);
      }
    },
    [processUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files ? Array.from(e.target.files) : [];
      if (selected.length > 0) {
        processUpload(selected);
      }
      e.target.value = ""; // Reset input
    },
    [processUpload],
  );

  const removeImgFile = (id: string) => {
    setImgFiles((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx !== -1) URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  // --- Sort Handlers for Img -> PDF ---
  const handleSortDragStart = (e: React.DragEvent, id: string) => {
    setDraggedImgId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSortDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleSortDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedImgId || draggedImgId === targetId) return;

    setImgFiles((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === draggedImgId);
      const newIdx = prev.findIndex((i) => i.id === targetId);

      const newArray = [...prev];
      const [movedItem] = newArray.splice(oldIdx, 1);
      newArray.splice(newIdx, 0, movedItem);
      return newArray;
    });
    setDraggedImgId(null);
  };

  // --- Img -> PDF Processing Logic ---
  const processImageToPdf = async () => {
    if (imgFiles.length === 0) return;
    setIsProcessingImgToPdf(true);
    setImgProgress(0);

    try {
      if (imgMode === "combined") {
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < imgFiles.length; i++) {
          const item = imgFiles[i];
          const imgBytes = await item.file.arrayBuffer();

          let image;
          if (item.file.type === "image/png") {
            image = await pdfDoc.embedPng(imgBytes);
          } else if (
            item.file.type === "image/jpeg" ||
            item.file.type === "image/jpg"
          ) {
            image = await pdfDoc.embedJpg(imgBytes);
          } else {
            // Unhandled image typess natively by pdf-lib (like webp) could break here.
            // For robust support, one might draw them to canvas and export to PNG bytes first, but let's try embedding.
            // Since pdf-lib only natively supports JPG/PNG safely, we should convert others via Canvas first.
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const imgEl = new Image();
            await new Promise((res, rej) => {
              imgEl.onload = res;
              imgEl.onerror = rej;
              imgEl.src = item.preview;
            });
            canvas.width = imgEl.width;
            canvas.height = imgEl.height;
            if (ctx) ctx.drawImage(imgEl, 0, 0);

            // Standard fallback to PNG for safety
            const blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, "image/png"),
            );
            if (blob) {
              const buffer = await blob.arrayBuffer();
              image = await pdfDoc.embedPng(buffer);
            }
          }

          if (image) {
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
          }

          setImgProgress(Math.round(((i + 1) / imgFiles.length) * 100));
        }

        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Uint8Array.from(pdfBytes).buffer;
        downloadBlob(
          new Blob([pdfBuffer], { type: "application/pdf" }),
          "Combined_Images.pdf",
        );
      } else {
        // Batch mode
        const zip = new JSZip();
        for (let i = 0; i < imgFiles.length; i++) {
          const item = imgFiles[i];
          const pdfDoc = await PDFDocument.create();

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const imgEl = new Image();
          await new Promise((res) => {
            imgEl.onload = res;
            imgEl.src = item.preview;
          });
          canvas.width = imgEl.width;
          canvas.height = imgEl.height;
          if (ctx) ctx.drawImage(imgEl, 0, 0);

          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, "image/png"),
          );
          if (blob) {
            const buffer = await blob.arrayBuffer();
            const image = await pdfDoc.embedPng(buffer);
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
          }

          const pdfBytes = await pdfDoc.save();
          const safeName =
            item.name.split(".").slice(0, -1).join(".") || `image_${i}`;
          zip.file(`${safeName}.pdf`, pdfBytes);

          setImgProgress(Math.round(((i + 1) / imgFiles.length) * 100));
        }

        const content = await zip.generateAsync({ type: "blob" });
        downloadBlob(content, "Batch_PDFs.zip");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during PDF generation.");
    }

    setIsProcessingImgToPdf(false);
    setImgProgress(100);
    setTimeout(() => setImgProgress(0), 2000);
  };

  // --- PDF -> Img Processing Logic ---
  const processPdfToImg = async () => {
    if (!pdfFile) return;
    setIsProcessingPdfToImg(true);
    setPdfProgress(0);
    setPdfPages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const extractedPages: PdfPageItem[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // HiDPI render

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvas, canvasContext: context, viewport })
            .promise;

          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, outputImgFormat, 0.9),
          );
          if (blob) {
            extractedPages.push({
              id: generateId(),
              pageNumber: pageNum,
              preview: URL.createObjectURL(blob),
              blob,
              name: `Page_${pageNum}.${outputImgFormat === "image/png" ? "png" : "jpg"}`,
            });
          }
        }
        setPdfProgress(Math.round((pageNum / totalPages) * 100));
      }

      setPdfPages((prev) => [...prev, ...extractedPages]);
    } catch (e) {
      console.error(e);
      alert("An error occurred while reading the PDF.");
    }

    setIsProcessingPdfToImg(false);
    setPdfProgress(100);
    setTimeout(() => setPdfProgress(0), 2000);
  };

  const handleDownloadSinglePage = (page: PdfPageItem) => {
    downloadBlob(page.blob, page.name);
  };

  const handleDownloadPagesAsZip = async () => {
    if (pdfPages.length === 0) return;
    const zip = new JSZip();
    pdfPages.forEach((p) => {
      zip.file(p.name, p.blob);
    });
    const content = await zip.generateAsync({ type: "blob" });
    downloadBlob(content, `Extracted_Pages.zip`);
  };

  // --- Utils ---
  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto xl:max-w-7xl">
      {/* Tabs / Mode Selector */}
      <div className="flex w-full items-center justify-center">
        <div className="inline-flex items-center rounded-full border bg-card/60 p-1.5 shadow-sm backdrop-blur-md">
          <button
            onClick={() => setActiveTab("img-to-pdf")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === "img-to-pdf"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <ImageIcon className="size-4" />
            Images to PDF
          </button>
          <button
            onClick={() => setActiveTab("pdf-to-img")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === "pdf-to-img"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <FileBox className="size-4" />
            PDF to Images
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_360px]">
        {/* Main Interface Area */}
        <div className="space-y-6">
          {/* Uploader Block */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed bg-card/40 p-12 transition-all duration-300 ${
              isDraggingOver
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-card/60"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                {activeTab === "img-to-pdf" ? (
                  <ImageIcon className="size-8 text-primary" />
                ) : (
                  <File className="size-8 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {activeTab === "img-to-pdf"
                    ? "Drop images here"
                    : "Drop a PDF file here"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeTab === "img-to-pdf"
                    ? "Supports JPG, PNG, WEBP. You can upload multiple files."
                    : "Extract every graphical page straight from the document."}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="mt-4 shrink-0 bg-background/80 font-mono backdrop-blur-md"
              >
                Or click to browse
              </Badge>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple={activeTab === "img-to-pdf"}
              accept={
                activeTab === "img-to-pdf"
                  ? "image/png, image/jpeg, image/webp"
                  : "application/pdf"
              }
              className="hidden"
              onChange={handleFileSelect}
            />
          </button>

          {/* Render Img -> PDF Uploaded Files */}
          {activeTab === "img-to-pdf" && imgFiles.length > 0 && (
            <div className="space-y-4 rounded-3xl border bg-card/40 p-6">
              <div className="flex items-center justify-between border-b pb-4 border-white/5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Queued Images{" "}
                  <span className="text-muted-foreground font-normal ml-2">
                    ({imgFiles.length})
                  </span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImgFiles([])}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="size-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pt-2">
                {imgFiles.map((item) => (
                  <div
                    key={item.id}
                    draggable={imgMode === "combined"}
                    onDragStart={(e) => handleSortDragStart(e, item.id)}
                    onDragOver={handleSortDragOver}
                    onDrop={(e) => handleSortDrop(e, item.id)}
                    className={`group relative flex items-center overflow-hidden rounded-2xl border bg-background/50 pr-2 transition-colors ${
                      draggedImgId === item.id
                        ? "opacity-30"
                        : "hover:border-primary/50"
                    } ${imgMode === "combined" ? "cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    {imgMode === "combined" && (
                      <div className="px-2 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground h-full flex items-center bg-black/10">
                        <GripVertical className="size-4" />
                      </div>
                    )}
                    <div
                      className={`h-[60px] w-[60px] shrink-0 overflow-hidden ${imgMode === "batch" ? "ml-2 my-2 rounded-xl" : ""}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pl-3 py-3 select-none">
                      <p className="truncate text-xs font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImgFile(item.id);
                      }}
                      className="p-2 ml-1 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render PDF -> Img Page Layout */}
          {activeTab === "pdf-to-img" && pdfFile && (
            <div className="space-y-4 rounded-3xl border bg-card/40 p-6">
              <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                  <File className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(pdfFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPdfFile(null);
                    setPdfPages([]);
                  }}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <X className="size-5" />
                </Button>
              </div>

              {pdfPages.length > 0 && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">
                      Extracted Pages ({pdfPages.length})
                    </h3>
                    <Button
                      onClick={handleDownloadPagesAsZip}
                      size="sm"
                      className="h-8 gap-2 bg-blue-600 hover:bg-blue-500 border-none"
                    >
                      <Download className="size-3.5" />
                      Download ZIP
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {pdfPages.map((page) => (
                      <div
                        key={page.id}
                        className="group relative rounded-2xl border bg-background/50 p-2 overflow-hidden shadow-sm"
                      >
                        <div className="aspect-[1/1.414] w-full overflow-hidden rounded-xl bg-white border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={page.preview}
                            alt={page.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge
                            variant="secondary"
                            className="bg-black/80 text-white backdrop-blur shadow-md"
                          >
                            Page {page.pageNumber}
                          </Badge>
                        </div>
                        <div className="absolute inset-x-2 bottom-2 rounded-xl bg-black/60 p-2 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownloadSinglePage(page)}
                            className="w-full text-xs gap-2"
                          >
                            <Download className="size-3.5" /> Save{" "}
                            {outputImgFormat === "image/png" ? "PNG" : "JPG"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70 sticky top-6 lg:top-24">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="size-5 text-muted-foreground" />
                Conversion Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {activeTab === "img-to-pdf" && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Export Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setImgMode("combined")}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                          imgMode === "combined"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <LayoutGrid className="size-5" />
                        <span className="font-medium">Combined</span>
                      </button>
                      <button
                        onClick={() => setImgMode("batch")}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                          imgMode === "batch"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <FileImage className="size-5" />
                        <span className="font-medium">Batch</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {imgMode === "combined"
                        ? "Merge all uploaded images sequentially into a single multi-page PDF document. Drag list items to reorder pages."
                        : "Convert every uploaded image individually into its own separate single-page PDF, generating a ZIP."}
                    </p>
                  </div>

                  {imgProgress > 0 && imgProgress < 100 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex text-xs justify-between mb-1">
                        <span className="text-muted-foreground">
                          Processing...
                        </span>
                        <span className="font-medium">{imgProgress}%</span>
                      </div>
                      <Progress value={imgProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={processImageToPdf}
                    disabled={imgFiles.length === 0 || isProcessingImgToPdf}
                    className="w-full gap-2 h-12 rounded-xl shadow-lg border-none bg-blue-600 hover:bg-blue-500 font-semibold"
                  >
                    {isProcessingImgToPdf ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    {isProcessingImgToPdf ? "Generating..." : "Generate PDF"}
                  </Button>
                </>
              )}

              {activeTab === "pdf-to-img" && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-medium leading-none">
                      Extract Format
                    </label>
                    <Select
                      value={outputImgFormat}
                      onChange={(e) =>
                        setOutputImgFormat(
                          e.target.value as "image/png" | "image/jpeg",
                        )
                      }
                    >
                      <option value="image/png">PNG Sequence</option>
                      <option value="image/jpeg">JPEG Sequence</option>
                    </Select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      PNGs preserve transparency and sharp text lines. JPEGs are
                      highly compressed and suitable for photos.
                    </p>
                  </div>

                  {pdfProgress > 0 && pdfProgress < 100 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex text-xs justify-between mb-1">
                        <span className="text-muted-foreground">
                          Extracting...
                        </span>
                        <span className="font-medium">{pdfProgress}%</span>
                      </div>
                      <Progress value={pdfProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={processPdfToImg}
                    disabled={!pdfFile || isProcessingPdfToImg}
                    className="w-full gap-2 h-12 rounded-xl shadow-lg border-none bg-blue-600 hover:bg-blue-500 font-semibold"
                  >
                    {isProcessingPdfToImg ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {isProcessingPdfToImg ? "Extracting..." : "Extract Pages"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
