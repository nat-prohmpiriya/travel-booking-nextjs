'use client';

import React from 'react';
import { DiaryForm } from '@/components/diary/diary-form';
;

function NewDiaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DiaryForm />
      </div>
    </div>
  );
}

export default NewDiaryPage