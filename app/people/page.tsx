"use client";

import { useEffect, useState } from "react";
import { getUserId } from "@/lib/database/user";
import Friends from "@/components/friends";
import Groups from "@/components/groups";

export default function People() {
  const [userId, setUserId] = useState<string>("");

  // fetch user ID
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchCurrentUserId();
  }, []);

  return (
    <div className="min-h-svh p-4 max-w-lg mx-auto">
      <Groups userId={userId} />
      <Friends userId={userId} />
    </div>
  );
}
