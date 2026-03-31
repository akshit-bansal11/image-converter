"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  clampRect,
  getHandleAtPoint,
  loadImage,
  pointToCanvasSpace,
  resizeRect,
} from "./imageCropperUtils";
import type { CropRect, PointerState, UploadedImage } from "./imageCropperTypes";

interface CropCanvasEditorProps {
  image: UploadedImage;
  crop: CropRect;
  onCropChange: (next: CropRect) => void;
  aspectRatio: number | null;
}

export function CropCanvasEditor({
  image,
  crop,
  onCropChange,
  aspectRatio,
}: CropCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const pointerStateRef = useRef<PointerState>({
    active: false,
    pointerId: null,
    handle: "move",
    startPoint: { x: 0, y: 0 },
    startRect: crop,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const source = imageRef.current;
    if (!canvas || !source) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    const scaledCrop = {
      x: crop.x * scale,
      y: crop.y * scale,
      w: crop.w * scale,
      h: crop.h * scale,
    };

    context.fillStyle = "rgba(0, 0, 0, 0.48)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.clearRect(scaledCrop.x, scaledCrop.y, scaledCrop.w, scaledCrop.h);

    context.strokeStyle = "#4ade80";
    context.lineWidth = 2;
    context.strokeRect(scaledCrop.x, scaledCrop.y, scaledCrop.w, scaledCrop.h);

    context.fillStyle = "#4ade80";
    [
      [scaledCrop.x, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w / 2, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y + scaledCrop.h / 2],
      [scaledCrop.x + scaledCrop.w, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x + scaledCrop.w / 2, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x, scaledCrop.y + scaledCrop.h],
      [scaledCrop.x, scaledCrop.y + scaledCrop.h / 2],
    ].forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
    });
  }, [crop, scale]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const source = await loadImage(image.srcUrl);
      if (!mounted) return;

      imageRef.current = source;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const computedScale = Math.min(840 / image.width, 460 / image.height, 1);
      canvas.width = Math.max(1, Math.round(image.width * computedScale));
      canvas.height = Math.max(1, Math.round(image.height * computedScale));
      setScale(computedScale);
    };

    void setup();

    return () => {
      mounted = false;
      imageRef.current = null;
    };
  }, [image.height, image.srcUrl, image.width]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || scale <= 0) return;

      const point = pointToCanvasSpace(canvas, event.clientX, event.clientY);
      const pointInImage = { x: point.x / scale, y: point.y / scale };
      const handle = getHandleAtPoint(pointInImage, crop, 10 / scale);
      if (!handle) return;

      pointerStateRef.current = {
        active: true,
        pointerId: event.pointerId,
        handle,
        startPoint: pointInImage,
        startRect: crop,
      };

      canvas.setPointerCapture(event.pointerId);
    },
    [crop, scale],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !pointerStateRef.current.active || scale <= 0) return;

      const state = pointerStateRef.current;
      if (state.pointerId !== event.pointerId) return;

      const point = pointToCanvasSpace(canvas, event.clientX, event.clientY);
      const pointInImage = { x: point.x / scale, y: point.y / scale };
      const resized = resizeRect(
        state.startRect,
        pointInImage.x - state.startPoint.x,
        pointInImage.y - state.startPoint.y,
        state.handle,
        aspectRatio,
      );

      onCropChange(clampRect(resized, image.width, image.height));
    },
    [aspectRatio, image.height, image.width, onCropChange, scale],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (pointerStateRef.current.pointerId === event.pointerId) {
        pointerStateRef.current.active = false;
        pointerStateRef.current.pointerId = null;
        canvas.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35 p-2">
        <canvas
          ref={canvasRef}
          className="h-auto w-full touch-none rounded-md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Crop: {Math.round(crop.w)} x {Math.round(crop.h)} px at (
        {Math.round(crop.x)}, {Math.round(crop.y)})
      </p>
    </div>
  );
}
