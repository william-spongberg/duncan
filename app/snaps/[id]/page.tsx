"use server";

import SnapContent from "./snap-content";

export default async function SnapPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <SnapContent snapId={id} />;
}
