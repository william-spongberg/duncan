"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfile, updateProfileUsername } from "@/lib/database/profiles";
import { getUserGroupsCount } from "@/lib/database/groups";
import { getFriendCount } from "@/lib/database/friends";
import { getUser } from "@/lib/database/user";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/database/types";
import InstallPrompt from "@/components/pwa/install";
import PushNotificationManager from "@/components/pwa/manager";
import { ProfilePicture } from "@/components/profile-picture";
import { ModeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [groupsCount, setGroupsCount] = useState<number>(0);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedUser = await getUser();
        setUser(fetchedUser);

        if (fetchedUser) {
          const [
            fetchedProfileData,
            fetchedGroupsCount,
            fetchedFriendsCount,
            fetchedPendingRequestsCount,
          ] = await Promise.all([
            getProfile(),
            getUserGroupsCount(),
            getFriendCount(),
            getFriendCount("pending"),
          ]);

          setProfileData(fetchedProfileData);
          setGroupsCount(fetchedGroupsCount);
          setFriendsCount(fetchedFriendsCount);
          setPendingRequestsCount(fetchedPendingRequestsCount);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prompt for username if not set
  useEffect(() => {
    if (
      !loading &&
      user &&
      (!profileData?.username || profileData.username.trim() === "")
    ) {
      setShowUsernamePrompt(true);
    }
  }, [loading, user, profileData]);

  const handleUsernameChange = async () => {
    if (!usernameInput.trim()) {
      setErrorMsg("Username cannot be empty.");
      return;
    }
    setUpdatingUsername(true);
    setErrorMsg("");
    try {
      await updateProfileUsername(usernameInput.trim(), user?.id);
      // Refresh profile data
      const updatedProfile = await getProfile();
      setProfileData(updatedProfile);
      setShowUsernamePrompt(false);
      setUsernameInput("");
      // eslint-disable-next-line
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update username.");
    } finally {
      setUpdatingUsername(false);
    }
  };

  if (loading) {
    // Optional: Render a loading state
    return (
      <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    // Optional: Render a state for when user is not available
    return (
      <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center">
        User not found. Please log in again.
        <LogoutButton />
      </div>
    );
  }

  // user profile page
  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)] w-full items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full py-8">
        <Card className="w-full max-w-md shadow-none border-none">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <ProfilePicture
                src={profileData?.avatar_url}
                username={profileData?.username}
                size="xl"
              />
              <CardTitle className="text-2xl">
                {profileData?.username || profileData?.full_name || "User"}
              </CardTitle>
              <div className="text-xs text-muted-foreground">{user.id}</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg">
                <div className="text-2xl font-bold">{groupsCount}</div>
                <div className="text-xs text-muted-foreground">Groups</div>
              </div>
              <div className="p-3 rounded-lg">
                <div className="text-2xl font-bold">{friendsCount}</div>
                <div className="text-xs text-muted-foreground">Friends</div>
              </div>
              <div className="p-3 rounded-lg">
                <div className="text-2xl font-bold">{pendingRequestsCount}</div>
                <div className="text-xs text-muted-foreground">Requests</div>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium flex items-center gap-2">
                  {profileData?.username || "Not set"}
                  <button
                    className="ml-2 text-xs underline text-primary hover:text-primary/80 disabled:opacity-50"
                    onClick={() => {
                      setShowUsernamePrompt(true);
                      setUsernameInput(profileData?.username || "");
                    }}
                    disabled={updatingUsername}
                    type="button"
                  >
                    Change
                  </button>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-medium">
                  {profileData?.full_name || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Last profile update:
                </span>
                <span className="font-medium">
                  {profileData?.updated_at
                    ? new Date(profileData.updated_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="flex-1" />
            <LogoutButton />
            <div className="flex-1" />
            <ModeToggle />
          </CardFooter>
        </Card>

        <PushNotificationManager />
        <InstallPrompt />
      </div>

      {/* Username prompt modal/dialog */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
            <h2 className="text-lg font-semibold mb-2">Set your username</h2>
            <input
              className="border rounded px-3 py-2 focus:outline-none focus:ring w-full"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter username"
              disabled={updatingUsername}
              autoFocus
            />
            {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-primary rounded px-3 py-2 disabled:opacity-50"
                onClick={handleUsernameChange}
                disabled={updatingUsername}
              >
                {updatingUsername ? "Saving..." : "Save"}
              </button>
              <button
                className="flex-1 bg-muted rounded px-3 py-2"
                onClick={() => setShowUsernamePrompt(false)}
                disabled={updatingUsername}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
