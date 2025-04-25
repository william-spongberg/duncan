"use client";

import Camera from "@/components/camera";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { LoginForm } from "@/components/login-form";
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return user ? <Camera /> : (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
