'use client';

import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { diaryService } from '@/services/diaryService';
import { TravelDiary } from '@/types/diary';
import { DiaryForm } from '@/components/diary/diary-form';
import { withUserAuth } from '@/components/auth/route-guard';

function EditDiaryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const diaryId = params.id as string;
  
  const [diary, setDiary] = useState<TravelDiary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDiary();
  }, [diaryId]);

  const loadDiary = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const diaryData = await diaryService.getDiary(diaryId);
      
      if (!diaryData) {
        message.error('Diary not found');
        router.push('/diary');
        return;
      }

      // Check if user owns this diary
      if (diaryData.userId !== user?.uid) {
        message.error('You do not have permission to edit this diary');
        router.push('/diary');
        return;
      }

      setDiary(diaryData);
    } catch (error) {
      console.error('Error loading diary:', error);
      message.error('Failed to load diary');
      router.push('/diary');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (updatedDiary: TravelDiary): void => {
    router.push(`/diary/${updatedDiary.id}`);
  };

  const handleCancel = (): void => {
    router.push(`/diary/${diaryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DiaryForm
          diary={diary}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default withUserAuth(EditDiaryPage);