"use client";

import { useEffect, useState } from "react";
import { deleteSnap, getSnap, getSnapImage } from "@/lib/database/snaps";
import type { Snap } from "@/lib/database/types";
import { SnapDisplay } from "@/components/snaps/snap-display";
import { getUserId } from "@/lib/database/user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SnapContentProps {
  snapId: string;
}

export default function SnapContent({ snapId }: SnapContentProps) {
  const router = useRouter();
  const [snap, setSnap] = useState<Snap | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserId() {
      const currentUserId = await getUserId();
      setUserId(currentUserId);
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    async function fetchSnap() {
      setLoading(true);

      // fetch snap data
      const data = await getSnap(snapId);
      if (!data) {
        setSnap(null);
        setLoading(false);
        return;
      }
      setSnap(data);

      // get url for snap
      const url = await getSnapImage(data.storage_object_path);
      setImageUrl(url);

      setLoading(false);
    }
    fetchSnap();
  }, [snapId]);

  const handleDeleteSnap = async () => {
    await deleteSnap(snapId);
    router.push("/snaps");
  };

  if (loading) return <div>Loading...</div>;
  if (!snap) return <div>Snap not found.</div>;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex flex-col items-center gap-4">
        {imageUrl && <SnapDisplay imageUrl={imageUrl} />}
        <div className="text-gray-500 text-sm">
          Uploaded: {new Date(snap.created_at).toLocaleString()}
        </div>
        {snap.uploader_user_id === userId && (
          <>
            <Button variant="destructive" onClick={handleDeleteSnap}>
              Delete Snap
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
