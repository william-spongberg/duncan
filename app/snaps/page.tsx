"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getUserGroups } from "@/lib/database/groups";
import { getSnapUrl, getGroupSnaps } from "@/lib/database/snaps";
import type { Snap, SnapWithUrl } from "@/lib/database/types";

export default function SnapsPage() {
  const [groupsWithSnaps, setGroupsWithSnaps] = useState<
    Array<{
      id: string;
      name: string;
      snaps: SnapWithUrl[];
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const snapsPerGroup = 3;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const groupsData = await getUserGroups();
      const result: Array<{
        id: string;
        name: string;
        snaps: Array<
          Snap & {
            url: string;
            uploader?: { username: string; avatar_url: string | null };
          }
        >;
      }> = [];
      if (groupsData) {
        for (const group of groupsData) {
          const groupSnaps = await getGroupSnaps(group.id, snapsPerGroup);
          const processedSnaps = await Promise.all(
            (groupSnaps || [])
              .map(async (snap: Snap) => {
                const url = await getSnapUrl(snap.storage_object_path);
                return {
                  ...snap,
                  url: url,
                } as SnapWithUrl;
              })
          );
          result.push({
            id: group.id,
            name: group.name,
            snaps: processedSnaps,
          });
        }
      }
      setGroupsWithSnaps(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-svh bg-white p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Snaps</h1>
      {loading ? (
        <Card className="p-6 text-center">
          <p>Loading...</p>
        </Card>
      ) : groupsWithSnaps.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="mb-4">You don&apos;t have any groups or snaps yet.</p>
          <Link href="/people">
            <Button>Create a Group</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupsWithSnaps.map((group) => (
            <div key={group.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">{group.name}</h2>
                <Link href={`/groups/${group.id}`}>
                  <Button variant="outline" size="sm">
                    See More
                  </Button>
                </Link>
              </div>
              {group.snaps.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No snaps in this group yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {group.snaps.map((snap) => (
                    <Link
                      key={snap.id}
                      href={`/snaps/${snap.id}`}
                      className="relative aspect-square bg-gray-100 rounded-md overflow-hidden"
                    >
                      <Image
                        src={snap.url}
                        alt="Snap"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 150px"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
