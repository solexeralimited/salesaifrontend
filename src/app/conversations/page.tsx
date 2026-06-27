'use client';
import { Suspense } from 'react';
import ConversationsContent from './ConversationsContent';
import AppLayout from '@/components/layout/AppLayout';

export default function ConversationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading…</div>}>
        <ConversationsContent />
      </Suspense>
    </AppLayout>
  );
}
