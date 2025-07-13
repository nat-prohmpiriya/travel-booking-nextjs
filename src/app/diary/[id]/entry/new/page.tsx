'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EntryForm } from '@/components/diary/entry-form';
;

function NewEntryPage() {
  const params = useParams();
  const diaryId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <EntryForm diaryId={diaryId} />
      </div>
    </div>
  );
}

export default NewEntryPage