"use client";

import { LogoutButton } from "@/components/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { getProfile, updateProfileUsername } from "@/lib/database/profiles";
import { getUserGroupsCount } from "@/lib/database/groups";
import { getFriendCount } from "@/lib/database/friends";
import { getUser } from "@/lib/database/user";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/database/types";

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
    if (!loading && user && (!profileData?.username || profileData.username.trim() === "")) {
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
      <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center bg-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    // Optional: Render a state for when user is not available
    return (
      <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center bg-white">
        User not found. Please log in again.
        <LogoutButton />
      </div>
    );
  }

  // user profile page
  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] w-full items-center justify-center bg-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Card className="w-full max-w-md bg-background/80 shadow-xl border-none">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              {profileData?.avatar_url ? (
                <Image
                  src={profileData.avatar_url}
                  alt="User avatar"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full border-2 border-primary"
                />
              ) : (
                <div className="h-20 w-20 rounded-full border-2 border-primary bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-500">
                    {(profileData?.username ||
                      profileData?.full_name ||
                      user.user_metadata.name ||
                      user.email ||
                      "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <CardTitle className="text-2xl">
                {profileData?.username ||
                  profileData?.full_name ||
                  user.user_metadata.name ||
                  "User"}
              </CardTitle>
              {profileData?.username &&
                profileData?.full_name &&
                profileData.username !== profileData.full_name && (
                  <CardDescription className="text-center">
                    {profileData.full_name}
                  </CardDescription>
                )}
              <CardDescription className="text-center">
                {user.email}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold">{groupsCount}</div>
                <div className="text-xs text-muted-foreground">Groups</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold">{friendsCount}</div>
                <div className="text-xs text-muted-foreground">Friends</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
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
                <span className="text-muted-foreground">Full name:</span>
                <span className="font-medium">
                  {profileData?.full_name ||
                    user.user_metadata.name ||
                    "Not set"}
                </span>
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
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="text-xs text-gray-500 max-w-[180px] truncate">
                  {user.id}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>

      {/* Username prompt modal/dialog */}
      {showUsernamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
            <h2 className="text-lg font-semibold mb-2">Set your username</h2>
            <input
              className="border rounded px-3 py-2 focus:outline-none focus:ring w-full"
              type="text"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="Enter username"
              disabled={updatingUsername}
              autoFocus
            />
            {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-primary text-white rounded px-3 py-2 disabled:opacity-50"
                onClick={handleUsernameChange}
                disabled={updatingUsername}
              >
                {updatingUsername ? "Saving..." : "Save"}
              </button>
              <button
                className="flex-1 bg-gray-200 rounded px-3 py-2"
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
