"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserGroups } from "@/lib/database/groups";
import { getSnapImage, getLatestGroupSnaps } from "@/lib/database/snaps";
import type { Snap, SnapWithUrl } from "@/lib/database/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SnapDisplay } from "@/components/snaps/snap-display";

export default function SnapsPage() {
  const [latestGroupSnaps, setLatestGroupSnaps] = useState<
    Array<{
      id: string;
      name: string;
      snaps: SnapWithUrl[];
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSnaps() {
      setLoading(true);
      const groupsData = await getUserGroups();
      const result: Array<{
        id: string;
        name: string;
        snaps: SnapWithUrl[];
      }> = [];

      // get snaps for each group
      if (groupsData) {
        for (const group of groupsData) {
          const latestSnaps: Snap[] = await getLatestGroupSnaps(group.id);
          const snapsWithUrls: SnapWithUrl[] = [];
          for (const snap of latestSnaps) {
            const url = await getSnapImage(snap.storage_object_path);
            snapsWithUrls.push({ ...snap, url });
          }
          result.push({
            id: group.id,
            name: group.name,
            snaps: snapsWithUrls,
          });
        }
      }
      setLatestGroupSnaps(result);
      setLoading(false);
    }

    fetchSnaps();
  }, []);

  return (
    <div className="min-h-svh p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Snaps</h1>
      {loading ? (
        <Card className="p-6 text-center">
          <p>Loading...</p>
        </Card>
      ) : latestGroupSnaps.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="mb-4">You don&apos;t have any groups or snaps yet.</p>
          <Link href="/people">
            <Button>Create a Group</Button>
          </Link>
        </Card>
      ) : (
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          orientation="vertical"
        >
          <CarouselContent className="h-[95dvh]">
            {latestGroupSnaps.map((group) =>
              group.snaps.length !== 0
                ? group.snaps.map((snap) => (
                    <CarouselItem key={snap.id} className="pt-1 basis-1/2">
                      <div className="p-1">
                        <Card>
                          <CardHeader>
                            <CardTitle>{group.name}</CardTitle>
                            <CardDescription>
                              <Link href={`/groups/${group.id}`}>
                                <Button variant="outline" size="sm">
                                  See More
                                </Button>
                              </Link>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Link href={`/snaps/${snap.id}`}>
                              <SnapDisplay imageUrl={snap.url} />
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))
                : null
            )}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
}
