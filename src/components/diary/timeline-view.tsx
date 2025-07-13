'use client';

import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Card,
  Typography,
  Button,
  Empty,
  Spin,
  Image,
  Tag,
  Space,
  Avatar,
  Dropdown,
  Modal,
  message
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
  TagOutlined,
  CloudOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { diaryService } from '@/services/diaryService';
import { DiaryEntry, MOOD_ICONS, WEATHER_ICONS } from '@/types/diary';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface TimelineViewProps {
  diaryId: string;
  isOwner?: boolean;
  onEntryUpdate?: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  diaryId,
  isOwner = false,
  onEntryUpdate
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [diaryId]);

  const loadEntries = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const entriesData = await diaryService.getDiaryEntries(diaryId, {
        orderBy: 'date',
        orderDirection: 'asc'
      });

      setEntries(entriesData);
    } catch (err: any) {
      console.error('Error loading entries:', err);
      setError(err.message || 'Failed to load diary entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entryId: string): void => {
    router.push(`/diary/${diaryId}/entry/${entryId}/edit`);
  };

  const handleDeleteEntry = (entryId: string): void => {
    Modal.confirm({
      title: 'Delete Entry',
      content: 'Are you sure you want to delete this diary entry? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await diaryService.deleteEntry(diaryId, entryId);
          message.success('Entry deleted successfully');
          await loadEntries();
          if (onEntryUpdate) {
            onEntryUpdate();
          }
        } catch (error) {
          console.error('Error deleting entry:', error);
          message.error('Failed to delete entry');
        }
      }
    });
  };

  const handleAddEntry = (): void => {
    router.push(`/diary/${diaryId}/entry/new`);
  };

  const renderEntryContent = (entry: DiaryEntry): React.ReactNode => {
    const menuItems = [
      {
        key: 'edit',
        label: 'Edit Entry',
        icon: <EditOutlined />,
        onClick: () => handleEditEntry(entry.id)
      },
      {
        key: 'delete',
        label: 'Delete Entry',
        icon: <DeleteOutlined />,
        onClick: () => handleDeleteEntry(entry.id),
        danger: true
      }
    ];

    return (
      <Card
        size="small"
        className="mb-4 shadow-sm hover:shadow-md transition-shadow"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-500" />
              <span className="font-medium">{entry.title}</span>
            </div>
            {isOwner && (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="text" icon={<MoreOutlined />} size="small" />
              </Dropdown>
            )}
          </div>
        }
        extra={
          <Text className="text-sm text-gray-500">
            {dayjs(entry.date.toDate()).format('MMM DD, YYYY')}
          </Text>
        }
      >
        <div className="space-y-4">
          {/* Entry metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {entry.location && (
              <div className="flex items-center">
                <EnvironmentOutlined className="mr-1" />
                <span>{entry.location}</span>
              </div>
            )}
            {entry.weather && (
              <div className="flex items-center">
                <span className="mr-1">{WEATHER_ICONS[entry.weather as keyof typeof WEATHER_ICONS]}</span>
                <span className="capitalize">{entry.weather}</span>
              </div>
            )}
            {entry.mood && (
              <div className="flex items-center">
                <span className="mr-1">{MOOD_ICONS[entry.mood]}</span>
                <span className="capitalize">{entry.mood}</span>
              </div>
            )}
          </div>

          {/* Entry content */}
          <Paragraph className="text-gray-800 whitespace-pre-wrap">
            {entry.content}
          </Paragraph>

          {/* Photos */}
          {entry.photos && entry.photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CameraOutlined className="mr-1" />
                <span>{entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Image.PreviewGroup>
                  {entry.photos.map((photo, index) => (
                    <Image
                      key={index}
                      src={photo}
                      alt={`${entry.title} - Photo ${index + 1}`}
                      className="rounded-lg object-cover"
                      style={{ height: '120px', width: '100%' }}
                    />
                  ))}
                </Image.PreviewGroup>
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <TagOutlined className="mr-1" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.tags.map(tag => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Entry timestamp */}
          <div className="pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-400">
              Created: {dayjs(entry.createdAt.toDate()).format('MMM DD, YYYY HH:mm')}
              {entry.updatedAt.toDate().getTime() !== entry.createdAt.toDate().getTime() && (
                <span> • Updated: {dayjs(entry.updatedAt.toDate()).format('MMM DD, YYYY HH:mm')}</span>
              )}
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  const renderTimelineItems = (): any[] => {
    if (entries.length === 0) return [];

    return entries.map((entry, index) => {
      const entryDate = dayjs(entry.date.toDate());
      const isToday = entryDate.isSame(dayjs(), 'day');
      const isYesterday = entryDate.isSame(dayjs().subtract(1, 'day'), 'day');

      let dateLabel = entryDate.format('MMMM DD, YYYY');
      if (isToday) {
        dateLabel = 'Today';
      } else if (isYesterday) {
        dateLabel = 'Yesterday';
      }

      return {
        key: entry.id,
        dot: (
          <Avatar
            size="small"
            className="bg-blue-500 border-2 border-white shadow-md"
            icon={<CalendarOutlined />}
          />
        ),
        label: (
          <Text className="font-medium text-blue-600">
            {dateLabel}
          </Text>
        ),
        children: renderEntryContent(entry)
      };
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4">
          <Text>Loading diary entries...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Empty
          description="Failed to load diary entries"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button onClick={loadEntries}>Try Again</Button>
        </Empty>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          description="No diary entries yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {isOwner && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEntry}
            >
              Create Your First Entry
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="!mb-1">
            Travel Timeline
          </Title>
          <Text className="text-gray-600">
            {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} •
            {entries.reduce((total, entry) => total + (entry.photos?.length || 0), 0)} photos
          </Text>
        </div>

        {isOwner && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddEntry}
          >
            Add Entry
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg p-6">
        <Timeline
          mode="left"
          items={renderTimelineItems()}
          className="diary-timeline"
        />
      </div>

      {/* Custom styles for timeline */}
      <style jsx global>{`
        .diary-timeline .ant-timeline-item-content {
          margin-left: 16px;
        }
        
        .diary-timeline .ant-timeline-item-tail {
          border-left: 2px solid #e6f7ff;
        }
        
        .diary-timeline .ant-timeline-item:last-child .ant-timeline-item-tail {
          display: none;
        }
        
        .diary-timeline .ant-timeline-item-label {
          width: auto !important;
          text-align: left;
          margin-right: 16px;
        }
        
        @media (max-width: 768px) {
          .diary-timeline {
            margin-left: 0;
          }
          
          .diary-timeline .ant-timeline-item-label {
            position: relative;
            left: 0;
            width: auto !important;
            text-align: left;
            margin-bottom: 8px;
          }
          
          .diary-timeline .ant-timeline-item-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};