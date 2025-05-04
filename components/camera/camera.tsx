"use client";

import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  IoCameraReverseOutline,
} from "react-icons/io5";
import Upload from "./upload";
import { WIDTH, HEIGHT } from "@/constants";

export default function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
    }
  }, [webcamRef]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const discard = useCallback(() => {
    setImageSrc(null);
  }, []);

  if (imageSrc) {
    return <Upload imageSrc={imageSrc} discard={discard}/>
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-black max-w-md mx-auto">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotQuality={1}
        videoConstraints={{
          width: { ideal: WIDTH },
          height: { ideal: HEIGHT },
          facingMode,
        }}
        className="absolute inset-0 h-full w-full object-cover"
        mirrored={facingMode === "user"}
      />
      {/* Overlay Controls */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
          >
            <IoCameraReverseOutline className="h-6 w-6" />
            <span className="sr-only">Switch Camera</span>
          </Button>
        </div>
        <div className="flex justify-center pb-20 pointer-events-auto">
          <Button
            onClick={capture}
            variant="outline"
            className="h-20 w-20 rounded-full border-4 border-white bg-white/30 p-0 hover:bg-white/50"
          >
            <span className="sr-only">Capture photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
