'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Upload,
  Card,
  Typography,
  Space,
  message,
  Row,
  Col,
  Select,
  Tag
} from 'antd';
import {
  PlusOutlined,
  CameraOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CloudOutlined,
  SmileOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { diaryService } from '@/services/diaryService';
import { 
  CreateDiaryEntryData, 
  UpdateDiaryEntryData, 
  DiaryEntry,
  MOOD_ICONS,
  WEATHER_ICONS,
  WEATHER_OPTIONS,
  WeatherType
} from '@/types/diary';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface EntryFormProps {
  diaryId: string;
  entry?: DiaryEntry | null;
  onSuccess?: (entry: DiaryEntry) => void;
  onCancel?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  diaryId,
  entry,
  onSuccess,
  onCancel
}) => {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [photoList, setPhotoList] = useState<UploadFile[]>(
    entry?.photos?.map((url, index) => ({
      uid: `${index}`,
      name: `photo-${index}.jpg`,
      status: 'done' as const,
      url
    })) || []
  );
  const [customTags, setCustomTags] = useState<string[]>(entry?.tags || []);
  const [inputTag, setInputTag] = useState<string>('');

  const isEditing = !!entry;

  const moodOptions = [
    { value: 'happy', label: '😊 Happy', icon: '😊' },
    { value: 'excited', label: '🤩 Excited', icon: '🤩' },
    { value: 'peaceful', label: '😌 Peaceful', icon: '😌' },
    { value: 'adventurous', label: '🗺️ Adventurous', icon: '🗺️' },
    { value: 'tired', label: '😴 Tired', icon: '😴' },
    { value: 'amazed', label: '🤩 Amazed', icon: '🤩' }
  ];

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      setLoading(true);

      // Upload new photos
      const photoUrls: string[] = [];
      
      for (const file of photoList) {
        if (file.url) {
          // Existing photo
          photoUrls.push(file.url);
        } else if (file.originFileObj) {
          // New photo to upload
          const url = await diaryService.uploadImage(
            file.originFileObj as File,
            diaryId,
            entry?.id || 'temp'
          );
          photoUrls.push(url);
        }
      }

      const entryData = {
        date: values.date.toDate(),
        title: values.title,
        content: values.content,
        photos: photoUrls,
        location: values.location,
        weather: values.weather,
        mood: values.mood,
        tags: customTags
      };

      let resultEntry: DiaryEntry;

      if (isEditing && entry) {
        await diaryService.updateEntry(diaryId, entry.id, entryData as UpdateDiaryEntryData);
        resultEntry = await diaryService.getEntry(diaryId, entry.id) as DiaryEntry;
        message.success('Diary entry updated successfully!');
      } else {
        resultEntry = await diaryService.createEntry(diaryId, entryData as CreateDiaryEntryData);
        
        // Update photo URLs with actual entry ID if any were uploaded
        if (photoUrls.some(url => url.includes('temp'))) {
          const updatedPhotoUrls: string[] = [];
          for (let i = 0; i < photoUrls.length; i++) {
            if (photoUrls[i].includes('temp') && photoList[i]?.originFileObj) {
              const newUrl = await diaryService.uploadImage(
                photoList[i].originFileObj as File,
                diaryId,
                resultEntry.id
              );
              updatedPhotoUrls.push(newUrl);
            } else {
              updatedPhotoUrls.push(photoUrls[i]);
            }
          }
          
          if (updatedPhotoUrls.length > 0) {
            await diaryService.updateEntry(diaryId, resultEntry.id, { photos: updatedPhotoUrls });
            resultEntry.photos = updatedPhotoUrls;
          }
        }
        
        message.success('Diary entry created successfully!');
      }

      if (onSuccess) {
        onSuccess(resultEntry);
      } else {
        router.push(`/diary/${diaryId}`);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      message.error(isEditing ? 'Failed to update entry' : 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleAddTag = (): void => {
    if (inputTag && !customTags.includes(inputTag)) {
      setCustomTags([...customTags, inputTag]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const uploadProps: UploadProps = {
    fileList: photoList,
    onChange: ({ fileList }) => setPhotoList(fileList),
    beforeUpload: () => false, // Prevent auto upload
    multiple: true,
    accept: 'image/*',
    listType: 'picture-card',
    className: 'entry-photos-upload'
  };

  const uploadButton = (
    <div className="flex flex-col items-center">
      <PlusOutlined />
      <div className="mt-2">Add Photo</div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <CalendarOutlined />
          {isEditing ? 'Edit Entry' : 'New Diary Entry'}
        </Title>
        <Text className="text-gray-600">
          {isEditing 
            ? 'Update your diary entry'
            : 'Capture your travel memories and experiences'
          }
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={entry ? {
          date: dayjs(entry.date.toDate()),
          title: entry.title,
          content: entry.content,
          location: entry.location,
          weather: entry.weather,
          mood: entry.mood
        } : {
          date: dayjs()
        }}
        className="space-y-6"
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card size="small" title="Entry Details">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[{ required: true, message: 'Please select a date' }]}
                    >
                      <DatePicker
                        size="large"
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={(current) => {
                          return current && current > dayjs().endOf('day');
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="location"
                      label="Location (Optional)"
                    >
                      <Input
                        placeholder="Where were you?"
                        prefix={<EnvironmentOutlined />}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="title"
                  label="Entry Title"
                  rules={[
                    { required: true, message: 'Please enter a title' },
                    { min: 3, message: 'Title must be at least 3 characters' },
                    { max: 100, message: 'Title must not exceed 100 characters' }
                  ]}
                >
                  <Input
                    placeholder="e.g., Amazing sunset at the beach"
                    size="large"
                    showCount
                    maxLength={100}
                  />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Your Story"
                  rules={[
                    { required: true, message: 'Please write your story' },
                    { min: 10, message: 'Content must be at least 10 characters' }
                  ]}
                >
                  <TextArea
                    placeholder="Tell us about your experience, what you saw, how you felt..."
                    rows={8}
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Card>

              {/* Photos */}
              <Card size="small" title="Photos">
                <Form.Item
                  label="Add photos to your entry"
                  extra="You can upload multiple photos. Max file size: 5MB per photo"
                >
                  <Upload {...uploadProps}>
                    {photoList.length >= 8 ? null : uploadButton}
                  </Upload>
                </Form.Item>
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Mood & Weather */}
              <Card size="small" title="Mood & Weather">
                <Form.Item
                  name="mood"
                  label="How did you feel?"
                >
                  <Select
                    placeholder="Select your mood"
                    size="large"
                    allowClear
                  >
                    {moodOptions.map(mood => (
                      <Option key={mood.value} value={mood.value}>
                        <span className="flex items-center gap-2">
                          <span>{mood.icon}</span>
                          <span>{mood.label.split(' ').slice(1).join(' ')}</span>
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="weather"
                  label="Weather"
                >
                  <Select
                    placeholder="How was the weather?"
                    size="large"
                    allowClear
                  >
                    {WEATHER_OPTIONS.map(weather => (
                      <Option key={weather} value={weather}>
                        <span className="flex items-center gap-2">
                          <span>{WEATHER_ICONS[weather]}</span>
                          <span className="capitalize">{weather}</span>
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              {/* Tags */}
              <Card size="small" title="Tags">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={inputTag}
                      onChange={(e) => setInputTag(e.target.value)}
                      onPressEnter={handleAddTag}
                      prefix={<TagOutlined />}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddTag}
                      disabled={!inputTag || customTags.includes(inputTag)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {customTags.map(tag => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => handleRemoveTag(tag)}
                        color="blue"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  
                  {customTags.length === 0 && (
                    <Text className="text-gray-500 text-sm">
                      Add tags to help categorize your entry
                    </Text>
                  )}
                </div>
              </Card>

              {/* Quick Tags */}
              <Card size="small" title="Quick Tags">
                <div className="flex flex-wrap gap-2">
                  {['Food', 'Culture', 'Adventure', 'Relaxation', 'Shopping', 'Nightlife', 'Nature', 'History'].map(tag => (
                    <Tag
                      key={tag}
                      className="cursor-pointer"
                      color={customTags.includes(tag) ? 'blue' : 'default'}
                      onClick={() => {
                        if (customTags.includes(tag)) {
                          handleRemoveTag(tag);
                        } else {
                          setCustomTags([...customTags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button size="large" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            icon={isEditing ? <CalendarOutlined /> : <PlusOutlined />}
          >
            {isEditing ? 'Update Entry' : 'Create Entry'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};