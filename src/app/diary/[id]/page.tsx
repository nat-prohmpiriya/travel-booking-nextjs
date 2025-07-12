'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Spin,
  message,
  Breadcrumb,
  Dropdown,
  Image
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  BookOutlined,
  CameraOutlined,
  PlusOutlined,
  MoreOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { diaryService } from '@/services/diaryService';
import { TravelDiary } from '@/types/diary';
import { TimelineView } from '@/components/diary/timeline-view';
import { withUserAuth } from '@/components/auth/route-guard';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

function DiaryDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const diaryId = params.id as string;
  
  const [diary, setDiary] = useState<TravelDiary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDiary();
  }, [diaryId]);

  const loadDiary = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const diaryData = await diaryService.getDiary(diaryId);
      
      if (!diaryData) {
        setError('Diary not found');
        return;
      }

      // Check if user has access to this diary
      if (!diaryData.isPublic && diaryData.userId !== user?.uid) {
        setError('You do not have permission to view this diary');
        return;
      }

      setDiary(diaryData);
    } catch (err: any) {
      console.error('Error loading diary:', err);
      setError(err.message || 'Failed to load diary');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiary = (): void => {
    router.push(`/diary/${diaryId}/edit`);
  };

  const handleDeleteDiary = (): void => {
    // Implement delete functionality with confirmation modal
    message.info('Delete functionality to be implemented');
  };

  const handleShareDiary = (): void => {
    // Implement share functionality
    message.info('Share functionality to be implemented');
  };

  const handleAddEntry = (): void => {
    router.push(`/diary/${diaryId}/entry/new`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-12">
              <Title level={3}>Diary Not Found</Title>
              <Text className="text-gray-600 block mb-4">
                {error || 'The diary you are looking for does not exist or has been removed.'}
              </Text>
              <Button type="primary" onClick={() => router.push('/diary')}>
                Back to My Diaries
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = diary.userId === user?.uid;
  const daysDuration = Math.ceil(
    (diary.endDate.toDate().getTime() - diary.startDate.toDate().getTime()) / (1000 * 60 * 60 * 24)
  );

  const menuItems = [
    {
      key: 'share',
      label: 'Share Diary',
      icon: <ShareAltOutlined />,
      onClick: handleShareDiary
    }
  ];

  if (isOwner) {
    menuItems.push(
      {
        key: 'edit',
        label: 'Edit Diary',
        icon: <EditOutlined />,
        onClick: handleEditDiary
      },
      {
        key: 'delete',
        label: 'Delete Diary',
        icon: <DeleteOutlined />,
        onClick: handleDeleteDiary,
        danger: true
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined /> Home
                  </Link>
                )
              },
              {
                title: <Link href="/diary">My Diaries</Link>
              },
              {
                title: diary.tripName
              }
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Diary Header */}
          <Card>
            <div className="space-y-6">
              {/* Cover Photo */}
              {diary.coverPhoto && (
                <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden">
                  <Image
                    src={diary.coverPhoto}
                    alt={diary.tripName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Diary Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Title level={1} className="!mb-2">
                        {diary.tripName}
                      </Title>
                      <div className="flex items-center text-gray-600 mb-2">
                        <EnvironmentOutlined className="mr-2" />
                        <Text className="text-lg">{diary.destination}</Text>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarOutlined className="mr-1" />
                          <span>
                            {dayjs(diary.startDate.toDate()).format('MMM DD')} - {dayjs(diary.endDate.toDate()).format('MMM DD, YYYY')}
                          </span>
                        </div>
                        <span>{daysDuration} days</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {diary.isPublic && (
                        <Tag color="green">Public</Tag>
                      )}
                      <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                  </div>

                  {diary.description && (
                    <Paragraph className="text-gray-700 text-lg mb-4">
                      {diary.description}
                    </Paragraph>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOutlined className="mr-1" />
                      <span>{diary.totalEntries || 0} entries</span>
                    </div>
                    <div className="flex items-center">
                      <CameraOutlined className="mr-1" />
                      <span>{diary.totalPhotos || 0} photos</span>
                    </div>
                    {!isOwner && (
                      <div className="flex items-center">
                        <UserOutlined className="mr-1" />
                        <span>By: {diary.userId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {isOwner && (
                    <>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddEntry}
                        size="large"
                      >
                        Add Entry
                      </Button>
                      <Button
                        icon={<EditOutlined />}
                        onClick={handleEditDiary}
                        size="large"
                      >
                        Edit Diary
                      </Button>
                    </>
                  )}
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={handleShareDiary}
                    size="large"
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <TimelineView
            diaryId={diaryId}
            isOwner={isOwner}
            onEntryUpdate={loadDiary}
          />
        </div>
      </div>
    </div>
  );
}

export default withUserAuth(DiaryDetailPage);