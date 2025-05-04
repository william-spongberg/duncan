"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoAdd, IoArrowForward } from "react-icons/io5";
import { useEffect, useState } from "react";
import type { Group } from "@/lib/database/types";
import { useRouter } from "next/navigation";
import { getUserGroups, createGroup } from "@/lib/database/groups";

interface GroupsProps {
  userId: string;
}

export default function Groups({ userId }: GroupsProps) {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // fetch groups
  useEffect(() => {
    if (!userId) return;
    const fetchGroups = async () => {
      const userGroups = await getUserGroups(userId);
      setGroups(userGroups);
      setGroupsLoading(false);
    };
    fetchGroups();
  }, [userId, router]);

  // group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const newGroup = await createGroup(newGroupName, userId);
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

  return (
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
          <Button onClick={() => setShowNewGroupForm(true)} className="gap-2">
            <IoAdd /> Create a Group
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id}>
              <Card className="p-4 hover:bg-muted transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium">{group.name}</h2>
                    <p className="text-sm text-gray-500">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <IoArrowForward />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
