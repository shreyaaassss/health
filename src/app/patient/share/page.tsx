import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Share Records · Inochi' };
export const dynamic = 'force-dynamic';

import { ShareWizard } from '@/components/ShareWizard';

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string }>;
}) {
  const { record: preSelectedRecordId } = await searchParams;

  return (
    <ShareWizard preSelectedRecordId={preSelectedRecordId ?? null} />
  );
}
