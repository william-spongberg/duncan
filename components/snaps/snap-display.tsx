import Image from "next/image";
import { WIDTH, HEIGHT } from "@/constants";

interface SnapDisplayProps {
  imageUrl: string;
  isSmall?: boolean;
}

export function SnapDisplay({ imageUrl, isSmall = false }: SnapDisplayProps) {
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
        <div className="relative w-fit">
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
