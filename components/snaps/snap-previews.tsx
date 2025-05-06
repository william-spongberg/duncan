import { SnapWithUrl } from "@/lib/database/types";
import Link from "next/link";
import { SnapDisplay } from "./snap-display";

interface SnapPreviewsProps {
  snaps: SnapWithUrl[];
}
export function SnapPreviews({ snaps }: SnapPreviewsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {snaps.map((snap) => (
        <Link
          key={snap.id}
          href={`/snaps/${snap.id}`}
          className="relative aspect-square rounded-md overflow-hidden"
        >
          <SnapDisplay imageUrl={snap.url} isSmall={true} />
        </Link>
      ))}
    </div>
  );
}