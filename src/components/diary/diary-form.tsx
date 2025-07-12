'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Switch,
  Button,
  Upload,
  Card,
  Typography,
  Space,
  message,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { diaryService } from '@/services/diaryService';
import { CreateTravelDiaryData, UpdateTravelDiaryData, TravelDiary } from '@/types/diary';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface DiaryFormProps {
  diary?: TravelDiary | null;
  onSuccess?: (diary: TravelDiary) => void;
  onCancel?: () => void;
}

export const DiaryForm: React.FC<DiaryFormProps> = ({
  diary,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [coverPhotoList, setCoverPhotoList] = useState<UploadFile[]>(
    diary?.coverPhoto ? [{
      uid: '-1',
      name: 'cover.jpg',
      status: 'done',
      url: diary.coverPhoto
    }] : []
  );

  const isEditing = !!diary;

  const handleSubmit = async (values: any): Promise<void> => {
    if (!user) {
      message.error('Please sign in to create a diary');
      return;
    }

    try {
      setLoading(true);

      // Handle cover photo upload
      let coverPhotoUrl = diary?.coverPhoto;
      if (coverPhotoList.length > 0 && coverPhotoList[0].originFileObj) {
        coverPhotoUrl = await diaryService.uploadImage(
          coverPhotoList[0].originFileObj as File,
          diary?.id || 'temp'
        );
      }

      const diaryData = {
        tripName: values.tripName,
        destination: values.destination,
        description: values.description,
        startDate: values.dateRange[0].toDate(),
        endDate: values.dateRange[1].toDate(),
        coverPhoto: coverPhotoUrl,
        isPublic: values.isPublic || false
      };

      let resultDiary: TravelDiary;

      if (isEditing && diary) {
        await diaryService.updateDiary(diary.id, diaryData as UpdateTravelDiaryData);
        resultDiary = await diaryService.getDiary(diary.id) as TravelDiary;
        message.success('Travel diary updated successfully!');
      } else {
        resultDiary = await diaryService.createDiary(user.uid, diaryData as CreateTravelDiaryData);
        
        // Update cover photo with actual diary ID if it was uploaded
        if (coverPhotoUrl && coverPhotoUrl.includes('temp')) {
          const newCoverPhotoUrl = await diaryService.uploadImage(
            coverPhotoList[0].originFileObj as File,
            resultDiary.id
          );
          await diaryService.updateDiary(resultDiary.id, { coverPhoto: newCoverPhotoUrl });
          resultDiary.coverPhoto = newCoverPhotoUrl;
        }
        
        message.success('Travel diary created successfully!');
      }

      if (onSuccess) {
        onSuccess(resultDiary);
      } else {
        router.push(`/diary/${resultDiary.id}`);
      }
    } catch (error) {
      console.error('Error saving diary:', error);
      message.error(isEditing ? 'Failed to update diary' : 'Failed to create diary');
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

  const uploadProps: UploadProps = {
    fileList: coverPhotoList,
    onChange: ({ fileList }) => setCoverPhotoList(fileList),
    beforeUpload: () => false, // Prevent auto upload
    maxCount: 1,
    accept: 'image/*',
    listType: 'picture-card',
    className: 'cover-photo-upload'
  };

  const uploadButton = (
    <div className="flex flex-col items-center">
      <PlusOutlined />
      <div className="mt-2">Cover Photo</div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <BookOutlined />
          {isEditing ? 'Edit Travel Diary' : 'Create New Travel Diary'}
        </Title>
        <Text className="text-gray-600">
          {isEditing 
            ? 'Update your travel diary information'
            : 'Create a new diary to document your amazing journey'
          }
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={diary ? {
          tripName: diary.tripName,
          destination: diary.destination,
          description: diary.description,
          dateRange: [
            dayjs(diary.startDate.toDate()),
            dayjs(diary.endDate.toDate())
          ],
          isPublic: diary.isPublic
        } : {
          isPublic: false
        }}
        className="space-y-6"
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card size="small" title="Basic Information">
                <Form.Item
                  name="tripName"
                  label="Trip Name"
                  rules={[
                    { required: true, message: 'Please enter trip name' },
                    { min: 3, message: 'Trip name must be at least 3 characters' },
                    { max: 100, message: 'Trip name must not exceed 100 characters' }
                  ]}
                >
                  <Input
                    placeholder="e.g., Summer Adventure in Thailand"
                    prefix={<BookOutlined />}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="destination"
                  label="Destination"
                  rules={[
                    { required: true, message: 'Please enter destination' },
                    { min: 2, message: 'Destination must be at least 2 characters' },
                    { max: 100, message: 'Destination must not exceed 100 characters' }
                  ]}
                >
                  <Input
                    placeholder="e.g., Bangkok, Thailand"
                    prefix={<EnvironmentOutlined />}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description (Optional)"
                  rules={[
                    { max: 500, message: 'Description must not exceed 500 characters' }
                  ]}
                >
                  <TextArea
                    placeholder="Tell us about your trip..."
                    rows={4}
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Card>

              {/* Trip Dates */}
              <Card size="small" title="Trip Duration">
                <Form.Item
                  name="dateRange"
                  label="Travel Dates"
                  rules={[
                    { required: true, message: 'Please select travel dates' }
                  ]}
                >
                  <RangePicker
                    size="large"
                    style={{ width: '100%' }}
                    placeholder={['Start Date', 'End Date']}
                    format="YYYY-MM-DD"
                    disabledDate={(current) => {
                      // Disable future dates beyond 1 year from today
                      return current && current > dayjs().add(1, 'year');
                    }}
                  />
                </Form.Item>
              </Card>

              {/* Privacy Settings */}
              <Card size="small" title="Privacy Settings">
                <Form.Item
                  name="isPublic"
                  label="Make this diary public"
                  valuePropName="checked"
                  extra="Public diaries can be viewed by other users on the platform"
                >
                  <Switch 
                    checkedChildren="Public" 
                    unCheckedChildren="Private"
                  />
                </Form.Item>
              </Card>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            {/* Cover Photo */}
            <Card size="small" title="Cover Photo" className="h-fit">
              <Form.Item
                label="Upload a cover photo for your diary"
                extra="Recommended size: 800x600px. Max file size: 5MB"
              >
                <Upload {...uploadProps}>
                  {coverPhotoList.length >= 1 ? null : uploadButton}
                </Upload>
              </Form.Item>

              {/* Preview Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Created by:</span>
                    <span className="font-medium">{user?.displayName || user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="font-medium">
                      {Form.useWatch('isPublic', form) ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
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
            icon={isEditing ? <BookOutlined /> : <PlusOutlined />}
          >
            {isEditing ? 'Update Diary' : 'Create Diary'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};