import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePictureProps {
  src: string | null | undefined;
  username: string | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ProfilePicture({
  src,
  username,
  size = "md",
}: ProfilePictureProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-32 h-32",
  };

  if (!username) {
    username = "User";
  }

  return (
    <Avatar className={`relative ${sizeClasses[size]}`}>
      {src ? (
        <AvatarImage src={src} alt={username} />
      ) : (
        <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
      )}
    </Avatar>
  );
}
