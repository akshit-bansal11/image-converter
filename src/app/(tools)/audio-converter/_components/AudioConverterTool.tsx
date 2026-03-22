"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchFile } from "@ffmpeg/util";
import JSZip from "jszip";
import {
  ArrowRight,
  Download,
  FileAudio,
  Loader2,
  Music,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  AUDIO_FORMAT_CODEC_MAP,
  type AudioOutputFormat,
  formatFileSize,
  getAudioCodecsForFormat,
  getFFmpeg,
  getFileExtension,
  stripExtension,
  uid,
} from "@/lib/ffmpeg/client";

type ConversionStatus = "idle" | "converting" | "done" | "error";

interface AudioFileItem {
  id: string;
  file: File;
  sourceFormat: string;
  targetFormat: AudioOutputFormat;
  codec: string;
  status: ConversionStatus;
  progress: number;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
}

const ACCEPTED_AUDIO =
  ".mp3,.opus,.m4a,.aac,.mpeg,.mpg,.wma,.flac,.wav,.aiff,.aif";
const AUDIO_FORMATS = Object.keys(
  AUDIO_FORMAT_CODEC_MAP,
) as AudioOutputFormat[];

function animateNumber(
  start: number,
  end: number,
  durationMs: number,
  onFrame: (value: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const nextValue = Math.round(start + (end - start) * progress);
      onFrame(nextValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}

export default function AudioConverterTool() {
  const [files, setFiles] = useState<AudioFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const updateFile = useCallback(
    (id: string, patch: Partial<AudioFileItem>) => {
      setFiles((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const revokeOutputUrl = useCallback((item: AudioFileItem) => {
    if (item.outputUrl) {
      URL.revokeObjectURL(item.outputUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((item) => revokeOutputUrl(item));
    };
  }, [files, revokeOutputUrl]);

  const addFiles = useCallback((incoming: File[]) => {
    const nextItems: AudioFileItem[] = incoming.map((file) => {
      const sourceFormat = getFileExtension(file.name) || "unknown";
      const targetFormat: AudioOutputFormat = "mp3";
      const codecs = getAudioCodecsForFormat(targetFormat);

      return {
        id: uid("audio"),
        file,
        sourceFormat,
        targetFormat,
        codec: codecs[0],
        status: "idle",
        progress: 0,
      };
    });

    setFiles((prev) => [...prev, ...nextItems]);
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const droppedFiles = Array.from(event.dataTransfer.files).filter(
        (file) =>
          file.type.startsWith("audio/") ||
          ACCEPTED_AUDIO.includes(`.${getFileExtension(file.name)}`),
      );

      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
        ? Array.from(event.target.files)
        : [];
      const validFiles = selectedFiles.filter(
        (file) =>
          file.type.startsWith("audio/") ||
          ACCEPTED_AUDIO.includes(`.${getFileExtension(file.name)}`),
      );

      if (validFiles.length > 0) {
        addFiles(validFiles);
      }

      event.target.value = "";
    },
    [addFiles],
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target) {
          revokeOutputUrl(target);
        }
        return prev.filter((item) => item.id !== id);
      });
    },
    [revokeOutputUrl],
  );

  const clearAll = useCallback(() => {
    files.forEach((item) => revokeOutputUrl(item));
    setFiles([]);
  }, [files, revokeOutputUrl]);

  const convertOne = useCallback(
    async (item: AudioFileItem) => {
      if (item.status === "converting") {
        return;
      }

      updateFile(item.id, {
        status: "converting",
        progress: 0,
        error: undefined,
      });

      const ffmpeg = await getFFmpeg();
      const inputName = `${item.id}_input.${item.sourceFormat || "bin"}`;
      const outputName = `${stripExtension(item.file.name)}_${item.id}.${item.targetFormat}`;
      const progressState = { target: 0, rafId: 0 };

      const smoothTick = () => {
        setFiles((prev) =>
          prev.map((entry) => {
            if (entry.id !== item.id) {
              return entry;
            }

            const next =
              entry.progress +
              Math.max(
                1,
                Math.round((progressState.target - entry.progress) * 0.2),
              );
            const clamped = Math.min(next, progressState.target, 99);
            return { ...entry, progress: clamped };
          }),
        );

        progressState.rafId = requestAnimationFrame(smoothTick);
      };

      const onProgress = ({ progress }: { progress: number }) => {
        const computed = Math.max(8, Math.min(96, Math.round(progress * 96)));
        progressState.target = computed;
      };

      ffmpeg.on("progress", onProgress);
      progressState.rafId = requestAnimationFrame(smoothTick);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(item.file));
        await animateNumber(0, 10, 250, (value) =>
          updateFile(item.id, { progress: value }),
        );

        await ffmpeg.exec(["-i", inputName, "-c:a", item.codec, outputName]);
        progressState.target = 99;

        const output = await ffmpeg.readFile(outputName);
        const outBlob = new Blob([(output as Uint8Array).slice()], {
          type: `audio/${item.targetFormat}`,
        });

        if (item.outputUrl) {
          URL.revokeObjectURL(item.outputUrl);
        }

        const outUrl = URL.createObjectURL(outBlob);

        updateFile(item.id, {
          status: "done",
          progress: 100,
          outputBlob: outBlob,
          outputUrl: outUrl,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Audio conversion failed.";
        updateFile(item.id, {
          status: "error",
          progress: 0,
          error: message,
        });
      } finally {
        cancelAnimationFrame(progressState.rafId);
        ffmpeg.off("progress", onProgress);
      }
    },
    [updateFile],
  );

  const convertAll = useCallback(async () => {
    setIsConvertingAll(true);
    setErrorMessage(null);

    const pending = files.filter(
      (item) => item.status === "idle" || item.status === "error",
    );

    for (const item of pending) {
      await convertOne(item);
    }

    setIsConvertingAll(false);
  }, [convertOne, files]);

  const downloadOne = useCallback((item: AudioFileItem) => {
    if (!item.outputUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = item.outputUrl;
    link.download = `${stripExtension(item.file.name)}.${item.targetFormat}`;
    link.click();
  }, []);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter(
      (item) => item.status === "done" && item.outputBlob,
    );
    if (doneFiles.length === 0) {
      setErrorMessage("Convert at least one file before downloading a ZIP.");
      return;
    }

    setIsDownloadingZip(true);
    setErrorMessage(null);

    try {
      const zip = new JSZip();
      doneFiles.forEach((item) => {
        if (item.outputBlob) {
          zip.file(
            `${stripExtension(item.file.name)}.${item.targetFormat}`,
            item.outputBlob,
          );
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "converted-audio.zip";
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch {
      setErrorMessage("Unable to package converted files as ZIP.");
    } finally {
      setIsDownloadingZip(false);
    }
  }, [files]);

  const doneCount = useMemo(
    () => files.filter((item) => item.status === "done").length,
    [files],
  );

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-card/70">
        <CardContent className="p-5">
          <div
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-white/15 bg-background/40 hover:border-primary/60"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <FileAudio className="mx-auto mb-3 size-9 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Drop audio files here</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports mp3, opus, m4a, aac, mpeg, wma, flac, wav, and aiff.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AUDIO}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Upload audio files
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="border-white/10 bg-card/70">
          <CardHeader className="border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="size-5 text-primary" />
                Conversion queue ({files.length})
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                >
                  {doneCount} done
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isConvertingAll}
                  onClick={() => void convertAll()}
                >
                  {isConvertingAll ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Convert all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDownloadingZip}
                  onClick={() => void downloadAll()}
                >
                  {isDownloadingZip ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download ZIP
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="size-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {errorMessage ? (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            {files.map((item) => {
              const availableCodecs = getAudioCodecsForFormat(
                item.targetFormat,
              );
              const isBusy = item.status === "converting";

              return (
                <Card
                  key={item.id}
                  className="border-white/10 bg-background/40"
                >
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(item.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[auto_auto_1fr_1fr_auto] lg:items-center">
                      <Badge
                        variant="outline"
                        className="w-fit border-white/20 bg-background/70"
                      >
                        {item.sourceFormat || "unknown"}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground" />

                      <Select
                        value={item.targetFormat}
                        onChange={(event) => {
                          const nextFormat = event.target
                            .value as AudioOutputFormat;
                          const nextCodecs =
                            getAudioCodecsForFormat(nextFormat);
                          updateFile(item.id, {
                            targetFormat: nextFormat,
                            codec: nextCodecs[0],
                            status: "idle",
                            progress: 0,
                            error: undefined,
                          });
                        }}
                        disabled={isBusy}
                        className="bg-card/70"
                      >
                        {AUDIO_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {format.toUpperCase()}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={item.codec}
                        onChange={(event) =>
                          updateFile(item.id, {
                            codec: event.target.value,
                            status: "idle",
                            progress: 0,
                            error: undefined,
                          })
                        }
                        disabled={isBusy}
                        className="bg-card/70"
                      >
                        {availableCodecs.map((codec) => (
                          <option key={codec} value={codec}>
                            {codec}
                          </option>
                        ))}
                      </Select>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void convertOne(item)}
                        >
                          {isBusy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : null}
                          Convert
                        </Button>
                        <Button
                          size="sm"
                          disabled={item.status !== "done"}
                          onClick={() => downloadOne(item)}
                        >
                          <Download className="size-4" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Progress value={item.progress} />

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="border-white/15 bg-background/60"
                      >
                        {item.status}
                      </Badge>
                      {item.error ? (
                        <span className="text-red-300">{item.error}</span>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
