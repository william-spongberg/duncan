import { SnapWithUrl } from "@/lib/database/types";
import Image from "next/image";
import Link from "next/link";

const WIDTH = 1080;
const HEIGHT = 1920;

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

interface SnapProps {
  imageUrl: string;
  isSmall?: boolean;
}
export function SnapDisplay({ imageUrl, isSmall = false }: SnapProps) {
  return (
    <>
      {isSmall ? (
        <div>
          <Image
            src={imageUrl}
            alt="Snap preview"
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 640px) 33vw, 150px"
          />
        </div>
      ) : (
        <div>
          <Image
            src={imageUrl}
            alt="Snap"
            width={WIDTH}
            height={HEIGHT}
            className="rounded-lg"
          />
        </div>
      )}
    </>
  );
}
