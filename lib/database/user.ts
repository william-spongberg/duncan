import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/auth/client";

export async function getUserId(): Promise<string> {
  const user = await getUser();
  return user.id;
}

// get user from supabase auth
export async function getUser(): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // shouldnt ever get errors here thanks to middleware
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
