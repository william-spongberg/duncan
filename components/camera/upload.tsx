"use client";

import { useState, useEffect } from "react";
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

  // fetch user's groups
  useEffect(() => {
    async function fetchGroups() {
      const userGroups = await getUserGroups();
      setGroups(userGroups);
    }

    fetchGroups();
  }, []);

  const upload = async () => {
    if (!imageSrc || !selectedGroup) return;
    setLoading(true);

    // upload snap to db
    if (message.length > 0) {
      await uploadSnap(selectedGroup.id, imageSrc, message, yLevel);
    } else {
      await uploadSnap(selectedGroup.id, imageSrc);
    }

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

  return (
    <div className="relative max-w-md mx-auto w-full h-[calc(100dvh-4rem)] overflow-hidden bg-black">
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt="Captured"
          layout="fill"
          objectFit="cover"
          className="h-full w-full"
          onClick={handleImageClick}
          style={{ cursor: "pointer" }}
        />
        {/* Text preview overlay */}
        {message.length > 0 && yLevel && (
          <div
            className="absolute left-1/2 w-full text-center font-bold text-white pointer-events-none text-[1.5rem]"
            style={{
              top: yLevel,
              transform: "translateX(-50%)",
              textShadow: "0 0 4px black",
            }}
          >
            {message}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
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
        )}

        {!selectedGroup && !showGroupSelect ? (
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
        ) : showGroupSelect ? (
          <GroupSelection
            groups={groups}
            setSelectedGroup={setSelectedGroup}
            setShowGroupSelect={setShowGroupSelect}
          />
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
        )}
      </div>
    </div>
  );
}

interface GroupSelectionProps {
  groups: Group[];
  setSelectedGroup: (input: Group | null) => void;
  setShowGroupSelect: (input: boolean) => void;
}

function GroupSelection({
  groups,
  setSelectedGroup,
  setShowGroupSelect,
}: GroupSelectionProps) {
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
