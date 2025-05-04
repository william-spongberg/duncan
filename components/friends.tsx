"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IoPersonAdd, IoCheckmark, IoClose, IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import type {
  Profile,
  ProfileWithStatus,
} from "@/lib/database/types";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/database/friends";
import { searchProfiles } from "@/lib/database/profiles";
import { ProfilePicture } from "@/components/profile-picture";

interface FriendsProps {
  userId: string;
}

export default function Friends({ userId }: FriendsProps) {
  const [friends, setFriends] = useState<ProfileWithStatus[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [usernameSearch, setUsernameSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const pendingRequests = friends.filter(
    (f) => f.status === "pending" && !f.isRequester
  );
  const sentRequests = friends.filter(
    (f) => f.status === "pending" && f.isRequester
  );
  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  // fetch friends
  useEffect(() => {
    if (!userId) return;
    const handleFetchFriends = async () => {
      const friendProfiles = await getFriends("all");
      if (!friendProfiles) {
        setFriends([]);
        setFriendsLoading(false);
        return;
      }
      const merged: ProfileWithStatus[] = friendProfiles.map((friend) => {
        const isRequester = friend.friendship.user_id_1 === userId;
        return {
          ...friend.profile,
          status: friend.friendship.status,
          isRequester,
        };
      });
      setFriends(merged);
      setFriendsLoading(false);
    };
    handleFetchFriends();
  }, [userId]);

  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameSearch.trim()) return;
    setSearching(true);
    try {
      const profiles = await searchProfiles(usernameSearch.trim());
      if (profiles.length > 0) {
        const filteredResults: Profile[] = profiles.filter((profile) => {
          if (profile.id === userId) return false;
          return !friends.some((friend) => friend.id === profile.id);
        });
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    if (!userId) return;
    try {
      await sendFriendRequest(userId, friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    if (!userId) return;
    try {
      await acceptFriendRequest(friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    if (!userId) return;
    try {
      await rejectFriendRequest(friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request");
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Friends</h1>
        <Button
          onClick={() => setShowAddFriendForm(!showAddFriendForm)}
          size="sm"
          className="gap-2"
        >
          {showAddFriendForm ? (
            "Cancel"
          ) : (
            <>
              <IoPersonAdd /> Find Friends
            </>
          )}
        </Button>
      </div>
      <h2 className="text-lg font-medium mb-3">Friends ({friends.length})</h2>

      {showAddFriendForm && (
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Find Friends</h2>
          <form onSubmit={searchUsers} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Search by username"
                disabled={searching}
                required
              />
              <Button
                type="submit"
                disabled={searching || !usernameSearch.trim()}
              >
                <IoSearch />
              </Button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Results</h3>
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <ProfilePicture
                      src={profile.avatar_url}
                      username={profile.username}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">
                        {profile.username || "User"}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendFriendRequest(profile.id)}
                  >
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}

          {usernameSearch && searchResults.length === 0 && searched && (
            <div className="mt-4 text-center py-2 text-gray-500">
              No users found with that username
            </div>
          )}
        </Card>
      )}

      {friendsLoading ? (
        <div className="text-center py-10">Loading friends...</div>
      ) : (
        <div className="space-y-6">
          {/* Friend Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">
                Friend Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-2">
                {pendingRequests.map((friend) => (
                  <Card key={friend.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ProfilePicture
                          src={friend.avatar_url}
                          username={friend.username}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium">
                            {friend.username || "User"}
                          </div>
                          {friend.full_name && (
                            <div className="text-xs text-gray-500">
                              {friend.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 hover:border-red-300 hover:bg-red-50"
                          onClick={() => handleRejectFriendRequest(friend.id)}
                        >
                          <IoClose />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAcceptFriendRequest(friend.id)}
                        >
                          <IoCheckmark />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">
                Sent Requests ({sentRequests.length})
              </h2>
              <div className="space-y-2">
                {sentRequests.map((friend) => (
                  <Card key={friend.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ProfilePicture
                          src={friend.avatar_url}
                          username={friend.username}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium">
                            {friend.username || "User"}
                          </div>
                          {friend.full_name && (
                            <div className="text-xs text-gray-500">
                              {friend.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">Pending</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Friends */}
          <div>
            {friends.length === 0 && !showAddFriendForm ? (
              <Card className="p-6 text-center">
                <p className="mb-4">You don&apos;t have any friends yet.</p>
                <Button
                  onClick={() => setShowAddFriendForm(true)}
                  className="gap-2"
                >
                  <IoPersonAdd /> Find Friends
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                <FriendsList friends={acceptedFriends} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FriendsListProps {
  friends: ProfileWithStatus[];
}

function FriendsList({ friends }: FriendsListProps) {
  return (
    <>
      {friends.map((friend) => (
        <Card key={friend.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProfilePicture
                src={friend.avatar_url}
                username={friend.username}
                size="sm"
              />
              <div>
                <div className="font-medium">{friend.username || "User"}</div>
                {friend.full_name && (
                  <div className="text-xs text-gray-500">
                    {friend.full_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
