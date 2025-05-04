import Image from "next/image";
import { WIDTH, HEIGHT } from "@/constants";
import { Snap } from "@/lib/database/types";

interface SnapDisplayProps {
  imageUrl: string;
  snap: Snap;
  isSmall?: boolean;
}

// TODO: render message onto snap
export function SnapDisplay({
  imageUrl,
  snap,
  isSmall = false,
}: SnapDisplayProps) {
  console.log(snap.message_y_level);

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
          {snap?.message && (
            <div
              className="absolute left-1/2 w-full text-center font-bold text-white pointer-events-none text-[1.5rem]"
              style={{
                top: snap.message_y_level || 0,
                transform: "translateX(-50%)",
                textShadow: "0 0 4px black",
              }}
            >
              {snap.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}
