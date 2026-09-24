import React from 'react';
import { requireModuleAccess } from '@/lib/auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { WebsiteHistory } from '@/components/history/WebsiteHistory';

export default async function WebsiteHistoryPage() {
  await requireModuleAccess('audit');

  return (
    <AppLayout>
      <WebsiteHistory />
    </AppLayout>
  );
}