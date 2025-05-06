"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IoArrowBack, IoCheckmark, IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import type { Group } from "@/lib/database/types";
import { getUserGroups } from "@/lib/database/groups";
import Image from "next/image";
import { uploadSnap } from "@/lib/database/snaps";
import { Input } from "../ui/input";

interface UploadProps {
  imageSrc: string;
  discard: () => void;
}

export default function Upload({
  imageSrc,
  discard: discardCallback,
}: UploadProps) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [showInput, setShowInput] = useState(false);
  const [yLevel, setYLevel] = useState<number | null>(null);
  const [renderedImageSrc, setRenderedImageSrc] = useState<string>(imageSrc);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // fetch user's groups
  useEffect(() => {
    async function fetchGroups() {
      const userGroups = await getUserGroups();
      setGroups(userGroups);
    }

    fetchGroups();
  }, []);

  // Effect to render text on the canvas when message changes
  useEffect(() => {
    if (!message || yLevel === null) return;

    const renderTextOnImage = async () => {
      // Create temporary image element to get natural dimensions
      const tempImage = new window.Image();
      tempImage.src = imageSrc;
      
      await new Promise((resolve) => {
        tempImage.onload = resolve;
      });
      
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match image
      canvas.width = tempImage.naturalWidth;
      canvas.height = tempImage.naturalHeight;
      
      // Draw image on canvas
      ctx.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
      
      // Calculate position - adjust Y position from click
      // Convert from UI pixel position to image position
      const ratioY = yLevel / window.innerHeight;
      const textY = ratioY * canvas.height;
      
      // Text styling
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.font = `bold ${Math.max(20, canvas.width * 0.04)}px sans-serif`;
      ctx.textAlign = 'center';
      
      // Draw text with stroke for visibility
      ctx.strokeText(message, canvas.width / 2, textY);
      ctx.fillText(message, canvas.width / 2, textY);
      
      // Convert canvas to image data URL
      const newImageSrc = canvas.toDataURL('image/jpeg');
      setRenderedImageSrc(newImageSrc);
    };
    
    renderTextOnImage();
  }, [message, yLevel, imageSrc]);

  const upload = async () => {
    if (!renderedImageSrc || !selectedGroup) return;
    setLoading(true);

    // upload snap to db with the rendered image that includes text
    await uploadSnap(selectedGroup.id, renderedImageSrc);

    // view image in snaps page
    router.push("/snaps");
    setLoading(false);
  };

  const handleImageClick = (event: React.MouseEvent) => {
    // Get Y position relative to image
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    setYLevel(y);
    setShowInput(true);
  };

  function ImagePreview() {
    return (
      <div className="relative w-full h-full">
        {/* Hidden canvas element for rendering */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Display either the original image or the rendered image with text */}
        <Image
          src={renderedImageSrc}
          alt="Captured"
          layout="fill"
          objectFit="cover"
          className="h-full w-full"
          onClick={handleImageClick}
          style={{ cursor: "pointer" }}
        />
        
        {/* Text positioning indicator */}
        {yLevel !== null && showInput && (
          <div 
            className="absolute left-0 right-0 border-t border-white/50"
            style={{ top: `${yLevel}px` }}
          />
        )}
      </div>
    );
  }

  function MessageInput() {
    return (
      <>
        {showInput && (
          <div className="mb-2 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={() => setShowInput(false)}
              variant="ghost"
              className="text-white"
            >
              Done
            </Button>
          </div>
        )}{" "}
      </>
    );
  }

  function GroupSelection() {
    return (
      <div className="space-y-3">
        <h3 className="text-white font-medium">Select a group:</h3>
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => (
            <Button
              key={group.id}
              onClick={() => {
                setSelectedGroup(group);
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
            You don&apos;t have any groups yet. Create one in the groups page.
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
    );
  }

  function DiscardOrChooseGroup() {
    return (
      <div className="flex justify-between gap-2">
        <Button
          onClick={discardCallback}
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
    );
  }

  function DiscardOrUpload() {
    return (
      <div className="flex justify-between gap-2">
        <Button
          onClick={() => setSelectedGroup(null)}
          variant="ghost"
          className="rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <IoArrowBack className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={upload}
          disabled={loading}
          variant="default"
          className="rounded-full bg-white text-black hover:bg-white/90"
        >
          {loading ? (
            "Uploading..."
          ) : (
            <>
              <IoCheckmark className="mr-2 h-4 w-4" /> Upload to{" "}
              {selectedGroup?.name}
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto w-full h-[calc(100dvh-4rem)] overflow-hidden bg-black">
      <ImagePreview />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <MessageInput />
        {!selectedGroup && !showGroupSelect ? (
          <DiscardOrChooseGroup />
        ) : showGroupSelect ? (
          <GroupSelection />
        ) : (
          <DiscardOrUpload />
        )}
      </div>
    </div>
  );
}
