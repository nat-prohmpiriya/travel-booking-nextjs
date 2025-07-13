'use client';

import React from 'react';
import { DiaryList } from '@/components/diary/diary-list';
;

function DiaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DiaryList
          showUserDiaries={true}
          showPublicDiaries={false}
        />
      </div>
    </div>
  );
}

export default DiaryPage