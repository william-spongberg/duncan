"use client";

import Webcam from "react-webcam";
import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  IoCameraReverseOutline,
  IoArrowBack,
  IoCheckmark,
  IoClose,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import type { Group } from "@/lib/database/types";
import { getUserGroups } from "@/lib/database/groups";
import { uploadSnap } from "@/lib/database/snaps";
import Image from "next/image";

const WIDTH = 1080;
const HEIGHT = 1920;

export default function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGroupSelect, setShowGroupSelect] = useState(false);

  // Fetch user's groups
  useEffect(() => {
    async function fetchGroups() {
      const userGroups = await getUserGroups();
      setGroups(userGroups);
    }

    fetchGroups();
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot({width: WIDTH, height: HEIGHT});
      setImageSrc(image);
    }
  }, [webcamRef]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const uploadImage = async () => {
    if (!imageSrc || !selectedGroup) return;
    setLoading(true);

    // upload snap to db
    await uploadSnap(selectedGroup, imageSrc);

    // view image in snaps page
    router.push("/snaps");
    setLoading(false);
  };

  if (imageSrc) {
    return (
      <div className="relative max-w-md mx-auto w-full h-[calc(100dvh-4rem)] overflow-hidden bg-black">
        <Image
          src={imageSrc}
          alt="Captured"
          layout="fill"
          objectFit="cover"
          className="h-full w-full"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {!selectedGroup && !showGroupSelect ? (
            <div className="flex justify-between gap-2">
              <Button
                onClick={() => setImageSrc(null)}
                variant="ghost"
                className="rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <IoClose className="mr-2 h-4 w-4" /> Discard
              </Button>
              <Button
                onClick={() => setShowGroupSelect(true)}
                variant="default"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                <IoArrowBack className="mr-2 h-4 w-4" /> Choose Group
              </Button>
            </div>
          ) : showGroupSelect ? (
            <div className="space-y-3">
              <h3 className="text-white font-medium">Select a group:</h3>
              <div className="grid grid-cols-2 gap-2">
                {groups.map((group) => (
                  <Button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setShowGroupSelect(false);
                    }}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
              {groups.length === 0 && (
                <p className="text-white text-sm">
                  You don&apos;t have any groups yet. Create one in the groups
                  page.
                </p>
              )}
              <Button
                onClick={() => setShowGroupSelect(false)}
                variant="ghost"
                className="w-full rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex justify-between gap-2">
              <Button
                onClick={() => setSelectedGroup(null)}
                variant="ghost"
                className="rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <IoArrowBack className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={uploadImage}
                disabled={loading}
                variant="default"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                {loading ? (
                  "Uploading..."
                ) : (
                  <>
                    <IoCheckmark className="mr-2 h-4 w-4" /> Upload to{" "}
                    {groups.find((g) => g.id === selectedGroup)?.name}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
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
