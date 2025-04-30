"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/database/profiles";
import { getSnapUrl, getGroupSnaps } from "@/lib/database/snaps";
import { getFriends } from "@/lib/database/friends";
import {
  addGroupMember,
  getGroupMembers,
  getGroup,
} from "@/lib/database/groups";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IoPersonAdd, IoCamera } from "react-icons/io5";
import type { Group, GroupMember, Profile, Snap } from "@/lib/database/types";
import { useRouter } from "next/navigation";
import { SnapPreviews } from "@/components/snap";
type SnapWithUrl = Snap & { url: string };

interface GroupContentProps {
  groupId: string;
}

export default function GroupContent({ groupId }: GroupContentProps) {
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [snaps, setSnaps] = useState<(Snap & { url: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchGroupData() {
      setLoading(true);

      // fetch group
      const groupData = await getGroup(groupId);
      if (!groupData) {
        router.push("/groups");
        return;
      }
      setGroup(groupData);

      // get all group members (get user_ids, then getProfile for each)
      const groupMembers = await getGroupMembers(groupId);
      const memberIds: string[] =
        groupMembers?.map((member: GroupMember) => member.user_id) || [];
      const memberProfiles = (
        await Promise.all(memberIds.map((id: string) => getProfile(id)))
      ).filter(Boolean) as Profile[];
      setMembers(memberProfiles);

      // get group snaps
      const groupSnaps = await getGroupSnaps(groupId);
      let snapsWithUrls: SnapWithUrl[] = [];
      if (groupSnaps) {
        snapsWithUrls = await Promise.all(
          groupSnaps.map(async (snap: Snap) => {
            const url = await getSnapUrl(snap.storage_object_path);
            return { ...snap, url };
          })
        );
      }
      setSnaps(snapsWithUrls);
      setLoading(false);
    }
    fetchGroupData();
  }, [groupId, router]);

  // get friends who aren't members when showing the add member form
  useEffect(() => {
    if (!showAddMemberForm || !group) return;
    async function fetchFriends() {
      const friendsResult = await getFriends("accepted");
      if (!friendsResult) return;

      // filter out friends who are already members
      const friendProfiles: Profile[] = friendsResult.profiles;
      const memberIds = members.map((m) => m.id);
      const nonMemberFriends = friendProfiles.filter(
        (friend) => !memberIds.includes(friend.id)
      );
      setFriends(nonMemberFriends);
      if (nonMemberFriends.length > 0) {
        setSelectedFriend(nonMemberFriends[0].id);
      }
    }

    fetchFriends();
  }, [showAddMemberForm, group, members]);

  // add member to group
  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriend || !group) return;
    setIsAdding(true);
    try {
      await addGroupMember(groupId, selectedFriend);
      setShowAddMemberForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-svh bg-white p-4 max-w-lg mx-auto">
        <div className="text-center py-10">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-svh bg-white p-4 max-w-lg mx-auto">
        <div className="text-center py-10">Group not found</div>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-white p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1">
              <IoCamera size={16} /> Take Snap
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
          >
            <IoPersonAdd size={16} /> Add Member
          </Button>
        </div>
      </div>

      {showAddMemberForm && (
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Add Friend to Group</h2>
          {friends.length === 0 ? (
            <div className="text-center py-2">
              <p className="mb-2">No friends to add</p>
              <Link href="/people">
                <Button size="sm">Add Friends First</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={addMember} className="space-y-4">
              <div>
                <label
                  htmlFor="friend"
                  className="block text-sm font-medium mb-1"
                >
                  Select Friend
                </label>
                <select
                  id="friend"
                  value={selectedFriend}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={isAdding}
                  required
                >
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.username || friend.full_name || friend.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddMemberForm(false)}
                  disabled={isAdding}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding || !selectedFriend}
                  className="flex-1"
                >
                  {isAdding ? "Adding..." : "Add to Group"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Members section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Members ({members.length})</h2>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1"
            >
              {member.avatar_url && (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={member.avatar_url}
                    alt={member.username || "Member"}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-sm">
                {member.username || member.full_name || "User"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Snaps section */}
      <div>
        <h2 className="text-lg font-medium mb-3">Recent Snaps</h2>
        {snaps.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="mb-4">No snaps in this group yet.</p>
            <Link href="/">
              <Button className="gap-2">
                <IoCamera /> Take a Snap
              </Button>
            </Link>
          </Card>
        ) : (
          <SnapPreviews snaps={snaps} />
        )}
      </div>
    </div>
  );
}
