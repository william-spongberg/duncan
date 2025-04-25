"use client";

import Webcam from "react-webcam";
import { useRef, useState } from "react";

export default function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        height={720}
      />
      <button onClick={capture}>Capture photo</button>
      {imageSrc && <img src={imageSrc} alt="Captured" />}
    </div>
  );
}