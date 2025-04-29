export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

export type Friend = {
  user_id_1: string;
  user_id_2: string;
  status: "pending" | "accepted" | "blocked";
  requested_at: string;
  accepted_at: string | null;
};

export type Group = {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  joined_at: string;
};

export type Snap = {
  id: string;
  group_id: string;
  uploader_user_id: string | null;
  storage_object_path: string;
  created_at: string;
};

export type SnapWithUrl = Snap & { url: string };

export type Subscription = {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at: string;
};
