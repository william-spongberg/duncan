import { LogoutButton } from '@/components/logout-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/server'
import Image from 'next/image'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    // Snapchat-style: show a minimal, centered card with login prompt if not logged in
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <Card className="w-full max-w-xs bg-background/80 shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome!</CardTitle>
            <CardDescription className="text-center">Sign in to see your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/auth/login">
              <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition">Login</button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center bg-black">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Card className="w-full max-w-xs bg-background/80 shadow-xl border-none">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              {data.user.user_metadata.avatar_url && (
                <>
                  <Image src={data.user.user_metadata.avatar_url} alt="User avatar" width={64} height={64} className="h-16 w-16 rounded-full border-2 border-primary" />
                </>
              )}
              <CardTitle className="text-xl">{data.user.user_metadata.name}</CardTitle>
              <CardDescription className="text-center">{data.user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span>{data.user.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span>{data.user.app_metadata.provider}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last sign in:</span>
              <span>{new Date(data.user.last_sign_in_at!).toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}