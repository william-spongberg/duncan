import { redirect } from 'next/navigation'

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

export default async function Dashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-svh w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hello {data.user.user_metadata.name}</CardTitle>
          <CardDescription>Your user details:</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{data.user.email}</span>
          </div>
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
          {data.user.user_metadata.avatar_url && (
             <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avatar:</span>
                {/* Consider using an Image component here */}
                <img src={data.user.user_metadata.avatar_url} alt="User avatar" className="h-8 w-8 rounded-full" />
             </div>
          )}
        </CardContent>
        <CardFooter>
          <LogoutButton />
        </CardFooter>
      </Card>
    </div>
  )
}