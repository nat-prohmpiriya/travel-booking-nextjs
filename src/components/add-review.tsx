'use client';

import React, { useState } from 'react';
import { Modal, Form, Rate, Input, DatePicker, Select, Button, Upload, message, Space, Divider, Tag, Typography } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { CreateReviewData } from '@/types/review';
import { useReviewStore } from '@/stores/review-store';
import { useAuth } from '@/contexts/AuthContext';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface AddReviewProps {
    hotelId: string;
    hotelName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ReviewFormData {
    rating: number;
    title: string;
    comment: string;
    pros: string[];
    cons: string[];
    roomType?: string;
    stayDate: any;
    tags: string[];
    categories: {
        cleanliness: number;
        service: number;
        location: number;
        facilities: number;
        value: number;
    };
}

const COMMON_TAGS: string[] = [
    'ทำเลดี',
    'ห้องสะอาด',
    'พนักงานดี',
    'อาหารอร่อย',
    'ราคาคุ้มค่า',
    'วิวสวย',
    'สิ่งอำนวยความสะดวกครบ',
    'ใกล้แหล่งท่องเที่ยว',
    'ที่จอดรถสะดวก',
    'Wi-Fi เร็ว',
    'ครอบครัว',
    'คู่รัก',
    'เดินทางธุรกิจ',
    'เดินทางคนเดียว'
];

const ROOM_TYPES: string[] = [
    'Standard Room',
    'Deluxe Room',
    'Superior Room',
    'Suite Room',
    'Family Room',
    'Twin Room',
    'Executive Room'
];

export const AddReview: React.FC<AddReviewProps> = ({
    hotelId,
    hotelName,
    isOpen,
    onClose,
    onSuccess
}) => {
    const { user } = useAuth();
    const { createReview, isSubmitting } = useReviewStore();
    const [form] = Form.useForm<ReviewFormData>();
    
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [prosInput, setProsInput] = useState<string>('');
    const [consInput, setConsInput] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleSubmit = async (values: ReviewFormData): Promise<void> => {
        if (!user) {
            message.error('กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว');
            return;
        }

        try {
            // Create review data
            const reviewData: CreateReviewData = {
                hotelId,
                rating: values.rating,
                title: values.title,
                comment: values.comment,
                pros: values.pros || [],
                cons: values.cons || [],
                roomType: values.roomType,
                stayDate: values.stayDate.toDate(),
                tags: selectedTags,
                images: [], // TODO: Handle image upload
                categories: values.categories
            };

            // User profile data
            const userProfile = {
                uid: user.uid,
                firstName: user.displayName?.split(' ')[0] || 'ผู้ใช้',
                lastName: user.displayName?.split(' ')[1] || '',
                photoURL: user.photoURL || undefined
            };

            await createReview(reviewData, userProfile);
            
            message.success('เขียนรีวิวสำเร็จ!');
            form.resetFields();
            setFileList([]);
            setProsInput('');
            setConsInput('');
            setSelectedTags([]);
            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error creating review:', error);
            message.error('ไม่สามารถเขียนรีวิวได้ กรุณาลองใหม่อีกครั้ง');
        }
    };

    const addPros = (): void => {
        if (prosInput.trim()) {
            const currentPros = form.getFieldValue('pros') || [];
            form.setFieldValue('pros', [...currentPros, prosInput.trim()]);
            setProsInput('');
        }
    };

    const addCons = (): void => {
        if (consInput.trim()) {
            const currentCons = form.getFieldValue('cons') || [];
            form.setFieldValue('cons', [...currentCons, consInput.trim()]);
            setConsInput('');
        }
    };

    const removePros = (index: number): void => {
        const currentPros = form.getFieldValue('pros') || [];
        form.setFieldValue('pros', currentPros.filter((_: string, i: number) => i !== index));
    };

    const removeCons = (index: number): void => {
        const currentCons = form.getFieldValue('cons') || [];
        form.setFieldValue('cons', currentCons.filter((_: string, i: number) => i !== index));
    };

    const toggleTag = (tag: string): void => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const uploadProps: UploadProps = {
        listType: 'picture-card',
        fileList,
        onChange: ({ fileList: newFileList }) => setFileList(newFileList),
        beforeUpload: () => false, // Prevent auto upload
        maxCount: 5,
    };

    const categoryLabels = {
        cleanliness: 'ความสะอาด',
        service: 'การบริการ',
        location: 'ทำเลที่ตั้ง',
        facilities: 'สิ่งอำนวยความสะดวก',
        value: 'คุณภาพเทียบราคา'
    };

    return (
        <Modal
            title={`เขียนรีวิว - ${hotelName}`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
            className="add-review-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    rating: 5,
                    pros: [],
                    cons: [],
                    categories: {
                        cleanliness: 5,
                        service: 5,
                        location: 5,
                        facilities: 5,
                        value: 5
                    }
                }}
            >
                {/* Overall Rating */}
                <Form.Item
                    name="rating"
                    label="คะแนนรวม"
                    rules={[{ required: true, message: 'กรุณาให้คะแนน' }]}
                >
                    <Rate allowHalf />
                </Form.Item>

                {/* Title */}
                <Form.Item
                    name="title"
                    label="หัวข้อรีวิว"
                    rules={[
                        { required: true, message: 'กรุณาใส่หัวข้อรีวิว' },
                        { max: 100, message: 'หัวข้อต้องไม่เกิน 100 ตัวอักษร' }
                    ]}
                >
                    <Input placeholder="เช่น ประทับใจมาก แนะนำเลย!" />
                </Form.Item>

                {/* Comment */}
                <Form.Item
                    name="comment"
                    label="รีวิว"
                    rules={[
                        { required: true, message: 'กรุณาเขียนรีวิว' },
                        { min: 10, message: 'รีวิวต้องมีความยาวอย่างน้อย 10 ตัวอักษร' }
                    ]}
                >
                    <TextArea 
                        rows={4} 
                        placeholder="เล่าประสบการณ์การเข้าพักของคุณ..."
                        showCount
                        maxLength={1000}
                    />
                </Form.Item>

                {/* Stay Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="stayDate"
                        label="วันที่เข้าพัก"
                        rules={[{ required: true, message: 'กรุณาเลือกวันที่เข้าพัก' }]}
                    >
                        <DatePicker 
                            className="w-full"
                            placeholder="เลือกวันที่เข้าพัก"
                            disabledDate={(current) => current && current > dayjs()}
                        />
                    </Form.Item>

                    <Form.Item
                        name="roomType"
                        label="ประเภทห้อง"
                    >
                        <Select placeholder="เลือกประเภทห้อง" allowClear>
                            {ROOM_TYPES.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                {/* Category Ratings */}
                <Divider>คะแนนตามหมวดหมู่</Divider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <Form.Item
                            key={key}
                            name={['categories', key]}
                            label={label}
                        >
                            <Rate allowHalf />
                        </Form.Item>
                    ))}
                </div>

                {/* Pros */}
                <Divider>จุดเด่น (ไม่บังคับ)</Divider>
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <Input
                            value={prosInput}
                            onChange={(e) => setProsInput(e.target.value)}
                            placeholder="เพิ่มจุดเด่น..."
                            onPressEnter={addPros}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={addPros}>
                            เพิ่ม
                        </Button>
                    </div>
                    <Form.Item name="pros" noStyle>
                        <div className="min-h-[40px] border border-gray-200 rounded p-2">
                            {form.getFieldValue('pros')?.map((pro: string, index: number) => (
                                <Tag
                                    key={index}
                                    closable
                                    onClose={() => removePros(index)}
                                    color="green"
                                    className="mb-1"
                                >
                                    👍 {pro}
                                </Tag>
                            )) || <Text type="secondary">ยังไม่มีจุดเด่น</Text>}
                        </div>
                    </Form.Item>
                </div>

                {/* Cons */}
                <Divider>จุดด้อย (ไม่บังคับ)</Divider>
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <Input
                            value={consInput}
                            onChange={(e) => setConsInput(e.target.value)}
                            placeholder="เพิ่มจุดด้อย..."
                            onPressEnter={addCons}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={addCons}>
                            เพิ่ม
                        </Button>
                    </div>
                    <Form.Item name="cons" noStyle>
                        <div className="min-h-[40px] border border-gray-200 rounded p-2">
                            {form.getFieldValue('cons')?.map((con: string, index: number) => (
                                <Tag
                                    key={index}
                                    closable
                                    onClose={() => removeCons(index)}
                                    color="red"
                                    className="mb-1"
                                >
                                    👎 {con}
                                </Tag>
                            )) || <Text type="secondary">ยังไม่มีจุดด้อย</Text>}
                        </div>
                    </Form.Item>
                </div>

                {/* Tags */}
                <Divider>แท็ก (ไม่บังคับ)</Divider>
                <div className="space-y-2">
                    <Text type="secondary">เลือกแท็กที่เกี่ยวข้อง:</Text>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TAGS.map(tag => (
                            <Tag.CheckableTag
                                key={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={() => toggleTag(tag)}
                            >
                                {tag}
                            </Tag.CheckableTag>
                        ))}
                    </div>
                </div>

                {/* Image Upload */}
                <Divider>รูปภาพ (ไม่บังคับ)</Divider>
                <Upload {...uploadProps}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>เพิ่มรูปภาพ</div>
                    </div>
                </Upload>
                <Text type="secondary" className="block mt-2">
                    อัปโหลดรูปภาพได้สูงสุด 5 รูป
                </Text>

                {/* Submit Button */}
                <Divider />
                <div className="flex justify-end space-x-2">
                    <Button onClick={onClose}>
                        ยกเลิก
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        size="large"
                    >
                        ส่งรีวิว
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};