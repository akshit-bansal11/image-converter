"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchFile } from "@ffmpeg/util";
import JSZip from "jszip";
import {
  ArrowRight,
  Clapperboard,
  Download,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/feedback/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/Card";
import { FileDropzoneCard } from "@/components/ui/FileDropZone";
import { Progress } from "@/components/ui/feedback/Progress";
import { Select } from "@/components/ui/form/Select";
import {
  formatFileSize,
  getFFmpeg,
  getFileExtension,
  getVideoAudioCodecsForFormat,
  getVideoCodecsForFormat,
  stripExtension,
  uid,
  type VideoOutputFormat,
  VIDEO_FORMAT_CODEC_MAP,
} from "@/lib/ffmpeg/client";

type ConversionStatus = "idle" | "converting" | "done" | "error";

interface VideoItem {
  id: string;
  file: File;
  sourceFormat: string;
  targetFormat: VideoOutputFormat;
  videoCodec: string;
  audioCodec: string;
  status: ConversionStatus;
  progress: number;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
}

const ACCEPTED_VIDEO = ".mp4,.webm,.mkv,.mov,.avi,.flv,.ogv,.3gp";
const VIDEO_FORMATS = Object.keys(
  VIDEO_FORMAT_CODEC_MAP,
) as VideoOutputFormat[];

export default function VideoConverterTool() {
  const [files, setFiles] = useState<VideoItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateFile = useCallback((id: string, patch: Partial<VideoItem>) => {
    setFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.outputUrl) {
          URL.revokeObjectURL(item.outputUrl);
        }
      });
    };
  }, [files]);

  const addFiles = useCallback((incoming: File[]) => {
    const nextItems: VideoItem[] = incoming.map((file) => {
      const targetFormat: VideoOutputFormat = "mp4";
      const videoCodecs = getVideoCodecsForFormat(targetFormat);
      const audioCodecs = getVideoAudioCodecsForFormat(targetFormat);

      return {
        id: uid("video"),
        file,
        sourceFormat: getFileExtension(file.name) || "unknown",
        targetFormat,
        videoCodec: videoCodecs[0],
        audioCodec: audioCodecs[0],
        status: "idle",
        progress: 0,
      };
    });

    setFiles((prev) => [...prev, ...nextItems]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item?.outputUrl) {
        URL.revokeObjectURL(item.outputUrl);
      }
      return prev.filter((entry) => entry.id !== id);
    });
  }, []);

  const convertOne = useCallback(
    async (item: VideoItem) => {
      updateFile(item.id, {
        status: "converting",
        progress: 0,
        error: undefined,
      });

      const ffmpeg = await getFFmpeg();
      const sourceExt = getFileExtension(item.file.name) || "bin";
      const inputName = `${item.id}_input.${sourceExt}`;
      const outputName = `${stripExtension(item.file.name)}_${item.id}.${item.targetFormat}`;

      let rafId = 0;
      let targetProgress = 0;

      const onProgress = ({ progress }: { progress: number }) => {
        targetProgress = Math.max(7, Math.min(96, Math.round(progress * 96)));
      };

      const animate = () => {
        setFiles((prev) =>
          prev.map((entry) => {
            if (entry.id !== item.id) {
              return entry;
            }

            if (entry.progress >= targetProgress) {
              return entry;
            }

            const delta = Math.max(
              1,
              Math.round((targetProgress - entry.progress) * 0.22),
            );
            return {
              ...entry,
              progress: Math.min(entry.progress + delta, targetProgress),
            };
          }),
        );
        rafId = requestAnimationFrame(animate);
      };

      ffmpeg.on("progress", onProgress);
      rafId = requestAnimationFrame(animate);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(item.file));
        await ffmpeg.exec([
          "-i",
          inputName,
          "-c:v",
          item.videoCodec,
          "-c:a",
          item.audioCodec,
          outputName,
        ]);

        const output = await ffmpeg.readFile(outputName);
        const blob = new Blob([(output as Uint8Array).slice()], { type: `video/${item.targetFormat}` });
        const url = URL.createObjectURL(blob);

        if (item.outputUrl) {
          URL.revokeObjectURL(item.outputUrl);
        }

        updateFile(item.id, {
          status: "done",
          progress: 100,
          outputBlob: blob,
          outputUrl: url,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Video conversion failed.";
        updateFile(item.id, {
          status: "error",
          progress: 0,
          error: message,
        });
      } finally {
        cancelAnimationFrame(rafId);
        ffmpeg.off("progress", onProgress);
      }
    },
    [updateFile],
  );

  const convertAll = useCallback(async () => {
    setIsConvertingAll(true);

    const pending = files.filter(
      (item) => item.status === "idle" || item.status === "error",
    );
    for (const item of pending) {
      await convertOne(item);
    }

    setIsConvertingAll(false);
  }, [convertOne, files]);

  const downloadOne = useCallback((item: VideoItem) => {
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
      setErrorMessage("Convert at least one file before downloading ZIP.");
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

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted-videos.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("Unable to create ZIP archive.");
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
      <FileDropzoneCard
        fileTypeLabel="video files"
        supportedFormats="mp4, webm, mkv, mov, avi, flv, ogv, and 3gp"
        accept={ACCEPTED_VIDEO}
        multiple
        onFilesSelected={(incoming) => {
          const valid = incoming.filter((file) => {
            const ext = getFileExtension(file.name);
            return (
              file.type.startsWith("video/") ||
              ACCEPTED_VIDEO.includes(`.${ext}`)
            );
          });

          if (valid.length > 0) {
            addFiles(valid);
          }
        }}
      />

      {files.length > 0 ? (
        <Card className="tool-card-inline">
          <CardHeader className="border-b border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clapperboard className="size-5 text-primary" />
                Video queue ({files.length})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                >
                  {doneCount} done
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void convertAll()}
                  disabled={isConvertingAll}
                >
                  {isConvertingAll ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Convert all
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void downloadAll()}
                  disabled={isDownloadingZip}
                >
                  {isDownloadingZip ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download ZIP
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    files.forEach((item) => {
                      if (item.outputUrl) {
                        URL.revokeObjectURL(item.outputUrl);
                      }
                    });
                    setFiles([]);
                  }}
                >
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
              const videoCodecs = getVideoCodecsForFormat(item.targetFormat);
              const audioCodecs = getVideoAudioCodecsForFormat(
                item.targetFormat,
              );
              const outputSize = item.outputBlob
                ? formatFileSize(item.outputBlob.size)
                : null;

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
                          Source size: {formatFileSize(item.file.size)}
                          {outputSize ? ` -> Output size: ${outputSize}` : ""}
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

                    <div className="grid gap-3 lg:grid-cols-[auto_auto_1fr_1fr_1fr_auto] lg:items-center">
                      <Badge
                        variant="outline"
                        className="w-fit border-white/15 bg-background/70"
                      >
                        {item.sourceFormat}
                      </Badge>
                      <ArrowRight className="size-4 text-muted-foreground" />

                      <Select
                        value={item.targetFormat}
                        onChange={(event) => {
                          const nextFormat = event.target
                            .value as VideoOutputFormat;
                          const nextVideoCodecs =
                            getVideoCodecsForFormat(nextFormat);
                          const nextAudioCodecs =
                            getVideoAudioCodecsForFormat(nextFormat);
                          updateFile(item.id, {
                            targetFormat: nextFormat,
                            videoCodec: nextVideoCodecs[0],
                            audioCodec: nextAudioCodecs[0],
                            status: "idle",
                            progress: 0,
                            error: undefined,
                          });
                        }}
                        disabled={item.status === "converting"}
                      >
                        {VIDEO_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {format.toUpperCase()}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={item.videoCodec}
                        onChange={(event) =>
                          updateFile(item.id, {
                            videoCodec: event.target.value,
                            status: "idle",
                            progress: 0,
                            error: undefined,
                          })
                        }
                        disabled={item.status === "converting"}
                      >
                        {videoCodecs.map((codec) => (
                          <option key={codec} value={codec}>
                            {codec}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={item.audioCodec}
                        onChange={(event) =>
                          updateFile(item.id, {
                            audioCodec: event.target.value,
                            status: "idle",
                            progress: 0,
                            error: undefined,
                          })
                        }
                        disabled={item.status === "converting"}
                      >
                        {audioCodecs.map((codec) => (
                          <option key={codec} value={codec}>
                            {codec}
                          </option>
                        ))}
                      </Select>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={item.status === "converting"}
                          onClick={() => void convertOne(item)}
                        >
                          {item.status === "converting" ? (
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
      ) : null}
    </div>
  );
}
