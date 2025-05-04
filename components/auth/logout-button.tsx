"use client";

import { createClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { clear } from "idb-keyval";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    // purge all cache
    await purgeCache();

    // logout
    const supabase = createClient();
    await supabase.auth.signOut();

    // return to login page
    router.push("/auth/login");
  };

  const purgeCache = async () => {
    await clear();
  }

  return <Button onClick={logout}>Logout</Button>;
}

