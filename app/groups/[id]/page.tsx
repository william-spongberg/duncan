import GroupContent from "./group-content";

export default async function GroupPage({params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
  return <GroupContent groupId={id} />;
}
