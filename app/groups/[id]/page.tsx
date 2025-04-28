import GroupContent from "./group-content";

export default async function GroupPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <GroupContent groupId={id} />;
}
