"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoPersonAdd,
  IoCheckmark,
  IoClose,
  IoSearch,
  IoAdd,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import type { Profile, Group } from "@/lib/database/types";
import { useRouter } from "next/navigation";
import {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/database/friends";
import { getUserGroups, createGroup } from "@/lib/database/groups";
import { getUserId } from "@/lib/database/user";
import { searchProfiles } from "@/lib/database/profiles";

type FriendWithStatus = Profile & {
  status: "pending" | "accepted" | "blocked";
  isRequester: boolean;
};

export default function People() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Friends state
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [showAddFriendForm, setShowAddFriendForm] = useState(false);
  const [usernameSearch, setUsernameSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch user ID and data
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchCurrentUserId();
  }, []);

  // Fetch friends
  useEffect(() => {
    if (!currentUserId) return;
    const handleFetchFriends = async () => {
      const result = await getFriends("all");
      if (!result) {
        setFriends([]);
        setFriendsLoading(false);
        return;
      }
      const { profiles, friendData } = result;
      const merged: FriendWithStatus[] = friendData.map((fd, idx) => {
        const profile = profiles[idx];
        const isRequester = fd.user_id_1 === currentUserId;
        return {
          ...profile,
          status: fd.status,
          isRequester,
        };
      });
      setFriends(merged);
      setFriendsLoading(false);
    };
    handleFetchFriends();
  }, [currentUserId, router]);

  // Fetch groups
  useEffect(() => {
    if (!currentUserId) return;
    const fetchGroups = async () => {
      const userGroups = await getUserGroups(currentUserId);
      setGroups(userGroups);
      setGroupsLoading(false);
    };
    fetchGroups();
  }, [currentUserId, router]);

  // Friend search
  const searchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameSearch.trim()) return;
    setSearching(true);
    try {
      const profiles = await searchProfiles(usernameSearch.trim());
      if (profiles.length > 0) {
        const filteredResults: Profile[] = profiles.filter((profile) => {
          if (profile.id === currentUserId) return false;
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
    if (!currentUserId) return;
    try {
      await sendFriendRequest(currentUserId, friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;
    try {
      await acceptFriendRequest(friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;
    try {
      await rejectFriendRequest(friendId);
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request");
    }
  };

  // Group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const newGroup = await createGroup(newGroupName, currentUserId);
      setNewGroupName("");
      setShowNewGroupForm(false);
      router.refresh();
      router.push(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error("Error in group creation:", error);
      alert("An error occurred: " + error);
    } finally {
      setCreating(false);
    }
  };

  // Friends filtering
  const pendingRequests = friends.filter(
    (f) => f.status === "pending" && !f.isRequester
  );
  const sentRequests = friends.filter(
    (f) => f.status === "pending" && f.isRequester
  );
  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  return (
    <div className="min-h-svh bg-white p-4 max-w-lg mx-auto">
      {/* Groups Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Groups</h1>
          <Button
            onClick={() => setShowNewGroupForm(!showNewGroupForm)}
            size="sm"
            className="gap-2"
          >
            {showNewGroupForm ? (
              "Cancel"
            ) : (
              <>
                <IoAdd /> New Group
              </>
            )}
          </Button>
        </div>

        {showNewGroupForm && (
          <Card className="p-4 mb-6">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium mb-1"
                >
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter group name"
                  disabled={creating}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={creating || !newGroupName.trim()}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </Card>
        )}

        {groupsLoading ? (
          <div className="text-center py-10">Loading groups...</div>
        ) : groups.length === 0 && !showNewGroupForm ? (
          <Card className="p-6 text-center">
            <p className="mb-4">You don&apos;t have any groups yet.</p>
            <Button
              onClick={() => setShowNewGroupForm(true)}
              className="gap-2"
            >
              <IoAdd /> Create a Group
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <Card className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium">{group.name}</h2>
                      <p className="text-sm text-gray-500">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <IoPersonAdd size={16} /> Manage
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Friends Section */}
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
        <h2 className="text-lg font-medium mb-3">
          Friends ({acceptedFriends.length})
        </h2>

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
                      {profile.avatar_url && (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.username || ""}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">
                          {profile.username || "User"}
                        </div>
                        {profile.full_name && (
                          <div className="text-xs text-gray-500">
                            {profile.full_name}
                          </div>
                        )}
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
                          {friend.avatar_url ? (
                            <Image
                              src={friend.avatar_url}
                              alt={friend.username || ""}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {friend.username?.[0] || "?"}
                              </span>
                            </div>
                          )}
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
                            onClick={() =>
                              handleAcceptFriendRequest(friend.id)
                            }
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
                          {friend.avatar_url ? (
                            <Image
                              src={friend.avatar_url}
                              alt={friend.username || ""}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {friend.username?.[0] || "?"}
                              </span>
                            </div>
                          )}
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
              {acceptedFriends.length === 0 && !showAddFriendForm ? (
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
                  {acceptedFriends.map((friend) => (
                    <Card key={friend.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {friend.avatar_url ? (
                            <Image
                              src={friend.avatar_url}
                              alt={friend.username || ""}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {friend.username?.[0] || "?"}
                              </span>
                            </div>
                          )}
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
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
