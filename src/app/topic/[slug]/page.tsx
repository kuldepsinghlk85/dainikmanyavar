import { redirect } from 'next/navigation';

export default async function TopicRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/tag/${slug}`);
}
